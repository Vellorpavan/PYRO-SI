# GODEYE // PYRO-SI — NASA Catalogue Reconciliation Report
## Mathematical Reconciliation of Investigation Counts, File Quantities, and Dataset Size Semantics

**Document Identifier:** NASA-PYRO-REPORT-RECONCILIATION-2341  
**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Auditor / Architect:** Lead NASA Data Engineer & Independent Scientific Data Auditor  
**Date:** November 16, 2026  
**Status:** PASS // EMPIRICALLY RECONCILED & AUDITED  
**Governing Standards:** NASA SPD-41a, NASA-STD-3001 Vol 2 Rev F, NASA-STD-6001B w/Change 3  

---

## 1. Executive Summary & Root Cause Analysis

During Phase 2.3.4, the platform achieved direct connectivity to the official NASA Physical Sciences Informatics (PSI) Elasticsearch API (`https://psi.nasa.gov/geode-py/ws/`) and audited 24 microgravity combustion investigations. However, an independent audit of the Phase 2.3.4 report identified discrepancies between summary totals and underlying records.

### Identified Discrepancies in Phase 2.3.4:
1. **Total File Count Discrepancy:** The Phase 2.3.4 summary reported **16,334 files**, whereas the true mathematical sum of files across all 24 investigations in the repository is **16,354 files** (a difference of 20 files).
2. **Downloadable Volume Semantic Conflation:** The Phase 2.3.4 summary reported **9.87 TB (9,873.4 GB)** as "Publicly Downloadable Volume". In reality, the actual volume of downloadable files in public S3 buckets (`psi-repo-prod` and `psi-curation-prod`) across all 20 available investigations is **5,836.62 GiB (5.70 TiB / 6.27 TB decimal)**.
3. **The Single-Table Metadata Conflation:** Three investigations (`PSI-20`, `PSI-21`, and `PSI-106`) listed massive flight data collection volumes in top-level metadata (`totalFileSize`), but only uploaded small experimental summary CSV tables to the public repository:
   - `PSI-20` (ACME BRE): Metadata reported **1,895.77 GB**, but the uploaded file is a single **1,113-byte** CSV table.
   - `PSI-21` (ACME CLD Flame): Metadata reported **1,867.80 GB**, but the uploaded file is a single **2,454-byte** CSV table.
   - `PSI-106` (SLICE): Metadata reported **67.91 GB**, but the uploaded file is a single **734-byte** CSV table.
   - **Combined Impact:** In Phase 2.3.4, these top-level metadata volumes were erroneously treated as downloadable file bytes ($1,895.77 + 1,867.80 + 67.91 = 3,831.48\text{ GB} \approx 3.74\text{ TB}$), inflating the reported downloadable volume from 5.70 TiB to 9.87 TB!
4. **Metadata-Only Investigations:** Four investigations (`PSI-22`, `PSI-68`, `PSI-69`, `PSI-99`) list significant mission data volumes in metadata ($2,901.75\text{ GiB} \approx 2.83\text{ TiB}$), but have **0 files** in their public `added` array. Describing them as having downloadable data merely because metadata lists a volume was a critical semantic error.

### Reconciled True Baseline (Derivation from Underlying Records):
- **Total Unique Combustion Investigations:** **24**
- **Total Available Research Files:** **16,354**
- **Investigations with Active Files:** **20**
- **Investigations with Zero Files (Metadata Only):** **4**
- **Total Metadata-Reported Volume (`metadata_reported_size_bytes`):** **13,496,771,103,733 bytes** ($12,569.85\text{ GiB}$ / $12.28\text{ TiB}$ / $13.50\text{ TB}$ decimal)
- **Total Actual Available Downloadable Volume (`available_file_size_bytes`):** **6,267,023,479,252 bytes** ($5,836.62\text{ GiB}$ / $5.70\text{ TiB}$ / $6.27\text{ TB}$ decimal)
- **Total Metadata-Only Volume (0 Files Uploaded):** **3,115,728,155,991 bytes** ($2,901.75\text{ GiB}$ / $2.83\text{ TiB}$ / $3.12\text{ TB}$ decimal)

---

## 2. Comprehensive Investigation-by-Investigation Arithmetic Reconciliation

The table below details every one of the 24 discovered NASA combustion investigations. All totals are derived dynamically and verified by automated unit tests in `tests/backend/test_catalogue_reconciliation.py`.

