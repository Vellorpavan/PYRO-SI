# GODEYE // PYRO-SI — NASA Data Source Verification & Availability Matrix
**Phase 2.3.1 Scientific Data Audit & Epistemic Evaluation**

**Document Identifier:** NASA-PYRO-MATRIX-231  
**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Auditor:** Lead Data Integration Engineer, Python Backend Engineer & Scientific Verification Specialist  
**Date:** November 15, 2026  
**Status:** COMPLETE (Phase 2.3.1)  
**Governing Standard:** NASA SPD-41a (Scientific Data & Information Policy)  

---

## 1. Executive Summary & Objective

In Phase 2.3.1, GODEYE // PYRO-SI established a rigorous verification framework to evaluate whether external data discovery endpoints (specifically Parse.bot scraper `328daab1-12f9-4464-b73d-b5e0c392bfe7`) can serve as an authentic, reliable retrieval layer for NASA microgravity combustion research data.

Under **NASA SPD-41a**, scientific claims must be traceable to primary flight archives, verified government repositories, or peer-reviewed primary publications with documented DOI accessions. Web scrapers frequently ingest secondary blog posts, news aggregators, or unvalidated commercial summaries.

This matrix establishes:
1. The **7-Criterion NASA Source Verification Protocol** (Phase 3).
2. The **5-Tier Epistemic Source Classification System**.
3. The **Master Investigation Verification Ledger** evaluating core flight datasets and secondary literature.
4. The **12-Field Combustion Data Availability Matrix** (Phase 4), separating what is actually available from missing, inferred, or unverified parameters.

---

## 2. Phase 3: The 7-Criterion NASA Source Verification Protocol

