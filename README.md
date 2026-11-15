# GODEYE // PYRO-SI

> **SI-Powered Microgravity Combustion & Orbital Habitat Fire Safety Intelligence**  
> NASA Space Apps Challenge 2026 — Theme: *Flame in Freefall*  
> Project Team: **whoami**

---

## 🛰️ Overview

**GODEYE // PYRO-SI** is an advanced scientific intelligence dashboard designed to synthesize NASA Physical Sciences Informatics (PSI) combustion research into actionable fire safety protocols for extraterrestrial habitats (ISS, Artemis Lunar Base Camp, Gateway, and Mars outposts).

Unlike Earth ($1.0g$, $14.7\text{ psi}$, $21\%\text{ O}_2$) where buoyant convection creates flickering teardrop flames, microgravity flames form quiescent spherical blue shells and dangerous invisible "cool flames" ($500\text{--}800\text{ K}$). On the Moon ($0.16g$, $34\%\text{ O}_2$), reduced buoyancy combined with oxygen-enriched air creates an extreme flammability acceleration regime discovered during NASA ACME CFI-G testing.

PYRO-SI equips mission planners, payload safety engineers, and astronauts with interactive 3D spatial telemetry, 2D combustion physics simulation, multi-criteria research ranking, and predictive flammability analysis.

---

## 🏛️ Project Architecture

```
PYRO-SI/
├── _ORIGINAL_SOURCE_BACKUP.html    # Preserved monolithic source backup
├── index.html                      # Modular HTML entry point
├── package.json                    # NPM scripts & metadata
├── .env.example                    # Environment variable template
├── .gitignore                      # Git exclusion rules
│
├── docs/                           # Comprehensive Engineering Documentation
│   ├── EXISTING_SYSTEM_AUDIT.md    # Feature-by-feature forensic audit
│   ├── ARCHITECTURE.md             # System architecture & component design
│   ├── GAP_ANALYSIS.md             # Missing capabilities & research dataset gaps
│   ├── DATASET_CATALOG.md          # NASA PSI investigation catalog & links
│   ├── SCIENTIFIC_VALIDATION.md    # Math transparency & formula disclosures
│   ├── GOOGLE_TECH_INTEGRATION.md  # Gemini RAG & GCP architecture plan
│   ├── UI_UX_IMPROVEMENT_PLAN.md   # Design tokens & accessibility standards
│   ├── DEVELOPMENT_RULES.md        # Engineering guidelines & scientific rules
│   ├── IMPLEMENTATION_ROADMAP.md   # Phased implementation schedule
│   └── MIGRATION_AND_TESTING_REPORT.md # Verification report & benchmark
│
├── public/                         # Public assets & static entry point
│   ├── index.html
│   ├── assets/
│   ├── images/
│   └── icons/
│
├── src/                            # Modular Source Code
│   ├── app/                        # App entry point, router & config
│   │   ├── main.js
│   │   ├── router.js
│   │   └── config.js
│   │
│   ├── modules/                    # Application Modules (5 Tabs)
│   │   ├── godeye/                 # 3D Globe & 2D Flame Chamber
│   │   ├── investigation-matrix/   # Multi-criteria Ranker & Comparator
│   │   ├── flammability-simulator/ # Physics model & Partial-G chart
│   │   ├── research-copilot/       # Co-pilot controller & Knowledge engine
│   │   ├── mission-intelligence/   # Telemetry ticker & Incidents renderer
│   │   └── submission-kit/         # Space Apps submission blocks & copy helper
│   │
│   ├── data/                       # Externalized JSON Datasets
│   │   ├── reference/              # PSI investigations, habitat profiles, incidents
│   │   └── schemas/                # Data validation schemas
│   │
│   ├── styles/                     # Modular CSS & Design Tokens
│   │   ├── variables.css           # Hallmark / Refero design tokens
│   │   ├── global.css              # Typography, reset, reduced-motion
│   │   └── components/hud.css      # HUD panels, corner brackets, scanlines
│   │
│   └── utils/                      # Shared Utilities
│       ├── dom.js                  # Safe text setters, XSS escaper, debounce
│       └── math.js                 # Clamping, conversions
│
└── tests/                          # Automated Verification Suite
    ├── unit/                       # Flammability model & ranker tests
    ├── scientific/                 # Partial-G bounding curve tests
    └── test-runner.js              # Zero-dependency test runner
```

---

## 🚀 Quick Start

### 1. Run Directly in Browser
Because PYRO-SI uses native ECMAScript Modules (ESM), simply serve the directory via any static HTTP server:

```bash
# Using Node / npx
npx serve -l 3000 .

# Using Python 3
python3 -m http.server 3000
```
Then navigate to: `http://localhost:3000`

### 2. Run Verification Tests
PYRO-SI includes a zero-dependency automated test runner:

```bash
npm test
# or: node tests/test-runner.js
```

---

## 🧪 Scientific Modules

1. **GODEYE 3D Orbital & Tactical Globe**: Real-time orbital mechanics, ISS track, Artemis cislunar trajectory, and habitat selector.
2. **Interactive 2D Flame Chamber**: Particle simulation representing true microgravity ($0g$ spherical blue shell), lunar partial gravity ($0.16g$ upward plume), ACME CFI-G inside-out annular flames, and terrestrial $1g$ flickering teardrop flames.
3. **NASA PSI Investigation Matrix**: Dynamic multi-criteria ranker across 10 authentic NASA investigations (BASS-II, Saffire, ACME CFI-G, FLEX/CFI, SAME, etc.) with a 3-way side-by-side comparator.
4. **Predictive Flammability Simulator**: Live evaluation of oxygen concentration ($15\text{--}100\%$), ambient pressure ($4\text{--}15\text{ psi}$), ventilation airflow, and gravity ($0\text{--}1g$).
5. **Research Co-Pilot**: Evidence-grounded synthesis linking historical space fire incidents (Apollo 1, Apollo 13, Mir 1997) to modern Earth spinoff technologies.

---

## 📜 Compliance & Disclaimers

- **NASA Space Apps 2026 Compliant**: No official NASA logos or emblems are used.
- **Scientific Integrity Notice**: The flammability models and curve estimates are qualitative demonstration algorithms based on published microgravity literature. All outputs carry scientific uncertainty disclosures in compliance with NASA scientific integrity standards.
