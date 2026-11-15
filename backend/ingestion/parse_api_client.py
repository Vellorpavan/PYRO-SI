"""
Parse.bot NASA Combustion Data Resource API Client & Inspector
Module: backend.ingestion.parse_api_client
Project: GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform

Investigates and extracts data from the Parse.bot scraper API endpoint:
https://api.parse.bot/scraper/328daab1-12f9-4464-b73d-b5e0c392bfe7/list_data_resources

Governance Rules:
- API key must NEVER be hardcoded, printed, logged, or included in reports.
- Handles missing keys, 401/403 auth errors, 4xx/5xx HTTP errors, timeouts, invalid JSON.
- Evaluates NASA scientific provenance, source authenticity, and data availability.
"""

import json
import logging
import os
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple, Union

import requests
from requests.exceptions import ConnectionError, HTTPError, RequestException, Timeout

# Configure logging (redacting all credentials)
logger = logging.getLogger("pyro_si.parse_api_client")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [ParseAPI] %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class ClientStatus(str, Enum):
    """Execution status for the inspection client."""
    SUCCESS = "SUCCESS"
    MISSING_API_KEY = "MISSING_API_KEY"
    AUTHENTICATION_FAILURE = "AUTHENTICATION_FAILURE"
    HTTP_ERROR = "HTTP_ERROR"
    TIMEOUT = "TIMEOUT"
    CONNECTION_ERROR = "CONNECTION_ERROR"
    INVALID_JSON = "INVALID_JSON"
    UNEXPECTED_STRUCTURE = "UNEXPECTED_STRUCTURE"
    UNTESTED = "UNTESTED"


class NASASourceClassification(str, Enum):
    """Phase 3 scientific classification for NASA combustion data sources."""
    VERIFIED_NASA_SOURCE = "VERIFIED_NASA_SOURCE"
    NASA_SOURCE_CANDIDATE = "NASA_SOURCE_CANDIDATE"
    THIRD_PARTY_REFERENCE = "THIRD_PARTY_REFERENCE"
    UNVERIFIED_SOURCE = "UNVERIFIED_SOURCE"
    NON_RELEVANT = "NON_RELEVANT"


class FieldAvailability(str, Enum):
    """Phase 4 data availability status for specific combustion experiment fields."""
    AVAILABLE = "AVAILABLE"
    MISSING = "MISSING"
    INFERRED = "INFERRED"
    UNVERIFIED = "UNVERIFIED"


DEFAULT_SCRAPER_ID = "328daab1-12f9-4464-b73d-b5e0c392bfe7"
DEFAULT_ENDPOINT_URL = f"https://api.parse.bot/scraper/{DEFAULT_SCRAPER_ID}/list_data_resources"
DEFAULT_TIMEOUT_SECONDS = 10.0


