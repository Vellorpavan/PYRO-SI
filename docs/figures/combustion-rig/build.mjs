import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/pavan/.gemini/config/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "/Users/pavan/.gemini/config/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const WIDTH = 800;
const HEIGHT = 540;

// World Dimensions
const BASE_PLATE = { x: -150, y: -80, w: 300, d: 160, r: 8 };
const PLATE_H = 12;
const FOOT_H = 6;

// Duct Assembly Coordinates
const DUCT_Y = -15;
const DUCT_Z = 28;
const DUCT_W = 180; // from x = -90 to +90
const DUCT_H = 36;
const DUCT_D = 40;

// Upstream Collimator (x = -135 to -90)
const UPSTREAM_X = -112;
const DOWNSTREAM_X = 112;

// Dial Indicator Location (mounted on magnetic stand at y = 46)
const MAG_STAND = { x: -30, y: 38, w: 34, d: 30, r: 3 };
const MAG_H = 20;
const DIAL_POST = [-16, 53];
const DIAL_POST_TOP = 105;
const DIAL_CENTER = [28, 53];
const DIAL_Z = 78;
const DIAL_R = 18;

// Flame Origin inside Quartz Chamber
const FLAME_ORIGIN = [0, DUCT_Y, DUCT_Z + 16];

// Camera Projection (Azimuth 40°, Elevation 30°, generous padding)
const P = k.fitProjection(
  [
    ...k.boxCorners(BASE_PLATE, -PLATE_H - FOOT_H, 0),
    [BASE_PLATE.x, BASE_PLATE.y, 0],
    [BASE_PLATE.x + BASE_PLATE.w, BASE_PLATE.y + BASE_PLATE.d, 0],
    [-135, DUCT_Y, DUCT_Z + DUCT_H + 10],
    [135, DUCT_Y, DUCT_Z + DUCT_H + 10],
    [DIAL_POST[0], DIAL_POST[1], DIAL_POST_TOP + 5],
    [DIAL_CENTER[0] + DIAL_R + 5, DIAL_CENTER[1], DIAL_Z + DIAL_R + 10]
  ],
  WIDTH,
  HEIGHT,
  { pad: 40, azimuth: 40 }
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], a[2] || 0], P) - k.depthOf([b[0], b[1], b[2] || 0], P));

