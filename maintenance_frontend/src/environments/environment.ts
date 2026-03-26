export const environment = {
  production: false,
  /**
   * Base URL for the FastAPI backend.
   * Configure via environment variable at build/serve time.
   *
   * Required env var:
   * - VITE_API_BASE_URL (e.g., "https://<host>:3001")
   */
  apiBaseUrl: (import.meta as any).env?.['VITE_API_BASE_URL'] ?? '',
};