@dataclass
class InspectionResult:
    """Safe, sanitized container for API inspection results."""
    endpoint: str
    http_method: str
    status: ClientStatus
    status_code: Optional[int] = None
    error_message: Optional[str] = None
    raw_response_preview: Optional[str] = None
    resource_count: int = 0
    pagination_detected: bool = False
    pagination_details: Dict[str, Any] = field(default_factory=dict)
    schema_summary: Dict[str, Any] = field(default_factory=dict)
    sanitized_sample: Optional[Any] = None
    inspected_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary, strictly ensuring no secrets are exposed."""
        d = asdict(self)
        d["status"] = self.status.value
        return d


class ParseDataResourceInspector:
    """
    Client for safely inspecting and auditing Parse.bot data resources
    for NASA microgravity combustion research.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        endpoint_url: str = DEFAULT_ENDPOINT_URL,
        timeout: float = DEFAULT_TIMEOUT_SECONDS,
        user_agent: str = "GODEYE-PYRO-SI/2026.4.0 (NASA Space Apps Challenge; Scientific Intelligence)"
    ):
        # Read API key from environment if not explicitly provided
        self._api_key = api_key if api_key is not None else os.environ.get("PARSE_API_KEY", "").strip()
        self.endpoint_url = endpoint_url
        self.timeout = float(timeout)
        self.user_agent = user_agent

    @property
    def has_api_key(self) -> bool:
        """Check if an API key is present without exposing its value."""
        return bool(self._api_key)

    def get_masked_key(self) -> str:
        """Return a safe masked representation of the API key for logging."""
        if not self._api_key:
            return "<NOT_SET>"
        if len(self._api_key) <= 8:
            return "***"
        return f"{self._api_key[:4]}...{self._api_key[-4:]}"

    def inspect_endpoint(
        self,
        method: str = "GET",
        payload: Optional[Dict[str, Any]] = None,
        force_unauthenticated_probe: bool = False
    ) -> InspectionResult:
        """
        Safely calls the API endpoint and records response structure.
        Never leaks credentials in error logs, exceptions, or return values.
        """
        # Phase 2 Guard: Check for missing API key
        if not self.has_api_key and not force_unauthenticated_probe:
            logger.warning("PARSE_API_KEY environment variable is not set. Cannot authenticate live API.")
            return InspectionResult(
                endpoint=self.endpoint_url,
                http_method=method.upper(),
                status=ClientStatus.MISSING_API_KEY,
                status_code=None,
                error_message=(
                    "Environment variable 'PARSE_API_KEY' is not set. "
                    "Live API resource retrieval cannot be authenticated. "
                    "Per scientific auditing standards, responses must not be fabricated."
                )
            )

        headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json"
        }
        if self._api_key and not force_unauthenticated_probe:
            headers["X-API-Key"] = self._api_key

        if method.upper() == "POST":
            headers["Content-Type"] = "application/json"

        try:
            logger.info(f"Dispatching {method.upper()} to {self.endpoint_url} (timeout: {self.timeout}s)")
            if method.upper() == "POST":
                response = requests.post(
                    self.endpoint_url,
                    headers=headers,
                    json=payload or {},
                    timeout=self.timeout
                )
            else:
                response = requests.get(
                    self.endpoint_url,
                    headers=headers,
                    params=payload if payload else None,
                    timeout=self.timeout
                )

            # Check for HTTP Authentication Errors
            if response.status_code in (401, 403):
                err_text = self._sanitize_text(response.text[:300])
                logger.warning(f"Authentication failure (HTTP {response.status_code}): {err_text}")
                return InspectionResult(
                    endpoint=self.endpoint_url,
                    http_method=method.upper(),
                    status=ClientStatus.AUTHENTICATION_FAILURE,
                    status_code=response.status_code,
                    error_message=f"HTTP {response.status_code} Unauthorized / Forbidden: {err_text}",
                    raw_response_preview=err_text
                )

            # Check for other HTTP client/server errors
            if response.status_code >= 400:
                err_text = self._sanitize_text(response.text[:300])
                logger.error(f"HTTP Error {response.status_code}: {err_text}")
                return InspectionResult(
                    endpoint=self.endpoint_url,
                    http_method=method.upper(),
                    status=ClientStatus.HTTP_ERROR,
                    status_code=response.status_code,
                    error_message=f"HTTP {response.status_code} Error: {err_text}",
                    raw_response_preview=err_text
                )

            # Parse JSON
            try:
                data = response.json()
            except (ValueError, json.JSONDecodeError) as json_err:
                preview = self._sanitize_text(response.text[:300])
                logger.error(f"Invalid JSON received: {json_err}. Preview: {preview}")
                return InspectionResult(
                    endpoint=self.endpoint_url,
                    http_method=method.upper(),
                    status=ClientStatus.INVALID_JSON,
                    status_code=response.status_code,
                    error_message=f"Failed to parse JSON response: {str(json_err)}",
                    raw_response_preview=preview
                )

            # Dissect response structure
            return self._analyze_response_structure(data, response.status_code, method.upper())

        except Timeout as t_err:
            logger.error(f"Request timed out after {self.timeout}s: {t_err}")
            return InspectionResult(
                endpoint=self.endpoint_url,
                http_method=method.upper(),
                status=ClientStatus.TIMEOUT,
                error_message=f"Request timed out after {self.timeout} seconds."
            )
        except ConnectionError as c_err:
            logger.error(f"Connection error reaching endpoint: {c_err}")
            return InspectionResult(
                endpoint=self.endpoint_url,
                http_method=method.upper(),
                status=ClientStatus.CONNECTION_ERROR,
                error_message=f"Network connection failed: {self._sanitize_text(str(c_err))}"
            )
        except RequestException as r_err:
            logger.error(f"General request exception: {r_err}")
            return InspectionResult(
                endpoint=self.endpoint_url,
                http_method=method.upper(),
                status=ClientStatus.HTTP_ERROR,
                error_message=f"Request failed: {self._sanitize_text(str(r_err))}"
            )

    def _analyze_response_structure(
        self,
        data: Any,
        status_code: int,
        http_method: str
    ) -> InspectionResult:
        """Inspects response structure, detects pagination, schemas, and resource lists."""
        if not isinstance(data, (dict, list)):
            return InspectionResult(
                endpoint=self.endpoint_url,
                http_method=http_method,
                status=ClientStatus.UNEXPECTED_STRUCTURE,
                status_code=status_code,
                error_message=f"Expected JSON object or array, got {type(data).__name__}",
                raw_response_preview=str(data)[:200]
            )

        # Detect resources list
        resources = []
        pagination = {}
        schema_summary = {"root_type": type(data).__name__}

        if isinstance(data, list):
            resources = data
            schema_summary["container"] = "root_array"
            schema_summary["item_count"] = len(data)
        elif isinstance(data, dict):
            schema_summary["root_keys"] = list(data.keys())
            # Check common resource collection keys
            for candidate in ("data", "resources", "items", "results", "records"):
                if candidate in data and isinstance(data[candidate], list):
                    resources = data[candidate]
                    schema_summary["resource_key"] = candidate
                    break

            # Check pagination indicators
            pagination_keys = (
                "total", "total_count", "count", "page", "page_size", "per_page",
                "next_page", "has_more", "next_cursor", "cursor", "pagination"
            )
            for pk in pagination_keys:
                if pk in data:
                    pagination[pk] = data[pk]

            if "pagination" in data and isinstance(data["pagination"], dict):
                pagination.update(data["pagination"])

        resource_count = len(resources)
        sanitized_sample = None
        if resource_count > 0:
            sample_item = resources[0]
            if isinstance(sample_item, dict):
                schema_summary["resource_item_keys"] = list(sample_item.keys())
                sanitized_sample = self._sanitize_data_recursively(sample_item)
            else:
                schema_summary["resource_item_type"] = type(sample_item).__name__
                sanitized_sample = sample_item

        return InspectionResult(
            endpoint=self.endpoint_url,
            http_method=http_method,
            status=ClientStatus.SUCCESS,
            status_code=status_code,
            resource_count=resource_count,
            pagination_detected=bool(pagination),
            pagination_details=pagination,
            schema_summary=schema_summary,
            sanitized_sample=sanitized_sample
        )

    def classify_nasa_source(self, resource: Dict[str, Any]) -> Dict[str, Any]:
        """
        Phase 3: NASA Source Verification Algorithm.
        Evaluates 7 criteria to determine whether a resource is an authentic NASA source.
        """
        if not isinstance(resource, dict):
            return {
                "classification": NASASourceClassification.NON_RELEVANT.value,
                "confidence": 0.0,
                "reasoning": "Resource is not a valid dictionary object."
            }

        text_corpus = " ".join([
            str(resource.get("title", "")),
            str(resource.get("name", "")),
            str(resource.get("description", "")),
            str(resource.get("summary", "")),
            str(resource.get("url", "")),
            str(resource.get("source_url", "")),
            str(resource.get("source", ""))
        ]).lower()

        url_corpus = " ".join([
            str(resource.get("url", "")),
            str(resource.get("source_url", "")),
            str(resource.get("download_url", "")),
            str(resource.get("file_url", "")),
            str(resource.get("doi", ""))
        ]).lower()

        # Criterion 1: Is it related to NASA?
        nasa_keywords = ["nasa", "iss", "international space station", "microgravity", "saffire", "bass", "acme", "flex", "cir", "msg"]
        is_nasa_related = any(kw in text_corpus for kw in nasa_keywords)

        # Criterion 2: Does it identify an original NASA source?
        has_nasa_domain = any(dom in url_corpus for dom in ["nasa.gov", "psi.nasa.gov", "ntrs.nasa.gov", "sti.nasa.gov", "gdc.nasa.gov"])

        # Criterion 3: Direct NASA PSI record or publication?
        has_psi_id = bool(re.search(r"\bpsi-\d+\b", text_corpus, re.IGNORECASE)) or bool(resource.get("psi_id")) or bool(resource.get("psiId"))
        has_nasa_doc_id = bool(re.search(r"\bnasa[/-](?:std|tp|tm|sp|cr)[/-]\d+", text_corpus, re.IGNORECASE))
        has_doi = bool(resource.get("doi")) or ("10." in url_corpus and "/" in url_corpus)

        # Criterion 4: Official investigation identifier?
        has_official_id = has_psi_id or has_nasa_doc_id or bool(resource.get("id"))

        # Criterion 5: Downloadable research file?
        download_url = resource.get("download_url") or resource.get("file_url") or resource.get("download_link")
        has_downloadable_file = bool(download_url) and any(ext in str(download_url).lower() for ext in [".csv", ".tsv", ".json", ".pdf", ".zip", ".tar", ".h5", ".nc", ".tiff"])

        # Criterion 6: Quantitative experimental measurements vs descriptive metadata?
        has_measurements = bool(
            resource.get("measurements")
            or resource.get("data_points")
            or resource.get("flame_speed")
            or resource.get("spread_rate")
            or resource.get("oxygen_concentration")
            or (resource.get("file_type") in ["csv", "tsv", "h5", "nc"])
        )

        # Criterion 7: Can the original source be independently accessed and verified?
        can_independently_verify = has_nasa_domain or (has_doi and "10." in str(resource.get("doi", ""))) or has_psi_id

        # Determine Classification
        if (has_nasa_domain and (has_psi_id or has_nasa_doc_id)) or (has_nasa_domain and has_downloadable_file):
            classification = NASASourceClassification.VERIFIED_NASA_SOURCE
            confidence = 0.95
            reason = "Direct primary NASA domain and formal accession or document ID verified."
        elif is_nasa_related and (has_psi_id or (has_official_id and not has_doi)):
            classification = NASASourceClassification.NASA_SOURCE_CANDIDATE
            confidence = 0.75
            reason = "Matches authentic NASA combustion investigation nomenclature, but direct NASA accession requires secondary corroboration."
        elif is_nasa_related and has_doi:
            classification = NASASourceClassification.THIRD_PARTY_REFERENCE
            confidence = 0.60
            reason = "Third-party academic publication citing or related to NASA research, but not directly hosted on a NASA repository."
        elif is_nasa_related:
            classification = NASASourceClassification.UNVERIFIED_SOURCE
            confidence = 0.35
            reason = "Text mentions NASA or spaceflight terms, but lacks authentic accession IDs, DOIs, or direct NASA links."
        else:
            classification = NASASourceClassification.NON_RELEVANT
            confidence = 0.10
            reason = "No connection to NASA, microgravity combustion, or spacecraft fire safety identified."

        return {
            "classification": classification.value,
            "confidence": confidence,
            "reasoning": reason,
            "checklist": {
                "is_nasa_related": is_nasa_related,
                "has_nasa_domain": has_nasa_domain,
                "has_psi_id": has_psi_id,
                "has_nasa_doc_id": has_nasa_doc_id,
                "has_official_id": has_official_id,
                "has_downloadable_file": has_downloadable_file,
                "has_quantitative_measurements": has_measurements,
                "can_independently_verify": can_independently_verify
            }
        }

    def assess_data_availability(self, resource: Dict[str, Any]) -> Dict[str, str]:
        """
        Phase 4: Data Availability Assessment.
        Audits 12 core combustion scientific fields against the 4 availability states:
        AVAILABLE, MISSING, INFERRED, UNVERIFIED.
        """
        if not isinstance(resource, dict):
            return {field_name: FieldAvailability.MISSING.value for field_name in self.get_audit_field_names()}

        def check_field(keys: List[str], condition_fn=None) -> str:
            for k in keys:
                if k in resource and resource[k] is not None and str(resource[k]).strip() != "":
                    if condition_fn:
                        return condition_fn(resource[k])
                    return FieldAvailability.AVAILABLE.value
            return FieldAvailability.MISSING.value

        availability = {
            "investigation_metadata": check_field(["title", "name", "id", "code", "facility", "principal_investigator", "pi"]),
            "experimental_datasets": check_field(["datasets", "runs", "test_points", "sample_matrix", "experiments"]),
            "csv_structured_measurements": check_field(["csv_url", "measurements_file", "tabular_data"], lambda v: FieldAvailability.AVAILABLE.value if ".csv" in str(v).lower() else FieldAvailability.UNVERIFIED.value),
            "research_papers_pdfs": check_field(["pdf_url", "paper_url", "report_url", "doi"], lambda v: FieldAvailability.AVAILABLE.value if ".pdf" in str(v).lower() or "10." in str(v) else FieldAvailability.UNVERIFIED.value),
            "experimental_conditions": check_field(["conditions", "environment", "ambient_conditions", "chamber"]),
            "fuel_material_info": check_field(["fuel", "fuel_type", "material", "sample", "fuelDetails"]),
            "oxygen_concentration": check_field(["o2", "oxygen", "oxygen_percentage", "o2_percentage", "fio2"]),
            "pressure": check_field(["pressure", "chamber_pressure", "total_pressure", "psia", "kpa"]),
            "gravity_conditions": check_field(["gravity", "g_level", "microgravity", "g", "acceleration"], lambda v: FieldAvailability.AVAILABLE.value if any(c.isdigit() for c in str(v)) else FieldAvailability.INFERRED.value),
            "airflow_ventilation": check_field(["airflow", "flow_speed", "ventilation", "velocity", "forced_flow"]),
            "sensor_measurement_info": check_field(["sensors", "diagnostics", "thermocouples", "radiometers", "cameras"]),
            "downloadable_original_files": check_field(["download_url", "file_url", "data_url", "raw_files_url"])
        }

        return availability

    @staticmethod
    def get_audit_field_names() -> List[str]:
        """Returns the canonical list of the 12 Phase 4 audit fields."""
        return [
            "investigation_metadata",
            "experimental_datasets",
            "csv_structured_measurements",
            "research_papers_pdfs",
            "experimental_conditions",
            "fuel_material_info",
            "oxygen_concentration",
            "pressure",
            "gravity_conditions",
            "airflow_ventilation",
            "sensor_measurement_info",
            "downloadable_original_files"
        ]

    def _sanitize_text(self, text: str) -> str:
        """Strip API keys or credential patterns from any string."""
        if not text:
            return ""
        sanitized = text
        if self._api_key:
            sanitized = sanitized.replace(self._api_key, "[REDACTED_API_KEY]")
        # Strip generic bearer / key patterns
        sanitized = re.sub(r"(pmx_[a-zA-Z0-9_-]{10,})", "[REDACTED_KEY]", sanitized)
        sanitized = re.sub(r"(X-API-Key:\s*)[^\s\n\r]+", r"\1[REDACTED]", sanitized, flags=re.IGNORECASE)
        return sanitized

    def _sanitize_data_recursively(self, obj: Any) -> Any:
        """Recursively redact sensitive key names and credentials from response objects."""
        if isinstance(obj, dict):
            clean_dict = {}
            for k, v in obj.items():
                if any(sec in k.lower() for sec in ["key", "token", "secret", "password", "auth", "credential"]):
                    clean_dict[k] = "[REDACTED]"
                else:
                    clean_dict[k] = self._sanitize_data_recursively(v)
            return clean_dict
        elif isinstance(obj, list):
            return [self._sanitize_data_recursively(item) for item in obj[:10]]  # limit sample size
        elif isinstance(obj, str):
            return self._sanitize_text(obj)
        return obj
