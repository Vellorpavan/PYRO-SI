# GODEYE // PYRO-SI — Implementation Roadmap & Execution Plan

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 16, 2026  
**Document Identifier:** NASA-PYRO-ROADMAP-001  
**Version:** 4.8 (Phase 2.3.3 NASA Data Verification & Catalogue Integration Completed)  
**Governance Standard:** NASA Systems Engineering Handbook (SP-2016-6105)

---

## 1. Roadmap Architecture & Governance Gates

To ensure **GODEYE // PYRO-SI** achieves absolute scientific credibility while fulfilling every objective of the NASA Space Apps Challenge 2026, implementation is governed by five sequential, gated engineering phases:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Product Requirements & Scientific Alignment (COMPLETED)                       │
│ • Author formal governing documents: PRD, RTM, SDR, SCM, ATP, and Review Report.       │
│ • Establish 6-tier epistemic provenance contract (`MEASURED` to `UNKNOWN`).            │
│ • Forensic audit of all 10 NASA investigations and reconciliation of data volumes.     │
│ • Sourced NASA-STD-3001 hypoxia compliance to Vol 2 [V2 6003] ($18.5 - 20.9 kPa).      │
│ • Permanently excise uncalibrated ±14% claims and ungrounded partial-g flight claims.  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 1.1: Independent Scientific Evidence Audit (COMPLETED)                           │
│ • Author Phase 1.1 audit reports: Evidence Audit, Source Ledger, Data Matrix,          │
│   Fire Safety Map, and Claims Dissection Register.                                     │
│ • Audit 10 core + 8 candidate investigations against primary NASA literature.          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Scientific Code Alignment & Provenance Contracts (COMPLETED)                 │
│ • Review and align NASA-STD-3001 Rev F references ([V2 6002], [V2 6003], [V2 6006]).   │
│ • Separate physiological atmosphere requirements from material flammability screening. │
│ • Dissect and bound simulator equations; excise ±14% and unvalidated accuracy claims.  │
│ • Display model assumptions, limitations, and single-point calibration baseline.       │
│ • Remove fixed 10-investigation ceiling; dynamic catalogue expanded to 19 records.     │
│ • Implement 7-attribute provenance contract and verified metadata vs assets split.     │
│ • Author 11-suite automated verification harness (574 passing tests, 100% green).     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.1: Independent Standards Verification & Remediation (COMPLETED)               │
│ • Formally align standards to NASA-STD-3001 Volume 2 Revision F (July 14, 2026).       │
│ • Audit and correct ACME BRE (PSI-20) and FLEX (PSI-69) metadata and counts.          │
│ • Enforce [V2 6002] 30% diluent gas requirement and [V2 6006] strict pressure domain.  │
│ • Expand test suite to 582 passing tests.                                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.2: Scientific Boundary Corrections (COMPLETED)                                │
│ • Implement exact Table 6.2-1 inspired oxygen equation PIO2 = (PB - 47 mmHg) * FIO2.   │
│ • Reclassify Artemis Exploration Atmosphere (8.2 psia / 34% O2) as MILD HYPOXIA.       │
│ • Enforce strict pressure interval 34.5 kPa < P <= 103.0 kPa [V2 6006].                │
│ • Decompose 4 combustion transport mechanisms and implement MODEL_OUT_OF_SCOPE.       │
│ • Expand test suite to 600 passing tests.                                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.2.1: Independent Evidence & Claim Audit (COMPLETED & VERIFIED)                 │
│ • Align Table 6.2-1 normative categories; distinguish 127 mmHg TWA vs 122 mmHg limit.  │
│ • Disambiguate PSI-21 (ACME CLD Flame) from ACME s-Flame (spherical porous burner).    │
│ • Eliminate conflation between gaseous spherical flames and liquid droplets (FLEX).   │
│ • Separate quantitative convection from conceptual diffusion and parameterized loss.   │
│ • Label 0.5 cm/s and 1.0 cm/s thresholds as PROJECT_DEFINED_MODEL_GUARDRAILS.          │
│ • Disclose 6 analytical assumptions of De Ris (1969); clarify empirical anchor baseline│
│ • Audit Nomex HT90-40 hazard figures; tag modelled spread rate as UNVERIFIED.          │
│ • Expand test suite to 12 suites, 686 passing tests (100% green, 0 failures).          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.2.2: Final Evidence Traceability & Baseline Freeze (COMPLETED)                 │
│ • Enforce exact Table 6.2-1 terms: Normoxia Target Range & Mild Hypoxia Lower Limit.   │
│ • Preserve Footnote ** monitoring plan & Footnote **** 1-hr TWA / 122 mmHg limit.      │
│ • Separate project-defined operational interpretation band from formal NASA categories.│
│ • Retrieve direct repository records: PSI-21 (CLD Flame) vs s-Flame (UNVERIFIED ID).   │
│ • Trace FLEX cool-flame discovery to Nayagam et al. (2012, DOI 10.1016/j.combustflame).│
│ • Formulate De Ris (1969) thin-fuel analytical equation and theoretical assumptions.   │
│ • Trace Nomex HT90-40 LOI (28–30% O2) to ASTM D2863 / NASA TP-2007-213777 and Test 1. │
│ • Retain 0.8 mm/s as UNVERIFIED and 85% score as MODELLED_HEURISTIC.                   │
│ • Verification suite: 13 suites, 722 passing tests (100% green, 0 failures).           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.2.3: Final Model Reference & Material Test Correction (COMPLETED)               │
│ • Correct De Ris (1969) paper title ("Spread of a laminar diffusion flame") & DOI      │
│   (10.1016/S0082-0784(69)80407-8).                                                     │
│ • Correct radiation treatment: explicitly included as heat loss at flame sheet and     │
│   heat gain at fuel-bed surface (NOT negligible).                                      │
│ • Distinguish original thin/thick De Ris formulations from adapted phenomenological    │
│   scaling proxy; designate unverified details as UNVERIFIED.                           │
│ • Correct NASA-STD-6001B Test 1 acceptance criteria: burn length <= 15 cm (6 in.)     │
│   across all 5 specimens & zero paper ignition (NOT propagation > 12 in.).             │
│ • Complete verification suite: 14 suites, 756 passing tests (100% green, 0 failures). │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.2.4: Final Standards & Model Traceability Audit (COMPLETED)                    │
│ • Correct specimen dimensions: exactly 30 cm x 6.5 cm (12 in x 2.5 in) per Section     │
│   7.1.2(b) of NASA-STD-6001B w/Change 3. Tested one at a time, mounted vertically.     │
│ • Preserve acceptance criteria: burn length <= 15 cm (6 in.), zero flaming debris      │
│   transfer to K-10 paper; failure of ANY ONE specimen constitutes material failure.     │
│ • Reconcile project equation version history: actual code spreadIndex formula audited; │
│   exponents classified as UNVERIFIED_MODELLED_HEURISTIC with zero validation claims.   │
│ • Label unverified De Ris equation numbers/pages and Nomex page citations UNVERIFIED.  │
│ • Verification suite: 15 suites, 780 passing tests (100% green, 0 failures).           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.2.4.1: Evidence Closure Addendum (COMPLETED & FROZEN)                          │
│ • Reclassify 25 s ignition dwell as UNVERIFIED; remove attribution to WSTF as fact.    │
│ • Audit ignition energy: 750 ± 50 J (NASA-STD-6001B App A.1.2) vs 2000 kJ/m² fluence   │
│   (secondary literature, not standard clause); verify quantities non-interchangeable.  │
│ • Mark De Ris thin/thick equations UNVERIFIED; confirm not calculation paths in app.   │
│ • Document runtime spreadIndex input contract: o2 units & floor, Math.max(0.1, ...)    │
│   below LOI, LOI bounds [12.5, 24.0], pressure reference values (10.2 / 14.7 psia),    │
│   hard vacuum zero pressure behavior, piecewise vent tiers, orthogonal gravity coupling│
│ • Complete verification suite: 16 suites, 823 passing tests (100% green, 0 failures). │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.2.4.2: Ignition Citation & Runtime Contract Correction (COMPLETED & FROZEN)   │
│ • Audit ignition energy: 750 ± 50 cal in historical NHB 8060.1B/C Test 1 (3138 ± 209 J)│
│   vs ISO 14624-1 in active NASA-STD-6001B; correct factor-of-4.184 unit error and       │
│   excise non-existent Section 7.1.3.1 / App A.1.2 clause attributions.                 │
│ • Resolve Nomex LOI contract domain conflict: runtime LOI model clamped to [12.5, 24.0]│
│   is SIBAL-specific; return MATERIAL_OUTSIDE_SUPPORTED_LOI_DOMAIN without silent cut.   │
│ • Document oxygen-term Math.max(0.1, ...) anti-NaN clamp; prove spreadIndex 0.048225   │
│   below LOI is software artifact not combustion; provide verified numerical tests.     │
│ • Reclassify SIBAL hypoxic override (0.2 mm/s below 10% O2) as UNVERIFIED heuristic.   │
│ • Complete verification suite: 17 suites, 848 passing tests (100% green, 0 failures). │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.3.1: NASA Data API Discovery & Source Verification (COMPLETED)                 │
│ • Investigate Parse.bot scraper API (328daab1-12f9-4464-b73d-b5e0c392bfe7).            │
│ • Verify live connectivity and HTTP 401 X-API-Key enforcement via probe.               │
│ • Safeguard credentials; report missing PARSE_API_KEY without fabricating data.        │
│ • Author resilient Python client (backend/ingestion/parse_api_client.py) & CLI tool.   │
│ • Implement 7-Criterion NASA Source Verification & 12-Field Data Availability Matrix.  │
│ • Author 12 Python backend tests (100% green); preserve 17 scientific suites (848 tests│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.3.2: Secure Shared Parse.bot API Integration (COMPLETED)                       │
│ • Implement Python backend proxy endpoint (GET/POST /api/v1/nasa/resources).           │
│ • Manage server-side secret PARSE_API_KEY in backend environment; zero frontend leak.   │
│ • SlidingWindowRateLimiter (30 req/min per IP) to prevent API abuse.                   │
│ • Authored 11 backend proxy tests (23 total backend tests green).                      │
│ • Delivered docs/PARSE_BOT_INTEGRATION_GUIDE.md & deployment secret runbook.           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2.3.3: NASA Data Verification & Catalogue Integration (COMPLETED & VERIFIED)     │
│ • Security audit & dynamic session tokens: POST /api/v1/auth/session with 1-hr TTL.    │
│ • Excised static shared secret DEFAULT_APP_TOKEN from frontend JavaScript client.      │
│ • Real NASA resource inspection: identified PSI-178 (Materials), PSI-138 (Fluids),     │
│   and PSI-187 (Fluids) as non-combustion; quarantined OSD biological studies.          │
│ • Built catalogue integrator: raw storage with SHA-256 manifests, schema normalization.│
│ • Implemented Provenance Protection Invariant: zero downgrade of VERIFIED_DATASET.     │
│ • Preserved all 19 core combustion flight datasets in psi-investigations.json.         │
│ • 34 backend Python tests & 848 Node.js scientific assertions (100% green).            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: AI Research Co-Pilot RAG Architecture Integration (NEXT PHASE — AWAITING GATE)│
│ • Replace static substring keyword routing with authentic Retrieval-Augmented          │
│   Generation (RAG) using Google Gemini 2.0 Flash and indexed NASA PSI documents.       │
│ • Implement semantic search over BASS-II, Saffire, and FLEX flight reports.            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Full Multi-Study Ingestion & Dynamic Multi-Selector Parametric Comparator     │
│ • Expand comparison table to support arbitrary dynamic combinations from catalogue.    │
│ • Embed direct NASA PSI repository download links and technical documentation anchors. │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: Challenge Submission Dossier & Final Evaluation Verification                  │
│ • Final headless Chrome WebGL visual regression run across all 15 views.               │
│ • Compile NASA Space Apps 2026 executive submission kit and impact dossier.            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Work Breakdown Structure (WBS)

### Phase 1: Product Requirements & Scientific Alignment (STATUS: COMPLETE)
- [x] Author `docs/MASTER_PRODUCT_REQUIREMENTS.md` (FR-01 through FR-14, non-functional budgets, standards).
- [x] Author `docs/REQUIREMENT_TRACEABILITY_MATRIX.md` (Bidirectional mapping of NASA mandates to capabilities and tests).
- [x] Author `docs/SCIENTIFIC_DATA_REQUIREMENTS.md` (Curated flight studies, data volumes, schemas, Dalton's law).
- [x] Author `docs/SYSTEM_CAPABILITY_MATRIX.md` (Inputs, algorithms, outputs, dependencies, and statuses for 14 capabilities).
- [x] Author `docs/ACCEPTANCE_TEST_PLAN.md` (Multi-layer test harness: unit, ranker, transitions, and headless WebGL).
- [x] Author `docs/PHASE_1_REVIEW_REPORT.md` (Comprehensive architectural review and gate recommendation).
- [x] Update `docs/IMPLEMENTATION_ROADMAP.md` (Synchronized priorities and phase gating).

### Phase 1.1: Independent Scientific Evidence Audit (STATUS: COMPLETE)
- [x] Author `docs/PHASE_1_1_EVIDENCE_AUDIT.md` (Forensic synthesis of 6 audit areas).
- [x] Author `docs/INVESTIGATION_SOURCE_LEDGER.md` (14-field master audit ledger for 10 core + 8 candidate investigations).
- [x] Author `docs/DATA_AVAILABILITY_MATRIX.md` (9-tier A–I accessibility taxonomy).
- [x] Author `docs/FIRE_SAFETY_EVIDENCE_MAP.md` (Evidence mapped to Prevention, Detection, Suppression, Earth Spinoffs).
- [x] Author `docs/SCIENTIFIC_CLAIMS_CORRECTIONS.md` (Forensic claim correction table and formula dissection).

### Phase 2: Scientific Code Alignment (STATUS: COMPLETE)
- [x] **Task 1: Scientific Source Corrections & Standard Revisions:**
  - Standardized all atmospheric references on **NASA-STD-3001 Rev D** (`[V2 6002]`, `[V2 6003]`, `[V2 6006]`).
  - Preserved historical references to earlier revisions (`[V2 6004]`, `[V2 6005]`).
  - Separated human physiological respiration standards from material flammability screening (`NASA-STD-6001B`).
- [x] **Task 2: Simulator Integrity & Bounding Models:**
  - Dissected all formulas in `src/modules/flammability-simulator/physics-model.js`.
  - Excised all unsupported empirical accuracy claims, including "±14% uncertainty".
  - Disclosed model assumptions, limitations, and SAFFIRE-I single-point calibration baseline.
  - Tagged all outputs under strict epistemic tiers (`DERIVED`, `MODELLED`, `EXPLORATORY`, `ILLUSTRATIVE`).
  - Rendered partial-gravity curve in `partial-g-chart.js` explicitly as an exploratory theoretical continuum (T'ien / Ferkul model).
- [x] **Task 3: Investigation Catalogue Architecture:**
  - Removed fixed 10-investigation limitation; catalogue dynamically manages 18 verified records.
  - Preserved canonical NASA identifiers (`PSI-XX`, `NASA-XX`) and authentic repository URLs.
  - Explicitly separated verified scientific metadata from downloadable experimental files and archives.
- [x] **Task 4: Evidence Provenance Contracts:**
  - Implemented 7-attribute provenance contract (`source`, `recordId`, `documentLocation`, `unit`, `extractionMethod`, `verificationStatus`, `lastVerificationDate`).
  - Created `src/utils/provenance.js` utility module and enriched JSON schema.
- [x] **Task 5: Automated Verification Suite:**
  - Built comprehensive scientific test suite in `tests/scientific/`: equation boundaries, unit conversions, catalogue validation, fault tolerance, provenance contracts, epistemic tagging, physiological separation, and UI scientific label audits.
  - Verified 100% green test status: **574 passing tests, 0 failed**.
  - Verified environment state-machine transitions: **100% passing across ISS, Moon, Mars, and EVA**.
- [x] **Task 6: Phase 2 Documentation Deliverables:**
  - Updated `docs/SCIENTIFIC_REQUIREMENTS.md`.
  - Updated `docs/IMPLEMENTATION_ROADMAP.md`.
  - Updated `docs/SCIENTIFIC_CLAIMS_CORRECTIONS.md`.
  - Created `docs/PHASE_2_IMPLEMENTATION_REPORT.md`.
  - Created `tests/scientific/phase-2-validation-report.md`.

- [x] **Task 7: Phase 2.1 Independent Verification & Remediation:**
  - Formally corrected NASA standard revision from Rev D to **NASA-STD-3001 Volume 2 Revision F (Approved July 14, 2026)**.
  - Independently audited all 18 NASA PSI investigations against repository records and DOIs.
  - Corrected record count for ACME BRE (104 runs), FLEX (150 runs), reclassified ACME E-FIELD (metadata/video only), and Combustion Integrated Rack (facility reference).
  - Expanded provenance engine to 5 granular forensic tiers.
- [x] **Task 8: Phase 2.2 Scientific Boundary Corrections:**
  - Implemented Table 6.2-1 inspired oxygen equation: $PIO_2 = (P_B - 47\text{ mmHg}) \times FIO_2$.
  - Established strict Normoxia Target ($145 - 155\text{ mmHg}$) and reclassified Artemis EAM ($PIO_2 \approx 128.2\text{ mmHg}$) as MILD HYPOXIA.
  - Corrected [V2 6006] strict pressure boundary ($34.5 < P \le 103.0\text{ kPa}$).
  - Excised unsupported 14-day duration limitation on [V2 6002] 30% diluent gas rule.
  - Excised automatic zero-g flame extinction fallacy; decomposed combustion into 4 transport mechanisms; returned `MODEL_OUT_OF_SCOPE` for quiescent microgravity in 1D convective proxy.
  - Automated test suite expanded to **600 passing assertions** across 11 test suites (100% pass rate).
- [x] **Task 9: Phase 2.2.1 Independent Evidence & Claim Audit:**
  - Audited Table 6.2-1 normative categories; distinguished 127 mmHg TWA qualification from 122 mmHg absolute lower limit.
  - Disambiguated PSI-21 (ACME CLD Flame) from ACME s-Flame.
  - Sourced primary paper for FLEX cool flame discovery (Nayagam et al., 2012, DOI 10.1016/j.combustflame.2012.07.009).
  - Explicitly separated quantitative convection from conceptual diffusion and parameterized radiative losses.
  - Classified 0.5 cm/s and 1.0 cm/s thresholds as PROJECT_DEFINED_MODEL_GUARDRAILS.
  - Disclosed 6 analytical assumptions of De Ris (1969) model; clarified empirical anchor baseline.
  - Audited Nomex HT90-40 hazard figures; tagged modelled spread rate as UNVERIFIED.
  - Test suite expanded to 12 suites, **686 passing assertions** (100% pass rate).
- [x] **Task 10: Phase 2.2.2 Final Evidence Traceability & Baseline Freeze:**
  - Enforced official Table 6.2-1 terms: "Normoxia Target Range" and "Mild Hypoxia Lower Limit".
  - Preserved Footnote ** monitoring plan and Footnote **** 1-hr TWA / 122 mmHg limit.
  - Explicitly separated project-defined operational interpretation band from formal NASA categories.
  - Verified direct NASA repository accession PSI-21 (ACME CLD Flame) and marked standalone s-Flame ID as UNVERIFIED.
  - Verified FLEX cool-flame discovery citation and enforced non-interchangeability boundary with gaseous spherical flames.
  - Formulated De Ris (1969) analytical equation for thin fuels and traceable literature citation.
  - Traced DuPont Nomex HT90-40 LOI (28.0–30.0%) to ASTM D2863 / NASA TP-2007-213777 and NASA-STD-6001B Test 1.
  - Retained 0.8 mm/s flame spread rate as UNVERIFIED and 85% score as MODELLED_HEURISTIC.
  - Expanded test suite to 13 suites, **722 passing assertions** (100% pass rate, 0 failures).
  - Authored `docs/PHASE_2_2_2_FINAL_TRACEABILITY_REPORT.md`.
- [x] **Task 11: Phase 2.2.3 Final Model Reference & Material Test Correction:**
  - Verified original De Ris (1969) paper title (*"Spread of a laminar diffusion flame"*) and corrected DOI to `10.1016/S0082-0784(69)80407-8`.
  - Corrected radiation treatment: explicitly documented that radiation is heat loss at flame sheet and heat gain at fuel-bed surface (NOT neglected).
  - Explicitly distinguished original De Ris thin-fuel and thick-fuel analytical equations from project's adapted 1D phenomenological scaling proxy; designated unverified mathematical details as UNVERIFIED.
  - Corrected NASA-STD-6001B Test 1 acceptance criteria: burn length <= 15.0 cm (6.0 in.) across all 5 specimens and zero indicator paper ignition (excised incorrect propagation > 12 in. failure threshold).
  - Retained 0.8 mm/s spread rate as UNVERIFIED_MODELLED_PROXY and 85% score as MODELLED_HEURISTIC.
  - Expanded test harness to 14 suites, **756 passing assertions** (100% pass rate, 0 failures).
  - Authored `docs/PHASE_2_2_3_FINAL_CORRECTION_REPORT.md` and `tests/scientific/phase-2-2-3-validation-report.md`.
- [x] **Task 12: Phase 2.2.4 Final Standards & Model Traceability Audit:**
  - Corrected NASA-STD-6001B w/Change 3 Section 7.1.2(b) specimen dimensions to exactly 30 cm x 6.5 cm (12 in x 2.5 in), tested one at a time, mounted vertically.
  - Enforced acceptance criteria: burn length <= 15.0 cm (6.0 in.) and zero ignition of K-10 paper; failure of ANY ONE specimen constitutes material failure.
  - Excised unsupported fixed 25 s ignition dwell mandate; labeled calibrated energy delivery as standard and fixed dwell as LABORATORY_TEST_CONFIG_ONLY.
  - Reconciled project model equation version history: actual code formula `spreadIndex = o2Ratio^1.35 * pressScale^0.35 * ventBonus` audited and reconciled with documentation; exponents classified as UNVERIFIED_MODELLED_HEURISTIC with zero validation claims.
  - Labeled unverified De Ris equation numbers/pages and Nomex page citations UNVERIFIED.
  - Expanded test harness to 15 suites, **780 passing assertions** (100% pass rate, 0 failures).
  - Authored `docs/PHASE_2_2_4_FINAL_AUDIT_REPORT.md` and `tests/scientific/phase-2-2-4-validation-report.md`.
- [x] **Task 13: Phase 2.2.4.1 Evidence Closure Addendum:**
  - Reclassified 25 s ignition duration as UNVERIFIED; removed attribution to WSTF as an established fact due to lack of primary record.
  - Audited ignition source energy: verified 750 ± 50 J as standard delivered thermal energy per NASA-STD-6001B Section 7.1.3.1 & App A.1.2; distinguished from 2000 kJ/m² energy fluence from secondary literature; verified non-interchangeability.
  - Marked De Ris thin- and thick-fuel equations UNVERIFIED; confirmed they are NOT calculation paths in the software.
  - Formally documented runtime `spreadIndex` input contract: oxygen units & software floor 0.0, residual spreadIndex below LOI via `Math.max(0.1, ...)`, LOI bounds [12.5, 24.0], pressure reference values (10.2 / 14.7 psia), hard vacuum zero pressure behavior, piecewise ventilation tiers, orthogonal gravity coupling without explicit g exponent.
  - Added boundary tests for zero pressure, sub-0.1 psi pressure, sub-LOI oxygen, hypoxic purge, ventilation tiers, and physiological vacuum.
  - Expanded test harness to 16 suites, **823 passing assertions** (100% pass rate, 0 failures).
  - Authored `docs/PHASE_2_2_4_1_EVIDENCE_CLOSURE_ADDENDUM.md` and `tests/scientific/phase-2-2-4-1-validation-report.md`.
- [x] **Task 14: Phase 2.2.4.2 Ignition Citation and Runtime Contract Correction:**
  - Forensic audit of ignition source: identified historical 750 ± 50 cal in NASA Handbook NHB 8060.1B/C Test 1 ($3138 \pm 209$ J), explained factor-of-4.184 unit error, removed false claim of NASA-STD-6001B Sections 7.1.3.1 and App A.1.2 mandating 750 J, verified active standard cites ISO 14624-1 ($25 \pm 5$ s, $1100 \pm 90^\circ$C, $65 \pm 6.5$ mm).
  - Resolved Nomex LOI contract domain conflict: runtime 1D convective LOI scaling model clamped to [12.5, 24.0]% is SIBAL-specific ($17.5\%$ base); preserved Nomex documented LOI (28.0 - 30.0% O2) without silent truncation, returning `materialModelStatus: 'MATERIAL_OUTSIDE_SUPPORTED_LOI_DOMAIN'` and `modelSupported: false`.
  - Reconciled oxygen-term formula `o2Ratio = Math.pow(Math.max(0.1, (o2Val - loi) / 5.5), 1.35)`: documented 6-step execution order, proved JavaScript `Math.pow(negative, 1.35) === NaN` requiring anti-NaN clamp, demonstrated non-zero `spreadIndex` ($0.048225$) below LOI is a software anti-NaN floor artifact rather than physical combustion, and added numerical boundary tests.
  - Reclassified SIBAL hypoxic override ($0.2$ mm/s below 10% O2) as `UNVERIFIED_MODELLED_HEURISTIC` (SAFFIRE-I never measured SIBAL below 10% O2).
  - Expanded test harness to 17 suites, **848 passing assertions** (100% green, 0 failures).
  - Authored `docs/PHASE_2_2_4_2_RUNTIME_AND_IGNITION_CORRECTION.md` and `tests/scientific/phase-2-2-4-2-validation-report.md`.
  - Reaffirmed scientific baseline freeze and explicit flight qualification scope disclaimer.
- [x] **Task 15: Phase 2.3.1 NASA Data API Discovery & Source Verification:**
  - Investigated Parse.bot scraper API endpoint (`https://api.parse.bot/scraper/328daab1-12f9-4464-b73d-b5e0c392bfe7/list_data_resources`).
  - Executed live server probes: confirmed server reachability and strict enforcement of `X-API-Key` (HTTP 401 on missing/invalid key).
  - Enforced strict credential privacy: verified `PARSE_API_KEY` is not exposed or committed; recorded `MISSING_API_KEY` status without fabricating mock data as real.
  - Authored production-grade Python client in `backend/ingestion/parse_api_client.py` with configurable timeout, error handling, credential masking, dynamic schema detection, NASA source classifier, and data availability auditor.
  - Authored CLI tool in `scripts/data-ingestion/inspect_parse_api.py`.
  - Established 7-Criterion NASA Source Verification Protocol (5 tiers: `VERIFIED_NASA_SOURCE` to `NON_RELEVANT`) and 12-Field Combustion Data Availability Matrix (`AVAILABLE`, `MISSING`, `INFERRED`, `UNVERIFIED`).
  - Authored 12 Python unit and contract tests in `tests/backend/test_parse_api_client.py` and runner in `tests/run_backend_tests.py` (12/12 passing).
  - Added `test:backend` and `test:all` scripts to `package.json`.
  - Preserved all 17 Node.js scientific verification suites (848 passing assertions, 0 failures).
  - Authored `docs/PHASE_2_3_1_API_DISCOVERY_REPORT.md`, `docs/NASA_API_RESPONSE_SCHEMA.md`, and `docs/NASA_DATA_SOURCE_VERIFICATION_MATRIX.md`.
- [x] **Task 16: Phase 2.3.2 Secure Shared Parse.bot API Integration:**
  - Implemented server-side environment variable `PARSE_API_KEY` in gitignored `.env`.
  - Updated `.env.example` documenting configuration without exposing credentials.
  - Implemented secure proxy endpoint (`GET/POST /api/v1/nasa/resources`) in `backend/api/main.py`.
  - Implemented `SlidingWindowRateLimiter` (30 requests/minute per client IP) with HTTP 429 response handling.
  - Configured frontend integration client in `src/services/api/nasa-resources-client.js`.
  - Authored 11 automated backend proxy tests in `tests/backend/test_proxy_endpoint.py`.
  - Authored `docs/PARSE_BOT_INTEGRATION_GUIDE.md` and `docs/PHASE_2_3_2_SHARED_API_INTEGRATION_REPORT.md`.
- [x] **Task 17: Phase 2.3.3 NASA Data Verification & Catalogue Integration:**
  - Audited application auth: excised static shared secret `DEFAULT_APP_TOKEN` from frontend JavaScript; implemented dynamic session handshake (`POST /api/v1/auth/session`) issuing secure tokens (`secrets.token_urlsafe(32)`) with 1-hour TTL.
  - Inspected real NASA resources retrieved via backend proxy from Parse.bot scraper `328daab1-12f9-4464-b73d-b5e0c392bfe7`.
  - Audited Section 4 physical science accessions (`PSI-178`, `PSI-138`, `PSI-187`) against `https://psi.nasa.gov`: confirmed all are non-combustion (Materials Science / Levitation, Fluid Physics / Boiling, Fluid Physics / Capillary Plant Water).
  - Quarantined Section 3 candidates (`OSD-979`, `OSD-729`, `OSD-554`) as biological data.
  - Authored `backend/ingestion/catalogue_integrator.py`: raw storage with SHA-256 manifests, schema normalization, and non-combustion segregation into `src/data/reference/discovered-bps-resources.json`.
  - Implemented Epistemic Precedence Hierarchy and Provenance Protection Invariant: guaranteed that `VERIFIED_DATASET` records (e.g. Saffire-I flight spread velocity) are never downgraded or overwritten by scraped metadata.
  - Preserved all 19 original combustion flight investigations in `src/data/reference/psi-investigations.json`.
  - Authored 8 integration tests in `tests/backend/test_catalogue_integration.py`; achieved 34/34 passing backend tests and 848/848 passing Node.js assertions.
  - Authored `docs/NASA_CATALOGUE_INTEGRATION_SPEC.md`, `docs/NASA_INVESTIGATION_VERIFICATION_MATRIX.md`, and `docs/PHASE_2_3_3_NASA_DATA_INTEGRATION_REPORT.md`.

---

## 3. Next Phase Gates

```
Phase 1 (Complete) ➔ Phase 1.1 (Complete) ➔ Phase 2 (Complete) ➔ Phase 2.1 (Complete) ➔ Phase 2.2 (Complete) ➔ Phase 2.2.1 (Complete) ➔ Phase 2.2.2 (Complete) ➔ Phase 2.2.3 (Complete) ➔ Phase 2.2.4 (Complete) ➔ Phase 2.2.4.1 (Complete) ➔ Phase 2.2.4.2 (Complete & FROZEN) ➔ Phase 2.3.1 (Complete) ➔ Phase 2.3.2 (Complete) ➔ Phase 2.3.3 (Complete & VERIFIED) ➔ [AWAITING USER GATE APPROVAL FOR PHASE 3] ➔ Phase 3 (Gemini RAG Integration)
```

No Phase 3 Gemini RAG integration will commence without explicit user review and authorization.
