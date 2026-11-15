/**
 * Missing Data and Fault Tolerance Tests
 * Verifies graceful degradation, input sanitization, and fallback behavior.
 */

import { calculateFlammability, evaluatePhysiologicalAtmosphere } from '../../src/modules/flammability-simulator/physics-model.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cataloguePath = path.resolve(__dirname, '../../src/data/reference/psi-investigations.json');

export function runMissingDataHandlingTests(assert) {
  // 1. Missing or undefined inputs to calculateFlammability
  const emptyRes = calculateFlammability({});
  assert(!Number.isNaN(emptyRes.ppo2), 'Missing inputs must not produce NaN for pO2');
  assert(!Number.isNaN(emptyRes.riskScore), 'Missing inputs must not produce NaN for risk score');
  assert(!Number.isNaN(emptyRes.vEffective), 'Missing inputs must not produce NaN for vEffective');
  assert(typeof emptyRes.rates.sibal === 'string', 'Missing inputs must still produce string spread rates');

  // 2. Partial undefined inputs
  const partialRes = calculateFlammability({ o2: null, psi: undefined, flow: 'invalid', g: -5 });
  assert(partialRes.vBuoyant === 0.0, 'Negative gravity input must be sanitized to 0.0');
  assert(partialRes.riskScore >= 8 && partialRes.riskScore <= 99, 'Sanitized outputs must remain inside physical bounds [8, 99]');

  // 3. Unflown payload with 0 archived bytes (FM2 / LUCI)
  const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
  const fm2 = catalogue.find(inv => inv.id === 'NASA-FM2');
  assert(fm2, 'NASA-FM2 must exist in catalogue');
  assert(fm2.verifiedMetadata.numericalRecordsCount === 0, 'FM2 must explicitly indicate 0 numerical records available');
  assert(fm2.provenance.verificationStatus === 'UNFLOWN_PLANNED' || fm2.provenance.verificationStatus === 'UNFLOWN_FRONTIER', 'FM2 must be marked UNFLOWN_PLANNED or UNFLOWN_FRONTIER');
  assert(fm2.verified === false, 'FM2 verified flag must be false (not yet flown)');

  // 4. Missing inputs to evaluatePhysiologicalAtmosphere
  const emptyPhys = evaluatePhysiologicalAtmosphere({});
  assert(!Number.isNaN(emptyPhys.pO2_psia), 'Empty physiological input must not produce NaN');
  assert(!Number.isNaN(emptyPhys.pO2_kPa), 'Empty physiological input must not produce NaN for kPa');
  assert(typeof emptyPhys.isNormoxic === 'boolean', 'isNormoxic must be a boolean');
  assert(typeof emptyPhys.status === 'string', 'status must be a valid string');

  // 5. Zero-flow in zero-gravity condition
  const zeroDraft = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 0.0, g: 0.0 });
  assert(zeroDraft.vEffective === 0.0, 'Zero flow in zero gravity must have 0.0 effective velocity');
  assert(zeroDraft.rates.nomex === '0.0', 'Nomex must not burn in zero draft 21% O2');
}
