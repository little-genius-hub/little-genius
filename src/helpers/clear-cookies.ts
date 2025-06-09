export function clearAuthCookies() {
  if (typeof document !== "undefined") {
    const cookiesToClear = [
      "Authorization",
      "currentChildId",
      "token",
      "auth",
      "session",
    ];

    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
    });

    if (confirm("Cookies cleared. Reload page to start fresh?")) {
      window.location.reload();
    }
  }
}

if (typeof window !== "undefined") {
  (window as any).clearAuthCookies = clearAuthCookies;
}
