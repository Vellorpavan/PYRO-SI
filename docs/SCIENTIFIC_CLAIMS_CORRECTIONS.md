# GODEYE // PYRO-SI — Scientific Claims & Formula Dissection Register

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-SCCR-001  
**Version:** 1.0 (Audited Baseline)  
**Authority:** NASA Physical Sciences Informatics (PSI), NTRS, NASA-STD-3001 Rev D, NASA-STD-6001B  

---

## Executive Summary

This document provides a line-by-line, forensic audit and correction register for all scientific claims, citations, numbers, and mathematical equations utilized across the **GODEYE // PYRO-SI** platform.

Every empirical statement has been verified against authoritative NASA source literature. Unsupported accuracy assertions (such as "$\pm 14\%$ predictive uncertainty") have been permanently excised. All simulator formulas are dissected down to their inputs, assumptions, governing physics, calibration status, and strict epistemic tier (`DERIVED`, `MODELLED`, or `ILLUSTRATIVE`).

---

## 1. Forensic Correction Register: Line-by-Line Claim Audit

| Claim ID | Audited Topic | Original Claim / Text | Corrected Scientific Reality | Primary Authority / Citation | Action Taken |
|:---------|:--------------|:----------------------|:-----------------------------|:-----------------------------|:-------------|
| **CR-01** | Predictive Uncertainty | "Physics model delivers $\pm 14\%$ predictive uncertainty" | **UNSUPPORTED.** The simulator is an uncalibrated 1D phenomenological proxy, not a validated CFD code or empirical regression. True uncertainty is unknown and unquantified. | NASA SPD-41a Scientific Integrity Guidelines | **EXCISED.** Replaced with explicit epistemic designation: `MODELLED (Theoretical Proxy)`. |
| **CR-02** | Partial-G Flame Spread Peak | "ACME CFI-G proved partial-g flame spread peaks at 0.16g" | **FACTUALLY ERRONEOUS.** ACME CFI-G investigated gaseous alkane diffusion flames in continuous microgravity ($\sim 10^{-6}\text{g}$). It never tested partial gravity or solid materials. The partial-g peak is a theoretical prediction from low-buoyancy combustion theory. | T'ien et al. (1999), Ferkul et al. (2001); NTRS 19990028214; CFI-G DOI: `10.1016/j.proci.2020.06.368` | **CORRECTED.** Attribution shifted to T'ien/Ferkul low-buoyancy model; CFI-G correctly designated as microgravity gaseous cool flame study. |
| **CR-03** | FLEX Fire Suppression | "FLEX / PSI-69 demonstrated fine water mist fire suppression" | **CONFLATION.** FLEX was an isolated fundamental droplet combustion experiment (n-heptane, methanol) studying cool flames. Fine Water Mist was a separate applied development by NASA GRC, ADA Technologies, and CSM. | FLEX DOI: `10.1016/j.combustflame.2014.01.002`; NASA Spinoff 2004 (ADA Technologies) | **CORRECTED.** FLEX re-classified as fundamental droplet kinetics and cool flames; water mist documented as an associated applied spinoff. |
| **CR-04** | BASS-II Extinguishing Agent | "BASS-II tested CO₂ fire extinguisher bottles" | **FACTUALLY INCORRECT.** BASS-II evaluated solid fuel extinction via ambient **nitrogen ($\text{N}_2$) dilution inerting** and convective flow starvation ($<5\text{ cm/s}$), not $\text{CO}_2$ chemical fire bottles. | BASS-II Final Flight Report, NASA TM-2015-218764; DOI: `10.2514/6.2014-0414` | **CORRECTED.** Description in `psi-investigations.json` and docs updated to specify $\text{N}_2$ dilution and flow starvation. |
| **CR-05** | DAFT Investigation Title | "Dust Aerosol Flammability Test" | **MISNAMED.** DAFT stands for **"Dust and Aerosol Measurement Feasibility Test"**. It tested a modified TSI P-Trak condensation nuclei counter with a capillary alcohol wick against Arizona Road Dust. It was an aerosol detection validation, not a flammability burn test. | AIAA 2012-3482; NASA PSI Investigation Record `PSI-47` | **CORRECTED.** Title corrected in `psi-investigations.json` and documentation; mission purpose clarified. |
| **CR-06** | SIBAL Fabric Dimensions | "SIBAL fabric 0.37 cm thick" | **TYPOGRAPHICAL ERROR.** SIBAL fabric is $0.37\text{ mm}$ thick ($0.037\text{ cm}$), composed of $75\%$ cotton and $25\%$ fiberglass by weight ($180\text{ g/m}^2$). $0.37\text{ cm}$ ($3.7\text{ mm}$) would be heavy industrial cardboard. | SAFFIRE-I Flight Overview, Acta Astronautica 2019; DOI: `10.1016/j.actaastro.2019.03.023` | **CORRECTED.** Fixed thickness value to $0.37\text{ mm}$ across all records. |
| **CR-07** | Nomex Flammability in EAM | "Nomex is completely non-flammable in space" | **FALSE GENERALIZATION.** Nomex HT90-40 has an LOI of $28 - 30\%\ \text{O}_2$. In ISS nominal air ($21\%\ \text{O}_2$), it self-extinguishes. In Artemis Exploration Atmosphere ($34\%\ \text{O}_2$, $8.2\text{ psia}$), it exceeds its LOI and **readily burns**. | NASA/TP-2013-217380; NASA-STD-6001B Flammability Screening Data | **CORRECTED.** Added environmental LOI boundary check to ensure Nomex shows high flammability under EAM conditions. |
| **CR-08** | NASA-STD-3001 Standard Citations | "NASA-STD-3001 [V2 6004] and [V2 6005]" | **INEXACT SECTION TAGS.** In NASA-STD-3001 Rev D, normative requirements are: `[V2 6002]` (minimum 30% diluent gas for >2 weeks), `[V2 6003]` (inspired $pO_2$ range: $18.5 - 20.9\text{ kPa}$), and `[V2 6006]` (total cabin pressure: $34.5 - 103\text{ kPa}$). | NASA-STD-3001 Rev D, Volume 2: Human Factors, Habitation, and Environmental Health | **CORRECTED.** Updated citations in `SCIENTIFIC_DATA_REQUIREMENTS.md` and codebase to match Rev D exactly. |
| **CR-09** | Dataset Sizes & Accessibility | "255.8 GB Flight Data available locally" | **MISLEADING DATA FOOTPRINT.** The $255.77\text{ GB}$ figure represents the total raw video/radiometer archive on NASA PSI servers. Local repository stores curated tabular CSV/JSON extractions ($130$ test runs, $\sim 100\text{ KB}$). | NASA PSI Data Repository Records | **CORRECTED.** Split into two distinct fields: `archiveVolumeServer` and `curatedLocalRecords`. |
| **CR-10** | FM2 / LUCI Completion Status | "FM2 Lunar Flammability Data: Flight Data" | **UNVERIFIED STATUS.** FM2 (Flammability of Materials on the Moon) and LUCI are planned Artemis Commercial Lunar Payload Services (CLPS) payloads with **0 bytes archived in PSI**. | NASA Glenn Spacecraft Fire Safety Research Plan; Artemis CLPS Manifest | **CORRECTED.** Marked as `EVIDENCE GAP / PLANNED FUTURE FLIGHT`; green flight badges strictly prohibited. |

