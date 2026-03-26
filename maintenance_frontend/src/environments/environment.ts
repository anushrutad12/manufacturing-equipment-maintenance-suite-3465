export const environment = {
  production: false,
  /**
   * Base URL for the FastAPI backend.
   *
   * In Kavia preview, containers are exposed on different ports; the frontend must call the backend via an absolute URL.
   *
   * Supported env vars (prefer API_BASE_URL):
   * - API_BASE_URL (e.g., "https://<host>:3001")
   * - VITE_API_BASE_URL (legacy/back-compat)
   */
  apiBaseUrl:
    (import.meta as any).env?.['API_BASE_URL'] ??
    (import.meta as any).env?.['VITE_API_BASE_URL'] ??
    '',
};
