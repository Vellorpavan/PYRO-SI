# GODEYE // PYRO-SI — Phase 2.2.3 Final Model Reference and Material Test Correction Report

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-EVR-004  
**Milestone:** Phase 2.2.3 Final Model Reference & Material Test Correction  
**Audit Authority:** Independent NASA Standards Auditor, Combustion Scientist, and Scientific Software Verification Engineer  
**Baseline Status:** **OFFICIALLY FROZEN (with Flight Qualification Scope Disclaimer)**

---

## 1. Executive Summary & Verification Outcome

This audit report closes the two remaining evidentiary discrepancies identified in Phase 2.2.2 for **GODEYE // PYRO-SI**:
1. **De Ris (1969) Formulation & Paper Reference:** The literature reference has been corrected to its authentic publication title (*"Spread of a laminar diffusion flame"*) and verified DOI (`10.1016/S0082-0784(69)80407-8`). The erroneous claim that radiation was neglected in De Ris has been corrected: the original 1969 abstract explicitly includes radiation as heat loss at the flame sheet and heat gain at the fuel-bed surface. The closed-form solutions for thermally thin fuels ($V_f \propto 1/\tau$, linear in $\Delta T$) and thermally thick fuels ($V_f \propto V_a$, quadratic in $\Delta T$) have been documented, and the project's uncalibrated 1D phenomenological scaling proxy is explicitly distinguished from the analytical model. Any unverified mathematical detail is labeled `UNVERIFIED`.
2. **NASA-STD-6001B Test 1 Interpretation & Specimen Configuration:** The standard acceptance criteria have been aligned with the governing NASA standard: burn length must not exceed $15.0\text{ cm}$ ($6.0\text{ in}$) for all five (5) specimens, and zero flaming material transfer may ignite the K-10 indicator paper below the sample. The erroneous characterization of propagation $> 12\text{ in}$ ($30\text{ cm}$) as the general failure threshold has been excised ($12\text{ in}$ is the full specimen coupon length). Specimen configuration details—including hemmed/unhemmed edges, dimensions ($30\text{ cm} \times 5\text{ cm}$), 5 specimens, test atmosphere, and standard 25 s ignition dwell time—have been recorded. DuPont Nomex HT90-40 LOI ($28.0\% - 30.0\%\ \text{O}_2$) is explicitly presented as a conditional test range rather than a universal constant. The numerical spread rate ($0.8\text{ mm/s}$) is retained as `UNVERIFIED_MODELLED_PROXY` and composite hazard score ($85\%$) as `MODELLED_HEURISTIC`.
3. **Automated Verification:** The automated test runner has been expanded to **14 test suites**, achieving **756 passing assertions**, **0 failures**, and exit code **0**.
4. **Baseline Freeze & Scope Disclaimer:** The scientific evidence baseline is officially **FROZEN**. This freeze certifies evidentiary traceability, authentic standards mappings, and model disclosures; it **does NOT mean the uncalibrated 1D phenomenological model is independently validated or suitable for flight qualification.**

---

## 2. De Ris (1969) Reference & Formulation Audit

### 2.1. Paper Identification & Authentic DOI
* **Author:** J. de Ris (Factory Mutual Research Corporation)
* **Title:** *"Spread of a laminar diffusion flame"*
* **Publication:** *Twelfth Symposium (International) on Combustion*, The Combustion Institute, Pittsburgh, PA, 1969, pp. 241–252.
* **Authentic DOI:** `10.1016/S0082-0784(69)80407-8` *(corrected from the typographical -7 suffix in Phase 2.2.2)*.

### 2.2. Radiation Treatment Correction
* **Previous Erroneous Claim:** Phase 2.2.2 listed *"Gas-phase and solid-surface radiative heat losses neglected"* as an analytical assumption.
* **Ground Truth from De Ris (1969):** The abstract and analytical formulation explicitly include radiation:
  > *"Radiation is included as a heat loss at the flame sheet and a heat gain at the fuel-bed surface..."*
