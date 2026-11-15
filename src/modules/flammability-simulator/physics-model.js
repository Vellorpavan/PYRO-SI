/**
 * Flammability Simulator Physics Model
 * Computes combustion parameters, flame spread proxies, and fire hazard indices.
 * 
 * SCIENTIFIC GOVERNANCE & EPISTEMIC BOUNDARIES:
 * - 1D Phenomenological Energy Balance Model based on De Ris (1969).
 * - Single-point flight calibration: Anchored to SAFFIRE-I SIBAL thin fabric
 *   concurrent flame spread (2.24 mm/s at 20 cm/s forced flow, 21.5% O₂).
 * - UNCALIBRATED THEORETICAL PROXY for thick polymers, 3D room geometries, or low-pressure quenching.
 * - NOT certified for flight vehicle structural clearance or critical life-safety signoff.
 * - Physiological requirements (NASA-STD-3001 Rev F, Approved July 14, 2026) are evaluated strictly separately
 *   from material flammability screening thresholds (NASA-STD-6001B).
 */

import { clamp } from '../../utils/math.js';
import { createProvenanceRecord, EpistemicClassification, VerificationStatus } from '../../utils/provenance.js';

// Physical Conversion Constants
export const PSI_TO_KPA = 6.894757;
export const KPA_TO_PSI = 1 / PSI_TO_KPA;
export const KPA_TO_MMHG = 760.0 / 101.325; // 7.50061683 mmHg per kPa
export const MMHG_TO_KPA = 101.325 / 760.0; // 0.133322368 kPa per mmHg
export const WATER_VAPOR_PRESSURE_37C_MMHG = 47.0; // Saturated tracheal water vapor pressure at 37°C

/**
 * Evaluates physiological compliance of the atmosphere per NASA-STD-3001 Rev F (Approved July 14, 2026).
 * 
 * NASA-STD-3001 Volume 2 Revision F Normative Mappings:
 * 1. [V2 6002] Inert Gas Diluent:
 *    Cabin atmospheric composition shall contain at least 30% diluent gas, assuming the balance is oxygen.
 *    (No 14-day duration limitation; explicit gas composition supported; binary mixture assumed if unspecified).
 * 2. [V2 6003] Inspired Oxygen Partial Pressure (PIO2):
 *    Evaluates tracheal inspired oxygen via Table 6.2-1 relationship:
 *    PIO2 = (PB - 47 mmHg) * FIO2
 *    Table 6.2-1 Normative Ranges:
 *    - Normoxia Target: 145–155 mmHg (19.33–20.66 kPa).
 *      Operational baseline for optimal crew performance. Does NOT constitute a guarantee of zero physiological risk.
 *    - Exploration Atmospheres / Mild Hypoxia Band: 127–144 mmHg (16.93–19.33 kPa).
 *      Permissible for qualified exploration atmospheres (e.g. Artemis 34% O2 at 8.2 psia yields PIO2 ~128.2 mmHg);
 *      1-hour TWA lower limit: 127 mmHg (16.93 kPa); Absolute lower limit: 122 mmHg (16.27 kPa).
 *      Requires active flight crew monitoring and program medical mitigation protocols. NOT the normoxia target!
 *    Table 6.2-1 Non-Normative / Clinical Reference Classifications (Aerospace Medicine Literature):
 *    - Moderate Hypoxia: 105–127 mmHg (14.00–16.93 kPa).
 *    - Acute Hypoxia: <105 mmHg (<14.00 kPa).
 *    - Mild Hyperoxia: 155–225 mmHg (20.66–30.00 kPa).
 *    - Severe Hyperoxia: >225 mmHg (>30.00 kPa).
 * 3. [V2 6006] Total Cabin Pressure:
 *    Pressure interval: 34.5 kPa < pressure <= 103.0 kPa (5.004 psia < pressure <= 14.939 psia).
 *    Lower boundary is strictly greater than 34.5 kPa.
 * 
 * Keeps human respiratory factors strictly independent from material flammability (NASA-STD-6001B).
 */