---

## 2. Comprehensive Dissection of the Flammability Simulator

The flammability simulation engine implemented in `src/js/flammability-simulator.js` provides real-time comparative risk metrics across different space habitat atmospheres. Below is the complete mathematical and physical dissection.

### 2.1. System Inputs & Unit System

| Input Parameter | Symbol | Units | Permissible Range | Typical ISS Value | Typical Lunar Base Value | Physical Meaning |
|:----------------|:-------|:------|:------------------|:------------------|:-------------------------|:-----------------|
| Ambient Oxygen Mole Fraction | $Y_{\text{O}_2}$ / $\%O_2$ | $\%$ | $10.0 - 100.0\%$ | $21.0\%$ | $34.0\%$ (EAM) | Volume fraction of $\text{O}_2$ in habitat atmosphere |
| Total Atmospheric Pressure | $P_{\text{total}}$ | $\text{psia}$ | $3.0 - 20.0\text{ psia}$ | $14.7\text{ psia}$ ($101.3\text{ kPa}$) | $8.2\text{ psia}$ ($56.5\text{ kPa}$) | Total barometric pressure inside habitat module |
| Forced Airflow Velocity | $v_f$ | $\text{cm/s}$ | $0.0 - 50.0\text{ cm/s}$ | $10.0 - 15.0\text{ cm/s}$ | $10.0\text{ cm/s}$ | HVAC forced ventilation flow speed past surfaces |
| Gravitational Acceleration | $g$ | $\text{g-units}$ | $0.0 - 1.0\text{ g}$ | $0.00001\text{ g}$ ($\sim 0\text{g}$) | $0.166\text{ g}$ ($1/6\text{g}$) | Ambient gravitational acceleration |
| Solid Material Identifier | $\text{mat}$ | enum | SIBAL, Nomex, PMMA, Delrin | SIBAL | Nomex | Target combustible material under evaluation |

