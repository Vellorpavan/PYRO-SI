# GODEYE // PYRO-SI — Parse.bot Shared API Integration & Deployment Guide

**Document Identifier:** NASA-PYRO-DEPLOY-232  
**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 16, 2026  
**Audience:** System Administrators, DevOps Engineers, and Open Source Contributors  

---

## 1. Architecture Overview

To enable all authenticated application users to retrieve NASA combustion research data without requiring individual Parse.bot accounts or personal API keys, GODEYE // PYRO-SI uses a **Secure Shared Backend Proxy Architecture**:

```
┌─────────────────────────┐               ┌──────────────────────────────────────┐               ┌─────────────────────────┐
│     Frontend Client     │  App Token    │      PYRO-SI Backend Gateway         │  Server Secret│     Parse.bot Scraper   │
│   (Browser / Three.js)  ├──────────────►│         (FastAPI Python)             ├──────────────►│        API Gateway      │
│                         │  Rate Limited │ • Injects PARSE_API_KEY secret       │  X-API-Key    │                         │
│ • No API key needed     │  X-App-Token  │ • Enforces 30 req/min rate limit     │               │ Scrapes NASA BPS Data   │
│ • Never sees secrets    │◄──────────────┤ • Redacts credentials from payload   │◄──────────────┤ (science.nasa.gov)      │
└─────────────────────────┘  200 Data     └──────────────────────────────────────┘  Raw Data     └─────────────────────────┘
```

---

## 2. One-Time Deployment Secret Configuration

The shared API key must be configured **exactly once** in the backend hosting environment. Ordinary users accessing the application will never see or configure this key.

> [!CAUTION]
> **CREDENTIAL PROTECTION MANDATE**  
> Never hardcode the API key in source code, commit `.env` files to GitHub, or expose secrets in public build logs.

### 2.1 Local Development Environment
Create a local `.env` file in the project root (this file is already ignored by `.gitignore`):

```bash
# In /Users/pavan/Desktop/PYRO-SI/.env
PARSE_API_KEY=pmx_your_parse_api_key_here
APP_SECRET_TOKEN=pyro-app-auth-token-2026
PORT=3000
NODE_ENV=development
```

Start the backend:
```bash
uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2.2 Google Cloud Run Deployment
Store the secret in Google Secret Manager and bind it to the Cloud Run service:

```bash
# 1. Create secret in Secret Manager
echo -n "pmx_your_parse_api_key_here" | gcloud secrets create parse-api-key \
    --project=pyro-si-nasa-2026 \
    --replication-policy="automatic" \
    --data-file=-

# 2. Deploy or update Cloud Run service
gcloud run deploy pyro-si-gateway \
    --image=gcr.io/pyro-si-nasa-2026/gateway:latest \
    --platform=managed \
    --region=us-central1 \
    --set-secrets="PARSE_API_KEY=parse-api-key:latest" \
    --set-env-vars="APP_SECRET_TOKEN=pyro-app-auth-token-2026"
```

### 2.3 Render / Railway / Fly.io / AWS ECS
In your platform's dashboard:
1. Navigate to **Environment Variables / Secrets**.
2. Add key: `PARSE_API_KEY` with value: `pmx_...`.
3. Add key: `APP_SECRET_TOKEN` with value: `pyro-app-auth-token-2026` (or custom secure token).
4. Save and trigger deployment.

---

## 3. Security Controls & Safeguards

| Security Layer | Implementation Mechanism | Purpose |
|---|---|---|
| **Server-Side Secret Injection** | `os.environ.get("PARSE_API_KEY")` | Prevents exposing Parse.bot credentials to frontend browsers. |
| **Application Client Auth** | `verify_app_authorization` dependency | Validates `X-App-Token` or `Authorization: Bearer <token>` to prevent public scraping abuse. |
| **Sliding-Window Rate Limiting** | `SlidingWindowRateLimiter` (Thread-safe) | Limits each client IP to **30 requests per minute**, returning HTTP 429 with `Retry-After`. |
| **Zero-Leakage Guarantee** | Recursive response sanitizer & test assertions | Validates that no response body, header, or error stack trace contains secret strings. |
| **Graceful Degradation** | HTTP 503 on unconfigured secret | Informs operators cleanly without crashing if secret is unset. |
| **Upstream Fault Tolerance** | Timeout (15s) -> 504; Bad gateway -> 502 | Isolates frontend from upstream network or scraper failures. |

---

## 4. API Endpoint Contract

### Request
```http
GET /api/v1/nasa/resources HTTP/1.1
Host: localhost:8000
X-App-Token: pyro-app-auth-token-2026
Accept: application/json
```

### Successful Response (HTTP 200)
```json
{
  "status": "success",
  "source": "NASA Biological & Physical Sciences Data (via Parse.bot Scraper)",
  "scraper_id": "328daab1-12f9-4464-b73d-b5e0c392bfe7",
  "page_url": "https://science.nasa.gov/biological-physical/data/",
  "retrieved_at": "2026-11-16T00:05:43.123456Z",
  "sections_count": 7,
  "total_items_discovered": 25,
  "discovered_psi_accessions": [
    {
      "id": "PSI-178",
      "title": "PSI-178",
      "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-178"
    },
    {
      "id": "PSI-138",
      "title": "PSI-138",
      "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-138"
    },
    {
      "id": "PSI-187",
      "title": "PSI-187",
      "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-187"
    }
  ],
  "sections": [ ... ],
  "rate_limit": {
    "limit": 30,
    "remaining": 29,
    "window_seconds": 60
  }
}
```

### Rate Limit Response (HTTP 429)
```json
{
  "detail": "Rate limit exceeded (30 requests/minute). Please retry after 42.0 seconds."
}
Headers:
  Retry-After: 42
```

---

## 5. Verification Commands

```bash
# Run all Python backend tests (including proxy auth, rate limit, leak prevention, live probe)
$ npm run test:backend

# Run scientific Node.js verification suite
$ npm test

# Run all test suites across the stack
$ npm run test:all
```
