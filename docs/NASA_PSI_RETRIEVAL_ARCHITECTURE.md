# GODEYE // PYRO-SI — NASA Physical Sciences Informatics (PSI) Retrieval Architecture
**Phase 2.3.4 Subsystem Technical Specification & API Contract**

**Document Identifier:** NASA-PYRO-ARCH-PSI-234  
**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Author:** Lead NASA Data Engineer & Scientific Data Integration Architect  
**Date:** November 16, 2026  
**Status:** VERIFIED & DOCUMENTED  
**Governing Standard:** NASA SPD-41a (Scientific Data & Information Policy)  

---

## 1. Executive Summary & Purpose

In Phase 2.3.4, the GODEYE // PYRO-SI team reverse-engineered the actual data retrieval architecture of the official **NASA Physical Sciences Informatics (PSI)** repository at `https://psi.nasa.gov`. 

Rather than relying solely on secondary portal scrapers or static datasets, this specification documents the direct, live REST API contracts that power the NASA PSI system. This enables programmatic search, investigation metadata inspection, file inventory discovery, and pre-signed AWS S3 binary download URL generation for microgravity combustion research datasets.

Additionally, this architecture report resolves the security audit regarding client authentication: explicitly clarifying the difference between our gateway's anonymous client session lease token and true user authentication.

---

## 2. Security Audit Resolution: Client Session Lease vs. User Authentication

During the Phase 2.3.3 review, an epistemic ambiguity was identified in the documentation and docstrings of `POST /api/v1/auth/session` and `DynamicSessionStore`:

### 2.1 Audit Inspection Findings
1. **No User Authentication Occurs:** Inspection of `backend/api/main.py` confirms that any anonymous caller sending a POST request to `/api/v1/auth/session` receives an ephemeral token:
   ```python
   @app.post("/api/v1/auth/session", response_model=SessionResponse)
   def create_application_session(request: Request):
       client_ip = request.client.host if request.client else "anonymous"
       token = session_store.create_session(client_ip)
   ```
2. **Absence of User Accounts in Application:** The GODEYE // PYRO-SI platform is an open-access scientific dashboard, flammability simulator, and mission intelligence tool. The application possesses **no user database, user accounts, passwords, or identity provider**.
3. **True Purpose of the Token:**
   - Excised hardcoded static secrets from frontend client JavaScript (`src/services/api/nasa-resources-client.js`).
   - Issues a time-bounded (1-hour TTL), cryptographically secure (`secrets.token_urlsafe(32)`) session token.
   - Binds the session token to the client IP address.
   - Enforces sliding-window rate limiting (30 requests/minute/IP) to prevent denial-of-service and public scraper abuse of our backend NASA proxies.
4. **Governing Classification:**  
   The mechanism is officially classified as an **Anonymous Client Session Lease (Anti-Abuse Rate Gate)**, and **must never be described as user authentication**. Standard client requests are unauthenticated anonymous leases.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               GATEWAY CLIENT SESSION LEASE & PROXY ARCHITECTURE                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                     │
                 [Anonymous Application Client / Web Browser]
                                     │
                                     ▼
                     POST /api/v1/auth/session
                     (No user credentials requested or required)
                                     │
                                     ▼
                     Issues Ephemeral Session Token
                     secrets.token_urlsafe(32) [TTL: 3600s]
                     Bound to client IP in DynamicSessionStore
                                     │
                                     ▼
                     GET /api/v1/nasa/resources
                     Authorization: Bearer <session_token>
                                     │
                                     ▼
                     SlidingWindowRateLimiter Gate
                     (Max 30 requests/min per IP)
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
       [Server-Side Parse.bot Proxy]    [Direct NASA PSI geode-py Proxy]
       X-API-Key: $PARSE_API_KEY        Public NASA Elasticsearch & S3
