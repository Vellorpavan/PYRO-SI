# GODEYE // PYRO-SI — Phase 1.1: Independent Scientific Evidence Audit

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Document Identifier:** NASA-PYRO-AUDIT-1.1  
**Author / Governance:** Independent NASA Research Data Auditor & Scientific Software Verification Engineer  
**Audit Standard:** NASA Scientific Information Policy (SPD-41a), NASA Open Science Data Integrity Guidelines

---

## 1. Executive Summary & Audit Mandate

This document establishes the independent scientific evidence audit for **GODEYE // PYRO-SI** (Phase 1.1).

While the Phase 1 Master Product Requirements successfully defined the operational scope and epistemic taxonomy, several scientific assertions in previous project documentation required forensic verification against primary NASA records:
- **Misattribution of suppression technologies:** Previous documents conflated fundamental science experiments (e.g., FLEX liquid droplet burning) with applied hardware programs (fine water mist extinguishers).
- **Misattribution of extinguishing agents:** BASS-II was erroneously cited as testing high-pressure $\text{CO}_2$ suppression, whereas its primary extinction experiments utilized **nitrogen ($\text{N}_2$) dilution inerting and low-flow convective starvation**.
- **Naming and objective errors:** DAFT was misnamed "Dust Aerosol Flammability Test"; primary records prove it is the **Dust and Aerosol Measurement Feasibility Test**, a sensor validation flight for the condensation particle counter used in SAME.
- **Dataset volume ambiguity:** Multi-gigabyte repository totals (e.g., 255.77 GB for BASS-II) represent total raw video collections on NASA servers, which must be clearly delineated from the structured tabular metadata and numerical time-series ingested locally.
- **Standards citations:** Hypoxia and total pressure limits have been reconciled with normative NASA-STD-3001 Volume 2 requirements (`[V2 6002]`, `[V2 6003]`, `[V2 6006]`).

**Audit Rule:** Every claim in active scientific outputs must be directly traceable to an official NASA PSI record, peer-reviewed NASA Technical Memorandum (TM), or published AIAA/Combustion Institute flight report. Unverified claims are designated `UNVERIFIED` and removed from production outputs.

---

## 2. Investigation Catalogue Review & Systematic Categorization

To ensure that the platform's core investigation selection is scientifically justified, the audit evaluated the wider NASA microgravity combustion archive across 17 candidate flight investigations:

