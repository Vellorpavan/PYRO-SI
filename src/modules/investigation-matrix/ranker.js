/**
 * Multi-Criteria Weighted Decision Ranker
 * Computes dynamic relevancy score for NASA PSI investigations.
 */

/**
 * Calculates normalized composite score for an investigation.
 * @param {Object} inv Investigation record
 * @param {Object} weights Weight configuration
 * @returns {number} Score from 0 to 100
 */
export function computeInvestigationScore(inv, weights = {}) {
  const wLunar = typeof weights.lunar === 'number' ? weights.lunar : 90;
  const wPrev = typeof weights.prev === 'number' ? weights.prev : 85;
  const wDet = typeof weights.det === 'number' ? weights.det : 75;
  const wSupp = typeof weights.supp === 'number' ? weights.supp : 80;

  const totalW = (wLunar + wPrev + wDet + wSupp) || 1;
  const raw = (
    inv.lunarHabWeight * wLunar +
    inv.materialPrevWeight * wPrev +
    inv.smokeDetWeight * wDet +
    inv.suppressionWeight * wSupp
  ) / totalW;

  return Math.min(99, Math.max(10, Math.round(raw)));
}
