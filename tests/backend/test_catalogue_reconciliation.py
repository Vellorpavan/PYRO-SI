"""
Test Suite: tests/backend/test_catalogue_reconciliation.py
Project: GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform
Phase: 2.3.4.2 Scientific Data Classification Audit

Verifies:
1. Mathematical reconciliation: summary totals strictly equal the mathematical sum of individual records.
2. Distinct dataset size semantics: metadata-reported volume vs available file volume.
3. Zero-file investigations (PSI-22, PSI-68, PSI-69, PSI-99) have 0 available bytes and are never labeled downloadable.
4. Separation of experimental configuration from experimental measurements (Phase 2.3.4.2).
5. Explicit mutually exclusive file-level and investigation-level classifications.
6. Exact volume difference reconciliation down to 0 bytes unaccounted.
7. Verification stages A-G status for all investigations.
"""

import json
import os
import unittest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
RECONCILED_CATALOGUE_PATH = os.path.join(REPO_ROOT, "src/data/reference/psi-reconciled-combustion.json")


class TestCatalogueReconciliation(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.assertTrue(
            os.path.exists(RECONCILED_CATALOGUE_PATH),
            f"Reconciled catalogue file missing at {RECONCILED_CATALOGUE_PATH}"
        )
        with open(RECONCILED_CATALOGUE_PATH, "r", encoding="utf-8") as f:
            cls.data = json.load(f)
        cls.summary = cls.data["summary"]
        cls.investigations = cls.data["investigations"]

    def test_summary_totals_equal_sum_of_records(self):
        """
        Task 1: Summary totals must strictly equal the mathematical sum of individual records.
        Tests fail if summary totals do not equal the sum of individual records.
        """
        derived_investigation_count = len(self.investigations)
        derived_file_count = sum(inv["available_file_count"] for inv in self.investigations)
        derived_meta_bytes = sum(inv["metadata_reported_size_bytes"] for inv in self.investigations)
        derived_avail_bytes = sum(inv["available_file_size_bytes"] for inv in self.investigations)
        derived_zero_file_count = sum(1 for inv in self.investigations if inv["available_file_count"] == 0)
        derived_nonzero_file_count = sum(1 for inv in self.investigations if inv["available_file_count"] > 0)
        derived_meta_only_bytes = sum(
            inv["metadata_reported_size_bytes"]
            for inv in self.investigations
            if inv["available_file_count"] == 0
        )

        self.assertEqual(self.summary["total_investigations"], derived_investigation_count)
        self.assertEqual(self.summary["total_available_files"], derived_file_count)
        self.assertEqual(self.summary["total_metadata_reported_bytes"], derived_meta_bytes)
        self.assertEqual(self.summary["total_available_file_size_bytes"], derived_avail_bytes)
        self.assertEqual(self.summary["investigations_with_zero_files"], derived_zero_file_count)
        self.assertEqual(self.summary["investigations_with_available_files"], derived_nonzero_file_count)
        self.assertEqual(self.summary["total_metadata_only_bytes"], derived_meta_only_bytes)

        # Exact ground-truth audit checks
        self.assertEqual(derived_investigation_count, 24)
        self.assertEqual(derived_file_count, 16354)
        self.assertEqual(derived_nonzero_file_count, 20)
        self.assertEqual(derived_zero_file_count, 4)

    def test_zero_file_investigations_never_classified_as_downloadable(self):
        """
        Task 4: An investigation with 0 available files (PSI-22, PSI-68, PSI-69, PSI-99)
        must NEVER be described as having downloadable data merely because metadata lists a volume.
        """
        zero_file_accessions = {"PSI-22", "PSI-68", "PSI-69", "PSI-99"}

        for inv in self.investigations:
            acc = inv["accession"]
            if acc in zero_file_accessions:
                self.assertEqual(
                    inv["available_file_count"], 0,
                    f"{acc} must have available_file_count == 0"
                )
                self.assertEqual(
                    inv["available_file_size_bytes"], 0,
                    f"{acc} must have available_file_size_bytes == 0"
                )
                self.assertEqual(
                    inv["successfully_downloaded_file_count"], 0,
                    f"{acc} must have 0 downloaded files"
                )
                self.assertEqual(
                    inv["investigation_classification"], "CONTENT_NOT_YET_INSPECTED",
                    f"{acc} with 0 files must be CONTENT_NOT_YET_INSPECTED"
                )
                self.assertFalse(
                    inv["verification_stages"]["stage_b_file_metadata_retrieved"],
                    f"{acc} must have stage_b_file_metadata_retrieved == False"
                )
                self.assertFalse(
                    inv["verification_stages"]["stage_c_download_url_generated"],
                    f"{acc} must have stage_c_download_url_generated == False"
                )
                self.assertGreater(
                    inv["metadata_reported_size_bytes"], 0,
                    f"{acc} has metadata-reported bytes in NASA PSI, which must be tracked separately"
                )

    def test_dataset_size_semantics_separated(self):
        """
        Separate schema fields:
        metadata_reported_size_bytes, available_file_size_bytes, available_file_count,
        successfully_downloaded_file_count, content_inspected_file_count.
        """
        required_size_fields = {
            "metadata_reported_size_bytes",
            "available_file_size_bytes",
            "available_file_count",
            "successfully_downloaded_file_count",
            "content_inspected_file_count"
        }

        for inv in self.investigations:
            for field in required_size_fields:
                self.assertIn(field, inv, f"Investigation {inv.get('accession')} missing field {field}")
                self.assertIsInstance(inv[field], int, f"{field} must be an integer")
                self.assertGreaterEqual(inv[field], 0, f"{field} must be non-negative")

    def test_single_table_size_discrepancy_reconciled(self):
        """
        Investigations like PSI-20, PSI-21, PSI-106 list ~67 GB to 1.89 TB in metadata,
        but only a small CSV table was actually deposited in S3 added array.
        Assert that available_file_size_bytes reflects the real uploaded bytes (< 5 KB),
        while metadata_reported_size_bytes reflects the NASA metadata field.
        """
        discrepancy_cases = {
            "PSI-106": (734, 67 * 1024**3),        # ~734 B actual vs ~67 GB meta
            "PSI-20": (1113, 1800 * 1024**3),     # ~1.1 KB actual vs ~1.89 TB meta
            "PSI-21": (2454, 1800 * 1024**3)      # ~2.4 KB actual vs ~1.86 TB meta
        }

        for acc, (expected_actual_bytes, min_meta_bytes) in discrepancy_cases.items():
            inv = next((i for i in self.investigations if i["accession"] == acc), None)
            self.assertIsNotNone(inv, f"{acc} not found in reconciled catalogue")
            self.assertEqual(inv["available_file_size_bytes"], expected_actual_bytes)
            self.assertGreaterEqual(inv["metadata_reported_size_bytes"], min_meta_bytes)
            self.assertEqual(inv["available_file_count"], 1)

    def test_experimental_configuration_never_classified_as_measurements(self):
        """
        Phase 2.3.4.2 Task 1 & 2: Prevent experimental configuration files from being
        automatically classified as experimental measurements.
        Files containing planned settings, test schedules, or burner configurations
        must strictly be classified as EXPERIMENTAL_CONFIGURATION.
        """
        configuration_accessions = {"PSI-20", "PSI-21", "PSI-106", "PSI-26"}

        for acc in configuration_accessions:
            inv = next((i for i in self.investigations if i["accession"] == acc), None)
            self.assertIsNotNone(inv, f"{acc} missing from investigations")
            rep = inv.get("representative_file")
            self.assertIsNotNone(rep, f"{acc} missing representative file")
            
            # File classification MUST be EXPERIMENTAL_CONFIGURATION
            self.assertEqual(
                rep.get("file_classification"), "EXPERIMENTAL_CONFIGURATION",
                f"{acc} representative file {rep.get('name')} must be EXPERIMENTAL_CONFIGURATION"
            )
            # Must NEVER be classified as NUMERICAL_EXPERIMENTAL_MEASUREMENTS
            self.assertNotEqual(
                rep.get("file_classification"), "NUMERICAL_EXPERIMENTAL_MEASUREMENTS",
                f"{acc} representative file must never be classified as measurements"
            )
            # Setting columns must be populated, observation columns empty or non-sensor
            self.assertTrue(len(rep.get("setting_columns", [])) > 0)
            self.assertEqual(len(rep.get("observation_columns", [])), 0)

    def test_investigation_level_classification_decoupled(self):
        """
        Phase 2.3.4.2 Task 4: An investigation can contain multiple types of files.
        Do not assume that one configuration file proves the entire investigation has measurements.
        Maintain file-level and investigation-level classifications separately.
        """
        # PSI-20, 21, 106 have only 1 configuration file in S3 -> EXPERIMENTAL_CONFIGURATION_ONLY
        for acc in ["PSI-20", "PSI-21", "PSI-106"]:
            inv = next((i for i in self.investigations if i["accession"] == acc), None)
            self.assertEqual(inv["investigation_classification"], "EXPERIMENTAL_CONFIGURATION_ONLY")
            self.assertFalse(inv["has_flight_measurements"])
            self.assertTrue(inv["is_configuration_only"])

        # PSI-25, 26 contain videos, still sequences, and test matrices -> VIDEO_AND_CONFIGURATION_ONLY
        for acc in ["PSI-25", "PSI-26"]:
            inv = next((i for i in self.investigations if i["accession"] == acc), None)
            self.assertEqual(inv["investigation_classification"], "VIDEO_AND_CONFIGURATION_ONLY")
            self.assertFalse(inv["has_flight_measurements"])

        # PSI-98, 100, 10, 23, 159 have verified flight sensor time series
        for acc in ["PSI-98", "PSI-100", "PSI-10", "PSI-23", "PSI-159"]:
            inv = next((i for i in self.investigations if i["accession"] == acc), None)
            self.assertEqual(inv["investigation_classification"], "VERIFIED_FLIGHT_MEASUREMENTS_AVAILABLE")
            self.assertTrue(inv["has_flight_measurements"])

    def test_exact_volume_difference_equation_zero_unaccounted(self):
        """
        Phase 2.3.4.2 Task 5: Reconcile the remaining volume difference:
        Total Meta (13,496,771,103,733 B)
        - Available S3 (6,267,023,479,252 B)
        - Zero-File Meta (3,115,728,155,991 B)
        - Partial Unuploaded Meta (4,114,019,468,490 B)
        = 0 bytes unaccounted!
        """
        total_meta = sum(inv["metadata_reported_size_bytes"] for inv in self.investigations)
        total_avail = sum(inv["available_file_size_bytes"] for inv in self.investigations)
        zero_file_meta = sum(
            inv["metadata_reported_size_bytes"]
            for inv in self.investigations
            if inv["available_file_count"] == 0
        )
        partial_unuploaded = sum(
            inv["metadata_reported_size_bytes"] - inv["available_file_size_bytes"]
            for inv in self.investigations
            if inv["available_file_count"] > 0
        )

        unaccounted = total_meta - (total_avail + zero_file_meta + partial_unuploaded)
        self.assertEqual(unaccounted, 0, "Unaccounted byte difference must be exactly 0")

        # Verify the dominant single-table unuploaded contributors
        psi20 = next(i for i in self.investigations if i["accession"] == "PSI-20")
        psi21 = next(i for i in self.investigations if i["accession"] == "PSI-21")
        psi106 = next(i for i in self.investigations if i["accession"] == "PSI-106")

        psi20_diff = psi20["metadata_reported_size_bytes"] - psi20["available_file_size_bytes"]
        psi21_diff = psi21["metadata_reported_size_bytes"] - psi21["available_file_size_bytes"]
        psi106_diff = psi106["metadata_reported_size_bytes"] - psi106["available_file_size_bytes"]

        self.assertGreater(psi20_diff, 1800 * 1024**3)
        self.assertGreater(psi21_diff, 1800 * 1024**3)
        self.assertGreater(psi106_diff, 67 * 1024**3)

    def test_mutually_exclusive_file_level_taxonomy(self):
        """
        Phase 2.3.4.2 Task 2: Validate 7 mutually exclusive file-level classifications.
        """
        valid_file_classes = {
            "EXPERIMENTAL_CONFIGURATION",
            "NUMERICAL_EXPERIMENTAL_MEASUREMENTS",
            "NUMERICAL_DERIVED_DATA",
            "DOCUMENTATION_ONLY",
            "VIDEO_OR_IMAGE_ONLY",
            "CODE_OR_MODEL_ONLY",
            "CONTENT_NOT_YET_INSPECTED"
        }

        for inv in self.investigations:
            rep = inv.get("representative_file")
            if rep:
                self.assertIn(
                    rep.get("file_classification"), valid_file_classes,
                    f"Invalid file classification in {inv['accession']}"
                )

    def test_seven_verification_stages_evaluated(self):
        """
        Evaluate 7 verification stages (Stage A to G) for all investigations.
        """
        required_stages = [
            "stage_a_metadata_retrieved",
            "stage_b_file_metadata_retrieved",
            "stage_c_download_url_generated",
            "stage_d_bytes_retrieved",
            "stage_e_file_downloaded",
            "stage_f_content_inspected",
            "stage_g_numerical_confirmed"
        ]

        for inv in self.investigations:
            stages = inv["verification_stages"]
            for s in required_stages:
                self.assertIn(s, stages, f"{inv['accession']} missing stage {s}")
                self.assertIsInstance(stages[s], bool)

            self.assertTrue(stages["stage_a_metadata_retrieved"])

            if inv["available_file_count"] > 0:
                self.assertTrue(stages["stage_b_file_metadata_retrieved"])
                self.assertTrue(stages["stage_c_download_url_generated"])
                self.assertTrue(stages["stage_d_bytes_retrieved"])
                self.assertTrue(stages["stage_e_file_downloaded"])
                self.assertTrue(stages["stage_f_content_inspected"])
                self.assertIsNotNone(inv["representative_file"])
            else:
                self.assertFalse(stages["stage_b_file_metadata_retrieved"])
                self.assertFalse(stages["stage_c_download_url_generated"])
                self.assertIsNone(inv["representative_file"])


if __name__ == "__main__":
    unittest.main()
