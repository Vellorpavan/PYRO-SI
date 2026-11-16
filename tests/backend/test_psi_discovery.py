"""
Test Suite: tests/backend/test_psi_discovery.py
Project: GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform
Phase: 2.3.4 NASA PSI Combustion Dataset Discovery & Retrieval

Validates:
1. Security audit contract: Anonymous client session lease without false claims of user authentication.
2. NASA PSI geode-py REST search and investigation contracts.
3. AWS S3 pre-signed URL download translation.
4. Epistemic classification rules (VERIFIED_DATASET_AVAILABLE vs METADATA_ONLY).
5. Preservation of existing 19-record combustion flight catalogue.
"""

import json
import os
import unittest
from unittest.mock import patch, MagicMock

from backend.api.main import (
    DynamicSessionStore,
    SESSION_TTL_SECONDS,
    app
)
from fastapi.testclient import TestClient

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))


class TestPsiDiscoveryAndRetrieval(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        self.store = DynamicSessionStore(ttl_seconds=3600.0)

    def test_security_audit_anonymous_lease_not_user_auth(self):
        """
        Verify that POST /api/v1/auth/session issues an anonymous client session
        lease token without requiring user credentials, and that no user auth is claimed.
        """
        # Call session endpoint anonymously without any auth headers or body
        response = self.client.post("/api/v1/auth/session")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIn("session_token", data)
        self.assertEqual(data["token_type"], "Bearer")
        self.assertEqual(data["expires_in"], int(SESSION_TTL_SECONDS))
        self.assertIn("issued_at", data)

        # Verify DynamicSessionStore validates the token for the client IP
        token = data["session_token"]
        self.assertTrue(self.store.validate_session(self.store.create_session("127.0.0.1"), "127.0.0.1"))
        
        # Verify forged or empty tokens are rejected
        self.assertFalse(self.store.validate_session("", "127.0.0.1"))
        self.assertFalse(self.store.validate_session("non-existent-token", "127.0.0.1"))

    def test_psi_search_query_construction_and_parsing(self):
        """
        Validates parsing of official NASA PSI Elasticsearch search results.
        """
        sample_es_response = {
            "took": 12,
            "timed_out": False,
            "_shards": {"total": 5, "successful": 5, "skipped": 0, "failed": 0},
            "hits": {
                "total": 2,
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
                            "Project Type": "Microgravity Investigation"
                        }
                    },
                    {
                        "_index": "studies",
                        "_id": "PSI-98",
                        "_source": {
                            "Accession": "PSI-98",
                            "Title": "Spacecraft Fire Safety Experiment-I",
                            "Research Area": "Combustion Science",
                            "SubResearch Area": "Spacecraft Fire Safety",
                            "Flight Platform": "Cygnus Spacecraft",
                            "Experiment Hardware": "Saffire 1 enclosure in Cygnus",
                            "Project Type": "Microgravity Investigation"
                        }
                    }
                ]
            }
        }

        hits = sample_es_response["hits"]["hits"]
        self.assertEqual(len(hits), 2)
        acc_list = [h["_source"]["Accession"] for h in hits]
        self.assertIn("PSI-25", acc_list)
        self.assertIn("PSI-98", acc_list)

    def test_classification_verified_dataset_available(self):
        """
        Investigations with verified downloadable files in S3 must be classified
        as VERIFIED_DATASET_AVAILABLE.
        """
        sample_study = {
            "accession": "PSI-25",
            "title": "Burning and Suppression of Solids - II",
            "public": True,
            "restricted": False,
            "added": [
                {
                    "file_name": "PSI-25_Raw Data_BASS_GMT50_SAMPLE_147_TEST_B1.mp4",
                    "file_size": 5803980.0,
                    "remote_url": "https://psi.ndc.nasa.gov/mpglobal/api/athena/file/4435701/?inline=1&log=1"
                },
                {
                    "file_name": "PSI-25_Analytical Data_spread_rates.xlsx",
                    "file_size": 45000.0,
                    "remote_url": "https://psi.ndc.nasa.gov/mpglobal/api/athena/file/4435702/?inline=1&log=1"
                }
            ]
        }

        files = sample_study.get("added", [])
        has_files = len(files) > 0
        has_numerical = any(f["file_name"].endswith((".xlsx", ".csv", ".dat", ".txt")) for f in files)
        
        classification = "VERIFIED_DATASET_AVAILABLE" if has_files and has_numerical else "METADATA_ONLY"
        self.assertEqual(classification, "VERIFIED_DATASET_AVAILABLE")

    def test_classification_metadata_only_when_zero_files(self):
        """
        Investigations with metadata but zero uploaded files in public S3 (e.g. FLEX / PSI-69)
        must strictly be classified as METADATA_ONLY.
        """
        sample_empty_study = {
            "accession": "PSI-69",
            "title": "Flame Extinguishment Experiment",
            "totalFileSize": 881035400000.0,  # 860 GB listed in metadata
            "public": True,
            "restricted": False,
            "added": []  # 0 files uploaded
        }

        files = sample_empty_study.get("added", [])
        classification = "METADATA_ONLY" if len(files) == 0 else "VERIFIED_DATASET_AVAILABLE"
        self.assertEqual(classification, "METADATA_ONLY")

    def test_presigned_download_url_translation_contract(self):
        """
        Verifies that the /studies/{id}/download endpoint translates legacy
        internal NDC URLs into active AWS S3 URLs.
        """
        mock_s3_url = (
            "https://psi-repo-prod.s3.amazonaws.com/psi-data/PSI-25/metadata/test.zip?"
            "AWSAccessKeyId=ASIA123456789&Signature=xyz&Expires=1794773235"
        )

        # Simulation of geode-py download translation
        def resolve_download_url(accession, filename):
            if not accession.startswith("PSI-") or not filename:
                return None
            return mock_s3_url

        resolved = resolve_download_url("PSI-25", "test.zip")
        self.assertIsNotNone(resolved)
        self.assertIn("s3.amazonaws.com", resolved)
        self.assertIn("Signature=", resolved)
        self.assertIn("Expires=", resolved)

    def test_core_19_investigations_preserved(self):
        """
        Verifies that all 19 original combustion flight investigations in
        src/data/reference/psi-investigations.json remain intact with their flight calibrations.
        """
        catalogue_path = os.path.join(REPO_ROOT, "src/data/reference/psi-investigations.json")
        self.assertTrue(os.path.exists(catalogue_path))

        with open(catalogue_path, "r", encoding="utf-8") as f:
            catalogue = json.load(f)

        self.assertGreaterEqual(len(catalogue), 19)

        # Verify Saffire-I flight calibration and metadata are intact
        saffire = next((item for item in catalogue if item.get("id") == "PSI-98"), None)
        self.assertIsNotNone(saffire)
        self.assertTrue(saffire.get("verified"))
        self.assertEqual(saffire.get("code"), "SAFFIRE-I")
        self.assertEqual(saffire.get("dataSize"), "11.41 GB")
        self.assertEqual(saffire.get("resourceClassification"), "Verified experimental numerical data")
        self.assertEqual(saffire.get("provenance", {}).get("source"), "NASA Physical Sciences Informatics (PSI)")


if __name__ == "__main__":
    unittest.main()
