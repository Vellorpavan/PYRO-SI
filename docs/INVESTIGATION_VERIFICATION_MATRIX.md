# GODEYE // PYRO-SI — NASA Investigation Verification Matrix

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Status:** FORMAL FLIGHT INVESTIGATION PROVENANCE MATRIX  
**Source of Truth:** NASA Physical Sciences Informatics (PSI) Repository (`https://psi.nasa.gov`)  

---

## 1. Provenance Classification Standards

In accordance with NASA Space Apps Challenge 2026 scientific review criteria, every candidate investigation is audited across 11 discrete metadata parameters:

1. **Official Investigation Identifier** (NASA PSI ID or Mission Code).
2. **Official Investigation Title** (Exact name logged in NASA records).
3. **Primary Research Objective** (Scientific question investigated).
4. **Experimental Platform / Hardware Rack** (MSG, CIR, Cygnus, or CLPS Lander).
5. **Gravity Condition Actually Tested** (Microgravity $\sim 10^{-6}\text{g}$, Normal Earth $1.0\text{g}$, or Ground Parabolic).
6. **Campaign Completion Status** (Completed, In-Progress, or Planned Pre-Flight).
7. **PSI Record Availability** (Confirmed Record in NASA PSI Repository).
8. **Numerical Data Files Available** (CSV, TAB, DAT, or NetCDF format verified).
9. **Peer-Reviewed Publications Available** (NASA Technical Memorandums or Journal Papers).
10. **Source DOI / Official NASA URL** (Resolvable endpoint).
11. **Verification Date & Disposition** (Forensic audit sign-off).

---

## 2. Investigation Verification Master Matrix

