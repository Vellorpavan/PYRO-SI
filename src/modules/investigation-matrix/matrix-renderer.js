/**
 * PSI Investigation Matrix Renderer
 * Filters, ranks, and renders dynamic investigation cards in the grid.
 * Light / White Lavender + Royal Purple Theme
 * 
 * SCIENTIFIC GOVERNANCE:
 * - Supports dynamic, extensible catalogues (no fixed 10-investigation ceiling).
 * - Separates verified scientific metadata from downloadable experimental assets.
 * - Displays verifiable provenance and original NASA identifiers.
 * - Prioritization weights calculate transparent relevance with driver explanations and missing evidence.
 */

import defaultInvestigations from '../../data/reference/psi-investigations.json' with { type: 'json' };
import { computeInvestigationScore, evaluateInvestigationRelevance, DEFAULT_PRIORITY_WEIGHTS } from './ranker.js';
import { getSelectedCompareIds, renderComparisonTable } from './comparator.js';
import { escapeHtml } from '../../utils/dom.js';

let activeCatalogue = [...defaultInvestigations];

export function setInvestigationCatalogue(newRecords) {
  if (Array.isArray(newRecords) && newRecords.length > 0) {
    activeCatalogue = [...newRecords];
    renderPsiMatrix();
  }
}

export function getInvestigationCatalogue() {
  return activeCatalogue;
}

export function getWeightsFromInputs() {
  const wLunar = parseFloat(document.getElementById('w-lunar')?.value ?? DEFAULT_PRIORITY_WEIGHTS.lunar);
  const wPrev = parseFloat(document.getElementById('w-prev')?.value ?? DEFAULT_PRIORITY_WEIGHTS.prev);
  const wDet = parseFloat(document.getElementById('w-det')?.value ?? DEFAULT_PRIORITY_WEIGHTS.det);
  const wSupp = parseFloat(document.getElementById('w-supp')?.value ?? DEFAULT_PRIORITY_WEIGHTS.supp);

  return {
    lunar: isNaN(wLunar) ? DEFAULT_PRIORITY_WEIGHTS.lunar : wLunar,
    prev: isNaN(wPrev) ? DEFAULT_PRIORITY_WEIGHTS.prev : wPrev,
    det: isNaN(wDet) ? DEFAULT_PRIORITY_WEIGHTS.det : wDet,
    supp: isNaN(wSupp) ? DEFAULT_PRIORITY_WEIGHTS.supp : wSupp
  };
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
  renderComparisonTable(weights);
}

export function resetPrioritizationWeights() {
  const elLunar = document.getElementById('w-lunar');
  const elPrev = document.getElementById('w-prev');
  const elDet = document.getElementById('w-det');
  const elSupp = document.getElementById('w-supp');

  if (elLunar) elLunar.value = DEFAULT_PRIORITY_WEIGHTS.lunar;
  if (elPrev) elPrev.value = DEFAULT_PRIORITY_WEIGHTS.prev;
  if (elDet) elDet.value = DEFAULT_PRIORITY_WEIGHTS.det;
  if (elSupp) elSupp.value = DEFAULT_PRIORITY_WEIGHTS.supp;

  updateSiWeights();
}