Every resource ingested from an external scraper or API is evaluated against 7 strict binary gates:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THE 7-CRITERION NASA VERIFICATION GATES                         │
├──────┬──────────────────────────────────────────┬──────────────────────────────────────┤
│ Gate │ Verification Criterion                   │ Evidence Requirement                 │
├──────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ C-01 │ NASA Related                             │ Explicit reference to NASA program,  │
│      │                                          │ mission, flight vehicle, or facility.│
├──────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ C-02 │ Original NASA Source Identified          │ Authoritative domain identified      │
│      │                                          │ (`nasa.gov`, `psi.nasa.gov`, NTRS).  │
├──────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ C-03 │ Direct PSI Record or Publication         │ Canonical accession ID (`PSI-XX`) or │
│      │                                          │ official NASA report series (TM/TP). │
├──────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ C-04 │ Official Investigation Identifier        │ Standardized alphanumeric ID assigned│
│      │                                          │ by NASA Glenn or mission office.     │
├──────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ C-05 │ Downloadable Research File               │ Direct accessible URI to raw data    │
│      │                                          │ (CSV, HDF5, NetCDF, PDF, TIFF stack).│
├──────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ C-06 │ Quantitative Measurements Available      │ Time-series, sensor numbers, or test │
│      │                                          │ points (not merely qualitative text).│
├──────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ C-07 │ Independently Accessible & Verifiable    │ Link resolves HTTP 200; DOI resolves │
│      │                                          │ via CrossRef; PSI portal validates.  │
└──────┴──────────────────────────────────────────┴──────────────────────────────────────┘
```

### 2.1 The 5-Tier Source Classification Taxonomy

- **`VERIFIED_NASA_SOURCE` (Tier 1):** Directly hosted on official NASA infrastructure (`psi.nasa.gov`, `ntrs.nasa.gov`) or peer-reviewed DOI publication with confirmed NASA principal investigators, containing validated experimental flight/ground records.
- **`NASA_SOURCE_CANDIDATE` (Tier 2):** Matches authentic NASA combustion investigation nomenclature and carries an accession ID (`PSI-XX`), but requires secondary corroboration of host URLs or dataset checksums before promotion.
- **`THIRD_PARTY_REFERENCE` (Tier 3):** Peer-reviewed academic literature or university research citing NASA flight data, but hosted on non-NASA publishers (e.g. Elsevier, Springer, AIAA) without raw government accession.
- **`UNVERIFIED_SOURCE` (Tier 4):** Text mentions NASA, astronauts, or spaceflight, but lacks formal accession IDs, valid DOIs, or primary archival references.
- **`NON_RELEVANT` (Tier 5):** Unrelated industrial, automotive, or terrestrial data with no connection to microgravity combustion or spacecraft life safety.

---

## 3. Master Investigation Verification Ledger

The ledger below audits the 19 core investigations from `psi-investigations.json` and representative candidate resources discovered via research scrapers:

| ID / Resource | Investigation Title | Facility / Vehicle | NASA Domain | PSI / Doc ID | Downloadable File | Quantitative Data | Verification Classification |
|---|---|---|---|---|---|---|---|
| **PSI-25** | Burning and Suppression of Solids - II (BASS-II) | MSG (ISS) | `psi.nasa.gov` | `PSI-25` | CSV / Video / PDF | Yes (Flow, O2, Flame Spread) | **`VERIFIED_NASA_SOURCE`** |
| **PSI-98** | Saffire-I Flight Experiment | Cygnus OA-6 | `psi.nasa.gov` | `PSI-98` | CSV / Video / PDF | Yes (SIBAL $2.24\text{ mm/s}$, Radiometry) | **`VERIFIED_NASA_SOURCE`** |
| **PSI-159**| Saffire-II Flight Experiment | Cygnus OA-5 | `psi.nasa.gov` | `PSI-159` | CSV / PDF | Yes (9 Fabric / Plexiglas cards) | **`VERIFIED_NASA_SOURCE`** |
| **PSI-160**| Saffire-III Flight Experiment | Cygnus OA-7 | `psi.nasa.gov` | `PSI-160` | CSV / Video | Yes (High airflow $30\text{ cm/s}$ runs) | **`VERIFIED_NASA_SOURCE`** |
| **PSI-20** | ACME Burning Rate Emulator (BRE) | CIR (ISS) | `psi.nasa.gov` | `PSI-20` | CSV / Video | Yes (104 gaseous burn runs) | **`VERIFIED_NASA_SOURCE`** |
| **PSI-21** | ACME CLD Flame | CIR (ISS) | `psi.nasa.gov` | `PSI-21` | Video / Metadata | Limited (Co-flow laminar diffusion) | **`VERIFIED_NASA_SOURCE`** |
| **PSI-12** | ACME CFI-G (Partial-G Growth) | CIR (ISS) | `psi.nasa.gov` | `PSI-12` | Video / CSV | Yes (Low-buoyancy flame growth) | **`VERIFIED_NASA_SOURCE`** |
| **PSI-69** | Flame Extinction Experiment (FLEX) | CIR (ISS) | `psi.nasa.gov` | `PSI-69` | CSV / Video | Yes (150 droplet extinction runs) | **`VERIFIED_NASA_SOURCE`** |
| **Nayagam 2012** | Cool Flame Discovery Paper | Academic (C&F) | None (Elsevier) | DOI `10.1016/j.combustflame.2012.07.009` | PDF (Paywall/DOI) | Yes (Droplet diameter vs time) | **`THIRD_PARTY_REFERENCE`** |
| **De Ris 1969** | Spread of a Laminar Diffusion Flame | Academic (12th Symp) | None (Combust Inst) | DOI `10.1016/S0082-0784(69)80407-8` | PDF (Paywall/DOI) | Analytical theory (Closed form) | **`THIRD_PARTY_REFERENCE`** |
| **T'ien & Ferkul 1999**| Low-Buoyancy Flame Spread Model | Academic (NASA Grant) | NTRS / AIAA | AIAA 1999-0444 | PDF | Theoretical curve (Partial-g peak) | **`THIRD_PARTY_REFERENCE`** |
| **ASTM D2863** | Ambient Oxygen Index Test Method | Standard Org | None (ASTM) | ASTM D2863 | Standard Spec | Standard LOI test method | **`THIRD_PARTY_REFERENCE`** |
| **WSTF 25s Dwell** | Informal WSTF Ignition Duration | WSTF (Anecdote) | None produced | None produced | None | Unsubstantiated anecdote | **`UNVERIFIED_SOURCE`** |
| **Scraper Aggregator** | "Top 10 Space Station Fire Experiments" | Blog / News | Commercial | None | None | None (General descriptions) | **`UNVERIFIED_SOURCE`** |

---

## 4. Phase 4: Data Availability Assessment Matrix

To prevent the fabrication or assumption of scientific data, external data discovery sources are audited against the 12 core combustion engineering parameters. 

Each parameter is categorized into one of four mutually exclusive states:
- **`AVAILABLE`**: Explicitly present, structured, and parseable in the ingested resource.
- **`MISSING`**: Absent from the resource payload.
- **`INFERRED`**: Not directly recorded as a scalar, but logically deduced from context (e.g. ambient terrestrial gravity $1g$ inferred from ground laboratory location).
- **`UNVERIFIED`**: Mentioned in narrative text, but lacks verifiable raw files, calibration metadata, or primary source citation.

### 4.1 Master 12-Field Combustion Data Availability Matrix

```
┌───────────────────────────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Scientific Field                      │ NASA PSI     │ Parse.bot    │ Academic     │ Web Blog /   │
│                                       │ Primary Data │ Scraped Meta │ Paper (DOI)  │ Aggregator   │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 1. Investigation Metadata             │ AVAILABLE    │ AVAILABLE    │ AVAILABLE    │ AVAILABLE    │
│    (Title, PI, Facility, Rack)        │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 2. Experimental Datasets              │ AVAILABLE    │ UNVERIFIED   │ AVAILABLE    │ MISSING      │
│    (Run matrix, test series)          │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 3. CSV Structured Measurements        │ AVAILABLE    │ MISSING      │ MISSING      │ MISSING      │
│    (Thermocouple logs, radiometry)    │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 4. Research Papers & PDFs             │ AVAILABLE    │ AVAILABLE    │ AVAILABLE    │ MISSING      │
│    (Final reports, AIAA papers)       │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 5. Experimental Conditions            │ AVAILABLE    │ INFERRED     │ AVAILABLE    │ MISSING      │
│    (Temperature, diluent gas)         │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 6. Fuel & Material Information        │ AVAILABLE    │ AVAILABLE    │ AVAILABLE    │ UNVERIFIED   │
│    (Thickness, weave, chemistry)      │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 7. Oxygen Concentration               │ AVAILABLE    │ UNVERIFIED   │ AVAILABLE    │ MISSING      │
│    (O2 %, mole fraction, pO2)         │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 8. Total Pressure                     │ AVAILABLE    │ UNVERIFIED   │ AVAILABLE    │ MISSING      │
│    (psia, kPa, chamber pressure)      │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 9. Gravity Conditions                 │ AVAILABLE    │ INFERRED     │ AVAILABLE    │ INFERRED     │
│    (0g microgravity, partial-g)       │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 10. Airflow & Ventilation             │ AVAILABLE    │ UNVERIFIED   │ AVAILABLE    │ MISSING      │
│     (Forced duct velocity cm/s)       │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 11. Sensor & Measurement Information  │ AVAILABLE    │ UNVERIFIED   │ AVAILABLE    │ MISSING      │
│     (Radiometer, IR, camera fps)      │              │              │              │              │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 12. Downloadable Original Files       │ AVAILABLE    │ UNVERIFIED   │ MISSING      │ MISSING      │
│     (Direct raw archive links)        │              │              │              │              │
└───────────────────────────────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 5. Critical Epistemic Findings & Ingestion Constraints

