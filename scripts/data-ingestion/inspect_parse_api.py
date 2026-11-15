#!/usr/bin/env python3
"""
CLI Tool: Parse.bot API Inspector for GODEYE // PYRO-SI
Usage:
    python3 scripts/data-ingestion/inspect_parse_api.py [--timeout 10] [--method GET|POST] [--probe-unauthenticated]

Strict Boundaries:
- Reads PARSE_API_KEY from os.environ.
- Never prints, logs, or writes API keys or secrets.
- If PARSE_API_KEY is not set, safely reports that live authenticated retrieval could not be executed.
"""

import argparse
import json
import os
import sys

# Ensure backend modules are in Python path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from backend.ingestion.parse_api_client import (
    ClientStatus,
    DEFAULT_ENDPOINT_URL,
    DEFAULT_TIMEOUT_SECONDS,
    ParseDataResourceInspector,
)


def main():
    parser = argparse.ArgumentParser(description="Inspect Parse.bot NASA Combustion Data Resource API")
    parser.add_argument("--endpoint", default=DEFAULT_ENDPOINT_URL, help="Parse.bot API endpoint URL")
    parser.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT_SECONDS, help="Request timeout in seconds")
    parser.add_argument("--method", choices=["GET", "POST"], default="GET", help="HTTP Method")
    parser.add_argument(
        "--probe-unauthenticated",
        action="store_true",
        help="Execute an unauthenticated probe to test live server reachability and 401 response"
    )
    parser.add_argument("--json", action="store_true", help="Output raw JSON inspection result")

    args = parser.parse_args()

    inspector = ParseDataResourceInspector(
        endpoint_url=args.endpoint,
        timeout=args.timeout
    )

    print("=" * 70)
    print(" GODEYE // PYRO-SI — Parse.bot Data Resource Discovery & Inspection")
    print("=" * 70)
    print(f"Endpoint: {inspector.endpoint_url}")
    print(f"Method:   {args.method}")
    print(f"Timeout:  {args.timeout}s")
    print(f"Auth Key: {inspector.get_masked_key()} (from PARSE_API_KEY env)")
    print("-" * 70)

    # Execute inspection
    result = inspector.inspect_endpoint(
        method=args.method,
        force_unauthenticated_probe=args.probe_unauthenticated
    )

    if args.json:
        print(json.dumps(result.to_dict(), indent=2))
        return

    print(f"Execution Status: {result.status.value}")
    if result.status_code:
        print(f"HTTP Status Code: {result.status_code}")
    if result.error_message:
        print(f"Notice / Message: {result.error_message}")
    if result.raw_response_preview:
        print(f"Server Response:  {result.raw_response_preview}")

    print("-" * 70)
    print(f"Resource Count:      {result.resource_count}")
    print(f"Pagination Detected: {result.pagination_detected}")
    if result.pagination_details:
        print(f"Pagination Details:  {json.dumps(result.pagination_details, indent=2)}")
    if result.schema_summary:
        print(f"Schema Summary:      {json.dumps(result.schema_summary, indent=2)}")

    print("=" * 70)


if __name__ == "__main__":
    main()
