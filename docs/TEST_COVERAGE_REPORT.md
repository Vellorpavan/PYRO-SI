# Automated Test Suite Verification & Coverage Report
**Project:** GODEYE // PYRO-SI — Fire Safety Intelligence Platform  
**Component:** Automated Test Suite (`tests/test-runner.js`, `unit/`, `scientific/`)  
**Auditor:** Independent Scientific & Technical Audit Team  
**Date:** November 15, 2026  
**Status:** AUDIT COMPLETE — 15/15 PASSING (LIMITATION IDENTIFIED: SELF-CONSISTENCY ONLY)

---

## 1. Executive Summary

This report delivers an independent verification and coverage audit of the 15 automated tests in the **GODEYE // PYRO-SI** test suite.

### Primary Audit Findings:
1. **Execution Status:** All 15 automated test assertions execute cleanly and pass without errors (`15 passed, 0 failed` in $64\text{ ms}$).
2. **Test Scope & Limitation:** The existing test suite evaluates **internal mathematical self-consistency and bounds clamping** of the JavaScript simulation code. It does **NOT** compare calculated flame spread velocities or extinction thresholds against independent NASA published experimental ground truth datasets.
3. **Data Ingestion Gaps:** The automated test runner does not test external data ingestion pipelines (`scripts/data-ingestion/fetch_psi.py`), S3 download integrity, or CSV table schema parsing.
4. **Validation Need:** An expanded test harness must be implemented to test computed physical outputs against published experimental data points from BASS-II (Olson et al., 2014) and Saffire-I (Urban et al., 2019).

---

## 2. Test-by-Test Audit Breakdown

The 15 assertions are distributed across three test modules:

```
┌─────────────────────────────────┬──────────┬────────┬───────────────────────────────┬──────────────────────────────┐
│ Test Module                     │ Suite    │ Asserts│ Scope                         │ Ground Truth Basis           │
├─────────────────────────────────┼──────────┼────────┼───────────────────────────────┼──────────────────────────────┤
│ flammability-model.test.js      │ Unit     │ 9      │ pO2, buoyant velocity, risk   │ Mathematical formulation     │
│ ranker.test.js                  │ Unit     │ 3      │ MCDA weighted score & bounds  │ Algorithm boundary check     │
│ gravity-curve.test.js           │ Scientific│ 3     │ 0g vs 0.16g vs 1g curve peak  │ Mathematical function shape  │
└─────────────────────────────────┴──────────┴────────┴───────────────────────────────┴──────────────────────────────┘
```

---

### 2.1. Module 1: `unit/flammability-model.test.js` (9 Assertions)

```javascript
// Test 1: ISS Nominal Environment (21% O2, 14.7 psi, 12 cm/s flow, 0g)
assert(issRes.ppo2 > 3.0 && issRes.ppo2 < 3.2, 'ISS pO2 should be ~3.08 psi');
assert(issRes.vBuoyant === 0, 'In 0g, buoyant velocity must be 0');
assert(issRes.vEffective === 12.0, 'In 0g, effective velocity equals forced ventilation');
assert(issRes.riskScore < 50, 'ISS nominal fire risk score should be moderate (<50)');

// Test 2: Lunar Base Exploration Atmosphere (34% O2, 8.2 psi, 8 cm/s flow, 0.166g)
assert(moonRes.riskScore >= 75, 'Lunar base with 34% O2 must trigger elevated or critical risk (>=75%)');
assert(parseFloat(moonRes.rates.sibal) > parseFloat(issRes.rates.sibal), 'SIBAL flame spread rate in lunar base must exceed ISS nominal');

// Test 3: Nomex Extinction Behavior below threshold (20% O2, 14.7 psi, 10 cm/s flow, 1g)
assert(lowO2Res.rates.nomex === '0.0', 'Nomex should have 0.0 spread rate below 27.5% O2');

// Test 4: Extreme Boundary Clamping (100% O2, 20 psi, 50 cm/s flow, 1g)
assert(extremeRes.riskScore <= 99, 'Risk score must be capped at 99%');
assert(extremeRes.loi >= 12.5, 'LOI must remain above lower physical bound 12.5%');
```