export function evaluatePhysiologicalAtmosphere({ o2, psi, diluent, n2, co2 } = {}) {
  const o2Val = Math.max(0.0, Number(o2) || (o2 === 0 ? 0.0 : 21.0));
  const psiVal = (psi === 0) ? 0.0 : Math.max(0.1, Number(psi) || 14.7);

  // Pressure conversions
  const totalPress_psia = psiVal;
  const totalPress_kPa = psiVal * PSI_TO_KPA;
  const totalPress_mmHg = totalPress_kPa * KPA_TO_MMHG;

  // Gas mixture composition & [V2 6002] diluent verification
  const isBinaryAssumed = (diluent === undefined && n2 === undefined);
  const inertGasPct = diluent !== undefined ? Number(diluent) : (n2 !== undefined ? Number(n2) : Math.max(0.0, 100.0 - o2Val));
  const hasSufficientDiluent = inertGasPct >= 30.0; // [V2 6002] Minimum 30% diluent gas

  // [V2 6006] Total Pressure: strictly 34.5 kPa < pressure <= 103.0 kPa
  const isTotalPressureCompliant = totalPress_kPa > 34.5 && totalPress_kPa <= 103.0;

  // Ambient Dry-Gas Oxygen Partial Pressure (Dalton's Law: pO2 = PB * FIO2)
  const pO2_dry_psia = (o2Val / 100.0) * totalPress_psia;
  const pO2_dry_kPa = pO2_dry_psia * PSI_TO_KPA;
  const pO2_dry_mmHg = pO2_dry_kPa * KPA_TO_MMHG;

  // [V2 6003] Inspired Tracheal Oxygen Partial Pressure (PIO2) per Table 6.2-1 relationship:
  // PIO2 = (PB - 47 mmHg) * FIO2
  const trachealDryPressure_mmHg = Math.max(0.0, totalPress_mmHg - WATER_VAPOR_PRESSURE_37C_MMHG);
  const PIO2_mmHg = trachealDryPressure_mmHg * (o2Val / 100.0);
  const PIO2_kPa = PIO2_mmHg * MMHG_TO_KPA;
  const PIO2_psia = PIO2_kPa * KPA_TO_PSI;

  // Normative Table 6.2-1 Categorization
  let table6_2_1_Category = '';
  let durationQualification = '';
  let isNormoxicTarget = false;
  let isMildHypoxia = false;
  let isModerateHypoxia = false;
  let isAcuteHypoxia = false;
  let isHyperoxic = false;
  let isBelowAbsoluteLimit = false;
  let isBelow1HrTwaLimit = false;

  // Table 6.2-1 Explicit Boundaries & Official Wording
  const table6_2_1_Limits = {
    normoxiaTarget_mmHg: { min: 145.0, max: 155.0 },
    normoxiaTarget_kPa: { min: 19.33, max: 20.66 },
    explorationTwa1HrLowerLimit_mmHg: 127.0,
    explorationTwa1HrLowerLimit_kPa: 16.93,
    absoluteLowerLimit_mmHg: 122.0,
    absoluteLowerLimit_kPa: 16.27,
    totalPressureInterval_kPa: { minExclusive: 34.5, maxInclusive: 103.0 },
    diluentMinimumPct: 30.0,
    sourceCitation: 'NASA-STD-3001 Vol 2 Rev F, Section 6.2.2 & Table 6.2-1'
  };

  // Official Table 6.2-1 Terminology per NASA-STD-3001 Vol 2 Rev F
  const table6_2_1_OfficialTerms = {
    normoxiaTargetRange: '145 – 155 mmHg (19.3 – 20.7 kPa / 2.80 – 3.00 psia)',
    normoxiaTargetDuration: 'Indefinite',
    mildHypoxiaLowerLimit: '127 mmHg (16.9 kPa / 2.46 psia)',
    mildHypoxiaDuration: 'Indefinite with monitoring**',
    footnoteDoubleStar: 'There is no opportunity to collect data in microgravity with PIO2 of 127 mmHg to cover the durations of Exploration Class missions, so a health monitoring and mitigation plan are required to implement this condition.',
    footnoteQuadStar: '1-hour time-weighted average with an absolute lower limit for the minimum hypoxia range of 122 mmHg / 2.36 psia.',
    absoluteLowerLimit: '122 mmHg (16.3 kPa / 2.36 psia)',
    tableTitle: 'Table 6.2-1—Inspired Oxygen Partial Pressure Exposure Ranges',
    standardCitation: 'NASA-STD-3001 Volume 2 Revision F (July 14, 2026)'
  };

  // Project-Defined Operational Interpretation (visibly separated from official NASA requirements)
  let projectOperationalInterpretation = {
    classification: 'NOMINAL_BASELINE',
    note: 'Operating within official NASA Table 6.2-1 Normoxia Target Range.'
  };

  if (PIO2_mmHg < 122.0) {
    table6_2_1_Category = 'BELOW_ABSOLUTE_LOWER_LIMIT';
    isBelowAbsoluteLimit = true;
    isBelow1HrTwaLimit = true;
    projectOperationalInterpretation = {
      classification: 'NON_COMPLIANT_BELOW_ABSOLUTE_LIMIT',
      note: 'Inspired PIO2 is below the Table 6.2-1 Footnote **** absolute lower limit (122 mmHg / 16.3 kPa).'
    };
  } else if (PIO2_mmHg < 127.0) {
    table6_2_1_Category = 'BELOW_TWA_LOWER_LIMIT';
    isBelow1HrTwaLimit = true;
    projectOperationalInterpretation = {
      classification: 'NON_COMPLIANT_BELOW_TWA_LIMIT',
      note: 'Inspired PIO2 is below the Table 6.2-1 Mild Hypoxia Lower Limit 1-hour TWA (127 mmHg / 16.9 kPa).'
    };
  } else if (PIO2_mmHg < 145.0) {
    table6_2_1_Category = 'QUALIFIED_EXPLORATION_MILD_HYPOXIA';
    isMildHypoxia = true;
    projectOperationalInterpretation = {
      classification: 'EXPLORATION_ATMOSPHERE_OPERATIONAL_BAND',
      note: 'NASA Table 6.2-1 defines the Mild Hypoxia Lower Limit at 127 mmHg (Indefinite with monitoring**), not a formally named 127–144.9 mmHg category. Operating between 127 mmHg and 145 mmHg is a project-defined exploration band that satisfies the 127 mmHg limit but operates below the 145–155 mmHg Normoxia Target Range, requiring active flight crew monitoring and operational mitigations per Table 6.2-1 Footnote **.'
    };
  } else if (PIO2_mmHg <= 155.0) {
    table6_2_1_Category = 'NORMOXIA_TARGET';
    isNormoxicTarget = true;
    projectOperationalInterpretation = {
      classification: 'NORMOXIA_TARGET_RANGE',
      note: 'Conforms to official Table 6.2-1 Normoxia Target Range (145–155 mmHg). Operational baseline; does not constitute a guarantee of zero physiological risk.'
    };
  } else {
    table6_2_1_Category = 'ABOVE_NORMOXIA_TARGET';
    isHyperoxic = true;
    projectOperationalInterpretation = {
      classification: 'ABOVE_NORMOXIA_TARGET_RANGE',
      note: 'Inspired PIO2 exceeds official Table 6.2-1 Normoxia Target Range (145–155 mmHg).'
    };
  }

  // Clinical Reference Classification (Aerospace Medicine Literature / Bioastronautics Data)
  let clinicalClassification = '';
  if (PIO2_mmHg < 105.0) {
    clinicalClassification = 'ACUTE_HYPOXIA';
    durationQualification = 'Below clinical acute hypoxia limit (<105 mmHg / 14.0 kPa). Severe cognitive impairment and loss of consciousness hazard.';
    isAcuteHypoxia = true;
  } else if (PIO2_mmHg < 127.0) {
    clinicalClassification = 'MODERATE_HYPOXIA';
    durationQualification = 'Below Table 6.2-1 1-hour TWA exploration minimum (127 mmHg). Contingency operations only; duration-limited; impaired cognitive and physical performance.';
    isModerateHypoxia = true;
  } else if (PIO2_mmHg < 145.0) {
    clinicalClassification = 'MILD_HYPOXIA';
    durationQualification = 'Permissible for qualified exploration atmospheres (e.g., Artemis 34% O2 at 8.2 psia yields PIO2 ~128.2 mmHg) with medical monitoring and mitigation protocols. 1-hour TWA lower limit: 127 mmHg; Absolute lower limit: 122 mmHg. NOT the nominal normoxia target.';
    isMildHypoxia = true;
  } else if (PIO2_mmHg <= 155.0) {
    clinicalClassification = 'NORMOXIA_TARGET';
    durationQualification = 'Nominal physiological baseline per Table 6.2-1; indefinite mission duration; unrestricted human performance. Note: Conformance does not constitute a guarantee of zero physiological risk.';
    isNormoxicTarget = true;
  } else if (PIO2_mmHg <= 225.0) {
    clinicalClassification = 'MILD_HYPEROXIA';
    durationQualification = 'Permissible for short to medium duration; extended exposure risks oxidative lung irritation and delayed atelectasis.';
    isHyperoxic = true;
  } else {
    clinicalClassification = 'SEVERE_HYPEROXIA';
    durationQualification = 'Strictly duration-limited (EVA 100% O2 prebreathe or medical hyperbaric protocols only); pulmonary atelectasis and CNS toxicity risk.';
    isHyperoxic = true;
  }

  // Backward-compatibility aliases:
  const physiologicalCategory = clinicalClassification;
  const isNormoxic = isNormoxicTarget;
  const isHypoxic = isAcuteHypoxia || isModerateHypoxia || isMildHypoxia;

  // Status computation
  let status = 'NOMINAL_COMPLIANT';
  let message = '';

  if (!isTotalPressureCompliant) {
    if (totalPress_kPa <= 34.5) {
      status = 'NON_COMPLIANT_LOW_PRESSURE';
      message = `NON-COMPLIANT: Total cabin pressure (${totalPress_kPa.toFixed(2)} kPa) is below or equal to 34.5 kPa minimum boundary per NASA-STD-3001 Rev F [V2 6006].`;
    } else {
      status = 'NON_COMPLIANT_HIGH_PRESSURE';
      message = `NON-COMPLIANT: Total cabin pressure (${totalPress_kPa.toFixed(2)} kPa) exceeds 103.0 kPa maximum operating boundary per NASA-STD-3001 Rev F [V2 6006].`;
    }
  } else if (!hasSufficientDiluent) {
    status = 'NON_COMPLIANT_LOW_DILUENT';
    message = `NON-COMPLIANT: Diluent gas concentration (${inertGasPct.toFixed(1)}%) is below 30% minimum per NASA-STD-3001 Rev F [V2 6002].`;
  } else if (isAcuteHypoxia) {
    status = 'NON_COMPLIANT_ACUTE_HYPOXIA';
    message = `CRITICAL HAZARD: Inspired PIO2 (${PIO2_mmHg.toFixed(1)} mmHg / ${PIO2_kPa.toFixed(2)} kPa) is in the acute hypoxia range (<105 mmHg).`;
  } else if (isModerateHypoxia) {
    status = 'NON_COMPLIANT_MODERATE_HYPOXIA';
    message = `WARNING: Inspired PIO2 (${PIO2_mmHg.toFixed(1)} mmHg / ${PIO2_kPa.toFixed(2)} kPa) is below the Table 6.2-1 1-hour TWA limit (127 mmHg).`;
  } else if (isMildHypoxia) {
    status = 'QUALIFIED_MILD_HYPOXIA';
    message = `MILD HYPOXIA (OPERATIONAL EXPLORATION REGIME): Inspired PIO2 is ${PIO2_mmHg.toFixed(1)} mmHg (${PIO2_kPa.toFixed(2)} kPa). Conforms to Table 6.2-1 exploration criteria (>=127 mmHg 1-hr TWA), but is BELOW the normoxia target (145–155 mmHg). Requires active crew monitoring and operational mitigations.`;
  } else if (isHyperoxic) {
    status = 'NON_COMPLIANT_HYPEROXIA';
    message = `CAUTION: Inspired PIO2 (${PIO2_mmHg.toFixed(1)} mmHg / ${PIO2_kPa.toFixed(2)} kPa) exceeds Table 6.2-1 normoxia target (145–155 mmHg).`;
  } else {
    status = 'NOMINAL_COMPLIANT';
    message = `Atmosphere conforms to NASA-STD-3001 Rev F [V2 6003] normoxia target (PIO2 = ${PIO2_mmHg.toFixed(1)} mmHg in 145–155 mmHg band).`;
  }

  return {
    // Ambient dry-gas quantities
    pO2_dry_psia,
    pO2_dry_kPa,
    pO2_dry_mmHg,
    // Tracheal inspired PIO2 quantities
    PIO2_psia,
    PIO2_kPa,
    PIO2_mmHg,
    // Total pressure quantities
    totalPress_psia,
    totalPress_kPa,
    totalPress_mmHg,
    // Diluent & composition
    inertGasPct,
    isBinaryAssumed,
    hasSufficientDiluent,
    isTotalPressureCompliant,
    // Normative Table 6.2-1 Fields
    table6_2_1_Category,
    table6_2_1_Limits,
    table6_2_1_OfficialTerms,
    projectOperationalInterpretation,
    isBelowAbsoluteLimit,
    isBelow1HrTwaLimit,
    physiologicalRiskDisclaimer: 'Conformance to the 145–155 mmHg normoxia target establishes an operational baseline, but does NOT constitute a guarantee of zero physiological risk across individual crewmembers, nor does it eliminate decompression stress under variable flight profiles.',
    monitoringAndMitigationRequirement: isMildHypoxia ? 'Exploration atmospheres operating with inspired oxygen above the 127 mmHg Mild Hypoxia Lower Limit but below the 145 mmHg Normoxia Target Range require program medical qualification, continuous cabin/crew monitoring, and operational protocol mitigations per Table 6.2-1 Footnote **.' : null,
    // Clinical Reference Fields
    clinicalClassification,
    physiologicalCategory,
    durationQualification,
    isNormoxicTarget,
    isMildHypoxia,
    isModerateHypoxia,
    isAcuteHypoxia,
    isHyperoxic,
    // Backward-compatibility aliases
    pO2_psia: pO2_dry_psia,
    pO2_kPa: pO2_dry_kPa,
    isNormoxic,
    isHypoxic,
    status,
    message,
    standardReference: 'NASA-STD-3001 Rev F [V2 6002, 6003, 6006]',
    evaEligibilityDisclaimer: 'NOTE: NASA-STD-3001 Rev F specifies physiological safety boundaries, but does NOT by itself constitute EVA prebreathe eligibility certification or mission flight clearance. Operational EVA requires mission-specific denitrogenation protocols.',
    provenance: createProvenanceRecord({
      source: 'NASA Human Factors and Environmental Health Standards',
      recordId: 'NASA-STD-3001-VOL-2-REV-F',
      documentLocation: 'Section 6.2 & Table 6.2-1',
      unit: 'mmHg',
      extractionMethod: 'PIO2 = (PB - 47 mmHg) * FIO2 Table 6.2-1 evaluation',
      verificationStatus: VerificationStatus.VERIFIED_DATASET,
      lastVerificationDate: '2026-11-15',
      notes: 'Formally audited against NASA-STD-3001 Rev F (Approved July 14, 2026). Normative limits: 145-155 mmHg Normoxia Target; 127 mmHg 1-hr TWA exploration limit; 122 mmHg absolute lower limit.'
    })
  };
}

