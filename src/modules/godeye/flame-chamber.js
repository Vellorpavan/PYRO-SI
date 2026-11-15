/**
 * GODEYE // Flame Behavior Visualization & Chamber Simulation
 * High-Fidelity Microgravity & Partial-G Combustion Engine
 * Features:
 * 1. Deep Space Combustion Chamber Viewport with Observation Flange & Burner Nozzle
 * 2. 0.0g Spherical Blue Diffusion Flame with Cool Flame Mantle & Diffusion Inflow Vectors
 * 3. 0.16g Lunar Elongated Partial-G Plume (Weak Buoyancy + 34% O2 Exploration Atmosphere)
 * 4. 0.38g Mars Conical Reaction Plume
 * 5. 1.0g Terrestrial Buoyant Flickering Teardrop (10-15 Hz)
 * 6. Rigorous 6-Tier Epistemic Provenance Badging ([SUPPORTED], [ILLUSTRATIVE SCENARIO], [MEASURED])
 */

let flameCanvas, flameCtx;
let flameParticles = [];
let currentFlameMode = '0g';
let flameTick = 0;
let animationFrameId = null;

export function initFlameCanvas() {
  const container = document.getElementById('home-flame-slot') || document.getElementById('flame-chamber-3d-slot');
  if (!container) return;

  // Find or create canvas
  let canvas = container.querySelector('canvas') || document.getElementById('flame-physics-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'flame-physics-canvas';
    canvas.className = 'w-full h-full block rounded-xl';
    container.appendChild(canvas);
  }

  flameCanvas = canvas;
  flameCtx = flameCanvas.getContext('2d');

  resizeFlameCanvas();
  window.addEventListener('resize', resizeFlameCanvas);

  // Initialize flame particle pool
  flameParticles = [];
  for (let i = 0; i < 90; i++) {
    flameParticles.push(createFlameParticle());
  }

  // Set initial 0g microgravity mode
  setFlameVisualMode(currentFlameMode);

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animateFlamePhysics();
}

export const initFlameChamber = initFlameCanvas;

export function resizeFlameCanvas() {
  if (!flameCanvas) return;
  const parent = flameCanvas.parentElement;
  if (!parent) return;
  flameCanvas.width = parent.clientWidth || 360;
  flameCanvas.height = parent.clientHeight || 220;
}

function createFlameParticle() {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 32;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    life: Math.random() * 70 + 20,
    maxLife: 90,
    size: Math.random() * 4.5 + 2.0,
    hue: Math.random() > 0.6 ? 195 : 215,
    radius: radius,
    angle: angle,
    speed: Math.random() * 0.5 + 0.2
  };
}

/**
 * Switches the Flame Morphology & Updates Strict Provenance Badges
 */