```
┌──────────────┬──────────────┬──────────────────────────────┬────────────────────────────────────────────────────────┐
│ Mission Code │ PSI ID       │ Primary Hardware Facility    │ Fire-Safety Categorization & Relevance Summary         │
├──────────────┼──────────────┼──────────────────────────────┼────────────────────────────────────────────────────────┤
│ BASS         │ PSI-26       │ MSG (ISS Destiny)            │ Material Flammability & Quenching (Small flat samples) │
│ BASS-II      │ PSI-25       │ MSG (ISS Destiny)            │ CORE CATALOGUE: Solid Material Flammability & N₂ Inert │
│ SAFFIRE-I    │ PSI-98       │ Cygnus Uncrewed Vehicle      │ CORE CATALOGUE: Large-Scale Concurrent Fabric Spread   │
│ SAFFIRE-II   │ PSI-99       │ Cygnus Uncrewed Vehicle      │ Supporting: Multi-material LOI screening (9 samples)   │
│ SAFFIRE-III  │ PSI-100      │ Cygnus Uncrewed Vehicle      │ Supporting: High-flow (20 cm/s) large-scale SIBAL burn │
│ SAME         │ PSI-46       │ MSG (ISS Destiny)            │ Precursor: Smoke particle generation from overheated foam│
│ SAME-R       │ PSI-101      │ MSG (ISS Destiny)            │ CORE CATALOGUE: Fire Detection (Aerosol size growth)   │
│ FLEX         │ PSI-69       │ CIR / MDCA (ISS Destiny)     │ CORE CATALOGUE: Cool Flames & Extinction Fundamentals  │
│ FLEX-2       │ PSI-70       │ CIR / MDCA (ISS Destiny)     │ Supporting: Droplet mixtures and binary alkane fuels   │
│ ACME: CFI-G  │ PSI-159      │ CIR (ISS Destiny)            │ CORE CATALOGUE: Gaseous Cool Flames (Alkane kinetics)  │
│ ACME: BRE    │ PSI-20       │ CIR (ISS Destiny)            │ CORE CATALOGUE: Solid Burning Rate Emulation (Porous)  │
│ ACME: E-FIELD│ PSI-22       │ CIR (ISS Destiny)            │ CORE CATALOGUE: Electric-Field Convective Draft Proxy  │
│ ACME: s-Flame│ PSI-158      │ CIR (ISS Destiny)            │ Combustion Fundamentals: Spherical diffusion structure │
│ DAFT         │ PSI-47       │ Express Rack 4 (ISS)         │ CORE CATALOGUE: Fire Detection (Dust sensor validation)│
│ DAFT-2       │ PSI-48       │ ISS Node 1                   │ Supporting: Continuous aerosol baseline monitoring     │
│ SPICE        │ PSI-107      │ MSG (ISS Destiny)            │ CORE CATALOGUE: Soot Smoke Point & Radiative Loss      │
│ SLICE        │ PSI-102      │ MSG (ISS Destiny)            │ Combustion Fundamentals: Laminar flame liftoff limits  │
│ FM2 / LUCI   │ NASA-FM2     │ Artemis CLPS Lander (Future) │ CORE CATALOGUE: Priority Evidence Gap (0.166g Moon)   │
└──────────────┴──────────────┴──────────────────────────────┴────────────────────────────────────────────────────────┘
```

### Justification for the 10 Core Investigations Selection:
1. **BASS-II (`PSI-25`):** Essential for **solid material flammability (PMMA, fabrics)** in forced flows ($0 - 40\text{ cm/s}$) and extinction via nitrogen dilution.
2. **SAFFIRE-I (`PSI-98`):** Essential for **large-scale ($>0.5\text{ m}$) solid fabric combustion** in realistic spacecraft volume without crew risk.
3. **FLEX (`PSI-69`):** Foundational for **cool flame chemical kinetics** and extinction thresholds under pure spherical diffusion.
4. **ACME: CFI-G (`PSI-159`):** Critical for understanding **gaseous low-temperature combustion** without buoyant distortion.
5. **ACME: BRE (`PSI-20`):** Provides the mathematical link between **porous gas burner feedback and solid polymer pyrolysis**.
6. **SAME-R (`PSI-101`):** Foundational for **fire detection**, proving that microgravity smoke particles agglomerate into significantly larger sizes ($d_p > 0.5\ \mu\text{m}$) than on Earth.
7. **ACME: E-FIELD (`PSI-22`):** Serves as a laboratory analogue demonstrating how artificial body forces mimic buoyant convective acceleration.
8. **DAFT (`PSI-47`):** Essential for **fire detection reliability**, demonstrating how background dust particles interact with optical and condensation detectors.
9. **SPICE (`PSI-107`):** Characterizes the **smoke point transition**, establishing when non-buoyant flames emit unburned soot particles.
10. **FM2 / LUCI (`NASA-FM2`):** Ground-truth benchmark for the **partial-gravity combustion evidence gap** ($0.166\text{g}$ on the lunar surface).

---

## 3. Audit of Disputed Scientific Claims & Corrections