#### What It Covers:
- Validates that Dalton's Law calculation returns expected $p\text{O}_2 \approx 3.087\text{ psia}$.
- Confirms zero buoyancy condition at $g = 0$.
- Confirms scalar effective velocity matches forced flow in zero gravity.
- Confirms qualitative ordering: $34\%\ \text{O}_2$ exploration atmosphere produces higher risk and flame spread rate than standard air.
- Confirms that Nomex flame spread drops to zero below the $27.5\%\ \text{O}_2$ threshold.
- Confirms numerical clamping prevents risk scores $>99\%$ or LOI $<12.5\%$.

#### What It Does NOT Cover:
- Does not check whether the calculated SIBAL spread velocity ($2.2\text{ mm/s}$) matches the actual physical velocity recorded in Saffire-I run logs within an experimental tolerance window ($\pm 10\%$).
- Does not verify PMMA spread rates against BASS-II sample thickness variations ($100\ \mu\text{m}$ vs $300\ \mu\text{m}$).

---

### 2.2. Module 2: `unit/ranker.test.js` (3 Assertions)

```javascript
// Test 1: Full 100s across all weights
const scoreMax = computeInvestigationScore(dummyInv, { lunar: 100, prev: 100, det: 100, supp: 100 });
assert(scoreMax === 99, `Max input should return capped score 99, got ${scoreMax}`);

// Test 2: Zero weights fallback
const scoreZero = computeInvestigationScore(dummyInv, { lunar: 0, prev: 0, det: 0, supp: 0 });
assert(scoreZero >= 10 && scoreZero <= 99, 'Zero weights must not divide by zero or NaN');

// Test 3: Sensitivity to Lunar Habitat weighting
const scoreHighLunar = computeInvestigationScore(invLunarHeavy, { lunar: 100, prev: 0, det: 0, supp: 0 });
const scoreLowLunar = computeInvestigationScore(invLunarHeavy, { lunar: 0, prev: 100, det: 100, supp: 100 });
assert(scoreHighLunar > scoreLowLunar, 'Score should respond positively when corresponding weight is high');
```

#### What It Covers:
- Edge-case protection against division by zero when all weight sliders are set to zero.
- Confirms maximum score cap ($99\%$).
- Confirms monotonic directional response to weight adjustments.

#### What It Does NOT Cover:
- Does not test the ranking algorithm against actual flight mission requirements or subjective expert assessments from NASA flight safety engineers.

---

### 2.3. Module 3: `scientific/gravity-curve.test.js` (3 Assertions)

```javascript
// Test 1: Intermediate partial-gravity peak (ACME CFI-G characteristic observation)
const spread0g = calcSpreadAtG(0.0);
const spreadMoon = calcSpreadAtG(0.16);
const spreadEarth = calcSpreadAtG(1.0);

assert(spreadMoon > spread0g, 'Lunar partial gravity (0.16g) should exhibit accelerated flame spread relative to quiescent zero-g (0g)');
assert(spreadMoon > spreadEarth, 'Lunar partial gravity (0.16g) peaks above Earth 1g buoyant spread per ACME CFI-G peak model');

// Test 2: Flame spread positive non-zero floor
assert(spread0g > 0.1, 'Flame spread in 0g must remain positive');
```

#### What It Covers:
- Checks that the Gaussian function in `gravity-curve.test.js` evaluates to a higher value at $g = 0.16$ than at $g = 0.0$ and $g = 1.0$.
- Verifies positive non-zero lower floor in microgravity.

#### What It Does NOT Cover:
- **Tautological Testing Limitation:** The test defines an internal duplicate of the JavaScript Gaussian formula (`gPeakBoost = 1.0 + 0.55 * Math.exp(...)`) and tests that the Gaussian peaks at its own defined center ($0.16$). This proves the JavaScript function executes without throwing, but **does not validate the equation against experimental drop-tower or KC-135 flight measurements**.

---

## 3. Test Coverage Matrix & Blindspots

