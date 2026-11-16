"""
Test Suite: tests/backend/test_catalogue_reconciliation.py
Project: GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform
Phase: 2.3.4.1 Independent Catalogue Reconciliation & Dataset Content Verification

Verifies:
1. Mathematical reconciliation: summary totals strictly equal the mathematical sum of individual records.
2. Distinct dataset size semantics: metadata-reported volume vs available file volume.
3. Zero-file investigations (PSI-22, PSI-68, PSI-69, PSI-99) have 0 available bytes and are never labeled downloadable.
4. Epistemic classifications across all 24 combustion investigations.
5. Verification stages A-G status for all investigations.
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
                self.assertNotEqual(
                    inv["epistemic_classification"], "VERIFIED_DATASET_AVAILABLE",
                    f"{acc} with 0 files must never be classified as VERIFIED_DATASET_AVAILABLE"
                )
                self.assertFalse(
                    inv["verification_stages"]["stage_b_file_metadata_retrieved"],
                    f"{acc} must have stage_b_file_metadata_retrieved == False"
                )
                self.assertFalse(
                    inv["verification_stages"]["stage_c_download_url_generated"],
                    f"{acc} must have stage_c_download_url_generated == False"
                )
                # Ensure metadata reported size is non-zero (proving the discrepancy is tracked)
                self.assertGreater(
                    inv["metadata_reported_size_bytes"], 0,
                    f"{acc} has metadata-reported bytes in NASA PSI, which must be tracked separately"
                )

    def test_dataset_size_semantics_separated(self):
        """
        Task 4: Separate schema fields:
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
        Task 1 & 4: Investigations like PSI-20, PSI-21, PSI-106 list ~67 GB to 1.89 TB in metadata,
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

    def test_epistemic_classifications_sum_to_total(self):
        """
        Task 3: Evidence classification into mutually exclusive categories:
        NUMERICAL_EXPERIMENTAL_DATA, CODE_OR_MODEL_ONLY, DOCUMENTATION_ONLY,
        CONTENT_NOT_YET_INSPECTED, NUMERICAL_DERIVED_DATA, VIDEO_OR_IMAGE_ONLY.
        """
        counts = self.summary["classifications_breakdown"]
        total_classified = sum(counts.values())
        self.assertEqual(total_classified, len(self.investigations))

        # Check exact verified counts
        self.assertEqual(counts["NUMERICAL_EXPERIMENTAL_DATA"], 16)
        self.assertEqual(counts["CODE_OR_MODEL_ONLY"], 2)  # PSI-115, PSI-117
        self.assertEqual(counts["DOCUMENTATION_ONLY"], 2)   # PSI-60, PSI-62
        self.assertEqual(counts["CONTENT_NOT_YET_INSPECTED"], 4)  # PSI-22, PSI-68, PSI-69, PSI-99

    def test_seven_verification_stages_evaluated(self):
        """
        Task 2: Evaluate 7 verification stages (Stage A to G) for all investigations.
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

            # All 24 investigations have Stage A true
            self.assertTrue(stages["stage_a_metadata_retrieved"])

            # 20 investigations with files have Stage B through F true
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
