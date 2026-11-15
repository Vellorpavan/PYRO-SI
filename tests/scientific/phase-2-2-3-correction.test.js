/**
 * Phase 2.2.3 Final Model Reference and Material Test Correction Tests
 * 
 * Verifies:
 * 1. De Ris (1969) Paper Reference & Formulation:
 *    - Paper Title: "Spread of a laminar diffusion flame"
 *    - Correct DOI: 10.1016/S0082-0784(69)80407-8
 *    - Radiation Treatment: explicitly included as heat loss at the flame sheet
 *      and heat gain at the fuel-bed surface (NOT negligible).
 *    - Equation Attribution: distinct original De Ris thin-fuel and thick-fuel
 *      analytical equations vs. project's adapted phenomenological scaling proxy.
 *    - Unverified details designated UNVERIFIED.
 * 2. NASA-STD-6001B Test 1 Interpretation & Specimen Configuration:
 *    - Standard Specimen Dimensions: 30.0 cm x 5.0 cm (12.0 in x 2.0 in).
 *    - Sample count: 5 specimens tested vertically.
 *    - Acceptance Criteria: burn length <= 15.0 cm (6.0 in.) for ALL 5 specimens,
 *      and zero flaming material transfer igniting K-10 indicator paper.
 *    - Failure threshold: burn length > 15.0 cm (6.0 in.) or paper ignition,
 *      NOT propagation > 12.0 in (the total specimen coupon length).
 *    - Specimen configuration: hemmed/unhemmed edges, mounting, ignition method.
 *    - Nomex LOI non-universality: conditional literature range (28.0%–30.0% O2),
 *      explicitly disclaiming universal constant status.
 *    - Flame spread rate (0.8 mm/s): UNVERIFIED_MODELLED_PROXY.
 *    - Composite hazard score (85%): MODELLED_HEURISTIC.
 */

import { calculateFlammability } from '../../src/modules/flammability-simulator/physics-model.js';
import { VerificationStatus } from '../../src/utils/provenance.js';

