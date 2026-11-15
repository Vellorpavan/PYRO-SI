# GODEYE // PYRO-SI — Master Acceptance Test Plan (ATP)

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-ATP-001  
**Version:** 3.0 (Phase 1 Engineering Baseline)  
**Standard:** IEEE 829 Standard for Software and System Test Documentation

---

## 1. Test Strategy & Architectural Scope

The Master Acceptance Test Plan guarantees that **GODEYE // PYRO-SI** meets every scientific, functional, and visual acceptance criterion established in `MASTER_PRODUCT_REQUIREMENTS.md`. Testing is partitioned into four rigorous, automated test layers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: SCIENTIFIC & MATHEMATICAL UNIT TESTS (`tests/test-runner.js`)                 │
│ • Dalton's Law exactness, De Ris monotonicity, zero-g buoyant cutoff, LOI bounds       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: MULTI-ATTRIBUTE DECISION ALGORITHM TESTS (`tests/unit/ranker.test.js`)        │
│ • Zero-weight division immunity, 99% score saturation, priority responsiveness         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: 3D STATE MACHINE & SYNCHRONIZATION AUDIT (`verify_environment_transitions.js`)│
│ • Multi-step habitat transitions (ISS ➔ MOON ➔ MARS ➔ SUIT), GLB integrity, memory    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LEVEL 4: HEADLESS CHROME WEBGL VISUAL VERIFICATION (`scripts/capture_all_views.py`)    │
│ • Multi-resolution automated rendering (1440x900 desktop, 390x844 mobile), no errors   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Test Suite 1: Scientific & Mathematical Physics Unit Tests

- **Runner Script:** `node tests/test-runner.js`
- **Component Tested:** `src/modules/flammability-simulator/physics-model.js`
- **Execution Target:** Node.js ES Modules (Zero External Dependencies)

```
┌──────────────┬──────────────────────────────────────────┬────────────────────────────┬────────────────────────┐
│ Test ID      │ Target Requirement / Physical Principle  │ Mathematical Assertion     │ Acceptance Criteria    │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SIM-001 │ Dalton's Law: ISS Sea-Level pO₂          │ $pO_2 = (21/100) \times 14.7$│ $3.08 \le pO_2 \le 3.09$ psi│
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SIM-002 │ Zero-Buoyancy Limit in Microgravity      │ $v_{\text{buoy}}(g=0) = 0$ │ $v_{\text{buoyant}} == 0.0$ cm/s│
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SIM-003 │ Forced Flow Dominance in Microgravity    │ $v_{\text{eff}} == v_f$    │ $|v_{\text{eff}} - v_f| < 10^{-5}$│
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SIM-004 │ ISS Nominal Fire Hazard Baseline         │ $\text{RiskScore}(\text{ISS}) < 50$│ Hazard labeled MODERATE│
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SIM-005 │ Exploration Atmosphere Vulnerability     │ $\text{RiskScore}(\text{Moon}) \ge 75$│ Hazard labeled EXTREME │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SIM-006 │ SIBAL Fabric Spread Rate Monotonicity    │ $V_f(\text{Moon}) > V_f(\text{ISS})$│ Spread rate accelerates│
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SIM-007 │ Nomex Self-Extinction Threshold          │ $V_f(\text{Nomex}, O_2 < 27.5) = 0$│ Zero flame spread rate │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SIM-008 │ Flammability Risk Score Ceiling          │ $\text{RiskScore} \le 99$  │ No values exceeding 99%│
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SIM-009 │ Limiting Oxygen Index (LOI) Physical Bound│ $\text{LOI} \ge 12.5$     │ Never drops below bound│
└──────────────┴──────────────────────────────────────────┴────────────────────────────┴────────────────────────┘
```
**Current Status:** **9 of 9 PASS (100% Green).**

---

## 3. Test Suite 2: Multi-Attribute Prioritization Algorithm Tests

- **Runner Script:** `node tests/test-runner.js`
- **Component Tested:** `src/modules/psi-matrix/ranker.js`

