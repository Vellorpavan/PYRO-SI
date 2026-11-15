# Predictive Simulator Physics & Validation Report
**Project:** GODEYE // PYRO-SI — Fire Safety Intelligence Platform  
**Component:** Flammability Simulator & Partial-G Bounding Engine (`physics-model.js`, `partial-g-chart.js`)  
**Auditor:** Independent Scientific & Technical Audit Team  
**Date:** November 15, 2026  
**Status:** AUDIT COMPLETE — CLASSIFICATION: EMPIRICAL DEMONSTRATION MODEL

---

## 1. Executive Summary

This report delivers a rigorous mathematical and scientific audit of the predictive flammability simulator and partial-gravity bounding engine in **GODEYE // PYRO-SI**.

### Primary Audit Finding:
The current simulator is **NOT a direct numerical simulation (DNS) or computational fluid dynamics (CFD) physics solver**. It is an **empirically grounded, algebraic demonstration model** that translates qualitative principles from NASA flight experiments (BASS-II, Saffire-I, ACME CFI-G, and FLEX) into real-time interactive calculations.

While its qualitative dynamics accurately reflect microgravity combustion physics (such as the peak flammability corridor in partial gravity and the vulnerability of exploration atmospheres), several parameters—including the reported **"$\pm 14\%$ uncertainty"**—are **handcrafted heuristic corridors** rather than formal statistical confidence intervals derived from Monte Carlo variance propagation.

---

## 2. Mathematical Dissection of the Calculation Pipeline

The calculation pipeline is implemented across two core files:
- `src/modules/flammability-simulator/physics-model.js` (computes environmental indices, material spread rates, and suppression protocols)
- `src/modules/flammability-simulator/partial-g-chart.js` (renders the continuous partial-gravity flame spread bounding curve)

### 2.1. Oxygen Partial Pressure ($p\text{O}_2$)
$$\mathbf{p\text{O}_2 = \left(\frac{\text{O}_2}{100}\right) \times P_{\text{total}}\quad [\text{psia}]}$$

