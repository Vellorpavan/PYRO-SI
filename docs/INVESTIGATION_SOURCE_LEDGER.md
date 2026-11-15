# GODEYE // PYRO-SI — Investigation Source Ledger

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-LEDGER-001  
**Version:** 3.0 (Phase 1.1 Verified Evidence Baseline)  
**Primary Archive Authority:** NASA Biological and Physical Sciences (BPS) / Physical Sciences Informatics (PSI) System

---

## 1. Overview & Evaluation Framework

This source ledger documents the verification of NASA microgravity combustion investigations. Each investigation is evaluated across 14 discrete scientific parameters, separating primary flight observations from secondary publications, and detailing hardware platforms, fuel states, data products, and fire-safety categorization.

---

## 2. Primary Investigation Source Ledger (Core 10 Investigations)

### 01. BASS-II (Burning and Suppression of Solids - II)
- **Official Title:** Burning and Suppression of Solids - II
- **PSI Identifier:** `PSI-25` (Precursor: `PSI-26` BASS)
- **Primary Publication DOI:** `10.2514/6.2014-0414` (AIAA SciTech 2014)
- **Research Area / Sub-Area:** Combustion Science / Solid Fuel Combustion & Fire Safety
- **Flight Platform:** International Space Station (ISS) — U.S. Destiny Laboratory
- **Flight Hardware:** Microgravity Science Glovebox (MSG) with small flow duct wind tunnel
- **Flight Completion Status:** Completed Flight Investigation (Executed on ISS Expeditions 37–41)
- **Experimental Objectives:** Investigate the extinction limits, burning rates, and flame spread over thick and thin solid fuels in low-velocity forced flows ($0 - 40\text{ cm/s}$) under varying oxygen concentrations.
- **Hardware Used:** MSG work volume, internal small wind tunnel, manual sample changer, dual video cameras, radiometers, nitrogen gas injection flow controller.
- **Fuel / Material Category:** Solid polymers & composites (PMMA acrylic flat sheets $100 - 300\ \mu\text{m}$, acrylic rods, cotton-fiberglass fabric).
- **Available Experimental Conditions:**
  - Ambient Pressure: $1.0\text{ atm}$ ($14.7\text{ psia}$ / $101.3\text{ kPa}$)
  - Forced Air Velocity: $0\text{ to }40\text{ cm/s}$ (Opposed and concurrent flows)
  - Oxygen Concentration: $14.0\%\text{ to }21.0\%\ \text{O}_2$ (vitiated via continuous $\text{N}_2$ dilution)
  - Gravity Level: Continuous orbital microgravity ($\sim 10^{-6}\text{g}$)
