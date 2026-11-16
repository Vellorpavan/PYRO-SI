/**
 * PSI Investigation Comparator
 * Handles side-by-side technical comparison of up to 3 investigations.
 * Light / White Lavender + Royal Purple Theme
 * 
 * SCIENTIFIC GOVERNANCE:
 * - Dynamically computes recommended comparisons from active prioritization weights.
 * - Never silently overwrites user's manual selections without explicit user action.
 */

import psiInvestigations from '../../data/reference/psi-investigations.json' with { type: 'json' };
import { evaluateInvestigationRelevance } from './ranker.js';
import { escapeHtml } from '../../utils/dom.js';

let selectedCompareIds = ['PSI-25', 'PSI-98', 'PSI-69'];
let lastKnownWeights = { lunar: 90, prev: 85, det: 75, supp: 80 };

export function getSelectedCompareIds() {
  return [...selectedCompareIds];
}

export function setSelectedCompareIds(ids) {
  if (Array.isArray(ids)) {
    selectedCompareIds = [...ids];
  }
}

export function toggleCompareStudy(id) {
  if (selectedCompareIds.includes(id)) {
    if (selectedCompareIds.length <= 1) {
      alert('Keep at least 1 study in comparator matrix.');
      return;
    }
    selectedCompareIds = selectedCompareIds.filter(item => item !== id);
  } else {
    if (selectedCompareIds.length >= 3) {
      alert('Comparator matrix holds a maximum of 3 studies simultaneously. Remove one before adding.');
      return;
    }
    selectedCompareIds.push(id);
  }
  renderComparisonTable(lastKnownWeights);
  if (typeof window !== 'undefined' && typeof window.renderPsiMatrix === 'function') {
    window.renderPsiMatrix();
  }
}

export function resetDefaultComparison() {
  selectedCompareIds = ['PSI-25', 'PSI-98', 'PSI-69'];
  renderComparisonTable(lastKnownWeights);
  if (typeof window !== 'undefined' && typeof window.renderPsiMatrix === 'function') {
    window.renderPsiMatrix();
  }
}

/**
 * Computes top recommended investigations based on active prioritization weights.
 * Does not mutate selectedCompareIds.
 */
export function getTopRecommendedStudies(weights, catalogue, count = 3) {
  const list = (catalogue && catalogue.length > 0) ? catalogue : psiInvestigations;
  const activeWeights = weights || lastKnownWeights;
  return [...list]
    .map(inv => ({
      inv,
      eval: evaluateInvestigationRelevance(inv, activeWeights)
    }))
    .sort((a, b) => b.eval.score - a.eval.score)
    .slice(0, count);
}

/**
 * Explicit user action: replaces comparator trio with top 3 recommended studies.
 */
export function applyRecommendedTrio(weights) {
  const top = getTopRecommendedStudies(weights || lastKnownWeights, psiInvestigations, 3);
  selectedCompareIds = top.map(t => t.inv.id || t.inv.psiId);
  renderComparisonTable(weights || lastKnownWeights);
  if (typeof window !== 'undefined' && typeof window.renderPsiMatrix === 'function') {
    window.renderPsiMatrix();
  }
}

