"""
Unit, Contract, and Security Tests for Backend Parse.bot Proxy Gateway
Module: tests.backend.test_proxy_endpoint
Project: GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform

Verifies:
1. Dynamic session handshake (POST /api/v1/auth/session)
2. Client authorization enforcement (401 on missing or invalid session token)
3. Successful proxy retrieval (mocked and live)
4. Server-side secret injection from PARSE_API_KEY
5. Rate limiting enforcement (429 on abuse)
6. Timeout and gateway error translation (504, 502)
7. Zero secret leakage in response payloads, headers, or exception traces
"""

import json
import os
import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from requests.exceptions import Timeout

from backend.api.main import app, rate_limiter, session_store


class TestNasaResourcesProxy(unittest.TestCase):
    """Test suite for the secure NASA resources backend proxy."""

    def setUp(self):
        self.client = TestClient(app)
        # Reset state before each test
        rate_limiter.requests.clear()
        session_store.sessions.clear()
        self.real_key = os.environ.get("PARSE_API_KEY", "")

        # Obtain a valid dynamic session token
        auth_resp = self.client.post("/api/v1/auth/session")
        self.assertEqual(auth_resp.status_code, 200)
        self.valid_session_token = auth_resp.json()["session_token"]
        self.valid_headers = {"X-Session-Token": self.valid_session_token}

    def tearDown(self):
        rate_limiter.requests.clear()
        session_store.sessions.clear()
        if self.real_key:
            os.environ["PARSE_API_KEY"] = self.real_key

    # -------------------------------------------------------------------------
    # 1. Dynamic Session Handshake & Authorization Tests
    # -------------------------------------------------------------------------
    def test_session_handshake_issues_dynamic_token(self):
        """Client can request a dynamic session token without static embedded secrets."""
        response = self.client.post("/api/v1/auth/session")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("session_token", data)
        self.assertGreater(len(data["session_token"]), 20)
        self.assertEqual(data["token_type"], "Bearer")
        self.assertGreater(data["expires_in"], 0)

    def test_missing_app_authorization_returns_401(self):
        """Unauthenticated client request must return HTTP 401 Unauthorized."""
        response = self.client.get("/api/v1/nasa/resources")
        self.assertEqual(response.status_code, 401)
        self.assertIn("Session token required", response.json()["detail"])

    def test_invalid_session_token_returns_401(self):
        """Request with incorrect or forged session token must return HTTP 401 Unauthorized."""
        headers = {"X-Session-Token": "invalid-forged-token-xyz-123456789"}
        response = self.client.get("/api/v1/nasa/resources", headers=headers)
        self.assertEqual(response.status_code, 401)
        self.assertIn("Session token required", response.json()["detail"])

    def test_bearer_authorization_accepted(self):
        """Bearer token in Authorization header is accepted."""
        headers = {"Authorization": f"Bearer {self.valid_session_token}"}
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
        self.assertIn("Materials Science", accessions[0]["discipline"])
        self.assertFalse(accessions[0]["is_combustion_study"])

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

    # -------------------------------------------------------------------------
    # 8. Research Co-Pilot Intent-Aware Query Tests
    # -------------------------------------------------------------------------
    def test_copilot_greeting_intent(self):
        """User input 'hello' returns conversational greeting without fabricated synthesis."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "hello"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["badge"], "Conversational Assistant")
        self.assertIn("Space Combustion Research Co-Pilot", data["title"])
        self.assertEqual(data["citations"], [])
        self.assertNotIn("Cross-Investigation Query", data["badge"])

    def test_copilot_investigation_intent(self):
        """User input 'What is BASS-II?' retrieves relevant NASA information and citations."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "What is BASS-II?"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("BASS-II", data["title"])
        self.assertIn("PSI-25", data["badge"])
        self.assertIn("Microgravity Science Glovebox", data["content"])
        self.assertTrue(len(data["citations"]) > 0)
        self.assertIn("10.2514/6.2014-0414", data["citations"])

    def test_copilot_comparison_intent(self):
        """User input 'Compare BASS-II and SAFFIRE-I' returns comparative synthesis."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "Compare BASS-II and SAFFIRE-I"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("Comparative Synthesis", data["badge"])
        self.assertIn("BASS-II (PSI-25) vs SAFFIRE-I (PSI-98)", data["title"])
        self.assertIn("Microgravity Science Glovebox", data["content"])
        self.assertIn("Cygnus", data["content"])
        self.assertEqual(len(data["citations"]), 2)

    def test_copilot_unsupported_intent(self):
        """Unsupported question returns an explicit limitation without fabricated citations."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "What is the speed of sound on Mars?"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["badge"], "Evidence Limitation")
        self.assertIn("Evidence Limitation", data["title"])
        self.assertIn("No matching experimental records", data["content"])
        self.assertEqual(data["citations"], [])


if __name__ == "__main__":
    unittest.main()
