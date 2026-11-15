# GODEYE // PYRO-SI — Scientific Claims Register

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Status:** OFFICIAL SCIENTIFIC AUDIT DISPOSITION REGISTER  
**Review Standard:** NASA SMD Open Science & Scientific Integrity Guidelines  

---

## 1. Audit Framework & Disposition Terminology

In accordance with the NASA Space Apps 2026 Scientific Review Gate, all scientific statements, equations, performance bounds, and experimental claims across the platform have undergone forensic disposition:

- **`VERIFIED`**: Claim is confirmed by primary flight records in the NASA Physical Sciences Informatics (PSI) repository or peer-reviewed NASA Technical Reports Server (NTRS) publications with exact citations.
- **`CORRECTED`**: Claim contained factual errors, misattributions, or mislabeled investigations and has been strictly amended to reflect primary source truth.
- **`REMOVED`**: Claim lacked empirical derivation, training dataset provenance, or validated error metrics and has been permanently excised from the accepted scientific baseline.
- **`PENDING EVIDENCE`**: Claim relates to an active or planned research mission where flight observations do not yet exist in the public domain.

---

## 2. Disputed Claims Forensic Disposition Log

```
┌────┬───────────────────────────────────────┬─────────────┬─────────────────────────────────────────────────────────────┐
│ ID │ Scientific Claim                      │ Disposition │ Primary Source Evidence & Corrective Action Taken           │
├────┼───────────────────────────────────────┼─────────────┼─────────────────────────────────────────────────────────────┤
│ C01│ "ACME CFI-G measured lunar-gravity    │ CORRECTED   │ DISPROVED & CORRECTED. NASA PSI record PSI-159 confirms     │
│    │ flame spread and proved partial-g     │             │ CFI-G is 'Cool Flames Investigation with Gases'. Tested in  │
│    │ peak flammability on orbit."          │             │ microgravity (CIR rack on ISS, ~10⁻⁶g), studying low-temp   │
│    │                                       │             │ gaseous fuel (ethane/propane) cool flames. It did NOT test  │
│    │                                       │             │ lunar gravity or solid material flame spread. Replaced with │
│    │                                       │             │ correct CFI-G description.                                  │
├────┼───────────────────────────────────────┼─────────────┼─────────────────────────────────────────────────────────────┤
│ C02│ "ACME E-FIELD used electric body      │ VERIFIED /  │ CORRECTED TERMINOLOGY. PSI-22 confirms E-FIELD applied      │
│    │ forces to mimic partial-gravity       │ CORRECTED   │ electric fields (up to 10 kV) to introduce ion-driven body  │
│    │ acceleration on coflow flames."       │             │ forces into non-buoyant diffusion flames. Correctly labeled │
│    │                                       │             │ as an electrical proxy for buoyant draft, NOT an actual     │
│    │                                       │             │ lunar or martian gravity experiment.                        │
├────┼───────────────────────────────────────┼─────────────┼─────────────────────────────────────────────────────────────┤
│ C03│ "SIBAL flame spread equation exhibits │ REMOVED     │ PERMANENTLY REMOVED FROM ACCEPTED SPECIFICATION. The code-  │
│    │ an empirical ±14% predictive          │             │ base lacks a verified training dataset, regression weights, │
│    │ uncertainty bound."                   │             │ and uncertainty calculation. SIBAL is correctly identified  │
│    │                                       │             │ as a test fabric (cotton/fiberglass), and any simulator     │
│    │                                       │             │ math is re-classified as an uncalibrated heuristic proxy.   │
├────┼───────────────────────────────────────┼─────────────┼─────────────────────────────────────────────────────────────┤
│ C04│ "2.45 psi is a universal NASA         │ CORRECTED   │ SOURCED & CONTEXTUALIZED. Sourced to NASA-STD-3001, Vol 2,  │
│    │ atmospheric hypoxia requirement."     │             │ Rev D, Sec 6.1 [V2 6005]. 2.45 psi is not universal; nominal│
│    │                                       │             │ pO₂ range is 19.0–23.7 kPa (2.76–3.44 psi). The 16.0 kPa    │
│    │                                       │             │ (2.32 psi) floor applies to contingency depressurization.   │
├────┼───────────────────────────────────────┼─────────────┼─────────────────────────────────────────────────────────────┤
│ C05│ "FM2 and LUCI are completed flight    │ CORRECTED   │ CLASSIFIED AS PENDING / CONCEPTUAL. NASA PSI has zero       │
│    │ datasets archived in NASA PSI."       │             │ datasets for FM2 or LUCI. FM2 is a planned payload for future│
│    │                                       │             │ Artemis CLPS commercial lunar landers; LUCI is a concept.   │
│    │                                       │             │ Reclassified as `EVIDENCE GAP / PLANNED FLIGHT`.            │
├────┼───────────────────────────────────────┼─────────────┼─────────────────────────────────────────────────────────────┤
│ C06│ "Spherical blue diffusion flames form │ VERIFIED    │ VERIFIED. Flight measurements from FLEX (PSI-69), BASS-II   │
│    │ in microgravity due to absence of     │             │ (PSI-25), and drop tower tests demonstrate spherical        │
│    │ buoyant convection."                  │             │ geometry governed by molecular diffusion.                   │
├────┼───────────────────────────────────────┼─────────────┼─────────────────────────────────────────────────────────────┤
│ C07│ "Low-temperature cool flames continue │ VERIFIED    │ VERIFIED. Discovered during FLEX droplet investigations in  │
│    │ burning after visible extinction."    │             │ the CIR (PSI-69 / PSI-39). Formal NASA publication DOI:     │
│    │                                       │             │ 10.60555/mbq8-0451.                                         │
├────┼───────────────────────────────────────┼─────────────┼─────────────────────────────────────────────────────────────┤
│ C08│ "Exploration Atmosphere (34% O₂,      │ VERIFIED    │ VERIFIED. Documented in NASA/TP-2013-217380. Elevated O₂   │
│    │ 8.2 psi) lowers Limiting Oxygen       │             │ mole fraction reduces ignition delay and lowers material LOI│
│    │ Index (LOI) of materials."            │             │ compared to standard 21% sea-level air.                     │
├────┼───────────────────────────────────────┼─────────────┼─────────────────────────────────────────────────────────────┤
│ C09│ "There is a severe lack of partial-   │ VERIFIED    │ VERIFIED. Confirmed by NASA Space Apps 2026 challenge brief.│
│    │ gravity combustion data in PSI."      │             │ Orbital platforms (ISS) only provide microgravity (~10⁻⁶g). │
│    │                                       │             │ Lunar/Martian surface fire data represents an open frontier.│
├────┼───────────────────────────────────────┼─────────────┼─────────────────────────────────────────────────────────────┤
│ C10│ "In-browser particle visualizers      │ CORRECTED   │ RECLASSIFIED AS ILLUSTRATIVE. In-browser particle canvas    │
│    │ represent validated combustion CFD."  │             │ and WebGL shaders are explicitly designated as illustrative │
│    │                                       │             │ morphological models, not computational fluid dynamics.     │
└────┴───────────────────────────────────────┴─────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Forensic Evaluations

### 3.1. Forensic Audit of Partial-Gravity Flame Spread Claims (C01, C02, C09)
- **Previous Erroneous Claim:** The previous documentation claimed that ACME CFI-G measured partial-gravity combustion in lunar conditions on the ISS and proved an acceleration of flame spread.
- **The Physical Truth:**
  1. The **Combustion Integrated Rack (CIR)** on the ISS operates under continuous microgravity freefall ($\sim 10^{-6}\text{g}$).
  2. The **CFI-G investigation (`PSI-159`)** stands for *Cool Flames Investigation with Gases*. Its objective was testing n-alkane gaseous fuels (ethane, propane, butane) to observe low-temperature chemical kinetics without buoyancy.
  3. The only ACME experiment that investigated gravity-like body forces was **E-FIELD (`PSI-22`)**, which applied high-voltage DC electric fields (up to $10\ \text{kV}$) to generate an ion wind (chemi-ion body forces $F = qE$) that forced flame acceleration mimicking convective drafts.
  4. **Parabolic flight data** (KC-135 / Zero-G aircraft) provided brief $\sim 20$-second windows of $0.16\text{g}$ and $0.38\text{g}$, but these datasets suffer from g-jitter ($\pm 0.05\text{g}$) and transitional transients.
  5. **Conclusion:** Actual long-duration lunar and martian partial-gravity combustion data **does not exist in PSI**. Any partial-gravity flame spread prediction in PYRO-SI must be explicitly labeled as an **exploratory theoretical scenario**, NOT a measured NASA dataset.

### 3.2. Forensic Audit of SIBAL Spread Equation & $\pm 14\%$ Uncertainty (C03)
- **Previous Erroneous Claim:** The simulator documentation cited an empirical SIBAL flame spread equation with an asserted $\pm 14\%$ uncertainty envelope.
- **The Physical Truth:**
  1. **SIBAL** (Standard Interface for Burning and Loss) is a real NASA cellulosic/fiberglass blend material ($75\%$ cotton / $25\%$ fiberglass, surface density $\sim 18\ \text{mg/cm}^2$) developed by NASA Glenn Research Center (Dr. Gary Ruff, Dr. Sandra Olson, Dr. David Urban) specifically for Saffire and BASS flammability screening.
  2. While experimental data points for SIBAL burning rates were logged in Saffire-I (`PSI-98`) and BASS-II (`PSI-25`), **no published NASA empirical formula with a universal $\pm 14\%$ uncertainty was calibrated or evaluated in this software repository**.
  3. Inventing an error bound ($\pm 14\%$) without reproducible validation violates scientific integrity.
  4. **Corrective Action:** The claimed equation and the $\pm 14\%$ uncertainty claim are **completely removed from the accepted scientific requirements**. The simulator's bounding curves are re-designated as **exploratory educational models derived from classical De Ris thin-fuel heat balance theory**, with transparent disclosure of non-calibration.

### 3.3. Forensic Audit of NASA-STD-3001 and Hypoxia Thresholds (C04)
- **Previous Erroneous Claim:** Stated that $2.45\ \text{psi}$ is a universal NASA hypoxia standard.
- **The Official Standard Reference:**
  - **Standard:** NASA-STD-3001, Volume 2, Revision D: *NASA Space Flight Human-System Standard: Human Factors, Habitability, and Environmental Health*.
  - **Section:** 6.1 (Internal Atmosphere).
  - **Requirement `[V2 6004]` (Total Pressure):** Nominal cabin pressure shall be maintained within mission-specific operational boundaries (e.g., $101.3\ \text{kPa}$ / $14.7\ \text{psia}$ for ISS; $56.5\ \text{kPa}$ / $8.2\ \text{psia}$ for Artemis Exploration Atmosphere).
  - **Requirement `[V2 6005]` (Oxygen Partial Pressure):**
    - Nominal operational $p\text{O}_2$: $19.0\ \text{kPa}$ to $23.7\ \text{kPa}$ ($2.76\ \text{psi}$ to $3.44\ \text{psi}$).
    - Minimum emergency / contingency decompression floor: $16.0\ \text{kPa}$ ($2.32\ \text{psi}$).
  - **The Source of $2.45\ \text{psi}$ ($16.9\ \text{kPa}$):** Corresponds to an equivalent altitude of approximately $3,000\ \text{m}$ ($10,000\ \text{ft}$), representing the standard threshold where supplemental oxygen is required in military aviation. It is NOT the nominal NASA spacecraft life support threshold.
  - **Corrective Action:** Corrected in all specifications to cite **NASA-STD-3001 Vol 2 [V2 6005]** with the exact nominal range ($2.76 - 3.44\ \text{psi}$) and the contingency floor ($2.32\ \text{psi}$).

---

## 4. Governance Contract for All Future Deliverables

1. Every numerical display in the UI must specify its provenance tier: `MEASURED`, `REPORTED`, `DERIVED`, `MODELLED`, `ILLUSTRATIVE`, or `UNKNOWN`.
2. No promotional badges (e.g., green checkmarks) may be used unless mapped directly to a specific verified flight file in NASA PSI.
3. Every mathematical model must display its theoretical assumptions, boundary conditions, and limitations.
