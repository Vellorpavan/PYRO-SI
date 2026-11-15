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
  setText('val-sim-o2', `${o2}%`);
  setText('val-sim-psi', `${psi} psi`);
  setText('val-sim-flow', `${flow} cm/s`);

  let gTag = g === 0 ? '0.00g (µg)' : g <= 0.18 ? `${g.toFixed(2)}g (Lunar)` : g <= 0.42 ? `${g.toFixed(2)}g (Mars)` : `${g.toFixed(2)}g`;
  setText('val-sim-g', gTag);

  // Run Calculations
  const results = calculateFlammability({ o2, psi, flow, g });

  // Update Outputs
  setText('pred-ppo2-val', `${results.ppo2.toFixed(2)} psi`);
  setText('pred-veff-val', `${results.vEffective.toFixed(1)} cm/s`);
  setText('pred-loi-val', `${results.loi.toFixed(1)}%`);
  setText('pred-spread-index', `${results.spreadIndex.toFixed(2)}x`);
  setText('pred-risk-score', `${results.riskScore}%`);

  const riskEl = document.getElementById('pred-risk-score');
  const riskTagEl = document.getElementById('pred-risk-tag');

  if (riskEl && riskTagEl) {
    if (results.riskScore >= 75) {
      riskEl.className = 'font-display font-black text-4xl text-crimsonAlert';
      riskTagEl.textContent = 'EXTREME FLAMMABILITY HAZARD';
      riskTagEl.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-crimsonAlert/20 text-crimsonAlert border border-crimsonAlert/40';
    } else if (results.riskScore >= 45) {
      riskEl.className = 'font-display font-black text-4xl text-flameAmber';
      riskTagEl.textContent = 'ELEVATED RISK REGIME';
      riskTagEl.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-flameAmber/20 text-flameAmber border border-flameAmber/40';
    } else {
      riskEl.className = 'font-display font-black text-4xl text-emeraldSafe';
      riskTagEl.textContent = 'CONTROLLED LOW SPREAD';
      riskTagEl.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-emeraldSafe/20 text-emeraldSafe border border-emeraldSafe/40';
    }
  }

  // Material Spread Rates
  setText('rate-sibal', `${results.rates.sibal} mm/s`);
  setText('rate-pmma', `${results.rates.pmma} mm/s`);
  setText('rate-silicone', `${results.rates.silicone} mm/s`);
  setText('rate-nomex', `${results.rates.nomex} mm/s`);

  // Suppression Recommendation
  setText('pred-suppression-rec', results.suppressionRec);

  // Redraw Bounding Curve Chart
  drawPartialGChart(o2, psi, flow, g);
}
