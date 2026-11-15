/**
 * PSI Investigation Matrix Renderer
 * Filters, ranks, and renders investigation cards in the grid.
 */

import psiInvestigations from '../../data/reference/psi-investigations.json' with { type: 'json' };
import { computeInvestigationScore } from './ranker.js';
import { getSelectedCompareIds, toggleCompareStudy } from './comparator.js';
import { escapeHtml } from '../../utils/dom.js';

export function getWeightsFromInputs() {
  const wLunar = parseFloat(document.getElementById('w-lunar')?.value || 90);
  const wPrev = parseFloat(document.getElementById('w-prev')?.value || 85);
  const wDet = parseFloat(document.getElementById('w-det')?.value || 75);
  const wSupp = parseFloat(document.getElementById('w-supp')?.value || 80);

  return { lunar: wLunar, prev: wPrev, det: wDet, supp: wSupp };
}

export function updateSiWeights() {
  const weights = getWeightsFromInputs();
  const valLunar = document.getElementById('val-w-lunar');
  if (valLunar) valLunar.textContent = `${weights.lunar}%`;
  const valPrev = document.getElementById('val-w-prev');
  if (valPrev) valPrev.textContent = `${weights.prev}%`;
  const valDet = document.getElementById('val-w-det');
  if (valDet) valDet.textContent = `${weights.det}%`;
  const valSupp = document.getElementById('val-w-supp');
  if (valSupp) valSupp.textContent = `${weights.supp}%`;

  renderPsiMatrix();
}

export function renderPsiMatrix() {
  const query = (document.getElementById('psi-search-input')?.value || '').toLowerCase();
  const rackFilter = document.getElementById('psi-rack-filter')?.value || 'ALL';
  const fuelFilter = document.getElementById('psi-fuel-filter')?.value || 'ALL';
  const weights = getWeightsFromInputs();
  const selectedCompareIds = getSelectedCompareIds();

  const scored = psiInvestigations
    .map(inv => ({
      ...inv,
      calculatedScore: computeInvestigationScore(inv, weights)
    }))
    .filter(inv => {
      const matchesRack = rackFilter === 'ALL' || inv.rack === rackFilter;
      const matchesFuel = fuelFilter === 'ALL' || inv.fuelType === fuelFilter;
      const textBlob = `${inv.psiId} ${inv.code} ${inv.title} ${inv.rackFull} ${inv.fuelDetails} ${inv.sensors} ${inv.summary} ${inv.resourceClassification}`.toLowerCase();
      const matchesSearch = !query || textBlob.includes(query);
      return matchesRack && matchesFuel && matchesSearch;
    })
    .sort((a, b) => b.calculatedScore - a.calculatedScore);

  const grid = document.getElementById('psi-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  scored.forEach((inv, index) => {
    const isSelected = selectedCompareIds.includes(inv.id) || selectedCompareIds.includes(inv.psiId);
    const rackBadgeColor = inv.rack === 'CIR'
      ? 'bg-cyanHud/15 border-cyanHud/40 text-cyanHud'
      : inv.rack === 'MSG'
        ? 'bg-emeraldSafe/15 border-emeraldSafe/40 text-emeraldSafe'
        : inv.rack === 'CYGNUS'
          ? 'bg-flameAmber/15 border-flameAmber/40 text-flameAmber'
          : 'bg-violet-500/15 border-violet-500/40 text-violet-300';

    const card = document.createElement('div');
    card.className = `hud-panel rounded-xl p-4 flex flex-col justify-between gap-4 transition-all hover:border-cyanHud ${isSelected ? 'border-cyanHud ring-1 ring-cyanHud/50' : ''}`;
    card.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded ${rackBadgeColor}">
              <i class="fa-solid fa-microchip mr-1"></i>${escapeHtml(inv.rack)}
            </span>
            <span class="font-mono text-xs text-slate-300 bg-space px-2 py-0.5 rounded border border-slate-700">
              ${escapeHtml(inv.fuelType)}
            </span>
            <span class="font-mono text-[10px] text-cyanHud bg-cyanHud/10 px-1.5 py-0.5 rounded border border-cyanHud/30 font-bold">
              ${escapeHtml(inv.psiId || inv.id)}
            </span>
          </div>
          <div class="text-right">
            <span class="text-[9px] font-mono text-slate-400 block tracking-tight">PRIORITY RANK</span>
            <span class="font-display font-extrabold text-base ${inv.calculatedScore >= 90 ? 'text-cyanHud' : inv.calculatedScore >= 80 ? 'text-emeraldSafe' : 'text-slate-300'}">
              ${inv.calculatedScore}%
            </span>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-2">
            <span class="text-cyanHud font-mono text-xs font-bold">#${index + 1}</span>
            <h3 class="font-display font-bold text-sm text-white">
              ${escapeHtml(inv.code)}
            </h3>
            ${inv.verified ? `
              <span class="text-[10px] font-mono text-emeraldSafe bg-emeraldSafe/10 border border-emeraldSafe/30 px-1.5 py-0.2 rounded" title="Verified in NASA PSI Database">
                <i class="fa-solid fa-circle-check mr-0.5"></i>PSI VERIFIED
              </span>
            ` : `
              <span class="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.2 rounded" title="Planned Artemis concept; no dataset in PSI">
                <i class="fa-solid fa-clock mr-0.5"></i>CONCEPT ONLY
              </span>
            `}
          </div>
          <p class="text-xs text-slate-300 font-sans mt-0.5 line-clamp-1">${escapeHtml(inv.title)}</p>
        </div>

        <div class="p-2 rounded bg-space/70 border border-slate-800 text-[10px] font-mono space-y-1">
          <div class="flex justify-between text-slate-400">
            <span>DATA SIZE: <strong class="text-white">${escapeHtml(inv.dataSize || 'N/A')}</strong></span>
            <span>STATUS: <strong class="text-slate-200">${escapeHtml(inv.version || 'Archived')}</strong></span>
          </div>
          <div class="text-emerald-400 truncate">
            <i class="fa-solid fa-database mr-1"></i>${escapeHtml(inv.resourceClassification || 'Experimental data')}
          </div>
        </div>

        <p class="text-xs text-slate-400 font-sans leading-relaxed line-clamp-3">
          ${escapeHtml(inv.summary)}
        </p>
      </div>

      <div class="space-y-2 pt-2 border-t border-slate-800/80">
        <div class="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
          <div><span class="text-slate-500">FLOW:</span> ${escapeHtml(inv.airflowRange.split(' ')[0])} cm/s</div>
          <div><span class="text-slate-500">DOI:</span> ${escapeHtml(inv.doi || 'NASA PSI')}</div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="window.toggleCompareStudy('${escapeHtml(inv.id)}')" class="flex-1 py-1.5 px-2 rounded text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 ${isSelected ? 'bg-cyanHud text-space font-bold' : 'bg-panelLight text-slate-200 border border-slate-700 hover:border-cyanHud'}">
            <i class="fa-solid ${isSelected ? 'fa-check' : 'fa-code-compare'}"></i>
            <span>${isSelected ? 'IN COMPARATOR' : 'COMPARE'}</span>
          </button>
          <a href="${escapeHtml(inv.psiUrl || 'https://psi.nasa.gov/physci/repo/search?q=combustion')}" target="_blank" rel="noopener noreferrer" class="p-1.5 px-2.5 rounded bg-space border border-slate-700 text-slate-400 hover:text-cyanHud hover:border-cyanHud text-xs font-mono" title="Open verified record on NASA repository">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}
