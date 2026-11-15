# GODEYE // PYRO-SI — NASA Catalogue Integration Specification
**Version 1.0.0 — Phase 2.3.3 Architecture & Data Pipeline Standard**

**Document Identifier:** NASA-PYRO-SPEC-CATALOGUE-233  
**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Author:** Lead Data Integration Engineer & Scientific Data Verification Specialist  
**Date:** November 16, 2026  
**Status:** APPROVED & IMPLEMENTED  
**Governing Standard:** NASA SPD-41a (Scientific Data & Information Policy)  

---

## 1. System Overview & Ingestion Architecture

The NASA Catalogue Integration subsystem automates the ingestion, auditing, normalization, deduplication, and archival of NASA Physical Sciences Informatics (PSI) and Biological & Physical Sciences (BPS) research records retrieved via the secure Parse.bot backend proxy.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      NASA CATALOGUE INTEGRATION PIPELINE                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                         [Authenticated Client Request]
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │   Dynamic Session Handshake   │
                      │   POST /api/v1/auth/session   │
                      └───────────────┬───────────────┘
                                      │ token_urlsafe(32) [TTL: 3600s]
                                      ▼
                      ┌───────────────────────────────┐
                      │    Secure Proxy & Rate Gate   │
                      │  GET /api/v1/nasa/resources   │
                      └───────────────┬───────────────┘
                                      │ X-API-Key: $PARSE_API_KEY (Server Secret)
                                      ▼
                      ┌───────────────────────────────┐
                      │   Upstream Scraper Endpoint   │
                      │        (Parse.bot API)        │
                      └───────────────┬───────────────┘
                                      │ Raw JSON Payload
                                      ▼
                      ┌───────────────────────────────┐
                      │     Raw Ingestion Storage     │
                      │ SHA-256 Digest & Manifest Log │
                      │   backend/data/raw/parse_bot/ │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │  Catalogue Integrator Engine  │
                      │ (catalogue_integrator.py)     │
                      └───────────────┬───────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   [Combustion Flight Studies]              [Non-Combustion BPS Studies]
   Audit: C-01 to C-07 = PASS               Audit: C-07 != Combustion
   Deduplication & Provenance Guard         Discipline Isolation
                 │                                         │
                 ▼                                         ▼
   ┌───────────────────────────┐            ┌───────────────────────────┐
   │ 19 Core Flight Datasets   │            │ Discovered BPS Archive    │
   │ psi-investigations.json   │            │ discovered-bps-           │
   │ (VERIFIED_DATASET /       │            │ resources.json            │
   │  VERIFIED_METADATA_ONLY)  │            │ (NON_COMBUSTION_BPS_STUDY)│
   └───────────────────────────┘            └───────────────────────────┘
