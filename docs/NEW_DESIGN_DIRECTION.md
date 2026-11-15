# New Product Design Direction — PYRO-SI
**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Audience:** Aerospace Engineers, NASA Space Apps Judges, Combustion Scientists, Mission Planners  
**Date:** November 15, 2026  
**Document Status:** APPROVED SPECIFICATION

---

## 1. Critique & Rejection of Previous "Sci-Fi HUD" Interface

The previous interface suffered from classic retro sci-fi tropes that undermined its credibility as a serious aerospace research platform:
1. **Cockpit HUD Overcrowding:** Nested dark panels with glowing borders, corner brackets, scanlines, and unnecessary telemetry badges created severe visual fatigue and reduced content legibility.
2. **Monospace & All-Caps Saturation:** Over-reliance on small, all-caps monospace typography (`CHAMBER CAM // LIVE FLAME MORPHOLOGY`, `0.00001g (µg)`, `STATUS: NOMINAL (21% O2, 14.7 psi)`) made text strenuous to parse and look amateurish.
3. **Flawed Information Hierarchy:** Three cramped desktop columns squeezed the Three.js 3D globe and 2D particle canvas into tiny square boxes while simultaneously displaying redundant environmental badges across the header.
4. **Emoji Buttons & Toy Aesthetics:** Using emoji icons (`🛰️ ISS`, `🌕 Lunar Base`, `🚀 Artemis II`) clashed with professional aerospace data systems.
5. **Lack of Breathing Room:** Gutters were too narrow, margins were non-existent, and text blocks ran edge-to-edge inside nested cards.

---

## 2. The New Product Identity: "Aerospace Precision Laboratory"

The new PYRO-SI interface is redesigned around the visual and ergonomic standards of **contemporary aerospace ground stations, premier scientific publications, and advanced research laboratories** (such as NASA JPL Eyes, ESA Space Situational Awareness, CERN Experiment Dashboards, and Linear / Palantir Foundry).

### Core Brand Attributes:
- **Scientific Credibility:** Clean, publication-grade aesthetics that prioritize authentic NASA data provenance over decorative sci-fi flair.
- **Visual Calm & High Contrast:** A deep, neutral obsidian/slate canvas (`#090D16` / `#0F172A`) paired with clean white and silver typography (`#F8FAFC` / `#94A3B8`) providing $>7:1$ contrast ratios without harsh fluorescent neon glows.
- **Generous Canvas Breathing Room:** Visualizations (the 3D orbital globe and 2D particle combustion chamber) receive primary horizontal real estate ($>60\%$ width, $>450\text{px}$ height) rather than being cramped into miniature cards.
- **Dual-Font System with Purpose:**
  - **Interface & Headings:** `Inter` / `Plus Jakarta Sans` — ultra-legible, modern sans-serif in sentence case for natural reading speed.
  - **Data Values & Telemetry:** `JetBrains Mono` / `IBM Plex Mono` — reserved exclusively for numerical readings, physical units ($p\text{O}_2, g, v$), and DOIs.
- **Quiet, Meaningful Color Semantics:**
  - **Scientific Azure (`#0284C7` / `#38BDF8`):** Nominal systems, orbital telemetry, primary actions.
  - **Combustion Amber (`#D97706` / `#F59E0B`):** Flame phenomena, high-temperature zones, partial-gravity risks.
  - **Critical Coral (`#DC2626` / `#EF4444`):** Flammability hazard thresholds, oxygen-enriched emergency protocols.
  - **Neutral Slates (`#1E293B`, `#334155`):** Structural hairlines and panel backgrounds.

---

