"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { User, Child, Language } from "@/types"

interface AppState {
  user: User | null
  currentChild: Child | null
  language: Language
  isLoading: boolean
  isParentMode: boolean
  pwaInstallPrompt: any
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_CURRENT_CHILD"; payload: Child | null }
  | { type: "SET_LANGUAGE"; payload: Language }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PARENT_MODE"; payload: boolean }
  | { type: "SET_PWA_PROMPT"; payload: any }
  | { type: "UPDATE_CHILD_PROGRESS"; payload: { childId: string; progress: any } }

const initialState: AppState = {
  user: null,
  currentChild: null,
  language: "en",
  isLoading: true,
  isParentMode: false,
  pwaInstallPrompt: null,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_CURRENT_CHILD":
      return { ...state, currentChild: action.payload }
    case "SET_LANGUAGE":
      return { ...state, language: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_PARENT_MODE":
      return { ...state, isParentMode: action.payload }
    case "SET_PWA_PROMPT":
      return { ...state, pwaInstallPrompt: action.payload }
    case "UPDATE_CHILD_PROGRESS":
      if (!state.user) return state
      const updatedChildren = (state.user.children || []).map((child) =>
        child.id === action.payload.childId
          ? { ...child, progress: { ...child.progress, ...action.payload.progress } }
          : child,
      )
      return {
        ...state,
        user: { ...state.user, children: updatedChildren },
        currentChild:
          state.currentChild?.id === action.payload.childId
            ? { ...state.currentChild, progress: { ...state.currentChild.progress, ...action.payload.progress } }
            : state.currentChild,
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      dispatch({ type: "SET_PWA_PROMPT", payload: e })
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [])

  // Load user session on mount
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const userData = await response.json()
          dispatch({ type: "SET_USER", payload: userData })
        } else {
          // Handle non-200 responses (like 404)
          console.log("No active session found")
          dispatch({ type: "SET_USER", payload: null })
        }
      } catch (error) {
        console.error("Failed to load user session:", error)
        // Don't crash the app, just set user to null
        dispatch({ type: "SET_USER", payload: null })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    loadUserSession()
  }, [])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  
  // Auth helper functions
  const login = async (user: User) => {
    context.dispatch({ type: "SET_USER", payload: user })
  }
  
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      context.dispatch({ type: "SET_USER", payload: null })
      context.dispatch({ type: "SET_CURRENT_CHILD", payload: null })
      // Reload the page to clear any cached data
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }
  
  return { 
    ...context, 
    login, 
    logout 
  }
}
