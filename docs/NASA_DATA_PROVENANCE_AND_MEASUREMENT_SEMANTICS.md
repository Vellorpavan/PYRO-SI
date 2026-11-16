# GODEYE // PYRO-SI — NASA Data Provenance & Measurement Semantics
## Scientific Criteria for Sensor Telemetry, Image-Derived Metrics, Thermochemical Equilibrium Calculations, and Archival Volume Attribution

**Document Identifier:** NASA-PYRO-SPEC-PROVENANCE-2343  
**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Auditor / Architect:** Lead Scientific Data Verification Engineer & Independent Standards Auditor  
**Date:** November 16, 2026  
**Status:** ACTIVE REGULATORY SPECIFICATION // VERSION 1.0  
**Governing Standards:** NASA SPD-41a, NASA-STD-3001 Vol 2 Rev F, NASA-STD-6001B w/Change 3, NASA RP-1311 (CEA)  

---

## 1. Foundational Epistemic Framework

Automated ingestion of microgravity combustion datasets presents a critical scientific trap: **conflating numbers in a table with physical transducer measurements**.

A numeric value deposited in an archival spreadsheet or CSV may originate from one of several fundamentally distinct physical and mathematical mechanisms:
1. **Direct In-Situ Physical Transducer Telemetry:** Voltages, currents, or calibrated resistance readings from sensors physically immersed in or monitoring the experiment environment (thermocouples, pressure transducers, radiometers, oxygen sensors, mass flow controllers).
2. **Image-Derived / Video-Digitized Observations:** Spatial dimensions, luminosities, or velocity fields extracted post-facto from high-speed or optical video frames via digital image processing or manual pixel/ruler digitization (e.g., flame lengths, soot boundaries, droplet diameters).
3. **Thermochemical Equilibrium Calculations:** Theoretical state variables calculated from chemical thermodynamics assuming complete or equilibrium reaction under idealized boundary conditions (e.g., adiabatic flame temperature $T_{ad}$ computed via NASA CEA), where no physical sensor ever measured the quantity.
4. **Mixed Model-Experiment Validation Sets:** Collocated tables where computational or analytical model predictions are placed side-by-side with empirical observations for bench-scale validation.
5. **System Execution & Event Logs:** Automated operational logs containing timestamps, software states, command codes, and file transfer records that track machine execution without containing physical scientific telemetry.
6. **Literature & Ground Benchmark Compilations:** Derived empirical values digitized from published figures and journal tables from ground-based laboratories under ambient 1-g conditions.
7. **Prescribed Experimental Configurations:** Actuator target setpoints, scheduled test dates, gas bottle mixtures, and chamber geometry matrices.

Under **NASA SPD-41a** and the GODEYE // PYRO-SI Scientific Verification Protocol, **every catalogued data column and file must carry explicit provenance metadata**. No numerical figure may be represented as a physical sensor measurement without empirical proof of in-situ transducer acquisition.

---

## 2. Expanded Multi-Tier Classification Taxonomy

To prevent data misrepresentation, GODEYE // PYRO-SI enforces an expanded nine-tier file-level classification taxonomy:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        NINE-TIER FILE-LEVEL CLASSIFICATION TAXONOMY                    │
├──────────────────────────────────────┬─────────────────────────────────────────────────┤
│ Classification                       │ Defining Scientific & Empirical Criteria        │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 1. EXPERIMENTAL_CONFIGURATION        │ Prescribed run matrices, target flow setpoints, │
│                                      │ burner dimensions, gas bottle compositions,     │
│                                      │ or automated software state/event logs.         │
│ 2. NUMERICAL_EXPERIMENTAL_MEASUREMENTS│ Direct physical time-series or steady readings  │
│                                      │ from calibrated in-situ sensors (TCs, pressure, │
│                                      │ O2 sensors, radiometers, MFCs).                 │
│ 3. MEASUREMENTS_EXTRACTED_FROM_IMAGERY│ Spatial or temporal dimensions extracted from   │
│                                      │ video/still frames via pixel/ruler calibration  │
│                                      │ (e.g. Photoshop ruler flame length, tracking).  │
│ 4. MIXED_EXPERIMENTAL_AND_MODEL_DATA │ Tables combining analytical/computational model │
│                                      │ predictions with empirical validation data.     │
│ 5. NUMERICAL_DERIVED_DATA            │ Quantities calculated from primary signals or   │
│                                      │ digitized from published literature benchmarks. │
│ 6. DOCUMENTATION_ONLY                │ Text descriptions, ISA-Tab descriptors, reports.│
│ 7. VIDEO_OR_IMAGE_ONLY               │ Raw optical media archives without tabular data.│
│ 8. CODE_OR_MODEL_ONLY                │ Pure numerical simulation code, grids, or runs. │
│ 9. CONTENT_NOT_YET_INSPECTED         │ Metadata entries where files are not yet        │
│                                      │ available in public S3 storage (0 files).       │
└──────────────────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 3. Disambiguation Rules for Specific Scientific Quantities

### 3.1 Adiabatic Flame Temperature ($T_{ad}$) Semantics
- **Physical Reality:** In gaseous microgravity diffusion flames (e.g., ACME / Flame Design `PSI-10`, CFI-G `PSI-159`), stoichiometric and near-stoichiometric flame zones reach peak temperatures exceeding $2100\text{ K}$ to $2750\text{ K}$.
  - Physical immersion probes (such as Type K thermocouples, melting point $\approx 1600\text{ K}$, or Type S/R/B platinum-rhodium wire, melting point $\approx 2000\text{ K}$) cannot survive inside the reaction zone.
  - Furthermore, intrusive probes induce severe catalytic reactions and radiative heat losses that perturb the microgravity transport field.
