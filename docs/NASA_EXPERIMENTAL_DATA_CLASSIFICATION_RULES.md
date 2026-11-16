# GODEYE // PYRO-SI — NASA Experimental Data Classification Rules
## Scientific Criteria for Disambiguating Configurations, Primary Sensor Measurements, Derived Data, and Media Assets

**Document Identifier:** NASA-PYRO-RULES-CLASSIFICATION-2342  
**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Auditor / Architect:** Lead Scientific Data Verification Engineer & Independent Standards Auditor  
**Date:** November 16, 2026  
**Status:** ACTIVE REGULATORY SPECIFICATION  
**Governing Standards:** NASA SPD-41a, NASA-STD-3001 Vol 2 Rev F, NASA-STD-6001B w/Change 3  

---

## 1. Foundational Principle: "Numbers in a CSV $\neq$ Measurement Data"

A critical failure mode in automated scientific data harvesting is conflating structured numeric text files with physical sensor observations. 

A comma-separated values (`.csv`) or Excel (`.xlsx`) spreadsheet containing numeric figures may represent:
- Commanded actuator setpoints (e.g. mass flow controller target setpoint: `0.5 slpm`).
- Hardware dimension limits (e.g. burner diameter: `25 mm`).
- Calendar and execution timelines (e.g. test date: `2012-FEB-09`).
- Planned test matrices (e.g. sample thickness: `100 micron`).
- Computational simulation grids (e.g. discretization node diameter: `1.24e-9 m`).
- Derived reduction ratios (e.g. extinction strain rate: $a_{\text{CFE}} = 85.09\text{ s}^{-1}$).

Under **NASA SPD-41a** and the GODEYE // PYRO-SI Scientific Verification Protocol, **no file may be classified as experimental measurement data unless physical sensor observations are empirically verified**.

---

## 2. Mutually Exclusive File-Level Classifications

Every catalogued research asset must be tagged with exactly one of seven mutually exclusive classifications:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     SEVEN-TIER FILE-LEVEL CLASSIFICATION TAXONOMY               │
├──────────────────────────────────────┬──────────────────────────────────────────┤
│ Classification                       │ Defining Empirical Criteria              │
├──────────────────────────────────────┼──────────────────────────────────────────┤
│ 1. EXPERIMENTAL_CONFIGURATION        │ Target setpoints, planned run matrices,  │
│                                      │ burner dimensions, gas bottle mixtures,  │
│                                      │ camera exposure settings, test schedules.│
│ 2. NUMERICAL_EXPERIMENTAL_MEASUREMENTS│ Continuous or discrete time-series from  │
│                                      │ physical flight/ground sensors (TCs,     │
│                                      │ radiometers, pressure transducers, MFCs).│
│ 3. NUMERICAL_DERIVED_DATA            │ Quantities calculated from raw signals   │
│                                      │ (spread rates, burning flux, extinction  │
│                                      │ strain rates, fan calibration curves).   │
│ 4. DOCUMENTATION_ONLY                │ Reports, papers, slide decks, manuals,   │
│                                      │ publication link indexes, ISA-Tab text.  │
│ 5. VIDEO_OR_IMAGE_ONLY               │ High-speed video (.mp4) and raw optical  │
│                                      │ still archives (.zip) without series data│
│ 6. CODE_OR_MODEL_ONLY                │ CFD simulation grids, computational      │
│                                      │ meshes, analytical model predictions.    │
│ 7. CONTENT_NOT_YET_INSPECTED         │ Metadata entries where files are not yet │
│                                      │ uploaded to open S3 storage (0 files).   │
└──────────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 3. Disambiguation Rules: Configurations vs Measurements

To prevent false claims of experimental measurement availability, automated ingestion clients and human auditors must apply the following disambiguation rules:

### Rule 1: Actuator Setpoint vs Sensor Observation
- **Configuration Indicator:** Column headers containing `Setpoint`, `Target`, `Command`, `MFC_FullScale`, `Bottle_Conc`, `Planned_Flow`.
- **Measurement Indicator:** Column headers containing time-stamped transducer streams, such as `StaticMixerFlow`, `PTA_ChamberPressure`, `IonCurrent`, `Thermocouple_mV`, `Radiometer_HeatFlux`, `Photodiode_V`.
- **Precedence:** If a file contains both commanded setpoints and raw sensor channels (such as ACME `_data.csv`), the file is classified as **`NUMERICAL_EXPERIMENTAL_MEASUREMENTS`** because physical observations are present.