```
┌────┬─────────────────────────────────┬──────────────────┬────────────────────────────────────────────────────────┐
│ ID │ Specific Claim Audited          │ Audit Verdict    │ Primary Evidence & Required System Correction          │
├────┼─────────────────────────────────┼──────────────────┼────────────────────────────────────────────────────────┤
│ A01│ "FLEX / PSI-69 demonstrated     │ INCORRECT /      │ FLEX tested isolated liquid hydrocarbon droplets       │
│    │ fine-water-mist fire            │ MISMAPPED        │ (heptane/methanol) and gaseous dilution. Fine water    │
│    │ suppression in microgravity."   │                  │ mist was an applied engineering development by NASA    │
│    │                                 │                  │ Glenn / ADA Technologies / Colorado School of Mines.   │
│    │                                 │                  │ Re-mapped as fundamental droplet science informing     │
│    │                                 │                  │ separate applied water mist technology.                │
├────┼─────────────────────────────────┼──────────────────┼────────────────────────────────────────────────────────┤
│ A02│ "BASS-II evaluated high-pressure│ INCORRECT /      │ Primary BASS-II protocols (AIAA 2014-0414) prove solid │
│    │ CO₂ fire extinguisher bottles   │ MISMAPPED        │ fuel extinction was achieved by nitrogen (N₂) dilution │
│    │ on burning PMMA samples."       │                  │ inerting and flow velocity reduction, NOT CO₂ bottles. │
│    │                                 │                  │ Corrected to "Nitrogen dilution inerting & low-flow    │
│    │                                 │                  │ convective extinction".                                │
├────┼─────────────────────────────────┼──────────────────┼────────────────────────────────────────────────────────┤
│ A03│ "DAFT stands for Dust Aerosol   │ FACTUAL ERROR /  │ Official NASA title is "Dust and Aerosol Measurement   │
│    │ Flammability Test."             │ TITLE ERROR      │ Feasibility Test" (AIAA 2012-3482). It evaluated a     │
│    │                                 │                  │ modified P-Trak condensation counter for SAME, NOT dust│
│    │                                 │                  │ flammability. Title corrected across all records.      │
├────┼─────────────────────────────────┼──────────────────┼────────────────────────────────────────────────────────┤
│ A04│ "SIBAL is a generic trade name  │ INCOMPLETE /     │ SIBAL stands for "Solid Inflammatory Boundary at Low   │
│    │ for spacecraft cotton fabric."  │ CLARIFIED        │ Speed" fabric. Composed of 75% cotton / 25% fiberglass │
│    │                                 │                  │ weave by weight (0.37 mm thick). Fiberglass preserves  │
│    │                                 │                  │ matrix geometry after cotton burns away. Sourced.      │
├────┼─────────────────────────────────┼──────────────────┼────────────────────────────────────────────────────────┤
│ A05│ "Nomex is completely inflammable│ CONTEXT ERROR    │ Nomex HT90-40 has an LOI of 28–30% O₂. In 21% O₂ air,  │
│    │ in all spacecraft atmospheres." │                  │ it is self-extinguishing. In Artemis 34% O₂ EAM, Nomex │
│    │                                 │                  │ exceeds its LOI and burns. Sourced to NASA-STD-6001B.  │
├────┼─────────────────────────────────┼──────────────────┼────────────────────────────────────────────────────────┤
│ A06│ "NASA-STD-3001 mandates pO₂     │ CITATION ERROR   │ Reconciled with NASA-STD-3001 Vol 2 Rev D:             │
│    │ limits under [V2 6005]."        │                  │ [V2 6002]: Min 30% diluent gas for duration >2 weeks.  │
│    │                                 │                  │ [V2 6003]: Inspired O₂ range (Table 6.2-1, ~18.5–20.9  │
│    │                                 │                  │ kPa normoxic target). [V2 6006]: Total pressure limits.│
├────┼─────────────────────────────────┼──────────────────┼────────────────────────────────────────────────────────┤
│ A07│ "Dataset volumes (e.g. 255 GB)  │ ARCHITECTURAL    │ Volumes represent total raw multi-camera video on NASA │
│    │ are stored in the local repo."  │ AMBIGUITY        │ PSI servers. Local repository stores structured JSON   │
│    │                                 │                  │ metadata and extracted tables. Provenance clarified.   │
├────┼─────────────────────────────────┼──────────────────┼────────────────────────────────────────────────────────┤
│ A08│ "Claimed DOIs are dataset       │ METADATA         │ Claimed DOIs resolve to peer-reviewed flight papers in │
│    │ DOIs on data.nasa.gov."         │ DISTINCTION      │ AIAA, Combustion and Flame, and Proc Combust Inst, not │
│    │                                 │                  │ direct dataset handles. Explicitly labeled as Paper DOI│
└────┴─────────────────────────────────┴──────────────────┴────────────────────────────────────────────────────────┘
```

