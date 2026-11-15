# GODEYE // PYRO-SI — Implementation Roadmap & Execution Plan

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Status:** REVISED UNDER SCIENTIFIC REVIEW GATE  
**Execution Lead:** Senior Full-Stack Engineering & 3D Visualization Team  

---

## 1. Roadmap Overview & Scientific Governance Gates

To guarantee that the platform maintains absolute scientific credibility while achieving the visual fidelity of the reference design (`media_1794744533852_b07836bc.jpg`), implementation proceeds under five gated milestones:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Scientific Review Gate & Claims Disposition (CURRENT GATE — COMPLETED)         │
│ • Audit and dispose of disputed claims in `SCIENTIFIC_CLAIMS_REGISTER.md`.             │
│ • Complete forensic 11-parameter `INVESTIGATION_VERIFICATION_MATRIX.md`.              │
│ • Remove unvalidated ±14% claims and uncalibrated SIBAL spread rate formulas.         │
│ • Sourced NASA-STD-3001 hypoxia compliance to Vol 2 [V2 6005] ($19.0 - 23.7 kPa).      │
│ • Establish 6-tier provenance contract (`MEASURED` to `UNKNOWN`).                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Illustrative 3D Asset Pipeline (Blender + Three.js)                           │
│ • Build clean geometric GLTF components in Blender 5.4 (Earth, ISS, Moon, Mars, Rig). │
│ • Implement Three.js runtime shaders with explicit `[ILLUSTRATIVE]` labels.           │
│ • Deliver 0g spherical blue diffusion shell and exploratory partial-g plume models.   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: Module-by-Module UI/UX Alignment & Provenance Badge Integration               │
│ • Align View 0 (Home) with reference image (ISS cupola window flame hero).            │
│ • Implement 3D Environment Switcher in View 1 (Orbital & Flame Lab).                   │
│ • Embed 6-tier provenance badges across all module outputs in Views 2, 3, 4, and 5.   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Scientific Verification & Automated Test Suite Execution                      │
│ • Update unit tests to reflect corrected scientific bounds and 6-tier provenance.      │
│ • Verify that 100% of unit tests pass in `tests/test-runner.js`.                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: Automated Visual Capture & Dual-Dimension Acceptance Delivery                 │
│ • Capture headless Chrome screenshots across all views; verify visual + scientific A+. │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Work Breakdown Structure (WBS)

### Phase 1: Scientific Governance & Review Gate (Completed)
- [x] Create `docs/SCIENTIFIC_CLAIMS_REGISTER.md` with forensic dispositions (`VERIFIED`, `CORRECTED`, `REMOVED`, `PENDING EVIDENCE`).
- [x] Create `docs/INVESTIGATION_VERIFICATION_MATRIX.md` with 11 discrete metadata parameters for all 10 investigations.
- [x] Clarify the partial-gravity combustion data gap in NASA PSI.
- [x] Correct distinction between CFI-G (`PSI-159`, gaseous cool flames in 0g) and E-FIELD (`PSI-22`, electric-field convective body force proxy).
- [x] Distinguish planned Artemis CLPS payloads (FM2/LUCI) from completed PSI flight archives.
- [x] Remove the claimed SIBAL empirical equation and synthetic $\pm 14\%$ uncertainty bound.
- [x] Source hypoxia compliance directly to **NASA-STD-3001, Vol 2, Rev D, Section 6.1 `[V2 6005]`** ($19.0 - 23.7\ \text{kPa}$ / $2.76 - 3.44\ \text{psi}$ nominal, $16.0\ \text{kPa}$ / $2.32\ \text{psi}$ contingency).
- [x] Revise `docs/SCIENTIFIC_REQUIREMENTS.md`.
- [x] Revise `docs/PRODUCT_VISION.md`.
- [x] Revise `docs/3D_ASSET_AND_RENDERING_PLAN.md`.
- [x] Revise `docs/MODULE_DESIGN_SPECIFICATION.md`.
- [x] Revise `docs/IMPLEMENTATION_ROADMAP.md`.

### Phase 2: Illustrative 3D Asset & Shader Pipeline
- [ ] **Earth & Orbit Enhancement (`orbital-globe.js`):**
  - Integrate NASA Visible Earth Blue Marble equirectangular texture map.
  - Implement Fresnel atmospheric glow shader.
  - Build 3D modular ISS station geometry with solar array wings and cupola module.
  - Add interactive camera rotation and target focus.
- [ ] **Extraterrestrial Habitat Environments (`habitat-environments.js`):**
  - Build procedural 3D Lunar Base Camp scene (cratered regolith, habitat dome, vertical solar array, Earth in the sky), labeled `[ILLUSTRATIVE CONCEPTUAL HABITAT]`.
  - Build procedural 3D Mars Habitat scene (red dunes, geodesic pressurized dome, thin pink atmosphere), labeled `[ILLUSTRATIVE CONCEPTUAL HABITAT]`.
  - Add environment switcher in the Lab studio allowing instant switching between Earth LEO, Moon, and Mars.
- [ ] **Combustion Chamber & Morphological Flames (`flame-chamber-3d.js`):**
  - Create 3D CIR/MSG combustion chamber model with viewing flange, nozzle, and igniter electrodes.
  - Implement 4 distinct volumetric flame morphologies (0g spherical blue shell, 0.16g elongated partial-g plume, 0.38g conical plume, 1.0g flickering teardrop), clearly labeled with their respective provenance tiers.

### Phase 3: Module Enhancements & Provenance Badges
- [ ] **View 0 (Home Dashboard):**
  - Update hero banner with the cinematic ISS cupola window combustion rig artwork matching `media_1794744533852_b07836bc.jpg`.
  - Add the 3 hero pills: `NASA PSI Data`, `AI Research Analysis`, `Habitat Risk Prediction`.
  - Update sidebar bottom card with high-resolution photographic lunar habitat base.
  - Embed the photographic experiment cards in the NASA PSI Highlights section with `REPORTED [PSI]` badges.
- [ ] **View 1 (Orbital & Flame Lab):**
  - Provide full-screen toggles for the 3D Planetary/Habitat environment and the 3D Combustion Chamber.
- [ ] **View 2 (PSI Matrix):**
  - Render the 11 audited metadata parameters from `INVESTIGATION_VERIFICATION_MATRIX.md`.
- [ ] **View 3 (Flammability Simulator):**
  - Replace uncalibrated $\pm 14\%$ labels with explicit `[MODELLED - DE RIS THEORETICAL PROXY]` badges.
- [ ] **View 4 (Research Co-Pilot):**
  - Ground all answer outputs with explicit citations to verified PSI flight records.

### Phase 4: Scientific Verification & Test Execution
- [ ] Run full test suite: `node tests/test-runner.js`.
- [ ] Verify that 100% of unit tests pass without regressions.

### Phase 5: Visual QA & Acceptance
- [ ] Execute `python3 scripts/capture_all_views.py` with Chrome headless and WebGL.
- [ ] Visually inspect all 8 screenshot artifacts.
- [ ] Commit all changes cleanly to git.
