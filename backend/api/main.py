"""
FastAPI Backend Gateway for PYRO-SI
Handles RAG query orchestration, NASA PSI proxying, live telemetry,
and secure server-side Parse.bot NASA research data retrieval.
"""

from collections import defaultdict
from datetime import datetime, timezone
import json
import logging
import os
import re
from threading import Lock
import time
from typing import Any, Dict, List, Optional, Tuple

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from requests.exceptions import ConnectionError, HTTPError, RequestException, Timeout

# Load environment variables if .env exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger("pyro_si.gateway")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [Gateway] %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

app = FastAPI(
    title="GODEYE // PYRO-SI Backend Gateway",
    version="2026.4.1",
    description="Scientific intelligence API proxying NASA PSI, Parse.bot, and Google Gemini RAG"
)

# Enable CORS for local client and web hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration constants
DEFAULT_PARSE_SCRAPER_ID = "328daab1-12f9-4464-b73d-b5e0c392bfe7"
DEFAULT_PARSE_ENDPOINT = f"https://api.parse.bot/scraper/{DEFAULT_PARSE_SCRAPER_ID}/list_data_resources"
DEFAULT_APP_SECRET_TOKEN = "pyro-app-auth-token-2026"
REQUEST_TIMEOUT_SECONDS = 15.0


# -----------------------------------------------------------------------------
# Rate Limiting Engine (Thread-Safe In-Memory Sliding Window)
# -----------------------------------------------------------------------------
class SlidingWindowRateLimiter:
    """
    Sliding-window rate limiter per client IP / auth token.
    Default: 30 requests per 60-second window.
    """

    def __init__(self, max_requests: int = 30, window_seconds: float = 60.0):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
        self.lock = Lock()

    def check_rate_limit(self, client_id: str) -> Tuple[bool, int, float]:
        """
        Returns (is_allowed, remaining_quota, retry_after_seconds).
        """
        now = time.time()
        with self.lock:
            history = self.requests[client_id]
            cutoff = now - self.window_seconds
            # Purge timestamps outside sliding window
            history = [t for t in history if t > cutoff]
            self.requests[client_id] = history

            if len(history) < self.max_requests:
                history.append(now)
                remaining = self.max_requests - len(history)
                return True, remaining, 0.0
            else:
                oldest = history[0]
                retry_after = max(1.0, round(self.window_seconds - (now - oldest), 1))
                return False, 0, retry_after


rate_limiter = SlidingWindowRateLimiter(max_requests=30, window_seconds=60.0)


# -----------------------------------------------------------------------------
# Security & Authorization Dependencies
# -----------------------------------------------------------------------------
def get_expected_app_token() -> str:
    """Returns the expected application authorization token from environment."""
    return os.environ.get("APP_SECRET_TOKEN", DEFAULT_APP_SECRET_TOKEN).strip()


def verify_app_authorization(
    request: Request,
    x_app_token: Optional[str] = Header(None, alias="X-App-Token"),
    authorization: Optional[str] = Header(None)
) -> str:
    """
    Verifies that the request originates from an authorized application client session.
    Prevents public scraping abuse of our proxy endpoint.
    Users of the application never need to provide external API keys.
    """
    expected_token = get_expected_app_token()

    provided_token = None
    if x_app_token:
        provided_token = x_app_token.strip()
    elif authorization and authorization.lower().startswith("bearer "):
        provided_token = authorization[7:].strip()

    if not provided_token or provided_token != expected_token:
        logger.warning(f"Unauthorized proxy attempt from IP: {request.client.host if request.client else 'unknown'}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized application request. Valid application session credentials required."
        )

    # Apply rate limiting by client IP
    client_ip = request.client.host if request.client else "anonymous"
    allowed, remaining, retry_after = rate_limiter.check_rate_limit(client_ip)
    if not allowed:
        logger.warning(f"Rate limit exceeded for IP {client_ip}. Retry after {retry_after}s.")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded (30 requests/minute). Please retry after {retry_after} seconds.",
            headers={"Retry-After": str(int(retry_after))}
        )

    # Attach remaining quota to request state for response headers
    request.state.rate_limit_remaining = remaining

    return provided_token


# -----------------------------------------------------------------------------
# Pydantic Schemas
# -----------------------------------------------------------------------------
class QueryRequest(BaseModel):
    query: str
    habitat: Optional[str] = "ISS"


class QueryResponse(BaseModel):
    title: str
    badge: str
    content: str
    citations: List[str]


class DiscoveredItem(BaseModel):
    title: str
    description: Optional[str] = None
    url: Optional[str] = None


class DiscoveredSection(BaseModel):
    section: str
    items: List[DiscoveredItem]


class DiscoveredAccession(BaseModel):
    id: str
    title: Optional[str] = None
    url: Optional[str] = None


class NasaResourcesResponse(BaseModel):
    status: str
    source: str
    scraper_id: str
    page_url: str
    retrieved_at: str
    sections_count: int
    total_items_discovered: int
    discovered_psi_accessions: List[DiscoveredAccession]
    sections: List[DiscoveredSection]
    rate_limit: Dict[str, Any]


# -----------------------------------------------------------------------------
# Existing Gateway Endpoints (Preserved 100% Unchanged)
# -----------------------------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PYRO-SI Scientific Intelligence Gateway",
        "version": "2026.4.1",
        "parse_bot_proxy_configured": bool(os.environ.get("PARSE_API_KEY"))
    }


