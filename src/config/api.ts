// Centralized API Configuration for REVIVE AI Frontend
// Reads VITE_API_URL environment variable with fallback for local development

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    // Remove trailing slash if present
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper function to build API endpoint URLs
 */
export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Centralized fetch helper for API requests
 */
export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers
    }
  };

  return fetch(url, config);
};
