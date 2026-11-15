# EXISTING SYSTEM AUDIT
## GODEYE // PYRO-SI — Single-File HTML Application

**Audit Date:** November 2026  
**Audited By:** PYRO-SI Restructuring Initiative  
**Source File:** `_ORIGINAL_SOURCE_BACKUP.html`  
**File Size:** 2,532 lines (HTML + CSS + JavaScript, monolithic)

---

## 1. Overview

The original PYRO-SI application is a **single-file static HTML application** (~2,532 lines) containing embedded CSS (Tailwind utility classes + custom `<style>` block) and embedded JavaScript (`<script>` block). It was built rapidly for the NASA Space Apps Challenge 2026 "Flame in Freefall" theme and demonstrates a proof-of-concept fire safety intelligence dashboard for microgravity environments.

The app runs entirely in the browser with no backend. It uses four CDN-loaded libraries and three CDN-loaded font families. No build toolchain exists — the file is served directly.

---

## 2. External Dependencies

| Dependency | Version | Load Method | Purpose |
|---|---|---|---|
| Tailwind CSS | 3.x (CDN Play) | CDN `<script>` | Utility-first CSS framework |
| Three.js | r128 | CDN `<script>` | 3D WebGL globe and starfield |
| Google Fonts — Orbitron | — | CDN `<link>` | Display/heading font (space aesthetic) |
| Google Fonts — Inter | — | CDN `<link>` | Body/UI font |
| Google Fonts — JetBrains Mono | — | CDN `<link>` | Monospace telemetry/code font |
| FontAwesome | 6.5.1 | CDN `<link>` | Icon library (tabs, buttons, badges) |

**Dependency Risks:**
- Tailwind CDN Play is not production-safe — it uses a runtime JIT compiler in-browser.
- Three.js r128 is pinned to an older version (current stable is r160+); breaking API changes exist.
- All assets loaded from external CDNs — offline capability is zero.
- No Subresource Integrity (SRI) hashes on any CDN link — supply-chain attack vector.

---

## 3. Application Structure

```
_ORIGINAL_SOURCE_BACKUP.html
├── <head>
│   ├── CDN links (fonts, FontAwesome, Tailwind, Three.js)
│   └── <style> block (~200 lines custom CSS)
├── <body>
│   ├── Compliance/disclaimer banner
│   ├── Top navigation bar (5 tabs)
│   ├── Tab panels (5 × <section> or <div>)
│   │   ├── #godeye-panel
│   │   ├── #psi-matrix-panel
│   │   ├── #simulator-panel
│   │   ├── #copilot-panel
│   │   └── #submission-panel
│   └── Footer
└── <script> block (~1,100 lines inline JS)
    ├── Three.js globe setup
    ├── Flame canvas simulation
    ├── Tab switching logic
    ├── PSI investigation data array (hardcoded)
    ├── Ranking/filter logic
    ├── Flammability simulation formulas
    ├── Keyword-based co-pilot routing
    └── setInterval telemetry ticker
```

---

## 4. Module-by-Module Audit

---

### MODULE 1 — GODEYE 3D ORBITAL & FLAME LAB

#### Sub-Feature Audit

