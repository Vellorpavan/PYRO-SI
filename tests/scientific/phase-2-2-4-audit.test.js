/**
 * Phase 2.2.4 Final Standards and Model Traceability Audit Tests
 * 
 * Verifies:
 * 1. NASA-STD-6001B w/Change 3 Section 7.1.2(b) Specimen Dimensions:
 *    - Specimen dimensions: 30 cm x 6.5 cm (12 in x 2.5 in).
 *    - Five (5) specimens tested one at a time, mounted vertically.
 * 2. Acceptance Criteria & Failure Rule:
 *    - Condition 1: Burn length <= 15.0 cm (6.0 in.) for all specimens.
 *    - Condition 2: No flaming material transfer/drips igniting K-10 indicator paper.
 *    - Failure of ANY ONE specimen of the five constitutes failure of the material.
 * 3. 25-Second Ignition Verification:
 *    - Ignition source specifies calibrated thermal energy (chemical/burner).
 *    - Fixed 25 s dwell is explicitly disclaimed as a universal standard requirement;
 *      labeled LABORATORY_TEST_CONFIG_ONLY.
 * 4. De Ris (1969) Mathematical Attribution:
 *    - Author: J.N. De Ris; Title: "Spread of a laminar diffusion flame".
 *    - DOI: 10.1016/S0082-0784(69)80407-8.
 *    - Radiation treatment: explicitly included as heat loss at flame sheet
 *      and heat gain at fuel-bed surface (NOT neglected).
 *    - Specific equation numbers/pages labeled UNVERIFIED due to paywalled source text.
 * 5. Project Model Equation Reconciliation:
 *    - Actual implemented formula: spreadIndex = o2Ratio^1.35 * pressScale^0.35 * ventBonus.
 *    - Exponents classified as UNVERIFIED_MODELLED_HEURISTIC (no unverified validation claims).
 * 6. Nomex HT90-40 Claims:
 *    - LOI is non-universal, conditional range (28.0%–30.0% O2); page citation PAGE_UNVERIFIED.
 *    - Spread rate 0.8 mm/s is UNVERIFIED_MODELLED_PROXY.
 *    - Composite hazard score 85% is MODELLED_HEURISTIC.
 */

import { calculateFlammability } from '../../src/modules/flammability-simulator/physics-model.js';
import { VerificationStatus } from '../../src/utils/provenance.js';