```
┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ 01. BASS-II                     │ Burning and Suppression of Solids - II                                      │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ Official Identifier             │ PSI-25 (associated with PSI-26 BASS)                                        │
│ Official Title                  │ Burning and Suppression of Solids - II                                      │
│ Research Objective              │ Determine extinction limits, flame spread rates, and combustion suppression │
│                                 │ of thick solid fuels under microgravity forced airflow conditions.          │
│ Experimental Platform           │ Microgravity Science Glovebox (MSG) — ISS Destiny Laboratory                │
│ Gravity Condition Tested        │ Microgravity (~10⁻⁶ g) — Continuous Orbital Freefall                        │
│ Experiment Completed            │ YES (Flight campaign completed on ISS)                                      │
│ PSI Record Confirmed            │ YES — https://psi.nasa.gov/physci/repo/data/investigations/PSI-25           │
│ Numerical Data Files Available  │ YES — 255.77 GB across 130 tests (Burn logs, thermocouple CSV, video MP4)   │
│ Publications Available          │ YES — Multiple NASA TM and AIAA papers (e.g. AIAA 2014-0414)                │
│ Source DOI / Official URL       │ https://psi.nasa.gov/physci/repo/data/investigations/PSI-25                 │
│ Verification Date & Disposition │ November 2026 — VERIFIED EXPERIMENTAL FLIGHT ARCHIVE                        │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ 02. SAFFIRE-I                   │ Spacecraft Fire Safety Experiment-I                                         │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ Official Identifier             │ PSI-98 (Campaign includes PSI-99 Saffire-II, PSI-100 Saffire-III)           │
│ Official Title                  │ Spacecraft Fire Safety Experiment-I                                         │
│ Research Objective              │ Investigate large-scale flame growth and spread over practical fabric       │
│                                 │ materials (0.94m x 0.4m SIBAL cloth) in low-speed forced flows.             │
│ Experimental Platform           │ Orbital Sciences Cygnus Resupply Vehicle (Post-ISS Deprecation Egress)      │
│ Gravity Condition Tested        │ Microgravity (~10⁻⁶ g) — Freefall in Cygnus post-unberthing                 │
│ Experiment Completed            │ YES (Successfully executed inside Cygnus OA-6 in June 2016)                 │
│ PSI Record Confirmed            │ YES — https://psi.nasa.gov/physci/repo/data/investigations/PSI-98           │
│ Numerical Data Files Available  │ YES — 11.41 GB across 74 files (Calibrated pressure, T/C time-series, video)│
│ Publications Available          │ YES — NASA/TM-2017-219502, Urban et al., Proceedings of Comb. Inst.        │
│ Source DOI / Official URL       │ https://psi.nasa.gov/physci/repo/data/investigations/PSI-98                 │
│ Verification Date & Disposition │ November 2026 — VERIFIED EXPERIMENTAL FLIGHT ARCHIVE                        │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ 03. FLEX / CFI                  │ Flame Extinguishment Experiment & Cool Flames Investigation                 │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ Official Identifier             │ PSI-69 (FLEX) / PSI-39 (CFI) / PSI-68 (FLEX-2)                              │
│ Official Title                  │ Flame Extinguishment Experiment (FLEX)                                      │
│ Research Objective              │ Measure isolated liquid droplet burning rates, radiative extinction limits, │
│                                 │ and low-temperature "cool flame" burning regimes in microgravity.          │
│ Experimental Platform           │ Combustion Integrated Rack (CIR) / MDCA — ISS Destiny Laboratory            │
│ Gravity Condition Tested        │ Microgravity (~10⁻⁶ g) — Quiescent freefall droplet burning                 │
│ Experiment Completed            │ YES (Multi-year flight campaign completed in CIR)                            │
│ PSI Record Confirmed            │ YES — https://psi.nasa.gov/physci/repo/data/investigations/PSI-69           │
│ Numerical Data Files Available  │ YES — 860.39 GB (Numerical droplet diameter tables, radiometer CSVs)        │
│ Publications Available          │ YES — Canonical Nature / Combustion & Flame papers; DOI: 10.60555/mbq8-0451 │
│ Source DOI / Official URL       │ DOI: 10.60555/mbq8-0451 / PSI-69                                            │
│ Verification Date & Disposition │ November 2026 — VERIFIED EXPERIMENTAL FLIGHT ARCHIVE                        │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ 04. ACME: CFI-G                 │ Cool Flames Investigation with Gases                                        │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ Official Identifier             │ PSI-159                                                                     │
│ Official Title                  │ Cool Flames Investigation with Gases (CFI-G)                                │
│ Research Objective              │ Study low-temperature non-luminous cool flame chemical kinetics and         │
│                                 │ extinction limits using gaseous alkane fuels in microgravity.               │
│ Experimental Platform           │ Combustion Integrated Rack (CIR) — ISS Destiny Laboratory                   │
│ Gravity Condition Tested        │ Microgravity (~10⁻⁶ g) — Zero-buoyancy gas coflow                           │
│ Experiment Completed            │ YES (Completed flight runs inside CIR)                                      │
│ PSI Record Confirmed            │ YES — https://psi.nasa.gov/physci/repo/data/investigations/PSI-159          │
│ Numerical Data Files Available  │ YES — 1.90 TB across 3,756 files (Flow rates, OH* chemiluminescence, CSV)   │
│ Publications Available          │ YES — Stocker et al., NASA Glenn Research Center Technical Reports          │
│ Source DOI / Official URL       │ https://psi.nasa.gov/physci/repo/data/investigations/PSI-159                │
│ Verification Date & Disposition │ November 2026 — VERIFIED EXPERIMENTAL FLIGHT ARCHIVE                        │
│ Critical Scientific Note        │ CFI-G did NOT test lunar partial gravity or solid materials. It tested      │
│                                 │ gaseous fuels in 0g. Claims of partial-g testing were corrected.            │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ 05. ACME: E-FIELD               │ Electric-Field Effects on Coflow Flames                                     │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ Official Identifier             │ PSI-22                                                                      │
│ Official Title                  │ Electric-Field Effects on Coflow Flames                                     │
│ Research Objective              │ Investigate the use of high-voltage electric fields to manipulate ion body  │
│                                 │ forces and create artificial convective drafts in non-buoyant flames.       │
│ Experimental Platform           │ Combustion Integrated Rack (CIR) — ISS Destiny Laboratory                   │
│ Gravity Condition Tested        │ Microgravity (~10⁻⁶ g) with applied electrostatic body forces (0 to 10 kV)  │
│ Experiment Completed            │ YES (Completed flight campaign in CIR)                                      │
│ PSI Record Confirmed            │ YES — https://psi.nasa.gov/physci/repo/data/investigations/PSI-22           │
│ Numerical Data Files Available  │ YES — 884.95 GB across 1,840 files (Voltage/current logs, planar imaging)   │
│ Publications Available          │ YES — NASA TM and Combustion Institute papers                               │
│ Source DOI / Official URL       │ https://psi.nasa.gov/physci/repo/data/investigations/PSI-22                 │
│ Verification Date & Disposition │ November 2026 — VERIFIED EXPERIMENTAL FLIGHT ARCHIVE                        │
│ Critical Scientific Note        │ Used electric field forces (qE) as a laboratory proxy to induce convective  │
│                                 │ drafts in 0g. It is NOT an actual lunar or martian gravitational flight test.│
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ 06. ACME: BRE                   │ Burning Rate Emulator                                                       │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ Official Identifier             │ PSI-20                                                                      │
│ Official Title                  │ Burning Rate Emulator (BRE)                                                 │
│ Research Objective              │ Emulate solid material burning behaviour and mass loss rates using porous   │
│                                 │ gas burners under sub-atmospheric and elevated oxygen concentrations.       │
│ Experimental Platform           │ Combustion Integrated Rack (CIR) — ISS Destiny Laboratory                   │
│ Gravity Condition Tested        │ Microgravity (~10⁻⁶ g)                                                      │
│ Experiment Completed            │ YES (Completed flight campaign in CIR)                                      │
│ PSI Record Confirmed            │ YES — https://psi.nasa.gov/physci/repo/data/investigations/PSI-20           │
│ Numerical Data Files Available  │ YES — 1.85 TB (Contains CSV experimental tables for 14.7, 10.2, and 8.2 psi)│
│ Publications Available          │ YES — NASA TM series; Olson et al., Combust. Sci. Tech.                     │
│ Source DOI / Official URL       │ https://psi.nasa.gov/physci/repo/data/investigations/PSI-20                 │
│ Verification Date & Disposition │ November 2026 — VERIFIED EXPERIMENTAL FLIGHT ARCHIVE                        │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ 07. SAME-R                      │ Smoke Aerosol Measurement Experiment-Reflight                               │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ Official Identifier             │ PSI-101 (Baseline SAME is PSI-102)                                          │
│ Official Title                  │ Smoke Aerosol Measurement Experiment-Reflight                               │
│ Research Objective              │ Measure smoke particulate size distributions from overheated spacecraft     │
│                                 │ materials (Kapton, Pyrell foam, Teflon) to optimize spacecraft smoke alarms.│
│ Experimental Platform           │ Microgravity Science Glovebox (MSG) — ISS Destiny Laboratory                │
│ Gravity Condition Tested        │ Microgravity (~10⁻⁶ g)                                                      │
│ Experiment Completed            │ YES (Completed flight operations on ISS)                                    │
│ PSI Record Confirmed            │ YES — https://psi.nasa.gov/physci/repo/data/investigations/PSI-101          │
│ Numerical Data Files Available  │ YES — 5.87 GB across 342 files (110 experimental test records, particle CSV)│
│ Publications Available          │ YES — Urban, Mulholland, et al., Fire Safety Journal                        │
│ Source DOI / Official URL       │ https://psi.nasa.gov/physci/repo/data/investigations/PSI-101                │
│ Verification Date & Disposition │ November 2026 — VERIFIED EXPERIMENTAL FLIGHT ARCHIVE                        │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ 08. DAFT / DAFT-2               │ Dust Aerosol Fractionating Tool                                             │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ Official Identifier             │ PSI-47                                                                      │
│ Official Title                  │ Dust Aerosol Fractionating Tool                                             │
│ Research Objective              │ Evaluate optical condensation particle counters and differential mobility   │
│                                 │ analyzers in microgravity to distinguish smoke from background mineral dust.│
│ Experimental Platform           │ Express Rack 4 / Node 1 (ISS)                                               │
│ Gravity Condition Tested        │ Microgravity (~10⁻⁶ g)                                                      │
│ Experiment Completed            │ YES (Completed hardware evaluation on ISS)                                  │
│ PSI Record Confirmed            │ YES — https://psi.nasa.gov/physci/repo/data/investigations/PSI-47           │
│ Numerical Data Files Available  │ YES — 39.83 MB across 32 files (Concentration time series, TSI P-Trak logs) │
│ Publications Available          │ YES — NASA Technical Reports (Meyer, Ruff, et al.)                          │
│ Source DOI / Official URL       │ https://psi.nasa.gov/physci/repo/data/investigations/PSI-47                 │
│ Verification Date & Disposition │ November 2026 — VERIFIED EXPERIMENTAL FLIGHT ARCHIVE                        │
│ Critical Scientific Note        │ DAFT used Arizona Road Dust (ARD Fine), not authentic lunar regolith.       │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ 09. SPICE                       │ Smoke Point In Coflow Experiment                                            │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ Official Identifier             │ PSI-107 (associated with SLICE / CIR coflow tests)                          │
│ Official Title                  │ Smoke Point In Coflow Experiment                                            │
│ Research Objective              │ Determine soot formation and smoke points in non-buoyant laminar gas flames │
│                                 │ to predict soot radiative emissions in spacecraft fires.                    │
│ Experimental Platform           │ Combustion Integrated Rack (CIR) — ISS Destiny Laboratory                   │
│ Gravity Condition Tested        │ Microgravity (~10⁻⁶ g)                                                      │
│ Experiment Completed            │ YES (Completed flight campaign in CIR)                                      │
│ PSI Record Confirmed            │ YES — https://psi.nasa.gov/physci/repo/data/investigations/PSI-107          │
│ Numerical Data Files Available  │ YES — 6.47 GB across 186 files (526 flames studied, CSV optical soot logs)  │
│ Publications Available          │ YES — Lin, Faeth, Sunderland, et al., Combustion & Flame                    │
│ Source DOI / Official URL       │ https://psi.nasa.gov/physci/repo/data/investigations/PSI-107                │
│ Verification Date & Disposition │ November 2026 — VERIFIED EXPERIMENTAL FLIGHT ARCHIVE                        │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ 10. FM2 & LUCI                  │ Flammability of Materials on the Moon & Lunar Combustion Investigation      │
├─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────┤
│ Official Identifier             │ NASA-FM2 (Planned) / LUCI (Conceptual)                                      │
│ Official Title                  │ Flammability of Materials on the Moon (FM2)                                 │
│ Research Objective              │ Conduct the first in-situ flammability and flame spread experiments on the  │
│                                 │ actual lunar surface under 0.166g and 34% O₂ Exploration Atmospheres.      │
│ Experimental Platform           │ Artemis Commercial Lunar Payload Services (CLPS) Lander (Planned)           │
│ Gravity Condition Tested        │ Lunar Surface (0.166 g) — PLANNED FUTURE FLIGHT                             │
│ Experiment Completed            │ NO — IN DEVELOPMENT / PRE-FLIGHT                                            │
│ PSI Record Confirmed            │ NO — Zero datasets exist in NASA PSI (Pre-flight development phase)          │
│ Numerical Data Files Available  │ NO — No numerical flight data available yet                                 │
│ Publications Available          │ YES — NASA Technical Concept Memorandums & Science Mission Charters         │
│ Source DOI / Official URL       │ NASA Glenn Research Center Space Exploration Program Reference              │
│ Verification Date & Disposition │ November 2026 — EVIDENCE GAP / PLANNED FLIGHT PAYLOAD                       │
│ Critical Scientific Note        │ FM2 and LUCI MUST NOT be presented as completed, verified flight archives.  │
│                                 │ They represent active research charters addressing the partial-g data gap.  │
└─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mandatory UI Display Mapping

In accordance with Section 5 of the Scientific Review Gate, whenever any investigation is rendered in the UI:
- **`PSI-25`, `PSI-98`, `PSI-69`, `PSI-159`, `PSI-22`, `PSI-20`, `PSI-101`, `PSI-47`, `PSI-107`**:
  Display with the badge: **`REPORTED FLIGHT RECORD [NASA PSI]`**.
  Any numerical measurement extracted from flight CSV tables shall be labeled **`MEASURED`**.
- **`NASA-FM2` / `LUCI`**:
  Display with the badge: **`EVIDENCE GAP / PLANNED CLPS PAYLOAD`**.
  All associated numbers shall be labeled **`UNKNOWN`** or **`THEORETICAL HYPOTHESIS`**. Under no circumstances shall it be labeled with a green 'Flight Data' checkmark.