- **Repository Record URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-25`
- **Available File Categories:** Numerical spreadsheet tables, radiometer time-series, thermocouple CSV logs, high-speed camera MP4 video files, post-flight engineering reports.
- **Actual Downloadable Files & Sizes:** Total uploaded server archive: $255.77\text{ GB}$ across 130 test runs. Tabular metadata and sample burn rate summary tables: $\sim 14.2\text{ MB}$ (machine-readable CSV/ASCII).
- **Fire-Safety Categorization:** **Material Flammability & Fire Prevention (Primary)** / **Fire Suppression (Secondary via N₂ Inerting)**.
- **Inclusion Justification:** Core empirical benchmark for solid material flammability in crewed habitats under forced ventilation. Directly refutes the assumption that zero-buoyancy flames self-extinguish when HVAC airflow is active.

---

### 02. SAFFIRE-I (Spacecraft Fire Safety Experiment-I)
- **Official Title:** Spacecraft Fire Safety Experiment-I
- **PSI Identifier:** `PSI-98` (Campaign includes: `PSI-99` Saffire-II, `PSI-100` Saffire-III)
- **Primary Publication DOI:** `10.1016/j.actaastro.2019.03.023` (Acta Astronautica, 2019)
- **Research Area / Sub-Area:** Combustion Science / Large-Scale Spacecraft Fire Safety
- **Flight Platform:** Northrop Grumman (Orbital ATK) Cygnus Commercial Resupply Cargo Vehicle
- **Flight Hardware:** Dedicated Saffire flow duct module ($0.5\text{ m} \times 0.5\text{ m} \times 1.0\text{ m}$) installed in Cygnus pressurized cargo module
- **Flight Completion Status:** Completed Flight Investigation (Executed post-ISS unberthing, June 2016, Cygnus OA-6)
- **Experimental Objectives:** Measure large-scale flame growth and spread velocity over practical spacecraft fabrics in low-speed forced flow under microgravity without endangerment of human crew.
- **Hardware Used:** Saffire flow wind tunnel, high-definition video camera arrays (S1C1, S1C2), hot-wire igniter, thermocouple trees, calibrated pressure transducers, $\text{O}_2/\text{CO}_2$ gas sensors, anemometers.
- **Fuel / Material Category:** Solid composite fabric: SIBAL (Solid Inflammatory Boundary at Low Speed; 75% cotton, 25% fiberglass blend, $0.37\text{ mm}$ thick, $40.6\text{ cm}$ wide, $94.0\text{ cm}$ long).
- **Available Experimental Conditions:**
  - Ambient Pressure: $14.2\text{ psia}$ ($98\text{ kPa}$)
  - Forced Air Velocity: $20\text{ cm/s}$
  - Oxygen Concentration: $21.5\%\ \text{O}_2$ (ambient Cygnus cabin air)
  - Gravity Level: Continuous orbital microgravity ($\sim 10^{-6}\text{g}$)
- **Repository Record URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-98`
- **Available File Categories:** Calibrated sensor time-series DAT files, thermocouple text tables, multi-angle camera MP4 video files, engineering implementation technical reports.
- **Actual Downloadable Files & Sizes:** Total uploaded server archive: $11.41\text{ GB}$ across 74 files. Numerical telemetry tables: $\sim 8.4\text{ MB}$ (calibrated thermocouple and pressure data, fully machine-readable).
- **Fire-Safety Categorization:** **Material Flammability & Fire Prevention (Primary)** / **Fire Detection (Secondary)**.
- **Inclusion Justification:** The only completed large-scale ($>0.5\text{ m}$) solid material flame growth experiment in space. Provides real-world flame spread rates ($2.24\text{ mm/s}$ concurrent, $0.34\text{ mm/s}$ opposed) to benchmark exploration habitat fire codes.

---

### 03. ACME CFI-G (Cool Flames Investigation with Gases)
- **Official Title:** Advanced Combustion via Microgravity Experiments: Cool Flames Investigation with Gases
- **PSI Identifier:** `PSI-159`
- **Primary Publication DOI:** `10.1016/j.proci.2020.06.368` (Proc. Combust. Inst., 2021)
- **Research Area / Sub-Area:** Combustion Science / Gas-Phase Chemical Kinetics & Cool Flames
- **Flight Platform:** International Space Station (ISS) — U.S. Destiny Laboratory
- **Flight Hardware:** Combustion Integrated Rack (CIR) — Chamber Insert Assembly
- **Flight Completion Status:** Completed Flight Campaign
- **Experimental Objectives:** Observe and characterize gas-phase cool diffusion flames supported by spherical or coflow diffusion of gaseous hydrocarbon fuels, determining low-temperature chemical kinetics and extinction limits without buoyant distortion.
- **Hardware Used:** CIR pressure chamber, gas delivery system, mass flow controllers, multispectral radiometer, low-light photomultiplier tubes, intensified cameras.
- **Fuel / Material Category:** Gaseous hydrocarbons (Ethane $\text{C}_2\text{H}_6$, Propane $\text{C}_3\text{H}_8$, n-Butane $\text{C}_4\text{H}_{10}$) with Nitrogen/Helium diluents.
- **Available Experimental Conditions:**
  - Ambient Pressure: $0.5\text{ to }2.0\text{ atm}$ ($50 - 200\text{ kPa}$)
  - Flow Regimes: Quiescent spherical diffusion and laminar coflow
  - Oxygen Concentration: $15\%\text{ to }30\%\ \text{O}_2$
  - Gravity Level: Microgravity ($\sim 10^{-6}\text{g}$)
