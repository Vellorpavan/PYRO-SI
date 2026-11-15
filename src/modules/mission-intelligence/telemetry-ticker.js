/**
 * Mission Intelligence Telemetry Ticker
 * Tracks live or simulated orbital coordinates (lat/lon, altitude, velocity).
 */

let tickerIntervalId = null;
let issLat = 24.81;
let issLon = 78.42;

export function startTelemetryTicker() {
  if (tickerIntervalId) clearInterval(tickerIntervalId);

  tickerIntervalId = setInterval(() => {
    issLat = ((issLat + 0.06) % 51.6);
    issLon = ((issLon + 0.14) % 180);
    const latEl = document.getElementById('hud-latlon');
    if (latEl) {
      latEl.textContent = `${issLat.toFixed(2)}°N, ${issLon.toFixed(2)}°E`;
    }
  }, 1800);
}

export function stopTelemetryTicker() {
  if (tickerIntervalId) {
    clearInterval(tickerIntervalId);
    tickerIntervalId = null;
  }
}