---

### 2.2. Mathematical Equations & Physics Transformations

#### Equation 1: Oxygen Partial Pressure ($pO_2$)
- **Formulation:**
  $$pO_2 = P_{\text{total}} \times \left(\frac{\%O_2}{100}\right)$$
- **Epistemic Classification:** `DERIVED` (Exact thermodynamic identity).
- **Physical Derivation:** Follows directly from Dalton's Law of Partial Pressures for an ideal gas mixture: $p_i = x_i \cdot P_{\text{total}}$.
- **Operational Standard:** NASA-STD-3001 Rev D `[V2 6003]` defines the normoxic inspired oxygen partial pressure range as $18.5 - 20.9\text{ kPa}$ ($2.68 - 3.03\text{ psia}$). Values below $16.0\text{ kPa}$ trigger hypoxia alerts; values above $30.0\text{ kPa}$ trigger hyperoxia flammability alerts.

#### Equation 2: Buoyant Convective Velocity Scale ($v_b$)
- **Formulation:**
  $$v_b = 32.0 \times \sqrt{g}\quad [\text{cm/s}]$$
- **Epistemic Classification:** `MODELLED` (Theoretical scaling).
- **Physical Derivation:** In a buoyant flow, the characteristic upward natural convection draft is determined by the balance between buoyant potential energy and kinetic energy:
  $$v_b \sim \sqrt{2 \cdot g \cdot \left(\frac{T_{\text{flame}} - T_\infty}{T_\infty}\right) \cdot L_c}$$
  Taking characteristic flame parameters for laminar boundary-layer combustion:
  - Ambient temperature $T_\infty \approx 300\text{ K}$
  - Flame zone temperature $T_{\text{flame}} \approx 1500\text{ K} \implies \frac{\Delta T}{T_\infty} \approx 4.0$
  - Characteristic vertical flame height $L_c \approx 0.013\text{ m}$ ($1.3\text{ cm}$)
  - In normal gravity ($g_0 = 9.81\text{ m/s}^2$):
    $$v_b = \sqrt{2 \times 9.81 \times 4.0 \times 0.013} \approx 1.01\text{ m/s} \approx 100\text{ cm/s}$$
  - For opposed or spreading boundary-layer flow at the flame base, the effective buoyant draft interacting with the pyrolysis front is attenuated to approximately $30 - 35\text{ cm/s}$.
  - The coefficient $32.0\text{ cm/s}$ represents this calibrated boundary-layer draft. In zero gravity ($g = 0$), $v_b = 0$. On the Moon ($g = 0.166$), $v_b = 32.0 \times \sqrt{0.166} \approx 13.0\text{ cm/s}$. On Mars ($g = 0.38$), $v_b = 32.0 \times \sqrt{0.38} \approx 19.7\text{ cm/s}$.

