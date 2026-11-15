#!/usr/bin/env python3
"""
GODEYE // PYRO-SI — Blender 3D Asset Generator
Builds authentic 3D models and exports GLB/GLTF assets for the WebGL runtime:
1. iss_station.glb — Detailed ISS model (truss, modules, solar wings, cupola)
2. lunar_habitat.glb — Lunar landscape, cratered regolith, habitat dome, solar tower, rover
3. mars_habitat.glb — Mars red regolith, geodesic habitat dome, ECLSS module, collectors
4. combustion_chamber.glb — Pressure chamber, quartz viewing flange, burner nozzle, igniter
5. flame_models.glb — 0g spherical diffusion flame, 0.16g partial-g plume, 1g buoyant teardrop
"""

import bpy
import os
import math

OUTPUT_DIR = "/Users/pavan/Desktop/PYRO-SI/assets/models"
PUBLIC_DIR = "/Users/pavan/Desktop/PYRO-SI/public/assets/models"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

def reset_scene():
    """Clear all objects, materials, meshes, and lights."""
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_pbr_material(name, base_color, metallic=0.0, roughness=0.5, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = next(n for n in nodes if n.type == 'BSDF_PRINCIPLED')
    
    # Base Color
    if 'Base Color' in bsdf.inputs:
        bsdf.inputs['Base Color'].default_value = base_color
    
    # Metallic & Roughness
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = metallic
    if 'Roughness' in bsdf.inputs:
        bsdf.inputs['Roughness'].default_value = roughness
        
    # Emission (handle Blender 4.0+ socket names)
    if emission:
        em_socket = bsdf.inputs.get('Emission Color') or bsdf.inputs.get('Emission')
        if em_socket:
            em_socket.default_value = emission
        em_str = bsdf.inputs.get('Emission Strength')
        if em_str:
            em_str.default_value = emission_strength
            
    return mat

def export_glb(filename):
    out_path = os.path.join(OUTPUT_DIR, filename)
    pub_path = os.path.join(PUBLIC_DIR, filename)
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True
    )
    # Copy to public dir
    import shutil
    shutil.copyfile(out_path, pub_path)
    print(f"[Blender 3D] Exported {filename} -> {os.path.getsize(out_path)} bytes")

