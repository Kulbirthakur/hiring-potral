// Centralized API Base URL configuration for local dev and production deployment
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'https://hiring-portal-backend-z90d.onrender.com'
).replace(/\/$/, '');

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
};

// Robust fetch helper with auto-retry for Render free tier cold starts
export const fetchJsonWithRetry = async (url, options = {}, maxRetries = 3, delayMs = 2500) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout per attempt

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }
        throw new Error('Server starting up. Please click Retry in a few seconds.');
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status} error.`);
      }

      return await response.json();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError || new Error('Failed to connect to backend server.');
};