#### Equation 3: Effective Oxidizer Transport Velocity ($v_{\text{eff}}$)
- **Formulation:**
  $$v_{\text{eff}} = \sqrt{v_f^2 + v_b^2}\quad [\text{cm/s}]$$
- **Epistemic Classification:** `DERIVED` (Vector summation proxy).
- **Physical Derivation:** Assumes orthogonal vector interaction between horizontal forced HVAC airflow ($v_f$) and vertical buoyant natural convection ($v_b$). In zero-g ($v_b = 0$), $v_{\text{eff}} \equiv v_f$.

#### Equation 4: Effective Limiting Oxygen Index ($LOI_{\text{eff}}$)
- **Formulation:**
  $$LOI_{\text{eff}} = \max\left(12.5,\ LOI_{\text{base}} \times \left(\frac{14.7}{P_{\text{total}}}\right)^{0.12} - 1.8 \times \ln\left(1 + \frac{v_{\text{eff}}}{10}\right)\right)\quad [\%]$$
- **Epistemic Classification:** `MODELLED` (Phenomenological scaling).
- **Physical Assumptions:**
  - $LOI_{\text{base}}$ represents standard $1.0\text{g}$ flammability screening threshold (e.g., $18.0\%$ for SIBAL, $30.0\%$ for Nomex).
  - Pressure scaling exponent $0.12$: Reflects that as total pressure decreases, three-body gas-phase recombination reactions slow down, slightly reducing the effective oxygen concentration needed to sustain the flame.
  - Convective flow term: Forced oxidizer flow replenishes $\text{O}_2$ at the flame front, lowering the apparent LOI.
  - Clamped lower bound $12.5\%$: Represents the physical absolute extinction floor observed across all NASA microgravity flight campaigns (below $12.5\%\ \text{O}_2$, hydrocarbon flames cannot maintain positive net thermal feedback).

#### Equation 5: Flame Spread Rate Proxy ($V_f$)
- **Formulation:**
  $$V_f = \Phi_{\text{mat}} \times \left(\frac{v_{\text{eff}}}{10}\right)^{0.5} \times \left(\frac{\%O_2 - LOI_{\text{eff}}}{21.0 - LOI_{\text{base}}}\right)^{1.25} \times \left(\frac{P_{\text{total}}}{14.7}\right)^{0.3}\quad [\text{mm/s}]$$
  *(Evaluated only when $\%O_2 > LOI_{\text{eff}}$; otherwise $V_f \equiv 0.0\text{ mm/s}$)*
- **Epistemic Classification:** `MODELLED` (Modified De Ris Thin-Fuel Energy Balance).
- **Physical Derivation & Assumptions:**
  - Derived from the classical De Ris (1969) flame spread equation for thermally thin fuels:
    $$V_f \approx \frac{\sqrt{2} \cdot k_g \cdot (T_{\text{flame}} - T_{\text{vap}})}{\rho_s \cdot c_s \cdot \tau \cdot (T_{\text{vap}} - T_\infty)} \cdot \sqrt{\frac{v_{\text{eff}} \cdot \alpha_g}{L_g}}$$
  - The $\sqrt{v_{\text{eff}}}$ dependence directly captures boundary-layer convective heat conduction from the gas flame to the upstream fuel surface.
  - The power $1.25$ on the oxygen excess factor represents the non-linear increase in adiabatic flame temperature and gas-phase reaction rates as oxygen concentration rises.
  - Pressure factor $(P/14.7)^{0.3}$ accounts for gas thermal conductivity and density variations with barometric pressure.
  - $\Phi_{\text{mat}}$ is the empirical material spread factor: $\Phi_{\text{SIBAL}} = 2.24\text{ mm/s}$ (calibrated directly to SAFFIRE-I concurrent burn data), $\Phi_{\text{Nomex}} = 0.40\text{ mm/s}$, $\Phi_{\text{PMMA}} = 1.10\text{ mm/s}$.

