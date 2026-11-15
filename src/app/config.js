/**
 * Application Configuration
 */

export const APP_CONFIG = {
  name: 'GODEYE // PYRO-SI',
  version: '2026.4',
  team: 'whoami',
  challenge: '2026 NASA Space Apps Challenge — Flame in Freefall',
  defaultHabitat: 'ISS',
  defaultFlameMode: '0g',
  storageKeys: {
    weights: 'pyro_si_weights',
    lastHabitat: 'pyro_si_habitat'
  },
  apiEndpoints: {
    issTelemetry: 'https://api.wheretheiss.at/v1/satellites/25544',
    psiRepository: 'https://psi.nasa.gov'
  }
};