- **Repository Record URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-159`
- **Available File Categories:** Multispectral radiometer DAT files, gas flow logs, high-speed and chemiluminescence video files, science summary reports.
- **Actual Downloadable Files & Sizes:** Total uploaded server archive: $1.90\text{ TB}$. Tabular radiometer and flow logs: $\sim 45\text{ MB}$.
- **Fire-Safety Categorization:** **Combustion Fundamentals & Fire Prevention**.
- **Inclusion Justification:** Essential for identifying low-temperature ($600 - 800\text{ K}$) invisible combustion pathways where fuel/oxidizer reactions continue without visible light emission, creating hidden re-ignition risks in closed habitats.

---

### 04. ACME BRE (Burning Rate Emulator)
- **Official Title:** Burning Rate Emulator
- **PSI Identifier:** `PSI-20`
- **Primary Publication DOI:** `10.1016/j.combustflame.2019.04.032` (Combust. Flame, 2019)
- **Research Area / Sub-Area:** Combustion Science / Solid Fuel Burning Emulation
- **Flight Platform:** International Space Station (ISS) — U.S. Destiny Laboratory
- **Flight Hardware:** Combustion Integrated Rack (CIR)
- **Flight Completion Status:** Completed Flight Campaign
- **Experimental Objectives:** Emulate the burning rate, heat feedback, and extinction limits of practical solid plastics by injecting gaseous fuels through porous flat and cylindrical sintered metal burners with controlled heat extraction.
- **Hardware Used:** CIR chamber, porous sintered bronze burners (flat and cylindrical), internal heat sinks, radiometers, surface heat flux transducers.
- **Fuel / Material Category:** Gaseous fuel blends emulating solids (Methane, Ethylene, Propane).
- **Available Experimental Conditions:**
  - Ambient Pressure: $0.7\text{ to }1.0\text{ atm}$ ($70 - 101.3\text{ kPa}$)
  - Flow: Low-velocity coflow and quiescent
  - Oxygen: $15\% - 21\%\ \text{O}_2$
  - Gravity: Microgravity ($\sim 10^{-6}\text{g}$)
- **Repository Record URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-20`
- **Available File Categories:** Burner heat flux CSV logs, fuel mass flow controller telemetry, color video camera recordings, technical summaries.
- **Actual Downloadable Files & Sizes:** Total uploaded server archive: $1.85\text{ TB}$. Tabular heat flux and burning rate records: $\sim 32\text{ MB}$.
- **Fire-Safety Categorization:** **Material Flammability & Combustion Fundamentals**.
- **Inclusion Justification:** Bridges the gap between pure gas combustion and complex solid polymer pyrolysis by isolating surface heat feedback from gas-phase chemical kinetics.

---