# =============================================================================
# 1. INTERNATIONAL SPACE STATION (ISS)
# =============================================================================
def build_iss_model():
    reset_scene()
    print("[Blender 3D] Building ISS 3D Model...")

    mat_metal = create_pbr_material("ISS_Metal", (0.85, 0.88, 0.92, 1.0), metallic=0.9, roughness=0.25)
    mat_module = create_pbr_material("ISS_Module", (0.92, 0.94, 0.96, 1.0), metallic=0.4, roughness=0.35)
    mat_solar = create_pbr_material("ISS_Solar", (0.05, 0.12, 0.35, 1.0), metallic=0.8, roughness=0.15, emission=(0.02, 0.08, 0.25, 1.0), emission_strength=1.5)
    mat_gold = create_pbr_material("ISS_GoldMLI", (0.95, 0.72, 0.15, 1.0), metallic=0.95, roughness=0.2)
    mat_radiator = create_pbr_material("ISS_Radiator", (0.95, 0.95, 0.95, 1.0), metallic=0.1, roughness=0.8)
    mat_glass = create_pbr_material("ISS_Glass", (0.1, 0.3, 0.5, 1.0), metallic=0.1, roughness=0.05, emission=(0.0, 0.2, 0.4, 1.0), emission_strength=0.8)

    # Central Integrated Truss Structure (ITS)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0), scale=(12.0, 0.45, 0.45))
    truss = bpy.context.active_object
    truss.name = "ISS_Truss_Backbone"
    truss.data.materials.append(mat_metal)

    # Pressurized Modules Stack (Z-axis forward/backward)
    # 1. US Destiny Lab
    bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=2.8, location=(0, 0, -0.6), rotation=(math.pi/2, 0, 0))
    destiny = bpy.context.active_object
    destiny.name = "Module_Destiny_Lab"
    destiny.data.materials.append(mat_module)

    # 2. Harmony Node 2
    bpy.ops.mesh.primitive_cylinder_add(radius=0.52, depth=1.6, location=(0, 0, -2.6), rotation=(math.pi/2, 0, 0))
    harmony = bpy.context.active_object
    harmony.name = "Module_Harmony_Node2"
    harmony.data.materials.append(mat_module)

    # 3. Columbus European Lab (Port side)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.48, depth=2.0, location=(-1.2, 0, -2.6), rotation=(0, math.pi/2, 0))
    columbus = bpy.context.active_object
    columbus.name = "Module_Columbus_ESA"
    columbus.data.materials.append(mat_module)

    # 4. Kibo Japanese Experiment Module (Starboard side)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.50, depth=2.5, location=(1.4, 0, -2.6), rotation=(0, math.pi/2, 0))
    kibo = bpy.context.active_object
    kibo.name = "Module_Kibo_JAXA"
    kibo.data.materials.append(mat_module)

    # 5. Unity Node 1
    bpy.ops.mesh.primitive_cylinder_add(radius=0.52, depth=1.5, location=(0, 0, 1.2), rotation=(math.pi/2, 0, 0))
    unity = bpy.context.active_object
    unity.name = "Module_Unity_Node1"
    unity.data.materials.append(mat_module)

    # 6. Zarya Functional Cargo Block (FGB)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.54, depth=3.0, location=(0, 0, 3.2), rotation=(math.pi/2, 0, 0))
    zarya = bpy.context.active_object
    zarya.name = "Module_Zarya_FGB"
    zarya.data.materials.append(mat_gold)

    # 7. Zvezda Service Module (with solar wings)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.56, depth=3.2, location=(0, 0, 6.0), rotation=(math.pi/2, 0, 0))
    zvezda = bpy.context.active_object
    zvezda.name = "Module_Zvezda_SM"
    zvezda.data.materials.append(mat_module)

    # 8. Cupola Observation Dome (facing Earth +Y)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.38, location=(0, 0.65, 1.2))
    cupola = bpy.context.active_object
    cupola.name = "Module_Cupola_Observatory"
    cupola.data.materials.append(mat_glass)

    # Solar Array Wings (8 main PV wings on P6, P4, S4, S6)
    solar_positions = [
        (-5.5, 0, -0.2), (-4.5, 0, -0.2), (-2.5, 0, -0.2), (-1.5, 0, -0.2),
        (1.5, 0, -0.2), (2.5, 0, -0.2), (4.5, 0, -0.2), (5.5, 0, -0.2)
    ]
    for i, pos in enumerate(solar_positions):
        # Upper panel
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(pos[0], 2.8, pos[2]), scale=(0.85, 3.8, 0.04))
        p_up = bpy.context.active_object
        p_up.name = f"Solar_Panel_Wing_{i}_Up"
        p_up.data.materials.append(mat_solar)
        # Lower panel
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(pos[0], -2.8, pos[2]), scale=(0.85, 3.8, 0.04))
        p_dn = bpy.context.active_object
        p_dn.name = f"Solar_Panel_Wing_{i}_Dn"
        p_dn.data.materials.append(mat_solar)

    # Thermal Radiator Panels
    for i, rx in enumerate([-3.5, 3.5]):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(rx, 0, 1.5), scale=(0.1, 1.8, 2.4))
        rad = bpy.context.active_object
        rad.name = f"Thermal_Radiator_{i}"
        rad.data.materials.append(mat_radiator)

    export_glb("iss_station.glb")