| Feature | Status | Notes |
|---|---|---|
| Three.js WebGL 3D globe | ✅ Implemented and Working | Renders a sphere with custom shader-like material |
| ISS orbit marker (animated ring) | ✅ Implemented and Working | Orbital ring mesh rotating around globe |
| Animated starfield | ✅ Implemented and Working | Points geometry, 2000 stars |
| Lunar node marker | ✅ Implemented and Working | Small sphere on globe surface |
| Mars node marker | ✅ Implemented and Working | Small sphere, placeholder position |
| Habitat buttons (ISS, MOON, ARTEMIS, EVA, MARS) | ✅ Implemented and Working | Each updates telemetry panel via JS |
| Telemetry panel update on habitat select | ✅ Implemented and Working | DOM manipulation, hardcoded values per habitat |
| 2D Canvas flame physics simulator | ⚠️ Implemented but Simulated | Artistic particle system, NOT physics simulation |
| Flame mode: 0g spherical | ✅ Implemented and Working | Particles emit radially |
| Flame mode: 0.16g lunar | ✅ Implemented and Working | Slight vertical bias added |
| Flame mode: CFI-G inside-out | ✅ Implemented and Working | Particles emit inward from ring |
| Flame mode: 1g teardrop | ✅ Implemented and Working | Upward buoyancy simulation |
| 85 animated flame particles | ✅ Implemented and Working | requestAnimationFrame loop |
| Atmospheric profile panel (O2, pressure, gravity, ventilation) | 🟡 Hardcoded/Predefined | Static per-habitat lookup values, no live data |
| Flammability Hazard Index | 🔴 Requires Scientific Validation | Formula is arbitrary weighting, no peer-review |
| Top PSI Studies panel | 🟡 Hardcoded/Predefined | 3 studies hardcoded per habitat |
| Live ISS telemetry ticker (lat/lon) | ⚠️ Implemented but Simulated | `setInterval` drift, NOT from ISS tracking API |
| HUD overlays / scanline effects | ✅ Implemented and Working | CSS pseudo-elements + canvas overlay |
| Corner bracket decorations | ✅ Implemented and Working | CSS `::before`/`::after` elements |

**Code Quality Notes (Module 1):**
- Three.js setup is in an immediately-invoked block mixed with DOM event handlers.
- Globe and flame canvas share the same `requestAnimationFrame` loop — creates coupling.
- No cleanup of Three.js renderer on tab switch — GPU memory not released.
- `setInterval` for telemetry is never cleared if the user navigates away.

---

### MODULE 2 — PSI INVESTIGATION MATRIX

#### PSI Investigation Data Objects

| ID | Investigation | Status | Notes |
|---|---|---|---|
| 1 | BASS-II (Burning and Suppression of Solids II) | 🟡 Hardcoded/Predefined | Static data object, no live API |
| 2 | SAFFIRE I | 🟡 Hardcoded/Predefined | Static data, correct mission context |
| 3 | SAFFIRE II | 🟡 Hardcoded/Predefined | Static data |
| 4 | SAFFIRE III | 🟡 Hardcoded/Predefined | Static data |
| 5 | ACME CFI-G | 🟡 Hardcoded/Predefined | Coflow Inverse Gravity data static |
| 6 | ACME BRE | 🟡 Hardcoded/Predefined | Burning Rate Emulator data static |
| 7 | ACME E-FIELD | 🟡 Hardcoded/Predefined | Electric field data static |
| 8 | FLEX/CFI & SAME/DAFT / SPICE/SLICE | 🟡 Hardcoded/Predefined | Merged/grouped, inconsistent granularity |
| 9 | ACME Coflow/s-Flame/SRT | 🟡 Hardcoded/Predefined | Static data |
| 10 | LUCI/FM2 | 🔶 Partially Implemented | Marked as future/placeholder, NOT YET FLOWN |

#### Sub-Feature Audit

| Feature | Status | Notes |
|---|---|---|
| Weighted ranking sliders (4 dimensions) | ✅ Implemented and Working | JS event listeners on `<input type="range">` |
| Lunar Habitat weight (default 90%) | 🟡 Hardcoded/Predefined | Default value only, no scientific basis given |
| Material Prevention weight (default 85%) | 🟡 Hardcoded/Predefined | Default value only |
| Smoke Detection weight (default 75%) | 🟡 Hardcoded/Predefined | Default value only |
| Suppression weight (default 80%) | 🟡 Hardcoded/Predefined | Default value only |
| Search input (text search) | ✅ Implemented and Working | Filters by name/keyword via `.filter()` |
| Rack filter (CIR/MSG/CYGNUS/LUNAR) | ✅ Implemented and Working | Dropdown filter on investigation rack field |
| Fuel type filter (Solid/Gaseous/Liquid/Aerosol) | ✅ Implemented and Working | Dropdown filter on fuel type field |
| Dynamic ranked card grid | ✅ Implemented and Working | Re-renders cards on any slider/filter change |
| 3-investigation comparator | ✅ Implemented and Working | Side-by-side table with DOM manipulation |
| Auto-synthesized similarity/difference notes | ⚠️ Implemented but Simulated | Rule-based string comparisons, not AI analysis |
| Comparator "add" button | ✅ Implemented and Working | Pushes to comparator state array |