```
┌──────────────┬──────────────────────────────────────────┬────────────────────────────┬────────────────────────┐
│ Test ID      │ Target Requirement / Algorithmic Edge    │ Input State                │ Acceptance Criteria    │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-RNK-001 │ Maximum Input Weight Saturation          │ All weights = 100%         │ Score strictly capped at 99│
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-RNK-002 │ Zero-Weight Division Immunity            │ All weights = 0%           │ Returns 0; no NaN/Inf  │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-RNK-003 │ Weight Responsiveness & Monotonicity     │ High Lunar weight          │ Saffire/BASS-II score rises│
└──────────────┴──────────────────────────────────────────┴────────────────────────────┴────────────────────────┘
```
**Current Status:** **3 of 3 PASS (100% Green).**

---

## 4. Test Suite 3: Partial-Gravity Continuum Scientific Tests

- **Runner Script:** `node tests/test-runner.js`
- **Component Tested:** `tests/scientific/gravity-curve.test.js`

```
┌──────────────┬──────────────────────────────────────────┬────────────────────────────┬────────────────────────┐
│ Test ID      │ Target Requirement / Physical Model      │ Mathematical Assertion     │ Acceptance Criteria    │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SCI-001 │ Partial-G Acceleration vs. Zero-G        │ $V_f(0.16g) > V_f(0g)$     │ Spread rate accelerates│
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SCI-002 │ Theoretical Partial-G Peak vs Earth 1g   │ $V_f(0.16g) > V_f(1.0g)$   │ Intermediate peak occurs│
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-SCI-003 │ Zero-G Flame Spread Non-Zero Floor       │ $V_f(0g) > 0.1$ mm/s       │ Positive non-zero spread│
└──────────────┴──────────────────────────────────────────┴────────────────────────────┴────────────────────────┘
```
**Current Status:** **3 of 3 PASS (100% Green).**  
*Remediation Note:* The assertion string in `TEST-SCI-002` was updated in documentation to attribute the theoretical model to T'ien / Ferkul low-buoyancy research rather than ACME CFI-G.

---

## 5. Test Suite 4: 3D State Machine & Environment Transition Audit

- **Runner Script:** `node scripts/verify_environment_transitions.js`
- **Components Tested:** `habitat-nodes.json`, `orbital-globe.js`, `habitat-controller.js`, GLB Asset Storage

```
┌──────────────┬──────────────────────────────────────────┬────────────────────────────┬────────────────────────┐
│ Test ID      │ Target Transition Sequence               │ Verified Subsystems        │ Acceptance Criteria    │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-TRN-001 │ Sequence: ISS ➔ MOON ➔ ISS               │ Three.js Group Visibility, │ ISS visible, Moon hidden,│
│              │                                          │ Camera Target, Fog State   │ Fog null, no error log │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-TRN-002 │ Sequence: ISS ➔ MARS ➔ ISS               │ Martian Dust Fog Exp2,     │ Mars fog applied/cleared,│
│              │                                          │ Camera Distance [2.0, 12]  │ Telemetry coordinates  │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-TRN-003 │ Sequence: MOON ➔ MARS ➔ SUIT             │ EVA Group Mount, NASA EMU  │ EVA group visible,     │
│              │                                          │ Astronaut Asset, LEO Earth │ Suit O₂ 100%, 4.3 psi  │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-TRN-004 │ Sequence: SUIT ➔ MOON ➔ ISS              │ Re-entrance to Earth Orbit │ Earth orbit restored,  │
│              │                                          │ Keplerian satellite track  │ ISS model in orbit     │
├──────────────┼──────────────────────────────────────────┼────────────────────────────┼────────────────────────┤
│ TEST-AST-001 │ 3D Model Integrity & File Size Checks    │ 8 production GLB files in  │ All files present,     │
│              │                                          │ `assets/models/`           │ sizes between 6KB–910KB│
└──────────────┴──────────────────────────────────────────┴────────────────────────────┴────────────────────────┘
```
**Current Status:** **5 of 5 PASS (100% Green).**

---

## 6. Test Suite 5: Headless Chrome WebGL Automated Visual QA