* **Corrected Codification:** De Ris explicitly treated radiant heat transfer by coupling flame-sheet radiative loss to fuel-surface radiative preheating, while also accounting for radiation loss to the ambient environment. The assumption list in `physics-model.js` and `docs/SCIENTIFIC_REQUIREMENTS.md` has been corrected:
  * *Assumption 6:* "Radiation is explicitly included as heat loss at the flame sheet and heat gain at the fuel-bed surface (NOT neglected)."

### 2.3. Original Analytical Formulations vs. Project Phenomenological Proxy
The original paper derived two distinct closed-form analytical solutions depending on the fuel's thermal thickness:

1. **Thermally Thin Solid Fuel Sheet ($\text{Bi} = h \tau / \lambda_s \ll 1$):**
   $$V_f = \frac{\sqrt{2} \lambda_g}{\rho_s c_s \tau} \left(\frac{T_f - T_v}{T_v - T_\infty}\right)$$
   * The solid is isothermal across its half-thickness $\tau$.
   * Thermal capacity per unit area is $\rho_s c_s \tau$.
   * Spread rate $V_f$ is **inversely proportional to solid thickness** and **linear** in the temperature driving difference $(T_f - T_v)$.
2. **Thermally Thick Solid Fuel Bed ($\text{Bi} = h \tau / \lambda_s \gg 1$):**
   $$V_f = V_a \frac{\lambda_g \rho_g c_{pg}}{\lambda_s \rho_s c_{ps}} \left(\frac{T_f - T_v}{T_v - T_\infty}\right)^2$$
   * Solid thermal penetration layer is much smaller than fuel thickness.
   * Spread rate $V_f$ is **independent of fuel thickness**, **proportional to opposed flow velocity $V_a$**, and **quadratic** in $(T_f - T_v) / (T_v - T_\infty)$.
3. **Project's Adapted Phenomenological Proxy in PYRO-SI:**
   * PYRO-SI does **not** solve De Ris's analytical eigenvalue boundary-value differential equations.
   * Instead, `physics-model.js` uses an adapted, simplified 1D phenomenological proxy:
     $$\text{spreadIndex} = \left(\frac{V_{\text{eff}}}{20.0}\right)^{0.5} \times \left(\frac{Y_{\text{O}_2}}{21.0}\right)^{1.6} \times \left(\frac{P}{14.7}\right)^{0.8} \times \left(\frac{g}{1.0}\right)^{0.15}$$
   * Calibrated strictly to a single flight anchor: SAFFIRE-I SIBAL thin fabric ($2.24\text{ mm/s}$ at $20\text{ cm/s}$ flow, $21.5\%\ \text{O}_2$).
   * **Unverified Detail Rule:** Any analytical parameter, property ratio, or boundary-layer derivation detail from De Ris (1969) not directly confirmed from the inspected source paper is explicitly designated **`UNVERIFIED`** rather than reconstructed from memory.

---

## 3. NASA-STD-6001B Test 1 Interpretation & Specimen Configuration

### 3.1. Standard Test 1 Acceptance Criteria
Under NASA-STD-6001B (*Flammability, Offgassing, and Compatibility Requirements and Test Procedures for Materials in Space Environments*), Test 1 is the standard upward flame propagation screening test. A material passes Test 1 if and only if **all five (5) specimens** satisfy both of the following acceptance criteria:
1. **Burn Length Criterion:** Burn length must not exceed **$15.0\text{ cm}$ ($6.0\text{ in}$)** from the bottom edge for any of the 5 specimens.
2. **Transfer Ignition Criterion:** There must be **no flaming drips or material transfer** that ignites the dry standard surgical cotton / K-10 indicator paper placed at the bottom of the test chamber directly beneath the specimen.

