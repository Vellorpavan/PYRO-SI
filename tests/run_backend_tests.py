#!/usr/bin/env python3
"""
Python Backend & Ingestion Test Runner for GODEYE // PYRO-SI
Phase 2.3.1 Verification Suite
"""

import os
import sys
import unittest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../"))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)


def run_tests():
    print("\n\033[1m\033[36m=======================================================")
    print("  GODEYE // PYRO-SI — PYTHON BACKEND VERIFICATION SUITE")
    print("=======================================================\033[0m\n")

    loader = unittest.TestLoader()
    suite = loader.discover(
        start_dir=os.path.join(REPO_ROOT, "tests/backend"),
        pattern="test_*.py"
    )

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\n-------------------------------------------------------")
    print(f"Summary: {result.testsRun} run, {len(result.failures)} failures, {len(result.errors)} errors")
    print("-------------------------------------------------------")

    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(run_tests())