### 05. FLEX / CFI (Flame Extinguishment Experiment / Cool Flames)
- **Official Title:** Flame Extinguishment Experiment / Cool Flames Investigation
- **PSI Identifier:** `PSI-69` (Successor: `PSI-70` FLEX-2)
- **Primary Publication DOI:** `10.1016/j.combustflame.2014.01.002` (Combust. Flame, 2014)
- **Research Area / Sub-Area:** Combustion Science / Droplet Combustion & Low-Temperature Kinetics
- **Flight Platform:** International Space Station (ISS) — U.S. Destiny Laboratory
- **Flight Hardware:** Combustion Integrated Rack (CIR) / Multi-user Droplet Combustion Apparatus (MDCA)
- **Flight Completion Status:** Completed Flight Campaign
- **Experimental Objectives:** Characterize the burning, extinction, and unexpected cool flame persistence of isolated liquid hydrocarbon droplets in microgravity under varying inert diluents.
- **Hardware Used:** MDCA chamber insert, automated droplet dispensing and deployment needles, retractable hot-wire igniter, calibrated radiometers, shadowgraphy cameras.
- **Fuel / Material Category:** Liquid hydrocarbon fuels (n-heptane, n-octane, n-decane, methanol, ethanol; $1.0 - 5.0\text{ mm}$ droplets).
- **Available Experimental Conditions:**
  - Ambient Pressure: $0.5\text{ to }3.0\text{ atm}$ ($50 - 300\text{ kPa}$)
  - Gaseous Environment: Air, $\text{O}_2/\text{N}_2$, $\text{O}_2/\text{CO}_2$, $\text{O}_2/\text{He}$ mixtures
  - Gravity: Microgravity ($\sim 10^{-6}\text{g}$)
- **Repository Record URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-69`
- **Available File Categories:** Droplet diameter decay tables (CSV/DAT), radiometer time-series, backlit shadowgraphy MP4 videos, NASA technical memoranda.
- **Actual Downloadable Files & Sizes:** Total uploaded server archive: $860.39\text{ GB}$. Numerical droplet decay logs: $\sim 18.5\text{ MB}$ (fully machine-readable).
- **Fire-Safety Categorization:** **Combustion Fundamentals & Fire Extinction Thresholds**.
- **Inclusion Justification:** Landmark discovery of spherical cool flames where burning continues after visible extinction, establishing the scientific requirement to monitor low-temperature chemical reactions in habitat fire-safety systems.

---

### 06. SAME-R (Smoke Aerosol Measurement Experiment - Reflight)
- **Official Title:** Smoke Aerosol Measurement Experiment - Reflight
- **PSI Identifier:** `PSI-101` (Precursor: `PSI-46` SAME)
- **Primary Publication DOI:** `10.1080/02786826.2017.1355474` (Aerosol Sci. Technol., 2017)
- **Research Area / Sub-Area:** Fire Safety / Spacecraft Smoke Detection & Aerosol Dynamics
- **Flight Platform:** International Space Station (ISS) — U.S. Destiny Laboratory
- **Flight Hardware:** Microgravity Science Glovebox (MSG)
- **Flight Completion Status:** Completed Flight Campaign
- **Experimental Objectives:** Measure the size distribution, number concentration, and morphological evolution of smoke particulates generated from overheated spacecraft materials in microgravity to improve fire detector sensitivity and prevent false alarms.
- **Hardware Used:** MSG work volume, automated pyrolysis furnace, Differential Mobility Analyzer (DMA), modified Condensation Particle Counter (CPC), optical transmission photometers.
- **Fuel / Material Category:** Spacecraft overheating materials: Cellulose (paper/cotton), Pyrell polyurethane foam, Kapton (polyimide), Teflon (PTFE wire insulation), silicone elastomer.
- **Available Experimental Conditions:**
  - Operating Atmosphere: Nominal ISS cabin air ($21\%\ \text{O}_2$, $14.7\text{ psia}$)
  - Heating Regimes: Non-flaming thermal pyrolysis ($200 - 500^\circ\text{C}$)
  - Gravity: Microgravity ($\sim 10^{-6}\text{g}$)
- **Repository Record URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-101`
- **Available File Categories:** Aerosol size distribution CSV files, CPC particle concentration logs, heating profile telemetry, technical reports.
- **Actual Downloadable Files & Sizes:** Total uploaded server archive: $5.87\text{ GB}$. Particle size spectra CSV files: $\sim 6.2\text{ MB}$ (fully machine-readable).
- **Fire-Safety Categorization:** **Fire Detection (Primary Core)**.
- **Inclusion Justification:** Fundamental reference for spacecraft smoke detection. Proved that microgravity smoke particles agglomerate into larger sizes ($d_p > 0.5\ \mu\text{m}$) than in $1\text{g}$, directly driving optical detector sensor selection for Orion, Gateway, and commercial habitats.

