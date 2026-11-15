/**
 * Investigation Catalogue Validation Tests
 * Verifies dynamic catalogue expansion, NASA identifiers, and metadata/asset separation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cataloguePath = path.resolve(__dirname, '../../src/data/reference/psi-investigations.json');

export function runInvestigationValidationTests(assert) {
  const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));

  // 1. Dynamic Catalogue: Fixed 10-investigation limit removed
  assert(Array.isArray(catalogue), 'Catalogue must be an array of records');
  assert(catalogue.length > 10, `Catalogue must support dynamic expansion (>10 records), found ${catalogue.length}`);
  assert(catalogue.length >= 18, `Catalogue must hold at least 18 audited investigations, found ${catalogue.length}`);

  // 2. Canonical NASA Identifiers
  const requiredIdPattern = /^(PSI-\d+|NASA-[A-Z0-9-]+)$/;
  catalogue.forEach(inv => {
    assert(requiredIdPattern.test(inv.id), `Investigation ID '${inv.id}' must match canonical NASA pattern`);
    assert(inv.psiId && inv.psiId.length > 0, `Record '${inv.id}' must have valid psiId`);
  });

  // 3. Source URLs Preservation
  catalogue.forEach(inv => {
    assert(inv.psiUrl && inv.psiUrl.startsWith('https://'), `Investigation '${inv.id}' must provide authentic HTTPS URL: ${inv.psiUrl}`);
  });

  // 4. Separation of Verified Metadata from Downloadable Assets
  catalogue.forEach(inv => {
    assert(inv.verifiedMetadata && typeof inv.verifiedMetadata === 'object', `Investigation '${inv.id}' must provide verifiedMetadata object`);
    assert(typeof inv.verifiedMetadata.flightPlatform === 'string', `'${inv.id}' verifiedMetadata must specify flightPlatform`);
    assert(typeof inv.verifiedMetadata.numericalRecordsCount === 'number', `'${inv.id}' verifiedMetadata must specify numericalRecordsCount`);

    assert(inv.downloadableAssets && typeof inv.downloadableAssets === 'object', `Investigation '${inv.id}' must provide downloadableAssets object`);
    assert(typeof inv.downloadableAssets.serverArchiveVolume === 'string', `'${inv.id}' downloadableAssets must specify serverArchiveVolume`);
    assert(typeof inv.downloadableAssets.accessTier === 'string', `'${inv.id}' downloadableAssets must specify accessTier`);
    assert(Array.isArray(inv.downloadableAssets.machineReadableFormats), `'${inv.id}' downloadableAssets must specify machineReadableFormats`);
  });

  // 5. Preserved Original Flight Records
  const expectedCodes = ['BASS-II', 'SAFFIRE-I', 'ACME: CFI-G', 'ACME: BRE', 'FLEX', 'SAME-R', 'ACME: E-FIELD', 'DAFT / DAFT-2', 'SPICE', 'FM2'];
  expectedCodes.forEach(code => {
    const found = catalogue.some(inv => inv.code === code || inv.code?.startsWith(code.split(' ')[0]));
    assert(found, `Original core investigation '${code}' must be preserved in catalogue`);
  });

  // 6. Rack diversity
  const racks = [...new Set(catalogue.map(inv => inv.rack))];
  assert(racks.includes('CIR'), 'Catalogue must contain CIR investigations');
  assert(racks.includes('MSG'), 'Catalogue must contain MSG investigations');
  assert(racks.includes('CYGNUS'), 'Catalogue must contain CYGNUS investigations');
  assert(racks.includes('EXPRESS'), 'Catalogue must contain EXPRESS rack investigations (DAFT)');
  assert(racks.includes('LUNAR'), 'Catalogue must contain LUNAR payloads');

  // 7. Audit Corrections: ACME BRE (PSI-20) and FLEX (PSI-69)
  const bre = catalogue.find(inv => inv.id === 'PSI-20');
  assert(bre && bre.verifiedMetadata.numericalRecordsCount === 104, 'ACME BRE (PSI-20) numericalRecordsCount must be 104 per audit');
  const flex = catalogue.find(inv => inv.id === 'PSI-69');
  assert(flex && flex.verifiedMetadata.numericalRecordsCount === 150, 'FLEX (PSI-69) numericalRecordsCount must be 150 per audit');
}