- **Scientific Provenance:** The column `Tad (K)` in `PSI-10` and `PSI-159` is **strictly a calculated thermochemical equilibrium value**.
  - It is derived by solving constant-enthalpy, constant-pressure ($h, p$) combustion equilibrium equations:
    $$H_{\text{reactants}}(T_0, p) = H_{\text{products}}(T_{ad}, p)$$
  - Calculated using standardized thermochemical equilibrium codes such as **NASA Glenn's CEA (Chemical Equilibrium with Applications)**, Gordon & McBride (1994, NASA RP-1311 / SP-273), or Cantera/CHEMKIN.
  - Input parameters: reactant initial temperature ($T_0 \approx 298.15\text{ K}$ or ambient chamber temperature), measured mean chamber pressure ($p_{\text{mean}}$), fuel dilution ($X_{\text{fuel}}$ or $X_f$), and measured chamber oxygen mole fraction ($X_{O2}$).
- **Regulatory Requirement:** In all catalogue metadata and documentation, `Tad` must be classified as **`NUMERICAL_DERIVED_DATA`** or **`THERMOCHEMICAL_EQUILIBRIUM_CALCULATION`**. It must NEVER be presented as a physical sensor measurement.

### 3.2 Flame Length ($L_f$) Extraction from Imagery (`PSI-107`)
- **Physical Reality:** In co-flow laminar diffusion flames (such as SPICE `PSI-107`), flame length is defined by the luminous soot boundary or chemiluminescence emission tip.
- **Scientific Provenance:**
  - Inspection of `PSI-107_Raw Data_Spice_Flight_Flamelength.xls` revealed the embedded calibration equation:
    $$\text{Spice ruler (mm)} = -14.599 \times \text{PS reading (inches)} + 111.04$$
  - The measurements were produced by co-investigator Dr. Zeng-Guang Yuan by measuring digitized video frames in **Adobe Photoshop** using the software ruler tool against optical reference markers.
- **Regulatory Requirement:** These figures must be explicitly classified as **`MEASUREMENTS_EXTRACTED_FROM_IMAGERY`** with `acquisition_method: OPTICAL_VIDEO_EXTRACTION`. They must be cleanly distinguished from raw sensor telemetry.

### 3.3 Mixed Validation Content (`PSI-117`)
- **Structure:** File `PSI-117_Analyzed Data_MST_2024_Dext.csv` contains side-by-side data:
  - Columns 0–3: Analytical model predictions (`Model, Pressure, Dext_cool, Dext_hot`) across $0.5$ to $3.0\text{ atm}$.
  - Columns 5–7: Empirical microgravity drop-tower observations (`Expt, Pressure, Dext_cool_Expt`) across $0.5$ to $1.25\text{ atm}$.
- **Regulatory Requirement:**
  - Classifying this file as `CODE_OR_MODEL_ONLY` violates scientific data integrity because it erases empirical observations ($D_{\text{ext, cool}}^{\text{Expt}}$).
  - The file must be classified as **`MIXED_EXPERIMENTAL_AND_MODEL_DATA`** with separate sub-column provenance tags.

### 3.4 Automated System Event Logs (`PSI-102`)
- **Structure:** File `PSI-102_Analyzed Data_GMT255 log.xlsx` contains 241 event records from the Microgravity Science Glovebox (MSG) automated control software (`Aging chamber is filled`, `DustTrak initialized`, `Entering FastPurge State`, `Sending file via FTP`).
- **Regulatory Requirement:**
  - This file does NOT contain particle concentration or smoke obscuration time series.
  - The file must be classified as **`EXPERIMENTAL_CONFIGURATION`** (or operational software event log), not as experimental measurement telemetry.
  - The existence of underlying sensor telemetry transferred via FTP must be disclosed as an **unresolved uncertainty**, noting that the public S3 repository contains only the event log.

### 3.5 Digitized Literature Compilations (`PSI-142`)
- **Structure:** File `PSI-142_Analyzed Data_PSI data summary Princeton with links.xlsx` contains extinction strain rates ($a_{\text{CFE}}$, $a_{\text{HFE}}$), PLIF signals, and chemiluminescence profiles compiled from peer-reviewed publications (C.B. Reuter et al., *Combustion and Flame* 2017; *Proc. Combust. Inst.* 2019).
- **Regulatory Requirement:**
  - Classified as **`NUMERICAL_DERIVED_DATA`** with `value_provenance: PUBLISHED_JOURNAL_FIGURES_AND_TABLES`.
  - Must explicitly state the data originates from **1-g atmospheric ground counterflow experiments with ozone doping**, rather than on-orbit flight experiments.

---

## 4. Repository Storage Volume Attribution Protocol

When auditing metadata storage fields (such as `totalFileSize`) against actual object stores (such as AWS S3):

1. **Strict Separation of Verified Facts from Inductive Inferences:**
   - **Verified Fact:** The numerical byte values stored in the metadata catalog and the exact byte sums of objects residing in S3.
   - **Unverified Inference:** Any assertion regarding what physical media, raw telemetry, or institutional offline archives generated that metadata number when primary NASA documentation does not define the field's semantics.
2. **Prohibited Assertions:**
   - It is strictly prohibited to assert that an unuploaded metadata discrepancy (such as the $4,114,019,468,490\text{ byte}$ difference in `PSI-20`, `PSI-21`, and `PSI-106`) is "confirmed raw on-orbit flight telemetry" without primary NASA documentation explicitly verifying that attribution.
3. **Formal Epistemic Classification:**
   - Unreconciled volume differences must be classified as **`UNRESOLVED_METADATA_STORAGE_ATTRIBUTION`**.
   - Audit reports must disclose both what is mathematically verified (the byte values) and what remains scientifically unconfirmed (the archival status and physical nature of the referenced data).
