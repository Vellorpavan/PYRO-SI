/**
 * Epistemic Evidence Classification Tests
 * Verifies strict epistemic tagging (DERIVED, MODELLED, EXPLORATORY, ILLUSTRATIVE).
 */

import { calculateFlammability } from '../../src/modules/flammability-simulator/physics-model.js';
import { EpistemicClassification } from '../../src/utils/provenance.js';

export function runEvidenceClassificationTests(assert) {
  const result = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 12.0, g: 0.0 });

  // 1. Epistemic tags presence
  assert(result.epistemicTags && typeof result.epistemicTags === 'object', 'Simulator output must contain epistemicTags object');

  // 2. Exact physical laws must be DERIVED
  assert(result.epistemicTags.ppo2 === EpistemicClassification.DERIVED, 'Dalton Law pO2 must be classified as DERIVED');
  assert(result.epistemicTags.ppo2_kPa === EpistemicClassification.DERIVED, 'pO2 in kPa must be classified as DERIVED');
  assert(result.epistemicTags.vEffective === EpistemicClassification.DERIVED, 'Orthogonal vector velocity must be classified as DERIVED');

  // 3. Phenomenological proxies must be MODELLED
  assert(result.epistemicTags.vBuoyant === EpistemicClassification.MODELLED, 'Buoyancy draft velocity scale must be classified as MODELLED');
  assert(result.epistemicTags.loi === EpistemicClassification.MODELLED, 'LOI scaling formula must be classified as MODELLED');
  assert(result.epistemicTags.spreadIndex === EpistemicClassification.MODELLED, 'De Ris spread index must be classified as MODELLED');
  assert(result.epistemicTags.riskScore === EpistemicClassification.MODELLED, 'Composite hazard index must be classified as MODELLED');
  assert(result.epistemicTags.rates === EpistemicClassification.MODELLED, 'Material flame spread rates must be classified as MODELLED');

  // 4. Unflown continuous partial-g curves must be EXPLORATORY
  assert(result.epistemicTags.partialGContinuum === EpistemicClassification.EXPLORATORY, 'Partial-g continuum curve must be classified as EXPLORATORY');

  // 5. Assumptions and Limitations disclosure
  assert(Array.isArray(result.assumptions) && result.assumptions.length >= 3, 'Result must explicitly disclose at least 3 model assumptions');
  assert(Array.isArray(result.limitations) && result.limitations.length >= 3, 'Result must explicitly disclose at least 3 model limitations');
  assert(typeof result.calibrationBaseline === 'string', 'Result must state its empirical calibration baseline');
}