export function runPhase224AuditTests(assert) {
  const flam = calculateFlammability({ o2: 34.0, psi: 8.2, flow: 8.0, g: 0.166 });

  // =========================================================================
  // 1. NASA-STD-6001B w/Change 3 Specimen Dimensions & Vertical Test Mode
  // =========================================================================
  const nomex = flam.materialProvenance.nomex;
  const test1 = nomex.nasaStd6001B_Test1;
  const config = test1.specimenConfiguration;

  assert(config.dimensions.includes('30.0 cm x 6.5 cm') && config.dimensions.includes('12.0 in x 2.5 in'),
    'Specimen dimensions must be exactly 30.0 cm x 6.5 cm (12.0 in x 2.5 in) per Section 7.1.2(b)');
  assert(!config.dimensions.includes('5.0 cm') && !config.dimensions.includes('x 2.0 in'),
    'Specimen dimensions must NOT state 5.0 cm or 2.0 in width');
  assert(config.sampleCount === 5, 'Sample count must be exactly 5 specimens');
  assert(config.testMode.includes('Tested one at a time, mounted vertically'),
    'Must specify tested one at a time, mounted vertically');

  // =========================================================================
  // 2. Both Acceptance Criteria & Any-One-Specimen Failure Rule
  // =========================================================================
  const criteria = test1.acceptanceCriteria;
  assert(criteria.burnLengthThreshold_cm === 15.0 && criteria.burnLengthThreshold_in === 6.0,
    'Condition 1: Burn length threshold must be 15.0 cm (6.0 in)');
  assert(criteria.transferIgnitionCriterion.includes('K-10') && criteria.transferIgnitionCriterion.includes('paper'),
    'Condition 2: Transfer ignition must prohibit ignition of K-10 indicator paper');
  assert(criteria.qualificationRule.includes('Failure of ANY ONE specimen constitutes failure'),
    'Failure Rule: Failure of any one specimen must constitute failure of the material');

  // =========================================================================
  // 3. Ignition Dwell: No Unsupported Universal Standard Requirement
  // =========================================================================
  assert(config.ignitionMethod.includes('calibrated thermal energy'),
    'Ignition method must describe calibrated thermal energy delivery');
  assert(config.ignitionMethod.includes('LABORATORY_TEST_CONFIG_ONLY'),
    'Fixed 25 s dwell must be explicitly labeled LABORATORY_TEST_CONFIG_ONLY, not a universal standard mandate');
  assert(config.ignitionMethod.includes('not a universal NASA-STD-6001B requirement'),
    'Must explicitly state 25 s is not a universal NASA-STD-6001B requirement');

  // =========================================================================
  // 4. De Ris (1969) Mathematical Attribution & Unverified Labeling
  // =========================================================================
  const deRis = flam.deRisModelAssumptions;
  assert(deRis.sourcePaper.includes('J.N. De Ris') && deRis.sourcePaper.includes('Spread of a laminar diffusion flame'),
    'Must cite author J.N. De Ris and title "Spread of a laminar diffusion flame"');
  assert(deRis.doi === '10.1016/S0082-0784(69)80407-8',
    'DOI must be 10.1016/S0082-0784(69)80407-8');
  assert(deRis.originalFormulations.radiationTreatment.includes('heat loss at the flame sheet and a heat gain at the fuel-bed surface'),
    'Radiation must be heat loss at flame sheet and heat gain at fuel-bed surface');
  assert(deRis.originalFormulations.equationVerificationStatus.includes('UNVERIFIED'),
    'Specific equation numbers and page references from De Ris (1969) must be labeled UNVERIFIED');

  // =========================================================================
  // 5. Project Model Equation Version Reconciliation & Exponent Status
  // =========================================================================
  assert(deRis.implementedProxyEquation !== undefined,
    'Must provide implementedProxyEquation object');
  assert(deRis.implementedProxyEquation.formula.includes('1.35') && deRis.implementedProxyEquation.formula.includes('0.35'),
    'Implemented equation must record actual exponents (1.35, 0.35, ventBonus)');
  assert(deRis.implementedProxyEquation.exponentsVerificationStatus === 'UNVERIFIED_MODELLED_HEURISTIC',
    'Model exponents must be classified as UNVERIFIED_MODELLED_HEURISTIC');
  assert(deRis.implementedProxyEquation.validationStatus === 'NOT_INDEPENDENTLY_VALIDATED',
    'Model equation must be declared NOT_INDEPENDENTLY_VALIDATED');

  // =========================================================================
  // 6. Nomex HT90-40 Claims & Evidence Gaps Disclosed
  // =========================================================================
  assert(nomex.loi_pct.pageCitationStatus === 'PAGE_UNVERIFIED',
    'Nomex LOI page citation must be marked PAGE_UNVERIFIED');
  assert(nomex.loi_pct.variabilityNote.includes('not a universal fixed constant'),
    'Nomex LOI must not be presented as a universal fixed constant');
  assert(test1.pageCitationStatus === 'PAGE_UNVERIFIED',
    'Nomex Test 1 page citation must be marked PAGE_UNVERIFIED');
  assert(nomex.flameSpreadVelocity.status === 'UNVERIFIED',
    'Nomex flame spread rate must remain UNVERIFIED');
  assert(nomex.status === VerificationStatus.UNVERIFIED,
    'Nomex overall status must remain UNVERIFIED');
  assert(flam.materialProvenance.compositeHazardScore.status === 'MODELLED_HEURISTIC',
    'Composite hazard score must remain MODELLED_HEURISTIC');
}
