/**
 * Phase 2.2.4.2 Ignition Citation and Runtime Contract Correction Tests
 * 
 * Verifies:
 * 1. Corrected 750 cal / ISO 14624-1 Standards Attribution:
 *    - Removal of false NASA-STD-6001B Sections 7.1.3.1 / App A.1.2 clause attribution.
 *    - Historical provenance: 750 ± 50 cal (3138 ± 209 J) from NASA Handbook NHB 8060.1B/C Test 1.
 *    - Unit correction: 750 cal transcribed erroneously as 750 J was a factor-of-4.184 error.
 *    - Active standard: NASA-STD-6001B Section 7.1 references ISO 14624-1 (25 ± 5 s, 1100 ± 90°C, 65 ± 6.5 mm).
 *    - Separation: Total energy (cal/J) vs energy fluence (2000 kJ/m²) vs duration (25 ± 5 s).
 * 2. Nomex LOI and Runtime Range Contract:
 *    - Nomex HT90-40 documented LOI (28.0–30.0%) is preserved without silent reduction.
 *    - SIBAL LOI model (base 17.5%, clamped to [12.5, 24.0]%) does not alter Nomex LOI.
 *    - When material: 'nomex' is passed, returns MATERIAL_OUTSIDE_SUPPORTED_LOI_DOMAIN.
 *    - SIBAL returns SUPPORTED_CALIBRATION_BASELINE.
 * 3. Oxygen-Term Formula Numerical Assertions:
 *    - Asserts actual mathematical outputs below LOI, at LOI, and above LOI.
 *    - Asserts Math.max(0.1, ...) anti-NaN software floor behavior (preventing JavaScript Math.pow(neg, 1.35) -> NaN).
 *    - Asserts that non-zero spreadIndex below LOI is a software artifact, NOT physical combustion.
 * 4. SIBAL Hypoxic Purge Override Classification:
 *    - Fixed 0.2 mm/s below 10% O2 is classified as UNVERIFIED_MODELLED_HEURISTIC.
 *    - isFlightMeasured is false (not a SAFFIRE-I flight measurement).
 *    - SIBAL status in hypoxic purge is UNVERIFIED.
 */

import { calculateFlammability } from '../../src/modules/flammability-simulator/physics-model.js';
import { VerificationStatus } from '../../src/utils/provenance.js';

