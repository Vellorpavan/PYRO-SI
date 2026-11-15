# GODEYE // PYRO-SI — Phase 2.1 NASA Standards Verification & Correction

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-STD-002  
**Version:** 1.0 (Phase 2.1 Verified Standards Baseline)  
**Standard Authority:** NASA-STD-3001 Volume 2 Revision F (July 14, 2026), NASA-STD-6001B  

---

## 1. Executive Summary & Forensic Correction

An independent standards audit was conducted on all atmospheric life-support citations within **GODEYE // PYRO-SI**. 

The Phase 2 report erroneously cited **NASA-STD-3001 Volume 2 Revision D** as the "current applicable standard." This was factually incorrect. On **July 14, 2026**, the NASA Office of the Chief Health and Medical Officer (OCHMO) officially approved and published **NASA-STD-3001, Volume 2, Revision F** (*NASA Space Flight Human-System Standard: Human Factors, Habitability, and Environmental Health*), superseding Revision E (April 2023) and Revision D (February 2022).

This document establishes the verified source text, section numbers, table identifiers, and exact physiological boundaries under **Revision F (July 14, 2026)**, preserves the historical lineage of earlier revisions, and enforces the strict boundary separating human physiological requirements from material flammability screening.

---

## 2. Standard History & Revision Lineage

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              NASA-STD-3001 VOLUME 2 REVISION CHRONOLOGY                                │
├──────────────┬───────────────┬────────────────────────────────────────────────────────────────────────┤
│ Revision     │ Date          │ Historical Context & Atmospheric Evolution                             │
├──────────────┼───────────────┼────────────────────────────────────────────────────────────────────────┤
│ Baseline     │ March 2009    │ Initial volume release; broad pressure ranges (20.7–103 kPa).          │
├──────────────┼───────────────┼────────────────────────────────────────────────────────────────────────┤
│ Revision A   │ Feb 2014      │ Refined cabin acoustic and lighting standards.                         │
├──────────────┼───────────────┼────────────────────────────────────────────────────────────────────────┤
│ Revision B   │ Aug 2015      │ Codified Section 6.2 with [V2 6004] (Total Pressure) & [V2 6005] (O₂). │
├──────────────┼───────────────┼────────────────────────────────────────────────────────────────────────┤
│ Revision C   │ Jan 2020      │ Enhanced exploration atmosphere trades for Gateway and Orion.          │
├──────────────┼───────────────┼────────────────────────────────────────────────────────────────────────┤
│ Revision D   │ Feb 2022/2023 │ Re-indexed requirements to [V2 6002] (Diluent), [V2 6003] (O₂),       │
│              │               │ [V2 6006] (Total Pressure). Defined Table 6.2-1 inspired limits.       │
├──────────────┼───────────────┼────────────────────────────────────────────────────────────────────────┤
│ Revision E   │ April 2023    │ Updated suited EVA pre-breathe and decompression sickness guidelines.  │
├──────────────┼───────────────┼────────────────────────────────────────────────────────────────────────┤
│ Revision F   │ July 14, 2026 │ CURRENT APPLICABLE STANDARD. Formalized long-duration lunar/Mars       │
│ (CURRENT)    │               │ habitat atmospheric limits, contingency suited CO₂ rules, and dust.    │
└──────────────┴───────────────┴────────────────────────────────────────────────────────────────────────┘
```

> [!WARNING]
> **Directive:** Revision D and Revision E are obsolete superseded revisions. In all code comments, documentation, UI labels, and provenance records, **Revision F (Approved July 14, 2026)** is the sole current applicable standard. Historical references to Revision B/C (`[V2 6004]`, `[V2 6005]`) or Revision D/E are preserved strictly for archaeological provenance.

---

## 3. Forensic Requirement Verification (NASA-STD-3001 Rev F)

### 3.1. Requirement [V2 6002] — Inert Diluent Gas
- **Document Location:** Section 6.2 (Internal Atmosphere), Subsection 6.2.1.
- **Wording / Requirement:** Cabin atmospheric composition shall contain at least 30% diluent gas, assuming the balance is oxygen.
- **Correction in Phase 2.2:** Excised the unsupported condition that this requirement only applies to missions exceeding 14 days. The requirement applies universally to cabin atmospheres with oxygen balance.
- **Gas Mixture Modeling:** The simulator supports explicit multi-component gas fractions (e.g. `diluent`, `n2`, `co2`). When explicit fractions are omitted, an explicit binary mixture assumption (`diluent = 100 - FIO2`) is recorded in the provenance metadata.
- **Physiological Purpose:**
  1. Prevents absorption atelectasis (collapse of pulmonary alveoli due to complete gas absorption behind obstructed bronchioles).
  2. Moderates gas heat capacity and thermal transfer.
- **Engineering Baseline:** Gaseous nitrogen ($\text{N}_2$) is the primary standard diluent. In human-rated spacecraft, habitats maintain a minimum of **$30.0\%$ inert diluent gas by volume**.
- **Compliance Status:**
  - **ISS Nominal Standard:** $79.0\%\ \text{N}_2$ ($\ge 30.0\%$) $\implies$ **COMPLIANT**.
  - **Artemis Lunar Base Camp (EAM):** $66.0\%\ \text{N}_2$ ($\ge 30.0\%$) $\implies$ **COMPLIANT**.
  - **Lunar Gateway Cabin:** $70.0\%\ \text{N}_2$ ($\ge 30.0\%$) $\implies$ **COMPLIANT**.
  - **EVA EMU Spacesuit Loop:** $0.0\%\ \text{N}_2$ ($100.0\%\ \text{O}_2$) $\implies$ **SPECIAL SUITED EXCEPTION** (pure O₂ loop requires validated denitrogenation prebreathe protocols).

---

### 3.2. Requirement [V2 6003] — $\text{O}_2$ Partial Pressure Range for Crew Exposure
- **Document Location:** Section 6.2 (Internal Atmosphere), Subsection 6.2.2 & **Table 6.2-1**.
- **Wording / Requirement:** The system shall maintain the inspired oxygen partial pressure ($\text{PIO}_2$) in accordance with Table 6.2-1 (*Inspired Oxygen Partial Pressure Exposure Ranges*).
- **Physical Law & Calculation:**
  Inspired oxygen partial pressure in the human airway is calculated accounting for tracheal water-vapor saturation ($47\text{ mmHg} = 6.27\text{ kPa}$ at core body temperature $37^\circ\text{C}$):
  $$\text{PIO}_2 = (P_B - 47\text{ mmHg}) \times \text{FIO}_2$$
  Ambient dry-gas oxygen partial pressure is evaluated separately:
  $$p\text{O}_{2, \text{ambient}} = P_B \times \left(\frac{\%O_2}{100}\right)$$

#### Table 6.2-1 Verified Exposure Boundaries (NASA-STD-3001 Rev F):

| Physiological Category | Inspired $\text{PIO}_2$ (mmHg) | Inspired $\text{PIO}_2$ (kPa) | Inspired $\text{PIO}_2$ (psia) | Ambient Dry $p\text{O}_2$ (kPa) | Operational Meaning & Exposure Qualifications |
|:-----------------------|:------------------------------:|:-----------------------------:|:------------------------------:|:-------------------------------:|:---------------------------------------------|
| **Normoxic Target (Indefinite Exposure)** | **145 – 155 mmHg** | **19.3 – 20.7 kPa** | **2.80 – 3.00 psia** | **18.0 – 23.5 kPa** | **Nominal physiological baseline.** Zero hypoxia; zero hyperoxic pulmonary toxicity; unrestricted mission duration. |
| **Mild Hypoxia (Operational Exploration)** | **127 – 144 mmHg** | **16.9 – 19.3 kPa** | **2.46 – 2.80 psia** | **17.5 – 19.3 kPa** | Permissible for qualified exploration atmospheres (e.g. Artemis EAM: $8.2\text{ psia}$ / $34\%\ \text{O}_2 \implies \text{PIO}_2 \approx 128.2\text{ mmHg}$) to mitigate decompression sickness; causes subtle night vision reduction; **NOT the normoxia target!** |
| **Moderate Hypoxia Contingency** | **105 – 127 mmHg** | **14.0 – 16.9 kPa** | **2.03 – 2.46 psia** | **15.0 – 17.5 kPa** | Contingency operations only; duration-limited; degraded physical and cognitive performance. |
| **Acute Hypoxia Emergency** | **<105 mmHg** | **<14.0 kPa** | **<2.03 psia** | **<15.0 kPa** | **NON-COMPLIANT.** Acute crew impairment, cognitive collapse, loss of consciousness emergency. |
| **Mild Hyperoxia Limit** | **155 – 225 mmHg** | **20.7 – 30.0 kPa** | **3.00 – 4.35 psia** | **23.5 – 32.0 kPa** | Permissible for short to medium duration; extended exposure risks oxidative lung irritation and delayed atelectasis. |
| **Severe Hyperoxia / Toxicity** | **>225 mmHg** | **>30.0 kPa** | **>4.35 psia** | **>32.0 kPa** | Strictly duration-limited (EVA $100\%\ \text{O}_2$ pre-breathe or hyperbaric DCS treatment only). |

---

### 3.3. Requirement [V2 6006] — Total Pressure Tolerance Range for Indefinite Crew Exposure
- **Document Location:** Section 6.2 (Internal Atmosphere), Subsection 6.2.3.
- **Wording / Requirement:** The system shall maintain total cabin pressure within the allowable range for indefinite human exposure:
  $$\mathbf{34.5\text{ kPa} < \text{pressure} \le 103.0\text{ kPa}} \quad (5.004\text{ psia} < \text{pressure} \le 14.939\text{ psia})$$
- **Correction in Phase 2.2:** Lower boundary is strictly greater than $34.5\text{ kPa}$. Pressure of exactly $34.5\text{ kPa}$ is non-compliant; $34.6\text{ kPa}$ is compliant. Upper boundary of exactly $103.0\text{ kPa}$ is compliant; $103.1\text{ kPa}$ is non-compliant.
- **Compliance Status:**
  - **ISS Nominal:** $14.7\text{ psia}$ ($101.35\text{ kPa}$) $\implies$ **NOMINAL COMPLIANT**.
  - **Artemis Lunar Base (EAM):** $8.2\text{ psia}$ ($56.54\text{ kPa}$) $\implies$ **NOMINAL COMPLIANT** ($34.5 < 56.54 \le 103.0\text{ kPa}$).
  - **Boundary Minimum ($34.5\text{ kPa}$):** $\implies$ **NON-COMPLIANT** (fails strict inequality).
  - **Boundary Valid ($34.6\text{ kPa}$):** $\implies$ **COMPLIANT**.
  - **Boundary Maximum ($103.0\text{ kPa}$):** $\implies$ **COMPLIANT**.

---

## 4. The Critical Boundary: Physiological Life Support vs. Material Flammability

A critical finding mandated by the audit is that **human physiological requirements must never be conflated with or substituted for material flammability thresholds**.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHYSIOLOGICAL COMPLIANCE vs. MATERIAL FLAMMABILITY HAZARD                       │
├────────────────────────────────────────┬───────────────────────────────────────────────────────────────┤
│ NASA-STD-3001 Rev F (Human Health)     │ NASA-STD-6001B (Material Flammability Screening)              │
├────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
│ Evaluates: Tracheal inspired PIO₂,     │ Evaluates: Ignition energy, upward flame propagation, char    │
│ hypoxia, hyperoxia, lung atelectasis.  │ formation, heat release rate, and Limiting Oxygen Index (LOI). │
├────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
│ Artemis EAM: 34% O₂ at 8.2 psi         │ Artemis EAM: 34% O₂ at 8.2 psi                                │
│ Ambient pO₂ = 19.22 kPa (144.2 mmHg)   │ Ambient oxygen fraction Y_O2 = 34.0%                          │
│ Inspired PIO₂ = 17.09 kPa (128.2 mmHg) │                                                               │
│                                        │                                                               │
│ VERDICT: TABLE 6.2-1 MILD HYPOXIA      │ VERDICT: EXTREME FLAMMABILITY HAZARD!                         │
│ Meets operational exploration criteria │ Standard aramid polymers (Nomex LOI ~28-30%) burn vigorously! │
│ for EVA DCS mitigation, but is BELOW   │ Flammability risk is elevated by >60% compared to ISS air!    │
│ the nominal normoxia target (145-155). │ Human mild hypoxia provides ZERO material fire protection.    │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────┘
```

