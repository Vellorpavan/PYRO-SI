#!/usr/bin/env python3
"""
Automated Screenshot Capture Engine for Phase 2.1 Verification
Saves high-resolution captures of audited views into screenshots/phase-2-1/
"""

import subprocess
import time
import os

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = "/Users/pavan/Desktop/PYRO-SI/screenshots/phase-2-1"

views = [
    {
        "name": "00_home_dashboard.png",
        "url": "http://localhost:8089/index.html?tab=tab-home",
        "width": 1440,
        "height": 900
    },
    {
        "name": "01_env_iss.png",
        "url": "http://localhost:8089/index.html?tab=tab-home&env=ISS",
        "width": 1440,
        "height": 900
    },
    {
        "name": "01_env_moon.png",
        "url": "http://localhost:8089/index.html?tab=tab-home&env=MOON",
        "width": 1440,
        "height": 900
    },
    {
        "name": "01_env_mars.png",
        "url": "http://localhost:8089/index.html?tab=tab-home&env=MARS",
        "width": 1440,
        "height": 900
    },
    {
        "name": "01_env_eva.png",
        "url": "http://localhost:8089/index.html?tab=tab-home&env=SUIT",
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
    }
]

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"[Phase 2.1] Starting HTTP server on port 8089...")
    server = subprocess.Popen(["python3", "-m", "http.server", "8089"], cwd="/Users/pavan/Desktop/PYRO-SI", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)

    try:
        for v in views:
            out_path = os.path.join(OUTPUT_DIR, v["name"])
            cmd = [
                CHROME_BIN,
                "--headless",
                "--enable-webgl",
                "--virtual-time-budget=3000",
                f"--window-size={v['width']},{v['height']}",
                f"--screenshot={out_path}",
                v["url"]
            ]
            print(f"[Phase 2.1] Capturing {v['name']} ({v['width']}x{v['height']})...")
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            print(f"  ✔ Saved {out_path} ({os.path.getsize(out_path)} bytes)")
    finally:
        print("[Phase 2.1] Terminating HTTP server...")
        server.terminate()
        server.wait()

    print("[Phase 2.1] All verification screenshots captured successfully.")

if __name__ == "__main__":
    main()