export function runPhase2242ContractTests(assert) {
  // =========================================================================
  // 1. Corrected 750 cal / ISO 14624-1 Standards Attribution
  // =========================================================================
  const flam = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 10.0, g: 1.0 });
  const nomex = flam.materialProvenance.nomex;
  const test1 = nomex.nasaStd6001B_Test1;
  const config = test1.specimenConfiguration;
  const energyAudit = config.ignitionEnergyAudit;

  assert(energyAudit.status === 'REMOVED_CURRENT_STANDARD_VERIFICATION_CLAIM',
    'False current-standard verification claim must be removed');
  assert(energyAudit.historicalStandardEnergy.includes('750 ± 50 cal'),
    'Historical standard energy must record 750 ± 50 cal');
  assert(energyAudit.historicalStandardEnergy.includes('NHB 8060.1'),
    'Historical energy must cite NASA Handbook NHB 8060.1B/C Test 1');
  assert(energyAudit.energyUnitsCorrection.includes('factor-of-4.184'),
    'Must explain that transcribing 750 cal as 750 J was a factor-of-4.184 error');
  assert(energyAudit.currentActiveStandardSpecification.includes('ISO 14624-1'),
    'Active standard specification must cite ISO 14624-1 referenced by NASA-STD-6001B Section 7.1');
  assert(energyAudit.currentActiveStandardSpecification.includes('does NOT contain Section 7.1.3.1 or Appendix A.1.2'),
    'Must explicitly state NASA-STD-6001B does NOT contain Section 7.1.3.1 or Appendix A.1.2 for 750 J');

  // =========================================================================
  // 2. Nomex LOI and Runtime Range Contract
  // =========================================================================
  // 2.1 Default / SIBAL evaluation
  const flamSibal = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 10.0, g: 1.0, material: 'sibal' });
  assert(flamSibal.materialModelStatus === 'SUPPORTED_CALIBRATION_BASELINE',
    'SIBAL fabric must be classified as SUPPORTED_CALIBRATION_BASELINE');
  assert(flamSibal.sibal_loi >= 12.5 && flamSibal.sibal_loi <= 24.0,
    'SIBAL scaled LOI must remain within supported range [12.5, 24.0]%');

  // 2.2 Nomex evaluation: Documented LOI must NOT be silently reduced
  const flamNomex = calculateFlammability({ o2: 34.0, psi: 8.2, flow: 8.0, g: 0.166, material: 'nomex' });
  assert(flamNomex.materialModelStatus === 'MATERIAL_OUTSIDE_SUPPORTED_LOI_DOMAIN',
    'Nomex evaluation must return MATERIAL_OUTSIDE_SUPPORTED_LOI_DOMAIN');
  assert(flamNomex.materialProvenance.nomex.loi_pct.range === '28.0% – 30.0% O2',
    'Nomex documented LOI must remain 28.0% – 30.0% O2 without silent reduction');
  assert(flamNomex.materialProvenance.nomex.loi_pct.modelSupported === false,
    'Nomex LOI must be flagged as modelSupported: false');
  assert(flamNomex.materialProvenance.nomex.loi_pct.runtimeStatus === 'OUT_OF_RANGE_UNSUPPORTED',
    'Nomex runtime status must be OUT_OF_RANGE_UNSUPPORTED');

  // =========================================================================
  // 3. Oxygen-Term Formula Numerical Assertions
  // =========================================================================
  // Mathematical formula: o2Ratio = Math.pow(Math.max(0.1, (o2Val - loi) / 5.5), 1.35)
  // At psi = 14.7, flow = 10.0, g = 1.0: vEffective = sqrt(100 + 1024) = 33.526 cm/s (>25 cm/s -> flowFactor = +0.4)
  // pressureFactor = (14.7/14.7)^0.18 = 1.0. SIBAL loi = clamp(17.5 + 0.4, 12.5, 24.0) = 17.9%.
  // pressScale = (14.7/10.2)^0.35 ≈ 1.1354; ventBonus = 0.95 (since vEffective > 22 cm/s).
  const baselineFlam = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 10.0, g: 1.0 });
  const exactLoi = baselineFlam.loi; // 17.9%

  // 3.1 Numerical test: o2Val below LOI (e.g. o2 = 10.0% vs loi = 17.9%)
  // Normalized diff = (10.0 - 17.9) / 5.5 = -7.9 / 5.5 = -1.43636... < 0.1
  // Clamped base = 0.1. Expected o2Ratio = 0.1^1.35 ≈ 0.044668359
  const flamBelowLoi = calculateFlammability({ o2: 10.0, psi: 14.7, flow: 10.0, g: 1.0 });
  const expectedO2RatioBelow = Math.pow(0.1, 1.35); // ≈ 0.044668
  const expectedSpreadBelow = Math.max(0.0, expectedO2RatioBelow * Math.pow(14.7 / 10.2, 0.35) * 0.95);
  assert(Math.abs(flamBelowLoi.spreadIndex - expectedSpreadBelow) < 1e-6,
    `spreadIndex below LOI must evaluate to exact software floor (${expectedSpreadBelow.toFixed(6)})`);

  // 3.2 Numerical test: o2Val at LOI (o2 = exactLoi)
  // Normalized diff = (17.9 - 17.9) / 5.5 = 0.0 < 0.1
  // Clamped base = 0.1. Expected o2Ratio = 0.1^1.35 ≈ 0.044668
  const flamAtLoi = calculateFlammability({ o2: exactLoi, psi: 14.7, flow: 10.0, g: 1.0 });
  assert(Math.abs(flamAtLoi.spreadIndex - expectedSpreadBelow) < 1e-6,
    `spreadIndex at LOI must evaluate to exact software floor (${expectedSpreadBelow.toFixed(6)})`);

  // 3.3 Numerical test: o2Val above LOI where base = 1.0 (o2 = exactLoi + 5.5 = 23.4%)
  // Normalized diff = 5.5 / 5.5 = 1.0 >= 0.1
  // Clamped base = 1.0. Expected o2Ratio = 1.0^1.35 = 1.0
  const flamAboveBase1 = calculateFlammability({ o2: exactLoi + 5.5, psi: 14.7, flow: 10.0, g: 1.0 });
  const expectedSpreadBase1 = Math.max(0.0, 1.0 * Math.pow(14.7 / 10.2, 0.35) * 0.95);
  assert(Math.abs(flamAboveBase1.spreadIndex - expectedSpreadBase1) < 1e-6,
    `spreadIndex at base 1.0 must evaluate to exact multiplier (${expectedSpreadBase1.toFixed(6)})`);

  // 3.4 Numerical test: o2Val above LOI where base = 2.0 (o2 = exactLoi + 11.0 = 28.9%)
  // Normalized diff = 11.0 / 5.5 = 2.0 >= 0.1
  // Clamped base = 2.0. Expected o2Ratio = 2.0^1.35 ≈ 2.54912
  const flamAboveBase2 = calculateFlammability({ o2: exactLoi + 11.0, psi: 14.7, flow: 10.0, g: 1.0 });
  const expectedSpreadBase2 = Math.max(0.0, Math.pow(2.0, 1.35) * Math.pow(14.7 / 10.2, 0.35) * 0.95);
  assert(Math.abs(flamAboveBase2.spreadIndex - expectedSpreadBase2) < 1e-6,
    `spreadIndex at base 2.0 must evaluate to exact power (${expectedSpreadBase2.toFixed(6)})`);

  // 3.5 Anti-NaN proof: Verify that uncaught negative base produces NaN in JavaScript
  const rawJsUnclamped = Math.pow(-1.0, 1.35);
  assert(Number.isNaN(rawJsUnclamped),
    'JavaScript Math.pow with negative base and fractional exponent MUST return NaN');
  assert(!Number.isNaN(flamBelowLoi.spreadIndex),
    'Model spreadIndex below LOI must never produce NaN due to 0.1 anti-NaN software floor');

  // =========================================================================
  // 4. SIBAL Hypoxic Override Classification
  // =========================================================================
  // 4.1 Hypoxic purge (<10% O2)
  const hypoxic = calculateFlammability({ o2: 8.0, psi: 14.7, flow: 10.0, g: 1.0 });
  const sibalHypoxic = hypoxic.materialProvenance.sibal;
  assert(sibalHypoxic.spreadRate_mm_s === '0.2',
    'SIBAL spread rate in hypoxic purge must be 0.2 mm/s');
  assert(sibalHypoxic.status === VerificationStatus.UNVERIFIED,
    'SIBAL status in hypoxic purge must be UNVERIFIED');
  assert(sibalHypoxic.hypoxicOverride !== null,
    'Must provide hypoxicOverride object');
  assert(sibalHypoxic.hypoxicOverride.classification === 'UNVERIFIED_MODELLED_HEURISTIC',
    'Hypoxic override must be classified as UNVERIFIED_MODELLED_HEURISTIC');
  assert(sibalHypoxic.hypoxicOverride.isFlightMeasured === false,
    'isFlightMeasured must be false (not a flight measurement)');

  // 4.2 Nominal atmospheric baseline (21% O2)
  const nominal = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 20.0, g: 0.0 });
  const sibalNominal = nominal.materialProvenance.sibal;
  assert(sibalNominal.status === VerificationStatus.VERIFIED_DATASET,
    'SIBAL status at nominal flight calibration point must be VERIFIED_DATASET');
  assert(sibalNominal.hypoxicOverride === null,
    'hypoxicOverride must be null during nominal operations');
}
