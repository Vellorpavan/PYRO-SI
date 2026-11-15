/**
 * NASA Data Resources Client
 * Module: src/services/api/nasa-resources-client.js
 * Project: GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform
 * 
 * SECURITY AUDIT COMPLIANCE:
 * - ZERO hardcoded secrets or privileged tokens are embedded in this client module.
 * - Authenticates dynamically via session handshake: POST /api/v1/auth/session.
 * - Proxies calls to the secure backend gateway endpoint (/api/v1/nasa/resources).
 * - End-users NEVER supply, handle, or view Parse.bot API credentials.
 */

const DEFAULT_BACKEND_URL = 'http://localhost:8000';

let cachedSessionToken = null;
let sessionExpiresAt = 0;

/**
 * Obtains or refreshes a dynamic application session token.
 * 
 * @param {string} backendUrl 
 * @returns {Promise<string>} Valid dynamic session token
 */
export async function obtainAppSession(backendUrl = DEFAULT_BACKEND_URL) {
  const now = Date.now();
  if (cachedSessionToken && now < sessionExpiresAt - 60000) {
    return cachedSessionToken;
  }

  const url = `${backendUrl.replace(/\/+$/, '')}/api/v1/auth/session`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain application session token (HTTP ${response.status})`);
  }

  const data = await response.json();
  cachedSessionToken = data.session_token;
  sessionExpiresAt = now + ((data.expires_in || 3600) * 1000);
  return cachedSessionToken;
}

/**
 * Fetches shared NASA research data resources via the backend proxy gateway.
 * 
 * @param {Object} options
 * @param {string} [options.backendUrl] Base URL of the PYRO-SI FastAPI backend gateway
 * @param {number} [options.timeoutMs] Request timeout in milliseconds (default: 20000)
 * @returns {Promise<Object>} Normalized NASA resources payload
 */
export async function fetchSharedNasaResources({
  backendUrl = DEFAULT_BACKEND_URL,
  timeoutMs = 20000
} = {}) {
  const token = await obtainAppSession(backendUrl);
  const url = `${backendUrl.replace(/\/+$/, '')}/api/v1/nasa/resources`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Session-Token': token
      },
      signal: controller.signal
    });

    // If session expired, retry once with a fresh session
    if (response.status === 401) {
      cachedSessionToken = null;
      const freshToken = await obtainAppSession(backendUrl);
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Session-Token': freshToken
        },
        signal: controller.signal
      });
    }

    clearTimeout(timer);

    if (response.status === 401) {
      throw new Error('Application session unauthorized or expired.');
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