# =============================================================================
# 2. LUNAR BASE CAMP & HABITAT
# =============================================================================
def build_lunar_habitat():
    reset_scene()
    print("[Blender 3D] Building Lunar Base Camp 3D Scene...")

    mat_regolith = create_pbr_material("Lunar_Regolith", (0.35, 0.36, 0.38, 1.0), metallic=0.05, roughness=0.95)
    mat_dome = create_pbr_material("Habitat_Inflatable_Shell", (0.96, 0.96, 0.96, 1.0), metallic=0.1, roughness=0.3)
    mat_airlock = create_pbr_material("Airlock_Frame", (0.8, 0.82, 0.85, 1.0), metallic=0.85, roughness=0.25)
    mat_gold_foil = create_pbr_material("Lunar_MLI_Gold", (0.95, 0.75, 0.15, 1.0), metallic=0.95, roughness=0.15)
    mat_solar_tower = create_pbr_material("Vertical_Solar_Array", (0.05, 0.1, 0.3, 1.0), metallic=0.7, roughness=0.2, emission=(0.02, 0.06, 0.2, 1.0), emission_strength=1.2)
    mat_lights = create_pbr_material("Habitat_Work_Lights", (1.0, 0.95, 0.8, 1.0), metallic=0.0, roughness=0.1, emission=(1.0, 0.95, 0.8, 1.0), emission_strength=4.0)

    # Lunar Surface Terrain with Craters
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=40, y_subdivisions=40, size=24.0, location=(0, 0, -0.4))
    ground = bpy.context.active_object
    ground.name = "Lunar_Terrain_Regolith"
    ground.data.materials.append(mat_regolith)
    
    # Deform terrain vertices procedurally to simulate crater rim
    for v in ground.data.vertices:
        dist = math.sqrt(v.co.x**2 + v.co.y**2)
        # Central plateau for base, ridge at r=7, small bumps
        elevation = math.sin(dist * 0.8) * 0.35 + math.cos(v.co.x * 0.5) * 0.15
        if dist < 4.0:
            elevation *= 0.2 # Flatten base pad
        v.co.z += elevation

    # Pressurized Inflatable Habitat Dome
    bpy.ops.mesh.primitive_uv_sphere_add(radius=3.2, location=(0, 0, 0))
    dome = bpy.context.active_object
    dome.name = "Artemis_Habitat_Main_Dome"
    dome.scale = (1.0, 1.0, 0.65) # Hemisphere dome
    dome.data.materials.append(mat_dome)

    # Habitat Protective Outer Ring / Berm
    bpy.ops.mesh.primitive_torus_add(major_radius=3.4, minor_radius=0.45, location=(0, 0, 0))
    berm = bpy.context.active_object
    berm.name = "Regolith_Shielding_Berm"
    berm.data.materials.append(mat_regolith)

    # Pressurized Airlock Tunnel
    bpy.ops.mesh.primitive_cylinder_add(radius=0.85, depth=2.4, location=(0, 3.8, 0.2), rotation=(math.pi/2, 0, 0))
    airlock = bpy.context.active_object
    airlock.name = "Habitat_EVA_Airlock"
    airlock.data.materials.append(mat_airlock)

    # Airlock Outer Hatch
    bpy.ops.mesh.primitive_cylinder_add(radius=0.75, depth=0.25, location=(0, 5.0, 0.2), rotation=(math.pi/2, 0, 0))
    hatch = bpy.context.active_object
    hatch.name = "EVA_Airlock_Hatch"
    hatch.data.materials.append(mat_gold_foil)

    # Vertical Solar Power Array Tower
    bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=6.5, location=(-5.0, -3.0, 2.8))
    mast = bpy.context.active_object
    mast.name = "Solar_Tower_Mast"
    mast.data.materials.append(mat_airlock)

    # Solar Panels on Tower
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-5.0, -3.0, 4.2), scale=(0.1, 2.8, 3.5))
    solar_panels = bpy.context.active_object
    solar_panels.name = "Solar_Tower_Panels"
    solar_panels.data.materials.append(mat_solar_tower)

    # High-Gain Communication Dish
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.1, location=(4.2, -3.5, 2.2))
    dish = bpy.context.active_object
    dish.name = "High_Gain_Comms_Dish"
    dish.scale = (1.0, 1.0, 0.3)
    dish.rotation_euler = (0.4, 0.2, 0.8)
    dish.data.materials.append(mat_airlock)

    # Exterior Workflood Lamps
    bpy.ops.mesh.primitive_cube_add(size=0.4, location=(0, 4.8, 1.4))
    lamp = bpy.context.active_object
    lamp.name = "Airlock_Flood_Lamp"
    lamp.data.materials.append(mat_lights)

    export_glb("lunar_habitat.glb")