---

## 4. Simulator Physical Grounding & Mathematical Dissection

The Flammability Simulator in `src/modules/flammability-simulator/physics-model.js` was audited line by line:

### 4.1. Mathematical Formulae & Constants
1. **Oxygen Partial Pressure ($p\text{O}_2$):**
   $$p\text{O}_2 = \left(\frac{Y_{\text{O}_2}}{100}\right) \times P_{\text{total}}$$
   - *Classification:* **`DERIVED`** (Dalton's Law of Partial Pressures). Exact.
2. **Effective Velocity ($v_{\text{effective}}$):**
   $$v_{\text{buoy}} = 32 \times \sqrt{g}\quad [\text{cm/s}],\quad v_{\text{effective}} = \sqrt{v_{\text{forced}}^2 + v_{\text{buoy}}^2}$$
   - *Classification:* **`MODELLED`** (Semi-empirical root-sum-square proxy).
   - *Constant Source:* $32\text{ cm/s}$ corresponds to typical upward buoyant convective draft velocities observed in $1\text{g}$ adjacent to thin burning fuel surfaces.
   - *Limitation:* Assumes orthogonal flow vector alignment.
3. **Limiting Oxygen Index ($\text{LOI}_{\text{effective}}$):**
   $$\text{flowFactor} = \begin{cases} -1.4 & 3 \le v_{\text{eff}} \le 25\text{ cm/s} \\ +1.8 & v_{\text{eff}} < 3\text{ cm/s} \\ +0.4 & v_{\text{eff}} > 25\text{ cm/s} \end{cases}$$
   $$\text{LOI} = \text{clamp}\left((17.5 + \text{flowFactor}) \times \left(\frac{14.7}{P_{\text{total}}}\right)^{0.18},\ 12.5,\ 24.0\right)$$
   - *Classification:* **`MODELLED`** (Phenomenological scaling model).
   - *Limitation:* Qualitative representation of the flammability corridor; clamped between physical bounds $[12.5\%, 24.0\%]$.
4. **Solid Material Flame Spread Rate ($V_f$):**
   - Implements thin-fuel thermal energy balance (De Ris, 1969).
   - *Classification:* **`MODELLED`** (Theoretical proxy).
   - *Action Taken:* All synthetic $\pm 14\%$ uncertainty bounds have been excised. Output spread rates represent qualitative scaling trends.

---

## 5. Audit Deliverables Summary

The Phase 1.1 audit has produced five dedicated evidence documents:
1. `docs/PHASE_1_1_EVIDENCE_AUDIT.md` (This document)
2. `docs/INVESTIGATION_SOURCE_LEDGER.md` (Detailed 17-investigation source ledger)
3. `docs/DATA_AVAILABILITY_MATRIX.md` (Systematic asset breakdown by data category)
4. `docs/FIRE_SAFETY_EVIDENCE_MAP.md` (Mapping to Prevention, Detection, and Suppression priorities)
5. `docs/SCIENTIFIC_CLAIMS_CORRECTIONS.md` (Forensic line-by-line correction ledger)

**Recommendation:** Proceed to inspect and record the specific source ledger and data availability matrix before seeking Phase 2 implementation approval.
