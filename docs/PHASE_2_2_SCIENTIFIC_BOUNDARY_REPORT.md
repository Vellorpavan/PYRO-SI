# GODEYE // PYRO-SI — Phase 2.2 Scientific Boundary Report

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-P2-2-SBR-001  
**Version:** 1.0 (Audited Final Baseline)  
**Role:** Senior Scientific Software Auditor, NASA Standards Researcher, Combustion-Science Reviewer & Test Engineer  
**Standard Authorities:** NASA SPD-41a, NASA-STD-3001 Volume 2 Revision F (July 14, 2026), NASA-STD-6001B  
**Verdict:** **PASS**

---

## 1. Executive Summary

This report establishes the verified scientific boundary corrections implemented in **Phase 2.2 (Scientific Boundary Corrections)** of GODEYE // PYRO-SI following independent peer review.

### Core Corrections Completed:
1. **NASA-STD-3001 Rev F Normative Mappings Corrected:**
   - **`[V2 6002]` (Diluent):** Excised the unsupported condition that the 30% diluent gas rule applies only to missions exceeding 14 days. Implemented support for explicit gas composition (e.g. `diluent`, `n2`, `co2`) and documented the binary mixture assumption when unmeasured.
   - **`[V2 6003]` (Inspired Oxygen $\text{PIO}_2$):** Implemented Table 6.2-1 inspired oxygen equation:
     $$\text{PIO}_2 = (P_B - 47\text{ mmHg}) \times \text{FIO}_2$$
     Evaluated the strict Normoxia Target ($145 - 155\text{ mmHg}$ / $19.33 - 20.66\text{ kPa}$). Implemented specified mild-hypoxia, moderate-hypoxia, acute-hypoxia, and hyperoxia exposure categories with explicit duration qualifications. Separated ambient dry-gas $pO_2$ and inspired $\text{PIO}_2$ as distinct quantities.
   - **`[V2 6006]` (Total Pressure):** Corrected the total cabin pressure interval to strictly $34.5\text{ kPa} < P \le 103.0\text{ kPa}$.
2. **Reassessment of Artemis Exploration Atmosphere ($8.2\text{ psia}$, $34\%\ \text{O}_2$):**
   - Recalculated ambient dry-gas $pO_2 = 19.22\text{ kPa}$ ($144.18\text{ mmHg}$).
   - Recalculated inspired tracheal $\text{PIO}_2 = (424.06 - 47) \times 0.34 = 128.20\text{ mmHg}$ ($17.09\text{ kPa}$).
   - Classified as **`MILD_HYPOXIA`** under Table 6.2-1 ($127 - 144\text{ mmHg}$). **Permanently eliminated the claim that $128.2\text{ mmHg}$ is normoxic.**
   - Maintained strict physical separation: Nomex burns ($0.8\text{ mm/s}$), flammability risk is $85\%$ (`CRITICAL HAZARD`).
3. **Zero-Gravity Combustion Model Domain Governance:**
   - Excised the false assumption that $V_{\text{effective}} = 0$ results in automatic flame extinction.
   - Conceptually decomposed combustion into 4 distinct physical mechanisms: buoyant convection, forced convection, molecular diffusion transport, and radiative/conductive heat loss.
   - For zero-flow microgravity ($g = 0$, $V_{\text{forced}} < 0.5\text{ cm/s}$), the 1D convective De Ris proxy returns an explicit **`MODEL_OUT_OF_SCOPE`** status with regime `QUIESCENT_DIFFUSION_GOVERNED`, instead of inventing an artificial extinction result.
4. **Automated Verification:**
   - Executed full test suite (`node tests/test-runner.js`): **600 passed, 0 failed (100% PASS)** with exit code `0`.

---

## 2. Corrected NASA-STD-3001 Rev F Standards Mapping

### 2.1. Requirement `[V2 6002]` — Inert Gas Diluent
- **Authoritative Source:** NASA-STD-3001, Volume 2, Revision F (July 14, 2026), Section 6.2.1.
- **Normative Text:** *"Cabin atmospheric composition shall contain at least 30% diluent gas, assuming the balance is oxygen."*
- **Audit Findings & Corrections:**
  - *Correction 1:* The claim in earlier documentation that this requirement only applies to missions exceeding 14 days was unsupported by the Rev F text and has been excised. The 30% diluent requirement applies universally to cabin habitability.
  - *Correction 2:* Previously, all non-oxygen gas was automatically equated to inert diluent. The implementation now accepts explicit multi-gas inputs (`{ o2, psi, diluent, n2, co2 }`). When explicit non-oxygen species are not provided, an explicit binary mixture assumption (`diluent = 100 - FIO2`) is recorded in the provenance metadata.