# =============================================================================
# 3. MARS EXPLORATION HABITAT
# =============================================================================
def build_mars_habitat():
    reset_scene()
    print("[Blender 3D] Building Mars Exploration Habitat 3D Scene...")

    mat_mars_sand = create_pbr_material("Mars_Iron_Oxide", (0.72, 0.32, 0.18, 1.0), metallic=0.05, roughness=0.9)
    mat_mars_dome = create_pbr_material("Mars_Geodesic_Shell", (0.88, 0.85, 0.80, 1.0), metallic=0.2, roughness=0.35)
    mat_eclss = create_pbr_material("ECLSS_Scrubber_Rig", (0.75, 0.78, 0.82, 1.0), metallic=0.8, roughness=0.3)
    mat_solar_mars = create_pbr_material("Mars_PV_Array", (0.1, 0.15, 0.25, 1.0), metallic=0.6, roughness=0.25, emission=(0.04, 0.08, 0.15, 1.0), emission_strength=1.0)
    mat_beacon = create_pbr_material("Mars_Beacon_Light", (1.0, 0.2, 0.1, 1.0), metallic=0.1, roughness=0.1, emission=(1.0, 0.2, 0.1, 1.0), emission_strength=5.0)

    # Martian Dunes Terrain
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=40, y_subdivisions=40, size=24.0, location=(0, 0, -0.4))
    ground = bpy.context.active_object
    ground.name = "Mars_Regolith_Terrain"
    ground.data.materials.append(mat_mars_sand)

    for v in ground.data.vertices:
        # Dune ripples along X axis + randomized undulating mounds
        dune = math.sin(v.co.x * 0.6) * 0.45 + math.cos(v.co.y * 0.4) * 0.25
        if math.sqrt(v.co.x**2 + v.co.y**2) < 4.5:
            dune *= 0.15 # Flat landing pad
        v.co.z += dune

    # Geodesic Pressurized Habitat
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=3.4, location=(0, 0, 0.2))
    dome = bpy.context.active_object
    dome.name = "Mars_Pressurized_Habitat"
    dome.scale = (1.0, 1.0, 0.7)
    dome.data.materials.append(mat_mars_dome)

    # Life Support & MOXIE Oxygen Production Annex
    bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=2.2, location=(4.2, 0, 0.8))
    moxie = bpy.context.active_object
    moxie.name = "ECLSS_Oxygen_Production_Module"
    moxie.data.materials.append(mat_eclss)

    # Pressurized Connector Tunnel
    bpy.ops.mesh.primitive_cylinder_add(radius=0.7, depth=2.4, location=(2.4, 0, 0.5), rotation=(0, math.pi/2, 0))
    tunnel = bpy.context.active_object
    tunnel.name = "Habitat_ECLSS_Tunnel"
    tunnel.data.materials.append(mat_mars_dome)

    # Mars Surface Solar Collector Farm (Folded Hexagon Array)
    for i, angle in enumerate([0.5, 1.8, 3.2, 4.5]):
        px = math.cos(angle) * 6.2
        py = math.sin(angle) * 6.2
        bpy.ops.mesh.primitive_cylinder_add(radius=1.4, depth=0.1, location=(px, py, 0.2), vertices=6)
        sol = bpy.context.active_object
        sol.name = f"Mars_Solar_Array_{i}"
        sol.data.materials.append(mat_solar_mars)

    # Emergency Nav Beacon
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=5.5, location=(-3.8, 3.8, 2.5))
    mast = bpy.context.active_object
    mast.name = "Nav_Beacon_Mast"
    mast.data.materials.append(mat_eclss)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.25, location=(-3.8, 3.8, 5.3))
    beacon = bpy.context.active_object
    beacon.name = "Nav_Beacon_Strobe"
    beacon.data.materials.append(mat_beacon)

    export_glb("mars_habitat.glb")

