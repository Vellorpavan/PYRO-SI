/**
 * Research Co-Pilot Controller
 * Handles terminal UI rendering, preset prompts, and intent-aware user queries.
 */

import { queryKnowledgeBase, getPresetResponse } from './knowledge-engine.js';
import { escapeHtml } from '../../utils/dom.js';

export function runSiPrompt(key) {
  const terminal = document.getElementById('si-response-terminal');
  if (!terminal) return;

  const data = getPresetResponse(key);
  if (!data) return;

  renderTerminalOutput(terminal, data);
}

export function submitCustomSiQuery() {
  const input = document.getElementById('si-custom-input');
  const q = (input?.value || '').trim();
  if (!q) return;

  const terminal = document.getElementById('si-response-terminal');
  if (!terminal) return;

  const response = queryKnowledgeBase(q);
  if (response) {
    renderTerminalOutput(terminal, response);
  }

  if (input) input.value = '';
}

export function renderTerminalOutput(terminal, arg1, arg2, arg3) {
  // Support both object signature renderTerminalOutput(terminal, dataObj)
  // and legacy signature renderTerminalOutput(terminal, title, badge, content)
  let title = '';
  let badge = '';
  let rawContent = '';
  let sources = [];
  let status = 'READY';
  let domain = 'NASA PHYSICAL SCIENCES INFORMATICS';
  let verified = false;
  let intent = 'thematic';
  let image = null;
  let imageCaption = '';
  let parameters = null;
  let comparisonCards = null;
  let actions = [];

  if (typeof arg1 === 'object' && arg1 !== null) {
    title = arg1.title || '';
    badge = arg1.badge || '';
    rawContent = arg1.content || '';
    sources = arg1.sources || [];
    status = arg1.status || 'EVIDENCE RETRIEVED';
    domain = arg1.domain || 'NASA PHYSICAL SCIENCES INFORMATICS (COMBUSTION)';
    verified = Boolean(arg1.verified);
    intent = arg1.intent || 'thematic';
    image = arg1.image || null;
    imageCaption = arg1.imageCaption || '';
    parameters = arg1.parameters || null;
    comparisonCards = arg1.comparisonCards || null;
    actions = arg1.actions || [];
  } else {
    title = arg1 || '';
    badge = arg2 || '';
    rawContent = arg3 || '';
  }

  // Determine badge styling based on intent
  let badgeClass = 'bg-purple-100 border-purple-200 text-purple-700';
  if (intent === 'greeting') {
    badgeClass = 'bg-slate-100 border-slate-300 text-slate-700';
  } else if (intent === 'unsupported') {
    badgeClass = 'bg-amber-100 border-amber-300 text-amber-800';
  } else if (intent === 'comparison') {
    badgeClass = 'bg-blue-100 border-blue-200 text-blue-700';
  } else if (intent === 'investigation') {
    badgeClass = 'bg-emerald-100 border-emerald-200 text-emerald-800';
  }

  const epistemicTag = parameters?.epistemicClassification || null;

  // Format paragraphs with high-fidelity semantic structure
  const formattedContent = rawContent
    .split('\n\n')
    .map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';

      // Provenance callout block
      if (trimmed.includes('Measurement Provenance:')) {
        return `
          <div class="p-3.5 rounded-xl bg-cyan-50/80 border border-cyan-200 text-cyan-950 space-y-1 shadow-2xs font-sans">
            <div class="text-[10px] font-mono font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-microscope text-cyan-600"></i>
              <span>Scientific Data Provenance & Sensor Epistemology</span>
            </div>
            <p class="text-xs leading-relaxed text-cyan-900">${escapeHtml(trimmed.replace('• Measurement Provenance:', '').trim())}</p>
          </div>
        `;
      }

      // Summary / Abstract block
      if (trimmed.startsWith('Investigation Summary:')) {
        const body = trimmed.replace('Investigation Summary:', '').trim();
        return `
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-800 space-y-1 shadow-2xs font-sans">
            <div class="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-file-lines text-purple-600"></i>
              <span>Flight Investigation Abstract & Findings</span>
            </div>
            <p class="text-xs leading-relaxed text-slate-700">${escapeHtml(body)}</p>
          </div>
        `;
      }

      // Parameters list
      if (trimmed.startsWith('Key Experimental Parameters:')) {
        const lines = trimmed.split('\n').slice(1);
        return `
          <div class="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-2 shadow-2xs font-sans">
            <div class="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-sliders text-purple-600"></i>
              <span>Key Experimental Parameters</span>
            </div>
            <div class="grid grid-cols-1 gap-1 text-xs">
              ${lines.map(line => `
                <div class="flex items-start gap-1.5 text-slate-700">
                  <span class="text-purple-600 font-mono mt-0.5 text-[11px]">•</span>
                  <span class="leading-relaxed">${escapeHtml(line.replace(/^[•\-\*]\s*/, ''))}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Default paragraph
      return `<p class="leading-relaxed text-slate-700 font-sans">${escapeHtml(trimmed).replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('');

  // Sources HTML
  let sourcesHtml = '';
  if (sources && sources.length > 0) {
    sourcesHtml = `
      <div class="mt-3 pt-3 border-t border-slate-200/80 text-xs font-sans">
        <div class="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <i class="fa-solid fa-book-bookmark text-purple-600"></i>
          <span>Traceable Evidence & Primary Literature</span>
        </div>
        <div class="flex flex-wrap gap-2 font-mono text-[11px]">
          ${sources.map(s => `
            <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-purple-700 hover:text-purple-900 transition flex items-center gap-1.5 shadow-2xs">
              <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
              <span class="font-medium">${escapeHtml(s.label)}</span>
              ${s.doi ? `<span class="text-slate-400 text-[10px]">(${escapeHtml(s.doi)})</span>` : ''}
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Actions HTML
  let actionsHtml = '';
  if (actions && actions.length > 0) {
    actionsHtml = `
      <div class="pt-2 flex flex-wrap items-center gap-2 font-mono text-[11px]">
        ${actions.map(act => `
          <button onclick="${escapeHtml(act.onclick)}" class="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-900 transition flex items-center gap-1.5 font-medium shadow-2xs">
            <i class="fa-solid ${act.icon} text-purple-600 text-[10px]"></i>
            <span>${escapeHtml(act.label)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  // Imagery / Comparison Figure block
  let visualMediaHtml = '';
  if (comparisonCards && comparisonCards.length > 0) {
    visualMediaHtml = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        ${comparisonCards.map(c => `
          <div class="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-sm flex flex-col group">
            <div class="h-28 w-full relative overflow-hidden bg-slate-950">
              <img src="${c.image}" alt="${c.code}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div class="absolute top-2 left-2">
                <span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-900/90 text-purple-200 border border-purple-400/30 backdrop-blur-sm">
                  ${escapeHtml(c.code)} (${escapeHtml(c.id)})
                </span>
              </div>
              <div class="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] text-white/90 font-mono">
                <span class="truncate">${escapeHtml(c.platform)}</span>
                <span class="text-amber-300 font-semibold text-[9px]">${escapeHtml(c.flow)}</span>
              </div>
            </div>
            <div class="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-700 space-y-0.5 font-sans">
              <div class="font-bold text-slate-900 text-xs">${escapeHtml(c.facility)}</div>
              <div class="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                <i class="fa-solid fa-ruler-combined text-purple-600 text-[9px]"></i>
                <span>${escapeHtml(c.scale)}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (image) {
    visualMediaHtml = `
      <div class="rounded-xl border border-slate-200 overflow-hidden bg-slate-950 shadow-sm relative group">
        <div class="h-32 sm:h-36 w-full relative overflow-hidden">
          <img src="${image}" alt="${escapeHtml(title)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent"></div>
          <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-700 text-white shadow-sm flex items-center gap-1">
              <i class="fa-solid fa-camera"></i> NASA PSI ARCHIVAL FLIGHT IMAGERY
            </span>
            ${parameters?.dataTier ? `
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-600/90 text-white backdrop-blur-sm font-semibold">
                ${escapeHtml(parameters.dataTier)}
              </span>
            ` : ''}
          </div>
          <div class="absolute bottom-2 left-3 right-3 text-white text-[11px] font-mono drop-shadow">
            <p class="truncate text-slate-200 font-sans">${escapeHtml(imageCaption)}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Parameters Ribbon
  let parametersHtml = '';
  if (parameters) {
    parametersHtml = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col">
          <span class="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">Facility</span>
          <span class="font-bold text-slate-800 text-[11px] truncate mt-0.5" title="${escapeHtml(parameters.facility)}">${escapeHtml(parameters.facility || 'Flight Platform')}</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col">
          <span class="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">Flow Velocity</span>
          <span class="font-bold text-purple-700 text-[11px] truncate mt-0.5">${escapeHtml(parameters.flow || '0 cm/s')}</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col">
          <span class="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">Fuel Specimen</span>
          <span class="font-bold text-slate-800 text-[11px] truncate mt-0.5" title="${escapeHtml(parameters.fuel)}">${escapeHtml(parameters.fuel || 'Solid/Gas')}</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col">
          <span class="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">Data Scale</span>
          <span class="font-bold text-emerald-700 text-[11px] truncate mt-0.5">${escapeHtml(parameters.dataVolume || 'Open Access')}</span>
        </div>
      </div>
    `;
  }

  terminal.innerHTML = `
    <div class="space-y-3.5 font-sans">
      <!-- Title Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-purple-600/10 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200">
            <i class="fa-solid fa-satellite"></i>
          </div>
          <div>
            <h3 class="font-bold text-sm text-slate-900 tracking-tight">${escapeHtml(title)}</h3>
            <span class="text-[10px] font-mono text-slate-500 uppercase">${escapeHtml(domain)}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          ${badge ? `<span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${badgeClass}">${escapeHtml(badge)}</span>` : ''}
          ${epistemicTag ? `<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">${escapeHtml(epistemicTag)}</span>` : ''}
        </div>
      </div>

      <!-- Research Imagery / Comparison Visuals -->
      ${visualMediaHtml}

      <!-- Parameter Badges Ribbon -->
      ${parametersHtml}

      <!-- Detailed Content Sections -->
      <div class="text-xs text-slate-700 space-y-2.5 leading-relaxed">
        ${formattedContent}
      </div>

      <!-- Quick Action Buttons -->
      ${actionsHtml}

      <!-- Primary Literature Sources -->
      ${sourcesHtml}

      <!-- Footer Telemetry -->
      <div class="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px] font-mono gap-2">
        <div class="flex items-center gap-1.5 text-slate-400">
          <i class="fa-solid fa-database text-[9px]"></i>
          <span>${escapeHtml(domain)}</span>
        </div>
        <span class="${verified ? 'text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200' : 'text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200'}">
          STATUS: ${escapeHtml(status)}
        </span>
      </div>
    </div>
  `;
}