export function setFlameVisualMode(mode) {
  currentFlameMode = mode;

  // Update button active state
  document.querySelectorAll('.flame-mode-btn, .flame-mode-pill').forEach(btn => {
    btn.classList.remove('active-mode', 'bg-purple-50', 'text-purple-700', 'border-purple-200', 'font-semibold');
    btn.classList.add('text-slate-600', 'hover:bg-slate-100');
    const dot = btn.querySelector('span:first-child');
    if (dot) {
      dot.classList.remove('bg-purple-600');
      dot.classList.add('bg-slate-300');
    }
  });

  const btnId = (mode === 'mars' || mode === 'insideout') ? 'flame-mode-insideout' : ('flame-mode-' + mode);
  const activeBtn = document.getElementById(btnId) || document.getElementById('flame-mode-' + mode);
  if (activeBtn) {
    activeBtn.classList.add('active-mode', 'bg-purple-50', 'text-purple-700', 'border', 'border-purple-200', 'font-semibold');
    activeBtn.classList.remove('text-slate-600', 'hover:bg-slate-100');
    const dot = activeBtn.querySelector('span:first-child');
    if (dot) {
      dot.classList.remove('bg-slate-300');
      dot.classList.add('bg-purple-600');
    }
  }

  // Update Scientific Badges & Readouts
  const badge = document.getElementById('flame-regime-badge');
  const geom = document.getElementById('flame-geom-readout');
  const temp = document.getElementById('flame-temp-readout');
  const trans = document.getElementById('flame-transport-readout');
  const cool = document.getElementById('flame-coolflame-readout');
  const cap = document.getElementById('flame-physics-caption');

  if (mode === '0g') {
    if (badge) {
      badge.textContent = 'REGIME: MICROGRAVITY [SUPPORTED: PSI-69 / PSI-25]';
      badge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
    if (geom) geom.textContent = 'Spherical Diffusion Flame (Microgravity)';
    if (temp) temp.textContent = '~1,120 K (Cooler, non-buoyant)';
    if (trans) trans.textContent = 'Pure Molecular Diffusion';
    if (cool) cool.textContent = 'Active (FLEX / CFI Discovery)';
    if (cap) cap.textContent = 'Uniform, cooler, and soot-lean combustion. In true freefall with zero buoyancy, oxygen diffuses uniformly inward from all directions. Low temperatures suppress soot, and low-temperature "cool flame" reactions continue after visible extinction.';
  } else if (mode === 'lunar') {
    if (badge) {
      badge.textContent = 'REGIME: LUNAR 0.16g [ILLUSTRATIVE THEORETICAL SCENARIO]';
      badge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200';
    }
    if (geom) geom.textContent = 'Elongated Partial-G Plume (Lunar 0.16g)';
    if (temp) temp.textContent = '~1,540 K (Elevated Reaction Zone)';
    if (trans) trans.textContent = 'Weak Natural Convection + 34% O₂ Draft';
    if (cool) cool.textContent = 'Suppressed by High O₂';
    if (cap) cap.textContent = 'Exploratory partial-gravity scenario. Theoretical models suggest gentle buoyant convection supplies fresh oxidizer without blowing flame out. (In-situ flight data is pending future Artemis missions).';
  } else if (mode === 'insideout' || mode === 'mars') {
    if (badge) {
      badge.textContent = 'REGIME: MARS 0.38g [ILLUSTRATIVE THEORETICAL SCENARIO]';
      badge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200';
    }
    if (geom) geom.textContent = 'Tapered Conical Plume (Mars 0.38g)';
    if (temp) temp.textContent = '~1,720 K (Moderate Thermal Draft)';
    if (trans) trans.textContent = 'Intermediate Buoyant Plume';
    if (cool) cool.textContent = 'Quenched by Draft';
    if (cap) cap.textContent = 'Exploratory martian scenario. Moderate gravitational buoyancy generates a defined conical plume with partial soot incandescence. (No in-situ combustion measurements exist on Mars).';
  } else if (mode === '1g') {
    if (badge) {
      badge.textContent = 'REGIME: TERRESTRIAL BASELINE [MEASURED: 1.00g]';
      badge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-300';
    }
    if (geom) geom.textContent = 'Flickering Teardrop (Earth 1.0g Baseline)';
    if (temp) temp.textContent = '~1,950 K (Hot Yellow Core)';
    if (trans) trans.textContent = 'Strong Thermal Buoyant Plume (~1.5 m/s)';
    if (cool) cool.textContent = 'None (Quenched by Rapid Air Entrainment)';
    if (cap) cap.textContent = 'Standard Earth gravity baseline. Strong buoyant convection (~1.5 m/s) lifts hot gases, driving soot incandescence (bright yellow core) and characteristic 10–15 Hz flickering.';
  }
}

/**
 * 60 FPS Particle Physics & Flame Morphology Loop
 */
export function animateFlamePhysics() {
  animationFrameId = requestAnimationFrame(animateFlamePhysics);
  if (!flameCtx || !flameCanvas) return;

  flameTick += 0.035;

  const w = flameCanvas.width;
  const h = flameCanvas.height;
  const cx = w * 0.5;
  const cy = h * 0.54;

  // 1. Deep Space Combustion Chamber Background
  flameCtx.fillStyle = '#070b16';
  flameCtx.fillRect(0, 0, w, h);

  // 2. Chamber Observation Flange Bezel (Metallic Ring)
  const bezelRadius = Math.min(w * 0.42, h * 0.44);
  flameCtx.save();
  flameCtx.beginPath();
  flameCtx.arc(cx, cy, bezelRadius, 0, Math.PI * 2);
  flameCtx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
  flameCtx.lineWidth = 4;
  flameCtx.stroke();

  // Subtle Cyan Quartz Glass Reflection Rim
  flameCtx.beginPath();
  flameCtx.arc(cx, cy, bezelRadius - 4, 0, Math.PI * 2);
  flameCtx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
  flameCtx.lineWidth = 1.5;
  flameCtx.stroke();
  flameCtx.restore();

  // 3. Central Fuel Burner Nozzle Base
  const nozzleWidth = 14;
  const nozzleHeight = 36;
  const nozzleTopY = cy + 34;

  flameCtx.save();
  const nozzleGrad = flameCtx.createLinearGradient(cx - nozzleWidth/2, 0, cx + nozzleWidth/2, 0);
  nozzleGrad.addColorStop(0, '#78350f');
  nozzleGrad.addColorStop(0.5, '#d97706');
  nozzleGrad.addColorStop(1, '#b45309');
  flameCtx.fillStyle = nozzleGrad;
  flameCtx.fillRect(cx - nozzleWidth/2, nozzleTopY, nozzleWidth, nozzleHeight);

  // Burner Tip Ring
  flameCtx.fillStyle = '#fbbf24';
  flameCtx.beginPath();
  flameCtx.ellipse(cx, nozzleTopY, nozzleWidth/2, 3, 0, 0, Math.PI * 2);
  flameCtx.fill();
  flameCtx.restore();

  // 4. Render Morphology based on active gravity regime
  if (currentFlameMode === '0g') {
    // -------------------------------------------------------------
    // REGIME 0g: Authentic Spherical Diffusion Flame (BASS-II / FLEX)
    // -------------------------------------------------------------
    const pulse = Math.sin(flameTick * 1.8) * 2.5;
    const flameRadius = 46 + pulse;

    // A. Outer Cool Flame Halo (Purple / Blue Weak Luminescence)
    const haloGrad = flameCtx.createRadialGradient(cx, cy, flameRadius * 0.4, cx, cy, flameRadius * 1.5);
    haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    haloGrad.addColorStop(0.5, 'rgba(124, 58, 237, 0.18)');
    haloGrad.addColorStop(1, 'rgba(124, 58, 237, 0)');
    flameCtx.fillStyle = haloGrad;
    flameCtx.beginPath();
    flameCtx.arc(cx, cy, flameRadius * 1.5, 0, Math.PI * 2);
    flameCtx.fill();

    // B. Main Spherical Diffusion Flame Shell (Deep Sky Blue)
    const shellGrad = flameCtx.createRadialGradient(cx, cy, 2, cx, cy, flameRadius);
    shellGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    shellGrad.addColorStop(0.25, 'rgba(103, 232, 249, 0.9)');
    shellGrad.addColorStop(0.65, 'rgba(2, 132, 199, 0.7)');
    shellGrad.addColorStop(0.9, 'rgba(3, 105, 161, 0.3)');
    shellGrad.addColorStop(1, 'rgba(3, 105, 161, 0)');
    flameCtx.fillStyle = shellGrad;
    flameCtx.beginPath();
    flameCtx.arc(cx, cy, flameRadius, 0, Math.PI * 2);
    flameCtx.fill();

    // C. Warm Reaction Root at Nozzle Tip
    const rootGrad = flameCtx.createRadialGradient(cx, nozzleTopY - 4, 1, cx, nozzleTopY - 4, 12);
    rootGrad.addColorStop(0, 'rgba(255, 241, 242, 0.95)');
    rootGrad.addColorStop(0.4, 'rgba(244, 63, 94, 0.85)');
    rootGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    flameCtx.fillStyle = rootGrad;
    flameCtx.beginPath();
    flameCtx.arc(cx, nozzleTopY - 4, 12, 0, Math.PI * 2);
    flameCtx.fill();

    // D. Inward Molecular Diffusion Inflow Particles
    for (let i = 0; i < flameParticles.length; i++) {
      const p = flameParticles[i];
      p.life--;
      p.radius -= p.speed * 0.7;
      if (p.radius < 10 || p.life <= 0) {
        p.radius = bezelRadius * 0.85;
        p.life = p.maxLife;
        p.angle = Math.random() * Math.PI * 2;
      }
      const px = cx + Math.cos(p.angle) * p.radius;
      const py = cy + Math.sin(p.angle) * p.radius;
      const alpha = (p.life / p.maxLife) * 0.45;
      flameCtx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
      flameCtx.beginPath();
      flameCtx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
      flameCtx.fill();
    }

  } else if (currentFlameMode === 'lunar') {
    // -------------------------------------------------------------
    // REGIME 0.16g: Elongated Partial-G Plume (Weak Buoyancy)
    // -------------------------------------------------------------
    flameCtx.save();
    flameCtx.translate(cx, cy + 8);
    flameCtx.scale(0.85, 1.4);
    const grad = flameCtx.createRadialGradient(0, 10, 4, 0, -12, 54);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    grad.addColorStop(0.2, 'rgba(56, 189, 248, 0.85)');
    grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.75)');
    grad.addColorStop(0.85, 'rgba(239, 68, 68, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flameCtx.fillStyle = grad;
    flameCtx.beginPath();
    flameCtx.arc(0, -6, 56, 0, Math.PI * 2);
    flameCtx.fill();
    flameCtx.restore();

  } else if (currentFlameMode === 'insideout' || currentFlameMode === 'mars') {
    // -------------------------------------------------------------
    // REGIME 0.38g: Mars Conical Reaction Plume
    // -------------------------------------------------------------
    flameCtx.save();
    flameCtx.translate(cx, cy + 10);
    flameCtx.scale(0.8, 1.55);
    const grad = flameCtx.createRadialGradient(0, 12, 4, 0, -14, 52);
    grad.addColorStop(0, 'rgba(255, 255, 240, 0.98)');
    grad.addColorStop(0.25, 'rgba(251, 191, 36, 0.88)');
    grad.addColorStop(0.65, 'rgba(249, 115, 22, 0.6)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flameCtx.fillStyle = grad;
    flameCtx.beginPath();
    flameCtx.arc(0, -8, 54, 0, Math.PI * 2);
    flameCtx.fill();
    flameCtx.restore();

  } else {
    // -------------------------------------------------------------
    // REGIME 1.0g: Terrestrial Buoyant Flickering Teardrop (10-15 Hz)
    // -------------------------------------------------------------
    flameCtx.save();
    const flicker = Math.sin(flameTick * 8) * 3.5;
    flameCtx.translate(cx + flicker * 0.4, cy + 14);
    flameCtx.scale(0.72, 1.85);
    const grad = flameCtx.createRadialGradient(flicker, 14, 3, 0, -18, 50);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.99)');
    grad.addColorStop(0.2, 'rgba(254, 240, 138, 0.95)');
    grad.addColorStop(0.55, 'rgba(234, 179, 8, 0.85)');
    grad.addColorStop(0.85, 'rgba(220, 38, 38, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flameCtx.fillStyle = grad;
    flameCtx.beginPath();
    flameCtx.arc(0, -12, 52, 0, Math.PI * 2);
    flameCtx.fill();
    flameCtx.restore();
  }
}