- **Implementation Mapping:**
  ```javascript
  const isBinaryAssumed = (diluent === undefined && n2 === undefined);
  const inertGasPct = diluent !== undefined ? Number(diluent) : (n2 !== undefined ? Number(n2) : Math.max(0.0, 100.0 - o2Val));
  const hasSufficientDiluent = inertGasPct >= 30.0;
  ```

### 2.2. Requirement `[V2 6003]` — Inspired Oxygen Partial Pressure ($\text{PIO}_2$)
- **Authoritative Source:** NASA-STD-3001, Volume 2, Revision F (July 14, 2026), Section 6.2.2 & Table 6.2-1.
- **Normative Text:** The system shall maintain inspired oxygen partial pressure in accordance with Table 6.2-1 (*Inspired Oxygen Partial Pressure Exposure Ranges*).
- **Physical Formulation:**
  $$\text{PIO}_2 = (P_B - 47\text{ mmHg}) \times \text{FIO}_2$$
  where $47\text{ mmHg}$ ($6.27\text{ kPa}$) represents saturated water vapor pressure in the human trachea at core body temperature ($37^\circ\text{C}$).
- **Table 6.2-1 Exposure Categories & Duration Qualifications:**

| Physiological Category | Inspired $\text{PIO}_2$ (mmHg) | Inspired $\text{PIO}_2$ (kPa) | Exposure Duration & Operational Qualifications |
|:---|:---:|:---:|:---|
| **Acute Hypoxia** | $<105.0\text{ mmHg}$ | $<14.00\text{ kPa}$ | Emergency contingency only; acute cognitive impairment, loss of consciousness risk. |
| **Moderate Hypoxia** | $105.0 - 127.0\text{ mmHg}$ | $14.00 - 16.93\text{ kPa}$ | Contingency operations only; duration-limited; degraded physical and mental performance. |
| **Mild Hypoxia** | $127.0 - 144.9\text{ mmHg}$ | $16.93 - 19.33\text{ kPa}$ | Permissible for qualified exploration atmospheres (e.g. Artemis 34% O₂ at 8.2 psia yields $\text{PIO}_2 \approx 128.2\text{ mmHg}$) to mitigate EVA decompression sickness; causes subtle night vision reduction; requires program medical qualification. **NOT the normoxia target!** |
| **Normoxia Target** | **$145.0 - 155.0\text{ mmHg}$** | **$19.33 - 20.66\text{ kPa}$** | **Optimal physiological baseline.** Indefinite mission duration; zero hypoxia; zero hyperoxic pulmonary toxicity. |
| **Mild Hyperoxia** | $155.1 - 225.0\text{ mmHg}$ | $20.66 - 30.00\text{ kPa}$ | Permissible for short to medium duration; extended exposure risks oxidative lung irritation and delayed atelectasis. |
| **Severe Hyperoxia** | $>225.0\text{ mmHg}$ | $>30.00\text{ kPa}$ | Strictly duration-limited (EVA $100\%\ \text{O}_2$ prebreathe or medical hyperbaric treatment only); pulmonary atelectasis and CNS toxicity risk. |

- **Operational Disclaimer:** NASA-STD-3001 Rev F defines physiological safety boundaries, but does NOT by itself constitute EVA prebreathe eligibility certification or formal mission operational flight clearance. Suited EVA operations require validated denitrogenation protocols (e.g. NASA EVA Prebreathe Protocols, tissue nitrogen washout modeling).

### 2.3. Requirement `[V2 6006]` — Total Atmospheric Pressure
- **Authoritative Source:** NASA-STD-3001, Volume 2, Revision F (July 14, 2026), Section 6.2.3.
- **Normative Interval:**
  $$\mathbf{34.5\text{ kPa} < \text{pressure} \le 103.0\text{ kPa}} \quad (5.004\text{ psia} < \text{pressure} \le 14.939\text{ psia})$$
