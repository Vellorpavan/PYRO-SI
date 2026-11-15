#!/usr/bin/env python3
"""
Automated Screenshot Capture Engine for PYRO-SI Visual Review
Uses Google Chrome Headless with WebGL support over local HTTP.
"""

import subprocess
import time
import os
import signal

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = "/Users/pavan/Desktop/PYRO-SI/screenshots"

views = [
    {
        "name": "01_lab_workspace_globe.png",
        "url": "http://localhost:8089/index.html?tab=tab-godeye&studio=globe",
        "width": 1440,
        "height": 900
    },
    {
        "name": "01_lab_workspace_flame.png",
        "url": "http://localhost:8089/index.html?tab=tab-godeye&studio=flame",
        "width": 1440,
        "height": 900
    },
    {
        "name": "02_investigation_matrix.png",
        "url": "http://localhost:8089/index.html?tab=tab-psi",
        "width": 1440,
        "height": 1100
    },
    {
        "name": "03_flammability_simulator.png",
        "url": "http://localhost:8089/index.html?tab=tab-simulator",
        "width": 1440,
        "height": 1100
    },
    {
        "name": "04_research_copilot.png",
        "url": "http://localhost:8089/index.html?tab=tab-sicopilot",
        "width": 1440,
        "height": 1050
    },
    {
        "name": "05_submission_kit.png",
        "url": "http://localhost:8089/index.html?tab=tab-submission",
        "width": 1440,
        "height": 950
    },
    {
        "name": "06_mobile_layout.png",
        "url": "http://localhost:8089/index.html?tab=tab-godeye",
        "width": 390,
        "height": 844
    }
]

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("[PYRO-SI] Starting background HTTP server on port 8089...")
    server = subprocess.Popen(["python3", "-m", "http.server", "8089"], cwd="/Users/pavan/Desktop/PYRO-SI", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)

    try:
        for v in views:
            out_path = os.path.join(OUTPUT_DIR, v["name"])
            cmd = [
                CHROME_BIN,
                "--headless",
                "--enable-webgl",
                "--virtual-time-budget=2500",
                f"--window-size={v['width']},{v['height']}",
                f"--screenshot={out_path}",
                v["url"]
            ]
            print(f"[Capture] Generating {v['name']} ({v['width']}x{v['height']})...")
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            print(f"  ✔ Saved {out_path} ({os.path.getsize(out_path)} bytes)")
    finally:
        print("[PYRO-SI] Terminating HTTP server...")
        server.terminate()
        server.wait()

    print("[PYRO-SI] All visual verification screenshots captured successfully.")

if __name__ == "__main__":
    main()