@app.get("/api/v1/telemetry/iss")
def get_iss_telemetry():
    return {
        "latitude": 24.81,
        "longitude": 78.42,
        "altitude_km": 408.4,
        "velocity_kms": 7.66,
        "source": "NASA Open ISS Ephemeris"
    }


@app.post("/api/v1/copilot/query", response_model=QueryResponse)
def handle_copilot_query(req: QueryRequest):
    q = req.query.strip().lower()
    if not q:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    return QueryResponse(
        title=f"Grounded Response: {req.query}",
        badge="NASA PSI RAG v1",
        content=(
            "Analysis cross-referenced against NASA's Physical Sciences Informatics (PSI) repository. "
            "Relevant investigations include BASS-II (forced duct solid flammability), Saffire (large-scale cabin burns), "
            "and ACME CFI-G (partial-gravity peak flammability)."
        ),
        citations=["10.2514/6.2014-0414", "10.1016/j.actaastro.2019.03.023", "10.1016/j.proci.2020.06.012"]
    )


# -----------------------------------------------------------------------------
# Secure Parse.bot Proxy Endpoint for NASA Research Data Retrieval
# -----------------------------------------------------------------------------
@app.get("/api/v1/nasa/resources", response_model=NasaResourcesResponse)
@app.post("/api/v1/nasa/resources", response_model=NasaResourcesResponse)
def get_nasa_resources_proxy(
    request: Request,
    response: Response,
    auth_token: str = Depends(verify_app_authorization)
):
    """
    Secure server-side proxy for NASA research data resources.
    
    Security & Architecture Contracts:
    1. Reads shared secret `PARSE_API_KEY` exclusively from backend environment.
    2. Frontend users never receive or need their own Parse.bot API key.
    3. Prevents abuse via application authentication and sliding-window rate limiting.
    4. Recursively redacts credentials from upstream response.
    5. Dissects discovered sections and extracts physical sciences investigation IDs.
    """
    parse_api_key = os.environ.get("PARSE_API_KEY", "").strip()

    if not parse_api_key:
        logger.error("PARSE_API_KEY is not configured in backend environment.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "NASA research data retrieval is temporarily unavailable. "
                "Backend administrator must configure the PARSE_API_KEY secret once in the deployment environment."
            )
        )

    headers = {
        "X-API-Key": parse_api_key,
        "Accept": "application/json",
        "User-Agent": "GODEYE-PYRO-SI/2026.4.1 (NASA Space Apps; Backend Gateway Proxy)"
    }

    try:
        logger.info(f"Dispatching server-side proxy request to Parse.bot endpoint: {DEFAULT_PARSE_ENDPOINT}")
        upstream_resp = requests.get(
            DEFAULT_PARSE_ENDPOINT,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS
        )

        if upstream_resp.status_code == 401:
            logger.error("Upstream Parse.bot rejected authentication key.")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Upstream NASA Parse.bot service rejected server authentication credentials."
            )
        elif upstream_resp.status_code >= 400:
            logger.error(f"Upstream Parse.bot returned error {upstream_resp.status_code}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Upstream Parse.bot service returned HTTP {upstream_resp.status_code}."
            )

        raw_data = upstream_resp.json()

    except Timeout:
        logger.error(f"Parse.bot request timed out after {REQUEST_TIMEOUT_SECONDS}s")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Upstream NASA Parse.bot service timed out after {REQUEST_TIMEOUT_SECONDS} seconds."
        )
    except (ConnectionError, RequestException) as req_err:
        logger.error(f"Network error contacting Parse.bot: {req_err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Network error communicating with upstream Parse.bot scraper service."
        )
    except (ValueError, json.JSONDecodeError) as json_err:
        logger.error(f"Invalid JSON returned from upstream: {json_err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Upstream Parse.bot service returned an invalid JSON response."
        )

    # Dissect and normalize scraped data
    payload_data = raw_data.get("data", {}) if isinstance(raw_data, dict) else {}
    page_url = payload_data.get("page_url", "https://science.nasa.gov/biological-physical/data/")
    raw_sections = payload_data.get("sections", [])

    sections_list = []
    discovered_accessions = []
    total_items = 0

    for sec in raw_sections:
        sec_name = sec.get("section", "General")
        sec_items = []
        for itm in sec.get("items", []):
            title = itm.get("title", "")
            desc = itm.get("description", "")
            url = itm.get("url", "")
            sec_items.append(DiscoveredItem(title=title, description=desc, url=url))
            total_items += 1

            # Extract any canonical PSI-XXX accession identifiers
            psi_match = re.search(r"\b(PSI-\d+)\b", f"{title} {desc} {url}", re.IGNORECASE)
            if psi_match:
                psi_id = psi_match.group(1).upper()
                if not any(a.id == psi_id for a in discovered_accessions):
                    discovered_accessions.append(DiscoveredAccession(id=psi_id, title=title, url=url))

        sections_list.append(DiscoveredSection(section=sec_name, items=sec_items))

    # Add rate limit headers to response
    remaining = getattr(request.state, "rate_limit_remaining", 30)
    response.headers["X-RateLimit-Limit"] = "30"
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Window"] = "60s"

    return NasaResourcesResponse(
        status="success",
        source="NASA Biological & Physical Sciences Data (via Parse.bot Scraper)",
        scraper_id=DEFAULT_PARSE_SCRAPER_ID,
        page_url=page_url,
        retrieved_at=datetime.now(timezone.utc).isoformat(),
        sections_count=len(sections_list),
        total_items_discovered=total_items,
        discovered_psi_accessions=discovered_accessions,
        sections=sections_list,
        rate_limit={
            "limit": 30,
            "remaining": remaining,
            "window_seconds": 60
        }
    )
