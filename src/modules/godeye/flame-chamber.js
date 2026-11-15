/**
 * GODEYE // Flame Chamber Particle Physics Simulator
 * 2D Canvas Microgravity & Partial-G Visualizer
 */

let flameCanvas, flameCtx;
let flameParticles = [];
let currentFlameMode = '0g';
let flameTick = 0;
let animationFrameId = null;

export function initFlameCanvas() {
  flameCanvas = document.getElementById('flame-physics-canvas');
  if (!flameCanvas) return;
  flameCtx = flameCanvas.getContext('2d');

  resizeFlameCanvas();
  window.addEventListener('resize', resizeFlameCanvas);

  // Initialize particle pool
  flameParticles = [];
  for (let i = 0; i < 85; i++) {
    flameParticles.push(createFlameParticle());
  }

  animateFlamePhysics();
}

export function resizeFlameCanvas() {
  if (!flameCanvas) return;
  const parent = flameCanvas.parentElement;
  if (!parent) return;
  flameCanvas.width = parent.clientWidth || 400;
  flameCanvas.height = parent.clientHeight || 460;
}

function createFlameParticle() {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 28;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    life: Math.random() * 60 + 20,
    maxLife: 80,
    size: Math.random() * 5 + 2.5,
    hue: Math.random() > 0.65 ? 190 : 210, // Default blue cool flame
    radius: radius,
    angle: angle,
    speed: Math.random() * 0.6 + 0.3
  };
}

export function setFlameVisualMode(mode) {
  currentFlameMode = mode;

  // Update button active state
  document.querySelectorAll('.flame-mode-btn, .flame-mode-pill').forEach(btn => {
    btn.classList.remove('active-mode', 'bg-purple-50', 'text-purple-700', 'border-purple-200', 'bg-sky-400/20', 'text-sky-400', 'border-sky-400/50', 'bg-cyanHud/20', 'text-cyanHud', 'border-cyanHud/50', 'font-bold');
    btn.classList.add('text-slate-600', 'hover:bg-slate-100');
    const dot = btn.querySelector('span:first-child');
    if (dot) {
      dot.classList.remove('bg-purple-600');
      dot.classList.add('bg-slate-300');
    }
  });

  const activeBtn = document.getElementById('flame-mode-' + mode);
  if (activeBtn) {
    activeBtn.classList.add('active-mode', 'bg-purple-50', 'text-purple-700', 'border', 'border-purple-200', 'font-semibold');
    activeBtn.classList.remove('text-slate-600', 'hover:bg-slate-100');
    const dot = activeBtn.querySelector('span:first-child');
    if (dot) {
      dot.classList.remove('bg-slate-300');
      dot.classList.add('bg-purple-600');
    }
  }

  const badge = document.getElementById('flame-regime-badge');
  const geom = document.getElementById('flame-geom-readout');
  const temp = document.getElementById('flame-temp-readout');
  const trans = document.getElementById('flame-transport-readout');
  const cool = document.getElementById('flame-coolflame-readout');
  const cap = document.getElementById('flame-physics-caption');

  if (mode === '0g') {
    if (badge) badge.textContent = 'REGIME: MICROGRAVITY (0.00g)';
    if (geom) geom.textContent = 'Perfect Sphere (Diffusion Shell)';
    if (temp) temp.textContent = '1,120 K (Cooler, non-buoyant)';
    if (trans) trans.textContent = 'Molecular Diffusion (Quiescent)';
    if (cool) cool.textContent = 'Active (FLEX / CFI Discovery)';
    if (cap) cap.textContent = 'Spherical blue flame. In true freefall with zero buoyancy, oxygen diffuses uniformly inward from all directions. Flame temperatures are lower (~1100 K), soot production is suppressed, and low-temperature "cool flame" burning continues after visible extinction.';
  } else if (mode === 'lunar') {
    if (badge) badge.textContent = 'REGIME: LUNAR PARTIAL-G (0.16g)';
    if (geom) geom.textContent = 'Elongated Ellipsoid + Slanted Tail';
    if (temp) temp.textContent = '1,540 K (Elevated Reaction Zone)';
    if (trans) trans.textContent = 'Weak Natural Convection + 34% O₂ Draft';
    if (cool) cool.textContent = 'Suppressed by High O₂';
    if (cap) cap.textContent = 'Lunar partial gravity (0.16g) combined with 34% O₂ Exploration Atmosphere. Buoyant plume is weak but continuous—feeding fresh oxidizer without blowing flame out. Studies in ACME CFI-G proved materials burn faster here than either 1g or 0g.';
  } else if (mode === 'insideout') {
    if (badge) badge.textContent = 'REGIME: ACME CFI-G INSIDE-OUT';
    if (geom) geom.textContent = 'Annular Cylindrical Ring';
    if (temp) temp.textContent = '1,820 K (High Thermal Gradient)';
    if (trans) trans.textContent = 'Forced Coflow Duct Inverted Plume';
    if (cool) cool.textContent = 'Observable in Diluted Quench';
    if (cap) cap.textContent = 'NASA ACME Coflow Flame inside CIR. Fuel gas emits from a central jet while oxidizer flows around it. In inverted partial gravity, buoyant acceleration pulls flame inward, creating complex annular reaction rings and soot traps.';
  } else if (mode === '1g') {
    if (badge) badge.textContent = 'REGIME: TERRESTRIAL BASELINE (1.00g)';
    if (geom) geom.textContent = 'Flickering Teardrop (High Aspect)';
    if (temp) temp.textContent = '1,950 K (Hot Yellow Core)';
    if (trans) trans.textContent = 'Strong Thermal Buoyant Plume';
    if (cool) cool.textContent = 'None (Quenched by Rapid Air Entrainment)';
    if (cap) cap.textContent = 'Standard Earth gravity baseline. Hot combustion gases rise violently due to buoyant density differences (~1g upward draft ~1.5 m/s). Causes rapid soot incandescence (bright yellow flame) and characteristic teardrop flickering at 10–15 Hz.';
  }
}