**Code Quality Notes (Module 2):**
- All 10 investigation objects are inline JS literals — no data file separation.
- Ranking formula is a simple weighted sum: `Σ(weight_i × score_i)` — no normalization.
- Comparator limited to 3 items by hardcoded check, with no UX explanation of limit.
- "Similarity notes" logic is brittle string concatenation, not semantic.

---

### MODULE 3 — PREDICTIVE FLAMMABILITY SIMULATOR

#### Sub-Feature Audit

| Feature | Status | Notes |
|---|---|---|
| O2% slider (15–100%) | ✅ Implemented and Working | Range input with live update |
| Pressure PSI slider (4–15 psi) | ✅ Implemented and Working | Range input with live update |
| Airflow cm/s slider (0–55 cm/s) | ✅ Implemented and Working | Range input with live update |
| Gravity g slider (0–1g) | ✅ Implemented and Working | Range input with live update |
| Preset: ISS | ✅ Implemented and Working | Sets sliders to ISS nominal values |
| Preset: Moon Base | ✅ Implemented and Working | Sets sliders to lunar hab values |
| Preset: EVA Suit | ✅ Implemented and Working | Sets sliders to EVA atmosphere values |
| Preset: CFI-G Test | ✅ Implemented and Working | Sets sliders to experimental conditions |
| Preset: Earth Baseline | ✅ Implemented and Working | Sets sliders to 21% O2, 14.7 psi, 1g |
| Ignition Risk % output | 🔴 Requires Scientific Validation | Empirical polynomial, NOT validated model |
| LOI% (Limiting Oxygen Index) output | 🔴 Requires Scientific Validation | Simplified formula, not measured |
| O2 partial pressure output | ⚠️ Implemented but Simulated | Computed from slider values, formula not cited |
| SIBAL cloth flame spread rate | 🔴 Requires Scientific Validation | Relative multiplier, no measured baseline |
| PMMA acrylic flame spread rate | 🔴 Requires Scientific Validation | Relative multiplier, no measured baseline |
| Silicone composite flame spread rate | 🔴 Requires Scientific Validation | Relative multiplier, no measured baseline |
| Nomex flame spread rate | 🔴 Requires Scientific Validation | Relative multiplier, no measured baseline |
| Partial-gravity bounding curve chart | ⚠️ Implemented but Simulated | Gaussian approximation, not from E-FIELD data |
| Dynamic suppression recommendation text | ✅ Implemented and Working | Rule-based text selection from thresholds |

**Mathematical Model Transparency:**
```
Ignition Risk = f(O2, Pressure, Airflow, Gravity)
             = polynomial blend of normalized inputs
             — Exact formula: empirical, authored for demonstration
             — Not validated against: BASS-II, SAFFIRE, or any peer-reviewed source
             — MUST be disclosed in any public presentation

LOI Approximation = Base_LOI × (1 / (O2_fraction ^ 0.6)) × gravity_modifier
                  — Base_LOI from literature (~17-22% for most materials in 1g)
                  — Gravity modifier: Gaussian peak around 0.3g (matches qualitative CFI-G insight)
                  — Not validated
```

**Code Quality Notes (Module 3):**
- All formula constants are magic numbers with no comments.
- Canvas chart is redrawn on every slider event — no debounce.
- No unit validation: user can combine physically impossible values (e.g., 100% O2 at 4 psi EVA).

