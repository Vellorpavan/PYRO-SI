/**
 * Phase 2.2.2 Final Evidence Traceability and Baseline Freeze Tests
 * 
 * Verifies:
 * 1. NASA Table 6.2-1 exact terminology:
 *    - "Normoxia Target Range" (145–155 mmHg, Indefinite)
 *    - "Mild Hypoxia Lower Limit" (127 mmHg, Indefinite with monitoring**)
 *    - Footnote ** (monitoring & mitigation plan requirement)
 *    - Footnote **** (1-hour TWA; 122 mmHg absolute lower limit)
 *    - Visibly separates project-defined exploration band from NASA requirements.
 * 2. PSI accession traceability:
 *    - PSI-21 verified as ACME CLD Flame (PIs: Long, Smooke, Sunderland; authentic repository URL).
 *    - s-Flame official title verified (Structure and Response of Spherical Flames, PI: C.K. Law).
 *    - Standalone NASA accession ID for s-Flame marked UNVERIFIED; internal ID clearly distinguished.
 * 3. FLEX evidence boundary:
 *    - Cool-flame discovery traced to Nayagam et al. (2012, Combustion and Flame).
 *    - Liquid-droplet combustion strictly separated from gaseous spherical burner flames.
 * 4. De Ris (1969) & material provenance:
 *    - Traceable literature citation (DOI 10.1016/S0082-0784(69)80407-7) and analytical equation.
 *    - Project-defined computational guardrails explicitly designated.
 *    - Nomex HT90-40 LOI (28–30% O2) traced to ASTM D2863 / NASA TP-2007-213777.
 *    - NASA-STD-6001B Test 1 qualitative ratings (PASS at 21%, FAIL at 34%).
 *    - 0.8 mm/s value kept UNVERIFIED; 85% score kept MODELLED_HEURISTIC.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluatePhysiologicalAtmosphere, calculateFlammability } from '../../src/modules/flammability-simulator/physics-model.js';
import { VerificationStatus } from '../../src/utils/provenance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cataloguePath = path.resolve(__dirname, '../../src/data/reference/psi-investigations.json');

export function runPhase222TraceabilityTests(assert) {
  // =========================================================================
  // 1. NASA Table 6.2-1 Official Wording & Footnote Traceability
  // =========================================================================
  const iss = evaluatePhysiologicalAtmosphere({ o2: 21.0, psi: 14.7 });
  assert(iss.table6_2_1_OfficialTerms !== undefined, 'Result must provide table6_2_1_OfficialTerms object');
  assert(iss.table6_2_1_OfficialTerms.normoxiaTargetRange.includes('145 – 155 mmHg'), 'Official term must state Normoxia Target Range 145 – 155 mmHg');
  assert(iss.table6_2_1_OfficialTerms.normoxiaTargetDuration === 'Indefinite', 'Normoxia Target Range duration must be Indefinite');
  assert(iss.table6_2_1_OfficialTerms.mildHypoxiaLowerLimit.includes('127 mmHg'), 'Official term must state Mild Hypoxia Lower Limit 127 mmHg');
  assert(iss.table6_2_1_OfficialTerms.mildHypoxiaDuration.includes('Indefinite with monitoring**'), 'Mild Hypoxia duration must be Indefinite with monitoring**');
  assert(iss.table6_2_1_OfficialTerms.footnoteDoubleStar.includes('health monitoring and mitigation plan are required'), 'Must contain exact Table 6.2-1 Footnote ** wording');
  assert(iss.table6_2_1_OfficialTerms.footnoteQuadStar.includes('1-hour time-weighted average') && iss.table6_2_1_OfficialTerms.footnoteQuadStar.includes('122 mmHg'), 'Must contain exact Table 6.2-1 Footnote **** wording with 1-hr TWA and 122 mmHg');

  // Artemis EAM Project Operational Interpretation Separation
  const eam = evaluatePhysiologicalAtmosphere({ o2: 34.0, psi: 8.2 });
  assert(eam.projectOperationalInterpretation !== undefined, 'Must provide projectOperationalInterpretation object');
  assert(eam.projectOperationalInterpretation.note.includes('project-defined exploration band'), 'Must declare 127–144.9 mmHg as project-defined, not a NASA category');
  assert(eam.projectOperationalInterpretation.note.includes('Footnote **'), 'Must link operational band to Table 6.2-1 Footnote ** monitoring requirement');

  // =========================================================================
  // 2. NASA PSI Accession Traceability: CLD Flame vs s-Flame
  // =========================================================================
  const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));

  // CLD Flame Accession Traceability
  const cld = catalogue.find(inv => inv.id === 'PSI-21');
  assert(cld !== undefined, 'PSI-21 must exist in catalog');
  assert(cld.title === 'Coflow Laminar Diffusion Flame', 'PSI-21 title must be Coflow Laminar Diffusion Flame');
  assert(cld.nasaAccessionId === 'PSI-21', 'PSI-21 nasaAccessionId must be PSI-21');
  assert(cld.accessionVerificationStatus === 'VERIFIED', 'PSI-21 accessionVerificationStatus must be VERIFIED');
  assert(cld.principalInvestigator.includes('Marshall B. Long') && cld.principalInvestigator.includes('Peter B. Sunderland'), 'Must cite PIs Long and Sunderland');
  assert(cld.psiUrl.includes('https://psi.nasa.gov/physci/repo/data/investigations/PSI-21'), 'Must provide direct NASA repository URL for PSI-21');

  // s-Flame Accession Traceability: Standalone ID is UNVERIFIED
  const sflame = catalogue.find(inv => inv.id === 'NASA-ACME-SFLAME');
  assert(sflame !== undefined, 's-Flame must exist in catalog');
  assert(sflame.title === 'Structure and Response of Spherical Flames', 's-Flame title must be Structure and Response of Spherical Flames');
  assert(sflame.principalInvestigator.includes('Chung K. (Ed) Law'), 's-Flame PI must be Chung K. (Ed) Law');
  assert(sflame.nasaAccessionId === 'UNVERIFIED', 's-Flame standalone NASA accession ID must be marked UNVERIFIED');
  assert(sflame.accessionVerificationStatus === 'UNVERIFIED', 's-Flame accessionVerificationStatus must be UNVERIFIED');
  assert(sflame.internalProjectId === 'NASA-ACME-SFLAME', 's-Flame must provide internalProjectId distinct from NASA accession ID');

  // =========================================================================
  // 3. FLEX Evidence Boundary & Cool Flame Traceability
  // =========================================================================
  const flex = catalogue.find(inv => inv.id === 'PSI-69');
  assert(flex !== undefined, 'FLEX (PSI-69) must exist in catalog');
  assert(flex.fuelType === 'Liquid', 'FLEX fuelType must be Liquid (droplets)');
  assert(flex.coolFlamesPrimaryPaper.includes('Nayagam') && flex.coolFlamesPrimaryPaper.includes('2012'), 'FLEX cool-flame discovery must cite Nayagam et al. (2012)');
  assert(flex.coolFlamesPrimaryPaper.includes('10.1016/j.combustflame.2012.07.009'), 'FLEX cool-flame discovery must include authentic paper DOI');
  assert(flex.fuelType !== sflame.fuelType, 'FLEX liquid droplet evidence must remain strictly distinct from s-Flame gaseous flame evidence');

  // =========================================================================
  // 4. De Ris (1969) Assumptions & Material Provenance Traceability
  // =========================================================================
  const flam = calculateFlammability({ o2: 34.0, psi: 8.2, flow: 8.0, g: 0.166 });

  // De Ris Equation & Citation
  assert(flam.deRisModelAssumptions.doi === '10.1016/S0082-0784(69)80407-8', 'De Ris must cite authentic paper DOI 10.1016/S0082-0784(69)80407-8');
  assert(flam.deRisModelAssumptions.analyticalEquation.includes('V_f = V_a'), 'De Ris must document analytical equation');
  assert(flam.deRisModelAssumptions.guardrailNote.includes('project-defined numerical guardrails'), 'De Ris assumptions must designate 0.5 and 1.0 cm/s as project-defined guardrails');

  // Nomex HT90-40 Provenance
  const nomex = flam.materialProvenance.nomex;
  assert(nomex.materialName.includes('HT90-40'), 'Nomex specification must designate DuPont Nomex HT90-40');
  assert(nomex.loi_pct.primarySource.includes('NASA TP-2007-213777'), 'Nomex LOI must cite primary source NASA TP-2007-213777');
  assert(nomex.nasaStd6001B_Test1.primarySource.includes('NASA-STD-6001B'), 'NASA-STD-6001B Test 1 must cite standard protocol');
  assert(nomex.flameSpreadVelocity.status === 'UNVERIFIED', 'Nomex flame spread velocity status must remain UNVERIFIED');
  assert(nomex.status === VerificationStatus.UNVERIFIED, 'Nomex overall status must remain UNVERIFIED');
  assert(flam.materialProvenance.compositeHazardScore.status === 'MODELLED_HEURISTIC', 'Composite hazard score must remain MODELLED_HEURISTIC');
}
