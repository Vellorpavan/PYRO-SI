/**
 * Main Application Orchestrator
 * Bootstraps all modules, event listeners, and services.
 */

import { initGodEyeGlobe, animateGodEyeGlobe, resetGlobeCamera, switchEnvironment, setEarthRotationSpeed, setCameraPerspective, focusAstronaut, focusISS, zoomIn, zoomOut } from '../modules/godeye/orbital-globe.js';
import { initFlameCanvas, setFlameVisualMode } from '../modules/godeye/flame-chamber.js';
import { selectHabitatNode, loadHabitatIntoSimulator } from '../modules/godeye/habitat-controller.js';
import { renderPsiMatrix, updateSiWeights } from '../modules/investigation-matrix/matrix-renderer.js';
import { renderComparisonTable, toggleCompareStudy, resetDefaultComparison } from '../modules/investigation-matrix/comparator.js';
import { runPredictiveModel, applySimPreset } from '../modules/flammability-simulator/presets.js';
import { runSiPrompt, submitCustomSiQuery } from '../modules/research-copilot/copilot-controller.js';
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
window.copySubmissionBlock = copySubmissionBlock;

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

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[PYRO-SI] Initializing modular architecture...');

  // 1. Core 3D & 2D Visualizers
  initGodEyeGlobe();
  animateGodEyeGlobe();
  initFlameCanvas();

  // 2. Telemetry & Orbital Ticker
  startTelemetryTicker();

  // 3. Habitat Initial State
  selectHabitatNode('ISS');

  // 4. Matrix & Comparator
  renderPsiMatrix();
  renderComparisonTable();

  // 5. Flammability Simulator
  runPredictiveModel();

  // 6. Research Co-Pilot Initial Prompt
  runSiPrompt('moon');

  // 7. Mission Incidents & Spinoffs
  renderIncidentsAndSpinoffs();

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
});