// 1. BASE PLATE & LEVELLING FEET
function buildBasePlate() {
  const out = [];
  // Soft ambient halo under lifted plate
  out.push(`<path class="iso-halo" d="${k.haloOf(BASE_PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`);

  // 4 Leveling feet with knurled grip collars
  const feetCorners = k.corners(BASE_PLATE, 22);
  for (const [x, y] of byDepth(feetCorners)) {
    out.push(S(k.cylinder(x, y, 9, -PLATE_H - FOOT_H, 2.2, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 7.5, -PLATE_H - FOOT_H + 2.2, FOOT_H - 2.2, P, 28), { tone: "mid" }));
    out.push(L(k.knurl(x, y, 7.5, -PLATE_H - FOOT_H + 2.2, -PLATE_H, 32, P), { tone: "lo" }));
  }

  // Heavy anodized aluminum base slab
  out.push(S(k.slabOf(BASE_PLATE, -PLATE_H, PLATE_H, P, 8, 1.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BASE_PLATE, 6), 0, P), { tone: "faint" }));

  // Corner socket-head cap screws with milled counterbores
  const screws = k.corners(BASE_PLATE, 12);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.6, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55, tone: "hi" }));

  // Front Millimeter Guide Ruler
  const ruler = { x: -125, y: BASE_PLATE.y + BASE_PLATE.d - 16, w: 250, d: 8, r: 1.5 };
  out.push(S(k.slabOf(ruler, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(ruler.x + 6, ruler.x + ruler.w - 6, 4, 5, ruler.y + 1.2, 0.8, [2.2, 4.2], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([ruler.x + 3, ruler.y + 4, 0.8]), at([ruler.x + ruler.w - 3, ruler.y + 4, 0.8])], { size: 0.45 }));

  // Engraved NASA PSI Brass Data Plate
  const plate = { x: -130, y: -65, w: 55, d: 24, r: 2 };
  out.push(S(k.slabOf(plate, 0, 0.6, P, 3), { tone: "hi", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(plate, 2), 0.6, P), { tone: "mid" }));
  out.push(L(k.lineOnTop([plate.x + 5, plate.y + 6], [plate.x + plate.w - 5, plate.y + 6], 0.6, P), { tone: "mid" }));
  out.push(L(k.lineOnTop([plate.x + 5, plate.y + 12], [plate.x + plate.w - 12, plate.y + 12], 0.6, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([plate.x + 5, plate.y + 18], [plate.x + plate.w - 8, plate.y + 18], 0.6, P), { tone: "lo" }));
  out.push(D([
    at([plate.x + 2.5, plate.y + 2.5, 0.6]),
    at([plate.x + plate.w - 2.5, plate.y + 2.5, 0.6]),
    at([plate.x + 2.5, plate.y + plate.d - 2.5, 0.6]),
    at([plate.x + plate.w - 2.5, plate.y + plate.d - 2.5, 0.6])
  ], { size: 0.4, tone: "lo" }));

  return out.join("");
}

// 2. FLOW DUCT STRUCTURE & OPTICAL QUARTZ CHAMBER
function buildFlowDuct() {
  const out = [];

  // Duct Support Pedestals (Left & Right Cast Aluminum Pillows)
  for (const px of [-88, 88]) {
    const ped = { x: px - 8, y: DUCT_Y - 14, w: 16, d: 28, r: 2 };
    out.push(S(k.slabOf(ped, 0, DUCT_Z - 2, P, 4, 0.8), { tone: "mid" }));
    out.push(D([at([px, DUCT_Y - 9, DUCT_Z - 2]), at([px, DUCT_Y + 9, DUCT_Z - 2])], { size: 0.5, tone: "hi" }));
  }

  // Upstream Collimator & Honeycomb Plenum (x = -135 to -88)
  out.push(S(k.cylinder(UPSTREAM_X, DUCT_Y, 18, DUCT_Z - 4, 44, P, 32), { tone: "mid" }));
  // Gas feed inlet coupling
  out.push(S(k.cylinder(UPSTREAM_X - 16, DUCT_Y, 7, DUCT_Z + 12, 12, P, 24), { tone: "lo" }));
  out.push(L(k.knurl(UPSTREAM_X - 16, DUCT_Y, 7, DUCT_Z + 12, DUCT_Z + 24, 28, P), { tone: "lo" }));
  // Honeycomb screen retaining flange
  out.push(S(k.cylinder(-90, DUCT_Y, 20, DUCT_Z - 2, 4, P, 32), { tone: "hi" }));
  out.push(D(byDepth(k.corners({ x: -90, y: DUCT_Y - 14, w: 0, d: 28, r: 0 }, 0)).map(pt => at([-90, pt[1], DUCT_Z + 18])), { size: 0.5 }));

  // Main Optical Flow Channel (Quartz Observation Cell)
  // Base channel runner
  const bed = { x: -88, y: DUCT_Y - 15, w: 176, d: 30, r: 2 };
  out.push(S(k.slabOf(bed, DUCT_Z - 2, 3, P, 3, 0.4), { tone: "lo" }));

  // Stainless Structural Tie Rods (horizontal rods clamping the flow duct along X)
  for (const ty of [DUCT_Y - 13, DUCT_Y + 13]) {
    for (const tz of [DUCT_Z + 1, DUCT_Z + DUCT_H - 3]) {
      out.push(S(k.slabOf({ x: -88, y: ty - 1, w: 176, d: 2, r: 1 }, tz, 2, P, 2), { tone: "mid" }));
    }
  }

  // Quartz Optical Window Frame & Glazing
  const quartzBack = { x: -84, y: DUCT_Y - 13, w: 168, d: 1.5, r: 1 };
  out.push(S(k.slabOf(quartzBack, DUCT_Z + 2, DUCT_H - 4, P, 2), { tone: "faint" }));
  const quartzFront = { x: -84, y: DUCT_Y + 11.5, w: 168, d: 1.5, r: 1 };
  out.push(S(k.slabOf(quartzFront, DUCT_Z + 2, DUCT_H - 4, P, 2), { tone: "faint" }));

  // Top Viewing Window
  const quartzTop = { x: -84, y: DUCT_Y - 13, w: 168, d: 26, r: 1 };
  out.push(S(k.slabOf(quartzTop, DUCT_Z + DUCT_H - 3, 2, P, 2), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(quartzTop, 2), DUCT_Z + DUCT_H - 1, P), { tone: "mid" }));

  // Downstream Exhaust Manifold & Damper Flange (x = 88 to 135)
  out.push(S(k.cylinder(90, DUCT_Y, 20, DUCT_Z - 2, 4, P, 32), { tone: "hi" }));
  out.push(S(k.cylinder(DOWNSTREAM_X, DUCT_Y, 17, DUCT_Z - 3, 42, P, 32), { tone: "mid" }));
  // Flow damper throttling valve knob
  const damperKnob = [DOWNSTREAM_X + 16, DUCT_Y];
  out.push(S(k.cylinder(damperKnob[0], damperKnob[1], 8, DUCT_Z + DUCT_H + 4, 6, P, 28), { tone: "mid" }));
  out.push(L(k.knurl(damperKnob[0], damperKnob[1], 8, DUCT_Z + DUCT_H + 4, DUCT_Z + DUCT_H + 10, 32, P), { tone: "lo" }));
  out.push(D([at([damperKnob[0], damperKnob[1], DUCT_Z + DUCT_H + 10])], { size: 0.5, tone: "hi" }));

  return out.join("");
}

