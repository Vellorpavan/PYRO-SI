# GODEYE // PYRO-SI — Data Availability Matrix

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-DAM-001  
**Version:** 3.0 (Phase 1.1 Verified Evidence Baseline)  
**Audit Standard:** NASA Open Science Data Access & FAIR Principles (Findable, Accessible, Interoperable, Reusable)

---

## 1. Data Availability Architecture

In microgravity combustion research, an online investigation record does **not** automatically imply that raw numerical time-series are downloadable, machine-readable, or structured for client-side processing. Large archives frequently consist predominantly of high-definition video files, uncalibrated raw binary dumps, or locked PDF flight reports.

To establish authentic technical capabilities, this matrix audits all 10 core investigations across nine standardized data availability tiers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ DATA ASSET CLASSIFICATION TIERS (A through I)                                          │
│ • Category A: Investigation Metadata (Canonical schema, JSON, repository records)      │
│ • Category B: Publications & Technical Reports (Peer-reviewed papers, NASA TMs, PDFs)   │
│ • Category C: Raw Experimental Telemetry (Sensor voltages, raw binary transducer logs) │
│ • Category D: Processed Experimental Measurements (Calibrated CSVs, NetCDF, tables)   │
│ • Category E: Visual Imagery & High-Speed Video (MP4, AVI, radiometer video frames)    │
│ • Category F: Engineering Hardware Documents (CAD schematics, ICDs, hardware manuals)  │
│ • Category G: Ground-Based Baseline Data (1g drop tower, parabolic flight baselines)   │
│ • Category H: Simulation & Numerical Model Outputs (CFD solutions, kinetic models)     │
│ • Category I: Inaccessible / Restricted / Pending Assets (ITAR, pre-flight, offline)   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Systematic Data Availability Matrix