---

### 07. ACME E-FIELD (Electric-Field Effects on Coflow Flames)
- **Official Title:** Electric-Field Effects on Coflow Flames
- **PSI Identifier:** `PSI-22`
- **Primary Publication DOI:** `10.1016/j.proci.2018.06.128` (Proc. Combust. Inst., 2019)
- **Research Area / Sub-Area:** Combustion Science / External Field Manipulation & Convective Analogues
- **Flight Platform:** International Space Station (ISS) — U.S. Destiny Laboratory
- **Flight Hardware:** Combustion Integrated Rack (CIR)
- **Flight Completion Status:** Completed Flight Campaign
- **Experimental Objectives:** Assess the influence of high-voltage DC electric fields on non-buoyant diffusion flames, investigating whether electrostatic forces acting on chemi-ions ($F = qE$) can tailor flame shape, soot deposition, and stability.
- **Hardware Used:** CIR chamber, coflow gas burner, high-voltage DC power supply (up to $10\text{ kV}$), electrode meshes, ion current sensors, color camera.
- **Fuel / Material Category:** Gaseous fuels: Methane and Ethylene coflow flames.
- **Available Experimental Conditions:**
  - Electric Potential: $0\text{ to }10\text{ kV}$ DC
  - Atmosphere: Air and $\text{O}_2/\text{N}_2$ mixtures ($14.7\text{ psia}$)
  - Gravity: Microgravity ($\sim 10^{-6}\text{g}$)
- **Repository Record URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-22`
- **Available File Categories:** Electrode current/voltage logs, camera MP4 recordings, ion current DAT files, technical publications.
- **Actual Downloadable Files & Sizes:** Total uploaded server archive: $884.95\text{ GB}$. Numerical current and voltage logs: $\sim 21\text{ MB}$.
- **Fire-Safety Categorization:** **Combustion Fundamentals & Novel Fire Suppression (Active Field Quenching)**.
- **Inclusion Justification:** Demonstrates active flame manipulation via non-chemical body forces, functioning as an experimental proxy for buoyant acceleration and pointing to future solid-state electric fire-damping systems.

---

### 08. DAFT / DAFT-2 (Dust and Aerosol Measurement Feasibility Test)
- **Official Title:** Dust and Aerosol Measurement Feasibility Test (DAFT-1 and DAFT-2)
- **PSI Identifier:** `PSI-47` (Follow-on: `PSI-48` DAFT-2)
- **Primary Publication DOI:** `10.2514/6.2012-3482` (AIAA ICES, 2012)
- **Research Area / Sub-Area:** Life Support & Environmental Monitoring / Fire Detection Instrumentation
- **Flight Platform:** International Space Station (ISS) — Express Rack 4 / Node 1
- **Flight Hardware:** Modified TSI P-Trak CPC and DustTrak optical aerosol monitor
- **Flight Completion Status:** Completed Flight Investigation (Executed on ISS Expeditions 29/30)
- **Experimental Objectives:** Validate a redesigned condensation particle counter using capillary fluid recovery (independent of gravity) to ensure reliable particle counting in space, and benchmark cabin background dust levels against fire smoke.
- **Hardware Used:** Modified P-Trak, standard DustTrak, calibration air filters, Arizona Road Dust (ARD) test generator.
- **Fuel / Material Category:** Test aerosol dust: ISO 12103-1 A1 Ultrafine and A2 Fine Arizona Road Dust (ARD).
- **Available Experimental Conditions:**
  - Operating Atmosphere: ISS cabin ambient ($21\%\ \text{O}_2$, $14.7\text{ psia}$)
  - Particulate Regimes: Background cabin dust, active crew exercise periods, HEPA filtered zero-air
  - Gravity: Microgravity ($\sim 10^{-6}\text{g}$)
- **Repository Record URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-47`
- **Available File Categories:** Optical transmission and particle count CSV tables, instrument health logs, ICES conference papers.
- **Actual Downloadable Files & Sizes:** Total uploaded server archive: $39.83\text{ MB}$ (Compact numerical records and telemetry logs, 100% machine-readable).
- **Fire-Safety Categorization:** **Fire Detection & Nuisance False Alarm Mitigation**.
- **Inclusion Justification:** Vital for lunar base fire safety: demonstrates that ambient mineral dust particles can trigger false alarms in spacecraft smoke detectors, establishing the need for multi-wavelength dust vs. smoke discrimination algorithms.

