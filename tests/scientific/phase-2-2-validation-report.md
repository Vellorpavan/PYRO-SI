# GODEYE // PYRO-SI — Phase 2.2 Scientific Boundary Validation Report

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-P2-2VR-001  
**Version:** 1.0 (Audited Test Baseline)  
**Standard Authority:** NASA SPD-41a Open Science, NASA-STD-3001 Rev F (July 14, 2026), NASA-STD-6001B  

---

## 1. Executive Summary

This report documents the verification and regression testing performed for **Phase 2.2 (Scientific Boundary Corrections)** of GODEYE // PYRO-SI.

The complete automated scientific test suite was executed via zero-dependency ES module test runner (`tests/test-runner.js`). All **600 assertions** executed to completion across **11 distinct test harnesses** with **zero failures (100% pass rate)** and exit code `0`.

---

## 2. Test Execution Ledger & Suite Breakdown

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

---

## 3. Scientific Boundary Verification Evidence

### 3.1. [V2 6003] Inspired Oxygen Partial Pressure ($PIO_2$) Equation & Categories
- **Equation Tested:** $\text{PIO}_2 = (P_B - 47\text{ mmHg}) \times \text{FIO}_2$
- **Normoxia Target Tested:** $145.0 \le \text{PIO}_2 \le 155.0\text{ mmHg}$ ($19.33 - 20.66\text{ kPa}$).
  - *ISS Nominal Standard ($14.7\text{ psia}$, $21\%\ \text{O}_2$):*
    $P_B = 760.2\text{ mmHg}$; $P_B - 47 = 713.2\text{ mmHg}$; $\text{PIO}_2 = 713.2 \times 0.21 = 149.77\text{ mmHg}$ ($19.97\text{ kPa}$).
    ✔ PASS: Classified as `NORMOXIA_TARGET`. `isNormoxicTarget === true`, `isHypoxic === false`.
- **Mild Hypoxia Reassessment (Artemis EAM: $8.2\text{ psia}$, $34\%\ \text{O}_2$):**
  - Ambient dry-gas $pO_2 = 8.2 \times 0.34 \times 6.894757 = 19.22\text{ kPa}$ ($144.18\text{ mmHg}$).
  - Total pressure $P_B = 8.2 \times 6.894757 \times 7.500617 = 424.06\text{ mmHg}$.
  - Tracheal inspired $\text{PIO}_2 = (424.06 - 47) \times 0.34 = 128.20\text{ mmHg}$ ($17.09\text{ kPa}$).
  - ✔ PASS: Classified as `MILD_HYPOXIA` under Table 6.2-1 ($127 - 144\text{ mmHg}$).
  - ✔ PASS: `isNormoxicTarget === false` (strictly not normoxic!).
  - ✔ PASS: `status === 'QUALIFIED_MILD_HYPOXIA'` (meets exploration atmosphere operational qualification for EVA decompression sickness mitigation).
  - ✔ PASS: Material flammability hazard index is $85\%$ (`CRITICAL HAZARD`), and Nomex spread rate is $0.8\text{ mm/s}$ ($>0$), proving strict physical independence.

### 3.2. [V2 6006] Strict Pressure Boundary ($34.5\text{ kPa} < P \le 103.0\text{ kPa}$)
- ✔ PASS: Exactly $34.5\text{ kPa}$ $\implies$ `isTotalPressureCompliant === false` (`NON_COMPLIANT_LOW_PRESSURE`).
- ✔ PASS: Just above $34.5\text{ kPa}$ ($34.6\text{ kPa}$) $\implies$ `isTotalPressureCompliant === true`.
- ✔ PASS: Exactly $103.0\text{ kPa}$ $\implies$ `isTotalPressureCompliant === true`.
- ✔ PASS: Above $103.0\text{ kPa}$ ($103.1\text{ kPa}$) $\implies$ `isTotalPressureCompliant === false` (`NON_COMPLIANT_HIGH_PRESSURE`).

### 3.3. [V2 6002] Inert Diluent Gas Rule (At Least 30% Diluent)
- ✔ PASS: Excised unsupported 14-day duration restriction; requirement applies universally.
- ✔ PASS: Atmosphere with $<30\%$ diluent (e.g. $25\%$ diluent) $\implies$ `hasSufficientDiluent === false` (`NON_COMPLIANT_LOW_DILUENT`).
- ✔ PASS: Explicit gas composition input `{ o2: 21.0, psi: 14.7, diluent: 78.0, co2: 0.5 }` supported; `isBinaryAssumed === false`.
- ✔ PASS: Default binary mixture assumption documented and recorded.

### 3.4. Zero-Gravity Combustion Model Domain Governance
- ✔ PASS: Quiescent $0\text{g}$ ($g = 0$, $V_{\text{forced}} = 0$) returns `modelDomainStatus === 'MODEL_OUT_OF_SCOPE'`.
- ✔ PASS: Quiescent $0\text{g}$ classified as `convectiveRegime === 'QUIESCENT_DIFFUSION_GOVERNED'`.
- ✔ PASS: Conceptually decomposes combustion into 4 mechanisms:
  - Buoyant convection ($V_{\text{buoyant}} = 0\text{ cm/s}$ in $0\text{g}$; $32\text{ cm/s}$ in $1\text{g}$)
  - Forced convection ($V_{\text{forced}} = 0\text{ cm/s}$)
  - Molecular diffusion (`DOMINANT_TRANSPORT_REGIME` in quiescent $0\text{g}$)
  - Radiative/conductive heat loss (`SIGNIFICANT_AT_LOW_FLOW`)
- ✔ PASS: Forced flow in $0\text{g}$ ($V_{\text{forced}} = 15\text{ cm/s}$) returns `modelDomainStatus === 'VALIDATED_CONVECTIVE_PROXY'` and `convectiveRegime === 'FORCED_CONVECTION_DOMINATED'`.
- ✔ PASS: Natural convection in $1\text{g}$ returns `modelDomainStatus === 'VALIDATED_CONVECTIVE_PROXY'` and `convectiveRegime === 'BUOYANCY_DOMINATED'`.
- ✔ PASS: Missing inputs (`{ psi: 14.7 }`) return `hasMissingInputs === true` and `modelDomainStatus === 'INSUFFICIENT_MODEL_INPUTS'`.

---

## 4. Test Reproduction & Traceability

Command executed:
```bash
node tests/test-runner.js
```
Exit code:
`0` (Successful completion, zero errors, zero warnings).
