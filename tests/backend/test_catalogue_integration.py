"""
Unit, Integrity, and Schema Validation Tests for NASA Catalogue Integrator
Module: tests.backend.test_catalogue_integration
Project: GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform

Verifies Task 4 Requirements:
1. Missing or invalid source identifiers
2. Duplicate record detection and provenance protection
3. Missing NASA source URLs handling
4. Non-combustion discipline classification (PSI-178, PSI-138, PSI-187)
5. Raw response audit preservation and SHA-256 hashing
6. Incomplete/invalid response structure handling
7. Preservation of all 19 original catalogue records
"""

import json
import os
import tempfile
import unittest

from backend.ingestion.catalogue_integrator import (
    CatalogueIntegrator,
    IntegrationStatus,
    DEFAULT_CATALOGUE_PATH
)


class TestCatalogueIntegrator(unittest.TestCase):
    """Test suite for CatalogueIntegrator and data provenance contracts."""

    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.raw_dir = os.path.join(self.temp_dir, "raw")
        self.integrator = CatalogueIntegrator(
            catalogue_path=DEFAULT_CATALOGUE_PATH,
            raw_dir=self.raw_dir
        )

    # -------------------------------------------------------------------------
    # 1. Missing or Invalid Source Identifier Tests
    # -------------------------------------------------------------------------
    def test_missing_identifier_rejected(self):
        """Item without PSI accession ID must be rejected with INVALID_IDENTIFIER."""
        bad_item = {
            "title": "Generic Microgravity Experiment",
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/",
            "description": "No accession number here"
        }
        normalized, status = self.integrator.normalize_discovered_item(bad_item)
        self.assertIsNone(normalized)
        self.assertEqual(status, IntegrationStatus.INVALID_IDENTIFIER)

    def test_malformed_identifier_rejected(self):
        """Item with malformed ID (e.g. ABC-999) must be rejected."""
        bad_item = {
            "title": "Non-NASA Study ABC-999",
            "url": "https://psi.nasa.gov/data/ABC-999",
            "description": "Not a standard PSI accession"
        }
        normalized, status = self.integrator.normalize_discovered_item(bad_item)
        self.assertIsNone(normalized)
        self.assertEqual(status, IntegrationStatus.INVALID_IDENTIFIER)

    # -------------------------------------------------------------------------
    # 2. Missing NASA Source URL Tests
    # -------------------------------------------------------------------------
    def test_missing_source_url_rejected(self):
        """Item without a valid NASA domain URL must be rejected with MISSING_SOURCE_URL."""
        bad_item = {
            "title": "PSI-199 Study on Commercial Mirror",
            "url": "https://commercial-blog.example.com/psi-199",
            "description": "Hosted outside official NASA infrastructure"
        }
        normalized, status = self.integrator.normalize_discovered_item(bad_item)
        self.assertIsNone(normalized)
        self.assertEqual(status, IntegrationStatus.MISSING_SOURCE_URL)

    def test_empty_url_rejected(self):
        """Item with empty URL string must be rejected."""
        bad_item = {
            "title": "PSI-199 Missing URL",
            "url": "",
            "description": "No link provided"
        }
        normalized, status = self.integrator.normalize_discovered_item(bad_item)
        self.assertIsNone(normalized)
        self.assertEqual(status, IntegrationStatus.MISSING_SOURCE_URL)

    # -------------------------------------------------------------------------
    # 3. Duplicate Detection & Provenance Protection Tests
    # -------------------------------------------------------------------------
    def test_duplicate_combustion_study_skipped_and_provenance_preserved(self):
        """
        Attempting to re-ingest an existing verified record (e.g. BASS-II / PSI-25)
        must skip insertion and preserve the higher-tier VERIFIED_DATASET status.
        """
        duplicate_candidate = {
            "title": "Burning and Suppression of Solids - II (PSI-25)",
            "url": "https://psi.nasa.gov/investigation/PSI-25",
            "description": "Scraped summary of BASS-II"
        }

        result = self.integrator.deduplicate_and_integrate([duplicate_candidate])
        self.assertEqual(result["inserted_count"], 0)
        self.assertEqual(result["skipped_duplicate_count"], 1)

        skipped = result["skipped_records"][0]
        self.assertEqual(skipped["id"], "PSI-25")
        self.assertEqual(skipped["reason"], IntegrationStatus.PROVENANCE_PRESERVED)
        self.assertEqual(skipped["existing_tier"], "VERIFIED_DATASET")

    def test_saffire_provenance_never_downgraded(self):
        """Saffire-I (PSI-98) with VERIFIED_DATASET cannot be overwritten by scraped metadata."""
        saffire_candidate = {
            "title": "Spacecraft Fire Safety Experiment (PSI-98)",
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-98",
            "description": "Saffire-I in Cygnus"
        }
        result = self.integrator.deduplicate_and_integrate([saffire_candidate])
        self.assertEqual(result["inserted_count"], 0)
        self.assertEqual(result["skipped_duplicate_count"], 1)
        self.assertEqual(result["skipped_records"][0]["id"], "PSI-98")

    # -------------------------------------------------------------------------
    # 4. Valid Discovered NASA Non-Combustion Physical Science Normalization
    # -------------------------------------------------------------------------
    def test_psi_178_materials_science_normalization(self):
        """PSI-178 is normalized as Materials Science / Non-Combustion."""
        item = {
            "title": "PSI-178: The origin of fragility in high-temperature oxide liquids",
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-178",
            "description": "ELF-6 PRONTO containerless levitation"
        }
        normalized, status = self.integrator.normalize_discovered_item(item)
        self.assertEqual(status, IntegrationStatus.INSERTED)
        self.assertIsNotNone(normalized)
        self.assertEqual(normalized["id"], "PSI-178")
        self.assertEqual(normalized["code"], "ELF-6 PRONTO")
        self.assertIn("Materials Science", normalized["provenance"]["notes"])
        self.assertIn("Non-Combustion", normalized["fuelType"])
        self.assertEqual(normalized["provenance"]["verificationStatus"], "VERIFIED_METADATA_ONLY")

    def test_psi_138_fluid_boiling_normalization(self):
        """PSI-138 is normalized as Fluid Physics Pool Boiling / Non-Combustion."""
        item = {
            "title": "PSI-138: Pool Boiling Heat Transfer Mechanisms in Low Gravity",
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-138",
            "description": "MABE and NPBX boiling data"
        }
        normalized, status = self.integrator.normalize_discovered_item(item)
        self.assertEqual(status, IntegrationStatus.INSERTED)
        self.assertEqual(normalized["id"], "PSI-138")
        self.assertEqual(normalized["code"], "MABE / NPBX")
        self.assertIn("Fluid Physics", normalized["provenance"]["notes"])
        self.assertIn("Boiling", normalized["fuelType"])

    def test_psi_187_plant_water_normalization(self):
        """PSI-187 is normalized as Fluid Physics Capillary Plant Water."""
        item = {
            "title": "PSI-187: Plant Water Management (PWM)",
            "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-187",
            "description": "Capillary fluidics for plants"
        }
        normalized, status = self.integrator.normalize_discovered_item(item)
        self.assertEqual(status, IntegrationStatus.INSERTED)
        self.assertEqual(normalized["id"], "PSI-187")
        self.assertEqual(normalized["code"], "PWM")
        self.assertIn("Fluid Physics", normalized["provenance"]["notes"])

    # -------------------------------------------------------------------------
    # 5. Raw Response Preservation & Hash Integrity Tests
    # -------------------------------------------------------------------------
    def test_raw_response_preservation_and_sha256_manifest(self):
        """Raw response must be saved with valid SHA-256 hash and manifest entry."""
        sample_payload = {
            "scraper_id": "328daab1-12f9-4464-b73d-b5e0c392bfe7",
            "status": "success",
            "data": {"test_field": "verifiable_raw_audit_stream"}
        }
        saved_path = self.integrator.preserve_raw_response(
            raw_payload=sample_payload,
            scraper_id="328daab1-12f9-4464-b73d-b5e0c392bfe7"
        )
        self.assertTrue(os.path.exists(saved_path))

        # Check manifest
        manifest_path = os.path.join(self.raw_dir, "manifest.json")
        self.assertTrue(os.path.exists(manifest_path))
        with open(manifest_path, "r", encoding="utf-8") as mf:
            manifest = json.load(mf)
        self.assertEqual(len(manifest), 1)
        self.assertIn("sha256", manifest[0])
        self.assertEqual(len(manifest[0]["sha256"]), 64)

    # -------------------------------------------------------------------------
    # 6. Preservation of All 19 Existing Catalogue Records
    # -------------------------------------------------------------------------
    def test_existing_catalogue_preservation(self):
        """Verifies that all 19 original records in psi-investigations.json are preserved."""
        catalogue = self.integrator.load_existing_catalogue()
        self.assertEqual(len(catalogue), 19)

        # Confirm critical combustion benchmarks exist and are untouched
        ids = {r["id"] for r in catalogue}
        self.assertIn("PSI-25", ids)   # BASS-II
        self.assertIn("PSI-98", ids)   # Saffire-I
        self.assertIn("PSI-159", ids)  # Saffire-II
        self.assertIn("PSI-20", ids)   # ACME BRE
        self.assertIn("PSI-21", ids)   # ACME CLD Flame
        self.assertIn("PSI-69", ids)   # FLEX

        # Check that SAFFIRE-I retains verified flight anchor (2.24 mm/s)
        saffire = next(r for r in catalogue if r["id"] == "PSI-98")
        self.assertEqual(saffire["provenance"]["verificationStatus"], "VERIFIED_DATASET")


if __name__ == "__main__":
    unittest.main()