// 3. MOVABLE SPECIMEN CARRIAGE & PMMA SOLID FUEL COUPON
function buildSpecimenCarriage() {
  const out = [];

  // Carriage Base block sliding along duct bottom
  const cBlock = { x: -45, y: DUCT_Y - 8, w: 32, d: 16, r: 2 };
  out.push(S(k.slabOf(cBlock, DUCT_Z + 1, 4, P, 3, 0.5), { tone: "hi" }));
  // Knurled thumb screw for position lock
  out.push(S(k.cylinder(-29, DUCT_Y + 12, 4, DUCT_Z + 2, 3, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(-29, DUCT_Y + 12, 4, DUCT_Z + 2, DUCT_Z + 5, 20, P), { tone: "lo" }));

  // Upright Specimen Jaws
  const jaw = { x: -35, y: DUCT_Y - 2, w: 10, d: 4, r: 1 };
  out.push(S(k.slabOf(jaw, DUCT_Z + 5, 14, P, 2, 0.4), { tone: "hi" }));
  out.push(D([at([-30, DUCT_Y, DUCT_Z + 8]), at([-30, DUCT_Y, DUCT_Z + 16])], { size: 0.4, tone: "lo" }));

  // PMMA Acrylic Fuel Coupon (Flat coupon extending into test section)
  const coupon = { x: -25, y: DUCT_Y - 0.8, w: 60, d: 1.6, r: 0.6 };
  out.push(S(k.slabOf(coupon, DUCT_Z + 8, 12, P, 2, 0.2), { tone: "lo" }));
  // Metric flame spread tracking marks etched along PMMA edge
  const cmTicks = k.topTicks(coupon.x + 2, coupon.x + coupon.w - 2, 3, 5, coupon.y, DUCT_Z + 20, [1.5, 3.0], P);
  out.push(L(cmTicks.minor, { tone: "mid" }), L(cmTicks.major, { tone: "hi" }));

  // Spring-Loaded Retractable Hot-Wire Igniter Arm
  const igniterArm = [coupon.x - 2, DUCT_Y - 4];
  out.push(S(k.cylinder(igniterArm[0], igniterArm[1], 2.2, DUCT_Z + 3, 18, P, 16), { tone: "mid" }));
  // Coiled nichrome heating element wire
  out.push(L(k.coil(igniterArm[0], DUCT_Y - 2, 1.8, DUCT_Z + 12, DUCT_Z + 16, 5, P), { tone: "hi" }));

  return out.join("");
}

// 4. DIAL FLOW VELOCITY INDICATOR (0–55 cm/s)
function buildDialIndicator() {
  const out = [];

  // Heavy magnetic stand base
  out.push(S(k.slabOf(MAG_STAND, 0, 10, P, 6, 0.8), { tone: "mid" }));
  out.push(S(k.slabOf(k.insetPlan(MAG_STAND, 0.8), 10, MAG_H - 10, P, 6, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(MAG_STAND, 3), MAG_H, P), { tone: "faint" }));
  // Mag switch toggle knob
  const mKnob = [MAG_STAND.x + 10, MAG_STAND.y + 15];
  out.push(S(k.cylinder(mKnob[0], mKnob[1], 5, MAG_H, 4, P, 24), { tone: "hi" }));
  out.push(L(k.knurl(mKnob[0], mKnob[1], 5, MAG_H, MAG_H + 4, 24, P), { tone: "mid" }));
  out.push(L(k.lineOnTop([mKnob[0] - 4, mKnob[1]], [mKnob[0] + 4, mKnob[1]], MAG_H + 4, P), { tone: "lo" }));

  // Upright Stainless Column & Articulated Clamp
  out.push(S(k.cylinder(DIAL_POST[0], DIAL_POST[1], 4.5, MAG_H, DIAL_POST_TOP - MAG_H, P, 24), { tone: "mid" }));
  const clamp = { x: DIAL_POST[0] - 6, y: DIAL_POST[1] - 6, w: 12, d: 12, r: 2 };
  out.push(S(k.slabOf(clamp, DIAL_Z - 6, 12, P, 3, 0.6), { tone: "hi" }));
  // Horizontal cross extension arm leading to dial body
  out.push(S(k.slabOf({ x: DIAL_POST[0], y: DIAL_POST[1] - 1.5, w: DIAL_CENTER[0] - DIAL_POST[0], d: 3, r: 1.5 }, DIAL_Z, 3, P), { tone: "mid" }));

  // Dial Indicator Gauge Body
  out.push(S(k.cylinder(DIAL_CENTER[0], DIAL_CENTER[1], DIAL_R, DIAL_Z - 4, 8, P, 40), { tone: "mid" }));
  // Knurled rotating bezel rim
  out.push(S(k.cylinder(DIAL_CENTER[0], DIAL_CENTER[1], DIAL_R + 1.2, DIAL_Z + 2, 3, P, 40), { tone: "lo" }));
  out.push(L(k.knurl(DIAL_CENTER[0], DIAL_CENTER[1], DIAL_R + 1.2, DIAL_Z + 2, DIAL_Z + 5, 48, P), { tone: "mid" }));

  // White Dial Face & Printed Calibration Markings (0 to 60 cm/s scale)
  out.push(S(k.slabOf({ x: DIAL_CENTER[0] - DIAL_R + 1.5, y: DIAL_CENTER[1] - DIAL_R + 1.5, w: (DIAL_R - 1.5) * 2, d: (DIAL_R - 1.5) * 2, r: DIAL_R - 1.5 }, DIAL_Z + 4, 0.4, P, 16), { tone: "lit", crease: "none" }));
  const radialScale = k.radialTicks(DIAL_CENTER[0], DIAL_CENTER[1], DIAL_R - 3.5, 12, 4, DIAL_Z + 4.4, [1.8, 3.5], P, 0, Math.PI * 1.75);
  out.push(L(radialScale.minor, { tone: "lo" }), L(radialScale.major, { tone: "hi" }));
  // Zero mark accent
  out.push(L(k.lineOnTop([DIAL_CENTER[0], DIAL_CENTER[1] - DIAL_R + 4], [DIAL_CENTER[0], DIAL_CENTER[1] - DIAL_R + 7.5], DIAL_Z + 4.4, P), { tone: "hi" }));
  out.push(D([at([DIAL_CENTER[0], DIAL_CENTER[1], DIAL_Z + 4.4])], { size: 0.6, tone: "lo" }));

  return out.join("");
}

// 5. THE ACTIVE MICROGRAVITY SPHERICAL DIFFUSION FLAME (Dynamic Subject)
function needleAt(fraction) {
  const angle = -Math.PI / 2 + fraction * Math.PI * 1.75;
  const len = DIAL_R - 5;
  const tip = [DIAL_CENTER[0] + Math.cos(angle) * len, DIAL_CENTER[1] + Math.sin(angle) * len];
  return k.lineOnTop([DIAL_CENTER[0], DIAL_CENTER[1]], tip, DIAL_Z + 4.6, P);
}

// Interactive SVG Shell Assembly
const staticBase = buildBasePlate();
const staticDuct = buildFlowDuct();
const staticCarriage = buildSpecimenCarriage();
const staticDial = buildDialIndicator();

// Initial Flame & Needle geometry for 12.5 cm/s
const startVelocity = 12.5;
const maxVelocity = 55.0;

const initialNeedle = needleAt(startVelocity / maxVelocity);

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "NASA PSI Microgravity Combustion Chamber & Flame Spread Test Rig",
  body: `
    <g class="iso-static-base">${staticBase}</g>
    <g class="iso-static-duct">${staticDuct}</g>
    <g class="iso-static-carriage">${staticCarriage}</g>
    <g class="iso-static-dial">${staticDial}</g>
    
    <!-- DYNAMIC NEEDLE POINTER -->
    <g id="dial-needle-group">
      <path id="dial-needle-path" class="iso-line iso-lit" d="${initialNeedle}" stroke-width="1.2"/>
    </g>

    <!-- DYNAMIC MICROGRAVITY DIFFUSION FLAME ENVELOPE -->
    <g id="flame-group">
      <!-- Glow Filter for Authentic Blue Chemiluminescence -->
      <defs>
        <radialGradient id="spaceFlameGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="30%" stop-color="#38bdf8" stop-opacity="0.8"/>
          <stop offset="70%" stop-color="#2563eb" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0.0"/>
        </radialGradient>
        <radialGradient id="sootRingGlow" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.0"/>
          <stop offset="85%" stop-color="#d97706" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="#78350f" stop-opacity="0.0"/>
        </radialGradient>
      </defs>

      <!-- Spherical Blue Diffusion Flame Envelope -->
      <ellipse id="flame-core" cx="0" cy="0" rx="14" ry="14" fill="url(#spaceFlameGlow)" filter="drop-shadow(0 0 8px rgba(56,189,248,0.7))"/>
      <!-- Concentric Thermophoretic Soot Shell -->
      <ellipse id="flame-soot-shell" cx="0" cy="0" rx="18" ry="18" fill="none" stroke="url(#sootRingGlow)" stroke-width="2.5" opacity="0.8"/>
      <!-- Trailing Wake Plume (Grows under forced ventilation) -->
      <path id="flame-wake" class="iso-line iso-lit" d="M 0,0 L 25,0" stroke="#38bdf8" stroke-width="1.8" opacity="0.6"/>
    </g>
  `
});