---

### 09. SPICE (Smoke Point In Co-flow Experiment)
- **Official Title:** Smoke Point In Co-flow Experiment
- **PSI Identifier:** `PSI-107`
- **Primary Publication DOI:** `10.1016/j.proci.2014.06.012` (Proc. Combust. Inst., 2015)
- **Research Area / Sub-Area:** Combustion Science / Soot Formation & Radiative Heat Loss
- **Flight Platform:** International Space Station (ISS) — U.S. Destiny Laboratory
- **Flight Hardware:** Microgravity Science Glovebox (MSG)
- **Flight Completion Status:** Completed Flight Campaign
- **Experimental Objectives:** Determine the smoke point (critical fuel flow rate for soot emission from the flame tip) for laminar coflow diffusion flames in microgravity, isolating chemical soot growth kinetics from buoyant transport.
- **Hardware Used:** MSG work volume, coflow gas burner, mass flow controllers, radiometer array, digital color cameras.
- **Fuel / Material Category:** Gaseous hydrocarbons: Ethylene, Propane, Propylene.
- **Available Experimental Conditions:**
  - Ambient Pressure: $1.0\text{ atm}$ ($14.7\text{ psia}$)
  - Coflow Air Speed: Low-speed laminar ($5 - 20\text{ cm/s}$)
  - Gravity: Microgravity ($\sim 10^{-6}\text{g}$)
- **Repository Record URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-107`
- **Available File Categories:** Gas flow rate tables, smoke point transition logs, color video frames, technical papers.
- **Actual Downloadable Files & Sizes:** Total uploaded server archive: $6.47\text{ GB}$. Flow rate and smoke point tabular data: $\sim 4.8\text{ MB}$.
- **Fire-Safety Categorization:** **Combustion Fundamentals & Fire Detection (Soot Emission Boundary)**.
- **Inclusion Justification:** Quantifies the soot breakthrough limit in non-buoyant flames, showing that microgravity flames emit soot particulates at substantially lower fuel flow rates than terrestrial flames.

---

### 10. FM2 / LUCI (Flammability of Materials on the Moon / Lunar Combustion)
- **Official Title:** Flammability of Materials on the Moon (FM2) / Lunar Combustion Investigation (LUCI)
- **PSI Identifier:** `NASA-FM2` (Pre-flight tracking code)
- **Primary Publication DOI:** Pending Flight Execution (NASA GRC Technical Development)
- **Research Area / Sub-Area:** Exploration Fire Safety / Partial-Gravity Lunar Combustion
- **Flight Platform:** Artemis Commercial Lunar Payload Services (CLPS) Robotic Lander
- **Flight Hardware:** Compact automated lunar surface combustion chamber module (in development at NASA Glenn Research Center)
- **Flight Completion Status:** **`EVIDENCE GAP / PLANNED FUTURE FLIGHT PAYLOAD`**
- **Experimental Objectives:** Conduct the first in-situ combustion and flame spread tests on the lunar surface under real lunar gravity ($0.166\text{g}$) to validate low-gravity flammability models and verify materials for Artemis base camps.
- **Hardware Used:** Self-contained automated combustion chamber, internal flow fan, solid fuel sample cards, video sensors, pressure and heat flux sensors.
- **Fuel / Material Category:** Solid polymers, fabrics, and wire insulation planned for lunar surface habitats.
- **Available Experimental Conditions:** Target: Lunar surface vacuum exterior ($0\text{ psi}$); chamber internal atmosphere ($34\%\ \text{O}_2$, $8.2\text{ psia}$ EAM and $21\%\ \text{O}_2$, $14.7\text{ psia}$); gravity $0.166\text{g}$.
- **Repository Record URL:** Pending Flight Data Publication (`https://psi.nasa.gov`)
- **Available File Categories:** Engineering test specifications, payload design technical memorandums (NTRS).
- **Actual Downloadable Files & Sizes:** $0\text{ bytes flight data}$ (Pre-flight status).
- **Fire-Safety Categorization:** **Priority Research Gap & Future Artemis Fire Safety**.
- **Inclusion Justification:** The cornerstone of the NASA Space Apps 2026 challenge: explicitly highlights that long-duration partial-gravity combustion data does not currently exist in PSI and defines the experimental requirements for future surface validation.

