/**
 * NASA Data Resources Client
 * Module: src/services/api/nasa-resources-client.js
 * Project: GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform
 * 
 * Proxies calls to the secure backend gateway endpoint (/api/v1/nasa/resources).
 * End-users NEVER supply, handle, or view Parse.bot API credentials.
 * The backend manages the server-side secret and rate-limits requests.
 */

const DEFAULT_BACKEND_URL = 'http://localhost:8000';
const DEFAULT_APP_TOKEN = 'pyro-app-auth-token-2026';

/**
 * Fetches shared NASA research data resources via the backend proxy gateway.
 * 
 * @param {Object} options
 * @param {string} [options.backendUrl] Base URL of the PYRO-SI FastAPI backend gateway
 * @param {string} [options.appToken] Application session token
 * @param {number} [options.timeoutMs] Request timeout in milliseconds (default: 20000)
 * @returns {Promise<Object>} Normalized NASA resources payload
 */
export async function fetchSharedNasaResources({
  backendUrl = DEFAULT_BACKEND_URL,
  appToken = DEFAULT_APP_TOKEN,
  timeoutMs = 20000
} = {}) {
  const url = `${backendUrl.replace(/\/+$/, '')}/api/v1/nasa/resources`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-App-Token': appToken
      },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (response.status === 401) {
      throw new Error('Application authorization failed. Invalid session credentials.');
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`);
    }
    if (response.status === 503) {
      throw new Error('NASA data retrieval service is currently unavailable. Backend administrator must configure PARSE_API_KEY.');
    }
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error (${response.status}) fetching NASA data resources.`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`NASA data retrieval timed out after ${timeoutMs / 1000} seconds.`);
    }
    throw err;
  }
}
