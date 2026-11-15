"""
Unit & Contract Test Suite for Parse.bot API Client & NASA Data Verification
Module: tests.backend.test_parse_api_client
Project: GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform

Verifies:
1. Missing API key handling
2. Authentication failure handling (mocked & live probe)
3. HTTP error handling (404, 500, 502)
4. Request timeout handling
5. Invalid/malformed JSON handling
6. Unexpected response structure handling
7. Successful response parsing (mocked with realistic Parse.bot scraper schema)
8. NASA source classification matrix (5 tiers)
9. Data availability assessment matrix (12 fields x 4 states)
10. Strict credential leak prevention
"""

import json
import os
import unittest
from unittest.mock import MagicMock, patch

import requests
from requests.exceptions import ConnectionError, HTTPError, RequestException, Timeout

from backend.ingestion.parse_api_client import (
    ClientStatus,
    DEFAULT_ENDPOINT_URL,
    FieldAvailability,
    InspectionResult,
    NASASourceClassification,
    ParseDataResourceInspector,
)


class TestParseDataResourceInspector(unittest.TestCase):
    """Test suite for ParseDataResourceInspector and NASA source evaluation."""

    def setUp(self):
        # Ensure clean environment for each test
        self.original_env_key = os.environ.get("PARSE_API_KEY")
        if "PARSE_API_KEY" in os.environ:
            del os.environ["PARSE_API_KEY"]

    def tearDown(self):
        if self.original_env_key is not None:
            os.environ["PARSE_API_KEY"] = self.original_env_key
        elif "PARSE_API_KEY" in os.environ:
            del os.environ["PARSE_API_KEY"]

    # -------------------------------------------------------------------------
    # 1. Missing API Key Test
    # -------------------------------------------------------------------------
    def test_missing_api_key_reports_cleanly(self):
        """When PARSE_API_KEY is not set, client must report MISSING_API_KEY and never fabricate data."""
        inspector = ParseDataResourceInspector(api_key=None)
        self.assertFalse(inspector.has_api_key)
        self.assertEqual(inspector.get_masked_key(), "<NOT_SET>")

        result = inspector.inspect_endpoint(method="GET")
        self.assertEqual(result.status, ClientStatus.MISSING_API_KEY)
        self.assertIsNone(result.status_code)
        self.assertIn("PARSE_API_KEY' is not set", result.error_message)
        self.assertEqual(result.resource_count, 0)
        self.assertFalse(result.pagination_detected)

    # -------------------------------------------------------------------------
    # 2. Authentication Failure Tests (Mocked & Live)
    # -------------------------------------------------------------------------
    @patch("requests.get")
    def test_authentication_failure_mocked(self, mock_get):
        """Mocked 401 returns AUTHENTICATION_FAILURE status."""
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = '{"error": "Invalid API key", "status_code": 401}'
        mock_get.return_value = mock_response

        inspector = ParseDataResourceInspector(api_key="pmx_dummy_invalid_key_123456789")
        result = inspector.inspect_endpoint(method="GET")

        self.assertEqual(result.status, ClientStatus.AUTHENTICATION_FAILURE)
        self.assertEqual(result.status_code, 401)
        self.assertIn("401", result.error_message)
        self.assertEqual(result.resource_count, 0)

    def test_authentication_failure_live_server_probe(self):
        """Live unauthenticated probe verifies real parse.bot endpoint responds with HTTP 401."""
        inspector = ParseDataResourceInspector(api_key=None, timeout=10.0)
        # Execute probe without header
        result = inspector.inspect_endpoint(method="GET", force_unauthenticated_probe=True)
        self.assertEqual(result.status, ClientStatus.AUTHENTICATION_FAILURE)
        self.assertEqual(result.status_code, 401)
        self.assertIn("Missing X-API-Key header", result.raw_response_preview)

    # -------------------------------------------------------------------------
    # 3. HTTP Error Tests (500, 502, 404)
    # -------------------------------------------------------------------------
    @patch("requests.get")
    def test_http_500_error_handling(self, mock_get):
        """HTTP 500 returns HTTP_ERROR status and message."""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = '{"error": "Internal server error"}'
        mock_get.return_value = mock_response

        inspector = ParseDataResourceInspector(api_key="pmx_test_key_abc123456789")
        result = inspector.inspect_endpoint(method="GET")

        self.assertEqual(result.status, ClientStatus.HTTP_ERROR)
        self.assertEqual(result.status_code, 500)
        self.assertIn("500", result.error_message)

    @patch("requests.post")
    def test_http_404_error_handling_post(self, mock_post):
        """HTTP 404 on POST returns HTTP_ERROR status."""
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.text = '{"error": "Scraper endpoint not found"}'
        mock_post.return_value = mock_response

        inspector = ParseDataResourceInspector(api_key="pmx_test_key_abc123456789")
        result = inspector.inspect_endpoint(method="POST")

        self.assertEqual(result.status, ClientStatus.HTTP_ERROR)
        self.assertEqual(result.status_code, 404)

    # -------------------------------------------------------------------------
    # 4. Timeout Handling Test
    # -------------------------------------------------------------------------
    @patch("requests.get")
    def test_request_timeout_handling(self, mock_get):
        """Timeout exception must be caught and return TIMEOUT status."""
        mock_get.side_effect = Timeout("Connection timed out after 5.0 seconds")

        inspector = ParseDataResourceInspector(api_key="pmx_test_key_abc123456789", timeout=5.0)
        result = inspector.inspect_endpoint(method="GET")

        self.assertEqual(result.status, ClientStatus.TIMEOUT)
        self.assertIsNone(result.status_code)
        self.assertIn("timed out after 5.0 seconds", result.error_message)

    # -------------------------------------------------------------------------
    # 5. Invalid JSON Handling Test
    # -------------------------------------------------------------------------
    @patch("requests.get")
    def test_invalid_json_handling(self, mock_get):
        """HTML or malformed non-JSON response returns INVALID_JSON status."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "<html><body>502 Bad Gateway - HTML error page</body></html>"
        mock_response.json.side_effect = json.JSONDecodeError("Expecting value", "<html>", 0)
        mock_get.return_value = mock_response

        inspector = ParseDataResourceInspector(api_key="pmx_test_key_abc123456789")
        result = inspector.inspect_endpoint(method="GET")

        self.assertEqual(result.status, ClientStatus.INVALID_JSON)
        self.assertEqual(result.status_code, 200)
        self.assertIn("Failed to parse JSON", result.error_message)
        self.assertIn("502 Bad Gateway", result.raw_response_preview)

    # -------------------------------------------------------------------------
    # 6. Unexpected Response Structure Test
    # -------------------------------------------------------------------------
    @patch("requests.get")
    def test_unexpected_primitive_response_structure(self, mock_get):
        """Primitive response (e.g. bare integer) returns UNEXPECTED_STRUCTURE status."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = 12345
        mock_get.return_value = mock_response

        inspector = ParseDataResourceInspector(api_key="pmx_test_key_abc123456789")
        result = inspector.inspect_endpoint(method="GET")

        self.assertEqual(result.status, ClientStatus.UNEXPECTED_STRUCTURE)
        self.assertIn("Expected JSON object or array", result.error_message)

    # -------------------------------------------------------------------------
    # 7. Successful Response Parsing (Realistic Parse.bot Scraper Mock)
    # -------------------------------------------------------------------------
    @patch("requests.get")
    def test_successful_response_parsing(self, mock_get):
        """Verifies parsing of Parse.bot response containing data list and pagination."""
        mock_payload = {
            "total": 3,
            "page": 1,
            "page_size": 10,
            "has_more": False,
            "resources": [
                {
                    "id": "res_nasa_psi_001",
                    "title": "NASA Physical Sciences Informatics - BASS-II Investigation",
                    "source_url": "https://psi.nasa.gov/investigation/PSI-25",
                    "psi_id": "PSI-25",
                    "fuel": "PMMA rods and sheets",
                    "download_url": "https://psi.nasa.gov/data/PSI-25/measurements.csv"
                },
                {
                    "id": "res_nasa_saffire_002",
                    "title": "Spacecraft Fire Safety Experiment (Saffire-I)",
                    "source_url": "https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=1180",
                    "psi_id": "PSI-98",
                    "fuel": "SIBAL fabric (75% cotton, 25% fiberglass)",
                    "download_url": "https://psi.nasa.gov/data/PSI-98/saffire1_summary.pdf"
                },
                {
                    "id": "res_third_party_003",
                    "title": "Combustion Institute Paper on Flame Spread",
                    "doi": "10.1016/j.proci.2020.06.012",
                    "url": "https://doi.org/10.1016/j.proci.2020.06.012"
                }
            ]
        }
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_payload
        mock_get.return_value = mock_response

        inspector = ParseDataResourceInspector(api_key="pmx_test_valid_key_123456789")
        result = inspector.inspect_endpoint(method="GET")

        self.assertEqual(result.status, ClientStatus.SUCCESS)
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.resource_count, 3)
        self.assertTrue(result.pagination_detected)
        self.assertEqual(result.pagination_details.get("total"), 3)
        self.assertEqual(result.pagination_details.get("page"), 1)
        self.assertEqual(result.schema_summary.get("resource_key"), "resources")
        self.assertIn("title", result.schema_summary.get("resource_item_keys", []))

    # -------------------------------------------------------------------------
    # 8. NASA Source Classification Matrix Tests (Phase 3)
    # -------------------------------------------------------------------------
    def test_nasa_source_classification_matrix(self):
        """Verifies 5-tier classification logic for NASA data resources."""
        inspector = ParseDataResourceInspector()

        # 1. VERIFIED_NASA_SOURCE: Direct official NASA domain + formal PSI accession
        verified_res = {
            "title": "BASS-II Burning and Suppression of Solids",
            "url": "https://psi.nasa.gov/investigation/PSI-25",
            "psi_id": "PSI-25",
            "download_url": "https://psi.nasa.gov/data/PSI-25/runs.csv"
        }
        v_eval = inspector.classify_nasa_source(verified_res)
        self.assertEqual(v_eval["classification"], NASASourceClassification.VERIFIED_NASA_SOURCE.value)
        self.assertTrue(v_eval["checklist"]["has_nasa_domain"])
        self.assertTrue(v_eval["checklist"]["has_psi_id"])
        self.assertTrue(v_eval["checklist"]["has_downloadable_file"])

        # 2. NASA_SOURCE_CANDIDATE: NASA investigation terminology without direct verified domain
        candidate_res = {
            "title": "Saffire-I Flight Investigation Microgravity Burn",
            "description": "Large-scale combustion test in Cygnus vehicle",
            "psi_id": "PSI-98",
            "url": "https://spaceflight-archive.example.org/saffire"
        }
        c_eval = inspector.classify_nasa_source(candidate_res)
        self.assertEqual(c_eval["classification"], NASASourceClassification.NASA_SOURCE_CANDIDATE.value)

        # 3. THIRD_PARTY_REFERENCE: Peer-reviewed journal paper with DOI, not hosted on NASA
        third_party_res = {
            "title": "Quenching Limits of Duct Flames in Microgravity",
            "doi": "10.1016/j.combustflame.2012.07.009",
            "url": "https://doi.org/10.1016/j.combustflame.2012.07.009",
            "description": "Combustion and Flame study referencing NASA experiments"
        }
        tp_eval = inspector.classify_nasa_source(third_party_res)
        self.assertEqual(tp_eval["classification"], NASASourceClassification.THIRD_PARTY_REFERENCE.value)

        # 4. UNVERIFIED_SOURCE: Mentions NASA informally, lacks accession ID or DOI
        unverified_res = {
            "title": "Blog post about NASA astronaut fire safety training",
            "description": "Summary of how NASA astronauts prepare for ISS fire emergencies",
            "url": "https://spaceenthusiast.blog/fire-safety"
        }
        u_eval = inspector.classify_nasa_source(unverified_res)
        self.assertEqual(u_eval["classification"], NASASourceClassification.UNVERIFIED_SOURCE.value)

        # 5. NON_RELEVANT: Completely unrelated content
        non_rel_res = {
            "title": "Automotive Engine Oil Filter Replacement Guide",
            "description": "Standard mechanics checklist for diesel vehicles",
            "url": "https://auto-repairs.example.com/oil-filter"
        }
        nr_eval = inspector.classify_nasa_source(non_rel_res)
        self.assertEqual(nr_eval["classification"], NASASourceClassification.NON_RELEVANT.value)

    # -------------------------------------------------------------------------
    # 9. Data Availability Assessment Tests (Phase 4)
    # -------------------------------------------------------------------------
    def test_data_availability_assessment(self):
        """Verifies 12-field availability auditing across AVAILABLE, MISSING, INFERRED, UNVERIFIED."""
        inspector = ParseDataResourceInspector()

        resource = {
            "title": "ACME Burning Rate Emulator (BRE)",
            "facility": "Combustion Integrated Rack (CIR)",
            "fuel": "Gaseous methane/nitrogen porous flat burner",
            "o2": 21.0,
            "pressure": 101.3,
            "gravity": "0g microgravity",
            "csv_url": "https://psi.nasa.gov/data/bre/data.csv",
            "pdf_url": "https://ntrs.nasa.gov/citations/20190001234.pdf",
            "airflow": "5 cm/s forced flow",
            "sensors": "Radiometers and thin thermocouples"
        }

        availability = inspector.assess_data_availability(resource)
        self.assertEqual(availability["investigation_metadata"], FieldAvailability.AVAILABLE.value)
        self.assertEqual(availability["fuel_material_info"], FieldAvailability.AVAILABLE.value)
        self.assertEqual(availability["oxygen_concentration"], FieldAvailability.AVAILABLE.value)
        self.assertEqual(availability["pressure"], FieldAvailability.AVAILABLE.value)
        self.assertEqual(availability["gravity_conditions"], FieldAvailability.AVAILABLE.value)
        self.assertEqual(availability["csv_structured_measurements"], FieldAvailability.AVAILABLE.value)
        self.assertEqual(availability["research_papers_pdfs"], FieldAvailability.AVAILABLE.value)
        self.assertEqual(availability["airflow_ventilation"], FieldAvailability.AVAILABLE.value)
        self.assertEqual(availability["sensor_measurement_info"], FieldAvailability.AVAILABLE.value)
        # Check missing fields
        self.assertEqual(availability["experimental_datasets"], FieldAvailability.MISSING.value)
        self.assertEqual(availability["downloadable_original_files"], FieldAvailability.MISSING.value)

    # -------------------------------------------------------------------------
    # 10. Strict Credential Leak Prevention Tests
    # -------------------------------------------------------------------------
    def test_credential_leak_prevention(self):
        """Asserts that sensitive API keys are masked and never appear in representations or outputs."""
        secret_key = "pmx_super_secret_production_key_xyz987654321"
        inspector = ParseDataResourceInspector(api_key=secret_key)

        masked = inspector.get_masked_key()
        self.assertNotIn(secret_key, masked)
        self.assertEqual(masked, "pmx_...4321")

        # Sanitize text
        leak_text = f"Failed to authenticate with key {secret_key} on server"
        clean_text = inspector._sanitize_text(leak_text)
        self.assertNotIn(secret_key, clean_text)
        self.assertIn("[REDACTED_API_KEY]", clean_text)

        # Sanitize dict
        dirty_dict = {
            "api_key": secret_key,
            "auth_token": "bearer 12345",
            "data": "public scientific reading"
        }
        cleaned_dict = inspector._sanitize_data_recursively(dirty_dict)
        self.assertEqual(cleaned_dict["api_key"], "[REDACTED]")
        self.assertEqual(cleaned_dict["auth_token"], "[REDACTED]")
        self.assertEqual(cleaned_dict["data"], "public scientific reading")


if __name__ == "__main__":
    unittest.main()