- **Runner Script:** `python3 scripts/capture_all_views.py`
- **Execution Engine:** Google Chrome Headless (`/Applications/Google Chrome.app`) with `--enable-webgl` and `--virtual-time-budget=2500`
- **Output Directory:** `screenshots/`

```
┌──────────────┬──────────────────────────────┬──────────────┬──────────────┬────────────────────────────────────┐
│ Test ID      │ Visual Screenshot Target     │ Resolution   │ Target View  │ Visual Inspection Criteria         │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-001 │ `00_home_dashboard.png`      │ 1440 x 900   │ View 0 (Home)│ Hero banner, 3 metrics cards,      │
│              │                              │              │              │ Earth globe & flame chamber active │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-002 │ `01_env_iss.png`             │ 1440 x 900   │ View 0 (ISS) │ Blue Marble Earth, Keplerian orbit,│
│              │                              │              │              │ 21% O₂ nominal status badge        │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-003 │ `01_env_moon.png`            │ 1440 x 900   │ View 0 (Moon)│ Lunar habitat dome, 34% O₂ EAM,    │
│              │                              │              │              │ EXTREME flammability alert         │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-004 │ `01_env_mars.png`            │ 1440 x 900   │ View 0 (Mars)│ Mars regolith, salmon dust haze,   │
│              │                              │              │              │ 28% O₂ at 8.0 psi alert            │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-005 │ `01_env_eva.png`             │ 1440 x 900   │ View 0 (EVA) │ Full NASA EMU astronaut, gold visor│
│              │                              │              │              │ Quest airlock, handrails, Earth    │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-006 │ `01_flame_0g.png`            │ 1440 x 900   │ View 0 (0g)  │ Spherical blue chemiluminescence   │
│              │                              │              │              │ soot-free diffusion shell          │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-007 │ `01_flame_lunar.png`         │ 1440 x 900   │ View 0 (0.16)│ Upwardly elongated flame plume     │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-008 │ `01_flame_mars.png`          │ 1440 x 900   │ View 0 (0.38)│ Tapered conical reaction plume     │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-009 │ `01_flame_1g.png`            │ 1440 x 900   │ View 0 (1.0g)│ Luminous yellow flickering teardrop│
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-010 │ `01_lab_workspace.png`       │ 1440 x 900   │ View 1 (Lab) │ Dual-studio cleanroom layout       │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-011 │ `02_investigation_matrix.png`│ 1440 x 1100  │ View 2 (PSI) │ 4 priority sliders, 3-study table  │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-012 │ `03_flammability_simulator`  │ 1440 x 1100  │ View 3 (Sim) │ De Ris spread bars, partial-g curve│
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-013 │ `04_research_copilot.png`    │ 1440 x 1050  │ View 4 (AI)  │ Grounded query terminal & spinoffs │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-014 │ `05_submission_kit.png`      │ 1440 x 950   │ View 5 (Doss)│ Challenge summary & copy blocks    │
├──────────────┼──────────────────────────────┼──────────────┼──────────────┼────────────────────────────────────┤
│ TEST-VIS-015 │ `06_mobile_layout.png`       │ 390 x 844    │ View 0 (Mob) │ Single-column responsive stacking  │
└──────────────┴──────────────────────────────┴──────────────┴──────────────┴────────────────────────────────────┘
```
**Current Status:** **15 of 15 Captured & Visually Verified.**

---

## 7. Pass / Fail Acceptance Criteria Summary

An engineering release is certified **APPROVED** if and only if:
1. **Mathematical & Scientific Tests:** 100% of tests in `tests/test-runner.js` pass with zero failures or unhandled exceptions.
2. **Transition Audits:** All multi-step environment transitions in `scripts/verify_environment_transitions.js` pass with zero console errors.
3. **Visual Regression Gate:** All 15 headless Chrome screenshots match the approved design hierarchy (`media_1794744533852_b07836bc.jpg`) without element clipping, text overlapping, or primitive placeholder geometry.
4. **Epistemic Data Gate:** Zero unverified $\pm 14\%$ claims exist; zero planned payloads are marked as flight data; all outputs display explicit provenance badges.
