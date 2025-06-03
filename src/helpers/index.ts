export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// Export utilities
export { generateUsername } from './utils';