### 3.2. Failure Threshold Correction
* **Previous Error:** Previous descriptions stated failure as "propagation full length $> 12.0\text{ in} / 30.0\text{ cm}$".
* **Correction:** $12.0\text{ in}$ ($30.0\text{ cm}$) is the total length of the test specimen coupon. The general failure threshold under NASA-STD-6001B Test 1 is **burn length exceeding $15.0\text{ cm}$ ($6.0\text{ in}$)** on ANY of the 5 specimens or ignition of the indicator paper. A material that burns $16\text{ cm}$ fails Test 1 even if it extinguishes before reaching the top of the coupon.

### 3.3. Specimen Configuration Ledger
* **Dimensions:** $30.0\text{ cm} \times 5.0\text{ cm}$ ($12.0\text{ in} \times 2.0\text{ in}$), standard thickness as intended for use.
* **Sample Count:** Five (5) identical specimens per test condition; every specimen must independently pass.
* **Edge Condition:** Tested with hemmed or unhemmed edges as specified for the application. Edge hemming is critical for woven fabrics like Nomex HT90-40, as unhemmed edges can fray, allowing premature upward flame channeling along exposed yarn edges.
* **Mounting:** Vertical orientation clamped in standard specimen holder frames.
* **Test Atmosphere:** Tested at the worst-case operational environment (maximum operational oxygen concentration, worst-case operational pressure).
* **Ignition Method:** Standard chemical or gas burner flame applied to the lower edge for a dwell time of $25\text{ seconds}$ delivering specified thermal flux ($\sim 2000\text{ kJ/m}^2$).

### 3.4. Nomex LOI Non-Universality
* Nomex Limiting Oxygen Index (LOI) is **not a universal constant**.
* While commonly referenced as $28.0\% - 30.0\%\ \text{O}_2$ (per ASTM D2863 and NASA TP-2007-213777), measured LOI depends on:
  * Fabric areal weight (oz/yd² or g/m²).
  * Yarn count and weave density.
  * Edge hemming finish (hemmed vs raw cut).
  * Ambient relative humidity and specimen moisture preconditioning.
  * Test apparatus chimney geometry.
* In terrestrial air ($21.0\%\ \text{O}_2$, $14.7\text{ psia}$): Nomex HT90-40 self-extinguishes with burn length typically $< 3.8\text{ cm}$ ($1.5\text{ in}$) and zero dripping: **PASS**.
* In Artemis EAM ($34.0\%\ \text{O}_2$, $8.2\text{ psia}$): Ambient oxygen concentration ($34\%$) exceeds the conditional LOI; flame propagates beyond the $15.0\text{ cm}$ ($6.0\text{ in}$) failure limit: **FAIL** (NASA TM-2008-215264).
* **Epistemic Classification:**
  * Numerical spread rate ($0.8\text{ mm/s}$): Retained as **`UNVERIFIED_MODELLED_PROXY`**. NASA-STD-6001B Test 1 is a qualitative pass/fail test; it does not report a continuous spread velocity in mm/s.
  * Composite hazard score ($85\%$): Retained as **`MODELLED_HEURISTIC`**.

---

## 4. Verification Test Execution

The zero-dependency automated test runner was executed across all 14 test suites:

