// Centralized API Base URL configuration for local dev and production deployment
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
};
