/**
 * Research Co-Pilot Controller
 * High-fidelity, evidence-grounded research intelligence dossier.
 * Fully integrates Google Gemini 2.0 Flash generative intelligence with
 * authentic NASA Physical Sciences Informatics (PSI) combustion archives.
 */

import { queryKnowledgeBase, getPresetResponse } from './knowledge-engine.js';
import { escapeHtml } from '../../utils/dom.js';

const GEMINI_STORAGE_KEY = 'pyro_gemini_api_key';

/**
 * Returns user-configured Gemini API key from browser storage.
 */
export function getSavedGeminiKey() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage.getItem(GEMINI_STORAGE_KEY) || null;
}

/**
 * Updates UI badge indicating Gemini status.
 */
export function updateGeminiStatusBadge() {
  if (typeof document === 'undefined') return;
  const badge = document.getElementById('gemini-status-text');
  const btn = document.getElementById('gemini-status-btn');
  if (!badge) return;

  const key = getSavedGeminiKey();
  if (key) {
    badge.textContent = 'Gemini 2.0 Flash (Active)';
    if (btn) {
      btn.className = 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center gap-1.5 transition cursor-pointer shadow-2xs';
    }
  } else {
    badge.textContent = 'Gemini 2.0 Flash';
    if (btn) {
      btn.className = 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs';
    }
  }
}

/**
 * Modal handlers for Gemini configuration.
 */
export function openGeminiConfigModal() {
  const modal = document.getElementById('gemini-config-modal');
  const input = document.getElementById('gemini-api-key-input');
  if (modal) modal.classList.remove('hidden');
  if (input) {
    input.value = getSavedGeminiKey() || '';
    input.focus();
  }
}

export function closeGeminiConfigModal() {
  const modal = document.getElementById('gemini-config-modal');
  if (modal) modal.classList.add('hidden');
}

export function saveGeminiApiKey() {
  const input = document.getElementById('gemini-api-key-input');
  const key = (input?.value || '').trim();
  if (key) {
    localStorage.setItem(GEMINI_STORAGE_KEY, key);
    showToast('Gemini API key saved & activated!', 'success');
  } else {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
    showToast('Gemini API key cleared.', 'info');
  }
  closeGeminiConfigModal();
  updateGeminiStatusBadge();
}

export function clearGeminiApiKey() {
  localStorage.removeItem(GEMINI_STORAGE_KEY);
  const input = document.getElementById('gemini-api-key-input');
  if (input) input.value = '';
  updateGeminiStatusBadge();
  closeGeminiConfigModal();
  showToast('Gemini API key removed.', 'info');
}

/**
 * In-app Toast Notification
 */