```
┌───────────────────────────────────────┬───────────────┬─────────────────────────────────────────────────────────┐
│ Functional Area                       │ Test Coverage │ Audit Assessment & Gap Description                      │
├───────────────────────────────────────┼───────────────┼─────────────────────────────────────────────────────────┤
│ Oxygen partial pressure (pO2)         │ Covered (100%)│ Numerically validated for nominal ISS conditions        │
│ Buoyant velocity extinction (g=0)     │ Covered (100%)│ Validated for zero gravity boundary condition           │
│ Exploration Atmosphere risk response  │ Covered (100%)│ Validated elevated score for 34% O2 at 8.2 psia         │
│ Nomex extinction threshold            │ Covered (100%)│ Validated zero rate below 27.5% O2                      │
│ Upper & lower clamp bounds            │ Covered (100%)│ Clamping to 8-99% validated                             │
│ MCDA algorithm division-by-zero       │ Covered (100%)│ Safe fallback validated                                 │
│ Ground truth flight rate comparison   │ MISSING (0%)  │ No comparison against published NASA tables             │
│ Data ingestion pipeline (fetch_psi.py)│ MISSING (0%)  │ Ingestion script not part of automated CI runner       │
│ S3 / CSV manifest schema validation   │ MISSING (0%)  │ Investigation JSON schema not formally validated       │
│ Negative flow & extreme vacuum        │ MISSING (0%)  │ Physical failure modes under P < 1 psia untested        │
│ Vector RAG & Gemini Co-Pilot          │ MISSING (0%)  │ Query engine not covered by automated regression tests  │
└───────────────────────────────────────┴───────────────┴─────────────────────────────────────────────────────────┘
```

---

## 4. Proposed Independent Scientific Validation Test Suite

To achieve true scientific validation, the test suite should be augmented with the following four independent reference benchmarks:

### Benchmark 1: Saffire-I Concurrent Flame Spread Reference Test
- **Reference Source:** Urban et al., *Acta Astronautica* (2019), Table 2.
- **Flight Condition:** $21.5\%\ \text{O}_2$, $101.3\text{ kPa}$, $v_{\text{duct}} = 20.0\text{ cm/s}$, $g = 0.0$.
- **Measured Ground Truth Velocity:** $2.24 \pm 0.15\text{ mm/s}$.
- **Assertion:**
  $$\left|\text{calcSpread}(\text{SIBAL}, 21.5, 14.7, 20.0, 0) - 2.24\right| \le 0.30\text{ mm/s}$$

### Benchmark 2: BASS-II PMMA Quenching Boundary Reference Test
- **Reference Source:** Olson et al., *Combustion Science and Technology* (2015).
- **Flight Condition:** Cast PMMA rod, $14.7\text{ psia}$, $v_{\text{forced}} = 0\text{ cm/s}$ (quiescent).
- **Measured Ground Truth:** Spontaneous flame extinction occurs within $15\text{ seconds}$ in quiescent zero-g.
- **Assertion:**
  $$\text{calculateFlammability}(\{\text{o2}: 21, \text{psi}: 14.7, \text{flow}: 0, \text{g}: 0\}).\text{rates}.\text{pmma} \le 0.3\text{ mm/s}$$

### Benchmark 3: ACME CFI-G Cool Flame Temperature & Inverted Buoyancy Limit
- **Reference Source:** Sunderland et al., *Proc. Combust. Inst.* (2020).
- **Flight Condition:** Ethane diffusion flame, high nitrogen dilution ($X_{\text{O}_2} \le 0.38$).
- **Measured Ground Truth:** Hot-flame extinction with transition to low-temperature cool flame ($T_{\text{flame}} \le 1000\text{ K}$).

### Benchmark 4: Schema Integrity Test for `psi-investigations.json`
- **Assertion:** Every record must contain valid `psiId`, valid `doi` matching regex `^10\.\d{4,9}/[-._;()/:A-Za-z0-9]+$`, and explicit `resourceClassification`.

---

## 5. Audit Conclusion

The current test suite provides **solid functional testing for user interface bounds and mathematical stability**. However, to support scientific publication and NASA flight operations review, the test suite must incorporate **empirical ground truth validation against published tabular data** from NASA Glenn Technical Reports.
