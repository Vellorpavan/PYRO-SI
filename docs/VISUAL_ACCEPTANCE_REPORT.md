# GODEYE // PYRO-SI — Visual & 3D Synchronization Acceptance Report

**Project:** GODEYE // PYRO-SI (NASA Space Apps Challenge 2026 — Flame in Freefall)  
**Milestone:** Complete 3D Asset Integration & Authoritative Environment Synchronization  
**Status:** VERIFIED & ACCEPTED  
**Date:** November 15, 2026  

---

## 1. Executive Summary

The previous environment switching defects — generic geometry placeholders, WGS84 coordinate bleed across non-terrestrial bodies, EVA gravity mischaracterization, and desynchronized flame kinetics — have been systematically resolved.

All four spaceflight and habitat scenarios now operate as complete, interactive, scientifically accurate 3D experiences powered by custom Blender 5.4 GLB assets, authoritative state management, and real-time physical telemetry.

---

## 2. 3D Asset Architecture & Blender 5.4 GLB Export

All 3D assets are authored in Blender 5.4 with PBR Principled BSDF shaders, DRACO compression, and mesh optimization:

| Asset Name | Target GLB | File Size | 3D Structural Components |
| :--- | :--- | :--- | :--- |
| **ISS Station** | `iss_station.glb` | **137,804 bytes** | Integrated Truss Structure (S0-S6, P1-P6), US Destiny Lab, Harmony Node 2, Columbus Lab, Kibo JEM, Zarya FGB, Zvezda Service Module, Cupola, 8 Solar Array Wings (SAW), 6 thermal radiators |
| **Lunar Habitat** | `lunar_habitat.glb` | **648,384 bytes** | 26m regolith mesh with crater displacement, Shackleton rim crater bowl, inflatable habitat dome, regolith protective berm, airlock with gold MLI hatch, vertical solar tower, steerable parabolic dish, 4-wheel lunar rover with wire-mesh wheels & headlights, heat flow probe |
| **Mars Habitat** | `mars_habitat.glb` | **554,108 bytes** | 26m iron-oxide ripple dune terrain, scattered dark basalt rocks, geodesic dome, ECLSS module, pressurized connector tunnel, 6-wheel rocker-bogie science rover with Mastcam & robotic arm, 4 hexagonal solar arrays, nav beacon mast with pulsing strobe |
| **Astronaut EVA** | `astronaut_eva.glb` | **213,524 bytes** | EMU Spacesuit in white orthofabric, gold reflective visor shield, dual helmet floodlights, Hard Upper Torso (HUT), chest Display and Control Module (DCM), PLSS backpack with dual O2 cylinders, articulated arms & boots floating in microgravity, Quest airlock exterior hull, yellow anodized translation handrail, red coiled safety tether |
| **Combustion Rig** | `combustion_chamber.glb` | **111,932 bytes** | Cylindrical observation chamber, multi-layer viewport flange, internal sample stage, igniter armature, gas manifold |
| **Flame 0g** | `flame_0g.glb` | **106,524 bytes** | Spherical diffusion flame with blue mantle, purple cool flame zone, pink reaction root |
| **Flame Lunar** | `flame_lunar.glb` | **6,664 bytes** | Elongated partial-g reaction cone with oxygen draft |
| **Flame 1g** | `flame_1g.glb` | **6,624 bytes** | Terrestrial buoyant teardrop plume |

---

## 3. Authoritative Environment State Machine & Physics Matrix

| Environment Key | Scene Label | Gravity ($g$) | Atmosphere ($O_2$ / $P$) | Coordinate System & Values | Flame Regime | Hazard Index |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`ISS`** | International Space Station | **$0.00001\text{ g}$** | $21\%\ O_2$ / $14.7\text{ psi}$ ($101.3\text{ kPa}$) | **WGS84 Sub-Satellite Track** (Dynamic TLE orbit: $4.87^\circ\text{ N}, 174.59^\circ\text{ W}$) | Spherical Diffusion Flame | **$40\%$ Moderate** |
| **`MOON`** | Artemis Lunar Base Camp | **$0.166\text{ g}$** | $34\%\ O_2$ / $8.2\text{ psi}$ ($56.5\text{ kPa}$) | **IAU Selenographic** ($89.90^\circ\text{ S}, 0.00^\circ\text{ E}$, Shackleton Rim) | Elongated Partial-G Plume | **$88\%$ Extreme** ($34\%\ O_2$) |
| **`MARS`** | Jezero Outpost & MAV | **$0.380\text{ g}$** | $28\%\ O_2$ / $8.0\text{ psi}$ ($55.2\text{ kPa}$) | **IAU Areocentric** ($18.38^\circ\text{ N}, 77.58^\circ\text{ E}$, Jezero Outpost) | Tapered Conical Plume | **$68\%$ High** ($0.38\text{g}$ Plume) |
| **`SUIT`** | EVA Spacewalk (Quest) | **$0.00001\text{ g}$** | $100\%\ O_2$ / $4.3\text{ psi}$ ($29.6\text{ kPa}$) | **LVLH Relative Frame** ($\text{Rel: X}+1.2\text{m}, \text{Y}-0.8\text{m}$, Quest Airlock) | Microgravity Pure Diffusion | **$96\%$ Critical** ($100\%\ O_2$) |

---

## 4. Key Architectural & Scientific Fixes

1. **Separation of Environment vs. Gravity Regime**:
   - Corrected the previous UI bug that labeled EVA as `EVA Suit (1.0 g)`.
   - EVA in Low Earth Orbit is an operational microgravity freefall regime ($0.00001\text{ g}$). Its critical fire risk is driven exclusively by hyperoxia ($100\%\ O_2$ at $4.3\text{ psi}$ / $29.6\text{ kPa}$), not terrestrial buoyancy.
2. **Elimination of Coordinate Bleed**:
   - Fixed `orbital-globe.js` telemetry loop which previously overrode Moon, Mars, and EVA coordinates with Earth WGS84 lat/lon.
   - Moon displays IAU Selenographic coordinates; Mars displays IAU Areocentric coordinates; EVA displays spacecraft-relative LVLH frame coordinates.
3. **Four Independent 3D Scene Groups**:
   - Created isolated `THREE.Group` instances (`earthOrbitGroup`, `lunarGroup`, `marsGroup`, `evaGroup`) managed by `switchEnvironment()`.
   - Dynamic atmospheric scatter: Mars displays dusty salmon/butterscotch atmosphere fog (`THREE.FogExp2(0x9a3412, 0.045)`), while Moon, ISS, and EVA maintain deep-space vacuum.
   - Secondary celestial bodies: Moon features the rotating Blue Marble Earth hanging in the black sky; EVA displays Earth in orbit below.
4. **Interactive Camera & Rotation Controls**:
   - Added speed toggles (`0.5×`, `1×`, `2×`), `Focus`, and `Reset Camera` controls.
   - Interactive OrbitControls for 360° user inspection without gimbal lock.

---

## 5. Verification & Test Evidence

- **Unit Test Runner (`tests/test-runner.js`)**: 15 / 15 tests passed (100% green).
- **Environment Transition Simulator (`scripts/verify_environment_transitions.js`)**:
  - `ISS ➔ MOON ➔ ISS`: PASS
  - `ISS ➔ MARS ➔ ISS`: PASS
  - `MOON ➔ MARS ➔ SUIT`: PASS
  - `SUIT ➔ MOON ➔ ISS`: PASS
- **Visual Capture Suite (`scripts/capture_all_views.py`)**: 15 high-resolution screenshots generated and verified across desktop and mobile form factors.