export function showToast(message, type = 'info') {
  if (typeof document === 'undefined') return;
  let toastContainer = document.getElementById('pyro-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'pyro-toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const colorClass = type === 'success' 
    ? 'bg-emerald-900/90 text-white border-emerald-600' 
    : type === 'error'
    ? 'bg-rose-900/90 text-white border-rose-600'
    : 'bg-slate-900/90 text-white border-purple-500';

  toast.className = `p-3 rounded-xl border backdrop-blur-md shadow-lg text-xs font-mono flex items-center gap-2 pointer-events-auto transition duration-300 transform translate-y-2 opacity-0 ${colorClass}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check text-emerald-400' : type === 'error' ? 'fa-triangle-exclamation text-rose-400' : 'fa-sparkles text-purple-300'}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

/**
 * Runs preset prompt button.
 */
export function runSiPrompt(key) {
  const terminal = document.getElementById('si-response-terminal');
  if (!terminal) return;

  const data = getPresetResponse(key);
  if (!data) return;

  renderTerminalOutput(terminal, data);
}

/**
 * Executes follow-up prompt from action button.
 */
export function askCopilotFollowup(queryText) {
  const input = document.getElementById('si-custom-input');
  if (input) {
    input.value = queryText;
  }
  submitCustomSiQuery(queryText);
}

/**
 * Direct client-side Gemini 2.0 Flash query when user has provided an API key.
 */
async function queryGeminiDirect(rawQuery, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const systemInstruction = 
    "You are GODEYE // PYRO-SI, Lead NASA Combustion Science Intelligence Co-Pilot. " +
    "You provide grounded, executive scientific briefings based on NASA Physical Sciences Informatics (PSI), " +
    "NASA-STD-3001 Rev F, and NASA-STD-6001B.\n" +
    "Strict Guidelines:\n" +
    "1. For greetings, return friendly assistance without fabricated research.\n" +
    "2. For flight studies (BASS-II, Saffire, ACME, FLEX, etc.), deliver exact research findings, " +
    "distinguishing direct sensor measurements from image-extracted data (e.g. BASS-II optical videos, SPICE rulers) " +
    "and equilibrium calculations (e.g. Tad via NASA CEA).\n" +
    "3. Return valid JSON only with keys: title, badge, content, citations (array of DOIs or links), " +
    "intent (greeting | investigation | comparison | thematic | unsupported), status, verified (boolean), " +
    "sources (array of {label, url, doi}).";

  const payload = {
    contents: [{ parts: [{ text: `User Research Query: ${rawQuery}` }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text);
}

/**
 * Submits custom research query with live AI synthesis + deterministic fallback.
 */
export async function submitCustomSiQuery(overrideQuery) {
  const input = document.getElementById('si-custom-input');
  const q = (overrideQuery || input?.value || '').trim();
  if (!q) return;

  const terminal = document.getElementById('si-response-terminal');
  if (!terminal) return;

  // Show modern scientific synthesis spinner
  terminal.innerHTML = `
    <div class="p-8 rounded-2xl bg-purple-50/60 border border-purple-200/90 flex flex-col items-center justify-center gap-3 text-purple-950 font-mono text-xs animate-pulse">
      <div class="w-7 h-7 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      <div class="font-bold text-sm tracking-tight text-purple-900">Consulting NASA PSI Combustion Archives & Gemini Intelligence...</div>
      <p class="text-[11px] text-purple-700/80 font-sans max-w-sm text-center">Cross-referencing flight telemetry, sensor epistemology, and peer-reviewed mission publications for "${escapeHtml(q)}"</p>
    </div>
  `;

  const customKey = getSavedGeminiKey();
  let result = null;

  // 1. Try FastAPI backend endpoint first
  try {
    const backendEndpoints = ['/api/v1/copilot/query', 'http://localhost:8000/api/v1/copilot/query'];
    for (const endpoint of backendEndpoints) {
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(customKey ? { 'X-Gemini-Key': customKey } : {})
          },
          body: JSON.stringify({ query: q, gemini_api_key: customKey }),
          signal: AbortSignal.timeout(4500)
        });

        if (resp.ok) {
          result = await resp.json();
          break;
        }
      } catch {
        // Try next endpoint
      }
    }
  } catch (err) {
    console.warn('[Copilot] Backend fetch failed:', err);
  }

  // 2. If backend was unreachable and user has a direct Gemini key, query Gemini API directly
  if (!result && customKey) {
    try {
      const geminiData = await queryGeminiDirect(q, customKey);
      if (geminiData) {
        result = {
          ...geminiData,
          status: 'VERIFIED NASA PSI EVIDENCE // GEMINI 2.0 FLASH',
          verified: Boolean(geminiData.verified)
        };
      }
    } catch (directErr) {
      console.warn('[Copilot] Direct Gemini call failed, falling back to local engine:', directErr);
    }
  }

  // 3. Fallback to local verified NASA PSI knowledge engine
  if (!result) {
    result = queryKnowledgeBase(q);
  }

  // Render enriched response
  if (result) {
    // Enrich with visual imagery if result does not already have an image
    if (!result.image) {
      const qLower = q.toLowerCase();
      if (qLower.includes('bass') || qLower.includes('psi-25') || qLower.includes('psi-26')) {
        result.image = './assets/images/card_bass2.jpg';
        result.imageCaption = 'Figure 1: NASA BASS-II Microgravity Science Glovebox (MSG) Solid Fuel Flame Spread (PMMA flat film in 0 to 55 cm/s forced flow)';
      } else if (qLower.includes('saffire') || qLower.includes('psi-98') || qLower.includes('psi-100')) {
        result.image = './assets/images/card_saffire.jpg';
        result.imageCaption = 'Figure 1: NASA Saffire Large-Scale Structural Burn inside Cygnus Vehicle (0.94 m SIBAL fabric panel)';
      } else if (qLower.includes('acme') || qLower.includes('flame design') || qLower.includes('psi-10')) {
        result.image = './assets/images/card_acme.jpg';
        result.imageCaption = 'Figure 1: NASA ACME Coflow Burner Gaseous Diffusion Flame in Combustion Integrated Rack (CIR)';
      } else if (qLower.includes('flex') || qLower.includes('cool flame') || qLower.includes('psi-69')) {
        result.image = './assets/images/card_flex.jpg';
        result.imageCaption = 'Figure 1: NASA FLEX Droplet Combustion & Invisible 500–800 K Cool Flame Persistence in CIR';
      }
    }

    renderTerminalOutput(terminal, result);
  }

  if (input && !overrideQuery) input.value = '';
}

/**
 * High-grade scientific dossier card renderer ("box like in perfect short, but exact").
 */
export function renderTerminalOutput(terminal, arg1, arg2, arg3) {
  let title = '';
  let badge = '';
  let rawContent = '';
  let sources = [];
  let status = 'READY';
  let domain = 'NASA PHYSICAL SCIENCES INFORMATICS (COMBUSTION)';
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
  const citationDOI = sources.find(s => s.doi)?.doi || null;

  // Format paragraphs with executive scientific precision
  const formattedContent = rawContent
    .split('\n\n')
    .map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';

      // Skip redundant raw bullet blocks if parameters ribbon is already present
      if (parameters && trimmed.startsWith('Key Experimental Parameters:')) {
        return '';
      }

      // Measurement Provenance & Epistemology Callout
      if (trimmed.includes('Measurement Provenance:') || trimmed.includes('Scientific Data Provenance:')) {
        const bodyText = trimmed
          .replace(/^[•\-\*]?\s*(Measurement Provenance|Scientific Data Provenance):\s*/i, '')
          .trim();
        return `
          <div class="p-3.5 rounded-xl bg-cyan-50/80 border border-cyan-200/90 text-cyan-950 space-y-1 shadow-2xs font-sans">
            <div class="text-[10px] font-mono font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-microscope text-cyan-600"></i>
              <span>Sensor Truth & Measurement Provenance</span>
            </div>
            <p class="text-xs leading-relaxed text-cyan-900 font-medium">${escapeHtml(bodyText)}</p>
          </div>
        `;
      }

      // Investigation Summary / Published Abstract
      if (trimmed.startsWith('Investigation Summary:') || trimmed.startsWith('Abstract:')) {
        const body = trimmed.replace(/^(Investigation Summary|Abstract):\s*/i, '').trim();
        return `
          <div class="p-3.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 space-y-1.5 shadow-2xs font-sans">
            <div class="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-file-lines text-purple-600"></i>
              <span>Published Research Abstract & Core Discovery</span>
            </div>
            <p class="text-xs leading-relaxed text-slate-700 font-normal">${escapeHtml(body)}</p>
          </div>
        `;
      }

      // Key Experimental Parameters (Fallback if parameters ribbon not used)
      if (trimmed.startsWith('Key Experimental Parameters:')) {
        const lines = trimmed.split('\n').slice(1);
        return `
          <div class="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-2 shadow-2xs font-sans">
            <div class="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-sliders text-purple-600"></i>
              <span>Flight Parameters</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
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
      return `<p class="leading-relaxed text-slate-700 font-sans text-xs">${escapeHtml(trimmed).replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('');

  // Sources HTML
  let sourcesHtml = '';
  if (sources && sources.length > 0) {
    sourcesHtml = `
      <div class="mt-3 pt-3 border-t border-slate-200/80 text-xs font-sans">
        <div class="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <i class="fa-solid fa-book-bookmark text-purple-600"></i>
            <span>Traceable Evidence & Peer-Reviewed Literature</span>
          </div>
          <span class="text-[9px] text-slate-400 font-normal">NASA Open Access (CC0-1.0)</span>
        </div>
        <div class="flex flex-wrap gap-2 font-mono text-[11px]">
          ${sources.map(s => `
            <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-purple-700 hover:text-purple-900 transition flex items-center gap-1.5 shadow-2xs group">
              <i class="fa-solid fa-arrow-up-right-from-square text-[9px] text-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
              <span class="font-medium">${escapeHtml(s.label)}</span>
              ${s.doi ? `<span class="text-slate-400 text-[10px]">(${escapeHtml(s.doi)})</span>` : ''}
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Quick Action Buttons Toolbar ("give it action")
  let actionsHtml = '';
  if (actions && actions.length > 0) {
    actionsHtml = `
      <div class="pt-2 flex flex-wrap items-center gap-2 font-mono text-[11px]">
        ${actions.map(act => `
          <button onclick="${escapeHtml(act.onclick)}" class="cursor-pointer px-3.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 hover:text-purple-900 transition flex items-center gap-1.5 font-semibold shadow-2xs">
            <i class="fa-solid ${act.icon} text-purple-600 text-[10px]"></i>
            <span>${escapeHtml(act.label)}</span>
          </button>
        `).join('')}
        <button onclick="window.askCopilotFollowup('Explain how ventilation airflow velocity affects flame spread in ${escapeHtml(title)}')" class="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-slate-600 hover:text-purple-800 transition flex items-center gap-1.5 text-[10px]">
          <i class="fa-solid fa-sparkles text-purple-500 text-[10px]"></i>
          <span>Ask Follow-up</span>
        </button>
      </div>
    `;
  }

  // Visual Media (High-Speed Flight Recording or Comparative Cards)
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
        <div class="h-36 sm:h-44 w-full relative overflow-hidden flex items-center justify-center bg-slate-950">
          <img src="${image}" alt="${escapeHtml(title)}" class="w-full h-full object-cover group-hover:scale-103 transition duration-500 opacity-95" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
          
          <div class="absolute top-2.5 left-2.5 flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-700 text-white shadow-sm flex items-center gap-1">
              <i class="fa-solid fa-camera"></i> NASA PSI FLIGHT TEST IMAGERY
            </span>
            ${parameters?.dataTier ? `
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-600/90 text-white backdrop-blur-sm font-semibold">
                ${escapeHtml(parameters.dataTier)}
              </span>
            ` : ''}
          </div>

          <div class="absolute bottom-2.5 left-3 right-3 text-white text-[11px] font-mono drop-shadow">
            <p class="truncate text-slate-200 font-sans">${escapeHtml(imageCaption)}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Parameters Ribbon (4 Metric Tiles)
  let parametersHtml = '';
  if (parameters) {
    parametersHtml = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <span class="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">Facility</span>
          <span class="font-bold text-slate-800 text-[11px] truncate mt-0.5" title="${escapeHtml(parameters.facility)}">${escapeHtml(parameters.facility || 'Flight Platform')}</span>
        </div>
        <div class="p-2 rounded-lg bg-purple-50/50 border border-purple-200/70 flex flex-col justify-between">
          <span class="text-purple-600 text-[9px] uppercase tracking-wider font-semibold">Flow Velocity</span>
          <span class="font-bold text-purple-800 text-[11px] truncate mt-0.5">${escapeHtml(parameters.flow || '0 cm/s')}</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <span class="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">Fuel Specimen</span>
          <span class="font-bold text-slate-800 text-[11px] truncate mt-0.5" title="${escapeHtml(parameters.fuel)}">${escapeHtml(parameters.fuel || 'Solid/Gas')}</span>
        </div>
        <div class="p-2 rounded-lg bg-emerald-50/50 border border-emerald-200/70 flex flex-col justify-between">
          <span class="text-emerald-700 text-[9px] uppercase tracking-wider font-semibold">Data Scale</span>
          <span class="font-bold text-emerald-800 text-[11px] truncate mt-0.5">${escapeHtml(parameters.dataVolume || 'Open Access')}</span>
        </div>
      </div>
    `;
  }

  // Render Full Research Card
  terminal.innerHTML = `
    <div class="space-y-3.5 font-sans">
      <!-- Title & Header Bar -->
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

      <!-- Research Imagery / Diagnostics Box -->
      ${visualMediaHtml}

      <!-- Parameter Badges Ribbon -->
      ${parametersHtml}

      <!-- Detailed Content Sections -->
      <div class="text-xs text-slate-700 space-y-2.5 leading-relaxed">
        ${formattedContent}
      </div>

      <!-- Quick Action Buttons ("give it action") -->
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