export function runPhase223CorrectionTests(assert) {
  const flam = calculateFlammability({ o2: 34.0, psi: 8.2, flow: 8.0, g: 0.166 });

  // =========================================================================
  // 1. De Ris (1969) Reference, DOI, Radiation Treatment, & Proxy Distinction
  // =========================================================================
  const deRis = flam.deRisModelAssumptions;
  assert(deRis !== undefined, 'Result must provide deRisModelAssumptions');
  
  // Title and DOI verification
  assert(deRis.sourcePaper.includes('Spread of a laminar diffusion flame'), 'Paper title must be "Spread of a laminar diffusion flame"');
  assert(deRis.doi === '10.1016/S0082-0784(69)80407-8', 'DOI must be exactly 10.1016/S0082-0784(69)80407-8');
  assert(deRis.fullCitation.includes('10.1016/S0082-0784(69)80407-8'), 'Full citation must include corrected DOI 10.1016/S0082-0784(69)80407-8');

  // Radiation Treatment
  assert(deRis.originalFormulations !== undefined, 'Must provide originalFormulations object');
  assert(deRis.originalFormulations.radiationTreatment.includes('heat loss at the flame sheet and a heat gain at the fuel-bed surface'), 'Must state radiation is heat loss at flame sheet and heat gain at fuel-bed surface');
  assert(deRis.originalFormulations.radiationTreatment.includes('NOT neglected'), 'Must explicitly confirm radiation is NOT neglected in original model');

  // Analytical Assumptions: Radiation assumption check
  const radiationAssumption = deRis.analyticalAssumptions.find(a => a.toLowerCase().includes('radiation'));
  assert(radiationAssumption !== undefined, 'Must include radiation assumption in analytical assumptions list');
  assert(radiationAssumption.includes('heat loss at the flame sheet and heat gain at the fuel-bed surface') && !radiationAssumption.includes('losses neglected'), 'Radiation assumption must state included heat loss/gain, NOT neglected');

  // Formulation Distinction
  assert(deRis.originalFormulations.thinFuelFormula.includes('tau') || deRis.originalFormulations.thinFuelFormula.includes('Bi << 1'), 'Must document original De Ris thin-fuel analytical formulation with thickness dependence');
  assert(deRis.originalFormulations.thickFuelFormula.includes('Bi >> 1'), 'Must document original De Ris thick-fuel analytical formulation');
  assert(deRis.modelDistinction.includes('CRITICAL DISTINCTION'), 'Must clearly declare distinction between original De Ris and project proxy');
  assert(deRis.modelDistinction.includes('phenomenological scaling proxy'), 'Must declare project uses adapted phenomenological scaling proxy');
  assert(deRis.unverifiedDetailsNote.includes('UNVERIFIED'), 'Unverified details note must mandate UNVERIFIED label');

  // =========================================================================
  // 2. NASA-STD-6001B Test 1 Interpretation & Specimen Configuration
  // =========================================================================
  const nomex = flam.materialProvenance.nomex;
  assert(nomex !== undefined, 'Must provide Nomex provenance');

  // Specimen Configuration
  const test1 = nomex.nasaStd6001B_Test1;
  assert(test1 !== undefined, 'Must provide nasaStd6001B_Test1 object');
  assert(test1.specimenConfiguration !== undefined, 'Must provide specimenConfiguration object');
  assert(test1.specimenConfiguration.dimensions.includes('30.0 cm x 6.5 cm') || test1.specimenConfiguration.dimensions.includes('12.0 in x 2.5 in'), 'Specimen dimensions must record 30.0 cm x 6.5 cm (12.0 in x 2.5 in)');
  assert(test1.specimenConfiguration.sampleCount === 5, 'Sample count must be exactly 5 specimens');
  assert(test1.specimenConfiguration.edgeCondition.includes('hemmed or unhemmed'), 'Must record hemmed or unhemmed edge condition');
  assert(test1.specimenConfiguration.ignitionMethod.includes('LABORATORY_TEST_CONFIG_ONLY') || test1.specimenConfiguration.ignitionMethod.includes('calibrated thermal energy'), 'Ignition method must specify calibrated thermal energy and not present 25 s as universal standard');

  // Acceptance Criteria
  assert(test1.acceptanceCriteria !== undefined, 'Must provide acceptanceCriteria object');
  assert(test1.acceptanceCriteria.burnLengthThreshold_cm === 15.0, 'Burn length failure threshold must be 15.0 cm');
  assert(test1.acceptanceCriteria.burnLengthThreshold_in === 6.0, 'Burn length failure threshold must be 6.0 in');
  assert(test1.acceptanceCriteria.transferIgnitionCriterion.includes('K-10') || test1.acceptanceCriteria.transferIgnitionCriterion.includes('paper'), 'Must include indicator paper ignition criterion');
  assert(test1.acceptanceCriteria.qualificationRule.includes('All five (5) specimens'), 'Must state all 5 specimens must independently satisfy criteria');

  // Failure threshold correction: NOT 12 inches
  assert(!test1.outcome_34pct_EAM.includes('> 12.0 in'), 'Outcome must not present > 12 in as the general failure threshold');
  assert(test1.outcome_34pct_EAM.includes('15 cm / 6 in'), 'Outcome must cite 15 cm / 6 in failure threshold');

  // Nomex LOI Non-Universality
  assert(nomex.loi_pct.variabilityNote !== undefined, 'Must provide LOI variability note');
  assert(nomex.loi_pct.variabilityNote.includes('not a universal fixed constant'), 'Must state LOI is not a universal fixed constant');
  assert(nomex.loi_pct.variabilityNote.includes('areal weight') && nomex.loi_pct.variabilityNote.includes('edge finish'), 'Must document LOI dependence on weight and edge finish');

  // Epistemic Guardrails Retained
  assert(nomex.flameSpreadVelocity.status === 'UNVERIFIED', 'Nomex flame spread velocity status must remain UNVERIFIED');
  assert(nomex.status === VerificationStatus.UNVERIFIED, 'Nomex overall status must remain UNVERIFIED');
  assert(flam.materialProvenance.compositeHazardScore.status === 'MODELLED_HEURISTIC', 'Composite hazard score must remain MODELLED_HEURISTIC');
}