### 5.1 Web Scrapers vs. Primary Flight Archives
The fundamental finding of this discovery phase is that **web scrapers (such as Parse.bot) primarily discover and index textual metadata, abstracts, and landing page URLs.**
- Scrapers excel at discovering *titles, investigators, facilities, abstracts, and links*.
- Scrapers **do not** automatically parse or expose high-frequency scientific data streams (e.g. 100 Hz thermocouple arrays, radiometer photodiode voltages, or multi-gigabyte uncompressed high-speed video frames).
- Therefore, external scraper APIs **must serve as an initial discovery and catalogue indexing layer**, but must **never be treated as a primary numerical simulation feed**.

### 5.2 Strict Scientific Anti-Hallucination Directives
1. **Never Invent Missing Measurements:** If a scraped resource reports that an investigation took place in microgravity with SIBAL fabric, but does not provide the exact oxygen percentage or measured spread rate, the application must mark those parameters as `MISSING` or `UNVERIFIED`.
2. **Preserve Single-Point Flight Calibration:** GODEYE // PYRO-SI's flammability simulator relies strictly on single-point calibration against verified SAFFIRE-I SIBAL data ($2.24\text{ mm/s}$ at $21.5\%\ \text{O}_2$, $20\text{ cm/s}$ flow). Scraped text shall not overwrite this baseline without manual review and empirical dataset validation.
3. **Traceability Rule:** No external scraped record may be merged into `psi-investigations.json` without an attached 7-attribute provenance record conforming to `src/utils/provenance.js`.