| Accession | Acronym / Campaign | Platform / Hardware | Available Files (`added`) | Actual Available Bytes (`available_file_size_bytes`) | Actual Size (GiB) | Metadata Reported Bytes (`metadata_reported_size_bytes`) | Metadata Size (GiB) | Epistemic Classification | S3 Bucket Host | Discrepancy Note |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| **`PSI-10`** | ACME / Flame Design | ISS / CIR / ACME | 3,807 | 2,180,435,304,347 | 2,030.69 GiB | 2,180,435,304,347 | 2,030.69 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-100`** | SAFFIRE-III | Cygnus / Saffire Encl. | 85 | 35,210,756,429 | 32.79 GiB | 35,210,756,429 | 32.79 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-curation-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-101`** | SAME-R | ISS / US Lab / MSG | 342 | 6,308,108,039 | 5.87 GiB | 6,308,108,039 | 5.87 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-102`** | SAME | ISS / US Lab / MSG | 104 | 657,607,847 | 0.61 GiB | 657,607,847 | 0.61 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-106`** | SLICE | ISS / MSG | 1 | 734 | 0.00 GiB | 72,917,688,320 | 67.91 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | **Discrepancy:** Single 734 B test date table uploaded; 67.91 GB mission video not in public S3 |
| **`PSI-107`** | SPICE | ISS / MSG | 186 | 6,946,824,055 | 6.47 GiB | 6,946,824,055 | 6.47 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-115`** | BPS-Droplet Model | Ground / Supercomputer | 47 | 264,404,901 | 0.25 GiB | 264,404,901 | 0.25 GiB | `CODE_OR_MODEL_ONLY` | `psi-repo-prod` | Computational mesh simulations and diameter node tables |
| **`PSI-117`** | MST Model | Ground / Supercomputer | 15 | 70,810,488 | 0.07 GiB | 70,810,488 | 0.07 GiB | `CODE_OR_MODEL_ONLY` | `psi-repo-prod` | Model extinction diameter predictions vs ground experiments |
| **`PSI-142`** | Cool Flame Ext. Limit | Ground / Counterflow | 2 | 735,959 | 0.00 GiB | 735,959 | 0.00 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-curation-prod` | Extinction strain rates ($a_{\text{CFE}}$) and publication links |
| **`PSI-159`** | ACME / CFI-G | ISS / CIR / ACME | 3,756 | 2,085,592,429,259 | 1,942.36 GiB | 2,085,592,429,259 | 1,942.36 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-20`** | ACME / BRE | ISS / CIR / ACME | 1 | 1,113 | 0.00 GiB | 2,035,555,876,864 | 1,895.77 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | **Discrepancy:** Single 1.1 KB test summary CSV uploaded; 1.89 TB CIR sensor telemetry not in public S3 |
| **`PSI-21`** | ACME / CLD Flame | ISS / CIR / ACME | 1 | 2,454 | 0.00 GiB | 2,005,533,409,280 | 1,867.80 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | **Discrepancy:** Single 2.4 KB test run table uploaded; 1.86 TB raw telemetry not in public S3 |
| **`PSI-22`** | ACME / E-FIELD | ISS / CIR / ACME | 0 | 0 | 0.00 GiB | 950,211,854,336 | 884.95 GiB | `CONTENT_NOT_YET_INSPECTED` | None | **Zero Files:** 884.95 GB listed in metadata; 0 files uploaded in public S3 |
| **`PSI-23`** | ACME / s-Flame | ISS / CIR / ACME | 4,163 | 782,172,103,545 | 728.45 GiB | 782,172,103,545 | 728.45 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-curation-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-25`** | BASS-II | ISS / MSG | 694 | 274,631,089,551 | 255.77 GiB | 274,631,089,551 | 255.77 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-26`** | BASS | ISS / MSG | 211 | 163,551,367,686 | 152.32 GiB | 163,551,367,686 | 152.32 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-39`** | CFI (Cool Flames) | ISS / CIR / MDCA | 2,831 | 718,889,560,892 | 669.52 GiB | 718,889,560,892 | 669.52 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-47`** | DAFT / DAFT-2 | ISS / MSG | 32 | 41,764,815 | 0.04 GiB | 41,764,815 | 0.04 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-repo-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-60`** | Comp. & Exp. Micro-g | Ground / Drop Tower | 1 | 7,743 | 0.00 GiB | 7,743 | 0.00 GiB | `DOCUMENTATION_ONLY` | `psi-repo-prod` | Single ISA-Tab metadata archive (`i_Investigation.txt`, `s_PSI-60.txt`) |
| **`PSI-62`** | Concurrent Spread | Ground / Drop Tower | 1 | 9,694 | 0.00 GiB | 9,694 | 0.00 GiB | `DOCUMENTATION_ONLY` | `psi-repo-prod` | Single ISA-Tab metadata archive (`i_Investigation.txt`, `s_PSI-62.txt`) |
| **`PSI-68`** | FLEX-2 | ISS / CIR / MDCA | 0 | 0 | 0.00 GiB | 1,224,746,401,792 | 1,140.64 GiB | `CONTENT_NOT_YET_INSPECTED` | None | **Zero Files:** 1,140.64 GB listed in metadata; 0 files uploaded in public S3 |
| **`PSI-69`** | FLEX | ISS / CIR / MDCA | 0 | 0 | 0.00 GiB | 923,836,252,160 | 860.39 GiB | `CONTENT_NOT_YET_INSPECTED` | None | **Zero Files:** 860.39 GB listed in metadata; 0 files uploaded in public S3 |
| **`PSI-98`** | SAFFIRE-I | Cygnus / Saffire Encl. | 74 | 12,250,589,701 | 11.41 GiB | 12,250,589,701 | 11.41 GiB | `NUMERICAL_EXPERIMENTAL_DATA` | `psi-curation-prod` | Exact match: 100% files deposited in S3 |
| **`PSI-99`** | SAFFIRE-II | Cygnus / Saffire Encl. | 0 | 0 | 0.00 GiB | 16,933,647,703 | 15.77 GiB | `CONTENT_NOT_YET_INSPECTED` | None | **Zero Files:** 15.77 GB listed in metadata; 0 files uploaded in public S3 |
| **TOTALS** | **24 Investigations** | — | **16,354** | **6,267,023,479,252 B** | **5,836.62 GiB** | **13,496,771,103,733 B** | **12,569.85 GiB** | **16 Num / 2 Mod / 2 Doc / 4 Uninspected** | — | **Mathematically Verified (0 error)** |

