# GODEYE // PYRO-SI — Requirement Traceability Matrix (RTM)

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-RTM-001  
**Version:** 3.0 (Phase 1 Engineering Baseline)  
**Governance Standard:** IEEE 1233 / NASA Systems Engineering Handbook (SP-2016-6105)

---

## 1. Traceability Methodology & Schema

The Requirement Traceability Matrix (RTM) provides bidirectional verification tracing every high-level NASA Space Apps Challenge mandate through platform functional capabilities, scientific data sources, expected user outcomes, verification methods, automated test identifiers, and live implementation statuses.

### Verification Methods:
- **`TEST` (T):** Automated execution of unit, integration, or regression test scripts (`tests/test-runner.js`, `scripts/verify_environment_transitions.js`).
- **`DEMONSTRATION` (D):** Dynamic user-facing interactive behavior verified in headless browser runtime or live WebGL viewport (`scripts/capture_all_views.py`).
- **`ANALYSIS` (A):** Mathematical, physical, or algorithmic validation against reference physical laws (Dalton's Law, De Ris thermal balance, NASA-STD-3001).
- **`INSPECTION` (I):** Forensic review of source code, data schemas, or official NASA PSI documentation.

### Status Codes:
- **`VERIFIED / COMPLETE`**: Fully implemented, verified against authentic NASA records, covered by passing tests.
- **`PARTIALLY IMPLEMENTED`**: Functional in UI/logic; requires RAG integration, live API binding, or extended schema coverage.
- **`SCIENTIFIC GAP RECORDED`**: Acknowledged absence of empirical NASA flight data (e.g., partial-gravity in-situ measurements), explicitly flagged with amber caution indicators.

---

## 2. Master Traceability Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NASA CHALLENGE OBJECTIVE 1: Identify combustion investigations relevant to habitable crew environments                                            │
├─────────┬──────────────────────────────┬─────────────────────────┬───────────────────────────┬────────┬──────────────┬─────────────┬─────────────┤
│ Req ID  │ NASA Mandate Description     │ Platform Capability     │ Required NASA Data        │ Method │ Test ID      │ Status      │ Audit Notes │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-1.1 │ Catalog flight combustion    │ View 2: PSI Matrix      │ PSI-25 (BASS-II), PSI-98  │ I / D  │ TEST-PSI-001 │ VERIFIED /  │ 10 curated  │
│         │ research conducted in crewed │ FR-01: Discovery        │ (Saffire), PSI-69 (FLEX), │        │              │ COMPLETE    │ studies with│
│         │ habitats (MSG, CIR, Cygnus)  │                         │ PSI-159 (CFI-G), PSI-20   │        │              │             │ verified PSI│
│         │                              │                         │ (BRE), PSI-101 (SAME-R)   │        │              │             │ identifiers │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-1.2 │ Distinguish completed flight │ View 2: PSI Matrix      │ PSI-25..107 (Flight Data) │ I / A  │ TEST-PSI-002 │ VERIFIED /  │ FM2 & LUCI  │
│         │ archives from planned CLPS   │ FR-03: Metadata         │ vs. NASA-FM2 (Planned     │        │              │ COMPLETE    │ explicitly  │
│         │ lunar surface payloads       │ Extraction              │ Artemis Payload)          │        │              │             │ flagged as  │
│         │                              │                         │                           │        │              │             │ EVIDENCE GAP│
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-1.3 │ Multi-attribute scoring of   │ View 2: Prioritization  │ BASS-II, Saffire, FLEX,   │ T / A  │ TEST-RNK-001 │ VERIFIED /  │ Normalized  │
│         │ investigations by lunar base,│ Engine                  │ CFI-G, SAME-R, DAFT,      │        │ TEST-RNK-002 │ COMPLETE    │ weighted sum│
│         │ material, smoke, suppression │ FR-07: Relevance Ranking│ SPICE weight vectors      │        │ TEST-RNK-003 │             │ capped at   │
│         │ relevance                    │                         │                           │        │              │             │ 99% score   │
└─────────┴──────────────────────────────┴─────────────────────────┴───────────────────────────┴────────┴──────────────┴─────────────┴─────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NASA CHALLENGE OBJECTIVE 2: Extract data supporting predictive modelling of flammability and fire scenarios                                       │
├─────────┬──────────────────────────────┬─────────────────────────┬───────────────────────────┬────────┬──────────────┬─────────────┬─────────────┤
│ Req ID  │ NASA Mandate Description     │ Platform Capability     │ Required NASA Data        │ Method │ Test ID      │ Status      │ Audit Notes │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-2.1 │ Extract environmental oxygen,│ View 3: Simulator       │ ISS nominal (21% O₂, 14.7 │ T / A  │ TEST-SIM-001 │ VERIFIED /  │ Exact via   │
│         │ pressure, and airflow values │ FR-05: Condition        │ psi), Artemis EAM (34% O₂,│        │ TEST-SIM-002 │ COMPLETE    │ Dalton's Law│
│         │ to compute oxygen partial pO₂│ Analysis                │ 8.2 psi), Suit (100% O₂)  │        │              │             │ & RSS flow  │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-2.2 │ Model solid material flame   │ View 3: Simulator       │ BASS-II & Saffire PMMA    │ T / A  │ TEST-SIM-003 │ VERIFIED /  │ De Ris heat │
│         │ spread scaling under forced  │ FR-10: Predictive       │ and SIBAL fabric spread   │        │ TEST-SIM-004 │ COMPLETE    │ balance     │
│         │ low-velocity ventilation     │ Modelling (Theoretical) │ rates at 0–40 cm/s flow   │        │              │             │ proxy; ±14% │
│         │                              │                         │                           │        │              │             │ removed     │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-2.3 │ Model Limiting Oxygen Index  │ View 3: Simulator       │ NASA-STD-6001B upward     │ T / A  │ TEST-SIM-005 │ VERIFIED /  │ Clamped     │
│         │ (LOI) shifts as function of  │ FR-09: Scientific       │ flammability test criteria│        │ TEST-SIM-006 │ COMPLETE    │ [12.5%, 24%]│
│         │ velocity and total pressure  │ Analytics               │ & pressure scaling data   │        │              │             │ with flow   │
│         │                              │                         │                           │        │              │             │ piecewise   │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-2.4 │ Characterize theoretical     │ View 3: Partial-G Chart │ Low-buoyancy theoretical  │ T / D  │ TEST-SCI-001 │ VERIFIED /  │ Explicitly  │
│         │ partial-gravity flammability │ FR-10: Partial-G        │ models (T'ien / Ferkul /  │        │ TEST-SCI-002 │ COMPLETE    │ labeled as  │
│         │ continuum curve peak at 0.16g│ Continuum               │ Olson 1999 drop tower)    │        │              │             │ THEORETICAL │
│         │                              │                         │                           │        │              │             │ PROXY       │
└─────────┴──────────────────────────────┴─────────────────────────┴───────────────────────────┴────────┴──────────────┴─────────────┴─────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NASA CHALLENGE OBJECTIVE 3: Highlight research informing fire-safety controls (prevention, detection, suppression)                                │
├─────────┬──────────────────────────────┬─────────────────────────┬───────────────────────────┬────────┬──────────────┬─────────────┬─────────────┤
│ Req ID  │ NASA Mandate Description     │ Platform Capability     │ Required NASA Data        │ Method │ Test ID      │ Status      │ Audit Notes │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-3.1 │ PREVENT: Validate cabin      │ View 0: Home HUD        │ NASA-STD-3001 Vol 2 Rev D │ T / A  │ TEST-STD-001 │ VERIFIED /  │ Nominal floor│
│         │ atmospheres against human    │ View 3: Simulator       │ Section 6.1 [V2 6005]     │        │              │ COMPLETE    │ 2.76 psi,   │
│         │ hypoxia & flammability limits│ FR-09: Standards        │ (pO₂ 19.0–23.7 kPa)       │        │              │             │ cont. floor │
│         │                              │ Compliance              │                           │        │              │             │ 2.32 psi    │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-3.2 │ DETECT: Distinguish nuisance │ View 2: PSI Matrix      │ SAME-R (PSI-101 smoke     │ I / D  │ TEST-DET-001 │ VERIFIED /  │ Resolves    │
│         │ dust particulates from smoke │ View 4: Co-Pilot        │ aging), DAFT (PSI-47      │        │              │ COMPLETE    │ false alarm │
│         │ aerosol in lunar/Mars bases  │ FR-06: Sensor Analysis  │ Arizona Road Dust ARD)    │        │              │             │ problem in  │
│         │                              │                         │                           │        │              │             │ dusty habs  │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-3.3 │ SUPPRESS: Evaluate clean fire│ View 0: Habitat Node    │ FLEX (PSI-69 water mist), │ I / D  │ TEST-SUP-001 │ VERIFIED /  │ Fine mist   │
│         │ suppressants (water mist vs  │ View 3: Simulator       │ BASS-II (CO₂ blanketing), │        │              │ COMPLETE    │ & rapid N₂  │
│         │ CO₂ vs rapid depress)        │ FR-09: Suppression Proto│ ACME E-FIELD (electric)   │        │              │             │ purge for   │
│         │                              │                         │                           │        │              │             │ closed ECLSS│
└─────────┴──────────────────────────────┴─────────────────────────┴───────────────────────────┴────────┴──────────────┴─────────────┴─────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NASA CHALLENGE OBJECTIVE 4: Enable comparison and interpretation of different investigations                                                      │
├─────────┬──────────────────────────────┬─────────────────────────┬───────────────────────────┬────────┬──────────────┬─────────────┬─────────────┤
│ Req ID  │ NASA Mandate Description     │ Platform Capability     │ Required NASA Data        │ Method │ Test ID      │ Status      │ Audit Notes │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-4.1 │ Side-by-side 3-way parametric│ View 2: PSI Matrix      │ 11-field standardized     │ I / D  │ TEST-CMP-001 │ VERIFIED /  │ Renders     │
│         │ comparison of flight rigs,   │ FR-08: Cross-Study      │ schema from INVESTIGATION_│        │              │ COMPLETE    │ dynamic 3-col│
│         │ fuels, g-levels, and products│ Comparison              │ VERIFICATION_MATRIX.md    │        │              │             │ comparative │
│         │                              │                         │                           │        │              │             │ table       │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-4.2 │ Evidence-grounded AI research│ View 4: Co-Pilot        │ Saffire-I, BASS-II, FLEX, │ T / D  │ TEST-COP-001 │ PARTIALLY   │ Curated static│
│         │ interpretation of combustion │ FR-12: AI Co-Pilot      │ ACME, Apollo 1, Mir 1997  │        │              │ IMPLEMENTED │ knowledge;  │
│         │ queries with exact citations │                         │ technical reports         │        │              │             │ RAG planned │
│         │                              │                         │                           │        │              │             │ for Phase 3 │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-4.3 │ Interactive 3D comparative   │ View 1: Lab Studio      │ FLEX flight video 0g vs.  │ D / T  │ TEST-3D-001  │ VERIFIED /  │ 4 distinct  │
│         │ visualization of microgravity│ FR-14: Combustion       │ partial-g De Ris thermal  │        │ TEST-3D-002  │ COMPLETE    │ physical    │
│         │ vs partial-g flame structures│ Chamber                 │ plume hypotheses          │        │              │             │ geometries  │
└─────────┴──────────────────────────────┴─────────────────────────┴───────────────────────────┴────────┴──────────────┴─────────────┴─────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NASA CHALLENGE OBJECTIVE 5: Support potential Earth applications of NASA microgravity combustion research                                        │
├─────────┬──────────────────────────────┬─────────────────────────┬───────────────────────────┬────────┬──────────────┬─────────────┬─────────────┤
│ Req ID  │ NASA Mandate Description     │ Platform Capability     │ Required NASA Data        │ Method │ Test ID      │ Status      │ Audit Notes │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-5.1 │ Highlight terrestrial spinoff│ View 4: Co-Pilot Spinoff│ FLEX droplet combustion   │ I / D  │ TEST-SPN-001 │ VERIFIED /  │ Replaces    │
│         │ of fine water mist technology│ View 5: Submission Kit  │ clean suppression data    │        │              │ COMPLETE    │ toxic halon │
│         │ for aircraft & data centers  │ FR-13: Earth Spinoffs   │                           │        │              │             │ in server rm│
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-5.2 │ Highlight underground mining │ View 4: Co-Pilot Spinoff│ SAME-R / DAFT particle    │ I / D  │ TEST-SPN-002 │ VERIFIED /  │ Eliminates  │
│         │ safety spinoff from dust/    │ View 5: Submission Kit  │ ionization and sizing     │        │              │ COMPLETE    │ coal dust   │
│         │ smoke discrimination sensors │ FR-13: Earth Spinoffs   │ measurements              │        │              │             │ false alarms│
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-5.3 │ Soot-free and low-emission   │ View 4: Co-Pilot Spinoff│ ACME CFI-G and SPICE soot │ I / D  │ TEST-SPN-003 │ VERIFIED /  │ Industrial  │
│         │ industrial burner tech from  │ FR-13: Earth Spinoffs   │ precursor kinetics        │        │              │ COMPLETE    │ combustion  │
│         │ microgravity cool flame data │                         │                           │        │              │             │ efficiency  │
└─────────┴──────────────────────────────┴─────────────────────────┴───────────────────────────┴────────┴──────────────┴─────────────┴─────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SCIENTIFIC INTEGRITY & PROVENANCE MANDATES                                                                                                       │
├─────────┬──────────────────────────────┬─────────────────────────┬───────────────────────────┬────────┬──────────────┬─────────────┬─────────────┤
│ Req ID  │ Integrity Rule               │ Platform Capability     │ Enforcement Mechanism     │ Method │ Test ID      │ Status      │ Audit Notes │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-6.1 │ Enforce 6-tier epistemic data│ All Views (0 to 5)      │ Color-coded badge pills:  │ I / D  │ TEST-PRV-001 │ VERIFIED /  │ Active on   │
│         │ contract on all metrics,     │ FR-09 / FR-10           │ MEASURED, REPORTED,       │        │              │ COMPLETE    │ gauges,     │
│         │ outputs, and visualizations  │                         │ DERIVED, MODELLED,        │        │              │             │ charts, and │
│         │                              │                         │ ILLUSTRATIVE, UNKNOWN     │        │              │             │ study cards │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-6.2 │ Zero fabrication of NASA PSI │ View 2: PSI Matrix      │ Direct DOI & PSI URL      │ I / A  │ TEST-PRV-002 │ VERIFIED /  │ Validated   │
│         │ investigation identifiers,   │ Data Layer              │ resolution to psi.nasa.gov│        │              │ COMPLETE    │ against PSI │
│         │ data sizes, or publications  │                         │                           │        │              │             │ repository  │
├─────────┼──────────────────────────────┼─────────────────────────┼───────────────────────────┼────────┼──────────────┼─────────────┼─────────────┤
│ RTM-6.3 │ Explicit disclosure of the   │ View 0, 1, 2, 3, 4      │ Amber warning callouts on │ I / D  │ TEST-PRV-003 │ VERIFIED /  │ Zero in-situ│
│         │ partial-gravity data void in │ Scientific Core         │ 0.16g / 0.38g simulators  │        │              │ COMPLETE    │ lunar flight│
│         │ current NASA PSI archives    │                         │ and habitat cards         │        │              │             │ data claims │
└─────────┴──────────────────────────────┴─────────────────────────┴───────────────────────────┴────────┴──────────────┴─────────────┴─────────────┘
```

---

## 3. Coverage Analysis & Deficit Log

1. **Requirements Fully Covered & Verified:** 17 of 18 specific requirements are implemented and backed by passing automated unit tests or verified data layers.
2. **Partial Implementation Identified (RTM-4.2 — AI Co-Pilot):**
   - *Current State:* Client-side substring keyword routing against 5 curated answer buckets.
   - *Remediation Plan:* Scheduled for Phase 3 engineering enhancement via true Retrieval-Augmented Generation (RAG) backed by Google Gemini 2.0 Flash and indexed PSI technical publications.
3. **Identified Test Attribution Gap (TEST-SCI-002):**
   - *Issue:* String label in `tests/scientific/gravity-curve.test.js` previously attributed the partial-gravity continuum peak to "ACME CFI-G".
   - *Resolution:* Remediated in Phase 1 documentation and scheduled for code string update to attribute the theoretical model to T'ien / Ferkul low-buoyancy research.