---

### MODULE 4 — SI CO-PILOT, INCIDENTS & SPINOFFS

#### Sub-Feature Audit

| Feature | Status | Notes |
|---|---|---|
| Preset prompt 1: "Summarize SAFFIRE findings" | 🟡 Hardcoded/Predefined | Static HTML response in JS string |
| Preset prompt 2: "Lunar habitat risk" | 🟡 Hardcoded/Predefined | Static HTML response in JS string |
| Preset prompt 3: "Best suppression for 0g" | 🟡 Hardcoded/Predefined | Static HTML response in JS string |
| Preset prompt 4: "ACME CFI-G significance" | 🟡 Hardcoded/Predefined | Static HTML response in JS string |
| Custom text input | ⚠️ Partially Implemented | Accepts any text, only keywords matched |
| Keyword routing (SAFFIRE, LUNAR, SUPPRESS, ACME) | ⚠️ Implemented but Simulated | `if/else if` chain on `.toLowerCase().includes()` |
| AI badge "PSI KNOWLEDGE GRAPH v4.2" | ❌ Fictional Branding | Not a real system — purely cosmetic |
| Historical incident: Apollo 1 | 🟡 Hardcoded/Predefined | Static HTML, accurate high-level |
| Historical incident: Apollo 13 | 🟡 Hardcoded/Predefined | Static HTML, accurate high-level |
| Historical incident: Mir fire (1997) | 🟡 Hardcoded/Predefined | Static HTML, accurate high-level |
| Historical incident: Artemis II smoke alarm | 🟡 Hardcoded/Predefined | Static HTML — NOTE: verify event accuracy before publishing |
| Earth spinoff: Fine water mist systems | 🟡 Hardcoded/Predefined | Static HTML, accurately references ISS R&D origin |
| Earth spinoff: Smoke detectors | 🟡 Hardcoded/Predefined | Static HTML |
| Earth spinoff: Firefighter gear | 🟡 Hardcoded/Predefined | Static HTML |

**Critical Disclosure Required:**
> The "SI Co-Pilot" is **NOT an AI system**. It performs keyword matching using `String.prototype.includes()` on a fixed response map. This must be clearly labeled in the UI and in all public materials. The badge "PSI KNOWLEDGE GRAPH v4.2" is fictional branding and must be removed or relabeled as a demonstration interface.

---

### MODULE 5 — SPACE APPS SUBMISSION KIT

#### Sub-Feature Audit

| Feature | Status | Notes |
|---|---|---|
| Summary text block (copyable) | ✅ Implemented and Working | Pre-written project summary text |
| Details text block (copyable) | ✅ Implemented and Working | Extended project description |
| 7-slide deck blueprint (copyable) | ✅ Implemented and Working | Slide-by-slide outline text |
| NASA data links + SI disclosure (copyable) | ✅ Implemented and Working | Reference list with psi.nasa.gov links |
| Copy-to-clipboard function | ⚠️ Implemented but Simulated | Uses deprecated `document.execCommand('copy')` |

**Code Quality Notes (Module 5):**
- `document.execCommand('copy')` is deprecated in all modern browsers. Should be replaced with `navigator.clipboard.writeText()`.
- Text blocks are stored as template literals in JS — not externalized as data files.

---

## 5. Cross-Cutting Concerns

### 5.1 Accessibility

| Issue | Severity |
|---|---|
| `<canvas>` elements have no `aria-label` or `role` attributes | High |
| Three.js canvas has no fallback content for screen readers | High |
| Color contrast in orange-on-dark theme not audited | Medium |
| Keyboard navigation between tabs works but focus ring not styled | Medium |
| No `lang` attribute on `<html>` element | Low |

### 5.2 Performance

| Issue | Severity |
|---|---|
| Three.js and flame Canvas both running `requestAnimationFrame` simultaneously | High |
| Tailwind CDN Play compiles all classes at runtime — large parse overhead | High |
| All 2,532 lines parse on first load — no code splitting | Medium |
| No lazy loading of module content | Medium |
| Font files load from Google CDN (4 separate font families) | Low |

