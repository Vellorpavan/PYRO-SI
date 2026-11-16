"""
Unit and Integration Tests for Research Co-Pilot & NASA PSI Combustion RAG Engine
Phase 2.3.4 Acceptance Verification Suite
"""

import json
import os
import stat
import sys
import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from backend.api.main import app, CREDENTIALS_FILE, mask_gemini_key, get_active_gemini_key
from backend.intelligence.nasa_rag import rag_engine, SPHERICAL_DIFFUSION_FLAME_DIAGRAM


class TestResearchCopilotRag(unittest.TestCase):
    """Verifies all 9 core acceptance queries, BYOK API key management, and privacy requirements."""

    def setUp(self):
        self.client = TestClient(app)
        # Ensure clean state for credentials file in tests
        self.backup_creds = None
        if os.path.exists(CREDENTIALS_FILE):
            with open(CREDENTIALS_FILE, "r") as f:
                self.backup_creds = f.read()
            os.remove(CREDENTIALS_FILE)

    def tearDown(self):
        if os.path.exists(CREDENTIALS_FILE):
            os.remove(CREDENTIALS_FILE)
        if self.backup_creds:
            with open(CREDENTIALS_FILE, "w") as f:
                f.write(self.backup_creds)

    # -------------------------------------------------------------------------
    # Core Acceptance Query Tests (1 through 9)
    # -------------------------------------------------------------------------
    def test_query_1_what_is_nasa_psi(self):
        """Query 1: What is NASA PSI? Returns authoritative overview without hallucination."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "What is NASA PSI?"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["intent"], "thematic")
        self.assertIn("Physical Sciences Informatics", data["title"])
        self.assertIn("psi.nasa.gov", data["content"])
        self.assertTrue(data["verified"])
        self.assertTrue(len(data["sources"]) > 0)

    def test_query_2_explain_bass_ii(self):
        """Query 2: Explain BASS-II. Returns flight hardware (MSG), PMMA fuel, flow (0-55 cm/s), video epistemology."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "Explain BASS-II."})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["intent"], "investigation")
        self.assertIn("PSI-25", data["badge"])
        self.assertIn("BASS-II", data["title"])
        self.assertIn("Microgravity Science Glovebox", data["content"])
        self.assertIn("0 to 55 cm/s", data["content"])
        self.assertIn("PMMA", data["content"])
        self.assertIn("optical video", data["content"].lower())
        self.assertTrue(data["verified"])
        self.assertIsNotNone(data["image"])

    def test_query_3_compare_bass_and_saffire(self):
        """Query 3: Compare BASS-II and SAFFIRE-I. Contrasts small-scale vs large-scale structural burns."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "Compare BASS-II and SAFFIRE-I."})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["intent"], "comparison")
        self.assertIn("Comparative Synthesis", data["title"])
        self.assertIn("BASS-II", data["title"])
        self.assertIn("SAFFIRE-I", data["title"])
        self.assertIn("Cygnus", data["content"])
        self.assertIn("Microgravity Science Glovebox", data["content"])
        self.assertTrue(data["verified"])
        self.assertTrue(len(data["sources"]) >= 2)

    def test_query_4_oxygen_concentration_effects(self):
        """Query 4: How does oxygen concentration affect microgravity combustion? Covers LOI and exploration atmosphere."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "How does oxygen concentration affect microgravity combustion?"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["intent"], "thematic")
        self.assertIn("Oxygen Concentration", data["title"])
        self.assertIn("Limiting Oxygen Index", data["content"])
        self.assertIn("34% O2", data["content"])
        self.assertIn("NASA-STD-3001", data["content"])
        self.assertTrue(data["verified"])

    def test_query_5_spherical_diffusion_flames_with_visual(self):
        """Query 5: Explain spherical diffusion flames with a visual. Attaches labeled schematic diagram + flight photo."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "Explain spherical diffusion flames with a visual."})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["intent"], "thematic")
        self.assertIn("Spherical", data["title"])
        self.assertIn("ACME", data["badge"])
        self.assertIn("molecular diffusion", data["content"].lower())
        self.assertIn("soot shell", data["content"].lower())
        self.assertIsNotNone(data["diagramHtml"])
        self.assertIn("SPHERICAL DIFFUSION FLAME", data["diagramHtml"])
        self.assertIn("<svg", data["diagramHtml"])
        self.assertIsNotNone(data["image"])
        self.assertIn("card_acme.jpg", data["image"])

    def test_query_6_lunar_partial_gravity_combustion(self):
        """Query 6: What evidence is available for lunar partial-gravity combustion? Discloses theoretical model vs unflown gap."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "What evidence is available for lunar partial-gravity combustion?"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["intent"], "thematic")
        self.assertIn("Lunar", data["title"])
        self.assertIn("0.16g", data["content"])
        self.assertIn("34% O2", data["content"])
        self.assertIn("T'ien & Ferkul", data["content"])
        self.assertTrue(data["verified"])

    def test_query_7_write_c_program_rejected(self):
        """Query 7: Write a C program. Rejected politely with clear research domain scope explanation."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "Write a C program."})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["intent"], "unsupported")
        self.assertFalse(data["verified"])
        self.assertIn("Scope Limitation", data["badge"])
        self.assertIn("programming", data["content"].lower())
        self.assertEqual(len(data["citations"]), 0)

    def test_query_8_who_is_elon_musk_rejected(self):
        """Query 8: Who is Elon Musk? Rejected politely with celebrity/entertainment scope explanation."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "Who is Elon Musk?"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["intent"], "unsupported")
        self.assertFalse(data["verified"])
        self.assertIn("Scope Limitation", data["badge"])
        self.assertIn("outside the research scope", data["content"])
        self.assertEqual(len(data["citations"]), 0)

    def test_query_9_out_of_evidence_saturn_battery_runaway(self):
        """Query 9: Out of evidence question (lithium battery runaway in Saturn's atmosphere). Admits NASA PSI archive boundary."""
        resp = self.client.post("/api/v1/copilot/query", json={"query": "How does lithium battery thermal runaway behave in Saturn's atmosphere?"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["intent"], "unsupported")
        self.assertFalse(data["verified"])
        self.assertIn("Out of Flight Evidence", data["badge"])
        self.assertIn("Saturn", data["content"])
        self.assertIn("No experimental combustion data exists", data["content"])

    # -------------------------------------------------------------------------
    # BYOK API Key Configuration, Masking, and Security/Privacy Tests
    # -------------------------------------------------------------------------
    def test_gemini_key_masking_function(self):
        """Validates that mask_gemini_key masks middle characters securely."""
        self.assertEqual(mask_gemini_key(""), "••••••••")
        self.assertEqual(mask_gemini_key("short"), "••••••••")
        self.assertEqual(mask_gemini_key("SAMPLE_TEST_KEY_FOR_UNIT_TESTING_PURPOSES_1234"), "SAMPLE_T...1234")

    def test_gemini_status_unconfigured(self):
        """Status endpoint returns configured=false when no key is set."""
        resp = self.client.get("/api/v1/auth/gemini-key/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertFalse(data["configured"])
        self.assertIsNone(data["masked_key"])

    @patch("google.genai.Client")
    def test_gemini_key_configuration_and_file_permissions(self, mock_client_cls):
        """Validates that POST /api/v1/auth/gemini-key tests the key, saves with chmod 0600, and masks output."""
        # Mock successful generation
        mock_instance = MagicMock()
        mock_resp = MagicMock()
        mock_resp.text = "OK"
        mock_instance.models.generate_content.return_value = mock_resp
        mock_client_cls.return_value = mock_instance

        test_key = "AQ.TestKeySample1234567890ABCDEF"
        resp = self.client.post("/api/v1/auth/gemini-key", json={"api_key": test_key})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertTrue(data["configured"])
        self.assertEqual(data["masked_key"], mask_gemini_key(test_key))

        # Check local file persistence and permissions (chmod 0600)
        self.assertTrue(os.path.exists(CREDENTIALS_FILE))
        mode = os.stat(CREDENTIALS_FILE).st_mode
        # Octal permission mask for file owner read/write only (0o600)
        file_perm = stat.S_IMODE(mode)
        self.assertEqual(file_perm, 0o600, f"Credentials file must have 0600 permissions, got {oct(file_perm)}")

        with open(CREDENTIALS_FILE, "r") as f:
            saved_data = json.load(f)
            self.assertEqual(saved_data["gemini_api_key"], test_key)

        # Verify status endpoint reflects configured status with masked key
        status_resp = self.client.get("/api/v1/auth/gemini-key/status")
        self.assertEqual(status_resp.status_code, 200)
        status_data = status_resp.json()
        self.assertTrue(status_data["configured"])
        self.assertEqual(status_data["masked_key"], mask_gemini_key(test_key))
        self.assertEqual(status_data["source"], "file")

        # Test DELETE /api/v1/auth/gemini-key removes file cleanly
        del_resp = self.client.delete("/api/v1/auth/gemini-key")
        self.assertEqual(del_resp.status_code, 200)
        self.assertFalse(os.path.exists(CREDENTIALS_FILE))

    @patch("google.genai.Client")
    def test_invalid_gemini_key_rejected(self, mock_client_cls):
        """Invalid Gemini key triggers HTTP 400 with descriptive error detail."""
        mock_instance = MagicMock()
        mock_instance.models.generate_content.side_effect = Exception("API_KEY_INVALID: User key is invalid.")
        mock_client_cls.return_value = mock_instance

        resp = self.client.post("/api/v1/auth/gemini-key", json={"api_key": "invalid_key_123"})
        self.assertEqual(resp.status_code, 400)
        self.assertIn("validation failed", resp.json()["detail"].lower())
        self.assertFalse(os.path.exists(CREDENTIALS_FILE))


if __name__ == "__main__":
    unittest.main()
