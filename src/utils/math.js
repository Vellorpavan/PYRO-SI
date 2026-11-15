/**
 * Scientific and Engineering Math Utilities
 */

/**
 * Clamps a number between min and max.
 * @param {number} val 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Converts psi to kPa.
 * @param {number} psi 
 * @returns {number}
 */
export function psiToKpa(psi) {
  return psi * 6.89476;
}

/**
 * Converts kPa to psi.
 * @param {number} kpa 
 * @returns {number}
 */
export function kpaToPsi(kpa) {
  return kpa / 6.89476;
}
