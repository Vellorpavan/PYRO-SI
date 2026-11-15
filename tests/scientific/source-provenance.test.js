/**
 * Evidence Provenance Contract Tests
 * Verifies strict 7-attribute scientific provenance on all records and utilities.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProvenanceRecord, validateProvenance, withProvenance, VerificationStatus } from '../../src/utils/provenance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cataloguePath = path.resolve(__dirname, '../../src/data/reference/psi-investigations.json');

export function runSourceProvenanceTests(assert) {
  // 1. Test Provenance Utility: createProvenanceRecord
  const testProv = createProvenanceRecord({
    source: 'NASA Physical Sciences Informatics',
    recordId: 'PSI-25',
    documentLocation: 'Repository Record',
    unit: 'cm/s',
    extractionMethod: 'JSON API',
    verificationStatus: VerificationStatus.VERIFIED,
    lastVerificationDate: '2026-11-15'
  });

  assert(testProv.source === 'NASA Physical Sciences Informatics', 'Provenance source must match');
  assert(testProv.recordId === 'PSI-25', 'Provenance recordId must match');
  assert(testProv.unit === 'cm/s', 'Provenance unit must match');
  assert(testProv.verificationStatus === 'VERIFIED', 'Verification status must match');
  assert(testProv.lastVerificationDate === '2026-11-15', 'Last verification date must match');

  // 2. Test Provenance Validation
  assert(validateProvenance(testProv), 'validateProvenance must return true for valid record');
  assert(!validateProvenance({ source: 'Test' }), 'validateProvenance must return false for incomplete record');
  assert(!validateProvenance(null), 'validateProvenance must return false for null');

  // 3. Test withProvenance wrapper
  const wrapped = withProvenance(42.5, {
    source: 'NASA Glenn Test 1',
    recordId: 'NTRS-2016',
    unit: 'mm/s'
  });
  assert(wrapped.value === 42.5, 'Wrapped value must be preserved');
  assert(wrapped.epistemicTier === 'DERIVED', 'Default epistemic tier must be DERIVED');
  assert(validateProvenance(wrapped.provenance), 'Wrapped provenance must satisfy 7-attribute contract');

  // 4. Test 7-Attribute Provenance on every investigation in catalogue
  const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
  const requiredKeys = [
    'source',
    'recordId',
    'documentLocation',
    'unit',
    'extractionMethod',
    'verificationStatus',
    'lastVerificationDate'
  ];

  catalogue.forEach(inv => {
    assert(inv.provenance && typeof inv.provenance === 'object', `Investigation '${inv.id}' must have a provenance object`);
    requiredKeys.forEach(key => {
      assert(Object.prototype.hasOwnProperty.call(inv.provenance, key), `Investigation '${inv.id}' provenance must have '${key}'`);
      if (key !== 'unit') {
        assert(typeof inv.provenance[key] === 'string' && inv.provenance[key].length > 0, `'${inv.id}' provenance.${key} must be non-empty string`);
      }
    });

    const status = inv.provenance.verificationStatus;
    const validStatuses = [
      'VERIFIED',
      'PROVISIONAL',
      'UNFLOWN_FRONTIER',
      'VERIFIED_DATASET',
      'VERIFIED_METADATA_ONLY',
      'PROVISIONAL_PROXY',
      'UNFLOWN_PLANNED',
      'FACILITY_REFERENCE'
    ];
    assert(validStatuses.includes(status), `'${inv.id}' status must be valid enum, got '${status}'`);
  });
}
