/**
 * PSI Investigation Comparator
 * Handles side-by-side technical comparison of up to 3 investigations.
 */

import psiInvestigations from '../../data/reference/psi-investigations.json' with { type: 'json' };
import { escapeHtml } from '../../utils/dom.js';

let selectedCompareIds = ['PSI-25', 'PSI-98', 'PSI-69'];

export function getSelectedCompareIds() {
  return [...selectedCompareIds];
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
      alert('Comparator matrix holds a maximum of 3 studies simultaneously.');
      return;
    }
    selectedCompareIds.push(id);
  }
  renderComparisonTable();
}

export function resetDefaultComparison() {
  selectedCompareIds = ['PSI-25', 'PSI-98', 'PSI-69'];
  renderComparisonTable();
}

export function renderComparisonTable() {
  const container = document.getElementById('psi-comparison-container');
  const countBadge = document.getElementById('compare-count-badge');
  if (!container) return;

  if (countBadge) countBadge.textContent = `${selectedCompareIds.length}/3 SELECTED`;

  const studies = selectedCompareIds
    .map(id => psiInvestigations.find(s => s.id === id || s.code === id || s.psiId === id))
    .filter(Boolean);

  // Auto-synthesized similarity/difference notes
  const uniqueRacks = [...new Set(studies.map(s => s.rack))];
  const uniqueFuels = [...new Set(studies.map(s => s.fuelType))];
  const similarityNote = uniqueRacks.length === 1
    ? `All ${studies.length} studies share the same primary research facility (${uniqueRacks[0]}), enabling direct comparative hardware scaling.`
    : `Studies span ${uniqueRacks.length} distinct testing environments (${uniqueRacks.join(', ')}), providing complementary facility insights.`;

  const diffNote = uniqueFuels.length === 1
    ? `Identical fuel regime (${uniqueFuels[0]}), isolating airflow and gravity as primary variables.`
    : `Diverse fuel regimes (${uniqueFuels.join(', ')}), cross-validating gas vs liquid vs solid flame physics.`;

  let html = `
    <div class="mb-3 p-3 rounded-lg bg-panelLight/80 border border-cyanHud/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
      <div class="space-y-1">
        <div class="text-[11px] font-mono text-cyanHud flex items-center gap-1.5">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <span>COMPARATIVE SYNTHESIS & EXPERIMENTAL COMPATIBILITY</span>
        </div>
        <p class="text-slate-300">${escapeHtml(similarityNote)}</p>
        <p class="text-slate-400 font-mono text-[11px]">${escapeHtml(diffNote)}</p>
      </div>
      <button onclick="window.resetDefaultComparison()" class="px-3 py-1.5 rounded bg-space border border-slate-700 text-[11px] font-mono text-slate-300 hover:border-cyanHud hover:text-cyanHud whitespace-nowrap">
        <i class="fa-solid fa-rotate-left mr-1"></i>RESET DEFAULTS
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs font-mono border-collapse">
        <thead>
          <tr class="bg-space border-b border-cyanHud/30 text-cyanHud">
            <th class="p-2.5 w-32 border-r border-slate-800">PARAMETER</th>
            ${studies.map(s => `
              <th class="p-2.5 min-w-[200px] border-r border-slate-800 last:border-r-0">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sky-400 font-mono text-[10px] bg-sky-400/10 px-1 rounded">${escapeHtml(s.psiId || s.id)}</span>
                    <span class="font-sans font-bold text-white text-xs">${escapeHtml(s.code)}</span>
                  </div>
                  <button onclick="window.toggleCompareStudy('${escapeHtml(s.id)}')" class="text-slate-400 hover:text-crimsonAlert p-1" title="Remove from comparison">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <div class="text-[10px] text-slate-400 font-normal truncate">${escapeHtml(s.title)}</div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/80 text-[11px]">
          <tr class="hover:bg-panelLight/40">
            <td class="p-2.5 font-bold text-slate-400 bg-space/60 border-r border-slate-800">FACILITY / RACK</td>
            ${studies.map(s => `<td class="p-2.5 border-r border-slate-800 last:border-r-0 text-white">${escapeHtml(s.rackFull)}</td>`).join('')}
          </tr>
          <tr class="hover:bg-panelLight/40">
            <td class="p-2.5 font-bold text-slate-400 bg-space/60 border-r border-slate-800">FUEL FORM</td>
            ${studies.map(s => `<td class="p-2.5 border-r border-slate-800 last:border-r-0 text-cyanHud font-semibold">${escapeHtml(s.fuelType)}</td>`).join('')}
          </tr>
          <tr class="hover:bg-panelLight/40">
            <td class="p-2.5 font-bold text-slate-400 bg-space/60 border-r border-slate-800">DATA SIZE & VER</td>
            ${studies.map(s => `<td class="p-2.5 border-r border-slate-800 last:border-r-0 text-slate-200 font-mono">${escapeHtml(s.dataSize || 'N/A')} (${escapeHtml(s.version || 'v1')})</td>`).join('')}
          </tr>
          <tr class="hover:bg-panelLight/40">
            <td class="p-2.5 font-bold text-slate-400 bg-space/60 border-r border-slate-800">CLASSIFICATION</td>
            ${studies.map(s => `<td class="p-2.5 border-r border-slate-800 last:border-r-0 text-emerald-400 font-mono text-[10px]">${escapeHtml(s.resourceClassification || 'Experimental data')}</td>`).join('')}
          </tr>
          <tr class="hover:bg-panelLight/40">
            <td class="p-2.5 font-bold text-slate-400 bg-space/60 border-r border-slate-800">FLOW REGIME</td>
            ${studies.map(s => `<td class="p-2.5 border-r border-slate-800 last:border-r-0 text-amber-300">${escapeHtml(s.airflowRange)}</td>`).join('')}
          </tr>
          <tr class="hover:bg-panelLight/40">
            <td class="p-2.5 font-bold text-slate-400 bg-space/60 border-r border-slate-800">PRIMARY VARIABLES</td>
            ${studies.map(s => `<td class="p-2.5 border-r border-slate-800 last:border-r-0 text-slate-300 font-sans">${escapeHtml(s.variables)}</td>`).join('')}
          </tr>
          <tr class="hover:bg-panelLight/40">
            <td class="p-2.5 font-bold text-slate-400 bg-space/60 border-r border-slate-800">CORE SUMMARY</td>
            ${studies.map(s => `<td class="p-2.5 border-r border-slate-800 last:border-r-0 text-slate-300 font-sans text-xs leading-relaxed">${escapeHtml(s.summary)}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}