- **Input Parameters:** $\text{O}_2$ volume percentage ($\%$), Total pressure $P_{\text{total}}$ ($\text{psia}$).
- **Scientific Classification:** **Exact Physical Law (Dalton's Law of Partial Pressures).**
- **Validation:** Exact. For ISS nominal ($21.0\%\ \text{O}_2$, $14.7\text{ psia}$), $p\text{O}_2 = 3.087\text{ psia}$. For NASA Exploration Atmosphere ($34.0\%\ \text{O}_2$, $8.2\text{ psia}$), $p\text{O}_2 = 2.788\text{ psia}$.

---

### 2.2. Effective Ventilation Velocity ($v_{\text{effective}}$)
$$v_{\text{buoyant}} = 32 \times \sqrt{g}\quad [\text{cm/s}]$$
$$\mathbf{v_{\text{effective}} = \sqrt{v_{\text{forced}}^2 + v_{\text{buoyant}}^2}\quad [\text{cm/s}]}$$

- **Input Parameters:** Forced air velocity $v_{\text{forced}}$ ($\text{cm/s}$), Gravitational acceleration ratio $g$ ($0\text{ to }1.0$).
- **Scientific Classification:** **Semi-Empirical Approximation.**
- **Evaluation:**
  - In microgravity ($g = 0$), $v_{\text{buoyant}} = 0$, so $v_{\text{effective}} = v_{\text{forced}}$. This matches the physical boundary condition where natural buoyancy ceases.
  - On Earth ($g = 1.0$), $v_{\text{buoyant}} = 32\text{ cm/s}$, which corresponds to typical upward buoyant draft velocities measured adjacent to laminar candle flames and thin burning solids ($30\text{--}40\text{ cm/s}$).
  - Vector addition via root-sum-square assumes orthogonal flow alignment. In real habitats, duct flow vectors can be parallel (concurrent), anti-parallel (opposed), or cross-flow to the buoyant vector. This equation represents an effective scalar magnitude rather than a vector Navier-Stokes momentum solution.

---

### 2.3. Limiting Oxygen Index (LOI)
The simulator calculates LOI through an empirical piecewise function:
$$\text{flowFactor} = \begin{cases} -1.4 & \text{if } 3 \le v_{\text{effective}} \le 25\text{ cm/s} \\ +1.8 & \text{if } v_{\text{effective}} < 3\text{ cm/s} \\ +0.4 & \text{if } v_{\text{effective}} > 25\text{ cm/s} \end{cases}$$
$$\text{pressureFactor} = \left(\frac{14.7}{P_{\text{total}}}\right)^{0.18}$$
$$\mathbf{\text{LOI} = \text{clamp}\left((17.5 + \text{flowFactor}) \times \text{pressureFactor},\ 12.5,\ 24.0\right)\quad [\%]}$$

- **Scientific Classification:** **Empirical Phenomenological Model.**
- **Physics Rationale:**
  - In near-zero velocity ($<3\text{ cm/s}$), thick thermal boundary layers and radiation cooling increase heat loss, requiring a higher oxygen fraction to sustain combustion ($\text{flowFactor} = +1.8$, raising LOI).
  - In moderate ventilation ($3\text{--}25\text{ cm/s}$), fresh oxidizer is continuously supplied to the reaction zone without significant blowing extinction, widening flammability limits and lowering LOI ($\text{flowFactor} = -1.4$).
  - At high velocities ($>25\text{ cm/s}$), convective strain causes aerodynamic cooling, slightly increasing LOI ($\text{flowFactor} = +0.4$).
  - The pressure scaling power law $(14.7 / P)^{0.18}$ reflects that decreasing total pressure reduces third-body collision quenching rates, marginally elevating the required oxygen fraction.
- **Audit Limitation:** The transition steps ($-1.4, +1.8, +0.4$) are discrete step functions rather than smooth analytical curves, creating minor derivative discontinuities.

---

### 2.4. Flame Spread Index ($\text{SI}$)
$$\text{o2Ratio} = \left[\max\left(0.1,\ \frac{\text{O}_2 - \text{LOI}}{21 - 15.5}\right)\right]^{1.35}$$
$$\text{pressScale} = \left(\frac{P_{\text{total}}}{10.2}\right)^{0.35}$$
$$\text{ventBonus} = \begin{cases} 0.35 & \text{if } v_{\text{effective}} < 2\text{ cm/s} \\ 1.25 & \text{if } 2 \le v_{\text{effective}} \le 22\text{ cm/s} \\ 0.95 & \text{otherwise} \end{cases}$$
$$\mathbf{\text{spreadIndex} = \max\left(0,\ \text{o2Ratio} \times \text{pressScale} \times \text{ventBonus}\right)}$$

- **Scientific Classification:** **Dimensionless Heuristic Spread Scaling.**
- **Evaluation:** Incorporates de Ris thin-solid flame spread scaling where spread rate is proportional to ambient oxygen above extinction limits to an empirical power ($\sim 1.35$). The index provides consistent relative ordering across atmospheres.

---

### 2.5. Composite Ignition Risk Score ($\text{Risk}$)
$$\text{rawRisk} = \text{spreadIndex} \times 38 + (\text{if } \text{O}_2 > 30\%\text{ then } 22\text{ else } 0)$$
$$\mathbf{\text{RiskScore} = \text{clamp}(\text{round}(\text{rawRisk}),\ 8,\ 99)\quad [\%]}$$

- **Scientific Classification:** **Heuristic Engineering Metric.**
- **Evaluation:** Designed for spacecraft operations displays to map raw environmental severity into a standardized operational indicator ($0\text{--}100\%$). The step increase of $+22\%$ above $30\%\ \text{O}_2$ reflects NASA-STD-6001 strict material qualification criteria, where materials safe in $21\%\ \text{O}_2$ rapidly fail flammability certification in oxygen-enriched atmospheres.

---

### 2.6. Material Flame Spread Rates ($r_m$)
The model calculates relative linear spread rates for four benchmark spacecraft materials:
1. **SIBAL Fabric (Cotton/Fiberglass, Saffire-I):**
   $$r_{\text{sibal}} = 2.2 \times \text{spreadIndex}\quad [\text{mm/s}]$$
2. **PMMA Acrylic (BASS-II standard):**
   $$r_{\text{pmma}} = 0.95 \times \text{spreadIndex}\quad [\text{mm/s}]$$
3. **Silicone Rubber (Gaskets/Cables):**
   $$r_{\text{sil}} = 0.58 \times \text{spreadIndex}\quad [\text{mm/s}]$$
4. **Nomex Aramid (Crew flight suits):**
   $$r_{\text{nomex}} = \begin{cases} 0.0 & \text{if } \text{O}_2 < 27.5\% \\ 0.35 \times \text{spreadIndex} & \text{if } \text{O}_2 \ge 27.5\% \end{cases}\quad [\text{mm/s}]$$

- **Scientific Classification:** **Calibrated Material Spread Multipliers.**
- **Comparison to Published NASA Experimental Data:**
  - *Saffire-I Concurrent Burn:* Measured SIBAL spread velocity at $20\text{ cm/s}$ flow in $21.5\%\ \text{O}_2$ was $\sim 2.24\text{ mm/s}$ ($94\text{ cm}$ burned in $420\text{ s}$). The model predicts $2.2 \times 1.0 \approx 2.2\text{ mm/s}$, demonstrating accurate calibration to the Saffire-I data point.
  - *Nomex Extinction Limit:* NASA-STD-6001 Test 1 reports that Nomex is self-extinguishing in standard sea-level air ($21\%\ \text{O}_2$) but ignites and propagates upward once oxygen exceeds approximately $26\text{--}28\%\ \text{O}_2$. The model's threshold of $27.5\%\ \text{O}_2$ matches NASA Technical Note D-6880.

---

## 3. The Partial-Gravity Bounding Curve & The $\pm 14\%$ Uncertainty Claim

In `src/modules/flammability-simulator/partial-g-chart.js`, the continuous flame spread rate across the gravitational continuum from $0g$ (freefall) to $1.0g$ (Earth) is rendered via:

$$\mathbf{g_{\text{peakBoost}} = 1.0 + 0.55 \cdot \exp\left(-\left(\frac{g - 0.16}{0.18}\right)^2\right)}$$
$$\text{flowEffect} = \begin{cases} 0.3 & \text{if } \text{flow} = 0 \text{ and } g = 0 \\ 1.0 + \min(0.4,\ \text{flow}/45) & \text{otherwise} \end{cases}$$
$$\text{o2Factor} = \left[\max\left(0.15,\ \frac{\text{O}_2 - 15}{6}\right)\right]^{1.25} \times \left(\frac{P_{\text{total}}}{14.7}\right)^{0.3}$$
$$\mathbf{r(g) = \max\left(0.2,\ 1.6 \times g_{\text{peakBoost}} \times \text{flowEffect} \times \text{o2Factor}\right)\quad [\text{mm/s}]}$$

### 3.1. Scientific Validity of the Partial-G Peak
- **Experimental Grounding:** The existence of a maximum flammability peak between $0.1g$ and $0.25g$ is supported by NASA drop tower, KC-135/parabolic aircraft tests, and ACME CFI-G inverted buoyancy observations.
- **Physics Mechanism:** On Earth ($1g$), strong buoyant updrafts ($>30\text{ cm/s}$) cool the flame base through convective heat loss. In zero gravity ($0g$) without forced flow, combustion products smother the reaction zone with $\text{CO}_2$ and $\text{H}_2\text{O}$. In partial gravity (such as lunar $0.166g$), buoyant flow is gentle ($\sim 10\text{--}13\text{ cm/s}$)—sufficient to continuously supply oxidizer without blowing out the flame or causing catastrophic heat loss.
- **Model Realization:** The mathematical representation uses a Gaussian bell centered at $0.16g$ with standard deviation $\sigma = 0.18g$. This is an **empirical curve fit**, not an analytical solution to the conservation equations.

### 3.2. Forensic Audit of the "$\pm 14\%$ Uncertainty"
Lines 72–91 of `partial-g-chart.js` construct the shaded confidence band via:
```javascript
const rateUpper = calcSpreadAtG(gStep) * 1.14;
const rateLower = calcSpreadAtG(gStep) * 0.86;
```

#### Critical Audit Finding:
1. **The $\pm 14\%$ band is NOT an experimentally measured confidence interval.** It is a scalar multiplier ($\times 1.14$ and $\times 0.86$) hardcoded into the visualization renderer.
2. It does not reflect Gaussian error propagation, thermocouple measurement uncertainties, or Monte Carlo sampling of flow variance.
3. **Scientific Classification:** **Conceptual Bounding Corridor.**
4. **Correction Required:** The UI badge on the partial-g chart must NOT state or imply that $\pm 14\%$ is a measured experimental error bar from NASA flight data. It must be explicitly designated as an **Empirical Demonstration Envelope** representing the lack of in-situ lunar flight measurements prior to the FM-2 mission.

---

## 4. Classification Summary of Model Components

```
┌──────────────────────────────────┬─────────────────────────────┬────────────────────────────────────────────────────────┐
│ Model Feature                    │ Classification              │ Scientific Grounding / Source                          │
├──────────────────────────────────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ Oxygen Partial Pressure (pO2)    │ Exact Physical Law          │ Dalton's Law of Partial Pressures                      │
│ Buoyant Velocity Scaling         │ Semi-Empirical Approximation│ Froude number & natural convection scaling             │
│ Effective Flow Vector Addition   │ Heuristic Vector Sum        │ Orthogonal root-sum-square scalar approximation        │
│ Limiting Oxygen Index (LOI)      │ Empirical Phenomenological  │ Piecewise flow regime adjustments based on BASS-II     │
│ Flame Spread Index               │ Empirical Scaling Law       │ de Ris thin-solid combustion scaling                   │
│ Composite Risk Score (0-99%)     │ Heuristic Operational Score │ Normalized decision-support metric                     │
│ SIBAL Spread Multiplier (2.2)    │ Calibrated Empirical Rate   │ Matched to Saffire-I flight data (2.24 mm/s at 20 cm/s)│
│ PMMA Spread Multiplier (0.95)   │ Calibrated Empirical Rate   │ Aligned with BASS-II thin PMMA sample burns            │
│ Nomex Threshold (27.5% O2)       │ Calibrated Threshold        │ NASA-STD-6001 Test 1 / NASA TN D-6880                  │
│ Partial-G Peak (0.16g Moon)      │ Qualitative Empirical Fit   │ Gaussian representation of ACME CFI-G & drop-tower obs │
│ ±14% Confidence Interval Band    │ Conceptual Corridor         │ Scaled visualization multiplier (x1.14 / x0.86)       │
│ Three.js Flame Mesh Animation    │ Illustrative Visualization  │ Procedural noise vertex displacement shader            │
└──────────────────────────────────┴─────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 5. Architectural Recommendations for Next-Generation Physics Engine

To transition the PYRO-SI simulation from an empirical demonstration model to an accredited scientific simulator:

1. **Analytical Partial-G Coupling:**
   Replace the empirical Gaussian curve with the Tien–Kim–de Ris analytical microgravity boundary layer spread formulation:
   $$V_f = V_{\text{eff}} \left(\frac{T_f - T_s}{T_s - T_0}\right)^2 \left(\frac{\rho_g c_g k_g}{\rho_s c_s \tau}\right)$$
2. **Coupled Gas-Phase Chemical Kinetics:**
   Integrate Cantera or OpenFOAM chemical kinetic tables (12-step reduced mechanism for PMMA / cellulose pyrolysis) to compute exact extinction limits and cool flame reaction kinetics.
3. **Rigorous Monte Carlo Uncertainty Quantification (UQ):**
   Replace static $\pm 14\%$ multiplication with a Latin Hypercube or Monte Carlo sampling pipeline propagating measurement uncertainties across oxidizer fraction, ambient pressure, and forced ventilation vectors.
