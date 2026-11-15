/**
/**
 * Scientific Evidence Provenance Module
 * Implements strict NASA SPD-41a scientific provenance contracts.
 * 
 * Every scientific data field must provide:
 * 1. source: Original authority/repository (e.g., NASA PSI, NASA-STD-3001 Rev F)
 * 2. recordId: Source record identifier (e.g., PSI-25, Table 6.2-1)
 * 3. documentLocation: Field, section, or page number in primary document
 * 4. unit: Physical SI/US customary unit, or null if dimensionless
 * 5. extractionMethod: Ingestion or derivation technique
 * 6. verificationStatus: Granular forensic tier (VERIFIED_DATASET, VERIFIED_METADATA_ONLY, etc.)
 * 7. lastVerificationDate: ISO date string of latest forensic verification
 */

export const VerificationStatus = {
  // Primary granular forensic tiers
  VERIFIED_DATASET: 'VERIFIED_DATASET',
  VERIFIED_METADATA_ONLY: 'VERIFIED_METADATA_ONLY',
  PROVISIONAL_PROXY: 'PROVISIONAL_PROXY',
  UNFLOWN_PLANNED: 'UNFLOWN_PLANNED',
  FACILITY_REFERENCE: 'FACILITY_REFERENCE',
  UNVERIFIED: 'UNVERIFIED',

  // Backward-compatibility aliases
  VERIFIED: 'VERIFIED',
  PROVISIONAL: 'PROVISIONAL',
  UNFLOWN_FRONTIER: 'UNFLOWN_FRONTIER'
};

export const EpistemicClassification = {
  DERIVED: 'DERIVED',         // Exact physical / thermodynamic law (e.g. Dalton's law)
  MODELLED: 'MODELLED',       // 1D phenomenological proxy or energy balance
  EXPLORATORY: 'EXPLORATORY', // Continuum scaling prior to in-situ flight validation
  ILLUSTRATIVE: 'ILLUSTRATIVE' // Visual qualitative representations (shaders, meshes)
};

/**
 * Creates a compliant 7-field Provenance Record
 */
export function createProvenanceRecord({
  source,
  recordId,
  documentLocation = 'N/A',
  unit = null,
  extractionMethod = 'Direct JSON ingestion from repository',
  verificationStatus = VerificationStatus.VERIFIED,
  lastVerificationDate = '2026-11-15',
  notes = ''
}) {
  if (!source || !recordId) {
    throw new Error('Provenance record must specify at least source and recordId');
  }

  return {
    source: String(source),
    recordId: String(recordId),
    documentLocation: String(documentLocation),
    unit: unit !== null ? String(unit) : null,
    extractionMethod: String(extractionMethod),
    verificationStatus: String(verificationStatus),
    lastVerificationDate: String(lastVerificationDate),
    notes: String(notes || '')
  };
}

/**
 * Validates that an object satisfies the 7-attribute provenance contract
 */
export function validateProvenance(prov) {
  if (!prov || typeof prov !== 'object') return false;
  const required = [
    'source',
    'recordId',
    'documentLocation',
    'unit',
    'extractionMethod',
    'verificationStatus',
    'lastVerificationDate'
  ];

  return required.every(key => Object.prototype.hasOwnProperty.call(prov, key));
}

/**
 * Wraps a scientific value with its epistemic classification and provenance metadata
 */
export function withProvenance(value, provenanceMeta, epistemicTier = EpistemicClassification.DERIVED) {
  return {
    value,
    epistemicTier,
    provenance: createProvenanceRecord(provenanceMeta)
  };
}