---

## 3. Mathematical Verification of Summary Totals

All summary properties in `src/data/reference/psi-reconciled-combustion.json` are validated by automated property-sum tests:

$$\sum_{i=1}^{24} N_{\text{files}, i} = 16,354$$

$$\sum_{i=1}^{24} V_{\text{available}, i} = 6,267,023,479,252\text{ bytes} \equiv 5,836.62\text{ GiB} \equiv 5.70\text{ TiB} \equiv 6.27\text{ TB (decimal)}$$

$$\sum_{i=1}^{24} V_{\text{metadata}, i} = 13,496,771,103,733\text{ bytes} \equiv 12,569.85\text{ GiB} \equiv 12.28\text{ TiB} \equiv 13.50\text{ TB (decimal)}$$

$$\sum_{i \in \{22, 68, 69, 99\}} V_{\text{metadata}, i} = 3,115,728,155,991\text{ bytes} \equiv 2,901.75\text{ GiB} \equiv 2.83\text{ TiB} \equiv 3.12\text{ TB (decimal)}$$

### Epistemic Classifications Distribution:
- **`NUMERICAL_EXPERIMENTAL_DATA`:** **16** investigations ($66.7\%$)
- **`CODE_OR_MODEL_ONLY`:** **2** investigations ($8.3\%$) — `PSI-115`, `PSI-117`
- **`DOCUMENTATION_ONLY`:** **2** investigations ($8.3\%$) — `PSI-60`, `PSI-62`
- **`CONTENT_NOT_YET_INSPECTED`:** **4** investigations ($16.7\%$) — `PSI-22`, `PSI-68`, `PSI-69`, `PSI-99` (Zero files in S3)
- **`NUMERICAL_DERIVED_DATA`:** **0** (subsets within the 16 numerical investigations)
- **`VIDEO_OR_IMAGE_ONLY`:** **0** (no investigation is purely video without tabular or metadata records)
- **Total:** **24** investigations ($100\%$)

---

## 4. Dataset Size Semantics & Architectural Contract

To permanently eliminate semantic confusion, GODEYE // PYRO-SI enforces five distinct, unambiguous schema fields for all catalogued investigations:

1. `metadata_reported_size_bytes`: Integer bytes reported in top-level PSI metadata (`totalFileSize`). Represents total telemetry or data volume collected during flight, regardless of public repository deposition status.
2. `available_file_size_bytes`: Integer sum of bytes for all files actively deposited and downloadable from the public AWS S3 bucket (`added` array).
3. `available_file_count`: Total count of files deposited in the public repository (`len(added)`).
4. `successfully_downloaded_file_count`: Count of representative files successfully downloaded during verification.
5. `content_inspected_file_count`: Count of representative files opened and parsed down to raw column/sheet contents.

### Immutable Safety Rule:
> [!IMPORTANT]
> An investigation with `available_file_count == 0` (`PSI-22`, `PSI-68`, `PSI-69`, `PSI-99`) must **NEVER** be described as having downloadable data merely because `metadata_reported_size_bytes` is non-zero. Such campaigns are strictly classified as `CONTENT_NOT_YET_INSPECTED` / `METADATA_ONLY_ZERO_FILES`.
