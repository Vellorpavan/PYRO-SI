/**
 * Flammability Simulator Controller & Presets
 * Synchronizes inputs, evaluates physiological standards, and updates UI outputs.
 */

import { calculateFlammability, PSI_TO_KPA } from './physics-model.js';
import { drawPartialGChart } from './partial-g-chart.js';
import { setText } from '../../utils/dom.js';

const PRESET_MAP = {
  iss: { o2: 21.0, psi: 14.7, flow: 12.0, g: 0.0, label: 'ISS Nominal (21% O₂ • 14.7 psi • 0g)' },
  lunar: { o2: 34.0, psi: 8.2, flow: 8.0, g: 0.166, label: 'Lunar Base Camp (34% O₂ • 8.2 psi • 0.166g)' },
  artemis: { o2: 30.0, psi: 10.2, flow: 15.0, g: 0.0, label: 'Artemis Gateway (30% O₂ • 10.2 psi • 0g)' },
  earth: { o2: 21.0, psi: 14.7, flow: 10.0, g: 1.0, label: 'Earth Standard (21% O₂ • 14.7 psi • 1.0g)' },
  suit: { o2: 100.0, psi: 4.3, flow: 28.0, g: 0.0, label: 'EVA Spacesuit Loop (100% O₂ • 4.3 psi • 0g)' }
};

export function applySimPreset(param1, psi, flow, g, label) {
  let o2Val, psiVal, flowVal, gVal, labelVal;

  if (typeof param1 === 'string' && PRESET_MAP[param1.toLowerCase()]) {
    const p = PRESET_MAP[param1.toLowerCase()];
    o2Val = p.o2;
    psiVal = p.psi;
    flowVal = p.flow;
    gVal = p.g;
    labelVal = p.label;
  } else {
    o2Val = typeof param1 === 'number' ? param1 : parseFloat(param1);
    psiVal = psi;
    flowVal = flow;
    gVal = g;
    labelVal = label;
  }

  const o2El = document.getElementById('sim-o2');
  const psiEl = document.getElementById('sim-psi');
  const flowEl = document.getElementById('sim-flow');
  const gEl = document.getElementById('sim-g');

  if (o2El && o2Val !== undefined) o2El.value = o2Val;
  if (psiEl && psiVal !== undefined) psiEl.value = psiVal;
  if (flowEl && flowVal !== undefined) flowEl.value = flowVal;
  if (gEl && gVal !== undefined) gEl.value = gVal;

  const presetLabel = document.getElementById('sim-preset-label');
  if (presetLabel && labelVal) {
    presetLabel.textContent = labelVal;
  }

  runPredictiveModel();
}

