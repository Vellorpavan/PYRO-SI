/**
 * Main Application Orchestrator
 * Bootstraps all modules, event listeners, and services.
 */

import { initGodEyeGlobe, animateGodEyeGlobe, resetGlobeCamera, switchEnvironment, setEarthRotationSpeed, setCameraPerspective, focusAstronaut, focusISS, zoomIn, zoomOut } from '../modules/godeye/orbital-globe.js';
import { initFlameCanvas, setFlameVisualMode } from '../modules/godeye/flame-chamber.js';
import { selectHabitatNode, loadHabitatIntoSimulator } from '../modules/godeye/habitat-controller.js';
import { renderPsiMatrix, updateSiWeights, resetPrioritizationWeights } from '../modules/investigation-matrix/matrix-renderer.js';
import { renderComparisonTable, toggleCompareStudy, resetDefaultComparison, applyRecommendedTrio } from '../modules/investigation-matrix/comparator.js';
import { runPredictiveModel, applySimPreset } from '../modules/flammability-simulator/presets.js';
import { runSiPrompt, submitCustomSiQuery, openGeminiConfigModal, closeGeminiConfigModal, saveGeminiApiKey, clearGeminiApiKey, updateGeminiStatusBadge, askCopilotFollowup, showToast } from '../modules/research-copilot/copilot-controller.js';
import { startTelemetryTicker } from '../modules/mission-intelligence/telemetry-ticker.js';
import { renderIncidentsAndSpinoffs } from '../modules/mission-intelligence/incidents-renderer.js';
import { copySubmissionBlock } from '../modules/submission-kit/clipboard-helper.js';
import { switchMainTab } from './router.js';

// Expose necessary handlers on window for HTML button onclick bindings
window.switchMainTab = switchMainTab;
window.selectHabitatNode = selectHabitatNode;
window.loadHabitatIntoSimulator = loadHabitatIntoSimulator;
window.resetGlobeCamera = resetGlobeCamera;
window.switchEnvironment = switchEnvironment;
window.switchGodEyeEnvironment = switchEnvironment;
window.setEarthRotationSpeed = setEarthRotationSpeed;
window.setCameraPerspective = setCameraPerspective;
window.focusAstronaut = focusAstronaut;
window.focusISS = focusISS;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.setFlameVisualMode = setFlameVisualMode;
window.updateSiWeights = updateSiWeights;
window.resetPrioritizationWeights = resetPrioritizationWeights;
window.applyRecommendedTrio = applyRecommendedTrio;
window.renderPsiMatrix = renderPsiMatrix;
window.toggleCompareStudy = (id) => {
  toggleCompareStudy(id);
  renderPsiMatrix();
};
window.resetDefaultComparison = () => {
  resetDefaultComparison();
  renderPsiMatrix();
};
window.viewPsiStudy = (id) => {
  switchMainTab('tab-psi');
  const searchInput = document.getElementById('psi-search-input');
  if (searchInput) {
    searchInput.value = id;
    renderPsiMatrix();
  }
};
window.applySimPreset = applySimPreset;
window.runPredictiveModel = runPredictiveModel;
window.runSiPrompt = runSiPrompt;
window.submitCustomSiQuery = submitCustomSiQuery;
window.askCopilotFollowup = askCopilotFollowup;
window.openGeminiConfigModal = openGeminiConfigModal;
window.closeGeminiConfigModal = closeGeminiConfigModal;
window.saveGeminiApiKey = saveGeminiApiKey;
window.clearGeminiApiKey = clearGeminiApiKey;
window.showToast = showToast;
window.copySubmissionBlock = copySubmissionBlock;
window.copyResearchCitation = (citationText) => {
  if (!citationText) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(citationText).then(() => {
      showToast(`Citation copied: ${citationText}`, 'success');
    }).catch(() => {
      prompt('Copy Research Citation:', citationText);
    });
  } else {
    prompt('Copy Research Citation:', citationText);
  }
};

// Home Dashboard Co-Pilot Search Integration
window.submitHomeQuery = () => {
  const input = document.getElementById('home-copilot-input');
  const val = (input?.value || '').trim();
  if (!val) return;
  const ans = document.getElementById('home-copilot-answer');
  if (ans) {
    ans.innerHTML = `<span class="font-semibold text-purple-700 animate-pulse flex items-center gap-2"><i class="fa-solid fa-spinner fa-spin"></i><span>Synthesizing NASA PSI Archives for "${val}"...</span></span>`;
  }
  
  import('../modules/research-copilot/knowledge-engine.js').then(m => {
    const res = m.queryKnowledgeBase(val);
    if (res && ans) {
      const summaryText = res.content.split('\n\n')[0];
      ans.innerHTML = `
        <div class="space-y-1.5 font-sans">
          <div class="flex items-center justify-between">
            <span class="font-bold text-purple-900">${res.title}</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800">${res.badge}</span>
          </div>
          <p class="text-slate-700 text-xs">${summaryText}</p>
          <div class="pt-1 flex items-center justify-between text-[11px] font-mono">
            <button onclick="window.switchMainTab('tab-copilot'); window.askCopilotFollowup('${val.replace(/'/g, "\\'")}')" class="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer">
              <span>View Full Dossier in Co-Pilot</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
            <span class="text-slate-400 text-[10px]">${res.verified ? 'Verified NASA Record' : 'Conversational Intel'}</span>
          </div>
        </div>
      `;
    }
  });
};

