/**
 * Habitat Node Controller
 * Manages habitat selection, telemetry sync, and Top PSI study recommendation
 */

import habitatData from '../../data/reference/habitat-nodes.json' with { type: 'json' };
import psiInvestigations from '../../data/reference/psi-investigations.json' with { type: 'json' };
import { setFlameVisualMode } from './flame-chamber.js';
import { applySimPreset } from '../flammability-simulator/presets.js';
import { switchMainTab } from '../../app/router.js';

let currentHabitatKey = 'ISS';

export function selectHabitatNode(nodeKey) {
  const hab = habitatData[nodeKey];
  if (!hab) return;
  currentHabitatKey = nodeKey;

  // Update button active states
  document.querySelectorAll('.habitat-node-btn').forEach(btn => {
    btn.classList.remove('bg-sky-500', 'text-slate-950', 'border-sky-400', 'bg-cyanHud', 'text-space');
    btn.classList.add('bg-surface-raised', 'text-slate-200');
  });
  const activeBtn = document.getElementById('node-btn-' + nodeKey);
  if (activeBtn) {
    activeBtn.classList.remove('bg-surface-raised', 'text-slate-200');
    activeBtn.classList.add('bg-sky-500', 'text-slate-950', 'border-sky-400');
  }

  // Update Top HUD Bar
  const hudTarget = document.getElementById('hud-target-name');
  if (hudTarget) hudTarget.textContent = hab.name;
  const hudGrav = document.getElementById('hud-gravity');
  if (hudGrav) hudGrav.textContent = `${hab.gravity}g`;

  // Update Habitat Telemetry Card
  const titleEl = document.getElementById('hab-selected-title') || document.getElementById('hab-panel-name');
  if (titleEl) titleEl.textContent = hab.name;
  const rackEl = document.getElementById('hab-rack-focus');
  if (rackEl) rackEl.textContent = hab.rackFocus;

  // Globe overlay badge
  const globeTitle = document.getElementById('globe-overlay-title');
  if (globeTitle) globeTitle.textContent = hab.name;
  const globeCoords = document.getElementById('globe-overlay-coords');
  if (globeCoords) globeCoords.textContent = hab.gravityDisplay;

  const hazEl = document.getElementById('globe-overlay-hazard');
  if (hazEl) {
    hazEl.textContent = `STATUS: ${hab.hazardLevel} (${hab.o2}% O₂, ${hab.pressure} psi)`;
    hazEl.className = 'font-mono text-[10px] font-semibold ' + (hab.hazardColor || 'text-emerald-400');
  }

  const hazDesc = document.getElementById('globe-overlay-hazard-desc');
  if (hazDesc) hazDesc.textContent = hab.primaryHazard;

  const riskScoreEl = document.getElementById('hab-risk-score');
  if (riskScoreEl) riskScoreEl.textContent = `${hab.hazardLevel}`;
  const riskDescEl = document.getElementById('hab-risk-desc');
  if (riskDescEl) riskDescEl.textContent = hab.primaryHazard;

  // Metrics Readouts
  const o2El = document.getElementById('hab-o2-val') || document.getElementById('hab-o2');
  if (o2El) o2El.textContent = `${hab.o2}%`;
  const pressEl = document.getElementById('hab-press-val') || document.getElementById('hab-psi');
  if (pressEl) pressEl.textContent = `${hab.pressure} psi`;
  const gravEl = document.getElementById('hab-grav-val') || document.getElementById('hab-g');
  if (gravEl) gravEl.textContent = hab.gravityDisplay;
  const flowEl = document.getElementById('hab-flow-val') || document.getElementById('hab-flow');
  if (flowEl) flowEl.textContent = hab.flowDisplay;
  const protoEl = document.getElementById('hab-suppression-proto');
  if (protoEl) protoEl.textContent = hab.suppressionProtocol;

  // Sync Flame Mode with Habitat Gravity
  if (nodeKey === 'ISS') setFlameVisualMode('0g');
  else if (nodeKey === 'MOON') setFlameVisualMode('lunar');
  else if (nodeKey === 'ARTEMIS') setFlameVisualMode('0g');
  else if (nodeKey === 'SUIT') setFlameVisualMode('0g');
  else if (nodeKey === 'MARS') setFlameVisualMode('lunar');

  // Populate Top PSI Studies
  const listContainer = document.getElementById('hab-top-psi-list');
  if (listContainer) {
    listContainer.innerHTML = '';
    hab.topStudies.forEach(id => {
      const st = psiInvestigations.find(item => item.id === id || item.code === id || item.psiId === id);
      if (!st) return;
      const card = document.createElement('div');
      card.className = 'p-2 rounded bg-surface-sunken border border-white/[0.08] flex items-center justify-between gap-2 hover:border-sky-400/50 transition-all';
      card.innerHTML = `
        <div class="truncate">
          <div class="text-[11px] font-bold text-white flex items-center gap-1.5">
            <span class="text-sky-400 font-mono">${st.code}</span>
            <span class="text-slate-400 font-normal truncate">${st.title}</span>
          </div>
          <div class="text-[10px] font-mono text-slate-400">Rack: <strong class="text-slate-200">${st.rack}</strong> | Fuel: ${st.fuelType}</div>
        </div>
        <button onclick="window.viewPsiStudy('${st.id}')" class="px-2 py-1 rounded bg-sky-500/10 border border-sky-400/30 text-[10px] font-mono text-sky-400 hover:bg-sky-500 hover:text-slate-950 whitespace-nowrap transition-all">
          VIEW DATA <i class="fa-solid fa-arrow-right ml-0.5"></i>
        </button>
      `;
      listContainer.appendChild(card);
    });
  }
}

export function loadHabitatIntoSimulator() {
  const hab = habitatData[currentHabitatKey];
  if (!hab) return;
  switchMainTab('tab-simulator');
  applySimPreset(hab.o2, hab.pressure, hab.flow, hab.gravity, hab.name);
}

export function getCurrentHabitat() {
  return habitatData[currentHabitatKey];
}
