/**
 * Zero-Dependency ES Test Runner for PYRO-SI
 */

import { runFlammabilityModelTests } from './unit/flammability-model.test.js';
import { runRankerTests } from './unit/ranker.test.js';
import { runGravityCurveTests } from './scientific/gravity-curve.test.js';

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
console.log('       GODEYE // PYRO-SI — VERIFICATION SUITE');
console.log('=======================================================\x1b[0m\n');

console.log('\x1b[1m[1/3] Running Flammability Physics Model Unit Tests...\x1b[0m');
try {
  runFlammabilityModelTests(assert);
} catch (e) {
  failed++;
  console.error(`  \x1b[31m✖ ERROR in Flammability Model Tests:\x1b[0m`, e);
}

console.log('\n\x1b[1m[2/3] Running PSI Investigation Ranker Unit Tests...\x1b[0m');
try {
  runRankerTests(assert);
} catch (e) {
  failed++;
  console.error(`  \x1b[31m✖ ERROR in Ranker Tests:\x1b[0m`, e);
}

console.log('\n\x1b[1m[3/3] Running Partial-G Scientific Verification Tests...\x1b[0m');
try {
  runGravityCurveTests(assert);
} catch (e) {
  failed++;
  console.error(`  \x1b[31m✖ ERROR in Gravity Curve Tests:\x1b[0m`, e);
}

console.log('\n-------------------------------------------------------');
console.log(`Summary: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m`);
console.log('-------------------------------------------------------\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