### Rule 2: Run Matrix vs Telemetry Stream
- **Configuration Indicator:** A tabular file where each row represents an entire separate test run or test day (e.g. `Year, Month, Date, Burner Size, Fuel Bottle, Flames Ignited`).
- **Measurement Indicator:** A tabular file where each row represents a discrete moment in time (sub-second or millisecond intervals) recording transducer voltages or physical states during a single run.
- **Enforcement:** A run matrix (such as `PSI-20_Experimental table_ACME BRE.csv`) is strictly **`EXPERIMENTAL_CONFIGURATION`**.

### Rule 3: Hardware Characterization vs Experimental Measurement
- **Derived Data Indicator:** A spreadsheet correlating equipment input settings to aerodynamic flow velocities (e.g. `Fan Calibration data.xlsx` relating potentiometer voltages to duct air velocity $U\text{ cm/s}$).
- **Enforcement:** Calibration curves are classified as **`NUMERICAL_DERIVED_DATA`**, not raw experimental measurements.

### Rule 4: Visual Media Classification
- **Video/Image Indicator:** Files with extensions `.mp4`, `.avi`, `.mov`, or `.zip` archives containing sequential camera stills (`.jpg`, `.tif`, `.raw`).
- **Enforcement:** High-speed video is empirical observational evidence, but is classified as **`VIDEO_OR_IMAGE_ONLY`**. An investigation containing only video files cannot be classified as containing numerical sensor telemetry.

---

## 4. Investigation-Level vs File-Level Decoupling

An investigation frequently encompasses dozens or thousands of research assets across multiple media types. **Investigation-level classifications must never be conflated with single-file classifications.**

### Investigation-Level Taxonomy:
1. **`VERIFIED_FLIGHT_MEASUREMENTS_AVAILABLE`:**
   - The investigation contains active, downloadable physical sensor telemetry files (`NUMERICAL_EXPERIMENTAL_MEASUREMENTS`) in public S3 storage (e.g. `PSI-10`, `PSI-98`, `PSI-100`, `PSI-101`, `PSI-23`, `PSI-159`).
2. **`EXPERIMENTAL_CONFIGURATION_ONLY`:**
   - The only files deposited in public storage are test run matrices, schedules, or actuator configuration tables (e.g. `PSI-20`, `PSI-21`, `PSI-106`).
3. **`VIDEO_AND_CONFIGURATION_ONLY`:**
   - The deposited files consist of optical video recordings, still archives, and test matrices without continuous sensor telemetry (e.g. `PSI-25`, `PSI-26`).
4. **`NUMERICAL_DERIVED_DATA`:**
   - The primary deposited scientific output is calculated extinction strain rates or reduced burning constants (e.g. `PSI-142`).
5. **`SIMULATION_AND_MODEL_ONLY`:**
   - The repository contains computational meshes or analytical model predictions (e.g. `PSI-115`, `PSI-117`).
6. **`DOCUMENTATION_ONLY`:**
   - The repository contains only metadata descriptors or mission reports (e.g. `PSI-60`, `PSI-62`).
7. **`CONTENT_NOT_YET_INSPECTED`:**
   - The investigation has 0 files uploaded in public S3 storage (e.g. `PSI-22`, `PSI-68`, `PSI-69`, `PSI-99`).

---

## 5. Mandatory Evidence Recording Contract

Every inspected representative file must document:
1. `accession`: Canonical NASA accession identifier.
2. `filename`: Exact S3 object key.
3. `format`: File extension and binary encoding format.
4. `download_status`: Verification of HTTP Range GET or complete download.
5. `inspection_method`: Tool and protocol used to parse content.
6. `setting_columns`: List of columns identifying commanded or planned parameters.
7. `observation_columns`: List of columns identifying physical sensor readings.
8. `units_identified`: Dictionary mapping columns to SI / engineering units. If units are ambiguous or uncalibrated, explicitly record the uncertainty.
9. `file_classification`: Exactly one of the 7 valid file-level classifications.
10. `classification_reason`: Specific factual justification grounded in file content.
11. `source_url`: Verifiable NASA REST or AWS S3 endpoint.
