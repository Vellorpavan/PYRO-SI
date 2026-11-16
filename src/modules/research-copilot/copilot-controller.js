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

  if (typeof arg1 === 'object' && arg1 !== null) {
    title = arg1.title || '';
    badge = arg1.badge || '';
    rawContent = arg1.content || '';
    sources = arg1.sources || [];
    status = arg1.status || 'EVIDENCE RETRIEVED';
    domain = arg1.domain || 'NASA PHYSICAL SCIENCES INFORMATICS (COMBUSTION)';
    verified = Boolean(arg1.verified);
    intent = arg1.intent || 'thematic';
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

  const formattedContent = rawContent
    .split('\n\n')
    .map(para => `<p class="leading-relaxed">${escapeHtml(para).replace(/\n/g, '<br/>')}</p>`)
    .join('');

  let sourcesHtml = '';
  if (sources && sources.length > 0) {
    sourcesHtml = `
      <div class="mt-3 pt-2.5 border-t border-slate-200 text-xs">
        <div class="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <i class="fa-solid fa-link text-purple-600"></i>
          <span>Traceable Evidence & Primary Literature</span>
        </div>
        <ul class="space-y-1 font-mono text-[11px]">
          ${sources.map(s => `
            <li>
              <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1">
                <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                <span>${escapeHtml(s.label)}</span>
                ${s.doi ? `<span class="text-slate-400">(${escapeHtml(s.doi)})</span>` : ''}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  terminal.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-slate-200 pb-2">
        <span class="font-sans font-bold text-sm text-purple-700">${escapeHtml(title)}</span>
        <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${badgeClass}">
          ${escapeHtml(badge)}
        </span>
      </div>
      <div class="text-xs text-slate-700 space-y-3 font-sans leading-relaxed">
        ${formattedContent}
      </div>
      ${sourcesHtml}
      <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
        <span class="text-slate-400">${escapeHtml(domain)}</span>
        <span class="${verified ? 'text-emerald-700 font-bold' : 'text-slate-500'}">STATUS: ${escapeHtml(status)}</span>
      </div>
    </div>
  `;
}