- **Boundary Verification:**
  - Lower boundary is strictly greater than $34.5\text{ kPa}$. Pressure of exactly $34.5\text{ kPa}$ is `NON_COMPLIANT_LOW_PRESSURE`.
  - Pressure of $34.6\text{ kPa}$ is `COMPLIANT`.
  - Upper boundary of exactly $103.0\text{ kPa}$ is `COMPLIANT`.
  - Pressure of $103.1\text{ kPa}$ is `NON_COMPLIANT_HIGH_PRESSURE`.

---

## 3. Reassessment of the Artemis Exploration Atmosphere Example

### 3.1. Primary Thermodynamic & Respiratory Quantities
- **Input Atmosphere:** Total pressure $P_B = 8.2\text{ psia}$ ($56.537\text{ kPa}$ / $424.06\text{ mmHg}$); oxygen fraction $\text{FIO}_2 = 34.0\%$.
- **Ambient Dry-Gas Quantities:**
  - $p\text{O}_{2, \text{dry, psia}} = 8.2 \times 0.34 = 2.788\text{ psia}$
  - $p\text{O}_{2, \text{dry, kPa}} = 2.788 \times 6.894757 = 19.222\text{ kPa}$
  - $p\text{O}_{2, \text{dry, mmHg}} = 19.222 \times 7.500617 = 144.18\text{ mmHg}$
- **Tracheal Inspired Oxygen Partial Pressure ($\text{PIO}_2$):**
  $$\text{PIO}_2 = (424.06\text{ mmHg} - 47\text{ mmHg}) \times 0.34 = 377.06 \times 0.34 = \mathbf{128.20\text{ mmHg}} \quad (17.09\text{ kPa} / 2.479\text{ psia})$$

### 3.2. Explicit Scientific Clarifications
1. **$128.2\text{ mmHg}$ is MILD HYPOXIA, NOT NORMOXIA:**
   - The normative normoxia target is strictly **$145 - 155\text{ mmHg}$**.
   - Inspired $\text{PIO}_2 = 128.2\text{ mmHg}$ falls within the **Mild Hypoxia** category ($127 - 144\text{ mmHg}$).
   - Table 6.2-1 includes this range as an operationally qualified exploration regime (Artemis EAM) designed to reduce nitrogen tissue tension, thereby eliminating hours of astronaut pre-breathe decompression before donning $4.3\text{ psia}$ spacesuits.
   - Describing $128.2\text{ mmHg}$ as "normoxic" conflated the operational exploration atmosphere trade-off with the normative normoxia target.
2. **Material Flammability is Evaluated Completely Independently:**
   - In $34\%\ \text{O}_2$, the oxygen concentration exceeds the Limiting Oxygen Index of Nomex ($28 - 30\%$).
   - Nomex burns with an unassisted spread rate of $0.8\text{ mm/s}$, and the composite flammability hazard index is $85\%$ (**CRITICAL HAZARD**).
   - Human physiological adaptation to mild hypoxia provides zero material flame retardation.

---

## 4. Revised Zero-Gravity Combustion Model Behavior

### 4.1. Conceptual Decomposition of Combustion Transport Mechanisms
Combustion in spacecraft environments is governed by four distinct physical processes:
1. **Buoyant Convection ($V_{\text{buoyant}}$):**
   $$V_{\text{buoyant}} = 32.0 \cdot \sqrt{\frac{g}{1.0}}\text{ cm/s}$$
   Natural convection draft driven by gravitational acceleration acting on thermal density gradients. Zero in $0\text{g}$; $32\text{ cm/s}$ in Earth $1\text{g}$; $45.25\text{ cm/s}$ in $2\text{g}$ hypergravity.
2. **Forced Convection ($V_{\text{forced}}$):**
   Airflow velocity imposed by cabin environmental control and ventilation fans.
3. **Molecular Diffusion Transport ($D_{\text{molecular}}$):**
   Fickian species diffusion of oxygen into the reaction zone and combustion products ($CO_2$, $H_2O$) outward ($D_{\text{ox}} \sim 0.2 - 0.5\text{ cm}^2/\text{s}$). In quiescent microgravity ($V_{\text{effective}} = 0$), molecular diffusion is the sole mechanism supplying oxidizer.
4. **Radiative & Conductive Heat Losses ($Q_{\text{loss}}$):**
   In quiescent zero-g, long residence times allow radiative heat loss from soot and combustion gases to dominate. When radiative loss exceeds chemical heat release, spherical flames extinguish; under specific kinetics, low-temperature cool flames (500–800 K) persist.