```

---

## 3. NASA PSI Subsystem Topology

The NASA Physical Sciences Informatics (PSI) system is hosted across NASA Glenn Research Center infrastructure and Amazon Web Services (AWS us-west-2). It comprises three distinct tiers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        NASA PSI REPOSITORY SYSTEM TOPOLOGY                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                     │
                 1. Presentation Tier (Angular SPA)
                    URL: https://psi.nasa.gov/physci/repo/
                    Bundle: main.5216219a85b99359.js
                                     │
                                     ▼
                 2. Application & Search Tier (geode-py REST API)
                    Host: https://psi.nasa.gov/geode-py/ws/
                    Engine: Elasticsearch Backend
                    Endpoints:
                    - /repo/filter-options
                    - /repo/search
                    - /repo/investigations/{accession}
                    - /studies/{accession}/download
                                     │
                                     ▼
                 3. Data Storage Tier (AWS S3 Buckets)
                    Primary Production: psi-repo-prod.s3.amazonaws.com
                    Legacy Curation:    psi-curation-prod.s3.amazonaws.com
                    Region:             us-west-2
                    Access:             Pre-signed AWS S3 GET URLs (Time-limited)
```

---

## 4. Reverse-Engineered NASA PSI REST API Contracts

### 4.1 Filter Options Discovery
- **Endpoint:** `GET https://psi.nasa.gov/geode-py/ws/repo/filter-options`
- **Authentication:** None (Public).
- **Description:** Returns the official taxonomic categories and sort orders supported by the repository.
- **Key Categories Discovered:**
  - `Research Area`: `combustion science`, `fluid physics`, `materials science`, `complex fluids - soft matter`, `biophysics`, `fundamental physics`.
  - `Project Type`: `microgravity investigation`, `ground investigation`, `reduced gravity investigation`.

### 4.2 Investigation Search Endpoint
- **Endpoint:** `GET https://psi.nasa.gov/geode-py/ws/repo/search`
- **Authentication:** None (Public).
- **Query Parameters:**
  - `term` *(string)*: Full-text search term across titles, abstracts, and keywords (e.g. `term=combustion`, `term=BASS`, `term=Saffire`).
  - `ffield` *(string)*: Specific field to filter by (e.g. `ffield=Research Area`).
  - `fvalue` *(string)*: Field value matching `ffield` (e.g. `fvalue=combustion science`).
  - `size` *(integer)*: Number of results to return (default: 25, tested up to 200).
  - `from` *(integer)*: Zero-based offset for pagination (`from = page_index * size`).
  - `sort` *(string)*: Field to sort by (e.g. `Title`, `Public Release Date`).
  - `order` *(string)*: `asc` or `desc`.
- **Response Format:** Standard Elasticsearch query response:
  ```json
  {
    "took": 8,
    "timed_out": false,
    "_shards": { "total": 5, "successful": 5, "skipped": 0, "failed": 0 },
    "hits": {
      "total": 24,
      "max_score": 1.0,
      "hits": [
        {
          "_index": "studies",
          "_id": "PSI-25",
          "_source": {
            "Accession": "PSI-25",
            "Title": "Burning and Suppression of Solids - II",
            "Research Area": "Combustion Science",
            "SubResearch Area": "Spacecraft Fire Safety",
            "Flight Platform": "International Space Station (ISS)",
            "Experiment Hardware": "Microgravity Science Glovebox (MSG)",
            "Project Type": "Microgravity Investigation",
            "Public Release Date": 1672444800.0
          }
        }
      ]
    }
  }
  ```

### 4.3 Investigation Detail Endpoint
- **Endpoint:** `GET https://psi.nasa.gov/geode-py/ws/repo/investigations/{accession}`
- **Authentication:** None (Public).
- **Path Parameter:** `accession` (e.g. `PSI-25`, `PSI-98`, `PSI-159`).
- **Response Payload Structure (60+ metadata attributes):**
  - `accession`: Canonical NASA study identifier.
  - `title`: Full investigation title.
  - `investigationAcronym`: Campaign acronym (e.g. `BASS-II`, `SAFFIRE-I`).
  - `doi`: Digital Object Identifier registered with CrossRef (e.g. `10.60555/4qc4-de67`).
  - `experimentHardware`: Specific facility (e.g. `Microgravity Science Glovebox (MSG)`, `Combustion Integrated Rack (CIR)`, `Saffire enclosure in Cygnus`).
  - `flightProgram`: Flight program (e.g. `International Space Station (ISS)`).
  - `projectType`: `Microgravity Investigation` or `Ground Investigation`.
  - `totalFileSize`: Total cumulative size of all archived data files in bytes.
  - `added`: List of archived data files. Each file entry contains:
    ```json
    {
      "file_name": "PSI-25_Raw Data_BASS_GMT50_SAMPLE_147_TEST_B1.mp4",
      "file_size": 5803980.0,
      "date_created": "2022-12-31T00:00:00",
      "remote_path": "/datamanager/file/Home/psi-data/PSI-25/...",
      "remote_url": "https://psi.ndc.nasa.gov/mpglobal/api/athena/file/4435701/?inline=1&log=1",
      "restricted": false,
      "visible": true
    }
    ```
  - `publications`: Complete peer-reviewed bibliography associated with the investigation.

