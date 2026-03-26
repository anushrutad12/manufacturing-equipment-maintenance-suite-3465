export const environment = {
  production: true,
  /**
   * Base URL for the FastAPI backend.
   *
   * Supported env vars (prefer API_BASE_URL):
   * - API_BASE_URL
   * - VITE_API_BASE_URL (legacy/back-compat)
   */
  apiBaseUrl:
    (import.meta as any).env?.['API_BASE_URL'] ??
    (import.meta as any).env?.['VITE_API_BASE_URL'] ??
    '',
};
