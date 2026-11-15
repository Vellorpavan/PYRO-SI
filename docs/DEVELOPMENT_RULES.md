# DEVELOPMENT RULES & ENGINEERING GOVERNANCE

## GODEYE // PYRO-SI — NASA Space Apps Challenge 2026

**Document Version:** 2.0.0  
**Mandate:** Non-negotiable Engineering, Security, and Scientific Integrity Directives  

---

## 1. Absolute Directives

### 1.1 Scientific Truth & Zero Fabrication
- **Never fabricate NASA data, measurements, citations, or experimental results.**
- Every investigation profile in `src/data/` must correspond to a verified flight or ground-test campaign documented in NASA archives or peer-reviewed literature.
- Never present qualitative illustrative visualizations as validated flight safety models. All mathematical simulations must carry explicit status indicators (`Measured`, `Derived`, or `Empirical Estimate`).

### 1.2 Preservation of Working Functionality
- **Preserve existing working functionality during all refactoring and restructuring.**
- Do not delete or overwrite `_ORIGINAL_SOURCE_BACKUP.html`. It serves as the canonical baseline reference for feature parity.
- Never remove a complex feature simply because modularization is challenging.

### 1.3 Minimalist Engineering (Ponytail Senior Dev Doctrine)
- *"The best code is the code you never wrote."*
- Solve every requirement with the smallest complete change. Prioritize native Web APIs (HTML5 Canvas, CSS custom properties, native ES modules) over heavy external libraries or runtime frameworks.
- Zero gratuitous dependencies, boilerplate, or premature abstractions.

---

## 2. Security & Credentials Directives

1. **Zero Client-Side Secrets**:
   - Never commit API keys, service account JSON files, or bearer tokens to the Git repository.
   - All cloud credentials (`GEMINI_API_KEY`, `GCP_PROJECT_ID`, `NASA_API_KEY`) must reside exclusively in `.env` (excluded by `.gitignore`) or Google Cloud Secret Manager.
2. **Strict Input Sanitization**:
   - Any user input rendered into the DOM must pass through `escapeHtml()` in `src/utils/dom.js`. Direct `innerHTML` injection of raw unsanitized user strings is strictly forbidden.
3. **Subresource Integrity (SRI)**:
   - External CDN assets (Tailwind, Three.js, FontAwesome) should carry SRI hashes in production deployments to safeguard against upstream supply-chain compromises.

---

## 3. Code Quality & Module Architecture

### 3.1 Modular File Boundaries
- Code must reside in its designated layer:
  - `src/app/`: Application lifecycle, bootstrapping, and navigation routing.
  - `src/components/`: Pure visual presentation components.
  - `src/modules/`: Domain feature logic (GodEye, Matrix, Simulator, Co-Pilot, Submission).
  - `src/services/`: External API communications and dataset fetchers.
  - `src/data/`: Declarative JSON reference files and validation schemas.
  - `src/styles/`: Centralized CSS variables and HUD styling rules.
  - `src/utils/`: Pure utility functions with zero side-effects.

### 3.2 State Management
- Modules must not pollute the global `window` object except for explicitly required DOM event dispatchers (`switchMainTab`, `selectHabitatNode`, etc.) documented in `src/app/main.js`.
- State variables must be encapsulated within their respective module files.

### 3.3 Memory & Resource Management
- Any module registering `setInterval`, `requestAnimationFrame`, or DOM event listeners on `window` must export a corresponding cleanup method to prevent ghost execution when switching tabs or unmounting components.
- Canvas render loops must pause or throttle when the corresponding tab is hidden.

---

## 4. Verification & Testing Standards

1. **Test-First Verification**:
   - Any modification to flammability formulas, scoring algorithms, or data schemas must be verified with automated tests in `tests/`.
   - Tests must be executable without external dependencies via `node tests/test-runner.js` or `npm test`.
2. **Verification Gate Before Completion**:
   - Never mark a feature complete without running the verification suite and confirming $100\%$ pass rates.
   - Compare the behavior of the modular build against `_ORIGINAL_SOURCE_BACKUP.html` to guarantee complete feature and visual fidelity.
