/**
 * Unit Tests for PSI Investigation Ranker & Prioritization Decision Weights
 * Module: tests/unit/ranker.test.js
 * 
 * Verifies:
 * 1. Score boundary clamping (10% to 99%) and zero-weight fault tolerance.
 * 2. Sensitivity to individual slider adjustments (e.g. Smoke Detection vs Material Prevention).
 * 3. Deterministic recalculation when all four sliders change.
 * 4. Transparent handling of missing evidence and scientific limitations.
 * 5. Restoration of original weights and rankings upon reset.
 * 6. Comparator recommendations update dynamically without mutating user's manual selection.
 */

import { computeInvestigationScore, evaluateInvestigationRelevance, normalizeWeights, DEFAULT_PRIORITY_WEIGHTS } from '../../src/modules/investigation-matrix/ranker.js';
import { getTopRecommendedStudies, getSelectedCompareIds, toggleCompareStudy, resetDefaultComparison } from '../../src/modules/investigation-matrix/comparator.js';
import psiInvestigations from '../../src/data/reference/psi-investigations.json' with { type: 'json' };

export function runRankerTests(assert) {
  const dummyInv = {
    id: 'TEST-1',
    lunarHabWeight: 100,
    materialPrevWeight: 100,
    smokeDetWeight: 100,
    suppressionWeight: 100
  };

  // Test 1: Full 100s should score close to 99 (max capped)
  const scoreMax = computeInvestigationScore(dummyInv, { lunar: 100, prev: 100, det: 100, supp: 100 });
  assert(scoreMax === 99, `Max input should return capped score 99, got ${scoreMax}`);

  // Test 2: Zero weights fallback
  const scoreZero = computeInvestigationScore(dummyInv, { lunar: 0, prev: 0, det: 0, supp: 0 });
  assert(scoreZero >= 10 && scoreZero <= 99, 'Zero weights must not divide by zero or NaN');

  // Test 3: Sensitivity to Lunar Habitat weighting
  const invLunarHeavy = {
    lunarHabWeight: 95,
    materialPrevWeight: 50,
    smokeDetWeight: 50,
    suppressionWeight: 50
  };
  const scoreHighLunar = computeInvestigationScore(invLunarHeavy, { lunar: 100, prev: 0, det: 0, supp: 0 });
  const scoreLowLunar = computeInvestigationScore(invLunarHeavy, { lunar: 0, prev: 100, det: 100, supp: 100 });
  assert(scoreHighLunar > scoreLowLunar, 'Score should respond positively when corresponding weight is high');

  // Test 4: Dynamic Re-ranking on Slider Shift (Smoke Detection vs Material Prevention)
  const sameR = psiInvestigations.find(s => s.code === 'SAME-R' || s.psiId === 'PSI-101');
  const bass2 = psiInvestigations.find(s => s.code === 'BASS-II' || s.psiId === 'PSI-25');
  assert(sameR !== undefined, 'SAME-R record must exist in catalogue');
  assert(bass2 !== undefined, 'BASS-II record must exist in catalogue');

  // When Smoke Detection is prioritized (100% det, 0% others)
  const smokeWeights = { lunar: 0, prev: 0, det: 100, supp: 0 };
  const sameRSmokeScore = computeInvestigationScore(sameR, smokeWeights);
  const bass2SmokeScore = computeInvestigationScore(bass2, smokeWeights);
  assert(sameRSmokeScore > bass2SmokeScore, `Prioritizing smoke detection must elevate SAME-R (${sameRSmokeScore}%) above BASS-II (${bass2SmokeScore}%)`);

  // When Material Prevention is prioritized (100% prev, 0% others)
  const prevWeights = { lunar: 0, prev: 100, det: 0, supp: 0 };
  const sameRPrevScore = computeInvestigationScore(sameR, prevWeights);
  const bass2PrevScore = computeInvestigationScore(bass2, prevWeights);
  assert(bass2PrevScore > sameRPrevScore, `Prioritizing material prevention must elevate BASS-II (${bass2PrevScore}%) above SAME-R (${sameRPrevScore}%)`);

  // Test 5: Deterministic Recalculation across full catalogue
  const testWeights = { lunar: 40, prev: 60, det: 80, supp: 30 };
  const run1 = psiInvestigations.map(inv => computeInvestigationScore(inv, testWeights));
  const run2 = psiInvestigations.map(inv => computeInvestigationScore(inv, testWeights));
  assert(JSON.stringify(run1) === JSON.stringify(run2), 'Same weights and dataset must produce identical deterministic scores');

  // Test 6: Missing Evidence & Limitations Transparency
  const evalBass = evaluateInvestigationRelevance(bass2, { lunar: 50, prev: 50, det: 50, supp: 50 });
  assert(evalBass.missingEvidence.length > 0, 'BASS-II must explicitly report missing evidence limitations');
  assert(evalBass.missingEvidence.some(m => m.includes('thermocouple') || m.includes('aerosol')), 'BASS-II must flag lack of embedded thermocouples or smoke sensors');
  assert(evalBass.explanation.includes('Relevance driven primarily by'), 'Evaluation must explain top scoring driver');

  // Test 7: Missing Data is Penalized, Not Treated as Positive Evidence
  const unflownDummy = {
    id: 'UNFLOWN-1',
    verified: false,
    lunarHabWeight: 100,
    materialPrevWeight: 100,
    smokeDetWeight: 100,
    suppressionWeight: 100,
    provenance: { verificationStatus: 'UNFLOWN_PLANNED' }
  };
  const verifiedDummy = {
    id: 'VERIFIED-1',
    verified: true,
    lunarHabWeight: 100,
    materialPrevWeight: 100,
    smokeDetWeight: 100,
    suppressionWeight: 100,
    provenance: { verificationStatus: 'VERIFIED_DATASET' }
  };
  const unflownScore = computeInvestigationScore(unflownDummy, { lunar: 100, prev: 100, det: 100, supp: 100 });
  const verifiedScore = computeInvestigationScore(verifiedDummy, { lunar: 100, prev: 100, det: 100, supp: 100 });
  assert(unflownScore < verifiedScore, `Unflown/unverified study (${unflownScore}%) must be penalized relative to verified data (${verifiedScore}%)`);

  // Test 8: Reset Restores Default Weights & Ranking
  const normDefaults = normalizeWeights(DEFAULT_PRIORITY_WEIGHTS);
  assert(Math.abs((normDefaults.lunar + normDefaults.prev + normDefaults.det + normDefaults.supp) - 1.0) < 0.001, 'Normalized default weights must sum to 1.0');
  const defaultBassScore = computeInvestigationScore(bass2, DEFAULT_PRIORITY_WEIGHTS);
  assert(defaultBassScore >= 80 && defaultBassScore <= 99, `Default BASS-II score must be in high relevance band, got ${defaultBassScore}%`);

  // Test 9: Comparator Recommendation Isolation (No Silent Overwrite of User Selection)
  resetDefaultComparison();
  const initialSelected = getSelectedCompareIds();
  assert(initialSelected.length === 3, 'Initial comparator must have 3 default studies');

  // Top recommended under smoke detection priority
  const topSmokeRecommended = getTopRecommendedStudies(smokeWeights, psiInvestigations, 3);
  assert(topSmokeRecommended.length === 3, 'Comparator must generate 3 recommendations');
  assert(topSmokeRecommended[0].inv.code === 'SAME-R' || topSmokeRecommended[0].inv.code === 'DAFT-2', 'Top recommended under smoke weight must be an aerosol study');

  // Assert user's selected comparisons were NOT silently overwritten!
  const currentSelected = getSelectedCompareIds();
  assert(JSON.stringify(currentSelected) === JSON.stringify(initialSelected), 'Calculating recommendations must NOT mutate user manual comparison selections');
}