window.runQuickQuery = (key) => {
  const ans = document.getElementById('home-copilot-answer');
  if (!ans) return;
  import('../modules/research-copilot/knowledge-engine.js').then(m => {
    const res = m.getPresetResponse(key);
    if (res && ans) {
      const summaryText = res.content.split('\n\n')[0];
      ans.innerHTML = `
        <div class="space-y-1.5 font-sans">
          <div class="flex items-center justify-between">
            <span class="font-bold text-purple-900">${res.title}</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800">${res.badge}</span>
          </div>
          <p class="text-slate-700 text-xs">${summaryText}</p>
          <div class="pt-1 flex items-center justify-between text-[11px] font-mono">
            <button onclick="window.switchMainTab('tab-copilot'); window.runSiPrompt('${key}')" class="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer">
              <span>Open in Research Co-Pilot</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
            <span class="text-emerald-700 text-[10px] font-bold">Verified NASA Grounding</span>
          </div>
        </div>
      `;
    }
  });
};

// Lab Studio View Switcher (3D Orbital Globe vs 2D Flame Physics)
window.switchLabStudio = (mode) => {
  const globeBox = document.getElementById('studio-view-globe');
  const flameBox = document.getElementById('studio-view-flame');
  const btnGlobe = document.getElementById('studio-btn-globe');
  const btnFlame = document.getElementById('studio-btn-flame');

  if (mode === 'globe') {
    if (globeBox) globeBox.classList.remove('hidden');
    if (flameBox) flameBox.classList.add('hidden');
    if (btnGlobe) {
      btnGlobe.classList.add('active');
      btnGlobe.classList.remove('inactive');
    }
    if (btnFlame) {
      btnFlame.classList.remove('active');
      btnFlame.classList.add('inactive');
    }
  } else {
    if (globeBox) globeBox.classList.add('hidden');
    if (flameBox) flameBox.classList.remove('hidden');
    if (btnFlame) {
      btnFlame.classList.add('active');
      btnFlame.classList.remove('inactive');
    }
    if (btnGlobe) {
      btnGlobe.classList.remove('active');
      btnGlobe.classList.add('inactive');
    }
    window.dispatchEvent(new Event('resize'));
  }
};

// Initialize on DOM Ready or immediately if already loaded
function bootstrapApp() {
  console.log('[PYRO-SI] Initializing modular architecture...');

  // 1. Core 3D & 2D Visualizers
  try {
    initGodEyeGlobe();
    animateGodEyeGlobe();
  } catch (err) {
    console.warn('[PYRO-SI] Globe visualizer skipped (e.g. headless/no-WebGL):', err);
  }

  try {
    initFlameCanvas();
  } catch (err) {
    console.warn('[PYRO-SI] Flame canvas skipped:', err);
  }

  // 2. Telemetry & Orbital Ticker
  try {
    startTelemetryTicker();
  } catch (err) {
    console.warn('[PYRO-SI] Telemetry ticker skipped:', err);
  }

  // 3. Habitat Initial State
  try {
    selectHabitatNode('ISS');
  } catch (err) {
    console.warn('[PYRO-SI] Habitat init skipped:', err);
  }

  // 4. Matrix & Comparator
  try {
    renderPsiMatrix();
    renderComparisonTable();
  } catch (err) {
    console.warn('[PYRO-SI] Matrix render skipped:', err);
  }

  // 5. Flammability Simulator
  try {
    runPredictiveModel();
  } catch (err) {
    console.warn('[PYRO-SI] Predictive model skipped:', err);
  }

  // 6. Research Co-Pilot Initial Prompt & Gemini Badge
  try {
    runSiPrompt('moon');
    updateGeminiStatusBadge();
  } catch (err) {
    console.warn('[PYRO-SI] Co-pilot init skipped:', err);
  }

  // 7. Mission Incidents & Spinoffs
  try {
    renderIncidentsAndSpinoffs();
  } catch (err) {
    console.warn('[PYRO-SI] Incidents render skipped:', err);
  }

  // 8. Deep-linking & URL parameter routing
  const urlParams = new URLSearchParams(window.location.search);
  const targetTab = urlParams.get('tab');
  if (targetTab) {
    switchMainTab(targetTab);
  }
  const targetEnv = urlParams.get('env');
  if (targetEnv) {
    selectHabitatNode(targetEnv.toUpperCase());
  }
  const targetFlame = urlParams.get('flame');
  if (targetFlame) {
    setFlameVisualMode(targetFlame);
  }
  const targetStudio = urlParams.get('studio');
  if (targetStudio && window.switchLabStudio) {
    window.switchLabStudio(targetStudio);
  }
  const targetQuery = urlParams.get('q');
  if (targetQuery) {
    submitCustomSiQuery(targetQuery);
  }

  // Bind input listeners
  const customQueryInput = document.getElementById('si-custom-input');
  if (customQueryInput) {
    customQueryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitCustomSiQuery();
      }
    });
  }

  const searchInput = document.getElementById('psi-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderPsiMatrix();
    });
  }

  console.log('[PYRO-SI] System successfully mounted and operational.');
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
  } else {
    bootstrapApp();
  }
}
