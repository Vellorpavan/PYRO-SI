/**
 * Flammability Simulator Controller & Presets
 */

import { calculateFlammability } from './physics-model.js';
import { drawPartialGChart } from './partial-g-chart.js';
import { setText } from '../../utils/dom.js';

export function applySimPreset(o2, psi, flow, g, label) {
  const o2El = document.getElementById('sim-o2');
  const psiEl = document.getElementById('sim-psi');
  const flowEl = document.getElementById('sim-flow');
  const gEl = document.getElementById('sim-g');

  if (o2El) o2El.value = o2;
  if (psiEl) psiEl.value = psi;
  if (flowEl) flowEl.value = flow;
  if (gEl) gEl.value = g;

  const presetLabel = document.getElementById('sim-preset-label');
  if (presetLabel && label) {
    presetLabel.textContent = label;
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

  // Sync Input Value Displays (Supports both ID schemes)
  const o2Str = `${o2.toFixed(1)}%`;
  setText('val-sim-o2', o2Str);
  setText('sim-o2-label', o2Str);

  const psiStr = `${psi.toFixed(1)} psi`;
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

  // Update Outputs (Supports both ID schemes)
  const ppo2Str = `${results.ppo2.toFixed(2)} psi`;
  setText('pred-ppo2-val', ppo2Str);
  setText('pred-ppo2', ppo2Str);

  setText('pred-veff-val', `${results.vEffective.toFixed(1)} cm/s`);

  const loiStr = `${results.loi.toFixed(1)}%`;
  setText('pred-loi-val', loiStr);
  setText('pred-loi', loiStr);

  setText('pred-spread-index', `${results.spreadIndex.toFixed(2)}x`);

  const riskStr = `${results.riskScore}%`;
  setText('pred-risk-score', riskStr);

  const riskEl = document.getElementById('pred-risk-score');
  const riskTagEl = document.getElementById('pred-risk-tag');

  if (riskEl && riskTagEl) {
    if (results.riskScore >= 75) {
      riskEl.className = 'text-xl font-extrabold text-rose-500 mt-0.5 telemetry-num';
      riskTagEl.textContent = 'EXTREME HAZARD';
      riskTagEl.className = 'text-[10px] text-rose-400 font-bold';
    } else if (results.riskScore >= 45) {
      riskEl.className = 'text-xl font-extrabold text-amber-400 mt-0.5 telemetry-num';
      riskTagEl.textContent = 'ELEVATED RISK';
      riskTagEl.className = 'text-[10px] text-amber-400 font-bold';
    } else {
      riskEl.className = 'text-xl font-extrabold text-emerald-400 mt-0.5 telemetry-num';
      riskTagEl.textContent = 'CONTROLLED SPREAD';
      riskTagEl.className = 'text-[10px] text-emerald-400 font-bold';
    }
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

  // Redraw Bounding Curve Chart
  drawPartialGChart(o2, psi, flow, g);
}