### 4.1. Rules for Code and UI Implementation:
1. `evaluatePhysiologicalAtmosphere()` in `physics-model.js` checks **ONLY** NASA-STD-3001 Rev F criteria (`isNormoxic`, `isHypoxic`, `isHyperoxic`, `hasSufficientDiluent`, `isTotalPressureCompliant`).
2. `calculateFlammability()` checks **MATERIAL FLAMMABILITY** under NASA-STD-6001B criteria (`loi`, `spreadIndex`, `riskScore`, `rates`).
3. The UI must present two separate cards or readouts:
   - Card A: **ATMOSPHERIC PHYSIOLOGY (NASA-STD-3001 REV F)**
   - Card B: **FLAMMABILITY HAZARD INDEX (NASA-STD-6001B)**
4. Never state that an atmosphere is "fire safe" because it meets NASA-STD-3001.

---

## 5. Summary of Exact Code & Document Corrections Required

| Target File | Prior / Erroneous Text | Corrected Text (Rev F Baseline) | Rationale |
|:------------|:-----------------------|:--------------------------------|:----------|
| `src/modules/flammability-simulator/physics-model.js` | `NASA-STD-3001 Rev D` | `NASA-STD-3001 Rev F (July 14, 2026)` | Updates applicable standard to current published revision. |
| `src/modules/flammability-simulator/presets.js` | `NASA-STD-3001: REVISION D COMPLIANT` | `NASA-STD-3001: REVISION F COMPLIANT` | Aligns UI badge with Rev F. |
| `src/data/reference/copilot-knowledge.json` | `NASA-STD-3001 Rev D` | `NASA-STD-3001 Rev F` | Updates knowledge engine standard citation. |
| `src/data/reference/habitat-nodes.json` | `NASA-STD-3001 Rev D` | `NASA-STD-3001 Rev F` | Updates habitat node metadata. |
| `index.html` | `NASA-STD-3001 REV D` | `NASA-STD-3001 REV F` | Updates UI section header and badge. |
| `docs/SCIENTIFIC_REQUIREMENTS.md` | `NASA-STD-3001 Rev D` | `NASA-STD-3001 Rev F` | Replaces all references to Rev D as current. |
| `docs/SCIENTIFIC_CLAIMS_CORRECTIONS.md` | `NASA-STD-3001 Rev D` | `NASA-STD-3001 Rev F` | Formally notes Rev F approval date (July 14, 2026). |
| `tests/scientific/physiological-separation.test.js` | `NASA-STD-3001 Rev D` | `NASA-STD-3001 Rev F` | Updates test assertions and failure messages. |
| `tests/scientific/ui-labels.test.js` | `NASA-STD-3001 REV D` | `NASA-STD-3001 REV F` | Audits index.html for Rev F string. |