### 5.3 Security

| Issue | Severity |
|---|---|
| No Content Security Policy header possible from static file | Medium |
| All CDN scripts loaded without Subresource Integrity (SRI) hashes | High |
| No input sanitization on co-pilot text input (XSS via innerHTML) | High |
| No API keys present (correctly — no backend exists) | N/A |

> **XSS Risk:** The co-pilot response rendering uses `innerHTML` to inject HTML strings. If keyword routing ever starts including user input in the response, this becomes a stored XSS vector. The keyword matching alone is safe today, but the pattern is dangerous.

### 5.4 Scientific Integrity

| Item | Status |
|---|---|
| Flammability formulas validated against published data | ❌ Not validated |
| Material flame spread rates from measured sources | ❌ Relative multipliers only |
| LOI approximation cited to literature | ❌ No citation |
| Partial-G bounding curve from E-FIELD experiment data | ❌ Gaussian approximation |
| ISS telemetry from live tracking API | ❌ Simulated drift |
| PSI investigation data verified against psi.nasa.gov | ⚠️ Spot-checked, not fully verified |
| "AI Co-Pilot" behavior disclosed as non-AI | ❌ Badge misleads users |

---

## 6. Feature Classification Summary

| Classification | Count | Percentage |
|---|---|---|
| ✅ Implemented and Working | 24 | 42% |
| ⚠️ Implemented but Simulated | 11 | 19% |
| 🟡 Hardcoded/Predefined | 15 | 26% |
| 🔶 Partially Implemented | 2 | 4% |
| 🔴 Requires Scientific Validation | 7 | 12% |
| ❌ Missing / Fictional | 1 | 2% |

---

## 7. What Works Well

1. **Visual Impact:** The HUD aesthetic, scanlines, and 3D globe create a compelling demo experience appropriate for a hackathon submission.
2. **Module Completeness:** All 5 tabs render and function at a UI level — no broken navigation.
3. **Filter System:** The PSI Matrix filter + search + ranking combination is a genuinely useful tool for exploring the investigation dataset, even with hardcoded data.
4. **Flame Modes:** The 4 flame visualization modes effectively communicate the qualitative difference between gravity regimes, which is educationally valuable.
5. **Submission Kit:** The copyable text blocks are a practical hackathon utility.

---

## 8. What Must Change Before Any Public Presentation

1. **Label the Co-Pilot correctly:** Remove "AI" and "PSI Knowledge Graph v4.2" branding. Replace with "Keyword Search Prototype."
2. **Add scientific disclaimers** to Simulator output — all computed values must carry uncertainty labels.
3. **Fix XSS risk** in co-pilot innerHTML rendering.
4. **Replace `execCommand`** with `navigator.clipboard.writeText()`.
5. **Add SRI hashes** to all CDN links or move to local packages.
6. **Clear `setInterval`** on tab switch to prevent ghost tickers.
7. **Add `aria-label`** to all canvas elements.
8. **Verify Artemis II smoke alarm event details** before citing as historical fact.
9. **Externalize PSI investigation data** from JavaScript to a JSON data file.
10. **Document all formula constants** with inline citations or "empirical" disclaimers.

---

## 9. Restructuring Recommendation

The single-file architecture was appropriate for rapid prototyping. For the next phase, the recommended structure separates:

- **Data** (`src/data/`) — PSI investigation JSON, material properties, historical incidents
- **Modules** (`src/modules/`) — One JS module per tab
- **Services** (`src/services/`) — NASA PSI fetching, future Gemini AI integration
- **Styles** (`src/styles/`) — Design tokens, component CSS, module CSS
- **Config** (`src/config/`) — Constants, environment, feature flags

See `docs/ARCHITECTURE.md` for the full proposed structure.

---

*End of Existing System Audit*
