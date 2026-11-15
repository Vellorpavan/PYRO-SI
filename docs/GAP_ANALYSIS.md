# GAP ANALYSIS & CAPABILITY EVALUATION

## GODEYE // PYRO-SI — NASA Space Apps Challenge 2026

**Document Version:** 1.0.0  
**Focus:** Forensic Assessment of Existing Prototype Limitations & Path to Scientific Maturity  

---

## 1. Executive Summary

The original PYRO-SI single-file prototype accomplished its initial goal: providing a visually captivating, themed demonstration of microgravity combustion concepts for the NASA Space Apps Challenge 2026. However, from a scientific and software engineering standpoint, substantial gaps exist between the prototype's demonstrative features and a validated, production-grade mission intelligence system.

This gap analysis systematically identifies:
1. Discrepancies between hardcoded records and authentic NASA PSI datasets.
2. The lack of true RAG and semantic retrieval in the research co-pilot.
3. The empirical nature of the flammability prediction formulas.
4. Architectural and engineering deficits required for incremental production deployment.

---

## 2. NASA Research Data & PSI Integration Gaps

| Capability Area | Current State (Prototype) | Desired Production State | Gap Severity | Action Plan |
|---|---|---|---|---|
| **Dataset Source** | 10 static JS objects authored manually from literature summaries. | Live connection to NASA Physical Sciences Informatics (PSI) open API / export archives. | **HIGH** | Ingest canonical PSI metadata via automated JSON/CSV sync script (`scripts/data-ingestion/fetch_psi.py`). |
| **Numerical Data Availability** | No downloadable numerical telemetry (only text summaries). | Direct links to authentic raw experimental runs (radiometer readings, droplet diameter time-series, video clips). | **HIGH** | Catalog verified downloadable PSI data bundles (e.g., BASS-II radiometer CSVs, FLEX droplet diameter records). |
| **DOI & Publication Provenance** | 10 high-level DOIs hardcoded. | Complete citation graph with bibtex metadata, author lists, journal references, and open-access links. | **MEDIUM** | Link each study to NASA Technical Reports Server (NTRS) and peer-reviewed journals. |
| **Measurement Uncertainty** | Zero error margins reported. | Explicit measurement tolerances ($\pm \text{error}$) for temperature, airflow velocity, and oxygen concentrations. | **CRITICAL** | Annotate sensor specifications and experimental uncertainty ranges in dataset schemas. |
| **Investigation Coverage** | 10 studies (CIR, MSG, Cygnus). | Comprehensive matrix including Saffire IV–VI, ACME s-Flame, and CIR MDCA re-flights. | **LOW** | Expand reference catalog as new PSI studies transition from flight to open repository. |

### Deep-Dive on Specific Investigation Datasets:
- **BASS-II (MSG)**: Data exists on PSI including high-speed video frames and thermocouple logs for PMMA rod burning in nitrogen/oxygen flows. Current prototype models spread rate as a simple linear multiplier without accounting for sample thickness or solid pre-heating time.
- **SAFFIRE I–III (Cygnus)**: Large-scale sensor data (thermocouples, pressure transducers, radiometers, O₂/CO₂ concentrations) exists in NASA archives. Prototype captures qualitative dynamics, but lacks transient cabin pressure modeling during rapid flame spread.
- **ACME CFI-G (CIR)**: Groundbreaking partial-gravity co-flow flame data. The prototype's Gaussian bounding curve qualitatively captures the $0.16g$ peak, but lacks quantitative calibration against ACME spectrometer soot concentration measurements.
- **FLEX / CFI (CIR / MDCA)**: Cool flame discovery is accurately described in text, but the numerical droplet evaporation rate constants ($d^2$-law $K$-values) are not integrated into the simulator.
- **LUCI / FM2**: Correctly labeled as a planned future lunar investigation; requires explicit notation that numerical flight data does not yet exist.

---

## 3. Scientific Intelligence & Co-Pilot Gaps

