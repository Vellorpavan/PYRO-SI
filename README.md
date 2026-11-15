<div align="center">

# 🔥 PYRO-SI

### SI-Powered Microgravity Combustion & Orbital Habitat Fire Safety Intelligence

**NASA Space Apps Challenge 2026 · Theme: _Flame in Freefall_**

![Status](https://img.shields.io/badge/status-hackathon%20prototype-orange)
![Stack](https://img.shields.io/badge/stack-vanilla%20JS%20(ESM)-yellow)
![Tests](https://img.shields.io/badge/tests-zero--dependency-brightgreen)
![Build](https://img.shields.io/badge/build%20step-none-blue)
![Team](https://img.shields.io/badge/team-whoami-lightgrey)

[Overview](#-overview) · [Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-project-architecture) · [Science](#-scientific-basis) · [Docs](#-documentation) · [Compliance](#-compliance--disclaimers)

</div>

---

## 🛰️ Overview

**GODEYE // PYRO-SI** is a scientific intelligence dashboard that turns NASA Physical Sciences Informatics (PSI) combustion research into actionable fire-safety insight for extraterrestrial habitats: the **ISS**, **Artemis Lunar Base Camp**, **Gateway**, and **Mars outposts**.

Fire behaves very differently off Earth:

| Environment | Gravity | Pressure | O₂ | Flame behavior |
|---|---|---|---|---|
| **Earth (reference)** | 1 g | 14.7 psi | 21 % | Buoyant convection produces flickering teardrop flames |
| **Microgravity (ISS)** | ~0 g | Habitat-dependent | Habitat-dependent | Quiescent spherical blue shells, plus hard-to-see **cool flames** (≈ 500–800 K) |
| **Lunar surface habitat** | 0.16 g | Habitat-dependent | up to ~34 % | Reduced buoyancy combined with oxygen-enriched air creates an accelerated-flammability regime, as observed in NASA ACME CFI-G testing |

PYRO-SI gives mission planners, payload safety engineers, and astronauts a single workspace with **interactive 3D spatial telemetry**, **2D combustion simulation**, **multi-criteria research ranking**, and **predictive flammability analysis**.

---

## ✨ Features

| # | Module | What it does |
|---|---|---|
| 1 | **GODEYE 3D Orbital & Tactical Globe** | Orbital mechanics view with ISS ground track, Artemis cislunar trajectory, and a habitat selector |
| 2 | **Interactive 2D Flame Chamber** | Particle simulation of four regimes: 0 g spherical blue shell, lunar 0.16 g upward plume, ACME CFI-G inside-out annular flames, and 1 g flickering teardrop flames |
| 3 | **NASA PSI Investigation Matrix** | Multi-criteria ranker across 10 NASA investigations (BASS-II, Saffire, ACME CFI-G, FLEX/CFI, SAME, and more) with a 3-way side-by-side comparator |
| 4 | **Predictive Flammability Simulator** | Live evaluation of O₂ concentration (15–100 %), ambient pressure (4–15 psi), ventilation airflow, and gravity (0–1 g), including a partial-gravity bounding curve |
| 5 | **Research Co-Pilot** | Evidence-grounded synthesis linking historical space-fire incidents (Apollo 1, Apollo 13, Mir 1997) to modern Earth spinoff technologies |
| 6 | **Mission Intelligence** | Telemetry ticker and incident renderer |
| 7 | **Submission Kit** | Space Apps submission text blocks with a copy helper |

---

## 🚀 Quick Start

### Prerequisites

- A modern browser with ES Module support
- **Node.js** (for `npx serve` and the test runner) **or** **Python 3** (for a simple static server)

### Run locally

PYRO-SI uses native ECMAScript Modules and has **no build step**. Serve the project directory with any static HTTP server:

```bash
# Option A: Node
npx serve -l 3000 .

# Option B: Python 3
python3 -m http.server 3000
```

Then open **http://localhost:3000**.

> ES modules do not load from `file://`, so opening `index.html` directly will not work. Use a local server.

### Configure environment (optional)

```bash
cp .env.example .env
# Fill in any values you need (for example, Gemini integration keys)
```

### Run tests

A zero-dependency test runner covers the flammability model, ranker, and partial-gravity bounding curves:

```bash
npm test
# or
node tests/test-runner.js
```

---

## 🏛️ Project Architecture

```text
PYRO-SI/
├── _ORIGINAL_SOURCE_BACKUP.html    # Preserved monolithic source backup
├── index.html                      # Modular HTML entry point
├── package.json                    # NPM scripts & metadata
├── .env.example                    # Environment variable template
├── .gitignore                      # Git exclusion rules
│
├── docs/                           # Engineering documentation (see index below)
│
├── public/                         # Static assets
│   ├── index.html
│   ├── assets/
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/                        # Entry point, router, configuration
│   │   ├── main.js
│   │   ├── router.js
│   │   └── config.js
│   │
│   ├── modules/                    # Feature modules
│   │   ├── godeye/                 # 3D globe & 2D flame chamber
│   │   ├── investigation-matrix/   # Multi-criteria ranker & comparator
│   │   ├── flammability-simulator/ # Physics model & partial-g chart
│   │   ├── research-copilot/       # Co-pilot controller & knowledge engine
│   │   ├── mission-intelligence/   # Telemetry ticker & incident renderer
│   │   └── submission-kit/         # Submission blocks & copy helper
│   │
│   ├── data/                       # Externalized JSON datasets
│   │   ├── reference/              # PSI investigations, habitat profiles, incidents
│   │   └── schemas/                # Data validation schemas
│   │
│   ├── styles/                     # Design tokens & modular CSS
│   │   ├── variables.css
│   │   ├── global.css
│   │   └── components/hud.css      # HUD panels, corner brackets, scanlines
│   │
│   └── utils/
│       ├── dom.js                  # Safe text setters, XSS escaper, debounce
│       └── math.js                 # Clamping & unit conversions
│
└── tests/
    ├── unit/                       # Flammability model & ranker tests
    ├── scientific/                 # Partial-g bounding curve tests
    └── test-runner.js              # Zero-dependency runner
```

### Design principles

- **Modular and framework-free**: native ESM, one folder per feature module.
- **Data-driven**: reference data lives in `src/data/` as JSON, validated against schemas.
- **Safe by default**: shared DOM helpers escape untrusted text to prevent XSS.
- **Accessible**: reduced-motion support and shared design tokens.
- **Transparent science**: formulas and assumptions are documented, and every model output carries an uncertainty disclosure.

---

## 🧪 Scientific Basis

PYRO-SI draws on published microgravity combustion literature and NASA PSI investigations, including **BASS-II**, **Saffire**, **ACME / CFI-G**, **FLEX / CFI**, and **SAME**.

Key phenomena modeled or visualized:

- **Spherical, quiescent flames** in the absence of buoyant convection
- **Cool flames** (≈ 500–800 K) that are difficult to detect visually
- **Partial-gravity effects** at lunar gravity (0.16 g)
- **Oxygen-enriched atmospheres** and their influence on flammability limits
- **Ventilation and pressure** as safety-relevant variables

> ⚠️ **Important:** The flammability models and curve estimates are **qualitative demonstration algorithms**, not validated engineering predictions. They must not be used for real mission safety decisions. See [`docs/SCIENTIFIC_VALIDATION.md`](docs/SCIENTIFIC_VALIDATION.md) for formulas, assumptions, and limitations.

---

## 📚 Documentation

| Document | Purpose |
|---|---|
| [`EXISTING_SYSTEM_AUDIT.md`](docs/EXISTING_SYSTEM_AUDIT.md) | Feature-by-feature audit of the original system |
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and component design |
| [`GAP_ANALYSIS.md`](docs/GAP_ANALYSIS.md) | Missing capabilities and research dataset gaps |
| [`DATASET_CATALOG.md`](docs/DATASET_CATALOG.md) | NASA PSI investigation catalog and links |
| [`SCIENTIFIC_VALIDATION.md`](docs/SCIENTIFIC_VALIDATION.md) | Math transparency and formula disclosures |
| [`GOOGLE_TECH_INTEGRATION.md`](docs/GOOGLE_TECH_INTEGRATION.md) | Gemini RAG and GCP architecture plan |
| [`UI_UX_IMPROVEMENT_PLAN.md`](docs/UI_UX_IMPROVEMENT_PLAN.md) | Design tokens and accessibility standards |
| [`DEVELOPMENT_RULES.md`](docs/DEVELOPMENT_RULES.md) | Engineering guidelines and scientific rules |
| [`IMPLEMENTATION_ROADMAP.md`](docs/IMPLEMENTATION_ROADMAP.md) | Phased implementation schedule |
| [`MIGRATION_AND_TESTING_REPORT.md`](docs/MIGRATION_AND_TESTING_REPORT.md) | Verification report and benchmarks |

---

## 🤝 Contributing

1. Fork the repository and create a feature branch.
2. Follow the guidelines in [`docs/DEVELOPMENT_RULES.md`](docs/DEVELOPMENT_RULES.md).
3. Add or update tests, then run `npm test`.
4. Open a pull request describing the change and any scientific assumptions involved.

---

## 📜 Compliance & Disclaimers

- **NASA Space Apps 2026 compliant:** no official NASA logos or emblems are used.
- **Scientific integrity notice:** all flammability models and curve estimates are qualitative demonstrations based on published microgravity literature. Every output carries an uncertainty disclosure, consistent with NASA scientific integrity standards.
- **Not an operational tool:** this project is not affiliated with or endorsed by NASA and is not intended for operational flight-safety use.

---

## 👥 Team

**whoami** · NASA Space Apps Challenge 2026

<div align="center">

_Built for the challenge **Flame in Freefall**._

</div>