# =============================================================================
# 4. COMBUSTION EXPERIMENT CHAMBER (CIR / MSG RIG)
# =============================================================================
def build_combustion_chamber():
    reset_scene()
    print("[Blender 3D] Building Combustion Experiment Chamber 3D Model...")

    mat_chamber_body = create_pbr_material("Chamber_Stainless_Steel", (0.82, 0.84, 0.88, 1.0), metallic=0.9, roughness=0.25)
    mat_flange = create_pbr_material("Chamber_Flange_Dark", (0.25, 0.27, 0.32, 1.0), metallic=0.85, roughness=0.35)
    mat_viewport_glass = create_pbr_material("Quartz_Observation_Window", (0.8, 0.95, 1.0, 0.4), metallic=0.1, roughness=0.05)
    mat_nozzle = create_pbr_material("Fuel_Burner_Nozzle", (0.9, 0.75, 0.3, 1.0), metallic=0.95, roughness=0.2)
    mat_electrode = create_pbr_material("Ignition_Spark_Electrode", (0.95, 0.3, 0.2, 1.0), metallic=0.8, roughness=0.3)
    mat_burner_glow = create_pbr_material("Igniter_Pilot_Glow", (0.0, 0.7, 1.0, 1.0), metallic=0.0, roughness=0.1, emission=(0.0, 0.8, 1.0, 1.0), emission_strength=4.0)

    # Pressure Chamber Outer Cylindrical Hull
    bpy.ops.mesh.primitive_cylinder_add(radius=2.6, depth=4.2, location=(0, 0, 0), vertices=36)
    hull = bpy.context.active_object
    hull.name = "Pressure_Vessel_Outer_Hull"
    hull.data.materials.append(mat_chamber_body)

    # Circular Observation Flange Port (Front +Y)
    bpy.ops.mesh.primitive_cylinder_add(radius=1.85, depth=0.45, location=(0, 2.3, 0), rotation=(math.pi/2, 0, 0), vertices=32)
    flange = bpy.context.active_object
    flange.name = "Viewport_Reinforcement_Flange"
    flange.data.materials.append(mat_flange)

    # Quartz Transparent Observation Window
    bpy.ops.mesh.primitive_cylinder_add(radius=1.6, depth=0.2, location=(0, 2.35, 0), rotation=(math.pi/2, 0, 0), vertices=32)
    window = bpy.context.active_object
    window.name = "Quartz_Observation_Window"
    window.data.materials.append(mat_viewport_glass)

    # Viewport Flange Hex Bolts
    for i in range(12):
        angle = (i / 12.0) * math.pi * 2
        bx = math.cos(angle) * 1.72
        bz = math.sin(angle) * 1.72
        bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=0.3, location=(bx, 2.45, bz), rotation=(math.pi/2, 0, 0), vertices=6)
        bolt = bpy.context.active_object
        bolt.name = f"Flange_Hex_Bolt_{i}"
        bolt.data.materials.append(mat_chamber_body)

    # Central Fuel Injection Burner Rig (Center bottom)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=1.2, location=(0, 0, -1.3), vertices=24)
    burner_base = bpy.context.active_object
    burner_base.name = "Burner_Mount_Base"
    burner_base.data.materials.append(mat_flange)

    # Coaxial Burner Jet Tube
    bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=1.2, location=(0, 0, -0.4), vertices=16)
    nozzle = bpy.context.active_object
    nozzle.name = "Coaxial_Fuel_Nozzle"
    nozzle.data.materials.append(mat_nozzle)

    # Nozzle Tip Rim
    bpy.ops.mesh.primitive_torus_add(major_radius=0.18, minor_radius=0.04, location=(0, 0, 0.2))
    rim = bpy.context.active_object
    rim.name = "Nozzle_Ceramic_Tip_Rim"
    rim.data.materials.append(mat_burner_glow)

    # Dual Ignition Spark Needle Electrodes
    for side, sx in [("Left", -0.32), ("Right", 0.32)]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.55, location=(sx, 0, 0.12), rotation=(0, math.pi * (0.15 if sx < 0 else -0.15), 0))
        el = bpy.context.active_object
        el.name = f"Spark_Electrode_{side}"
        el.data.materials.append(mat_electrode)

    # Gas Supply Feed Lines
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=2.8, location=(-1.4, -0.8, -0.2), vertices=12)
    line1 = bpy.context.active_object
    line1.name = "Oxidizer_Feed_Line"
    line1.data.materials.append(mat_nozzle)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=2.8, location=(1.4, -0.8, -0.2), vertices=12)
    line2 = bpy.context.active_object
    line2.name = "Inert_Diluent_Feed_Line"
    line2.data.materials.append(mat_nozzle)

    export_glb("combustion_chamber.glb")