```

---

## 2. Dynamic Session Authorization & Security Contract

### 2.1 The Threat Model & Vulnerability Elimination
In legacy implementations, client applications often used hardcoded static authorization tokens. In Phase 2.3.3, this architectural flaw was completely eliminated:
1. **Zero Client Secrets:** The frontend JavaScript client (`src/services/api/nasa-resources-client.js`) contains **no static application secret or shared token**.
2. **Dynamic Session Handshake:** Clients initiate a session via:
   ```http
   POST /api/v1/auth/session
   ```
   The backend generates an unguessable 256-bit token (`secrets.token_urlsafe(32)`) stored in an in-memory session store with client IP binding and a 1-hour expiration time (`SESSION_TTL_SECONDS = 3600.0`).
3. **Session Verification:** Subsequent calls to `/api/v1/nasa/resources` pass the dynamic token via:
   ```http
   Authorization: Bearer <session_token>
   ```
4. **Rate Limiting:** Enforced at the gateway layer via `SlidingWindowRateLimiter` configured for 30 requests per 60-second window per IP. Exceeded quotas return HTTP 429 with explicit `Retry-After` headers.
5. **Zero Secret Leakage:** The server-side environment secret (`PARSE_API_KEY`) is injected exclusively in outbound server requests to `api.parse.bot` and is never serialized in response headers or response payloads.

---

## 3. Raw Response Storage & Cryptographic Verification

Under NASA SPD-41a, all externally retrieved scientific payloads must be preserved in their raw, unaltered format to guarantee provenance reproducibility.

### 3.1 File Naming & Directory Convention
Raw payloads are written to:
```
backend/data/raw/parse_bot/<ISO_TIMESTAMP>_<SCRAPER_ID_PREFIX>_<SHA256_PREFIX>.json
```
Example:
```
backend/data/raw/parse_bot/20261115T184901Z_328daab1_6aefceac.json
```

### 3.2 Cryptographic Manifest Specification
Each saved response is appended to `backend/data/raw/parse_bot/manifest.json` with the following structure:
```json
{
  "timestamp_utc": "2026-11-15T18:49:01.852Z",
  "scraper_id": "328daab1-12f9-4464-b73d-b5e0c392bfe7",
  "sha256": "6aefceacee98e21...",
  "size_bytes": 146,
  "filename": "20261115T184901Z_328daab1_6aefceac.json"
}
```

---

## 4. Normalization Engine & Discipline Demarcation

### 4.1 Schema Compliance
Normalized items must conform to the project schema at `src/data/schemas/investigation.schema.json`.

### 4.2 Rejection Rules (Input Validation Gates)
Candidate items must immediately be rejected if they fail any of the following gates:
1. **Invalid Source Identifier (`INVALID_IDENTIFIER`):**
   - The candidate lacks an accession ID, or the ID does not match canonical NASA formatting (`^PSI-\d+$`).
2. **Missing Source URL (`MISSING_SOURCE_URL`):**
   - The candidate lacks a URL, has an empty URL string, or the domain does not belong to an authoritative NASA or US Government domain (`nasa.gov`, `jpl.nasa.gov`, `gov`).
3. **Invalid Response Structure (`INVALID_STRUCTURE`):**
   - The upstream response fails JSON parsing or lacks required section/resource arrays.

### 4.3 Discipline Detection & Disambiguation Heuristic
The scraper monitors the NASA Biological and Physical Sciences (BPS) portal (`science.nasa.gov/biological-physical/data/`). Items are classified using explicit accession lookup and term taxonomy:

```python
NON_COMBUSTION_TAXONOMY = {
    "PSI-178": {
        "discipline": "Materials Science",
        "subdiscipline": "High-Temperature Levitation & Molten Oxides",
        "combustion_relevant": False
    },
    "PSI-138": {
        "discipline": "Fluid Physics",
        "subdiscipline": "Multiphase Flow & Nucleate Pool Boiling",
        "combustion_relevant": False
    },
    "PSI-187": {
        "discipline": "Fluid Physics",
        "subdiscipline": "Capillary Hydroponics & Plant Water",
        "combustion_relevant": False
    }
}
```

If a record is identified as non-combustion:
- It is normalized with `epistemic_tier: "NON_COMBUSTION_BPS_STUDY"`.
- It is flagged `is_combustion_study: false`.
- It is routed to `src/data/reference/discovered-bps-resources.json`.
- **It is strictly prohibited from entering `psi-investigations.json` or influencing flammability physics calculations.**

---

## 5. Deduplication & Provenance Preservation Invariants

### 5.1 Deduplication Logic
Before writing any record, the engine checks for existing accession IDs across both `src/data/reference/psi-investigations.json` (19 core combustion records) and `src/data/reference/discovered-bps-resources.json`.

### 5.2 The Epistemic Precedence Hierarchy
```
Tier 1: VERIFIED_DATASET
   ▲
   │ (Cannot be overwritten by lower tiers)
Tier 2: VERIFIED_METADATA_ONLY
   ▲
   │ (Cannot be overwritten by non-combustion metadata)
Tier 3: NON_COMBUSTION_BPS_STUDY
   ▲
Tier 4: UNVERIFIED_MODELLED_HEURISTIC
```

### 5.3 Downgrade Prevention Invariant
**Invariant Statement:**  
*No automated scraper or discovery process may downgrade or overwrite an existing record that possesses flight calibration measurements, ground-truth flame spread velocities, or peer-reviewed DOI citations.*

- Saffire-I (`PSI-98`) holds ground truth flight measurements ($2.24\text{ mm/s}$ concurrent spread in Cygnus OA-6 cargo bay). It is classified as `VERIFIED_DATASET`.
- If Parse.bot retrieves `PSI-98` with scraped metadata, the integrator logs a `DUPLICATE_EXISTING_VERIFIED` event and preserves the existing `VERIFIED_DATASET` without modification.

---

## 6. Verification & Automated Test Coverage

The integration pipeline is validated by 8 comprehensive automated tests in `tests/backend/test_catalogue_integration.py`:

1. `test_missing_identifier_rejected`: Items without PSI ID rejected with `INVALID_IDENTIFIER`.
2. `test_malformed_identifier_rejected`: Malformed IDs (e.g. `ABC-999`) rejected.
3. `test_missing_source_url_rejected`: Missing or non-NASA URLs rejected with `MISSING_SOURCE_URL`.
4. `test_empty_url_rejected`: Empty string URLs rejected.
5. `test_duplicate_combustion_study_skipped_and_provenance_preserved`: Re-ingesting existing verified study skips duplicate and preserves provenance.
6. `test_saffire_provenance_never_downgraded`: Ensures `PSI-98` `VERIFIED_DATASET` is never overwritten by scraped metadata.
7. `test_psi_178_138_187_normalization`: Confirms `PSI-178`, `PSI-138`, and `PSI-187` are classified as Materials Science / Fluid Physics and marked non-combustion.
8. `test_existing_catalogue_preservation`: Asserts all 19 original records in `psi-investigations.json` remain intact.

---

## 7. Sign-Off & Approvals

- **Architecture Status:** APPROVED
- **Implementation:** `backend/ingestion/catalogue_integrator.py`
- **Security Audit:** PASSED (Zero embedded client secrets, dynamic session tokens, rate-limited proxy)
- **Scientific Integrity:** PASSED (Discipline disambiguation and provenance protection verified)