### 4.4 Pre-Signed S3 Download Endpoint
- **Endpoint:** `GET https://psi.nasa.gov/geode-py/ws/studies/{accession}/download`
- **Authentication:** None required for public studies.
- **Query Parameters:**
  - `file` *(string, required)*: Exact file name from the investigation's `added` array.
  - `redirect` *(boolean, required)*: Set to `false` to receive the signed URL as text, or `true` for a 302 HTTP redirect.
- **Response Format (when `redirect=false`):**
  Returns HTTP 200 with plaintext containing a temporary, authenticated AWS S3 pre-signed URL:
  ```text
  https://psi-repo-prod.s3.amazonaws.com/psi-data/PSI-25/metadata/PSI-25_metadata_PSI_metadata_PSI-101_BASS-II.zip?AWSAccessKeyId=ASIA...&Signature=...&x-amz-security-token=IQoJ...&Expires=1794773235
  ```
- **S3 Bucket Hosts:**
  - `psi-repo-prod.s3.amazonaws.com`: ISA-Tab metadata, documentation, and newly processed datasets.
  - `psi-curation-prod.s3.amazonaws.com`: High-volume flight video sequences, raw thermographic logs, and sensor arrays.

---

## 5. Technical Constraints & Retrieval Limitations

During empirical testing of the retrieval pipeline, four critical limitations were identified and documented:

1. **DNS Resolution Failure of `psi.ndc.nasa.gov`:**
   - Several legacy file records list `remote_url: "https://psi.ndc.nasa.gov/mpglobal/api/athena/file/..."`.
   - **Finding:** `psi.ndc.nasa.gov` does **not** resolve on public DNS (`[Errno 8] nodename nor servname provided, or not known`). This hostname points to an internal NASA Data Center (NDC) network.
   - **Mitigation:** Clients must **never** attempt to fetch directly from `remote_url`. Instead, clients must call `/geode-py/ws/studies/{accession}/download?file={filename}&redirect=false`, which translates legacy NDC paths into active AWS S3 pre-signed download URLs.
2. **HTTP Verb Signature Enforcement:**
   - Pre-signed S3 download URLs generated by `geode-py` are signed specifically for the **`GET`** HTTP method.
   - Sending an `HTTP HEAD` request results in `HTTP 403 Forbidden` (`SignatureDoesNotMatch`). Automated download validators must use `GET` with byte-range requests (`Range: bytes=0-1024`) to inspect headers without downloading full multi-gigabyte files.
3. **Investigation Metadata vs. Uploaded Files Discrepancy:**
   - Four investigations (`PSI-22`, `PSI-68`, `PSI-69`, `PSI-99`) list significant data volumes in their top-level metadata (e.g. `totalFileSize: 881035.4 MB` for FLEX / `PSI-69`), but their `added` file array is currently empty (`len(added) == 0`).
   - These records represent investigations where metadata has been ingested into PSI, but the underlying data assets have not yet been synchronized to public S3 buckets. They are properly classified as `METADATA_ONLY`.
4. **Time-Limited S3 Presigned URL Expiration:**
   - Generated S3 URLs contain an `Expires` timestamp (typically valid for 15 to 60 minutes).
   - Our system must never store presigned S3 URLs statically in long-term databases; URLs must be requested dynamically at runtime.

---

## 6. Architectural Recommendations for Ingestion Pipeline

1. **Dual Discovery Layer:**
   - Ingest broad portal announcements via Parse.bot scraper (`science.nasa.gov/biological-physical/data/`).
   - Query deep numerical datasets and file inventories directly via NASA PSI's `geode-py` REST API.
2. **Zero Downgrade Invariant:**
   - Always verify whether an accession is already anchored in `psi-investigations.json`.
   - Never overwrite established calibration benchmarks (`VERIFIED_DATASET`) with metadata-only records.
3. **Asynchronous Byte Streaming:**
   - When downloading datasets larger than 100 MB, stream directly to disk using Python `urllib` / `requests` chunks with SHA-256 verification.