```
$ node tests/test-runner.js

=======================================================
       GODEYE // PYRO-SI — PHASE 2 VERIFICATION SUITE
=======================================================

[1/14] Flammability Physics Model Unit Tests... (9 passed)
[2/14] PSI Investigation Ranker Unit Tests... (3 passed)
[3/14] Partial-G Scientific Verification Tests... (3 passed)
[4/14] Scientific Equation Boundary Tests... (23 passed)
[5/14] Unit Conversion & Thermodynamic Tests... (13 passed)
[6/14] Dynamic Investigation Catalogue Tests... (137 passed)
[7/14] Missing Data & Fault Tolerance Tests... (15 passed)
[8/14] 7-Attribute Evidence Provenance Tests... (396 passed)
[9/14] Epistemic Evidence Classification Tests... (13 passed)
[10/14] Physiological vs Flammability Separation Tests... (27 passed)
[11/14] UI Scientific Labels & Disclaimer Audit Tests... (13 passed)
[12/14] Phase 2.2.1 Evidence & Claim Audit Tests... (34 passed)
[13/14] Phase 2.2.2 Traceability & Baseline Freeze Tests... (36 passed)
[14/14] Phase 2.2.3 Final Reference & Material Test Correction Tests...
  ✔ PASS: Result must provide deRisModelAssumptions
  ✔ PASS: Paper title must be "Spread of a laminar diffusion flame"
  ✔ PASS: DOI must be exactly 10.1016/S0082-0784(69)80407-8
  ✔ PASS: Full citation must include corrected DOI 10.1016/S0082-0784(69)80407-8
  ✔ PASS: Must provide originalFormulations object
  ✔ PASS: Must state radiation is heat loss at flame sheet and heat gain at fuel-bed surface
  ✔ PASS: Must explicitly confirm radiation is NOT neglected in original model
  ✔ PASS: Must include radiation assumption in analytical assumptions list
  ✔ PASS: Radiation assumption must state included heat loss/gain, NOT neglected
  ✔ PASS: Must document original De Ris thin-fuel analytical formulation with thickness dependence
  ✔ PASS: Must document original De Ris thick-fuel analytical formulation
  ✔ PASS: Must clearly declare distinction between original De Ris and project proxy
  ✔ PASS: Must declare project uses adapted phenomenological scaling proxy
  ✔ PASS: Unverified details note must mandate UNVERIFIED label
  ✔ PASS: Must provide Nomex provenance
  ✔ PASS: Must provide nasaStd6001B_Test1 object
  ✔ PASS: Must provide specimenConfiguration object
  ✔ PASS: Specimen dimensions must record 30.0 cm x 5.0 cm (12.0 in x 2.0 in)
  ✔ PASS: Sample count must be exactly 5 specimens
  ✔ PASS: Must record hemmed or unhemmed edge condition
  ✔ PASS: Must record 25 s ignition dwell time
  ✔ PASS: Must provide acceptanceCriteria object
  ✔ PASS: Burn length failure threshold must be 15.0 cm
  ✔ PASS: Burn length failure threshold must be 6.0 in
  ✔ PASS: Must include indicator paper ignition criterion
  ✔ PASS: Must state all 5 specimens must independently satisfy criteria
  ✔ PASS: Outcome must not present > 12 in as the general failure threshold
  ✔ PASS: Outcome must cite 15 cm / 6 in failure threshold
  ✔ PASS: Must provide LOI variability note
  ✔ PASS: Must state LOI is not a universal fixed constant
  ✔ PASS: Must document LOI dependence on weight and edge finish
  ✔ PASS: Nomex flame spread velocity status must remain UNVERIFIED
  ✔ PASS: Nomex overall status must remain UNVERIFIED
  ✔ PASS: Composite hazard score must remain MODELLED_HEURISTIC

-------------------------------------------------------
Summary: 756 passed, 0 failed
-------------------------------------------------------
Exit Code: 0
```

---

## 5. Scope Disclaimer & Baseline Freeze Declaration

Under NASA Systems Engineering Handbook (SP-2016-6105) governance, the scientific evidence baseline is declared:

$$\mathbf{STATUS:\ FROZEN}$$

### Explicit Flight Qualification Disclaimer:
> **IMPORTANT SCOPE RESTRICTION:**  
> Freezing the scientific evidence baseline establishes that all data contracts, standard citations, and mathematical formulas are traceable to authentic NASA standards (NASA-STD-3001 Rev F, NASA-STD-6001B) and peer-reviewed literature.  
> **This does NOT mean the uncalibrated 1D phenomenological flammability model is independently validated or suitable for flight qualification.**  
> The model is an exploratory educational proxy anchored to single-point flight data (SAFFIRE-I). Certified laboratory flammability testing under NASA-STD-6001B remains strictly required for real-world spacecraft materials and payloads.

### Phase 3 Gate Policy:
All Phase 2 remediation work is complete. In strict adherence to project boundaries, **Phase 3 (Gemini 2.0 Flash RAG AI Co-Pilot integration) remains gated**. No Phase 3 code will be authored until formal review and authorization are provided.
