// Centralized API Base URL configuration for local dev and production deployment
const rawEnvUrl = (import.meta.env.VITE_API_URL || '').trim();

// Force live Render backend URL if VITE_API_URL is empty, '/', or invalid
export const API_BASE_URL = (
  !rawEnvUrl || rawEnvUrl === '/' || rawEnvUrl.includes('localhost')
    ? 'https://hiring-portal-backend-z90d.onrender.com'
    : rawEnvUrl
).replace(/\/$/, '');

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Case-insensitive helper to sanitize ANY technical JavaScript error text away from end users
export const sanitizeError = (err) => {
  const msg = typeof err === 'string' ? err : (err?.message || '');
  const lower = msg.toLowerCase();

  if (
    !msg ||
    lower.includes('doctype') ||
    lower.includes('unexpected') ||
    lower.includes('json') ||
    lower.includes('response') ||
    lower.includes('syntaxerror') ||
    lower.includes('typeerror') ||
    lower.includes('failed to execute') ||
    lower.includes('fetch') ||
    lower.includes('<')
  ) {
    return 'Connecting to cloud database server... Please wait a moment.';
  }
  return msg;
};

// Safe JSON parser that never throws syntax or JSON input errors
export const safeParseJson = async (response) => {
  const text = await response.text();
  if (!text || !text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    return {};
  }
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

      const data = await safeParseJson(response);

      if (!response.ok) {
        throw new Error(data.error || 'Connecting to cloud database server... Please wait a moment.');
      }

      return data;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw new Error('Connecting to cloud database server... Please wait a moment.');
};