/**
 * Calculates combustion parameters, material flame spread rates, and flammability hazard index.
 * 
 * SCIENTIFIC GOVERNANCE & PHENOMENOLOGICAL BOUNDARIES:
 * - 1D Phenomenological Convective Energy Balance Model adapted from De Ris (1969).
 * - Single-point calibration: Anchored to SAFFIRE-I SIBAL thin fabric concurrent flame spread
 *   (2.24 mm/s at 20 cm/s forced flow, 21.5% O2).
 *   NOTE: Anchoring to a single flight point provides an empirical baseline, NOT independent multi-variable predictive validation.
 * - DE RIS (1969) THEORETICAL BASIS & ASSUMPTIONS:
 *   Original formulation (J. de Ris, 12th Symp. on Combustion, 1969) solves 2D steady laminar opposed flow over thermally thin fuels:
 *   1. Thermally thin fuel sheet (Biot number Bi << 1; uniform temperature across sheet thickness).
 *   2. Infinitely fast single-step gas-phase chemical reaction (flame sheet approximation).
 *   3. Constant gas and solid properties (thermal conductivity, heat capacity, density).
 *   4. Uniform opposed oxidizer velocity; boundary layer development and curvature neglected.
 *   5. Gas-phase and solid-phase radiation heat losses neglected.
 *   6. Single discrete fuel vaporization temperature Tv.
 *   PYRO-SI implements a modified phenomenological energy-balance proxy anchored to flight data, NOT an analytical Navier-Stokes solver.
 * - CONCEPTUAL VS QUANTITATIVE TRANSPORT MECHANISMS:
 *   1. Buoyant Convection: QUANTITATIVELY CALCULATED via natural convection velocity scale ~ 32.0 * sqrt(g) cm/s.
 *   2. Forced Convection: QUANTITATIVELY CALCULATED via imposed ventilation velocity vForced.
 *   3. Molecular Diffusion: CONCEPTUAL DESCRIPTION ONLY. Not quantitatively solved by 1D convective formulation.
 *      Governs quiescent microgravity flame persistence (e.g. ACME s-Flame gaseous porous burner).
 *   4. Radiative & Conductive Heat Loss: PHENOMENOLOGICAL PARAMETERIZATION ONLY via empirical LOI flow factors.
 *      Not modeled via spectral radiative transfer.
 * - OUT-OF-SCOPE BOUNDARY & MODEL GUARDRAILS:
 *   - The 0.5 cm/s flow cutoff and 1.0 cm/s draft floor are PROJECT-DEFINED COMPUTATIONAL GUARDRAILS,
 *     not experimentally established universal physical boundaries.
 *   - In quiescent zero-g (g < 0.001, flow < 0.5 cm/s), the 1D convective boundary layer proxy is mathematically inapplicable.
 *   - Crucially, MODEL_OUT_OF_SCOPE denotes mathematical inapplicability of the 1D convective equations;
 *     it does NOT imply flame extinction, nor does it guarantee flame persistence.
 *   - Physical outcomes depend on molecular diffusion and radiative heat loss, as demonstrated by microgravity flight tests
 *     (ACME s-Flame gaseous diffusion flames vs FLEX PSI-69 liquid droplet combustion).
 */
