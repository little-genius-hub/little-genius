"use client";

import type React from "react";
import { createContext, useContext, useReducer, useEffect } from "react";
import { ClientCookies } from "@/helpers/cookies";
import { clearAuthCookies } from "@/helpers/clear-cookies";
import type { User, Child, Language } from "@/types";

interface AppState {
  user: User | null;
  currentChild: Child | null;
  language: Language;
  isLoading: boolean;
  isParentMode: boolean;
  pwaInstallPrompt: any;
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_CURRENT_CHILD"; payload: Child | null }
  | { type: "SET_LANGUAGE"; payload: Language }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PARENT_MODE"; payload: boolean }
  | { type: "SET_PWA_PROMPT"; payload: any }
  | {
      type: "UPDATE_CHILD_PROGRESS";
      payload: { childId: string; progress: any };
    }
  | { type: "LOAD_FROM_STORAGE"; payload: Partial<AppState> };

const STORAGE_KEY = "little-genius-app-state";

// Helper functions for localStorage
const saveToStorage = (state: AppState) => {
  try {
    if (typeof window !== "undefined") {
      const stateToSave = {
        user: state.user,
        currentChild: state.currentChild,
        language: state.language,
        isParentMode: state.isParentMode,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

const loadFromStorage = (): Partial<AppState> | null => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
  }
  return null;
};

const clearStorage = () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
};

const initialState: AppState = {
  user: null,
  currentChild: null,
  language: "en",
  isLoading: true,
  isParentMode: false,
  pwaInstallPrompt: null,
};

// Session cache to avoid redundant fetches
let sessionCache: {
  userData: User | null;
  timestamp: number;
  isValid: () => boolean;
} | null = null;

const SESSION_CACHE_DURATION = 30000; // 30 seconds

function appReducer(state: AppState, action: AppAction): AppState {
  let newState: AppState;

  switch (action.type) {
    case "SET_USER":
      newState = { ...state, user: action.payload };
      break;
    case "SET_CURRENT_CHILD":
      newState = { ...state, currentChild: action.payload };
      break;
    case "SET_LANGUAGE":
      newState = { ...state, language: action.payload };
      break;
    case "SET_LOADING":
      newState = { ...state, isLoading: action.payload };
      break;
    case "SET_PARENT_MODE":
      newState = { ...state, isParentMode: action.payload };
      break;
    case "SET_PWA_PROMPT":
      newState = { ...state, pwaInstallPrompt: action.payload };
      break;
    case "UPDATE_CHILD_PROGRESS":
      if (!state.user) return state;
      const updatedChildren = (state.user.children || []).map((child) =>
        child.id === action.payload.childId
          ? {
              ...child,
              progress: { ...child.progress, ...action.payload.progress },
            }
          : child
      );
      newState = {
        ...state,
        user: { ...state.user, children: updatedChildren },
        currentChild:
          state.currentChild?.id === action.payload.childId
            ? {
                ...state.currentChild,
                progress: {
                  ...state.currentChild.progress,
                  ...action.payload.progress,
                },
              }
            : state.currentChild,
      };
      break;
    case "LOAD_FROM_STORAGE":
      newState = { ...state, ...action.payload };
      break;
    default:
      return state;
  }

  // Save to localStorage for most actions (except loading states and PWA prompt)
  if (action.type !== "SET_LOADING" && action.type !== "SET_PWA_PROMPT") {
    saveToStorage(newState);
  }

  return newState;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on initial mount
  useEffect(() => {
    const storedState = loadFromStorage();
    if (storedState) {
      dispatch({ type: "LOAD_FROM_STORAGE", payload: storedState });
    }
  }, []);

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      dispatch({ type: "SET_PWA_PROMPT", payload: e });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []); // Load user session on mount
  useEffect(() => {
    let isMounted = true;

    const loadUserSession = async () => {
      try {
        // Check if we already have user data in localStorage
        const storedState = loadFromStorage();
        if (storedState?.user && storedState?.currentChild) {
          // We have stored data, validate it's still fresh by checking session
          try {
            const response = await fetch("/api/auth/session", {
              cache: "no-cache",
              credentials: "include",
            });

            if (!isMounted) return;

            if (response.ok) {
              // Session is valid, keep using stored data
              dispatch({ type: "SET_LOADING", payload: false });
              return;
            } else {
              // Session expired, clear stored data
              clearStorage();
            }
          } catch (error) {
            console.error("Session validation failed:", error);
            // If validation fails, try to refresh from server
          }
        }

        // Check cache first
        if (sessionCache && sessionCache.isValid()) {
          if (isMounted) {
            dispatch({ type: "SET_USER", payload: sessionCache.userData });
            dispatch({ type: "SET_LOADING", payload: false });

            // Still check for saved child selection
            if (sessionCache.userData) {
              const savedChildId = ClientCookies.getCurrentChildId();
              if (savedChildId && sessionCache.userData.children) {
                const savedChild = sessionCache.userData.children.find(
                  (child: Child) => child.id === savedChildId
                );
                if (savedChild) {
                  dispatch({ type: "SET_CURRENT_CHILD", payload: savedChild });
                }
              }
            }
          }
          return;
        }

        const response = await fetch("/api/auth/session", {
          cache: "no-cache",
          credentials: "include",
        });

        if (!isMounted) return;

        if (response.ok) {
          const userData = await response.json();

          // Update cache
          sessionCache = {
            userData,
            timestamp: Date.now(),
            isValid: () =>
              Date.now() - sessionCache!.timestamp < SESSION_CACHE_DURATION,
          };

          dispatch({ type: "SET_USER", payload: userData });

          // After loading user, check for saved child selection in cookies
          const savedChildId = ClientCookies.getCurrentChildId();
          if (savedChildId && userData.children) {
            const savedChild = userData.children.find(
              (child: Child) => child.id === savedChildId
            );
            if (savedChild) {
              dispatch({ type: "SET_CURRENT_CHILD", payload: savedChild });
            }
          }
        } else {
          // Handle non-200 responses (like 404)
          console.log("No active session found");

          // Update cache with null user and clear storage
          sessionCache = {
            userData: null,
            timestamp: Date.now(),
            isValid: () =>
              Date.now() - sessionCache!.timestamp < SESSION_CACHE_DURATION,
          };

          clearStorage();
          dispatch({ type: "SET_USER", payload: null });
        }
      } catch (error) {
        console.error("Failed to load user session:", error);
        // Don't crash the app, just set user to null and clear storage
        if (isMounted) {
          clearStorage();
          dispatch({ type: "SET_USER", payload: null });
        }
      } finally {
        if (isMounted) {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    };

    loadUserSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  const login = async (user: User) => {
    context.dispatch({ type: "SET_USER", payload: user });
  };
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });

      sessionCache = null;
      clearStorage();
      context.dispatch({ type: "SET_USER", payload: null });
      context.dispatch({ type: "SET_CURRENT_CHILD", payload: null });
      ClientCookies.removeCurrentChildId();

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const setCurrentChild = (child: Child | null) => {
    let childWithProgress = child;
    if (child && !child.progress) {
      childWithProgress = {
        ...child,
        progress: {
          numbers: {
            level: 1,
            subLevel: 1,
            totalScore: 0,
            completedLevels: [],
          },
          letters: {
            level: 1,
            subLevel: 1,
            totalScore: 0,
            completedLevels: [],
          },
          stories: {
            readStories: [],
            favoriteStories: [],
          },
        },
      };
    }

    context.dispatch({ type: "SET_CURRENT_CHILD", payload: childWithProgress });
    if (childWithProgress?.id) {
      ClientCookies.setCurrentChildId(childWithProgress.id);
    } else {
      ClientCookies.removeCurrentChildId();
    }
  };
  return {
    ...context,
    login,
    logout,
    setCurrentChild,
    clearAuthCookies,
  };
}