export function animateFlamePhysics() {
  animationFrameId = requestAnimationFrame(animateFlamePhysics);
  if (!flameCtx || !flameCanvas) return;

  flameTick += 0.035;

  const w = flameCanvas.width;
  const h = flameCanvas.height;
  const cx = w * 0.5;
  const cy = h * 0.56;

  // Background clear
  flameCtx.fillStyle = 'rgba(6, 8, 12, 0.45)';
  flameCtx.fillRect(0, 0, w, h);

  // Subtle coordinate grid
  flameCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  flameCtx.lineWidth = 1;
  for (let x = 0; x < w; x += 28) {
    flameCtx.beginPath(); flameCtx.moveTo(x, 0); flameCtx.lineTo(x, h); flameCtx.stroke();
  }
  for (let y = 0; y < h; y += 28) {
    flameCtx.beginPath(); flameCtx.moveTo(0, y); flameCtx.lineTo(w, y); flameCtx.stroke();
  }

  // Draw Mode-Specific Flame Core Glow
  if (currentFlameMode === '0g') {
    const pulse = Math.sin(flameTick) * 3;
    const grad = flameCtx.createRadialGradient(cx, cy, 6, cx, cy, 74 + pulse);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(0, 150, 255, 0.55)');
    grad.addColorStop(0.75, 'rgba(60, 20, 220, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flameCtx.fillStyle = grad;
    flameCtx.beginPath();
    flameCtx.arc(cx, cy, 78 + pulse, 0, Math.PI * 2);
    flameCtx.fill();

    // Secondary Cool Flame Ring
    flameCtx.strokeStyle = 'rgba(168, 85, 247, ' + (0.35 + Math.sin(flameTick * 1.5) * 0.15) + ')';
    flameCtx.lineWidth = 2;
    flameCtx.beginPath();
    flameCtx.arc(cx, cy, 88 + pulse * 1.2, 0, Math.PI * 2);
    flameCtx.stroke();

    // Inward Oxygen Diffusion Vector Arrows
    flameCtx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    flameCtx.lineWidth = 1.2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const rStart = 104;
      const rEnd = 78 + ((flameTick * 10) % 12);
      const x1 = cx + Math.cos(a) * rStart;
      const y1 = cy + Math.sin(a) * rStart;
      const x2 = cx + Math.cos(a) * rEnd;
      const y2 = cy + Math.sin(a) * rEnd;
      flameCtx.beginPath();
      flameCtx.moveTo(x1, y1);
      flameCtx.lineTo(x2, y2);
      flameCtx.stroke();
    }
  } else if (modeIsLunar()) {
    // 0.16g Lunar: Elongated upward flame with oxygen enrichment
    flameCtx.save();
    flameCtx.translate(cx, cy);
    flameCtx.scale(0.85, 1.45);
    const grad = flameCtx.createRadialGradient(0, 12, 5, 0, -8, 65);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.2, 'rgba(0, 240, 255, 0.8)');
    grad.addColorStop(0.55, 'rgba(255, 107, 0, 0.6)');
    grad.addColorStop(0.85, 'rgba(255, 42, 84, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flameCtx.fillStyle = grad;
    flameCtx.beginPath();
    flameCtx.arc(0, -5, 68, 0, Math.PI * 2);
    flameCtx.fill();
    flameCtx.restore();
  } else if (currentFlameMode === 'insideout') {
    // Annular ring inside-out
    const pulse = Math.cos(flameTick * 1.6) * 4;
    const grad = flameCtx.createRadialGradient(cx, cy, 14, cx, cy, 86 + pulse);
    grad.addColorStop(0, 'rgba(6, 8, 14, 0.8)');
    grad.addColorStop(0.35, 'rgba(0, 240, 255, 0.75)');
    grad.addColorStop(0.7, 'rgba(255, 107, 0, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flameCtx.fillStyle = grad;
    flameCtx.beginPath();
    flameCtx.arc(cx, cy, 86 + pulse, 0, Math.PI * 2);
    flameCtx.fill();

    // Outward velocity vectors
    flameCtx.strokeStyle = 'rgba(255, 107, 0, 0.5)';
    flameCtx.lineWidth = 1.2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      const r1 = 18;
      const r2 = 42 + ((flameTick * 14) % 18);
      flameCtx.beginPath();
      flameCtx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      flameCtx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      flameCtx.stroke();
    }
  } else {
    // 1g Teardrop Flame with Buoyant Flickering
    flameCtx.save();
    flameCtx.translate(cx, cy + 20);
    flameCtx.scale(0.75, 1.85);
    const flicker = Math.sin(flameTick * 4) * 3;
    const grad = flameCtx.createRadialGradient(flicker, 18, 4, 0, -10, 58);
    grad.addColorStop(0, 'rgba(255, 255, 200, 0.98)');
    grad.addColorStop(0.25, 'rgba(255, 180, 0, 0.85)');
    grad.addColorStop(0.65, 'rgba(255, 80, 0, 0.55)');
    grad.addColorStop(0.9, 'rgba(180, 20, 0, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    flameCtx.fillStyle = grad;
    flameCtx.beginPath();
    flameCtx.arc(0, -12, 60, 0, Math.PI * 2);
    flameCtx.fill();
    flameCtx.restore();
  }

  // Draw Central Fuel Burner / Droplet Node
  flameCtx.fillStyle = '#0f172a';
  flameCtx.beginPath();
  flameCtx.arc(cx, cy, 8, 0, Math.PI * 2);
  flameCtx.fill();
  flameCtx.strokeStyle = currentFlameMode === '1g' ? '#ff6b00' : '#00f0ff';
  flameCtx.lineWidth = 2;
  flameCtx.stroke();

  // Update & Draw Particles
  for (let i = 0; i < flameParticles.length; i++) {
    const p = flameParticles[i];
    p.life--;

    if (p.life <= 0) {
      flameParticles[i] = createFlameParticle();
      continue;
    }

    const progress = p.life / p.maxLife;
    let px = cx;
    let py = cy;

    if (currentFlameMode === '0g' || currentFlameMode === 'insideout') {
      const r = p.radius + progress * (currentFlameMode === 'insideout' ? 75 : 58);
      px = cx + Math.cos(p.angle) * r;
      py = cy + Math.sin(p.angle) * r;
      flameCtx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${progress * 0.75})`;
    } else if (currentFlameMode === 'lunar') {
      p.angle += 0.02;
      const r = p.radius * 0.7 + (1 - progress) * 48;
      px = cx + Math.cos(p.angle) * r * 0.8;
      py = cy + Math.sin(p.angle) * r * 0.5 - (1 - progress) * 75; // Weak upward plume
      flameCtx.fillStyle = `hsla(${180 + (1 - progress) * 45}, 90%, 60%, ${progress * 0.8})`;
    } else {
      // 1g buoyant upward velocity
      p.x += p.vx * 0.8;
      p.y -= p.speed * 2.8; // Fast upward draft
      px = cx + p.x;
      py = cy + p.y;
      flameCtx.fillStyle = `hsla(${30 + progress * 25}, 100%, 55%, ${progress * 0.85})`;
    }

    flameCtx.beginPath();
    flameCtx.arc(px, py, p.size * progress, 0, Math.PI * 2);
    flameCtx.fill();
  }
}

function modeIsLunar() {
  return currentFlameMode === 'lunar';
}