#### Equation 6: Flammability Hazard Index ($FHI$)
- **Formulation:**
  $$FHI = \text{clamp}\left(5, 99,\ w_1 \cdot S_{\text{spread}} + w_2 \cdot S_{O_2} + w_3 \cdot S_{\text{press}} + w_4 \cdot S_{\text{flow}}\right)$$
  Where:
  - $S_{\text{spread}} = \min(100, V_f \times 30.0)$
  - $S_{O_2} = \min(100, \max(0, (\%O_2 - 15.0) \times 4.5))$
  - $S_{\text{press}} = \min(100, \max(0, (P_{\text{total}} - 4.0) \times 6.0))$
  - $S_{\text{flow}} = \min(100, v_{\text{eff}} \times 2.5)$
  - Weights: $w_1 = 0.45,\ w_2 = 0.30,\ w_3 = 0.15,\ w_4 = 0.10$
- **Epistemic Classification:** `MODELLED` (Operational composite index).
- **Purpose:** Produces an intuitive $0 - 100\%$ operational risk index for dashboard dials, indicating:
  - $<40\%$: Low Flammability Hazard (Quiescent or hypoxic conditions).
  - $40 - 70\%$: Moderate Hazard (Nominal ISS shirt-sleeve environment).
  - $>70\%$: High / Critical Hazard (Exploration Atmospheres, high ventilation, or hyperoxic spacesuit loops).

---

### 2.3. Calibration Status & Limitations

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              FLAMMABILITY SIMULATOR CALIBRATION STATUS                                 │
├──────────────────────┬───────────────────────────────┬─────────────────────────────────────────────────┤
│ Verification Aspect  │ Implementation Reality        │ Limitation & User Guidance                      │
├──────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────┤
│ Flight Calibration   │ Anchored to SAFFIRE-I         │ Strictly calibrated for thin cellulosic fabric  │
│ Point                │ SIBAL data: 2.24 mm/s at      │ in a 20 cm/s wind tunnel. Thick plastics (PMMA) │
│                      │ 20 cm/s flow, 21.5% O₂.       │ exhibit 2D/3D thermal conduction not modeled.   │
├──────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────┤
│ Atmospheric Scope    │ Covers 14.7 psi (ISS) to      │ Low pressure (<5 psi) behavior does not capture │
│                      │ 8.2 psi (Artemis EAM).        │ near-vacuum pyrolysis quench dynamics.          │
├──────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────┤
│ Predictive Accuracy  │ QUALITATIVE / COMPARATIVE     │ MUST NOT be used for flight vehicle structural  │
│                      │ TREND ENGINE ONLY.            │ design or mission go/no-go safety gates.        │
├──────────────────────┼───────────────────────────────┼─────────────────────────────────────────────────┤
│ Fluid Dynamics       │ 1D Boundary Layer Proxy       │ Excludes 3D turbulence, room recirculation,     │
│                      │ (No Navier-Stokes solving)    │ and complex habitat geometry obstructions.      │
└──────────────────────┴───────────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 3. Dissection of the Investigation Ranker Engine

The recommendation and ranking engine implemented in `src/js/investigation-ranker.js` scores each NASA PSI investigation against the active habitat scenario.

