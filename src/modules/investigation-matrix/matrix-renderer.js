/**
 * PSI Investigation Matrix Renderer
 * Filters, ranks, and renders investigation cards in the grid.
 * Light / White Lavender + Royal Purple Theme
 */

import psiInvestigations from '../../data/reference/psi-investigations.json' with { type: 'json' };
import { computeInvestigationScore } from './ranker.js';
import { getSelectedCompareIds } from './comparator.js';
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

  const countLabel = document.getElementById('psi-count-label');
  if (countLabel) countLabel.textContent = scored.length;

  scored.forEach((inv, index) => {
    const isSelected = selectedCompareIds.includes(inv.id) || selectedCompareIds.includes(inv.psiId);

    const card = document.createElement('div');
    card.className = `p-5 rounded-2xl bg-white border transition-all shadow-sm flex flex-col justify-between gap-4 ${isSelected ? 'border-purple-600 ring-2 ring-purple-600/20' : 'border-slate-200 hover:border-purple-300 hover:shadow-md'}`;
    card.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              <i class="fa-solid fa-microchip mr-1"></i>${escapeHtml(inv.rack)}
            </span>
            <span class="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              ${escapeHtml(inv.fuelType)}
            </span>
            <span class="font-mono text-[11px] text-purple-600 font-bold">
              ${escapeHtml(inv.psiId || inv.id)}
            </span>
          </div>
          <div class="text-right">
            <span class="text-[10px] font-mono text-slate-400 block uppercase font-medium">Priority</span>
            <span class="font-mono font-bold text-base ${inv.calculatedScore >= 90 ? 'text-purple-700' : inv.calculatedScore >= 80 ? 'text-emerald-600' : 'text-slate-700'}">
              ${inv.calculatedScore}%
            </span>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-purple-600 font-mono text-xs font-bold">#${index + 1}</span>
            <h4 class="font-bold text-base text-slate-900">
              ${escapeHtml(inv.code)}
            </h4>
            ${inv.verified ? `
              <span class="badge-flight-data">
                <i class="fa-solid fa-circle-check text-[9px]"></i>Flight Data
              </span>
            ` : `
              <span class="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono font-medium">
                Planned CLPS
              </span>
            `}
          </div>
          <p class="text-xs text-slate-600 font-medium mt-0.5">${escapeHtml(inv.title)}</p>
        </div>

        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1 text-slate-600">
          <div class="flex justify-between">
            <span>Data Volume: <strong class="text-slate-900">${escapeHtml(inv.dataSize || 'N/A')}</strong></span>
            <span>Release: <strong class="text-slate-900">${escapeHtml(inv.version || 'Archived')}</strong></span>
          </div>
          <div class="text-emerald-700 truncate font-sans text-[11px] font-medium pt-0.5">
            <i class="fa-solid fa-database mr-1 text-emerald-600"></i>${escapeHtml(inv.resourceClassification || 'Experimental data')}
          </div>
        </div>

        <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">
          ${escapeHtml(inv.summary)}
        </p>
      </div>

      <div class="space-y-3 pt-3 border-t border-slate-100">
        <div class="grid grid-cols-2 gap-2 text-xs font-mono text-slate-500">
          <div><span class="text-slate-400">Flow:</span> ${escapeHtml(inv.airflowRange.split(' ')[0])} cm/s</div>
          <div class="truncate"><span class="text-slate-400">DOI:</span> ${escapeHtml(inv.doi || 'NASA PSI')}</div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="window.toggleCompareStudy('${escapeHtml(inv.id)}')" class="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${isSelected ? 'bg-purple-700 text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-purple-50 hover:text-purple-700'}">
            <i class="fa-solid ${isSelected ? 'fa-check' : 'fa-code-compare'}"></i>
            <span>${isSelected ? 'In Comparator' : 'Add to Compare'}</span>
          </button>
          <a href="${escapeHtml(inv.psiUrl || 'https://psi.nasa.gov/physci/repo/search?q=combustion')}" target="_blank" rel="noopener noreferrer" class="p-2 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-purple-700 hover:bg-purple-50 text-xs transition" title="Open record on NASA PSI repository">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}
