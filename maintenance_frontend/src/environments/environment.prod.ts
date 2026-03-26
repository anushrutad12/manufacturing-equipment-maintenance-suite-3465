export const environment = {
  production: true,
  /**
   * Base URL for the FastAPI backend.
   * Required env var:
   * - VITE_API_BASE_URL
   */
  apiBaseUrl: (import.meta as any).env?.['VITE_API_BASE_URL'] ?? '',
};