| Feature | Current Prototype | Target RAG Architecture | Technical Gap |
|---|---|---|---|
| **Query Processing** | `String.prototype.includes()` keyword matching on 5 static strings. | Google Gemini 2.0 Flash with vector embeddings and hybrid BM25 + dense semantic retrieval. | Complete absence of NLP, semantic understanding, or generative synthesis. |
| **Hallucination Protection** | Pre-written static responses guarantee no hallucination, but support zero freeform questions. | Grounded RAG with strict attribution constraint: answers only from NASA PSI corpus and cites chunk IDs. | Must implement context-bounded system prompt and retrieval scoring. |
| **Source Citation** | Generic study name badge. | Specific paragraph, table, or page-level citations from NASA PSI technical papers. | Chunking and metadata indexing required in vector store. |
| **Multi-Turn Reasoning** | Zero conversation memory. | Contextual multi-turn dialogue with session memory. | Chat history state management required in co-pilot module. |

---

## 4. Predictive Flammability & Modeling Gaps

### Current Empirical Formulation:
The prototype utilizes an authored polynomial:
$$\text{Effective Velocity: } v_{\text{eff}} = \sqrt{v_{\text{flow}}^2 + (32\sqrt{g})^2}$$
$$\text{LOI Approximation: } \text{LOI} = (17.5 + f(v_{\text{eff}})) \cdot \left(\frac{14.7}{\text{psi}}\right)^{0.18}$$
$$\text{Spread Index: } I_{\text{spread}} = \left(\frac{\text{O}_2 - \text{LOI}}{5.5}\right)^{1.35} \cdot \left(\frac{\text{psi}}{10.2}\right)^{0.35} \cdot f_{\text{vent}}$$

### Limitations & Scientific Deficits:
1. **Uncalibrated Constants**: Exponents ($0.18$, $1.35$, $0.35$) and base values ($17.5$, $32$) are heuristic estimations to deliver intuitive slider feedback. They have not been fitted against NASA-STD-6001 Test 1 flammability database.
2. **Material Uniformity Assumption**: The spread index scales all materials (SIBAL, PMMA, Silicone, Nomex) with fixed scalar multipliers ($2.2$, $0.95$, $0.58$, $0.35$). In reality, polymeric materials exhibit distinct chemical pyrolysis kinetics, char formation, and thermal conductivity curves.
3. **Absence of Uncertainty Bounds**: The model outputs deterministic numbers (e.g. `2.2 mm/s`) rather than confidence intervals (e.g. `2.2 ± 0.4 mm/s at 95% CI`).
4. **Ignition Energy Neglect**: The model assumes an ignition source of sufficient energy is always present; it does not compute minimum ignition energy (MIE) as a function of $p\text{O}_2$.

---

## 5. UI/UX & Frontend Engineering Gaps

1. **Accessibility (WCAG 2.1 AA)**:
   - `<canvas>` elements lacked `role="img"` and descriptive `aria-label` tags (rectified in modular migration).
   - Sliders need full keyboard control indicators and readable focus rings across all states.
2. **Design Tokens & Theme Consistency**:
   - The monolithic file mixed Tailwind utility classes, custom hex colors, and inline CSS styles without a unified token hierarchy.
   - Refactored into `variables.css` using Hallmark design standards.
3. **Responsive Breakpoints**:
   - Complex tables (e.g., the 3-way investigation comparator) require horizontal scrolling guards on mobile screens ($<640\text{px}$).
4. **State Persistence**:
   - Selected habitat and customized slider weights were reset on page refresh. Adding `localStorage` caching ensures seamless session persistence.

---

## 6. Prioritized Remediation Strategy

- **Phase 1 (Immediate)**: Restructure single file into modular architecture, externalize data, implement automated test suite (Completed).
- **Phase 2 (Near-Term)**: Calibrate flammability formulas against NASA-STD-6001 published thresholds; add explicit uncertainty bands ($\pm \sigma$).
- **Phase 3 (Medium-Term)**: Deploy Google Gemini 2.0 API with NASA PSI document embeddings for evidence-backed RAG co-pilot.
- **Phase 4 (Long-Term)**: Ingest raw numerical time-series CSVs from NASA PSI repository into BigQuery for live analytical querying.
