/**
 * Phase 2.2.1 Independent Evidence and Claim Audit Tests
 * 
 * Verifies:
 * 1. NASA-STD-3001 Rev F Table 6.2-1 exact thresholds:
 *    - Normoxia target: 145–155 mmHg (optimal baseline; no zero-risk guarantee).
 *    - Exploration 1-hr TWA lower limit: 127 mmHg.
 *    - Absolute lower limit: 122 mmHg.
 *    - Monitoring & mitigation qualification for exploration atmospheres (127–144 mmHg).
 * 2. Investigation identities & accessions:
 *    - PSI-21 verified as ACME CLD Flame (Coflow Laminar Diffusion Flame).
 *    - ACME s-Flame verified as Structure and Response of Spherical Flames (gaseous spherical burner).
 *    - FLEX (PSI-69) verified as Liquid Droplet Combustion (d^2 law, cool flames; not interchangeable with s-Flame).
 * 3. Combustion transport mechanism decomposition:
 *    - buoyantConvection & forcedConvection: QUANTITATIVELY_CALCULATED.
 *    - molecularDiffusion: CONCEPTUAL_DESCRIPTION_ONLY.
 *    - radiativeHeatLoss: PHENOMENOLOGICAL_PARAMETERIZATION_ONLY.
 *    - 0.5 cm/s and 1.0 cm/s thresholds: PROJECT_DEFINED_MODEL_GUARDRAILS.
 *    - MODEL_OUT_OF_SCOPE denotes mathematical proxy inapplicability, NOT flame extinction.
 *    - Single-point calibration is an empirical anchor baseline, NOT predictive validation.
 *    - De Ris (1969) analytical assumptions documented.
 * 4. Material hazard figures & epistemic status:
 *    - Nomex LOI (28–30%): REPORTED_LITERATURE (ASTM D2863 / NASA TP-2007-213777).
 *    - Nomex NASA-STD-6001B Test 1: REPORTED_QUALITATIVE_TEST (PASS 21%, FAIL 34%).
 *    - Nomex 0.8 mm/s spread rate: UNVERIFIED_MODELLED_PROXY (formulaic proxy, not measured in Test 1).
 *    - Composite hazard score: MODELLED_HEURISTIC (project-defined 8–99% index).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluatePhysiologicalAtmosphere, calculateFlammability, PSI_TO_KPA } from '../../src/modules/flammability-simulator/physics-model.js';
import { VerificationStatus, EpistemicClassification } from '../../src/utils/provenance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cataloguePath = path.resolve(__dirname, '../../src/data/reference/psi-investigations.json');

export function runPhase221EvidenceTests(assert) {
  // =========================================================================
  // 1. NASA-STD-3001 Rev F Table 6.2-1 Limits & Interpretations
  // =========================================================================
  const issAtm = evaluatePhysiologicalAtmosphere({ o2: 21.0, psi: 14.7 });
  assert(issAtm.table6_2_1_Category === 'NORMOXIA_TARGET', 'ISS nominal must be categorized as Table 6.2-1 NORMOXIA_TARGET');
  assert(issAtm.table6_2_1_Limits.normoxiaTarget_mmHg.min === 145.0, 'Table 6.2-1 normoxia min must be 145.0 mmHg');
  assert(issAtm.table6_2_1_Limits.normoxiaTarget_mmHg.max === 155.0, 'Table 6.2-1 normoxia max must be 155.0 mmHg');
  assert(issAtm.table6_2_1_Limits.explorationTwa1HrLowerLimit_mmHg === 127.0, 'Table 6.2-1 exploration 1-hr TWA limit must be 127.0 mmHg');
  assert(issAtm.table6_2_1_Limits.absoluteLowerLimit_mmHg === 122.0, 'Table 6.2-1 absolute lower limit must be 122.0 mmHg');
  assert(issAtm.physiologicalRiskDisclaimer.includes('does NOT constitute a guarantee of zero physiological risk'), 'Must include physiological risk disclaimer');

  // Artemis Exploration Atmosphere: 8.2 psia, 34% O2 -> PIO2 ~ 128.2 mmHg
  const artemisAtm = evaluatePhysiologicalAtmosphere({ o2: 34.0, psi: 8.2 });
  assert(artemisAtm.table6_2_1_Category === 'QUALIFIED_EXPLORATION_MILD_HYPOXIA', 'Artemis EAM must be classified as Table 6.2-1 QUALIFIED_EXPLORATION_MILD_HYPOXIA');
  assert(artemisAtm.isMildHypoxia, 'Artemis EAM must set isMildHypoxia flag');
  assert(!artemisAtm.isNormoxicTarget, 'Artemis EAM must NOT be classified as normoxia target');
  assert(!artemisAtm.isBelow1HrTwaLimit, 'Artemis EAM (128.2 mmHg) must NOT be below 1-hr TWA limit (127 mmHg)');
  assert(!artemisAtm.isBelowAbsoluteLimit, 'Artemis EAM must NOT be below absolute lower limit (122 mmHg)');
  assert(artemisAtm.monitoringAndMitigationRequirement !== null, 'Exploration atmospheres must specify monitoring and mitigation requirement');

  // Between 122 and 127 mmHg (Breaches 1-hour TWA limit, but above absolute lower limit)
  // Let's create an atmosphere with PIO2 ~ 125 mmHg: (PB - 47) * FIO2 = 125 -> (PB - 47) = 125 / 0.25 = 500 mmHg -> PB = 547 mmHg (10.57 psi)
  const twaBreachAtm = evaluatePhysiologicalAtmosphere({ o2: 25.0, psi: 547.0 / (PSI_TO_KPA * 7.50061683) });
  assert(twaBreachAtm.table6_2_1_Category === 'BELOW_TWA_LOWER_LIMIT', 'Atmosphere in 122–127 mmHg must be categorized as BELOW_TWA_LOWER_LIMIT');
  assert(twaBreachAtm.isBelow1HrTwaLimit, 'Must set isBelow1HrTwaLimit flag');
  assert(!twaBreachAtm.isBelowAbsoluteLimit, 'Must NOT set isBelowAbsoluteLimit when above 122 mmHg');

  // Below 122 mmHg (Absolute lower limit breach)
  // e.g. 15% O2 at 12 psi: (620.4 - 47) * 0.15 = 86.0 mmHg
  const absBreachAtm = evaluatePhysiologicalAtmosphere({ o2: 15.0, psi: 12.0 });
  assert(absBreachAtm.table6_2_1_Category === 'BELOW_ABSOLUTE_LOWER_LIMIT', 'Atmosphere with PIO2 < 122 mmHg must be categorized as BELOW_ABSOLUTE_LOWER_LIMIT');
  assert(absBreachAtm.isBelowAbsoluteLimit, 'Must set isBelowAbsoluteLimit flag');
  assert(absBreachAtm.isBelow1HrTwaLimit, 'Must set isBelow1HrTwaLimit flag');

  // Above 155 mmHg (Hyperoxia)
  const hyperoxicAtm = evaluatePhysiologicalAtmosphere({ o2: 40.0, psi: 14.7 });
  assert(hyperoxicAtm.table6_2_1_Category === 'ABOVE_NORMOXIA_TARGET', 'Atmosphere with PIO2 > 155 mmHg must be categorized as ABOVE_NORMOXIA_TARGET');
  assert(hyperoxicAtm.isHyperoxic, 'Must set isHyperoxic flag');

  // =========================================================================
  // 2. NASA PSI Investigation Accessions & Non-Interchangeability
  // =========================================================================
  const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));

  // PSI-21 Audit: Verified as ACME CLD Flame (Coflow Laminar Diffusion Flame)
  const cld = catalogue.find(inv => inv.id === 'PSI-21');
  assert(cld !== undefined, 'PSI-21 must exist in catalogue');
  assert(cld.code === 'ACME: CLD Flame', `PSI-21 code must be 'ACME: CLD Flame', found '${cld.code}'`);
  assert(cld.title === 'Coflow Laminar Diffusion Flame', `PSI-21 title must be 'Coflow Laminar Diffusion Flame', found '${cld.title}'`);
  assert(cld.fuelType === 'Gaseous', 'CLD Flame fuelType must be Gaseous');
  assert(cld.provenance.notes.includes('ACME CLD Flame'), 'PSI-21 provenance notes must document CLD Flame attribution');

  // ACME s-Flame Audit: Structure and Response of Spherical Flames
  const sflame = catalogue.find(inv => inv.id === 'NASA-ACME-SFLAME');
  assert(sflame !== undefined, 'ACME s-Flame must be catalogued in reference dataset');
  assert(sflame.title === 'Structure and Response of Spherical Flames', `s-Flame title must be 'Structure and Response of Spherical Flames', found '${sflame.title}'`);
  assert(sflame.fuelType === 'Gaseous', 's-Flame fuelType must be Gaseous');
  assert(sflame.fuelDetails.includes('porous spherical burners'), 's-Flame must specify porous spherical burner geometry');

  // FLEX Audit: Flame Extinguishment Experiment (Liquid Droplets)
  const flex = catalogue.find(inv => inv.id === 'PSI-69');
  assert(flex !== undefined, 'FLEX (PSI-69) must exist in catalogue');
  assert(flex.fuelType === 'Liquid', 'FLEX fuelType must be Liquid (isolated droplet combustion)');
  assert(flex.title === 'Flame Extinguishment Experiment', 'FLEX title must be Flame Extinguishment Experiment');
  assert(flex.facility.includes('CIR') || flex.rack.includes('CIR'), 'FLEX must be hosted in CIR / MDCA');

  // Distinction: FLEX and s-Flame must have distinct fuel states and geometries
  assert(flex.fuelType !== sflame.fuelType || flex.id !== sflame.id, 'FLEX (liquid droplets) and s-Flame (gaseous burner) must not be conflated');

  // =========================================================================
  // 3. Combustion Transport Mechanisms & Model Boundaries
  // =========================================================================
  const flam1g = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 10.0, g: 1.0 });

  // Transport mechanism implementation status separation
  assert(flam1g.combustionMechanisms.buoyantConvection.implementationType === 'QUANTITATIVELY_CALCULATED', 'buoyantConvection must be QUANTITATIVELY_CALCULATED');
  assert(flam1g.combustionMechanisms.forcedConvection.implementationType === 'QUANTITATIVELY_CALCULATED', 'forcedConvection must be QUANTITATIVELY_CALCULATED');
  assert(flam1g.combustionMechanisms.molecularDiffusion.implementationType === 'CONCEPTUAL_DESCRIPTION_ONLY', 'molecularDiffusion must be CONCEPTUAL_DESCRIPTION_ONLY');
  assert(flam1g.combustionMechanisms.radiativeHeatLoss.implementationType === 'PHENOMENOLOGICAL_PARAMETERIZATION_ONLY', 'radiativeHeatLoss must be PHENOMENOLOGICAL_PARAMETERIZATION_ONLY');

  // Project-defined model guardrails
  assert(flam1g.guardrailThresholds.classification === 'PROJECT_DEFINED_MODEL_GUARDRAILS', 'Thresholds must be classified as PROJECT_DEFINED_MODEL_GUARDRAILS');
  assert(flam1g.guardrailThresholds.subConvectiveCutoff_cm_s === 0.5, 'subConvectiveCutoff must be 0.5 cm/s');
  assert(flam1g.guardrailThresholds.buoyantDraftFloor_cm_s === 1.0, 'buoyantDraftFloor must be 1.0 cm/s');

  // Epistemic meaning of MODEL_OUT_OF_SCOPE
  const quiescent0g = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 0.0, g: 0.0 });
  assert(quiescent0g.modelDomainStatus === 'MODEL_OUT_OF_SCOPE', 'Quiescent 0g must return MODEL_OUT_OF_SCOPE');
  assert(quiescent0g.modelDomainNote.includes('mathematical formulation inapplicability, NOT physical flame extinction'), 'MODEL_OUT_OF_SCOPE must explicitly disclaim automatic extinction');
  assert(quiescent0g.modelDomainNote.includes('ACME s-Flame'), 'MODEL_OUT_OF_SCOPE must cite s-Flame for gaseous diffusion persistence');
  assert(quiescent0g.modelDomainNote.includes('FLEX PSI-69'), 'MODEL_OUT_OF_SCOPE must cite FLEX for droplet burning');

  // Calibration baseline: Empirical anchor != predictive validation
  assert(flam1g.calibrationBaseline.includes('empirical anchor baseline, NOT independent multi-variable predictive validation'), 'Must disclaim predictive validation from single anchor');

  // De Ris (1969) theoretical basis and analytical assumptions
  assert(flam1g.deRisModelAssumptions.sourcePaper.toLowerCase().includes('de ris'), 'Must cite De Ris 1969 paper');
  assert(Array.isArray(flam1g.deRisModelAssumptions.analyticalAssumptions), 'Must list analytical assumptions of De Ris model');
  assert(flam1g.deRisModelAssumptions.analyticalAssumptions.length >= 5, 'Must disclose at least 5 analytical assumptions of De Ris');

  // =========================================================================
  // 4. Material Hazard Figures & Epistemic Provenance
  // =========================================================================
  const lunarFlam = calculateFlammability({ o2: 34.0, psi: 8.2, flow: 8.0, g: 0.166 });
  assert(lunarFlam.materialProvenance !== undefined, 'Result must provide materialProvenance object');

  // Nomex audit
  const nomexProv = lunarFlam.materialProvenance.nomex;
  assert(nomexProv !== undefined, 'materialProvenance must include nomex');
  assert(nomexProv.status === VerificationStatus.UNVERIFIED, 'Nomex modelled spread rate must be tagged as UNVERIFIED');
  assert(nomexProv.loi_pct.range.includes('28.0%') && nomexProv.loi_pct.range.includes('30.0%'), 'Nomex LOI must cite 28.0% - 30.0% O2');
  assert(nomexProv.loi_pct.testMethod.includes('ASTM D2863'), 'Nomex LOI must cite ASTM D2863 test method');
  assert(nomexProv.nasaStd6001B_Test1.outcome_21pct.includes('PASS'), 'Nomex NASA-STD-6001B Test 1 at 21% O2 must be PASS');
  assert(nomexProv.nasaStd6001B_Test1.outcome_34pct_EAM.includes('FAIL'), 'Nomex NASA-STD-6001B Test 1 at 34% O2 must be FAIL (propagates)');
  assert(nomexProv.flameSpreadNote.includes('UNVERIFIED MODELLED PROXY'), 'Nomex flameSpreadNote must declare rate as UNVERIFIED MODELLED PROXY');

  // SIBAL audit
  const sibalProv = lunarFlam.materialProvenance.sibal;
  assert(sibalProv.empiricalAnchor.includes('SAFFIRE-I (PSI-98)'), 'SIBAL must cite SAFFIRE-I anchor');
  assert(sibalProv.empiricalAnchor.includes('2.24 mm/s'), 'SIBAL must cite 2.24 mm/s measured baseline');

  // PMMA audit
  const pmmaProv = lunarFlam.materialProvenance.pmma;
  assert(pmmaProv.empiricalAnchor.includes('BASS-II (PSI-25)'), 'PMMA must cite BASS-II anchor');

  // Composite hazard score
  const hazardProv = lunarFlam.materialProvenance.compositeHazardScore;
  assert(hazardProv.status === 'MODELLED_HEURISTIC', 'Composite hazard score must be classified as MODELLED_HEURISTIC');
}
