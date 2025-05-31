/**
 * Utility script to clear authentication cookies for development
 * This helps when migrating from localStorage to cookies
 */

export function clearAuthCookies() {
  if (typeof document !== 'undefined') {
    // Clear all possible authentication-related cookies
    const cookiesToClear = [
      'Authorization',
      'currentChildId',
      'token', // in case any old implementations used this
      'auth', // generic auth cookie name
      'session' // another common cookie name
    ];

    cookiesToClear.forEach(cookieName => {
      // Set cookie to expire in the past to delete it
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      // Also try without domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      // Try with localhost
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
    });

    console.log('All authentication cookies cleared');
    
    // Optionally reload the page to ensure clean state
    if (confirm('Cookies cleared. Reload page to start fresh?')) {
      window.location.reload();
    }
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAuthCookies = clearAuthCookies;
}