### 4.2. Removal of Automatic Zero-G Extinction Fallacy
- **Audit Defect Corrected:** The prior implementation inferred that if $V_{\text{effective}} = 0$, flames automatically extinguish.
- **Physical Reality:** NASA microgravity flight experiments (e.g. ACME s-Flame `PSI-21` and FLEX `PSI-69`) prove that diffusion-controlled spherical flames can burn steadily in quiescent microgravity without forced flow.
- **Model Domain Governance:**
  - The 1D De Ris energy balance proxy was derived strictly for convective boundary layers ($V_{\text{effective}} \ge 1.0\text{ cm/s}$). It contains no terms for multidimensional molecular diffusion or radiative heat-loss equations.
  - When $g < 0.001$ and $V_{\text{forced}} < 0.5\text{ cm/s}$, the model returns:
    - `modelDomainStatus: 'MODEL_OUT_OF_SCOPE'`
    - `convectiveRegime: 'QUIESCENT_DIFFUSION_GOVERNED'`
    - `modelDomainNote: 'Quiescent microgravity (0g with zero or sub-convective flow <0.5 cm/s) is outside the domain of the 1D convective De Ris proxy. In the absence of convective flow, combustion is governed by molecular diffusion and radiative heat loss. Spaceflight experiments (ACME s-Flame PSI-21, FLEX PSI-69) demonstrate that diffusion flames can persist in zero-g without convective flow. Pure diffusion combustion is not calculated by convective boundary layer models.'`
  - When forced flow is present in $0\text{g}$ (e.g. $V_{\text{forced}} = 15\text{ cm/s}$), the model operates within its validated convective domain (`VALIDATED_CONVECTIVE_PROXY`, `FORCED_CONVECTION_DOMINATED`).
  - When natural convection is present in $1\text{g}$, the model operates in `BUOYANCY_DOMINATED`.
  - When input parameters are omitted, the model flags `INSUFFICIENT_MODEL_INPUTS`.

---

## 5. Automated Scientific Test Suite Execution

### 5.1. Execution Command & Summary
```bash
node tests/test-runner.js
```

### 5.2. Test Suite Results by Harness

```
=======================================================
       GODEYE // PYRO-SI — PHASE 2 VERIFICATION SUITE
=======================================================

[1/11] Flammability Physics Model Unit Tests ........... PASS (9 assertions)
[2/11] PSI Investigation Ranker Unit Tests ............. PASS (3 assertions)
[3/11] Partial-G Scientific Verification Tests ......... PASS (3 assertions)
[4/11] Scientific Equation Boundary Tests .............. PASS (23 assertions)
[5/11] Unit Conversion & Thermodynamic Tests ........... PASS (12 assertions)
[6/11] Dynamic Investigation Catalogue Tests ........... PASS (221 assertions)
[7/11] Missing Data & Fault Tolerance Tests ............ PASS (12 assertions)
[8/11] 7-Attribute Evidence Provenance Tests ........... PASS (267 assertions)
[9/11] Epistemic Evidence Classification Tests ......... PASS (13 assertions)
[10/11] Physiological vs Flammability Separation Tests .. PASS (29 assertions)
[11/11] UI Scientific Labels & Disclaimer Audit Tests ... PASS (8 assertions)
-------------------------------------------------------
Summary: 600 passed, 0 failed (100% PASS)
Exit Code: 0
-------------------------------------------------------
```

