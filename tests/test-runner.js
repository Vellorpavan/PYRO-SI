/**
 * Zero-Dependency ES Scientific Test Runner for PYRO-SI
 * Phase 2 Comprehensive Verification Suite
 */

import { runFlammabilityModelTests } from './unit/flammability-model.test.js';
import { runRankerTests } from './unit/ranker.test.js';
import { runGravityCurveTests } from './scientific/gravity-curve.test.js';
import { runEquationBoundaryTests } from './scientific/equation-boundaries.test.js';
import { runUnitConversionTests } from './scientific/unit-conversions.test.js';
import { runInvestigationValidationTests } from './scientific/investigation-validation.test.js';
import { runMissingDataHandlingTests } from './scientific/missing-data-handling.test.js';
import { runSourceProvenanceTests } from './scientific/source-provenance.test.js';
import { runEvidenceClassificationTests } from './scientific/evidence-classification.test.js';
import { runPhysiologicalSeparationTests } from './scientific/physiological-separation.test.js';
import { runUiScientificLabelsTests } from './scientific/ui-labels.test.js';
import { runPhase221EvidenceTests } from './scientific/phase-2-2-1-evidence.test.js';
import { runPhase222TraceabilityTests } from './scientific/phase-2-2-2-traceability.test.js';
import { runPhase223CorrectionTests } from './scientific/phase-2-2-3-correction.test.js';
import { runPhase224AuditTests } from './scientific/phase-2-2-4-audit.test.js';
import { runPhase2241AddendumTests } from './scientific/phase-2-2-4-1-addendum.test.js';
import { runPhase2242ContractTests } from './scientific/phase-2-2-4-2-contract.test.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
  } else {
    failed++;
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
  }
}

console.log('\n\x1b[1m\x1b[36m=======================================================');
console.log('       GODEYE // PYRO-SI — PHASE 2 VERIFICATION SUITE');
console.log('=======================================================\x1b[0m\n');

const testSuites = [
  { name: '[1/17] Flammability Physics Model Unit Tests', fn: runFlammabilityModelTests },
  { name: '[2/17] PSI Investigation Ranker Unit Tests', fn: runRankerTests },
  { name: '[3/17] Partial-G Scientific Verification Tests', fn: runGravityCurveTests },
  { name: '[4/17] Scientific Equation Boundary Tests', fn: runEquationBoundaryTests },
  { name: '[5/17] Unit Conversion & Thermodynamic Tests', fn: runUnitConversionTests },
  { name: '[6/17] Dynamic Investigation Catalogue Tests', fn: runInvestigationValidationTests },
  { name: '[7/17] Missing Data & Fault Tolerance Tests', fn: runMissingDataHandlingTests },
  { name: '[8/17] 7-Attribute Evidence Provenance Tests', fn: runSourceProvenanceTests },
  { name: '[9/17] Epistemic Evidence Classification Tests', fn: runEvidenceClassificationTests },
  { name: '[10/17] Physiological vs Flammability Separation Tests', fn: runPhysiologicalSeparationTests },
  { name: '[11/17] UI Scientific Labels & Disclaimer Audit Tests', fn: runUiScientificLabelsTests },
  { name: '[12/17] Phase 2.2.1 Evidence & Claim Audit Tests', fn: runPhase221EvidenceTests },
  { name: '[13/17] Phase 2.2.2 Traceability & Baseline Freeze Tests', fn: runPhase222TraceabilityTests },
  { name: '[14/17] Phase 2.2.3 Final Reference & Material Test Correction Tests', fn: runPhase223CorrectionTests },
  { name: '[15/17] Phase 2.2.4 Final Standards & Model Traceability Audit Tests', fn: runPhase224AuditTests },
  { name: '[16/17] Phase 2.2.4.1 Evidence Closure Addendum Tests', fn: runPhase2241AddendumTests },
  { name: '[17/17] Phase 2.2.4.2 Ignition Citation & Runtime Contract Tests', fn: runPhase2242ContractTests }
];

for (const suite of testSuites) {
  console.log(`\x1b[1m${suite.name}...\x1b[0m`);
  try {
    suite.fn(assert);
  } catch (e) {
    failed++;
    console.error(`  \x1b[31m✖ ERROR in ${suite.name}:\x1b[0m`, e);
  }
  console.log('');
}

console.log('-------------------------------------------------------');
console.log(`Summary: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m`);
console.log('-------------------------------------------------------\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