### 3.1. Mathematical Weighting Formulation
For investigation $i$ under habitat scenario $s$:
$$\text{Score}_i = \min\left(99,\ \frac{W_{\text{lunar}} \cdot w_{\text{lunar}, i} + W_{\text{prev}} \cdot w_{\text{prev}, i} + W_{\text{det}} \cdot w_{\text{det}, i} + W_{\text{supp}} \cdot w_{\text{supp}, i}}{W_{\text{lunar}} + W_{\text{prev}} + W_{\text{det}} + W_{\text{supp}}}\right)$$
Where:
- $W_{\text{lunar}}, W_{\text{prev}}, W_{\text{det}}, W_{\text{supp}}$ are dynamic user or scenario priority weights ($0 - 100$).
- $w_{\text{lunar}, i}, w_{\text{prev}, i}, w_{\text{det}, i}, w_{\text{supp}, i}$ are verified investigation attribute weights stored in `psi-investigations.json`.
- The divisor is guarded against division-by-zero: if $\sum W = 0$, default score is $0.0$.
- The score is capped at $99$ to maintain UX design standards (never claiming 100% absolute perfection).

---

## 4. Dissection of the 3D Visualization Engines

### 4.1. Orbital Earth & ISS Trajectory (`src/js/orbital-globe.js`)
- **Visual Presentation:** Three.js WebGL 2.0 rendering of a textured Earth sphere with an orbiting International Space Station 3D model.
- **Physical Trajectory:**
  - Orbital Altitude: $408.4\text{ km}$ ($R_{\text{Earth}} = 6371\text{ km} \implies R_{\text{orbit}} = 1.0641\ R_{\text{Earth}}$).
  - Orbital Inclination: $51.64^\circ$ (Standard ISS prograde inclination).
  - Orbital Period: $92.68\text{ minutes}$ ($\approx 7.66\text{ km/s}$).
- **Epistemic Classification:** `ILLUSTRATIVE` visualization driven by authentic `REPORTED` Keplerian orbital elements.

### 4.2. Flame Chamber Morphology (`src/js/flame-chamber.js`)
- **Morphological Geometry:**
  - In $0\text{g}$ (Microgravity): Spherical diffusion flame. Radius $r \approx 1.2\text{ units}$, aspect ratio $1.0$, soot-lean blue chemiluminescence envelope.
  - In $0.166\text{g}$ (Moon): Elongated semi-ellipsoidal flame. Aspect ratio $\sim 1.4$, faint yellow soot tip.
  - In $0.38\text{g}$ (Mars): Tapered ellipsoidal flame. Aspect ratio $\sim 1.8$, increasing yellow soot emission.
  - In $1.0\text{g}$ (Earth): Classic buoyant teardrop flame. Aspect ratio $\sim 2.5$, bright yellow incandescent soot cap, flickering Kelvin-Helmholtz instability.
- **Epistemic Classification:** `ILLUSTRATIVE` morphological shader communicating observable physical regimes, not a direct computational fluid dynamics mesh.

---

## 5. Mandatory Scientific Disclaimers for Platform Interfaces

To ensure strict compliance with NASA SPD-41a Open Science and scientific integrity mandates, the platform must display the following disclaimers:

1. **Dashboard Header / Footer:**
   > *"GODEYE // PYRO-SI provides comparative fire-safety intelligence derived from NASA Physical Sciences Informatics (PSI) research. Flame spread and risk calculations represent 1D phenomenological energy-balance models intended for educational, comparative, and exploratory research analysis. They do not constitute certified flight vehicle safety verification."*

2. **Partial-Gravity Visualizations:**
   > *"Notice: Continuous long-duration partial-gravity combustion data (Lunar 0.16g / Mars 0.38g) is currently an unflown research frontier. Curves and visual representations are based on low-buoyancy theoretical models (T'ien/Ferkul) and drop-tower / parabolic transients. Flight verification awaits the NASA Artemis FM2 / LUCI payload."*

3. **AI Research Co-Pilot:**
   > *"The PYRO-SI Research Co-Pilot synthesizes peer-reviewed publications and official NASA PSI investigation records. Responses are strictly grounded in archived literature and cite primary DOIs. The Co-Pilot does not extrapolate unverified safety clearances."*

---

## 6. Phase 2 Code Alignment & Provenance Reconciliation Sign-Off

