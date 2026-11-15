# GODEYE // PYRO-SI — Scientific Data Requirements Specification

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-SDR-001  
**Version:** 3.0 (Phase 1 Engineering Baseline)  
**Data Repository Authority:** NASA Physical Sciences Informatics (PSI) System (`https://psi.nasa.gov`)  
**Data Standards:** NASA SPD-41a, NASA-STD-3001 Rev D, NetCDF-4 / HDF5 / CSV Open Science Formats

---

## 1. Overview & Data Architecture

To maintain uncompromising scientific fidelity, **GODEYE // PYRO-SI** establishes strict data schemas, field typing, format specifications, and provenance categorization for all data ingested, processed, and visualized across the platform.

### 1.1. Ingestion Hierarchy & Epistemic Boundaries
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: RAW INGESTION LAYER (NASA PSI Repository & Technical Publications)            │
│ • Primary investigation records, metadata JSON, technical memorandum PDFs, NetCDF logs │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: NORMALIZED DATA LAYER (Standard 11-Parameter Scientific Schema)                │
│ • Normalized identifiers, facilities, tested g-levels, fuel chemistries, verified DOIs │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: DERIVATION & ANALYTICS LAYER (Physical Law Transformations)                    │
│ • Exact thermodynamic conversions (pO₂, RSS flow vectors, Dalton's Law, NASA-STD-3001) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 4: THEORETICAL & EXPLORATORY PROXY LAYER (De Ris Energy Balance & LOI Heuristics)│
│ • Qualitative flame spread rates, material rankings, partial-g continuum model         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 5: ILLUSTRATIVE VISUALIZATION LAYER (Three.js WebGL 2.0 / PBR Shaders)           │
│ • Morphological flame geometries, planetary habitats, Keplerian orbital trajectories   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Master Catalog of In-Scope NASA Investigations

The platform models 10 core combustion investigations audited against primary NASA records:

### 2.1. Investigation 01: BASS-II (`PSI-25`)
- **Official Title:** Burning and Suppression of Solids - II
- **Hardware Facility:** Microgravity Science Glovebox (MSG) — ISS Destiny Laboratory
- **Flight Gravity Condition:** Continuous microgravity ($\sim 10^{-6}\text{g}$)
- **Completion Status:** Completed Flight Campaign
- **PSI URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-25`
- **DOI:** `10.2514/6.2014-0414`
- **Data Volume / Formats:** $255.77\text{ GB}$ across 130 tests (Calibrated thermocouple CSV, radiometer time-series, high-speed MP4 video, ASCII summary tables)
- **Tested Fuels:** Cast Polymethyl Methacrylate (PMMA) acrylic flat sheets ($100 - 300\ \mu\text{m}$ thick, $2\text{ cm}$ wide), cylindrical acrylic rods, and cotton/fiberglass blended fabrics.
- **Environmental Parameters:** Forced flow velocity $0 - 40\text{ cm/s}$; oxygen concentration vitiated down to $14\%\ \text{O}_2$ via nitrogen dilution; atmospheric pressure $14.7\text{ psia}$ ($101.3\text{ kPa}$).
- **Core Scientific Finding:** Proved that in quiescent microgravity ($v = 0$), solid flames self-extinguish due to oxygen starvation and radiative cooling. A low-speed forced flow ($5 - 20\text{ cm/s}$), typical of habitat HVAC drafts, actively sustains and accelerates flame spread.

### 2.2. Investigation 02: SAFFIRE-I (`PSI-98`)
- **Official Title:** Spacecraft Fire Safety Experiment-I
- **Hardware Facility:** Orbital Sciences Cygnus Uncrewed Cargo Resupply Vehicle (Post-unberthing egress flight)
- **Flight Gravity Condition:** Microgravity ($\sim 10^{-6}\text{g}$)
- **Completion Status:** Completed Flight Campaign (June 2016, Cygnus OA-6)
- **PSI URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-98`
- **DOI:** `10.1016/j.actaastro.2019.03.023`
- **Data Volume / Formats:** $11.41\text{ GB}$ across 74 files (Calibrated pressure transducer DAT, thermocouple time-series CSV, dual video camera arrays S1C1/S1C2)
- **Tested Fuels:** SIBAL composite fabric (75% cotton, 25% fiberglass blend by weight; dimensions: $0.37\text{ mm}$ thick, $40.6\text{ cm}$ wide, $94.0\text{ cm}$ long).
- **Environmental Parameters:** Flow velocity $20\text{ cm/s}$ (engineered cabin wind tunnel); ambient oxygen $21.5\%\ \text{O}_2$; cabin pressure $14.2\text{ psia}$ ($98\text{ kPa}$).
- **Core Scientific Finding:** First large-scale ($>0.5\text{ m}$) solid material flame growth test in microgravity. Concurrent flame spread proceeded at $2.24\text{ mm/s}$ for $420\text{ s}$; opposed flame spread was slower ($0.34\text{ mm/s}$ for $70\text{ s}$) but generated higher localized pyrolysis temperatures. Demonstrated cabin pressure decay and heat release dynamics under realistic spacecraft geometry.

### 2.3. Investigation 03: ACME CFI-G (`PSI-159`)
- **Official Title:** Advanced Combustion via Microgravity Experiments: Cool Flames Investigation with Gases
- **Hardware Facility:** Combustion Integrated Rack (CIR) — ISS Destiny Laboratory
- **Flight Gravity Condition:** Microgravity ($\sim 10^{-6}\text{g}$)
- **Completion Status:** Completed Flight Campaign
- **PSI URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-159`
- **DOI:** `10.1016/j.proci.2020.06.368`
- **Data Volume / Formats:** $1.90\text{ TB}$ (Calibrated multispectral radiometer DAT, broadband chemiluminescence photomultiplier signals, high-speed camera frames)
- **Tested Fuels:** Pure gaseous alkanes and blends (Ethane $\text{C}_2\text{H}_6$, Propane $\text{C}_3\text{H}_8$, n-Butane $\text{C}_4\text{H}_{10}$) diluted with Nitrogen and Helium.
- **Environmental Parameters:** Quiescent and coflow gaseous diffusion regimes; pressure $0.5 - 2.0\text{ atm}$; ambient oxygen $15\% - 30\%\ \text{O}_2$.
- **Correction & Scientific Integrity Note:** **CFI-G tested gaseous cool flames in microgravity.** It did **NOT** measure partial gravity on the Moon, nor did it burn solid materials. It characterized low-temperature chemical reaction kinetics ($600 - 800\text{ K}$) without buoyancy.

### 2.4. Investigation 04: ACME BRE (`PSI-20`)
- **Official Title:** Burning Rate Emulator
- **Hardware Facility:** Combustion Integrated Rack (CIR) — ISS Destiny Laboratory
- **Flight Gravity Condition:** Microgravity ($\sim 10^{-6}\text{g}$)
- **Completion Status:** Completed Flight Campaign
- **PSI URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-20`
- **DOI:** `10.1016/j.combustflame.2019.04.032`
- **Data Volume / Formats:** $1.85\text{ TB}$ (Burner surface heat flux gauges, gas mass flow controller logs, radiometer time-series)
- **Tested Fuels:** Gaseous fuel mixtures (methane, ethylene, propane) injected through porous flat and cylindrical sintered metal burners to emulate the burning behavior of real solid plastics (PMMA, POM).
- **Core Scientific Finding:** Mapped the flammability boundaries and extinction conditions of emulated solid fuels under varying radiative feedback and low flow, proving that heat transfer from the flame to the surface dominates burning rate in the absence of buoyancy.

### 2.5. Investigation 05: FLEX / CFI (`PSI-69`)
- **Official Title:** Flame Extinguishment Experiment / Cool Flames Investigation
- **Hardware Facility:** Combustion Integrated Rack (CIR) / Multi-user Droplet Combustion Apparatus (MDCA)
- **Flight Gravity Condition:** Microgravity ($\sim 10^{-6}\text{g}$)
- **Completion Status:** Completed Flight Campaign
- **PSI URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-69`
- **DOI:** `10.1016/j.combustflame.2014.01.002`
- **Data Volume / Formats:** $860.39\text{ GB}$ (Backlit droplet shadowgraphy video, calibrated radiometer channels, droplet diameter decay tables)
- **Tested Fuels:** Single suspended liquid hydrocarbon droplets ($1.0 - 5.0\text{ mm}$ diameter): n-heptane, n-octane, n-decane, methanol, and ethanol.
- **Core Scientific Finding:** Discovered two-stage droplet combustion in microgravity. Following the apparent thermal extinction of the hot visible flame ($1700\text{ K}$), low-temperature "cool flame" reactions ($700\text{ K}$) persisted quasi-steadily, burning invisibly until complete droplet vaporization. Established the critical spacecraft hazard of undetected, re-ignitable cool flames.

### 2.6. Investigation 06: SAME-R (`PSI-101`)
- **Official Title:** Smoke Aerosol Measurement Experiment - Reflight
- **Hardware Facility:** Microgravity Science Glovebox (MSG) — ISS Destiny Laboratory
- **Flight Gravity Condition:** Microgravity ($\sim 10^{-6}\text{g}$)
- **Completion Status:** Completed Flight Campaign
- **PSI URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-101`
- **DOI:** `10.1080/02786826.2017.1355474`
- **Data Volume / Formats:** $5.87\text{ GB}$ (Differential Mobility Analyzer DMA particle size distributions, condensation particle counter CPC logs)
- **Tested Aerosols:** Pyrolysis and overheat smoke particles produced by cellulose (paper/cotton), Teflon (PTFE wire insulation), Kapton (polyimide film), and silicone elastomer.
- **Core Scientific Finding:** Discovered that smoke particles produced in microgravity are significantly larger ($d_p \approx 0.5 - 2.5\ \mu\text{m}$) than terrestrial counterparts ($d_p < 0.1\ \mu\text{m}$) due to enhanced residence times and rapid agglomeration without buoyant convective dilution. Guided design of next-generation optical smoke detectors for Orion and Gateway.

### 2.7. Investigation 07: ACME E-FIELD (`PSI-22`)
- **Official Title:** Electric-Field Effects on Coflow Flames
- **Hardware Facility:** Combustion Integrated Rack (CIR) — ISS Destiny Laboratory
- **Flight Gravity Condition:** Microgravity ($\sim 10^{-6}\text{g}$) + High-Voltage DC Electric Field
- **Completion Status:** Completed Flight Campaign
- **PSI URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-22`
- **DOI:** `10.1016/j.proci.2018.06.128`
- **Data Volume / Formats:** $884.95\text{ GB}$ (Electrode current/voltage DAT, high-speed soot incandescence video, ion current measurements)
- **Tested Fuels:** Gaseous methane and ethylene coflow diffusion flames.
- **Correction & Scientific Integrity Note:** E-FIELD applied electric potential gradients (up to $10\text{ kV}$) to chemi-ions in the flame zone, generating an electrostatic body force ($F = qE$) that created an artificial ionic wind. **It is an experimental laboratory proxy for buoyant draft, NOT a lunar or martian gravitational flight test.**

### 2.8. Investigation 08: DAFT / DAFT-2 (`PSI-47`)
- **Official Title:** Dust and Aerosol Measurement Feasibility Test
- **Hardware Facility:** Express Rack 4 / Node 1 — ISS
- **Flight Gravity Condition:** Microgravity ($\sim 10^{-6}\text{g}$)
- **Completion Status:** Completed Flight Campaign
- **PSI URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-47`
- **DOI:** `10.2514/6.2012-3482`
- **Data Volume / Formats:** $39.83\text{ MB}$ (Particle concentration time-series, optical transmission photodiode logs, filter weigh logs)
- **Tested Aerosols:** Arizona Road Dust (ARD, ISO 12103-1 A1 ultrafine and A2 fine test dust) suspended in cabin air to characterize aerosol behavior and dust-sensor cross-sensitivity.
- **Core Scientific Finding:** Characterized the particulate background in ISS cabin air and proved that optical and ionization smoke detectors can trigger false alarms when dust is disturbed during crew exercise or ventilation transients. Informed multi-wavelength scattering algorithms to discriminate lunar regolith dust from fire smoke.

### 2.9. Investigation 09: SPICE (`PSI-107`)
- **Official Title:** Smoke Point In Co-flow Experiment
- **Hardware Facility:** Microgravity Science Glovebox (MSG) — ISS Destiny Laboratory
- **Flight Gravity Condition:** Microgravity ($\sim 10^{-6}\text{g}$)
- **Completion Status:** Completed Flight Campaign
- **PSI URL:** `https://psi.nasa.gov/physci/repo/data/investigations/PSI-107`
- **DOI:** `10.1016/j.proci.2014.06.012`
- **Data Volume / Formats:** $6.47\text{ GB}$ (Soot smoke point gas flow rates, color digital imaging frames, radiometer logs)
- **Tested Fuels:** Gaseous hydrocarbons: ethylene, propane, and propylene coflow diffusion flames.
- **Core Scientific Finding:** Mapped the critical fuel flow rate at which soot escapes the flame tip (smoke point). Showed that microgravity flames emit soot at lower fuel flow rates than normal-gravity flames because longer residence times promote soot nucleation and growth.

### 2.10. Investigation 10: FM2 / LUCI (`NASA-FM2`)
- **Official Title:** Flammability of Materials on the Moon (FM2) / Lunar Combustion Investigation (LUCI)
- **Hardware Facility:** Artemis Commercial Lunar Payload Services (CLPS) Robotic Lunar Lander
- **Flight Gravity Condition:** Target Lunar Surface Gravity ($0.166\text{g}$)
- **Completion Status:** **`EVIDENCE GAP / PLANNED FLIGHT PAYLOAD` (Pre-Flight Development)**
- **PSI URL:** Pending Flight Data Publication (`https://psi.nasa.gov`)
- **DOI:** Pending Mission Execution
- **Data Volume / Formats:** $0\text{ bytes archived}$ (Pending Flight Delivery)
- **Tested Fuels:** Solid polymers (PMMA, Nomex, SIBAL) and wire insulations planned for lunar surface deployment.
- **Scientific Integrity Mandate:** Must **NEVER** be displayed with a green "Flight Data" badge or presented as completed research. It represents the primary **`EVIDENCE GAP`** driving the NASA Space Apps 2026 challenge.

---

## 3. Data Schema & Field Specifications

Every investigation record in the platform data store (`src/data/reference/psi-investigations.json`) adheres to the following JSON schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "NASA_PSI_Investigation_Record",
  "type": "object",
  "required": [
    "id", "psiId", "code", "title", "facility", "rack", "fuelType",
    "gravityConditionTested", "completionStatus", "provenanceClassification",
    "airflowRange", "variables", "sensors", "summary",
    "lunarHabWeight", "materialPrevWeight", "smokeDetWeight", "suppressionWeight",
    "dataSize", "version", "releaseDate", "availableProducts", "downloadMethod",
    "doi", "psiUrl", "verified"
  ],
  "properties": {
    "id": { "type": "string", "description": "Canonical database ID (e.g. PSI-25)" },
    "psiId": { "type": "string", "description": "Official NASA PSI Investigation ID" },
    "code": { "type": "string", "description": "Flight mission acronym (e.g. BASS-II)" },
    "title": { "type": "string", "description": "Full formal NASA investigation title" },
    "facility": { "type": "string", "description": "Spaceflight hardware platform or vehicle" },
    "rack": { "type": "string", "enum": ["MSG", "CIR", "CYGNUS", "EXPRESS", "LUNAR"] },
    "fuelType": { "type": "string", "enum": ["Solid", "Gaseous", "Liquid", "Aerosol / Particulate", "Solid & Composite"] },
    "gravityConditionTested": { "type": "string", "description": "Actual physical g-level tested (e.g. Microgravity ~10⁻⁶g)" },
    "completionStatus": { "type": "string", "enum": ["Completed Flight Campaign", "Planned Future Payload"] },
    "provenanceClassification": { "type": "string", "enum": ["REPORTED FLIGHT RECORD [NASA PSI]", "EVIDENCE GAP / PLANNED FUTURE FLIGHT"] },
    "airflowRange": { "type": "string", "description": "Forced oxidizer draft velocity range in cm/s" },
    "variables": { "type": "string", "description": "Key physical variables modulated during experiments" },
    "sensors": { "type": "string", "description": "Flight diagnostic sensor suite" },
    "summary": { "type": "string", "description": "Evidence-grounded scientific abstract" },
    "lunarHabWeight": { "type": "integer", "minimum": 0, "maximum": 100 },
    "materialPrevWeight": { "type": "integer", "minimum": 0, "maximum": 100 },
    "smokeDetWeight": { "type": "integer", "minimum": 0, "maximum": 100 },
    "suppressionWeight": { "type": "integer", "minimum": 0, "maximum": 100 },
    "dataSize": { "type": "string", "description": "Verified data volume or Pending status" },
    "version": { "type": "string", "description": "NASA PSI archive release version" },
    "releaseDate": { "type": "string", "description": "NASA PSI official publication date" },
    "availableProducts": { "type": "array", "items": { "type": "string" } },
    "downloadMethod": { "type": "string", "description": "Protocol and endpoint access method" },
    "doi": { "type": "string", "description": "Resolvable Digital Object Identifier" },
    "psiUrl": { "type": "string", "format": "uri", "description": "Official NASA PSI landing page" },
    "verified": { "type": "boolean", "description": "Forensic audit verification sign-off" }
  }
}
```

---

## 4. Atmospheric Standards & Compliance Boundaries

The platform embeds normative atmospheric boundaries defined by NASA crew health and life support standards:

```
┌───────────────────────────────────────┬──────────────┬──────────────┬──────────────┬──────────────────────────────────────────┐
│ Habitat Scenario                      │ Total Press. │ O₂ Fraction  │ Derived pO₂  │ NASA-STD-3001 Compliance Status          │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────────────────────────────────┤
│ ISS Nominal Sea-Level Standard        │ 14.7 psia    │ 21.0% O₂     │ 3.087 psia   │ NOMINAL COMPLIANT (Inside 2.68–3.03 psi) │
│ (NASA-STD-3001 Rev D [V2 6003]/[6006])│ (101.3 kPa)  │              │ (21.28 kPa)  │                                          │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────────────────────────────────┤
│ Artemis Lunar Base Camp (EAM)         │ 8.2 psia     │ 34.0% O₂     │ 2.788 psia   │ NOMINAL COMPLIANT (Inside 2.68–3.03 psi) │
│ (NASA/TP-2013-217380; [V2 6002] 66% N₂)│ (56.5 kPa)   │              │ (19.22 kPa)  │ High flammability hazard due to low N₂   │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────────────────────────────────┤
│ Artemis II Lunar Gateway Cabin        │ 10.2 psia    │ 30.0% O₂     │ 3.060 psia   │ NOMINAL COMPLIANT (Inside 2.68–3.03 psi) │
│ (HALO Inter-module duct loop)         │ (70.3 kPa)   │              │ (21.10 kPa)  │ Elevated O₂ freefall flammability risk   │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────────────────────────────────┤
│ EVA Spacewalk Spacesuit Loop          │ 4.3 psia     │ 100.0% O₂    │ 4.300 psia   │ NOMINAL EVA SUIT (External vacuum: 0 psi)│
│ (NASA EMU Primary Life Support PLSS)  │ (29.6 kPa)   │              │ (29.65 kPa)  │ Hyperoxic pure O₂ flammability risk      │
├───────────────────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────────────────────────────────┤
│ Emergency Hypoxia Boundary            │ <8.0 psia    │ <21.0% O₂    │ <2.32 psia   │ NON-COMPLIANT: ACUTE HYPOXIA CONTINGENCY │
│ (NASA-STD-3001 Rev D [V2 6003] Floor) │ (<55 kPa)    │              │ (<16.0 kPa)  │ Triggers emergency life support alert    │
└───────────────────────────────────────┴──────────────┴──────────────┴──────────────┴──────────────────────────────────────────┘
```

---

## 5. Epistemic Data Field Categorization Matrix

| Data Field / Property | Epistemic Tier | Primary Scientific Source | Limitations & Disclaimers |
|:----------------------|:---------------|:--------------------------|:--------------------------|
| `investigation.dataSize` | `REPORTED` | NASA PSI Record Page | Represents total uploaded archive volume. |
| `investigation.doi` | `REPORTED` | NTRS / AIAA Publications | Resolvable via CrossRef / NTRS. |
| `habitat.pO2` | `DERIVED` | Dalton's Law ($P_{\text{total}} \times Y_{\text{O}_2}$) | Exact thermodynamic relationship. |
| `habitat.v_effective` | `DERIVED` | Root-Sum-Square Vector ($v_f^2 + v_b^2$) | Assumes orthogonal flow interaction. |
| `simulator.LOI_effective` | `MODELLED` | Phenomenological Energy Balance | Clamped $[12.5\%, 24.0\%]$; qualitative scaling. |
| `simulator.flameSpread` | `MODELLED` | De Ris Thin-Fuel Thermal Balance | Uncalibrated theoretical proxy; $\pm 14\%$ excised. |
| `chart.partialGContinuum` | `MODELLED` | Low-Buoyancy Theory (T'ien / Ferkul) | Exploratory continuum model; no flight data in PSI. |
| `godeye3d.flameGeometry` | `ILLUSTRATIVE` | Three.js WebGL Particle Mesh | Communicates morphology; NOT a CFD simulation. |
| `godeye3d.earthTexture` | `REPORTED` | NASA Visible Earth Blue Marble | Authentic satellite imagery. |
| `lunarRegolithInteraction` | `UNKNOWN` | None (Active Research Frontier) | Acknowledged critical data gap. |