```
┌──────────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┬──────────────────────────────────────────┐
│ Mission Code │ Cat. A │ Cat. B │ Cat. C │ Cat. D │ Cat. E │ Cat. F │ Cat. G │ Cat. H │ Cat. I │ Numerical Analysis Feasibility & Rationale│
│ (PSI ID)     │ Meta   │ Papers │ Raw    │ Process│ Video  │ EngDoc │ Ground │ Model  │ Unavail│                                          │
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────────────────────────────────────────┤
│ BASS-II      │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ NO     │ PARTIAL│ HIGH FEASIBILITY: 130 documented test    │
│ (PSI-25)     │ (JSON) │ (PDF)  │ (DAT)  │ (CSV)  │ (MP4)  │ (PDF)  │ (1g)   │        │ (RawV) │ runs provide machine-readable CSV spread │
│              │        │        │        │        │        │        │        │        │        │ rates, flow speeds, and extinction limits│
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────────────────────────────────────────┤
│ SAFFIRE-I    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ NO     │ HIGH FEASIBILITY: Calibrated pressure,   │
│ (PSI-98)     │ (JSON) │ (PDF)  │ (DAT)  │ (CSV)  │ (MP4)  │ (PDF)  │ (Drop) │ (FDS)  │        │ thermocouple arrays, and flame front pixel│
│              │        │        │        │        │        │        │        │        │        │ tracking CSVs fully support numerical math│
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────────────────────────────────────────┤
│ ACME CFI-G   │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ PARTIAL│ MODERATE FEASIBILITY: Mass flow and      │
│ (PSI-159)    │ (JSON) │ (PDF)  │ (DAT)  │ (CSV)  │ (MP4)  │ (PDF)  │ (1g)   │ (Chem) │ (1.9TB)│ radiometer files support analysis; full  │
│              │        │        │        │        │        │        │        │        │        │ 1.9 TB video archive too heavy for client│
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────────────────────────────────────────┤
│ ACME BRE     │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ PARTIAL│ HIGH FEASIBILITY: Burner surface heat    │
│ (PSI-20)     │ (JSON) │ (PDF)  │ (DAT)  │ (CSV)  │ (MP4)  │ (PDF)  │ (1g)   │ (Model)│ (RawV) │ flux logs and gas mass flow controller CSV│
│              │        │        │        │        │        │        │        │        │        │ directly support energy balance equations│
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────────────────────────────────────────┤
│ FLEX / CFI   │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ PARTIAL│ HIGH FEASIBILITY: Droplet diameter decay │
│ (PSI-69)     │ (JSON) │ (PDF)  │ (DAT)  │ (CSV)  │ (MP4)  │ (PDF)  │ (Drop) │ (Model)│ (860GB)│ rate tables ($d^2$-law slopes) directly   │
│              │        │        │        │        │        │        │        │        │        │ support burning rate calculations        │
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────────────────────────────────────────┤
│ SAME-R       │ YES    │ YES    │ YES    │ YES    │ NO     │ YES    │ YES    │ NO     │ NO     │ HIGH FEASIBILITY: Particle size spectra  │
│ (PSI-101)    │ (JSON) │ (PDF)  │ (DAT)  │ (CSV)  │ (N/A)  │ (PDF)  │ (1g)   │        │        │ from DMA and CPC provide discrete,       │
│              │        │        │        │        │        │        │        │        │        │ structured aerosol distribution columns  │
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────────────────────────────────────────┤
│ ACME E-FIELD │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ NO     │ PARTIAL│ MODERATE FEASIBILITY: Voltage/current    │
│ (PSI-22)     │ (JSON) │ (PDF)  │ (DAT)  │ (CSV)  │ (MP4)  │ (PDF)  │ (1g)   │        │ (884GB)│ telemetry supports ion wind calculations;│
│              │        │        │        │        │        │        │        │        │        │ flame geometries require video tracking  │
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────────────────────────────────────────┤
│ DAFT / DAFT-2│ YES    │ YES    │ YES    │ YES    │ NO     │ YES    │ YES    │ NO     │ NO     │ EXCELLENT FEASIBILITY: Entire 39.8 MB    │
│ (PSI-47)     │ (JSON) │ (PDF)  │ (DAT)  │ (CSV)  │ (N/A)  │ (PDF)  │ (1g)   │        │        │ archive consists of clean, calibrated    │
│              │        │        │        │        │        │        │        │        │        │ particle concentration time-series tables│
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────────────────────────────────────────┤
│ SPICE        │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ YES    │ NO     │ NO     │ MODERATE FEASIBILITY: Smoke point gas    │
│ (PSI-107)    │ (JSON) │ (PDF)  │ (DAT)  │ (CSV)  │ (MP4)  │ (PDF)  │ (1g)   │        │        │ flow rate thresholds provide concise     │
│              │        │        │        │        │        │        │        │        │        │ numerical values for soot boundaries     │
├──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────────────────────────────────────────┤
│ FM2 / LUCI   │ YES    │ YES    │ NO     │ NO     │ NO     │ YES    │ NO     │ YES    │ YES    │ ZERO NUMERICAL FLIGHT FEASIBILITY:       │
│ (NASA-FM2)   │ (Plan) │ (NTRS) │ (N/A)  │ (N/A)  │ (N/A)  │ (Spec) │        │ (Sim)  │ (Pre-F)│ Pre-flight status. Zero flight data exists│
│              │        │        │        │        │        │        │        │        │        │ in PSI. Classified as pure research gap. │
└──────────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴──────────────────────────────────────────┘
```

---

## 3. Deep Asset Inspection by Category

### Category A: Investigation Metadata
- **Status across all 10 Studies:** **100% Available & Verified.**
- **Format:** Ingested into structured JSON schema (`src/data/reference/psi-investigations.json`).
- **Fields:** Canonical ID, official title, facility, rack, fuel category, tested g-level, DOI, release date, and official repository URL.