## 3. Structural Re-Architecture of the Five Modules

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ PYRO-SI  |  Physical Sciences Informatics Combustion & Fire Safety Laboratory              │
│ [Lab Workspace]    [Investigation Matrix]    [Simulator]    [Co-Pilot]    [Submission Kit] │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ▼                                                               ▼
┌──────────────────────────────────────────────┐ ┌─────────────────────────────────────────────┐
│ 01. LAB WORKSPACE (58% Desktop Width)        │ │ ATMOSPHERIC PHYSICS CONSOLE (42% Width)     │
│ [ 3D Orbital Earth & ISS ] [ Flame Physics ] │ │ Habitat Selection: ISS / Moon / Artemis / Mars│
│ Full-resolution interactive WebGL viewport   │ │ Physical parameters & flammability indices  │
│ Seamless pan, zoom, and live simulation      │ │ Scientific narrative & microgravity physics │
└──────────────────────────────────────────────┘ └─────────────────────────────────────────────┘
```

### Module 01: Lab Workspace (Orbital & Flame Physics)
- **Problem Solved:** Previously split across three cramped columns where neither the 3D globe nor the flame canvas had adequate space.
- **New Architecture:** Clean 2-column layout. The left column is a high-resolution interactive lab canvas with a smooth segmented switch between the **3D Orbital Earth & ISS Flight Track** and the **2D Particle Combustion Chamber**. The right column contains intuitive habitat selection cards, real-time atmospheric metrics ($p\text{O}_2$, pressure, flow, $g$), and clear scientific explanations of microgravity vs. partial-gravity flame physics.

### Module 02: Investigation Matrix (NASA PSI Data Explorer)
- **Problem Solved:** Previously looked like an unreadable dark terminal with cryptic tags and tiny buttons.
- **New Architecture:** A clean data catalog featuring:
  - Instant full-text search across fuel types, facilities, DOIs, and flight codes.
  - Quick categorical filter chips (Solid, Liquid Droplets, Gas Coflow, Aerosol/Smoke, Planned FM-2).
  - Side-by-side study comparison drawer allowing direct contrast between any two flight investigations (e.g., Saffire-I vs. BASS-II).
  - Clear data provenance badges distinguishing verified AWS S3 datasets from flight development charters.

### Module 03: Flammability Simulator
- **Problem Solved:** Unclear separation between user inputs, computed values, material rates, and bounding curves.
- **New Architecture:**
  - **Left Section (Inputs):** Accessible, large-target sliders for Oxygen ($15\text{--}100\%$), Pressure ($5\text{--}20\text{ psia}$), Ventilation ($0\text{--}50\text{ cm/s}$), and Gravity ($0g\text{ to }1.0g$) with 1-click habitat presets.
  - **Right Section (Analysis):** Dalton's law $p\text{O}_2$ readout, Limiting Oxygen Index (LOI), material flame spread rate bar comparisons (SIBAL, PMMA, Silicone, Nomex), and the high-resolution Partial-Gravity Bounding Curve with clear empirical provenance labels.

### Module 04: Research Co-Pilot
- **Problem Solved:** Looked like a fake AI terminal with hardcoded buttons and misleading "RAG v1" claims.
- **New Architecture:** A transparent, authoritative scientific knowledge base. Prominently displays verified research queries, direct citations to published papers (AIAA, Elsevier, SAE), and dedicated tabs for historical incident forensics (Apollo 1, Mir) and terrestrial fire safety spinoffs.

### Module 05: Submission Kit
- **Problem Solved:** Cluttered raw text dump with dark buttons and poor typography.
- **New Architecture:** Clean, publication-ready submission dossier with tabbed sections, live character counters, formatted markdown previews, and reliable one-click copy buttons with clear visual confirmation.

---

## 4. Key Ergonomic & Usability Principles

1. **No Artificial Abbreviations:** Spell out "Combustion Integrated Rack" rather than cryptic acronyms where space permits.
2. **Sentence Case Hierarchy:** Headings are `Sentence case` or `Title Case`, never `ALL CAPS MONOSPACE WITH SLASHES`.
3. **No Decorative Fake Borders:** Hairline dividers (`1px solid rgba(255,255,255,0.08)`) separate logical zones without creating heavy boxed prisons.
4. **Touch & Click Precision:** All buttons, sliders, and interactive tabs adhere to the minimum $44 \times 44\text{px}$ touch target standard.
5. **WCAG 2.1 AAA Accessibility:** Contrast ratios for all body text exceed $7:1$ against dark surfaces, and all interactive controls include high-visibility focus rings.