---

## 3. Wider Catalogue Candidate Review (Excluded / Supporting Investigations)

```
┌──────────────┬──────────────┬──────────────────┬─────────────────────────────────────────────────────────────┐
│ Mission Code │ PSI ID       │ Hardware Carrier │ Evaluation & Reason for Supporting / Excluded Status        │
├──────────────┼──────────────┼──────────────────┼─────────────────────────────────────────────────────────────┤
│ BASS (Orig.) │ PSI-26       │ MSG (ISS)        │ Precursor to BASS-II. Tested smaller samples. BASS-II       │
│              │              │                  │ provides wider flow ranges and superior calibration.        │
├──────────────┼──────────────┼──────────────────┼─────────────────────────────────────────────────────────────┤
│ SAFFIRE-II   │ PSI-99       │ Cygnus Vehicle   │ Tested 9 small solid fuel cards (5x30 cm) for LOI screening.│
│              │              │                  │ Maintained as supporting data; Saffire-I retained as primary│
│              │              │                  │ large-scale benchmark.                                      │
├──────────────┼──────────────┼──────────────────┼─────────────────────────────────────────────────────────────┤
│ SAFFIRE-III  │ PSI-100      │ Cygnus Vehicle   │ Re-burn of large SIBAL at higher flow (20 cm/s). Data       │
│              │              │                  │ aggregated into Saffire-I knowledge base.                   │
├──────────────┼──────────────┼──────────────────┼─────────────────────────────────────────────────────────────┤
│ SAME (Orig.) │ PSI-46       │ MSG (ISS)        │ Precursor flight test for smoke particle counting. SAME-R   │
│              │              │                  │ superseded it with calibrated DMA size spectrometry.        │
├──────────────┼──────────────┼──────────────────┼─────────────────────────────────────────────────────────────┤
│ FLEX-2       │ PSI-70       │ CIR / MDCA (ISS) │ Extended droplet tests with binary alkane mixtures. FLEX-1  │
│              │              │                  │ retained as the pure cool-flame discovery benchmark.        │
├──────────────┼──────────────┼──────────────────┼─────────────────────────────────────────────────────────────┤
│ ACME s-Flame │ PSI-158      │ CIR (ISS)        │ Fundamental spherical diffusion structure. Less directly    │
│              │              │                  │ applicable to habitat fire safety than CFI-G and BRE.       │
├──────────────┼──────────────┼──────────────────┼─────────────────────────────────────────────────────────────┤
│ DAFT-2       │ PSI-48       │ ISS Node 1       │ Continued baseline aerosol monitoring. Merged with DAFT     │
│              │              │                  │ analysis profile.                                           │
├──────────────┼──────────────┼──────────────────┼─────────────────────────────────────────────────────────────┤
│ SLICE        │ PSI-102      │ MSG (ISS)        │ Evaluated laminar diffusion flame liftoff and attachment    │
│              │              │                  │ limits with ethylene. Provided precursor data for ACME.     │
└──────────────┴──────────────┴──────────────────┴─────────────────────────────────────────────────────────────┘
```
