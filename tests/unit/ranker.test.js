/**
 * Unit Tests for PSI Investigation Ranker
 */

import { computeInvestigationScore } from '../../src/modules/investigation-matrix/ranker.js';

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
}
