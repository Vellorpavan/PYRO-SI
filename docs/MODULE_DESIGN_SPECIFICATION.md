# GODEYE // PYRO-SI — Module Design Specification

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Status:** REVISED UNDER SCIENTIFIC REVIEW GATE  
**Design Reference:** Aligned with `media_1794744533852_b07836bc.jpg`  

---

## 1. Unified Design System & Epistemic UI Data Contracts

Every module shares a coherent design system anchored in aerospace credibility and rigorous scientific transparency:
- **Canvas Base:** `#F4F5FB` (Soft Lavender/White, creating a calm, high-contrast, professional workspace).
- **Surface Elevation:** `#FFFFFF` (Pure white cards with $16\text{px}$ `rounded-2xl` corners, subtle hairline slate borders `#E2E8F0`, and soft drop shadows `0 1px 3px rgba(0,0,0,0.05)`).
- **Primary Brand Accent:** Royal Purple (`#6D28D9` / `#7C3AED`) representing deep space exploration and intelligence.
- **Typography:**
  - Headings & Interface: `Inter` (Humanist geometric sans, tracking `-0.02em` for modern legibility).
  - Telemetry, Code & Metrics: `JetBrains Mono` (Monospaced, tabular numbers for perfect data alignment).
- **Six-Tier Provenance Badges:**
  - `MEASURED`: Green badge (`bg-emerald-50 text-emerald-700 border-emerald-200`) — Direct flight sensor observation.
  - `REPORTED`: Indigo badge (`bg-indigo-50 text-indigo-700 border-indigo-200`) — Official NASA record or publication.
  - `DERIVED`: Purple badge (`bg-purple-50 text-purple-700 border-purple-200`) — Computed via physical laws (e.g. $p\text{O}_2$).
  - `MODELLED`: Slate badge (`bg-slate-100 text-slate-700 border-slate-300`) — Theoretical De Ris correlation.
  - `ILLUSTRATIVE`: Cyan badge (`bg-sky-50 text-sky-700 border-sky-200`) — 3D morphological rendering.
  - `UNKNOWN / GAP`: Amber badge (`bg-amber-50 text-amber-700 border-amber-200`) — Untested research frontier.

---

## 2. Module 00: Home Overview Dashboard (`tab-home`)

### 2.1. Purpose & Experience
The primary mission executive control center. It mirrors the exact composition of the approved reference image (`media_1794744533852_b07836bc.jpg`), delivering an immediate high-impact summary of space fire safety intelligence with strict provenance.

### 2.2. Component Breakdown
1. **Top Application Header:**
   - NASA Meatball insignia, `GODEYE // PYRO-SI` title, and descriptive subtitle.
   - NASA Space Apps 2026 badge, `Project: whoami` status, notification bell, and astronaut profile avatar.
2. **Cinematic Hero Section:**
   - Deep space orbital backdrop featuring an astronaut looking out the ISS cupola window at a contained microgravity combustion flame.
   - Text hierarchy: *"FLAME IN FREEFALL / Space Fire Safety Intelligence"*.
   - Subtitle: *"Turn NASA microgravity combustion data into actionable fire safety insights for future Moon and Mars habitats."*
   - 3 Feature pills: `NASA PSI Data`, `AI Research Analysis`, `Habitat Risk Prediction`.
3. **Interactive Middle Grid (3 Columns):**
   - **Card 1: Orbital Intelligence (`lg:col-span-5`):** 3D Earth globe with orbital tracks, ISS telemetric callout badge (`Alt: 408.4 km | Vel: 7.66 km/s | 25.95° N, 81.08° E` labeled `[KEPLERIAN DERIVED]`), and 4 habitat selection buttons (ISS, Lunar Base, Mars Habitat, EVA Suit).
   - **Card 2: Flame Behavior Visualization (`lg:col-span-3`):** Combustion chamber viewport with ignited burner, 4 gravity radio modes (0.0g, 0.16g, 0.38g, 1.0g), labeled `[ILLUSTRATIVE MORPHOLOGY]`, with accurate physics captions.
   - **Card 3: Habitat Atmospheric Profile (`lg:col-span-4`):** Donut gauge ($21\%\ \text{O}_2$), 3-column metrics ($14.7\ \text{psi}$, $10 - 15\ \text{cm/s}$, $0.00001\ \text{g}$), `ISS Condition — Nominal` status pill, flammability hazard index spectrum bar, and direct citation to **NASA-STD-3001 [V2 6005]** ($p\text{O}_2 \ge 2.76\ \text{psi}$ nominal).
