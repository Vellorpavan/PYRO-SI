# GODEYE // PYRO-SI — 3D Asset & Interactive Rendering Plan

**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*  
**Date:** November 15, 2026  
**Status:** REVISED UNDER SCIENTIFIC REVIEW GATE  
**Runtime Engine:** Three.js (WebGL 2.0 / PBR Materials / GLTF 2.0)  
**Authoring Pipeline:** Blender 5.4.0 Alpha (`/Applications/Blender.app`) + Procedural WebGL Buffer Generators  

---

## 1. 3D Architecture Overview & Epistemic Boundaries

In accordance with the NASA Space Apps 2026 Scientific Review Gate:
1. **Interactive Real-Time 3D, Not Static Imagery:** All interactive components are executed via WebGL 2.0 and Three.js at 60 FPS, with interactive camera control, orbit tracking, and procedural shaders.
2. **Strict Epistemic Classification (`ILLUSTRATIVE`):**
   - 3D visual representations of flames and extraterrestrial surfaces are categorized as **`ILLUSTRATIVE`** educational and conceptual models.
   - They communicate observed physical morphology and theoretical scaling principles.
   - They are **NOT** presented as direct numerical solutions of the Navier-Stokes equations, nor as in-situ lunar/martian flight recordings.
3. **Transparent Gravity Grounding:**
   - The $0\text{g}$ spherical diffusion flame is grounded in verified flight video from FLEX (`PSI-69`) and BASS-II (`PSI-25`).
   - The $0.16\text{g}$ and $0.38\text{g}$ flame plumes are grounded in De Ris thermal balance theory and parabolic flight hypotheses; they are explicitly designated as **`ILLUSTRATIVE THEORETICAL SCENARIOS`** to reflect the known partial-gravity data gap.

---

## 2. Six Required 3D Experiences Specification

### 2.1. Experience 1: Realistic Earth Globe & Orbital Telemetry
- **Classification:** `ILLUSTRATIVE ASTRONOMICAL MODEL` (Keplerian Orbit Physics)
- **Geometry:** High-tessellation sphere ($64 \times 64$ segments), radius $R = 1.65\ \text{units}$.
- **Textures & Shading:**
  - Albedo: NASA Visible Earth Blue Marble $2048 \times 1024$ equirectangular projection map.
  - Night Lights: City illumination map on the unlit hemisphere (custom fragment blend).
  - Ocean Specularity: High shininess on water bodies with low roughness; matte continents.
  - Atmosphere Halo: Dual-layer Fresnel scattering rim shader pulsing with Rayleigh blue glow ($480\ \text{nm}$).
- **Orbital Flight Track:** Inclined Keplerian orbit ring ($51.6^\circ$ inclination matching real ISS orbit, altitude $408.4\ \text{km}$).
- **Controls:** Inertial rotation, damping, and click-to-reset camera.

### 2.2. Experience 2: 3D International Space Station (ISS) Model
- **Classification:** `ILLUSTRATIVE CAD MODEL` (NASA Heritage Dimensions)
- **Geometry:** Modular low-to-mid poly ($<12,000$ triangles for WebGL performance):
  - Central Truss Backbone (S0, S1, S2, P0, P1, P2).
  - Pressurized Module Stack: Zvezda Service Module, Zarya FGB, Unity Node 1, Destiny US Lab, Harmony Node 2, Columbus ESA Lab, and Kibo JAXA Module.
  - Cupola Observation Dome with viewing window ports.
  - 8 Photovoltaic Solar Array Wings (glowing solar cell texture with rotational tracking toward the directional sun light).
- **Interactivity:** Clicking the ISS marker focuses the camera on the station with telemetric flight readout (`408.4 km | 7.66 km/s`).

### 2.3. Experience 3: 3D Lunar Surface & Artemis Base Habitat
- **Classification:** `ILLUSTRATIVE CONCEPTUAL HABITAT`
- **Geometry:**
  - Lunar Terrain: Displaced cratered surface representing Shackleton Crater rim near the lunar South Pole.
  - Inflatable Habitat Dome: Pressurized multi-layered Kevlar/Nomex inflatable habitat dome with airlock docking port.
  - Vertical Solar Tower Array: Continuous sunlight harvesting tower.
  - Earth in the Sky: Realistic Earth hanging low over the lunar horizon.
- **Lighting:** Harsh, shadow-contrasted solar illumination without atmospheric diffusion (true lunar vacuum condition).

### 2.4. Experience 4: 3D Mars Surface & Habitat Environment
- **Classification:** `ILLUSTRATIVE CONCEPTUAL HABITAT`
- **Geometry:**
  - Red Planet Terrain: Iron oxide regolith procedural mesh with dunes and basalt boulders.
  - Geodesic Habitat Structure: Translucent reinforced aerogel dome pressurized at $8.2\ \text{psi}$ EAM.
  - Dust Filtration & Life Support Intake: Air scrubbers modeled after MOXIE and DAFT experiment recommendations.
