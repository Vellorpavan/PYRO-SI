# GODEYE // PYRO-SI — System Capability Matrix

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-SCM-001  
**Version:** 3.0 (Phase 1 Engineering Baseline)  
**Standard:** ISO/IEC/IEEE 24765 Systems and Software Engineering Taxonomy

---

## 1. Overview & Capability Architecture

This System Capability Matrix specifies the operational mechanics of all 14 functional capabilities of the **GODEYE // PYRO-SI** platform. Each capability is defined with formal specifications for inputs, processing logic, outputs, data dependencies, acceptance criteria, and current implementation status.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAPABILITY TAXONOMY OVERVIEW                                                           │
│ • Discovery & Ingestion: CAP-01, CAP-02, CAP-03                                        │
│ • Physical Condition & Material Analysis: CAP-04, CAP-05, CAP-06                       │
│ • Analytics & Decision Prioritization: CAP-07, CAP-08, CAP-09                          │
│ • Predictive Modelling & Gap Identification: CAP-10, CAP-11                           │
│ • Intelligence & Earth Technology Transfer: CAP-12, CAP-13                             │
│ • Real-Time 3D Visualization: CAP-14                                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Capability Matrix

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-01: NASA PSI Investigation Discovery                                               │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ NASA Physical Sciences Informatics (PSI) Investigation Discovery   │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Investigation Discovery & Exploration                              │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ User search strings, facility filter pills (CIR, MSG, Cygnus),     │
│                   │ fuel category filter pills (Solid, Gas, Liquid, Dust).             │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Dynamic client-side filtering over `psi-investigations.json`.      │
│                   │ Case-insensitive multi-field substring matching across code,       │
│                   │ title, facility, rack, summary, and fuel type.                     │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Real-time filtered grid of investigation cards displaying verified │
│                   │ metadata, data size badges, and DOI hyperlinks.                    │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ `src/data/reference/psi-investigations.json`                       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ Filter by "Solid" returns exactly BASS-II, Saffire-I, and FM2;     │
│                   │ search "Cygnus" isolates Saffire-I; zero broken hyperlinks.        │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (View 2)                              │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-02: Dataset and Document Ingestion                                                 │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Dataset and Document Ingestion Engine                              │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Data Extraction & Open Science Interoperability                    │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ Raw NASA PSI metadata records, DOI endpoints, NTRS publication refs│
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Ingestion parser mapping disparate NASA PSI attributes into the    │
│                   │ standardized 11-field schema. Validates DOI format, HTTPS URI,     │
│                   │ release version, and resource product arrays.                      │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Structured JSON data contracts with confirmed file availability    │
│                   │ (CSV, NetCDF, MP4, ASCII) and verified download methods.           │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ NASA PSI Open Data REST endpoints & NTRS publications              │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ All 10 investigations possess validated DOI and PSI URLs; data     │
│                   │ volumes match verified NASA repository records (e.g. 255.77 GB).   │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (Data Layer)                          │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-03: Experimental Metadata Extraction                                               │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Experimental Metadata Extraction & Normalization                   │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Metadata Normalization & Cataloging                                │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ Heterogeneous flight campaign parameters across CIR, MSG, Cygnus   │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Normalizes parameters across 11 discrete fields: ID, Title,        │
│                   │ Objective, Facility, Tested g-level, Completion Status, PSI Record,│
│                   │ File Types, Publications, DOI, and Epistemic Classification.       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Uniform 11-field data objects rendered in modal overlays and tables│
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ `INVESTIGATION_VERIFICATION_MATRIX.md`, `psi-investigations.json`  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ Side-by-side comparator renders all 11 fields consistently without │
│                   │ `undefined`, `null`, or truncated table cells.                     │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (View 2)                              │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-04: Fuel and Material Analysis                                                     │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Fuel and Solid Material Combustion Analysis                        │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Materials Characterization & Hazard Evaluation                     │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ Selected material archetype (SIBAL Fabric, Cast PMMA, Silicone,    │
│                   │ Nomex HT90-40) and ambient atmospheric parameters.                │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Evaluates thermal properties (density $\rho_s$, heat capacity      │
│                   │ $c_s$, thickness $\tau$, ignition temperature $T_{ig}$, and LOI). │
│                   │ Evaluates whether ambient $p\text{O}_2$ exceeds material LOI limit.│
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Relative flammability score, estimated flame spread rate (mm/s),   │
│                   │ self-extinction flag, and material safety rating.                  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ `material-library.json`, BASS-II and Saffire-I experimental logs   │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ SIBAL fabric shows higher spread rate than Nomex; Nomex flags      │
│                   │ non-flammable below 27.5% O₂; outputs labeled as [MODELLED].       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (View 3)                              │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-05: Oxygen, Pressure, and Airflow Condition Analysis                               │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Environmental Boundary Condition Analysis                          │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Atmospheric & Fluid Dynamic Environment Analytics                  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ Total pressure ($P$), Oxygen fraction ($Y_{\text{O}_2}$), Forced   │
│                   │ ventilation velocity ($v_{\text{forced}}$), Gravity ratio ($g$).   │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Computes buoyant velocity $v_{\text{buoy}} = 32\sqrt{g}\text{ cm/s}$│
│                   │ Computes effective velocity $v_{\text{eff}} = \sqrt{v_f^2 + v_b^2}$│
│                   │ Computes partial pressure $p\text{O}_2 = (Y_{\text{O}_2}/100) \times P$│
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Real-time telemetric readouts for $p\text{O}_2$, $v_{\text{eff}}$, │
│                   │ and Reynolds flow regime; labeled with exact physical derivations. │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ Dalton's Law, RSS Vector Mechanics, `physics-model.js`             │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ At $g = 0$, $v_{\text{buoy}} = 0$ exactly; at $21\%\ \text{O}_2$   │
│                   │ and $14.7\text{ psia}$, $p\text{O}_2 = 3.087\text{ psia}$.         │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (Views 0, 1, 3)                       │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-06: Sensor and Measurement Extraction                                              │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Flight Diagnostic Sensor & Measurement Analysis                    │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Instrumentation & Sensor Capability Assessment                     │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ Investigation ID or hardware facility selection                    │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Catalogs sensor channels deployed on flight hardware: thermocouple │
│                   │ arrays, radiometers, DMA aerosol spectrometers, optical cameras.   │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Detailed instrumentation profiles detailing sampling rates, optical│
│                   │ spectra, physical accuracy, and measured vs unmeasured variables.  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ NASA PSI hardware specifications, `INVESTIGATION_VERIFICATION_...` │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ SAME-R correctly lists DMA/CPC aerosol sizing sensors; Saffire-I   │
│                   │ lists dual video cameras, thermocouples, and pressure transducers. │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (View 2)                              │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-07: Investigation Relevance Ranking                                                │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Multi-Attribute Decision Prioritization Engine                     │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Algorithmic Decision Support & Investigation Prioritization        │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ 4 user-controlled weight sliders ($0 - 100\%$): Lunar Relevance,   │
│                   │ Material Prevention, Smoke Detection, Fire Suppression.            │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Weighted sum scoring algorithm:                                    │
│                   │ $S_i = \text{clamp}\left(\frac{\sum_j w_j \cdot W_{ij}}{\sum_j w_j}, 0, 99\right)$ │
│                   │ Dynamically sorts all 10 investigations descending by score.       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Dynamically reordered rank cards with composite relevance score    │
│                   │ ($0 - 99\%$), priority badges, and explicit user-weight disclaimer.│
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ `src/modules/psi-matrix/ranker.js`, `psi-investigations.json`      │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ All weights zero returns valid non-NaN zero score; max weights cap │
│                   │ at 99%; adjusting Lunar slider elevates Saffire, BASS-II, and FM2. │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (View 2, Unit Test Covered)           │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-08: Cross-Investigation Comparison                                                 │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Side-by-Side Parametric Investigation Comparator                   │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Comparative Research & Cross-Study Synthesis                       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ User selection of up to 3 distinct investigations                  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Tabulates investigation parameters into an aligned 3-column matrix │
│                   │ comparing facilities, fuel states, flow velocities, sensors, etc.  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Synchronized 3-way comparison table with visual diff highlights and│
│                   │ explicit provenance badges for each cell.                          │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ `INVESTIGATION_VERIFICATION_MATRIX.md`, `psi-investigations.json`  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ Selecting BASS-II, Saffire-I, and FLEX renders complete 3-column   │
│                   │ comparison across all 11 fields without layout breaking.           │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (View 2)                              │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-09: Evidence-Backed Scientific Analytics                                           │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Atmospheric Life Support & Standards Compliance Analytics          │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Crew Health & Life Support Standards Compliance                    │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ Cabin atmospheric telemetry ($P$, $Y_{\text{O}_2}$)                │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Evaluates against NASA-STD-3001 Vol 2 Rev D Section 6.1 `[V2 6005]`:│
│                   │ Nominal range: $19.0 \le p\text{O}_2 \le 23.7\text{ kPa}$          │
│                   │ Contingency floor: $p\text{O}_2 \ge 16.0\text{ kPa}$ ($2.32\text{ psi}$)│
│                   │ Flags acute hypoxia, hyperoxia, or decompression risk.             │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Compliance status indicator ("NOMINAL", "HYPOXIA CONTINGENCY",     │
│                   │ "NON-COMPLIANT") with direct normative standard citations.         │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ NASA-STD-3001 Rev D, `physics-model.js`                            │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ Entering $p\text{O}_2 < 2.32\text{ psia}$ triggers red emergency   │
│                   │ alert; entering $p\text{O}_2 = 3.08\text{ psia}$ reports nominal.  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (Views 0, 3, Unit Test Covered)       │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-10: Predictive Modelling & Theoretical Proxies                                     │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Thermal Energy Balance & Partial-G Continuum Bounding Engine       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Theoretical Flammability Modelling                                 │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ Environmental variables ($g$, $P$, $Y_{\text{O}_2}$, $v_f$), fuel  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Evaluates thin-fuel De Ris thermal balance equation:               │
│                   │ $V_f \propto \frac{k_g (T_f - T_v)}{\rho_s c_s \tau (T_v - T_0)} \cdot \left(\frac{v_{\text{eff}}}{U_{\text{ref}}}\right)^{1/2}$ │
│                   │ Renders non-monotonic partial-gravity spread curve peaking at 0.16g│
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Estimated spread rates (mm/s), flammability risk index ($0 - 99\%$)│
│                   │ and partial-g curve labeled [MODELLED - THEORETICAL PROXY].        │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ De Ris (1969), T'ien / Ferkul low-buoyancy models, `physics-model` │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ Spread rate at $0.16\text{g}$ exceeds quiescent $0\text{g}$ and    │
│                   │ Earth $1\text{g}$; output carries explicit [MODELLED] disclaimer;  │
│                   │ fabricated $\pm 14\%$ label is completely absent.                  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (View 3, Unit Test Covered)           │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-11: Research Gap Identification                                                    │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Extraterrestrial Fire Safety Research Gap Identification           │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Epistemic Governance & Research Roadmapping                        │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ Querying partial-gravity combustion data or lunar surface payloads │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Evaluates availability in NASA PSI. Flags scenarios lacking flight │
│                   │ data with amber `EVIDENCE GAP` badges and explanatory callouts.    │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Amber warning banners on Moon/Mars simulators; explicit statements │
│                   │ that in-situ lunar combustion data does not currently exist in PSI.│
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ NASA PSI physical inventory audit, `SCIENTIFIC_REQUIREMENTS.md`    │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ FM2 card displays amber "EVIDENCE GAP / PLANNED FUTURE FLIGHT";    │
│                   │ simulator Partial-G curve explicitly notes theoretical status.     │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (All Views)                           │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-12: Evidence-Grounded AI Research Co-Pilot                                         │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Evidence-Grounded AI Research Co-Pilot Engine                      │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Natural Language Inquiry & Evidence Synthesis                      │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ User research questions entered in natural language                │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Current Phase 1: Client-side keyword substring matching against    │
│                   │ curated knowledge store. Evaluates queries against 5 domain buckets│
│                   │ (Saffire, Cool Flames, Moon, Suppression, CIR Facilities).         │
│                   │ Phase 3 Target: True RAG via Google Gemini 2.0 Flash & PSI docs.   │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Synthesized scientific answers with specific PSI investigation ID  │
│                   │ citations, flight report references, and incident takeaways.       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ `copilot-knowledge.json`, PSI technical summaries                  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ Asking about "cool flames" cites FLEX (`PSI-69`); asking about     │
│                   │ "moon" cites Exploration Atmosphere (34% O₂) & NASA/TP-2013-217380;│
│                   │ answers clearly indicate their supporting evidence source.         │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ PARTIALLY IMPLEMENTED (Static Heuristic In-Place; RAG in Phase 3)  │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-13: Earth Applications & Technology Transfer Discovery                             │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Terrestrial Spinoff & Technology Transfer Knowledge Engine         │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ Commercial Spinoff & Terrestrial Safety Translation                │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ User navigation to Earth Spinoffs section or Co-Pilot query        │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Maps microgravity combustion insights to terrestrial safety sectors│
│                   │ (Aviation, underground mining, data center fire protection, clean  │
│                   │ industrial energy burners).                                        │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ Interactive spinoff dossier cards with commercial application notes│
│                   │ and direct links to NASA Spinoff publications.                     │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ NASA Spinoff database records, `copilot-knowledge.json`            │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ Displays fine water mist (aircraft/server room halon replacement), │
│                   │ dual-wavelength smoke detectors (mine dust false alarm rejection), │
│                   │ and clean burner soot reduction tech derived from ACME/FLEX.       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (Views 4, 5)                          │
└───────────────────┴────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CAP-14: Interactive 3D Environments & Combustion Visualization                         │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ Capability Name   │ Real-Time 3D Extraterrestrial Environments & Flame Physics Engine  │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Functional Domain │ 3D WebGL Visualization & Visual Simulation                         │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Inputs            │ Habitat node selection (ISS, Moon, Mars, Suit), Gravity mode       │
│                   │ (0.0g, 0.16g, 0.38g, 1.0g), OrbitControls camera mouse drags.     │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Processing Logic  │ Real-time WebGL 2.0 rendering via Three.js r128. Shader animations │
│                   │ for spherical blue chemiluminescence (0g), elongated plume (0.16g),│
│                   │ conical plume (0.38g), and flickering teardrop (1g). High-poly     │
│                   │ NASA EMU astronaut and Quest airlock rendering in EVA scene.       │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Outputs           │ 60 FPS interactive 3D viewports in Views 0 and 1 with real-time    │
│                   │ camera controls (Focus Astronaut, Focus ISS, Zoom, Reset).         │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Data Dependencies │ `orbital-globe.js`, `flame-chamber.js`, `astronaut_eva.glb`        │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Acceptance Test   │ Switching environment updates 3D scene cleanly without crash;      │
│                   │ EVA spacewalk displays authentic NASA EMU astronaut and airlock;   │
│                   │ all flame modes render distinct physical morphologies at 60 FPS.   │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ Current Status    │ VERIFIED / FULLY IMPLEMENTED (Views 0, 1, Visual Test Suite Green) │
└───────────────────┴────────────────────────────────────────────────────────────────────┘
```