4. **Bottom Highlights & Co-Pilot Row:**
   - **NASA PSI Research Highlights:** 4 photographic cards for BASS-II (`PSI-25`), SAFFIRE I–III (`PSI-98`), ACME: CFI-G (`PSI-159`), and FLEX/CFI (`PSI-69`) with authentic `REPORTED [PSI]` badges.
   - **PYRO-SI Research Co-Pilot:** Instant question input with suggested query pills (`Material flammability in 0.16 g`, `Best suppression methods`, `ISS fire lessons`).

---

## 3. Module 01: Orbital & Flame Lab (`tab-godeye`)

### 3.1. Visual Identity: **The Dual-Studio Scientific Cleanroom**
- Dedicated to interactive 3D spaceflight mechanics alongside 3D combustion chamber and flame morphology exploration.
- Spacious 2-column layout pairing a large 3D orbital/habitat environment on the left with the 3D experimental combustion chamber on the right.

### 3.2. Unique Features & Interactive Controls
- **3D Environment Switcher:** Toggle between **Earth Orbit & ISS**, **Lunar Base Camp (Shackleton Rim)**, and **Mars Exploration Habitat**, explicitly labeled as `[ILLUSTRATIVE CONCEPTUAL HABITATS]`.
- **Dynamic Flame Chamber Controls:** Real-time gravity selector toggles chamber conditions between $0.0\text{g}$ (supported by FLEX/BASS-II), $0.16\text{g}$ (exploratory scenario), $0.38\text{g}$ (exploratory scenario), and $1.0\text{g}$ (terrestrial baseline).
- **Deep Combustion Telemetry Console:** Readouts for reaction zone peak temperature, transport mechanism (molecular diffusion vs. buoyant convection), and cool flame kinetic persistence, with explicit provenance badges.

---

## 4. Module 02: PSI Investigation Intelligence (`tab-psi`)

### 4.1. Visual Identity: **The Aerospace Research Matrix**
- Designed for deep scientific exploration and comparative synthesis of the 10 documented NASA flight campaigns.

### 4.2. Unique Features & Interactive Controls
- **Dynamic Multi-Attribute Prioritization Bar:**
  - 4 interactive royal purple sliders with instant percentage badges:
    * Lunar Base Relevance ($0.16\text{g}$ focus)
    * Material Prevention (solid flammability & LOI)
    * Smoke Detection (aerosol sizing & false alarm rejection)
    * Fire Suppression (water mist, $\text{CO}_2$, depressurization)
  - Dynamically recalculates weighted relevance scores ($0 - 99\%$) for all 10 investigations in real time, clearly labeled as `[USER WEIGHTED PRIORITIZATION]` (NOT NASA measurements).
- **Side-by-Side 3-Study Comparator Table:**
  - Displays three selected investigations simultaneously across the 11 audited metadata parameters from `INVESTIGATION_VERIFICATION_MATRIX.md`.
  - FM2 and LUCI are clearly highlighted with amber `[EVIDENCE GAP / PLANNED FLIGHT]` banners.
- **Categorized Flight Filter Bar:** Fast filtering by testing rack (CIR, MSG, Cygnus, Lunar) and fuel type (Solid, Gaseous, Liquid, Aerosol).

---

## 5. Module 03: Atmospheric Flammability Simulator (`tab-simulator`)

### 5.1. Visual Identity: **The Predictive Physics Engine**
- Engineering console allowing ECLSS engineers to explore environmental hazard thresholds for deep-space habitat architectures.