export function renderComparisonTable(currentWeights) {
  if (currentWeights) {
    lastKnownWeights = { ...currentWeights };
  }

  if (typeof document === 'undefined') return;

  const container = document.getElementById('psi-comparison-container');
  const countBadge = document.getElementById('compare-count-badge');
  if (!container) return;

  if (countBadge) countBadge.textContent = `${selectedCompareIds.length}/3 SELECTED`;

  const studies = selectedCompareIds
    .map(id => psiInvestigations.find(s => s.id === id || s.code === id || s.psiId === id))
    .filter(Boolean);

  const topRecommended = getTopRecommendedStudies(lastKnownWeights, psiInvestigations, 3);

  const uniqueRacks = [...new Set(studies.map(s => s.rack))];
  const uniqueFuels = [...new Set(studies.map(s => s.fuelType))];
  const similarityNote = uniqueRacks.length === 1
    ? `All ${studies.length} studies share the same primary research facility (${uniqueRacks[0]}), enabling direct comparative hardware scaling.`
    : `Studies span ${uniqueRacks.length} distinct testing environments (${uniqueRacks.join(', ')}), providing complementary facility insights.`;

  const diffNote = uniqueFuels.length === 1
    ? `Identical fuel regime (${uniqueFuels[0]}), isolating airflow and gravity as primary variables.`
    : `Diverse fuel regimes (${uniqueFuels.join(', ')}), cross-validating gas vs liquid vs solid flame physics.`;

  let html = `
    <!-- Dynamic Recommendations Strip (Updated live from priority weights) -->
    <div class="mb-3.5 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-2xs font-sans">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[10px] font-mono font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-star text-amber-500"></i>
          <span>Top Matches by Current Priorities:</span>
        </span>
        <div class="flex items-center gap-1.5 flex-wrap">
          ${topRecommended.map(r => {
            const isAlreadySelected = selectedCompareIds.includes(r.inv.id) || selectedCompareIds.includes(r.inv.psiId);
            return `
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-purple-200/90 shadow-2xs font-mono text-[11px]">
                <span class="font-bold text-slate-900">${escapeHtml(r.inv.code)}</span>
                <span class="text-purple-700 font-bold">${r.eval.score}%</span>
                ${isAlreadySelected ? `
                  <span class="text-emerald-600 text-[10px] font-bold ml-0.5" title="Already in comparator">
                    <i class="fa-solid fa-circle-check"></i>
                  </span>
                ` : `
                  <button onclick="window.toggleCompareStudy('${escapeHtml(r.inv.id)}')" class="cursor-pointer text-purple-600 hover:text-purple-900 font-bold ml-1 text-xs" title="Add ${escapeHtml(r.inv.code)} to comparator">
                    <i class="fa-solid fa-plus"></i> Add
                  </button>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="window.applyRecommendedTrio()" class="cursor-pointer px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-mono text-[11px] font-semibold transition flex items-center gap-1.5 shadow-2xs">
          <i class="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
          <span>Compare Top 3</span>
        </button>
        <button onclick="window.resetDefaultComparison()" class="cursor-pointer px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 hover:border-purple-600 hover:text-purple-700 whitespace-nowrap shadow-2xs transition" title="Reset to default trio">
          <i class="fa-solid fa-rotate-left mr-1"></i>Reset
        </button>
      </div>
    </div>

    <!-- Comparative Synthesis Banner -->
    <div class="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1 text-xs font-sans">
      <div class="text-xs font-mono text-purple-700 font-bold flex items-center gap-1.5">
        <i class="fa-solid fa-code-compare"></i>
        <span>COMPARATIVE SYNTHESIS & EXPERIMENTAL COMPATIBILITY</span>
      </div>
      <p class="text-slate-700">${escapeHtml(similarityNote)}</p>
      <p class="text-slate-500 font-mono text-[11px]">${escapeHtml(diffNote)}</p>
    </div>

    <!-- Comparison Table -->
    <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table class="w-full text-left text-xs border-collapse bg-white">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono">
            <th class="p-3.5 w-36 border-r border-slate-200 font-bold">PARAMETER</th>
            ${studies.map(s => `
              <th class="p-3.5 min-w-[220px] border-r border-slate-200 last:border-r-0">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5">
                    <span class="text-purple-700 font-mono text-xs font-bold bg-purple-100 px-1.5 py-0.5 rounded">${escapeHtml(s.psiId || s.id)}</span>
                    <span class="font-bold text-slate-900 text-sm font-sans">${escapeHtml(s.code)}</span>
                  </div>
                  <button onclick="window.toggleCompareStudy('${escapeHtml(s.id)}')" class="cursor-pointer text-slate-400 hover:text-rose-600 p-1" title="Remove from comparison">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <div class="text-xs text-slate-500 font-normal truncate mt-0.5 font-sans">${escapeHtml(s.title)}</div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-xs">
          <tr class="hover:bg-slate-50/60">
            <td class="p-3 font-mono font-semibold text-slate-500 bg-slate-50/40 border-r border-slate-200">FACILITY / RACK</td>
            ${studies.map(s => `<td class="p-3 border-r border-slate-200 last:border-r-0 text-slate-900 font-medium">${escapeHtml(s.rackFull)}</td>`).join('')}
          </tr>
          <tr class="hover:bg-slate-50/60">
            <td class="p-3 font-mono font-semibold text-slate-500 bg-slate-50/40 border-r border-slate-200">FUEL FORM</td>
            ${studies.map(s => `<td class="p-3 border-r border-slate-200 last:border-r-0 text-purple-700 font-mono font-bold">${escapeHtml(s.fuelType)}</td>`).join('')}
          </tr>
          <tr class="hover:bg-slate-50/60">
            <td class="p-3 font-mono font-semibold text-slate-500 bg-slate-50/40 border-r border-slate-200">DATA SIZE</td>
            ${studies.map(s => `<td class="p-3 border-r border-slate-200 last:border-r-0 text-slate-800 font-mono">${escapeHtml(s.dataSize || 'N/A')} (${escapeHtml(s.version || 'v1')})</td>`).join('')}
          </tr>
          <tr class="hover:bg-slate-50/60">
            <td class="p-3 font-mono font-semibold text-slate-500 bg-slate-50/40 border-r border-slate-200">CLASSIFICATION</td>
            ${studies.map(s => `<td class="p-3 border-r border-slate-200 last:border-r-0 text-emerald-700 font-medium">${escapeHtml(s.resourceClassification || 'Experimental data')}</td>`).join('')}
          </tr>
          <tr class="hover:bg-slate-50/60">
            <td class="p-3 font-mono font-semibold text-slate-500 bg-slate-50/40 border-r border-slate-200">FLOW REGIME</td>
            ${studies.map(s => `<td class="p-3 border-r border-slate-200 last:border-r-0 text-amber-700 font-mono">${escapeHtml(s.airflowRange)}</td>`).join('')}
          </tr>
          <tr class="hover:bg-slate-50/60">
            <td class="p-3 font-mono font-semibold text-slate-500 bg-slate-50/40 border-r border-slate-200">PRIMARY VARIABLES</td>
            ${studies.map(s => `<td class="p-3 border-r border-slate-200 last:border-r-0 text-slate-600">${escapeHtml(s.variables)}</td>`).join('')}
          </tr>
          <tr class="hover:bg-slate-50/60">
            <td class="p-3 font-mono font-semibold text-slate-500 bg-slate-50/40 border-r border-slate-200">CORE SUMMARY</td>
            ${studies.map(s => `<td class="p-3 border-r border-slate-200 last:border-r-0 text-slate-600 leading-relaxed">${escapeHtml(s.summary)}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}
