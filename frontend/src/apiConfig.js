// Centralized API Base URL configuration for local dev and production deployment
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'https://hiring-portal-backend-z90d.onrender.com'
).replace(/\/$/, '');

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
};

// Helper to sanitize any technical JavaScript error text away from end users
export const sanitizeError = (err) => {
  const msg = typeof err === 'string' ? err : (err?.message || '');
  if (
    !msg ||
    msg.includes('doctype') ||
    msg.includes('Unexpected token') ||
    msg.includes('json') ||
    msg.includes('Response') ||
    msg.includes('SyntaxError') ||
    msg.includes('TypeError') ||
    msg.includes('<')
  ) {
    return 'Connecting to cloud database server... Please wait a moment.';
  }
  return msg;
};

// Robust fetch helper with 6 auto-retries (30s window) for Render free tier cold starts
export const fetchJsonWithRetry = async (url, options = {}, maxRetries = 6, delayMs = 3000) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout per attempt

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
        throw new Error('Connecting to cloud database server... Please wait a moment.');
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Connecting to cloud database server... Please wait a moment.');
      }

      return await response.json();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw new Error('Connecting to cloud database server... Please wait a moment.');
};