### 5.2. Unique Features & Interactive Controls
- **Exploration Atmosphere Presets:**
  - `ISS Nominal`: $21.0\%\ \text{O}_2$, $14.7\ \text{psi}$, $0\text{g}$, $12\ \text{cm/s}$ ventilation.
  - `Lunar Base Camp`: $34.0\%\ \text{O}_2$, $8.2\ \text{psi}$, $0.166\text{g}$, $8\ \text{cm/s}$ ventilation (Exploration Atmosphere).
  - `Artemis II Gateway`: $30.0\%\ \text{O}_2$, $10.2\ \text{psi}$, $0\text{g}$, $15\ \text{cm/s}$ ventilation.
  - `Earth Baseline`: $21.0\%\ \text{O}_2$, $14.7\ \text{psi}$, $1.0\text{g}$, $0\ \text{cm/s}$ forced draft.
- **Scientific Provenance Badges on All Outputs:**
  - Composite Fire Risk Score ($0 - 99\%$): Labeled `[MODELLED - HEURISTIC PROXY]`.
  - Effective Limiting Oxygen Index ($\text{LOI}_{\text{eff}}$): Labeled `[MODELLED - DE RIS ENERGY BALANCE]`.
  - Oxygen Partial Pressure ($p\text{O}_2$): Labeled `[DERIVED - NASA-STD-3001 [V2 6005] COMPLIANCE]`.
- **Solid Material Flame Spread Rate Bars:** Real-time calculated flame spread velocities for SIBAL fabric, PMMA acrylic, and silicone elastomer, with explicit statement that equations represent qualitative thermal trends rather than a calibrated $\pm 14\%$ physics engine.
- **Interactive Partial-Gravity Continuum Curve:** Canvas-rendered graphic demonstrating the hypothesized partial-gravity peak spread phenomenon, clearly labeled as an `[EXPLORATORY THEORETICAL SCENARIO]`.

---

## 6. Module 04: Research Co-Pilot (`tab-sicopilot`)

### 6.1. Visual Identity: **The Grounded Intelligence Terminal**
- Direct evidence synthesis engine connecting user inquiries to documented NASA flight records.

### 6.2. Unique Features & Interactive Controls
- **Curated Knowledge Synthesis Engine:**
  - Preset research query cards:
    * `Lunar Base Flammability`: Explaining why $34\%\ \text{O}_2$ and $0.16\text{g}$ accelerates flame spread, citing NASA/TP-2013-217380.
    * `FLEX Cool Flames`: Explaining low-temperature burning and re-ignition dangers, citing `PSI-69`.
    * `Facility Comparison`: Contrasting CIR vs. MSG vs. Cygnus test capabilities.
    * `Dust vs Smoke Alarms`: Detailing how SAME-R (`PSI-101`) and DAFT (`PSI-47`) eliminate false alarms.
- **Historical Spacecraft Fire Incident Reviews:**
  - Apollo 1 Command Module Fire ($1967$): Pure oxygen high-pressure flash fire lessons.
  - Mir Space Station Solid Oxygen Generator Fire ($1997$): Vika canister combustion and microgravity smoke dynamics.
- **Terrestrial Safety Spinoff Highlights:**
  - Fine-water-mist fire extinguishers (halon replacements for aircraft and server rooms).
  - Multi-wavelength dust-discriminating smoke detectors (underground mining safety).

---

## 7. Module 05: Mission Safety Intelligence / Submission Kit (`tab-submission`)

### 7.1. Visual Identity: **The Challenge Dossier & Deliverable Kit**
- Polished, ready-to-evaluate dossier built for NASA Space Apps Challenge 2026 evaluators and mission architects.

### 7.2. Content Deliverables
- **High-Level Project Summary:** Architectural overview of the GODEYE // PYRO-SI intelligence platform.
- **Tools & Technologies Used:** Full attribution of HTML5, Tailwind CSS, Three.js WebGL, Python FastAPI, NASA PSI Open Data, and Google Gemini.
- **Spaceflight & Terrestrial Impact:** Clear articulation of how PYRO-SI addresses the partial-gravity data gap and informs future Artemis lunar habitat fire safety.
- **One-Click Markdown Copy Buttons:** Allowing judges and users to instantly extract submission copy.
