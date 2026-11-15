/**
 * Physiological Atmosphere vs Material Flammability Separation Tests
 * Validates NASA-STD-3001 Rev F Table 6.2-1 inspired respiratory boundaries strictly independent of material flammability.
 */

import { evaluatePhysiologicalAtmosphere, calculateFlammability, PSI_TO_KPA } from '../../src/modules/flammability-simulator/physics-model.js';

export function runPhysiologicalSeparationTests(assert) {
  // 1. ISS Nominal Sea-Level Standard (14.7 psi, 21% O2)
  const issPhys = evaluatePhysiologicalAtmosphere({ o2: 21.0, psi: 14.7 });
  assert(issPhys.isNormoxicTarget, 'ISS nominal inspired PIO2 must fall in normoxia target band (145–155 mmHg)');
  assert(Math.abs(issPhys.PIO2_mmHg - 149.8) < 1.0, `ISS PIO2 (${issPhys.PIO2_mmHg.toFixed(1)} mmHg) must be ~149.8 mmHg`);
  assert(!issPhys.isHypoxic, 'ISS nominal must not be hypoxic');
  assert(!issPhys.isHyperoxic, 'ISS nominal must not be hyperoxic');
  assert(issPhys.hasSufficientDiluent, 'ISS nominal (79% N2) must satisfy >=30% diluent requirement [V2 6002]');
  assert(issPhys.isTotalPressureCompliant, 'ISS nominal (101.35 kPa) must satisfy 34.5 < pressure <= 103 kPa [V2 6006]');
  assert(issPhys.status === 'NOMINAL_COMPLIANT', 'ISS nominal status must be NOMINAL_COMPLIANT');

  // 2. Artemis Exploration Atmosphere (8.2 psi, 34% O2)
  // Reassessed per Phase 2.2: PIO2 = (424.06 - 47) * 0.34 = 128.2 mmHg (MILD HYPOXIA, NOT NORMOXIA!)
  const lunarPhys = evaluatePhysiologicalAtmosphere({ o2: 34.0, psi: 8.2 });
  const lunarFlam = calculateFlammability({ o2: 34.0, psi: 8.2, flow: 8.0, g: 0.166 });

  assert(Math.abs(lunarPhys.PIO2_mmHg - 128.2) < 0.5, `Artemis EAM PIO2 must be ~128.2 mmHg, got ${lunarPhys.PIO2_mmHg.toFixed(1)}`);
  assert(lunarPhys.isMildHypoxia, 'Artemis EAM (128.2 mmHg) must be classified as MILD HYPOXIA (127–144 mmHg)');
  assert(!lunarPhys.isNormoxicTarget, 'Artemis EAM must NOT be classified as normoxia target (145–155 mmHg)');
  assert(lunarPhys.status === 'QUALIFIED_MILD_HYPOXIA', 'Status must indicate QUALIFIED_MILD_HYPOXIA for operational exploration');
  assert(lunarPhys.hasSufficientDiluent, 'Artemis EAM (66% N2) satisfies >=30% diluent rule [V2 6002]');
  // Material flammability is evaluated independently:
  assert(lunarFlam.riskScore >= 75, 'Artemis EAM must simultaneously trigger EXTREME material flammability risk (>=75%)');
  assert(parseFloat(lunarFlam.rates.nomex) > 0.0, 'Nomex must burn in EAM 34% O2 despite human mild hypoxia');

  // 3. Strict Total Pressure Boundary Tests [V2 6006]: 34.5 kPa < pressure <= 103.0 kPa
  // Exactly 34.5 kPa must FAIL (strictly greater than)
  const pExactly34_5 = evaluatePhysiologicalAtmosphere({ o2: 21.0, psi: 34.5 / PSI_TO_KPA });
  assert(!pExactly34_5.isTotalPressureCompliant, 'Pressure of exactly 34.5 kPa must be NON-COMPLIANT (strictly > 34.5 kPa)');
  assert(pExactly34_5.status === 'NON_COMPLIANT_LOW_PRESSURE', 'Status must indicate NON_COMPLIANT_LOW_PRESSURE at 34.5 kPa');

  // Just above 34.5 kPa (e.g. 34.6 kPa) must PASS
  const pJustAbove34_5 = evaluatePhysiologicalAtmosphere({ o2: 21.0, psi: 34.6 / PSI_TO_KPA });
  assert(pJustAbove34_5.isTotalPressureCompliant, 'Pressure just above 34.5 kPa (34.6 kPa) must be COMPLIANT');

  // Exactly 103.0 kPa must PASS (less than or equal to)
  const pExactly103 = evaluatePhysiologicalAtmosphere({ o2: 21.0, psi: 103.0 / PSI_TO_KPA });
  assert(pExactly103.isTotalPressureCompliant, 'Pressure of exactly 103.0 kPa must be COMPLIANT (<= 103 kPa)');

  // Above 103.0 kPa (e.g. 103.1 kPa) must FAIL
  const pAbove103 = evaluatePhysiologicalAtmosphere({ o2: 21.0, psi: 103.1 / PSI_TO_KPA });
  assert(!pAbove103.isTotalPressureCompliant, 'Pressure above 103.0 kPa (103.1 kPa) must be NON-COMPLIANT');
  assert(pAbove103.status === 'NON_COMPLIANT_HIGH_PRESSURE', 'Status must indicate NON_COMPLIANT_HIGH_PRESSURE');

  // 4. [V2 6002] Inert Gas Diluent Tests (Minimum 30% diluent, no 14-day condition)
  // Low diluent (25% diluent)
  const lowDiluent = evaluatePhysiologicalAtmosphere({ o2: 75.0, psi: 14.7 });
  assert(!lowDiluent.hasSufficientDiluent, 'Atmosphere with <30% diluent gas must violate [V2 6002]');
  assert(lowDiluent.status === 'NON_COMPLIANT_LOW_DILUENT', 'Status must indicate NON_COMPLIANT_LOW_DILUENT');

  // Explicit diluent gas specification
  const explicitDiluent = evaluatePhysiologicalAtmosphere({ o2: 21.0, psi: 14.7, diluent: 78.0, co2: 0.5 });
  assert(explicitDiluent.inertGasPct === 78.0, 'Explicit diluent percentage must be respected');
  assert(!explicitDiluent.isBinaryAssumed, 'Explicit diluent must clear binary assumption flag');
  assert(explicitDiluent.hasSufficientDiluent, 'Explicit 78% diluent must satisfy [V2 6002]');

  // 5. Acute Hypoxia (<105 mmHg) & Moderate Hypoxia (105-127 mmHg)
  const acuteHypoxic = evaluatePhysiologicalAtmosphere({ o2: 12.0, psi: 10.0 }); // PIO2 ~ 56 mmHg
  assert(acuteHypoxic.isAcuteHypoxia, 'Atmosphere with PIO2 < 105 mmHg must trigger acute hypoxia');
  assert(acuteHypoxic.status === 'NON_COMPLIANT_ACUTE_HYPOXIA', 'Status must indicate NON_COMPLIANT_ACUTE_HYPOXIA');

  const modHypoxic = evaluatePhysiologicalAtmosphere({ o2: 18.0, psi: 14.7 }); // PIO2 ~ 128.4 mmHg? No: (760-47)*0.18 = 128.34 (mild).
  // Let's test moderate hypoxia: (760-47)*0.16 = 114.1 mmHg
  const modHypoxicTest = evaluatePhysiologicalAtmosphere({ o2: 16.0, psi: 14.7 });
  assert(modHypoxicTest.isModerateHypoxia, 'Atmosphere with PIO2 in 105–127 mmHg must trigger moderate hypoxia');
  assert(modHypoxicTest.status === 'NON_COMPLIANT_MODERATE_HYPOXIA', 'Status must indicate NON_COMPLIANT_MODERATE_HYPOXIA');

  // 6. Hyperoxia (>155 mmHg)
  const hyperoxic = evaluatePhysiologicalAtmosphere({ o2: 50.0, psi: 14.7 }); // PIO2 = (760-47)*0.5 = 356.5 mmHg
  assert(hyperoxic.isHyperoxic, 'Atmosphere with PIO2 > 155 mmHg must trigger hyperoxia warning');
}