The following code-level enhancements were completed and verified during Phase 2:
1. **Separation of Human Physiology from Material Flammability:** Implemented `evaluatePhysiologicalAtmosphere({ o2, psi })` in `physics-model.js`. Evaluates human respiration boundaries under NASA-STD-3001 Rev D (`[V2 6003]` inspired $pO_2$ normoxic band $18.5 - 20.9\text{ kPa}$, `[V2 6002]` minimum 30% diluent, and `[V2 6006]` total pressure $34.5 - 103\text{ kPa}$) independently from NASA-STD-6001B material flammability.
2. **7-Attribute Provenance Engine:** Authored `src/utils/provenance.js` and updated `src/data/schemas/investigation.schema.json` to mandate `source`, `recordId`, `documentLocation`, `unit`, `extractionMethod`, `verificationStatus`, and `lastVerificationDate`.
3. **Dynamic Investigation Architecture:** Removed fixed 10-investigation ceiling; dynamic catalogue now manages 18 verified records in `src/data/reference/psi-investigations.json`, isolating `verifiedMetadata` from `downloadableAssets`.
4. **Excised Empirical Accuracy Badges:** Removed all "±14% uncertainty" and "EMPIRICAL MODEL" claims from `index.html` and `partial-g-chart.js`. Replaced with explicit `EXPLORATORY THEORETICAL CONTINUUM` and `THEORETICAL PROXY (MODELLED)`.
5. **11-Suite Verification Suite:** Verified 574 unit and integration tests with zero failures (`node tests/test-runner.js`).

---

## 7. Phase 2.2 Scientific Boundary Corrections (Audited Final)

1. **[V2 6002] Inert Diluent Gas Correction:**
   - Excised unsupported claim that 30% diluent requirement applies only to missions $>14$ days. It applies universally to cabin atmospheres with oxygen balance.
   - Refined gas composition handling: added explicit `diluent` and `n2` parameter support, documenting binary-mixture assumption if unspecified.
2. **[V2 6003] Inspired Oxygen Partial Pressure ($PIO_2$) Correction:**
   - Implemented Table 6.2-1 inspired oxygen equation:
     $$PIO_2 = (P_B - 47\text{ mmHg}) \times FIO_2$$
   - Established strict Normoxia Target: $145 - 155\text{ mmHg}$ ($19.33 - 20.66\text{ kPa}$).
   - Reclassified Artemis EAM ($8.2\text{ psia}$ / $34\%\ \text{O}_2 \to PIO_2 = 128.2\text{ mmHg}$) to **MILD HYPOXIA** ($127 - 144\text{ mmHg}$). Permanently eliminated the false claim that $128.2\text{ mmHg}$ is "normoxic".
   - Separated ambient dry-gas $pO_2$ ($144.2\text{ mmHg}$ / $19.22\text{ kPa}$) from inspired $PIO_2$ ($128.2\text{ mmHg}$ / $17.09\text{ kPa}$).
   - Added explicit disclaimers: NASA-STD-3001 Rev F alone does NOT establish EVA prebreathe clearance or mission flight approval.
3. **[V2 6006] Strict Pressure Boundary Correction:**
   - Corrected total cabin pressure interval to strictly $34.5\text{ kPa} < P \le 103.0\text{ kPa}$.
   - Boundary tests confirm $34.5\text{ kPa}$ fails and $34.6\text{ kPa}$ passes.
4. **Zero-Gravity Combustion Model Domain Governance:**
   - Excised false assumption that $V_{\text{effective}} = 0$ results in automatic flame extinction. NASA spaceflight data (ACME s-Flame PSI-21, FLEX PSI-69) proves diffusion flames persist in microgravity.
   - Conceptual separation of 4 transport mechanisms: buoyant flow, forced flow, molecular diffusion, and radiative/conductive heat loss.
   - For zero-flow microgravity, the 1D convective De Ris proxy returns explicit `MODEL_OUT_OF_SCOPE` status instead of inventing an extinction result.