### Category B: Publications & Technical Reports
- **Status across all 10 Studies:** **100% Available & Sourced.**
- **Formats:** Adobe PDF files accessible via NASA Technical Reports Server (NTRS) and peer-reviewed journals (AIAA, Combustion and Flame, Proceedings of the Combustion Institute, Aerosol Science and Technology).
- **Direct Utility:** Provides the primary evidence base for the Grounded Research Co-Pilot knowledge store (`src/data/reference/copilot-knowledge.json`).

### Category C & D: Raw and Processed Experimental Measurements
- **Investigations with Machine-Readable Numerical Tables:**
  1. **BASS-II (`PSI-25`):** 130 test run tables with measured flame spread velocities ($V_f$), burn lengths, sample widths, and flow velocities.
  2. **SAFFIRE-I (`PSI-98`):** Synchronized 1 Hz pressure decay curves, thermocouple array logs, and automated flame edge coordinates.
  3. **ACME BRE (`PSI-20`):** Surface heat flux records ($q''$ in $\text{kW/m}^2$) and fuel mass flow rates.
  4. **FLEX (`PSI-69`):** Droplet diameter time-series ($d(t)$) tracking square diameter decay rates ($K = -d(d^2)/dt$) and cool flame transitions.
  5. **SAME-R (`PSI-101`):** Differential mobility electrical mobility diameters and condensation counter number concentrations.
  6. **DAFT (`PSI-47`):** Continuous optical mass concentration and particle counts across ISS Expeditions 29/30.
- **Client Storage Architecture:** Processed numerical extracts are encapsulated in lightweight client-side JSON/JS files, avoiding the multi-gigabyte raw video payloads while preserving mathematical fidelity.

### Category E: Visual Imagery & High-Speed Video
- **Status:** **Available in Primary Archive; Selectively Sampled Locally.**
- **Characteristics:**
  - High-resolution color digital video (30 to 120 FPS) representing $>95\%$ of total PSI server volume (e.g., 250+ GB for BASS-II, 1.8 TB for CFI-G).
  - *Engineering Handling:* Local repository stores verified representative frames and WebGL 3D shader reconstructions rather than multi-terabyte raw video streams.

### Category I: Inaccessible / Pre-Flight Assets
- **FM2 / LUCI (`NASA-FM2`):** Zero flight data archived. Classified as an active research gap.
- **Raw High-Resolution Video Streams:** Server-hosted in NASA AWS S3 buckets behind manual export requests.

---

## 4. Identification of Investigations Supporting Numerical Analysis

Only six of the ten investigations possess data products structured to support direct mathematical modeling and statistical validation in the client application:

```
┌──────────────┬──────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Mission Code │ Usable Numerical Data Products           │ Enabled Analytical / Modeling Capabilities             │
├──────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ BASS-II      │ 130 test spread rates, fuel thickness,   │ Solid fuel De Ris thermal balance calibration;         │
│              │ forced airflow speeds, nitrogen dilution │ empirical regression of forced flow spread rates       │
├──────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ SAFFIRE-I    │ Large-scale concurrent/opposed spread    │ Spacecraft-scale flame growth dynamics; cabin pressure │
│              │ rates, cabin pressure, gas concentrations│ decay and heat release rate calculations               │
├──────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ ACME BRE     │ Sintered burner heat flux, mass flow     │ Surface heat feedback modeling; solid burning rate     │
│              │ rates, radiation feedback logs           │ emulation via gaseous mass transfer                    │
├──────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ FLEX         │ Droplet square diameter decay slopes,    │ Droplet evaporation kinetics ($d^2$-law); extinction  │
│              │ extinction diameters, cool flame timing  │ thresholds under inert gas dilution                    │
├──────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ SAME-R       │ Aerosol mobility size distributions,     │ Smoke particulate agglomeration curves; optical smoke  │
│              │ particle number concentrations           │ detector response functions                            │
├──────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ DAFT         │ Background cabin dust concentration,     │ Dust-to-smoke discrimination ratios; optical detector  │
│              │ optical transmission time-series         │ false alarm probability modeling                       │
└──────────────┴──────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```