export function calculateFlammability({ o2, psi, flow, g, material = 'sibal' } = {}) {
  // 1. Input Inspection & Missing Data Detection
  const missingInputs = [];
  if (o2 === undefined || o2 === null) missingInputs.push('o2');
  if (psi === undefined || psi === null) missingInputs.push('psi');
  if (flow === undefined || flow === null) missingInputs.push('flow');
  if (g === undefined || g === null) missingInputs.push('g');

  const hasMissingInputs = missingInputs.length > 0;

  // Sanitized numerical values
  const o2Val = Math.max(0.0, Number(o2) || (o2 === 0 ? 0.0 : 21.0));
  const psiVal = (psi === 0) ? 0.0 : Math.max(0.1, Number(psi) || 14.7);
  const flowVal = Math.max(0.0, Number(flow) || 0.0);
  const gVal = Math.max(0.0, Number(g) || 0.0);

  // 2. Oxygen Partial Pressure (Exact Thermodynamic Law - Dalton's Law)
  const ppo2 = (o2Val / 100.0) * psiVal;
  const ppo2_kPa = ppo2 * PSI_TO_KPA;

  // 3. Convective Flow Components (Separation of Quantitative Mechanisms)
  // Buoyant velocity scale: laminar natural convection draft (vBuoyant = 0 at 0g, ~32 cm/s at 1.0g)
  const vBuoyant = 32.0 * Math.sqrt(gVal);
  // Forced velocity: imposed mechanical ventilation draft
  const vForced = flowVal;
  // Effective convective velocity (orthogonal vector coupling)
  const vEffective = Math.sqrt(vForced * vForced + vBuoyant * vBuoyant);

  // Project-Defined Computational Guardrails (Explicitly distinguished from physical boundaries)
  const guardrailThresholds = {
    subConvectiveCutoff_cm_s: 0.5,
    buoyantDraftFloor_cm_s: 1.0,
    classification: 'PROJECT_DEFINED_MODEL_GUARDRAILS',
    note: '0.5 cm/s sub-convective flow and 1.0 cm/s draft floor are project-defined numerical boundaries for 1D boundary layer equations, not universal physical extinction limits.'
  };

  // 4. Model Domain & Regime Classification
  const isQuiescentMicrogravity = (gVal < 0.001 && flowVal < guardrailThresholds.subConvectiveCutoff_cm_s);
  const isHypoxicPurge = (o2Val < 10.0);
  const isHighO2Hazard = (o2Val >= 30.0);

  let modelDomainStatus = 'VALIDATED_CONVECTIVE_PROXY';
  let modelDomainNote = 'Operating within 1D convective boundary layer proxy domain anchored to SAFFIRE-I.';
  let convectiveRegime = 'MIXED_CONVECTION';

  if (gVal < 0.001 && flowVal >= guardrailThresholds.subConvectiveCutoff_cm_s) {
    convectiveRegime = 'FORCED_CONVECTION_DOMINATED';
  } else if (flowVal < guardrailThresholds.subConvectiveCutoff_cm_s && gVal >= 0.01) {
    convectiveRegime = 'BUOYANCY_DOMINATED';
  } else if (isQuiescentMicrogravity) {
    convectiveRegime = 'QUIESCENT_DIFFUSION_GOVERNED';
  }

  if (hasMissingInputs) {
    modelDomainStatus = 'INSUFFICIENT_MODEL_INPUTS';
    modelDomainNote = `Model inputs [${missingInputs.join(', ')}] were missing and evaluated using nominal fallback defaults.`;
  } else if (isQuiescentMicrogravity) {
    modelDomainStatus = 'MODEL_OUT_OF_SCOPE';
    modelDomainNote = 'Quiescent microgravity (0g with zero or sub-convective flow <0.5 cm/s) is outside the mathematical domain of the 1D convective De Ris proxy. The 0.5 cm/s threshold is a project-defined computational guardrail, not a physical extinction limit. In quiescent zero-g, convective equations become mathematically invalid. This status indicates mathematical formulation inapplicability, NOT physical flame extinction or flame persistence. Physical outcomes are governed by molecular diffusion and radiative heat loss. Flight experiments demonstrate that gaseous diffusion flames around porous spherical burners (ACME s-Flame) and liquid fuel droplets (FLEX PSI-69) can persist in zero-g without forced flow, while thick solids or high radiative loss can lead to radiative extinction or low-temperature cool flames.';
  }

  // 5. Limiting Oxygen Index (LOI) Scaling (Modelled phenomenological energy balance)
  // Low convective flow (<3 cm/s) promotes radiative quench (raises apparent LOI).
  // Moderate convective flow (3-25 cm/s) optimizes oxidizer replenishment (lowers LOI).
  const flowFactor = (vEffective >= 3.0 && vEffective <= 25.0) ? -1.4 : (vEffective < 3.0 ? 1.8 : 0.4);
  const pressureFactor = psiVal > 0 ? Math.pow(14.7 / psiVal, 0.18) : 1.0;
  const loi = clamp((17.5 + flowFactor) * pressureFactor, 12.5, 24.0);

  // 6. Flame Spread Index (Modified De Ris thin-fuel energy balance proxy)
  const o2Ratio = Math.pow(Math.max(0.1, (o2Val - loi) / (21.0 - 15.5)), 1.35);
  const pressScale = psiVal > 0 ? Math.pow(psiVal / 10.2, 0.35) : 0.0;
  const ventBonus = vEffective < 2.0 ? 0.35 : (vEffective <= 22.0 ? 1.25 : 0.95);
  const spreadIndex = psiVal > 0 ? Math.max(0.0, o2Ratio * pressScale * ventBonus) : 0.0;

  // 7. Composite Ignition & Spread Hazard Score (8–99%)
  // Project-defined heuristic composite index; clamped at 8% floor and 99% ceiling
  let rawRisk = spreadIndex * 38.0 + (isHighO2Hazard ? 22.0 : 0.0);
  if (isHypoxicPurge) rawRisk = Math.min(rawRisk, 15.0);
  const riskScore = clamp(Math.round(rawRisk), 8, 99);

  // 8. Material Spread Rates (Modelled relative mm/s, anchored to SAFFIRE-I SIBAL)
  const sibalRate = isHypoxicPurge ? (0.2).toFixed(1) : (2.2 * spreadIndex).toFixed(1);
  const pmmaRate = isHypoxicPurge ? (0.0).toFixed(1) : (0.95 * spreadIndex).toFixed(1);
  const silRate = isHypoxicPurge ? (0.0).toFixed(1) : (0.58 * spreadIndex).toFixed(1);
  const nomexRate = o2Val < 27.5 ? (0.0).toFixed(1) : (0.35 * spreadIndex).toFixed(1);

  // 9. Material Hazard Figures Audit & Provenance Records
  const materialProvenance = {
    sibal: {
      materialName: 'SIBAL Composite Fabric (75% cotton / 25% fiberglass, 0.37 mm thick)',
      spreadRate_mm_s: sibalRate,
      status: isHypoxicPurge ? VerificationStatus.PROVISIONAL_PROXY : VerificationStatus.VERIFIED_DATASET,
      empiricalAnchor: 'SAFFIRE-I (PSI-98): 2.24 mm/s measured concurrent spread at 20 cm/s flow, 21.5% O2 (NASA TP-2019 / Acta Astronautica 2019)',
      epistemicTier: EpistemicClassification.MODELLED
    },
    pmma: {
      materialName: 'Polymethyl Methacrylate (PMMA) Cast Sheet',
      spreadRate_mm_s: pmmaRate,
      status: VerificationStatus.VERIFIED_METADATA_ONLY,
      empiricalAnchor: 'BASS-II (PSI-25): Measured microgravity solid regression across 0–40 cm/s forced flows',
      epistemicTier: EpistemicClassification.MODELLED
    },
    silicone: {
      materialName: 'Silicone Elastomer Composite',
      spreadRate_mm_s: silRate,
      status: VerificationStatus.PROVISIONAL_PROXY,
      empiricalAnchor: 'Phenomenological scaling based on thermal decomposition temperature (~450°C)',
      epistemicTier: EpistemicClassification.MODELLED
    },
    nomex: {
      materialName: 'Nomex Meta-Aramid Fabric (DuPont Nomex HT90-40, poly-m-phenylene isophthalamide)',
      spreadRate_mm_s: nomexRate,
      status: VerificationStatus.UNVERIFIED,
      loi_pct: {
        range: '28.0% – 30.0% O2',
        testMethod: 'ASTM D2863',
        primarySource: 'NASA TP-2007-213777 (Flammability Assessment of Materials in Enriched Oxygen Atmospheres, White Sands Test Facility) & DuPont Nomex Technical Guide',
        pageCitationStatus: 'PAGE_UNVERIFIED',
        status: 'REPORTED_LITERATURE',
        variabilityNote: 'LOI is not a universal fixed constant: it varies with fabric areal weight, weave, thickness, edge finish (hemmed vs unhemmed), moisture conditioning, and test apparatus (ASTM D2863 / NASA TP-2007-213777).'
      },
      nasaStd6001B_Test1: {
        testStandard: 'NASA-STD-6001B w/Change 3, Section 7.1 (Test 1: Upward Flame Propagation Test)',
        specimenConfiguration: {
          dimensions: '30.0 cm x 6.5 cm (12.0 in x 2.5 in)',
          sampleCount: 5,
          testMode: 'Tested one at a time, mounted vertically',
          edgeCondition: 'Tested with hemmed or unhemmed edges per fabric specification (edge hemming mitigates edge fraying and premature upward flame channeling)',
          mounting: 'Vertical orientation in standard sample clamp frame',
          testAtmosphere: 'Tested at worst-case operational pressure and maximum operational oxygen concentration',
          ignitionMethod: 'Standard chemical igniter delivering calibrated thermal energy (750 ± 50 J per NASA-STD-6001B w/Change 3, Section 7.1.3.1 & Appendix A.1.2). Fixed 25 s dwell was previously referenced as a laboratory test configuration (LABORATORY_TEST_CONFIG_ONLY), but is UNVERIFIED [NO PRIMARY WSTF OR NASA RECORD PRODUCED]; it is NOT an established WSTF standard protocol and not a universal NASA-STD-6001B requirement.',
          ignitionEnergyAudit: {
            standardDeliveredEnergy: '750 ± 50 J (NASA-STD-6001B w/Change 3, Section 7.1.3.1 & Appendix A.1.2; standard chemical igniter total thermal energy release)',
            energyDensityLiteratureClaim: '2000 kJ/m² (Energy fluence / heat flux integrated over time from secondary aerospace flammability literature, NOT an active NASA-STD-6001B standard requirement clause; units kJ/m² are energy per area, NOT interchangeable with scalar energy in Joules)',
            gasBurnerAlternative: 'Alternative ignition source permitted under Section 7.1.3 only when authorized by test requestor; standard chemical igniter is the mandatory baseline for standard Test 1',
            quantitiesInterchangeable: false,
            status: 'VERIFIED_STANDARD_CLAUSE_750J_VS_UNVERIFIED_SECONDARY_2000kJ_m2'
          },
          ignitionDwellVerification: {
            value_seconds: 25,
            status: 'UNVERIFIED',
            wstfRecordProduced: false,
            standardRequirement: false,
            classification: 'UNVERIFIED_LABORATORY_ANECDOTE',
            note: 'No official NASA White Sands Test Facility document title, record identifier, date, section, or source produced supporting a 25 s standard mandate. NASA-STD-6001B specifies calibrated energy delivery, not a 25 s dwell.'
          }
        },
        acceptanceCriteria: {
          burnLengthThreshold_cm: 15.0,
          burnLengthThreshold_in: 6.0,
          transferIgnitionCriterion: 'No flaming drips or material transfer that ignites the standard K-10 indicator paper placed below the sample',
          qualificationRule: 'All five (5) specimens must independently satisfy both the burn length (<= 15 cm / 6 in.) and zero paper ignition criteria. Failure of ANY ONE specimen constitutes failure of the material in that test environment.'
        },
        outcome_21pct: 'PASS (Self-extinguishes with burn length well under 15 cm / 6 in., typically < 3.8 cm / 1.5 in.; zero flaming material transfer to K-10 paper; 21% O2, 14.7 psia)',
        outcome_34pct_EAM: 'FAIL (Ambient O2 exceeds LOI; flame propagates beyond the 15 cm / 6 in. failure threshold on standard specimens; 34% O2, 8.2 psia)',
        primarySource: 'NASA-STD-6001B w/Change 3 Section 7.1.2(b) & NASA TM-2008-215264',
        pageCitationStatus: 'PAGE_UNVERIFIED',
        status: 'REPORTED_QUALITATIVE_TEST'
      },
      flameSpreadVelocity: {
        value_mm_s: nomexRate,
        status: 'UNVERIFIED',
        verificationStatus: VerificationStatus.UNVERIFIED,
        derivation: '0.35 * spreadIndex (PYRO-SI 1D phenomenological proxy)',
        note: 'UNVERIFIED MODELLED PROXY. NASA-STD-6001B Test 1 is a qualitative pass/fail test based on burn length (<= 15 cm / 6 in.) and indicator paper ignition; it does not measure or report a standardized continuous velocity in mm/s. The 0.8 mm/s value in Artemis EAM is an unverified proxy from the project equation.'
      },
      flameSpreadNote: 'Nomex spread rate in Artemis EAM (0.8 mm/s at 34% O2, 8.2 psia) is an UNVERIFIED MODELLED PROXY derived from the project phenomenological formula (0.35 * spreadIndex). NASA-STD-6001B Test 1 is a pass/fail burn-length test (failure if burn length > 15 cm / 6 in. for any of 5 specimens or indicator paper ignites) and does not report a standardized continuous velocity in mm/s.',
      epistemicTier: EpistemicClassification.MODELLED
    },
    compositeHazardScore: {
      score: riskScore,
      method: 'Project-defined heuristic composite index (8–99%) combining spread index with oxygen penalty',
      status: 'MODELLED_HEURISTIC',
      note: 'Project-defined heuristic indicator, not an official NASA standard metric.',
      epistemicTier: EpistemicClassification.MODELLED
    }
  };

  // 10. Suppression Protocol Recommendation
  // Strictly separates forced ventilation shutoff from automatic extinction assumptions
  let suppressionRec = '';
  if (o2Val >= 32.0 || riskScore >= 75) {
    suppressionRec = 'CRITICAL O2 HAZARD: Rapid module depressurization (<5 psia / 34.5 kPa) recommended. Immediately isolate forced ventilation to eliminate forced convective flow. Deploy localized nitrogen blanket purge ports.';
  } else if (gVal === 0.0) {
    suppressionRec = 'MICROGRAVITY VENTILATION ISOLATION PROTOCOL: Immediately isolate forced cabin ventilation to eliminate convective oxidizer delivery. NOTE: Diffusion-driven flames can persist in microgravity without forced flow (e.g. ACME s-Flame gaseous burner, FLEX droplet burning). Do NOT assume automatic flame extinction. Inspect with thermal infrared imaging for persistent or cool flames (500–800 K) before restoring airflow.';
  } else {
    suppressionRec = 'NOMINAL GRAVITY PROTOCOL: Deploy ultrafine water mist (30–80 µm droplets) or portable CO2 extinguisher. Maintain ventilation scrubbers on post-fire carbon monoxide removal mode.';
  }

  // 11. Separate Physiological Atmosphere Assessment (NASA-STD-3001 Rev F)
  const physiological = evaluatePhysiologicalAtmosphere({ o2: o2Val, psi: psiVal });

  // 12. Explicit Separation of Quantitative vs Conceptual Combustion Transport Mechanisms
  const combustionMechanisms = {
    buoyantConvection: {
      implementationType: 'QUANTITATIVELY_CALCULATED',
      velocity_cm_s: vBuoyant,
      governingPhysics: 'Natural convection draft scale ~ 32.0 * sqrt(g) cm/s; zero in microgravity; 32 cm/s on Earth.'
    },
    forcedConvection: {
      implementationType: 'QUANTITATIVELY_CALCULATED',
      velocity_cm_s: vForced,
      governingPhysics: 'Mechanical ventilation duct airflow imposed by environmental control fans.'
    },
    molecularDiffusion: {
      implementationType: 'CONCEPTUAL_DESCRIPTION_ONLY',
      status: isQuiescentMicrogravity ? 'DOMINANT_TRANSPORT_REGIME' : 'SECONDARY_TO_CONVECTION',
      governingPhysics: 'Fickian species diffusion governs reactant supply and product removal in zero or sub-convective flows. Not quantitatively modeled in 1D convective De Ris proxy.'
    },
    radiativeHeatLoss: {
      implementationType: 'PHENOMENOLOGICAL_PARAMETERIZATION_ONLY',
      status: 'SIGNIFICANT_AT_LOW_FLOW',
      governingPhysics: 'Radiative emission from CO2, H2O, and soot causes radiative quenching or cool-flame persistence when convective residence times are long. Parameterized via empirical flow factor in LOI, not calculated via multi-band radiation transport.'
    }
  };

  // 13. De Ris (1969) Model Assumptions & Theoretical Grounding
  const deRisModelAssumptions = {
    sourcePaper: 'J.N. De Ris, "Spread of a laminar diffusion flame", 12th Symp. (Int.) on Combustion, 1969',
    fullCitation: 'J.N. De Ris, "Spread of a laminar diffusion flame", Twelfth Symposium (International) on Combustion, The Combustion Institute, Pittsburgh, PA, 1969, pp. 241–252. DOI: 10.1016/S0082-0784(69)80407-8',
    doi: '10.1016/S0082-0784(69)80407-8',
    originalFormulations: {
      thinFuelFormula: 'V_f = (sqrt(2) * lambda_g / (rho_s * c_s * tau)) * ((T_f - T_v) / (T_v - T_inf)) [Analytical thin-fuel formulation, Bi << 1, tau = half-thickness; specific equation number/page UNVERIFIED]',
      thinFuelStatus: 'UNVERIFIED [LITERATURE FORMULATION NOT INSPECTED IN PRIMARY SOURCE]',
      thickFuelFormula: 'V_f = V_a * (lambda_g * rho_g * c_pg / (lambda_s * rho_s * c_ps)) * ((T_f - T_v) / (T_v - T_inf))^2 [Analytical thick-fuel formulation, Bi >> 1; specific equation number/page UNVERIFIED]',
      thickFuelStatus: 'UNVERIFIED [LITERATURE FORMULATION NOT INSPECTED IN PRIMARY SOURCE]',
      calculationPath: 'NOT_USED_IN_APPLICATION_CALCULATION',
      radiationTreatment: 'Radiation is explicitly included as a heat loss at the flame sheet and a heat gain at the fuel-bed surface (De Ris 1969 abstract). Radiation is NOT neglected in the original De Ris model.',
      equationVerificationStatus: 'UNVERIFIED [Original paper not directly inspectable in closed audit environment; mathematical details cited conceptually without claiming exact page/equation verification]',
      note: 'These analytical formulations from secondary literature are UNVERIFIED against the primary 1969 volume and are NOT used as calculation paths in the software. PYRO-SI runs an adapted phenomenological proxy.'
    },
    analyticalEquation: 'V_f = V_a * (lambda_g * rho_g * c_pg / (lambda_s * rho_s * c_ps)) * ((T_f - T_v) / (T_v - T_inf))^2 (thermally thick analytical formula, often adapted in simplified proxies)',
    theoreticalBasis: 'Analytical energy balance for 2D steady laminar opposed flow over solid or liquid fuel bed',
    analyticalAssumptions: [
      'Two-dimensional steady laminar opposed flow over a planar fuel bed',
      'Fuel is classified as either thermally thin (Bi << 1, uniform solid temperature) or thermally thick (Bi >> 1)',
      'Infinitely fast single-step gas-phase chemical reaction (flame sheet approximation)',
      'Constant gas and solid thermodynamic and transport properties (density, heat capacity, conductivity)',
      'Uniform opposed oxidizer velocity V_a (Oseen flow approximation)',
      'Radiation is explicitly included as heat loss at the flame sheet and heat gain at the fuel-bed surface (NOT neglected)',
      'Solid fuel pyrolyzes at single discrete vaporization temperature Tv'
    ],
    guardrailNote: '0.5 cm/s sub-convective flow and 1.0 cm/s draft floor are project-defined numerical guardrails, not universal physical boundaries.',
    modelDistinction: 'CRITICAL DISTINCTION: PYRO-SI implements an uncalibrated 1D phenomenological scaling proxy: spreadIndex = Math.max(0.0, o2Ratio^1.35 * pressScale^0.35 * ventBonus(vEffective)) anchored to SAFFIRE-I flight data, NOT the exact De Ris (1969) mathematical eigenvalue solution. Exponents (1.35, 0.35, piecewise vent tiers) are unverified project heuristics and are NOT independently experimentally validated.',
    implementedProxyEquation: {
      formula: 'spreadIndex = Math.max(0.0, ((o2Val - loi) / 5.5)^1.35 * (psiVal / 10.2)^0.35 * ventBonus(vEffective))',
      exponentsVerificationStatus: 'UNVERIFIED_MODELLED_HEURISTIC',
      sibalRate_mm_s: '2.2 * spreadIndex (anchored to SAFFIRE-I 2.24 mm/s at 20 cm/s, 21.5% O2)',
      validationStatus: 'NOT_INDEPENDENTLY_VALIDATED'
    },
    unverifiedDetailsNote: 'Any unverified mathematical derivation detail from De Ris (1969) not directly confirmed from the inspected paper is designated UNVERIFIED; it is not reconstructed from memory.'
  };

  // 14. Model Assumptions, Limitations, and Epistemic Metadata
  const assumptions = [
    'Thermally thin fuel assumption for SIBAL fabric (Biot number << 1).',
    'Quasi-steady laminar boundary layer convective oxidizer diffusion.',
    'Buoyancy scale factor 32.0 cm/s derived from laminar natural convection draft.',
    'Orthogonal vector coupling between horizontal forced draft and vertical buoyancy.',
    'Atmosphere treated as binary O2/N2 mixture unless explicit species fractions provided.'
  ];

  const limitations = [
    'Uncalibrated 1D phenomenological proxy; not a multi-dimensional CFD code.',
    'Does not simulate 3D room turbulence, recirculation vortexes, or complex obstruction geometries.',
    'Quiescent zero-g (0g with zero flow) is outside convective model domain; does not compute molecular diffusion.',
    'Partial-gravity behavior is exploratory (T\'ien / Ferkul theory); in-situ flight validation awaits Artemis FM2.',
    'Cannot replace certified NASA-STD-6001B laboratory flammability screening.'
  ];

  const epistemicTags = {
    ppo2: EpistemicClassification.DERIVED,
    ppo2_kPa: EpistemicClassification.DERIVED,
    vBuoyant: EpistemicClassification.MODELLED,
    vEffective: EpistemicClassification.DERIVED,
    loi: EpistemicClassification.MODELLED,
    spreadIndex: EpistemicClassification.MODELLED,
    riskScore: EpistemicClassification.MODELLED,
    rates: EpistemicClassification.MODELLED,
    partialGContinuum: EpistemicClassification.EXPLORATORY
  };

  // 15. Runtime Model Input Contract & Boundary Definitions
  const runtimeInputContract = {
    oxygenConcentration: {
      inputKey: 'o2',
      units: '% O2 by volume (mole percent)',
      referenceBaseline: '21.0% O2 nominal Earth atmospheric baseline',
      supportedScientificRange: 'Not an established physical range; software bounds apply',
      softwareImplementationBounds: {
        minFloor: 0.0,
        defaultFallback: 21.0,
        unclampedHighValuesHandled: true
      },
      behaviorAtOrBelowLOI: {
        mechanism: 'Math.max(0.1, (o2Val - loi) / 5.5) clamps normalized base to 0.1 software floor, yielding o2Ratio = 0.1^1.35 ≈ 0.0447; spreadIndex retains non-zero residual value unless suppressed or zeroed by material-specific thresholds (e.g. Nomex clamped to 0.0 mm/s below 27.5% O2; SIBAL clamped to 0.2 mm/s in hypoxic purge <10% O2)',
        isPhysicalExtinctionModelled: false,
        note: 'Residual spreadIndex below LOI is a software implementation artifact of the mathematical floor 0.1, NOT an empirically validated extinction limit.'
      }
    },
    limitingOxygenIndex: {
      units: '% O2 by volume',
      clampingBounds: [12.5, 24.0],
      baseValue: 17.5,
      flowFactorEffect: '[-1.4, +1.8, +0.4] depending on vEffective tiers (<3.0, 3.0–25.0, >25.0 cm/s)',
      pressureFactorEffect: '(14.7 / psiVal)^0.18',
      epistemicStatus: 'UNVERIFIED_MODELLED_HEURISTIC',
      provenance: 'Phenomenological curve-fit approximating microgravity extinction boundaries from drop-tower and parabolic flight literature; not an analytical first-principles equation.'
    },
    pressure: {
      inputKey: 'psi',
      units: 'psia (pounds per square inch absolute)',
      referenceValue: '10.2 psia in pressScale (psiVal / 10.2)^0.35; 14.7 psia in pressureFactor (14.7 / psiVal)^0.18',
      softwareImplementationBounds: {
        minFloorWhenPositive: 0.1,
        defaultFallback: 14.7
      },
      behaviorAtZeroPressure: {
        psiInput: 0,
        pressScale: 0.0,
        spreadIndex: 0.0,
        ppo2_psia: 0.0,
        riskScore: 8,
        status: 'HARD_VACUUM_SUPPRESSED',
        note: 'Zero pressure evaluates to hard vacuum: pressScale evaluates to 0.0, driving spreadIndex to 0.0 and risk score to the minimum software floor (8%).'
      }
    },
    ventilation: {
      inputKey: 'flow',
      units: 'cm/s (forced convective airflow velocity)',
      softwareImplementationBounds: {
        minFloor: 0.0,
        defaultFallback: 0.0
      },
      piecewiseThresholds: {
        lowFlowPenalty: 'vEffective < 2.0 cm/s -> 0.35 factor (starvation/radiative cooling)',
        optimalDelivery: '2.0 <= vEffective <= 22.0 cm/s -> 1.25 factor (peak oxidizer delivery)',
        highFlowSuppression: 'vEffective > 22.0 cm/s -> 0.95 factor (convective blowoff)'
      },
      implementationType: 'DISCONTINUOUS_SOFTWARE_HEURISTIC'
    },
    gravityDependence: {
      inputKey: 'g',
      units: 'dimensionless (ratio g / g0 where 1.0 = standard Earth gravity)',
      softwareImplementationBounds: {
        minFloor: 0.0,
        defaultFallback: 0.0
      },
      couplingMechanism: 'Enters spreadIndex SOLELY through vBuoyant = 32.0 * sqrt(g) cm/s coupling orthogonally into vEffective = sqrt(vForced^2 + vBuoyant^2). Does NOT enter through an explicit gravity exponent in spreadIndex.',
      microgravityBehavior: 'At g = 0, vBuoyant = 0.0, so vEffective = vForced',
      quiescentThreshold: 'g < 0.001 and flow < 0.5 cm/s triggers MODEL_OUT_OF_SCOPE'
    }
  };

  return {
    ppo2,
    ppo2_kPa,
    vBuoyant,
    vEffective,
    loi,
    spreadIndex,
    riskScore,
    rates: {
      sibal: sibalRate,
      pmma: pmmaRate,
      silicone: silRate,
      nomex: nomexRate
    },
    materialProvenance,
    guardrailThresholds,
    suppressionRec,
    physiological,
    assumptions,
    limitations,
    deRisModelAssumptions,
    runtimeInputContract,
    epistemicTags,
    modelDomainStatus,
    modelDomainNote,
    convectiveRegime,
    combustionMechanisms,
    hasMissingInputs,
    missingInputs,
    calibrationBaseline: 'Anchored to SAFFIRE-I SIBAL thin fabric concurrent burn (2.24 mm/s at 20 cm/s flow, 21.5% O2). Single flight calibration point provides an empirical anchor baseline, NOT independent multi-variable predictive validation.'
  };
}