- **Lighting & Atmosphere:** Salmon-pink atmospheric scatter haze simulating low-pressure $0.006\ \text{bar}\ \text{CO}_2$ atmosphere.

### 2.5. Experience 5: 3D Experimental Combustion Chamber (CIR / MSG)
- **Classification:** `ILLUSTRATIVE HARDWARE APPARATUS`
- **Geometry:**
  - Pressure Vessel Body: Cylindrical stainless steel chamber with vacuum seal flanges and quartz observation windows.
  - Central Fuel Burner Nozzle: Axisymmetric fuel injection tube ($D = 1.0\ \text{mm}$) with ceramic nozzle tip.
  - Ignition Spark Igniter Wire: Dual retractable electrode wires positioned at the nozzle exit plane.
  - Optical Chamber Diagnostics: Photodiode radiometers, color video camera lenses, and laser absorption mirrors.
- **Lighting:** Ambient chamber lighting combined with dynamic flame emission illuminating the interior steel walls.

### 2.6. Experience 6: 3D Scientific Flame Morphological Dynamics
- **0.0g (Microgravity — ISS / FLEX / BASS-II):**
  - **Status:** `SUPPORTED BY FLIGHT OBSERVATION [PSI-69 / PSI-25]`
  - Geometry: Spherically symmetric diffusion shell ($R = 0.45\ \text{units}$).
  - Shading: Translucent blue chemiluminescence ($\text{CH}^*$ and $\text{C}_2^*$ radicals at $430\ \text{nm}$).
  - Dynamics: Stationary, non-flickering, soot-free combustion shell with inward radial molecular diffusion vectors and outer cool flame mantle ($500 - 800\ \text{K}$).
- **0.16g (Partial Gravity — Lunar Base):**
  - **Status:** `ILLUSTRATIVE THEORETICAL SCENARIO (EXPLORATORY)`
  - Geometry: Upwardly elongated, slanted ellipsoid ($R_x = 0.35, R_y = 0.75$).
  - Shading: Bright blue base with faint golden reaction rim where weak convection feeds fresh oxidizer.
  - Dynamics: Gentle, stable plume without terrestrial flickering.
- **0.38g (Partial Gravity — Mars Habitat):**
  - **Status:** `ILLUSTRATIVE THEORETICAL SCENARIO (EXPLORATORY)`
  - Geometry: Tapered conical flame with distinct reaction boundary ($R_y = 0.95$).
  - Shading: Transition from blue reaction zone to luminous orange soot incandescence near tip.
- **1.0g (Normal Earth Gravity Baseline):**
  - **Status:** `MEASURED TERRESTRIAL BASELINE`
  - Geometry: High-aspect teardrop flame ($R_y = 1.45$).
  - Shading: Yellow-white soot incandescence ($1950\ \text{K}$) with blue base anchor.
  - Dynamics: Rapid turbulent flickering at $12 - 15\ \text{Hz}$ with upward buoyant velocity ($>1.5\ \text{m/s}$).

---

## 3. Polycount & Memory Budgets for Zero-Latency WebGL

```
┌──────────────────────────────┬──────────────────┬─────────────────┬────────────────────────────────────┐
│ Asset / Scene                │ Target Triangle  │ Texture Memory  │ Performance Budget (Target FPS)    │
│                              │ Count Budget     │ Allocation      │                                    │
├──────────────────────────────┼──────────────────┼─────────────────┼────────────────────────────────────┤
│ Earth Globe & Atmosphere     │ 8,192 tris       │ 4.0 MB          │ 60 FPS on integrated mobile GPUs   │
│ ISS 3D Station Model         │ 9,500 tris       │ 2.5 MB          │ 60 FPS                             │
│ Lunar Base Terrain & Dome    │ 6,400 tris       │ 3.0 MB          │ 60 FPS                             │
│ Mars Habitat & Regolith      │ 6,400 tris       │ 3.0 MB          │ 60 FPS                             │
│ 3D Combustion Chamber Rig    │ 7,800 tris       │ 2.0 MB          │ 60 FPS                             │
│ Dynamic Flame Emitter Engine │ 1,200 particles  │ Procedural Shdr │ 60 FPS                             │
│ Total Combined Scene Budget  │ < 40,000 tris    │ < 15.0 MB       │ Zero stutter, <1.2s initial load   │
└──────────────────────────────┴──────────────────┴─────────────────┴────────────────────────────────────┘
```

---

## 4. Blender Automation & Asset Export Script

Blender 5.4 is invoked headlessly via `/Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/generate_3d_assets.py` to create clean geometric GLTF components. Three.js provides seamless procedural fallback generation so the application is completely self-contained and functions offline without dependency on external server endpoints.
