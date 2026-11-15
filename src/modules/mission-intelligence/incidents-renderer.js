/**
 * Mission Incidents & Earth Spinoffs Renderer
 */

import data from '../../data/reference/incidents-spinoffs.json' with { type: 'json' };
import { escapeHtml } from '../../utils/dom.js';

export function renderIncidentsAndSpinoffs() {
  const incidentsContainer = document.getElementById('incidents-list-container');
  const spinoffsContainer = document.getElementById('spinoffs-list-container');

  if (incidentsContainer && data.incidents) {
    incidentsContainer.innerHTML = data.incidents.map(inc => `
      <div class="p-3.5 rounded-lg bg-panelLight/60 border border-slate-800 space-y-2 hover:border-crimsonAlert/40 transition-all">
        <div class="flex items-center justify-between gap-2">
          <span class="font-display font-bold text-xs text-white">${escapeHtml(inc.mission)}</span>
          <span class="text-[10px] font-mono text-slate-400 bg-space px-2 py-0.5 rounded border border-slate-700">${escapeHtml(inc.date)}</span>
        </div>
        <div class="text-[11px] font-mono text-amber-300">
          <i class="fa-solid fa-location-dot mr-1"></i>${escapeHtml(inc.location)}
        </div>
        <div class="text-xs text-slate-300 font-sans space-y-1">
          <p><strong class="text-slate-400 font-mono text-[10px]">ATMOSPHERE:</strong> ${escapeHtml(inc.atmosphere)}</p>
          <p><strong class="text-slate-400 font-mono text-[10px]">ROOT CAUSE:</strong> ${escapeHtml(inc.rootCause)}</p>
          <p class="text-slate-400 text-[11px] pt-1"><strong class="text-emeraldSafe font-mono text-[10px]">OUTCOME & REDESIGN:</strong> ${escapeHtml(inc.outcome)}</p>
        </div>
      </div>
    `).join('');
  }

  if (spinoffsContainer && data.spinoffs) {
    spinoffsContainer.innerHTML = data.spinoffs.map(spin => `
      <div class="p-3.5 rounded-lg bg-panelLight/60 border border-slate-800 space-y-2 hover:border-cyanHud/40 transition-all">
        <div class="flex items-center justify-between gap-2">
          <span class="font-display font-bold text-xs text-white">${escapeHtml(spin.title)}</span>
          <span class="text-[10px] font-mono text-cyanHud bg-cyanHud/10 px-2 py-0.5 rounded border border-cyanHud/30">EARTH BENEFIT</span>
        </div>
        <div class="text-[11px] font-mono text-slate-400">
          <i class="fa-solid fa-rocket mr-1 text-flameAmber"></i>NASA Origin: <strong class="text-slate-300">${escapeHtml(spin.origin)}</strong>
        </div>
        <p class="text-xs text-slate-300 font-sans leading-relaxed">${escapeHtml(spin.description)}</p>
        <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400 font-sans">
          <strong class="text-slate-200 font-mono text-[10px] block mb-0.5">TERRESTRIAL DEPLOYMENT:</strong>
          ${escapeHtml(spin.earthApplication)}
        </div>
      </div>
    `).join('');
  }
}