Documented in: [phase-2-2-validation-report.md](file:///Users/pavan/Desktop/PYRO-SI/tests/scientific/phase-2-2-validation-report.md).

---

## 6. Exact Source File Changes Ledger

| File Modified | Exact Changes Executed |
|:---|:---|
| `src/modules/flammability-simulator/physics-model.js` | 1. Implemented Table 6.2-1 inspired oxygen equation $\text{PIO}_2 = (P_B - 47\text{ mmHg}) \times \text{FIO}_2$.<br>2. Implemented Table 6.2-1 categories: Normoxia Target ($145 - 155\text{ mmHg}$), Mild Hypoxia ($127 - 144\text{ mmHg}$), Moderate Hypoxia ($105 - 127\text{ mmHg}$), Acute Hypoxia ($<105\text{ mmHg}$), Hyperoxia ($>155\text{ mmHg}$).<br>3. Corrected [V2 6006] strict pressure boundary ($34.5 < P \le 103.0\text{ kPa}$).<br>4. Excised 14-day restriction from [V2 6002]; added explicit gas composition parameter support.<br>5. Excised automatic zero-g extinction; decomposed combustion transport into 4 mechanisms; returned `MODEL_OUT_OF_SCOPE` for quiescent zero-g. |
| `src/modules/flammability-simulator/presets.js` | Updated physiological compliance card badge and description to display both ambient dry $pO_2$ and inspired tracheal $\text{PIO}_2$, labeling Normoxia Target ($145 - 155\text{ mmHg}$) vs Qualified Mild Hypoxia ($127 - 144\text{ mmHg}$) distinctly. |
| `index.html` | Updated line 888 to cite NASA-STD-3001 Rev F `[V2 6003]` Table 6.2-1 equation $\text{PIO}_2 = (P_B - 47\text{ mmHg}) \times \text{FIO}_2$ and normoxia target ($145 - 155\text{ mmHg}$). |
| `src/data/reference/copilot-knowledge.json` | Updated knowledge base for Artemis Moon and fire suppression to excise the zero-g automatic extinction claim, document the Table 6.2-1 $\text{PIO}_2$ calculation, and explain the mild-hypoxia exploration qualification. |
| `tests/scientific/physiological-separation.test.js` | Expanded assertions from 15 to 29 tests: checking $\text{PIO}_2$ equations, normoxia target, Artemis EAM mild hypoxia classification, strict pressure boundaries ($34.5\text{ kPa}$ fails, $34.6\text{ kPa}$ passes, $103.0\text{ kPa}$ passes, $103.1\text{ kPa}$ fails), and explicit diluent composition. |
| `tests/scientific/equation-boundaries.test.js` | Expanded assertions from 14 to 23 tests: checking quiescent $0\text{g}$ `MODEL_OUT_OF_SCOPE`, forced flow $0\text{g}$, natural $1\text{g}$, and missing model inputs. |
| `tests/scientific/unit-conversions.test.js` | Updated Artemis EAM assertions to verify inspired $\text{PIO}_2 \approx 128.2\text{ mmHg}$ and mild hypoxia classification. |

---

## 7. Remaining Limitations

1. **Multidimensional Fluid Dynamics:** The 1D De Ris convective formulation cannot model 3D recirculation eddies, wake geometries, or turbulent room flows. Certified NASA-STD-6001B laboratory screening is required for flight hardware qualification.
2. **Quiescent Microgravity Modeling:** Pure molecular diffusion transport and radiative quenching in zero-flow microgravity are outside the domain of the 1D convective proxy. Empirical spaceflight records (e.g. ACME s-Flame `PSI-21` and FLEX `PSI-69`) provide primary empirical ground truth.
3. **Partial-Gravity Flight Data Gap:** While the T'ien / Ferkul low-buoyancy curve models expected flame spread acceleration in lunar/martian partial gravity, definitive empirical validation awaits flight data from the Artemis FM2 / LUCI payload.

---

## 8. Final Audit Verdict

```
======================================================================
               PHASE 2.2 SCIENTIFIC AUDIT VERDICT: PASS
======================================================================
 [V2 6002] Diluent Gas Mapping: ...... VERIFIED (Universal >=30%, no 14-day limit)
 [V2 6003] PIO2 Equation & Target: ... VERIFIED (Table 6.2-1 PIO2 = (PB-47)*FIO2)
 [V2 6006] Strict Pressure Interval: . VERIFIED (34.5 kPa < P <= 103.0 kPa)
 Artemis EAM Reassessment: ........... VERIFIED (128.2 mmHg = MILD HYPOXIA)
 Zero-G Combustion Transport: ........ VERIFIED (No auto-extinction; 4 mechanisms)
 Model Domain Governance: ............ VERIFIED (MODEL_OUT_OF_SCOPE on quiescent 0g)
 Automated Test Execution: ............ PASS (600/600 tests, 100% pass rate)
 Ready for Next Phase: ............... YES (Awaiting user review)
======================================================================
```

**Next Step:** In strict compliance with your instructions, Phase 3 has not been started. The application and evidence base are parked and await your review before Phase 3 authorization.