# =============================================================================
# 5. VOLUMETRIC FLAME MORPHOLOGIES (0g, 0.16g, 1.0g)
# =============================================================================
def build_flame_models():
    # Model 1: 0.0g Spherical Blue Diffusion Flame (FLEX / BASS-II)
    reset_scene()
    print("[Blender 3D] Building 0.0g Microgravity Spherical Flame Model...")
    mat_blue_core = create_pbr_material("Flame_0g_Blue_Core", (0.0, 0.75, 1.0, 0.95), metallic=0.0, roughness=0.1, emission=(0.0, 0.85, 1.0, 1.0), emission_strength=5.0)
    mat_cool_flame = create_pbr_material("Flame_Cool_Mantle", (0.55, 0.15, 0.95, 0.35), metallic=0.0, roughness=0.2, emission=(0.6, 0.2, 0.95, 1.0), emission_strength=2.2)

    # Core inner blue sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.65, location=(0, 0, 0.3), segments=32, ring_count=24)
    core = bpy.context.active_object
    core.name = "Flame_0g_Diffusion_Shell"
    core.data.materials.append(mat_blue_core)

    # Outer cool flame mantle
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.95, location=(0, 0, 0.3), segments=32, ring_count=24)
    mantle = bpy.context.active_object
    mantle.name = "Flame_0g_Cool_Mantle"
    mantle.data.materials.append(mat_cool_flame)

    export_glb("flame_0g.glb")

    # Model 2: 0.16g Partial-G Elongated Flame Plume
    reset_scene()
    print("[Blender 3D] Building 0.16g Partial-Gravity Flame Model...")
    mat_partial_base = create_pbr_material("Flame_Lunar_Blue_Base", (0.0, 0.65, 1.0, 0.95), metallic=0.0, roughness=0.1, emission=(0.0, 0.75, 1.0, 1.0), emission_strength=4.5)
    mat_partial_plume = create_pbr_material("Flame_Lunar_Plume", (1.0, 0.55, 0.05, 0.85), metallic=0.0, roughness=0.15, emission=(1.0, 0.6, 0.1, 1.0), emission_strength=3.5)

    # Lower blue reaction anchor
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.45, location=(0, 0, 0.15), segments=24, ring_count=18)
    base = bpy.context.active_object
    base.name = "Flame_Lunar_Base_Anchor"
    base.scale = (1.0, 1.0, 0.7)
    base.data.materials.append(mat_partial_base)

    # Upward elongated cone plume
    bpy.ops.mesh.primitive_cone_add(radius1=0.45, radius2=0.08, depth=1.35, location=(0, 0, 0.8), vertices=24)
    plume = bpy.context.active_object
    plume.name = "Flame_Lunar_Elongated_Plume"
    plume.data.materials.append(mat_partial_plume)

    export_glb("flame_lunar.glb")

    # Model 3: 1.0g High-Aspect Flickering Teardrop Flame (Earth Baseline)
    reset_scene()
    print("[Blender 3D] Building 1.0g Terrestrial Flickering Teardrop Flame Model...")
    mat_1g_core = create_pbr_material("Flame_1g_Soot_Incandescent", (1.0, 0.88, 0.25, 1.0), metallic=0.0, roughness=0.1, emission=(1.0, 0.9, 0.3, 1.0), emission_strength=7.0)
    mat_1g_base = create_pbr_material("Flame_1g_Blue_Anchor", (0.0, 0.5, 1.0, 0.9), metallic=0.0, roughness=0.1, emission=(0.0, 0.6, 1.0, 1.0), emission_strength=4.0)

    # Blue base ring
    bpy.ops.mesh.primitive_cylinder_add(radius=0.28, depth=0.22, location=(0, 0, 0.08), vertices=20)
    b_ring = bpy.context.active_object
    b_ring.name = "Flame_1g_Base_Ring"
    b_ring.data.materials.append(mat_1g_base)

    # Tall buoyant teardrop plume
    bpy.ops.mesh.primitive_cone_add(radius1=0.35, radius2=0.02, depth=2.1, location=(0, 0, 1.15), vertices=24)
    b_cone = bpy.context.active_object
    b_cone.name = "Flame_1g_Buoyant_Teardrop"
    b_cone.data.materials.append(mat_1g_core)

    export_glb("flame_1g.glb")

def main():
    print("==================================================")
    print("   GODEYE // PYRO-SI — BLENDER 3D ASSET BUILDER   ")
    print("==================================================")
    build_iss_model()
    build_lunar_habitat()
    build_mars_habitat()
    build_combustion_chamber()
    build_flame_models()
    print("==================================================")
    print("   ALL 3D GLB ASSETS EXPORTED SUCCESSFULLY!      ")
    print("==================================================")

if __name__ == "__main__":
    main()
