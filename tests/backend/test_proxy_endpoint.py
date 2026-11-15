"""
Unit, Contract, and Security Tests for Backend Parse.bot Proxy Gateway
Module: tests.backend.test_proxy_endpoint
Project: GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform

Verifies:
1. Client authorization enforcement (401 on missing or invalid app token)
2. Successful proxy retrieval (mocked and live)
3. Server-side secret injection from PARSE_API_KEY
4. Rate limiting enforcement (429 on abuse)
5. Timeout and gateway error translation (504, 502)
6. Zero secret leakage in response payloads, headers, or exception traces
"""

import json
import os
import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from requests.exceptions import Timeout

from backend.api.main import app, rate_limiter, DEFAULT_APP_SECRET_TOKEN


class TestNasaResourcesProxy(unittest.TestCase):
    """Test suite for the secure NASA resources backend proxy."""

    def setUp(self):
        self.client = TestClient(app)
        # Reset rate limiter state before each test
        rate_limiter.requests.clear()
        self.valid_headers = {"X-App-Token": DEFAULT_APP_SECRET_TOKEN}
        self.real_key = os.environ.get("PARSE_API_KEY", "")

    def tearDown(self):
        rate_limiter.requests.clear()
        if self.real_key:
            os.environ["PARSE_API_KEY"] = self.real_key

    # -------------------------------------------------------------------------
    # 1. Authorization Tests
    # -------------------------------------------------------------------------
    def test_missing_app_authorization_returns_401(self):
        """Unauthenticated client request must return HTTP 401 Unauthorized."""
        response = self.client.get("/api/v1/nasa/resources")
        self.assertEqual(response.status_code, 401)
        self.assertIn("Unauthorized application request", response.json()["detail"])

    def test_invalid_app_authorization_returns_401(self):
        """Request with incorrect app token must return HTTP 401 Unauthorized."""
        headers = {"X-App-Token": "invalid-tampered-token-xyz"}
        response = self.client.get("/api/v1/nasa/resources", headers=headers)
        self.assertEqual(response.status_code, 401)
        self.assertIn("Unauthorized application request", response.json()["detail"])

    def test_bearer_authorization_accepted(self):
        """Bearer token in Authorization header is accepted."""
        headers = {"Authorization": f"Bearer {DEFAULT_APP_SECRET_TOKEN}"}
        with patch("requests.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {
                "status": "success",
                "data": {
                    "page_url": "https://science.nasa.gov/biological-physical/data/",
                    "sections": [
                        {
                            "section": "BPS Data",
                            "items": [{"title": "PSI-101", "url": "https://psi.nasa.gov"}]
                        }
                    ]
                }
            }
            mock_get.return_value = mock_resp

            response = self.client.get("/api/v1/nasa/resources", headers=headers)
            self.assertEqual(response.status_code, 200)

    # -------------------------------------------------------------------------
    # 2. Server Configuration & Secret Missing
    # -------------------------------------------------------------------------
    def test_missing_server_secret_returns_503(self):
        """When PARSE_API_KEY is unset on server, returns HTTP 503 Service Unavailable."""
        if "PARSE_API_KEY" in os.environ:
            del os.environ["PARSE_API_KEY"]

        response = self.client.get("/api/v1/nasa/resources", headers=self.valid_headers)
        self.assertEqual(response.status_code, 503)
        self.assertIn("PARSE_API_KEY secret once", response.json()["detail"])

    # -------------------------------------------------------------------------
    # 3. Successful Proxy Retrieval (Mocked)
    # -------------------------------------------------------------------------
    @patch("requests.get")
    def test_successful_proxy_retrieval_mocked(self, mock_get):
        """Valid request returns normalized NASA research resources and extracted PSI IDs."""
        os.environ["PARSE_API_KEY"] = "pmx_dummy_test_secret_key_12345678"

        mock_payload = {
            "status": "success",
            "data": {
                "page_url": "https://science.nasa.gov/biological-physical/data/",
                "sections": [
                    {
                        "section": "New Physical Sciences Data",
                        "items": [
                            {
                                "title": "PSI-178 Investigation",
                                "description": "Study of Droplet Combustion",
                                "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-178"
                            },
                            {
                                "title": "PSI-138 Investigation",
                                "description": "Microgravity Flame Stability",
                                "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-138"
                            }
                        ]
                    }
                ]
            }
        }
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_payload
        mock_get.return_value = mock_resp

        response = self.client.get("/api/v1/nasa/resources", headers=self.valid_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["status"], "success")
        self.assertEqual(data["sections_count"], 1)
        self.assertEqual(data["total_items_discovered"], 2)
        # Check extraction of PSI accessions
        accessions = data["discovered_psi_accessions"]
        self.assertEqual(len(accessions), 2)
        self.assertEqual(accessions[0]["id"], "PSI-178")
        self.assertEqual(accessions[1]["id"], "PSI-138")

        # Check rate limit headers
        self.assertIn("X-RateLimit-Limit", response.headers)
        self.assertIn("X-RateLimit-Remaining", response.headers)

    # -------------------------------------------------------------------------
    # 4. Rate Limiting Tests (429 Too Many Requests)
    # -------------------------------------------------------------------------
    @patch("requests.get")
    def test_rate_limiting_enforcement(self, mock_get):
        """Exceeding 30 requests per minute triggers HTTP 429 Too Many Requests."""
        os.environ["PARSE_API_KEY"] = "pmx_dummy_test_secret_key_12345678"
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"status": "success", "data": {"sections": []}}
        mock_get.return_value = mock_resp

        # Exhaust 30 allowed requests
        for _ in range(30):
            res = self.client.get("/api/v1/nasa/resources", headers=self.valid_headers)
            self.assertEqual(res.status_code, 200)

        # 31st request must trigger 429
        blocked_res = self.client.get("/api/v1/nasa/resources", headers=self.valid_headers)
        self.assertEqual(blocked_res.status_code, 429)
        self.assertIn("Rate limit exceeded", blocked_res.json()["detail"])
        self.assertIn("Retry-After", blocked_res.headers)

    # -------------------------------------------------------------------------
    # 5. Upstream Errors & Timeout Handling
    # -------------------------------------------------------------------------
    @patch("requests.get")
    def test_upstream_timeout_returns_504(self, mock_get):
        """Upstream timeout must return HTTP 504 Gateway Timeout."""
        os.environ["PARSE_API_KEY"] = "pmx_dummy_test_secret_key_12345678"
        mock_get.side_effect = Timeout("Upstream timed out")

        response = self.client.get("/api/v1/nasa/resources", headers=self.valid_headers)
        self.assertEqual(response.status_code, 504)
        self.assertIn("timed out", response.json()["detail"])

    @patch("requests.get")
    def test_upstream_auth_failure_returns_502(self, mock_get):
        """If upstream rejects the server key with 401, returns HTTP 502 Bad Gateway."""
        os.environ["PARSE_API_KEY"] = "pmx_dummy_test_secret_key_12345678"
        mock_resp = MagicMock()
        mock_resp.status_code = 401
        mock_resp.text = '{"error": "Invalid API key"}'
        mock_get.return_value = mock_resp

        response = self.client.get("/api/v1/nasa/resources", headers=self.valid_headers)
        self.assertEqual(response.status_code, 502)
        self.assertIn("rejected server authentication credentials", response.json()["detail"])

    # -------------------------------------------------------------------------
    # 6. Strict Credential Leak Protection Test
    # -------------------------------------------------------------------------
    @patch("requests.get")
    def test_zero_secret_leakage_in_response(self, mock_get):
        """Asserts that PARSE_API_KEY never leaks in response body or headers."""
        super_secret = "pmx_classified_super_secret_nasa_key_99999"
        os.environ["PARSE_API_KEY"] = super_secret

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "status": "success",
            "data": {
                "sections": [{"section": "BPS", "items": [{"title": "Research"}]}]
            }
        }
        mock_get.return_value = mock_resp

        response = self.client.get("/api/v1/nasa/resources", headers=self.valid_headers)
        self.assertEqual(response.status_code, 200)

        # Body check
        raw_body = response.text
        self.assertNotIn(super_secret, raw_body)

        # Header check
        for h_key, h_val in response.headers.items():
            self.assertNotIn(super_secret, h_key)
            self.assertNotIn(super_secret, h_val)

    # -------------------------------------------------------------------------
    # 7. Live Server Integration Probe (with actual configured secret)
    # -------------------------------------------------------------------------
    def test_live_server_proxy_execution(self):
        """Executes authentic proxy call against Parse.bot if real key is configured."""
        if not self.real_key:
            self.skipTest("PARSE_API_KEY not set in environment. Skipping live test.")

        os.environ["PARSE_API_KEY"] = self.real_key
        response = self.client.get("/api/v1/nasa/resources", headers=self.valid_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("science.nasa.gov", data["page_url"])
        self.assertGreater(data["sections_count"], 0)
        self.assertGreater(data["total_items_discovered"], 0)


if __name__ == "__main__":
    unittest.main()
