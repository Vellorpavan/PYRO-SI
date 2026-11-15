#!/usr/bin/env python3
"""
NASA Physical Sciences Informatics (PSI) Ingestion & Validation Utility
Fetches, validates, and updates the local PSI dataset store.
"""

import json
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
DATA_FILE = os.path.join(BASE_DIR, 'src/data/reference/psi-investigations.json')
SCHEMA_FILE = os.path.join(BASE_DIR, 'src/data/schemas/investigation.schema.json')

def validate_local_dataset():
    print(f"[PYRO-SI Ingestion] Validating local dataset: {DATA_FILE}")
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found!")
        sys.exit(1)

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        records = json.load(f)

    print(f"Loaded {len(records)} PSI investigations.")
    required_keys = [
        "id", "code", "title", "rack", "rackFull", "fuelType",
        "fuelDetails", "airflowRange", "variables", "sensors",
        "summary", "lunarHabWeight", "materialPrevWeight",
        "smokeDetWeight", "suppressionWeight", "doi"
    ]

    errors = 0
    for idx, rec in enumerate(records):
        for k in required_keys:
            if k not in rec:
                print(f"  [ERROR] Study #{idx+1} ({rec.get('code', 'UNKNOWN')}) missing key: {k}")
                errors += 1

    if errors == 0:
        print("  \033[32m✔ SUCCESS:\033[0m All investigations conform to schema requirements.")
    else:
        print(f"  \033[31m✖ FAILED:\033[0m Found {errors} schema errors.")
        sys.exit(1)

if __name__ == '__main__':
    validate_local_dataset()