export function runPredictiveModel() {
  const o2El = document.getElementById('sim-o2');
  const psiEl = document.getElementById('sim-psi');
  const flowEl = document.getElementById('sim-flow');
  const gEl = document.getElementById('sim-g');

  if (!o2El || !psiEl || !flowEl || !gEl) return;

  const o2 = parseFloat(o2El.value);
  const psi = parseFloat(psiEl.value);
  const flow = parseFloat(flowEl.value);
  const g = parseFloat(gEl.value);

  // Sync Input Value Displays
  const o2Str = `${o2.toFixed(1)}%`;
  setText('val-sim-o2', o2Str);
  setText('sim-o2-label', o2Str);

  const psiKpa = (psi * PSI_TO_KPA).toFixed(1);
  const psiStr = `${psi.toFixed(1)} psi (${psiKpa} kPa)`;
  setText('val-sim-psi', psiStr);
  setText('sim-psi-label', psiStr);

  const flowStr = `${flow.toFixed(1)} cm/s`;
  setText('val-sim-flow', flowStr);
  setText('sim-flow-label', flowStr);

  let gTag = g === 0 ? '0.00g (µg)' : g <= 0.18 ? `${g.toFixed(2)}g (Lunar)` : g <= 0.42 ? `${g.toFixed(2)}g (Mars)` : `${g.toFixed(2)}g`;
  setText('val-sim-g', gTag);
  setText('sim-g-label', gTag);

  // Run Calculations
  const results = calculateFlammability({ o2, psi, flow, g });

  // Update Derived Oxygen Partial Pressure
  const ppo2Psi = results.ppo2.toFixed(2);
  const ppo2Kpa = results.ppo2_kPa.toFixed(1);
  const ppo2Str = `${ppo2Psi} psi (${ppo2Kpa} kPa)`;
  setText('pred-ppo2-val', ppo2Str);
  setText('pred-ppo2', ppo2Str);

  // Update Effective Airflow Velocity (Derived)
  setText('pred-veff-val', `${results.vEffective.toFixed(1)} cm/s`);

  // Update LOI (Modelled)
  const loiStr = `${results.loi.toFixed(1)}%`;
  setText('pred-loi-val', loiStr);
  setText('pred-loi', loiStr);

  // Update Spread Index (Modelled)
  setText('pred-spread-index', `${results.spreadIndex.toFixed(2)}x`);

  // Update Flammability Risk Score
  const riskStr = `${results.riskScore}%`;
  setText('pred-risk-score', riskStr);

  const riskEl = document.getElementById('pred-risk-score');
  const riskTagEl = document.getElementById('pred-risk-tag');

  if (riskEl && riskTagEl) {
    if (results.riskScore >= 75) {
      riskEl.className = 'text-2xl font-bold text-rose-600 mt-1';
      riskTagEl.textContent = 'EXTREME FLAMMABILITY HAZARD';
      riskTagEl.className = 'text-xs text-rose-600 font-semibold';
    } else if (results.riskScore >= 45) {
      riskEl.className = 'text-2xl font-bold text-amber-600 mt-1';
      riskTagEl.textContent = 'ELEVATED FLAMMABILITY RISK';
      riskTagEl.className = 'text-xs text-amber-600 font-semibold';
    } else {
      riskEl.className = 'text-2xl font-bold text-emerald-600 mt-1';
      riskTagEl.textContent = 'CONTROLLED COMBUSTION REGIME';
      riskTagEl.className = 'text-xs text-emerald-600 font-semibold';
    }
  }

  // Update Physiological Compliance Card (NASA-STD-3001 Rev F Table 6.2-1)
  const physBadge = document.getElementById('pred-phys-badge');
  const physDesc = document.getElementById('pred-phys-desc');
  if (physBadge) {
    if (results.physiological.isNormoxicTarget) {
      physBadge.textContent = 'NASA-STD-3001: NORMOXIA TARGET (145–155 mmHg)';
      physBadge.className = 'font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold';
    } else if (results.physiological.isMildHypoxia) {
      physBadge.textContent = 'NASA-STD-3001: MILD HYPOXIA (QUALIFIED EAM)';
      physBadge.className = 'font-mono text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold';
    } else if (results.physiological.isModerateHypoxia || results.physiological.isAcuteHypoxia) {
      physBadge.textContent = 'NASA-STD-3001: HYPOXIA HAZARD (<127 mmHg)';
      physBadge.className = 'font-mono text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold';
    } else if (results.physiological.isHyperoxic) {
      physBadge.textContent = 'NASA-STD-3001: HYPEROXIA RISK (>155 mmHg)';
      physBadge.className = 'font-mono text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold';
    } else {
      physBadge.textContent = 'NASA-STD-3001: REVISION F EVALUATED';
      physBadge.className = 'font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold';
    }
  }
  if (physDesc) {
    const pDry = `Ambient Dry pO₂: ${results.physiological.pO2_dry_kPa.toFixed(1)} kPa (${results.physiological.pO2_dry_mmHg.toFixed(1)} mmHg)`;
    const pTrach = `Tracheal Inspired PIO₂: ${results.physiological.PIO2_kPa.toFixed(1)} kPa (${results.physiological.PIO2_mmHg.toFixed(1)} mmHg)`;
    physDesc.innerHTML = `<span class="font-bold text-slate-800">${pDry}</span> | <span class="font-bold text-purple-700">${pTrach}</span><br><span class="text-slate-600">${results.physiological.message}</span>`;
  }

  // Material Spread Rates
  const sibalStr = `${results.rates.sibal} mm/s`;
  setText('rate-sibal', sibalStr);
  setText('mat-sibal-rate', sibalStr);

  const pmmaStr = `${results.rates.pmma} mm/s`;
  setText('rate-pmma', pmmaStr);
  setText('mat-pmma-rate', pmmaStr);

  const siliconeStr = `${results.rates.silicone} mm/s`;
  setText('rate-silicone', siliconeStr);
  setText('mat-silicone-rate', siliconeStr);

  const nomexStr = `${results.rates.nomex} mm/s`;
  setText('rate-nomex', nomexStr);
  setText('mat-nomex-rate', nomexStr);

  // Material Progress Bars
  const sibalBar = document.getElementById('mat-sibal-bar');
  if (sibalBar) sibalBar.style.width = `${Math.min(100, Math.max(5, (results.rates.sibal / 7.0) * 100))}%`;

  const pmmaBar = document.getElementById('mat-pmma-bar');
  if (pmmaBar) pmmaBar.style.width = `${Math.min(100, Math.max(5, (results.rates.pmma / 5.0) * 100))}%`;

  const siliconeBar = document.getElementById('mat-silicone-bar');
  if (siliconeBar) siliconeBar.style.width = `${Math.min(100, Math.max(5, (results.rates.silicone / 4.0) * 100))}%`;

  const nomexBar = document.getElementById('mat-nomex-bar');
  if (nomexBar) nomexBar.style.width = `${Math.min(100, Math.max(2, (results.rates.nomex / 2.0) * 100))}%`;

  // Suppression Recommendation
  setText('pred-suppression-rec', results.suppressionRec);

  // Redraw Exploratory Partial-G Bounding Curve Chart
  drawPartialGChart(o2, psi, flow, g);
}