export function renderPsiMatrix() {
  const query = (document.getElementById('psi-search-input')?.value || '').toLowerCase();
  const rackFilter = document.getElementById('psi-rack-filter')?.value || 'ALL';
  const fuelFilter = document.getElementById('psi-fuel-filter')?.value || 'ALL';
  const weights = getWeightsFromInputs();
  const selectedCompareIds = getSelectedCompareIds();

  // Update Hero Stat Counter dynamically
  const heroCount = document.getElementById('hero-psi-count');
  if (heroCount) heroCount.textContent = activeCatalogue.length;

  const scored = activeCatalogue
    .map(inv => {
      const evaluation = evaluateInvestigationRelevance(inv, weights);
      return {
        ...inv,
        calculatedScore: evaluation.score,
        evaluation
      };
    })
    .filter(inv => {
      const matchesRack = rackFilter === 'ALL' || inv.rack === rackFilter;
      const matchesFuel = fuelFilter === 'ALL' || inv.fuelType === fuelFilter;
      const textBlob = `${inv.psiId || ''} ${inv.code || ''} ${inv.title || ''} ${inv.rackFull || ''} ${inv.fuelDetails || ''} ${inv.sensors || ''} ${inv.summary || ''} ${inv.resourceClassification || ''}`.toLowerCase();
      const matchesSearch = !query || textBlob.includes(query);
      return matchesRack && matchesFuel && matchesSearch;
    })
    .sort((a, b) => b.calculatedScore - a.calculatedScore);

  const grid = document.getElementById('psi-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const countLabel = document.getElementById('psi-count-label');
  if (countLabel) countLabel.textContent = `${scored.length} of ${activeCatalogue.length}`;

  scored.forEach((inv, index) => {
    const isSelected = selectedCompareIds.includes(inv.id) || selectedCompareIds.includes(inv.psiId);
    const vStatus = inv.provenance?.verificationStatus || (inv.verified ? 'VERIFIED_DATASET' : 'UNFLOWN_PLANNED');
    const isUnflown = vStatus === 'UNFLOWN_FRONTIER' || vStatus === 'UNFLOWN_PLANNED' || !inv.verified;
    const recordsCount = inv.verifiedMetadata?.numericalRecordsCount || 0;
    const evaluation = inv.evaluation;

    let badgeHtml = `
      <span class="badge-flight-data">
        <i class="fa-solid fa-circle-check text-[9px]"></i>Flight Data
      </span>
    `;

    if (isUnflown) {
      badgeHtml = `
        <span class="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-mono font-medium">
          <i class="fa-solid fa-clock mr-1"></i>Unflown Planned
        </span>
      `;
    } else if (vStatus === 'VERIFIED_METADATA_ONLY') {
      badgeHtml = `
        <span class="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-mono font-medium">
          <i class="fa-solid fa-camera mr-1"></i>Metadata / Video
        </span>
      `;
    } else if (vStatus === 'FACILITY_REFERENCE') {
      badgeHtml = `
        <span class="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-mono font-medium">
          <i class="fa-solid fa-book mr-1"></i>Facility Reference
        </span>
      `;
    }

    const card = document.createElement('div');
    card.className = `p-5 rounded-2xl bg-white border transition-all shadow-sm flex flex-col justify-between gap-3.5 ${isSelected ? 'border-purple-600 ring-2 ring-purple-600/20' : 'border-slate-200 hover:border-purple-300 hover:shadow-md'}`;
    card.innerHTML = `
      <div class="space-y-3 font-sans">
        <!-- Top Tags & Relevance Score -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              <i class="fa-solid fa-microchip mr-1"></i>${escapeHtml(inv.rack || 'RACK')}
            </span>
            <span class="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              ${escapeHtml(inv.fuelType || 'Fuel')}
            </span>
            <span class="font-mono text-[11px] text-purple-600 font-bold">
              ${escapeHtml(inv.psiId || inv.id)}
            </span>
          </div>
          <div class="text-right">
            <span class="text-[10px] font-mono text-slate-400 block uppercase font-medium">Relevance</span>
            <span class="font-mono font-bold text-base ${inv.calculatedScore >= 90 ? 'text-purple-700' : inv.calculatedScore >= 80 ? 'text-emerald-600' : 'text-slate-700'}">
              ${inv.calculatedScore}%
            </span>
          </div>
        </div>

        <!-- Title & Rank Header -->
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-purple-700 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100/70 border border-purple-200/80">#${index + 1}</span>
            <h4 class="font-bold text-base text-slate-900">
              ${escapeHtml(inv.code)}
            </h4>
            ${badgeHtml}
          </div>
          <p class="text-xs text-slate-600 font-medium mt-0.5">${escapeHtml(inv.title)}</p>
        </div>

        <!-- Primary Driver Badge -->
        <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span class="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200/80 text-purple-800 text-[10px] font-mono font-semibold flex items-center gap-1">
            <i class="fa-solid fa-bolt text-[9px] text-purple-600"></i>
            <span>Driver: ${escapeHtml(evaluation.topDriver.label)} (${evaluation.topDriver.raw}%)</span>
          </span>
        </div>

        <!-- Criteria Sub-scores Breakdown Bar -->
        <div class="grid grid-cols-4 gap-1 text-[9px] font-mono py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl">
          <div class="text-center">
            <span class="text-slate-400 block text-[8px] uppercase tracking-wider font-semibold">Lunar</span>
            <strong class="text-slate-800 text-[10px]">${evaluation.sLunar}%</strong>
          </div>
          <div class="text-center border-l border-slate-200">
            <span class="text-slate-400 block text-[8px] uppercase tracking-wider font-semibold">Prev</span>
            <strong class="text-slate-800 text-[10px]">${evaluation.sPrev}%</strong>
          </div>
          <div class="text-center border-l border-slate-200">
            <span class="text-slate-400 block text-[8px] uppercase tracking-wider font-semibold">Smoke</span>
            <strong class="text-slate-800 text-[10px]">${evaluation.sDet}%</strong>
          </div>
          <div class="text-center border-l border-slate-200">
            <span class="text-slate-400 block text-[8px] uppercase tracking-wider font-semibold">Supp</span>
            <strong class="text-slate-800 text-[10px]">${evaluation.sSupp}%</strong>
          </div>
        </div>

        <!-- Distinct Separation: Verified Metadata vs Downloadable Assets -->
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1.5 text-slate-600">
          <div class="flex justify-between items-center text-[11px]">
            <span><i class="fa-solid fa-server mr-1 text-slate-400"></i>Archive Volume: <strong class="text-slate-900">${escapeHtml(inv.downloadableAssets?.serverArchiveVolume || inv.dataSize || 'N/A')}</strong></span>
            <span><i class="fa-solid fa-table-list mr-1 text-purple-600"></i>Data: <strong class="text-slate-900">${recordsCount > 0 ? `${recordsCount} Runs` : 'Imagery/Logs'}</strong></span>
          </div>
          <div class="text-emerald-700 truncate font-sans text-[11px] font-medium pt-0.5 border-t border-slate-200/60">
            <i class="fa-solid fa-certificate mr-1 text-emerald-600"></i>${escapeHtml(inv.resourceClassification || 'Experimental data')}
          </div>
        </div>

        <!-- Supporting Evidence Strength Callout -->
        ${evaluation.strengths.length > 0 ? `
          <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] space-y-0.5">
            <div class="font-bold font-mono text-[10px] text-emerald-800 flex items-center gap-1">
              <i class="fa-solid fa-circle-check text-[9px] text-emerald-600"></i>
              <span>Supporting Evidence:</span>
            </div>
            <p class="text-emerald-900 leading-snug">${escapeHtml(evaluation.strengths[0])}</p>
          </div>
        ` : ''}

        <!-- Missing Evidence & Scientific Limitations Callout -->
        ${evaluation.missingEvidence.length > 0 ? `
          <div class="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] space-y-0.5 font-mono">
            <div class="font-bold text-[10px] text-amber-800 flex items-center gap-1">
              <i class="fa-solid fa-triangle-exclamation text-[9px] text-amber-600"></i>
              <span>Scientific Limitations & Missing Evidence:</span>
            </div>
            <ul class="list-disc list-inside text-[10px] leading-snug text-amber-900 space-y-0.5">
              ${evaluation.missingEvidence.slice(0, 2).map(m => `<li>${escapeHtml(m)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">
          ${escapeHtml(inv.summary)}
        </p>

        <!-- Governance Disclaimer Notice -->
        <div class="text-[9px] text-slate-400 font-mono italic">
          * Relevance score indicates research applicability, not flight safety certification.
        </div>
      </div>

      <!-- Action Buttons Bar -->
      <div class="space-y-3 pt-3 border-t border-slate-100">
        <div class="grid grid-cols-2 gap-2 text-xs font-mono text-slate-500">
          <div><span class="text-slate-400">Flow:</span> ${escapeHtml((inv.airflowRange || '0').split(' ')[0])} cm/s</div>
          <div class="truncate"><span class="text-slate-400">DOI:</span> ${escapeHtml(inv.doi || 'NASA PSI')}</div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="window.toggleCompareStudy('${escapeHtml(inv.id)}')" class="cursor-pointer flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${isSelected ? 'bg-purple-700 text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-purple-50 hover:text-purple-700'}">
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