// Interactive Client-Side Script
const flamePt = at(FLAME_ORIGIN);

const live = `
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const needle = document.getElementById("dial-needle-path");
const flameGroup = document.getElementById("flame-group");
const flameCore = document.getElementById("flame-core");
const flameSoot = document.getElementById("flame-soot-shell");
const flameWake = document.getElementById("flame-wake");
const readout = document.querySelector("[data-readout]");
const still = window.matchMedia("(prefers-reduced-motion: reduce)");

const P = ${JSON.stringify(P)};
const DIAL_CENTER = ${JSON.stringify(DIAL_CENTER)};
const DIAL_R = ${DIAL_R};
const DIAL_Z = ${DIAL_Z};
const FLAME_X = ${flamePt[0].toFixed(2)};
const FLAME_Y = ${flamePt[1].toFixed(2)};
const maxV = ${maxVelocity};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function calcNeedle(fraction) {
  const angle = -Math.PI / 2 + fraction * Math.PI * 1.75;
  const len = DIAL_R - 5;
  const tip = [DIAL_CENTER[0] + Math.cos(angle) * len, DIAL_CENTER[1] + Math.sin(angle) * len];
  return lineOnTop([DIAL_CENTER[0], DIAL_CENTER[1]], tip, DIAL_Z + 4.6, P);
}

let vel = ${startVelocity}, targetVel = vel;
let frame = 0, last = 0, clock = 0, touring = true, visible = false, idleTimer = 0;

function draw() {
  const frac = vel / maxV;
  needle.setAttribute("d", calcNeedle(frac));
  
  // Transform Flame: At u=0, perfectly spherical (rx=ry=15). At higher u, elongates into creeping flame wake!
  const stretchX = 14 + (vel / maxV) * 18;
  const stretchY = 14 - (vel / maxV) * 3;
  const shiftX = FLAME_X + (vel / maxV) * 22;
  const shiftY = FLAME_Y;

  flameGroup.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
  flameCore.setAttribute("rx", stretchX.toFixed(1));
  flameCore.setAttribute("ry", stretchY.toFixed(1));
  flameSoot.setAttribute("rx", (stretchX + 4).toFixed(1));
  flameSoot.setAttribute("ry", (stretchY + 4).toFixed(1));

  // Trailing wake visibility
  const wakeLen = (vel / maxV) * 35;
  flameWake.setAttribute("d", "M 0,0 L " + wakeLen.toFixed(1) + ",0");
  flameWake.style.opacity = (vel > 2.0) ? (0.2 + (vel / maxV) * 0.7) : "0";

  // Scientific Epistemic Readout
  let regime = "Spherical Diffusion";
  if (vel > 35.0) {
    regime = "Blowoff Boundary";
  } else if (vel > 2.0) {
    regime = "Creeping Flame Front";
  }

  const text = "u = " + vel.toFixed(1) + " cm/s · " + regime;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(vel)));
  stage.setAttribute("aria-valuetext", text);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  
  if (touring) {
    clock += dt;
    // Oscillate through 0 cm/s, 15 cm/s, 35 cm/s, 50 cm/s
    const wave = (Math.sin(clock * 0.8) + 1) / 2;
    targetVel = wave * 48.0;
  }

  vel = calm ? targetVel : vel + (targetVel - vel) * (1 - Math.exp(-dt / 0.22));
  if (Math.abs(targetVel - vel) < 0.05) vel = targetVel;

  draw();

  const settled = !touring && Math.abs(vel - targetVel) < 0.05;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}

const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => {
  touring = false;
  targetVel = clamp(next, 0, maxV);
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 4000);
  run();
};

new IntersectionObserver((entries) => {
  visible = entries[entries.length - 1].isIntersecting;
  if (visible) run();
}, { rootMargin: "120px 0px" }).observe(stage);

if (still.matches) touring = false;

stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const share = clamp((event.clientX - box.left) / box.width, 0, 1);
  steer(share * maxV);
});

stage.addEventListener("pointerleave", () => steer(targetVel));

stage.addEventListener("keydown", (event) => {
  let step = 0;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") step = 2.5;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") step = -2.5;
  if (event.key === "Home") { steer(0); event.preventDefault(); return; }
  if (event.key === "End") { steer(maxV); event.preventDefault(); return; }
  if (step !== 0) {
    event.preventDefault();
    steer(targetVel + step);
  }
});

draw();
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "NASA Microgravity Flame Test Rig",
  hint: "Hover: vary flow (0–55 cm/s)",
  readout: `u = ${startVelocity.toFixed(1)} cm/s · Creeping Flame Front`,
  keys: [
    { mark: "lit", label: "Spherical diffusion flame: fuel oxidation without buoyant convection (D ∝ 1/r)" },
    { mark: "raised", label: "Quartz flow duct with calibrated PMMA solid fuel sample, igniter & collimator" },
    { mark: "mid", label: "Precision differential dial manometer measuring forced duct velocity (0–55 cm/s)" }
  ],
  caption:
    "NASA BASS-II / CIR Microgravity Combustion Test Rig. In 10⁻⁶ g, gravity-driven buoyant updraft is eliminated (Gr ≈ 0), transforming flames into spherical blue diffusion envelopes with concentric soot shells. Low-speed forced duct airflow (1–20 cm/s from spacecraft ventilation) supplies fresh oxidizer and sustains creeping flame spread across solid polymer coupons where quiescent fires self-extinguish.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Microgravity Combustion Test Rig: arrow keys vary duct flow velocity" aria-valuemin="0" aria-valuemax="55" aria-valuenow="12">${svg}</div>`
});

const outHtml = k.pageHtml({
  title: "NASA PSI Microgravity Combustion & Flame Spread Test Rig",
  theme,
  body,
  script: kitScript() + live
});

const outFileName = theme === "light" ? "combustion-rig-light.html" : "combustion-rig.html";
writeFileSync(join(HERE, outFileName), outHtml);
console.log("wrote", outFileName);
