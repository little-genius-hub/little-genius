// Helper functions for the application
// You can add your helper functions here as needed

/**
 * Example helper function
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

/**
 * Example error handler
 */
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
