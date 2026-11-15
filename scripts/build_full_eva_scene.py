#!/usr/bin/env python3
"""
Full EVA Scene Builder for GODEYE // PYRO-SI
Integrates official NASA EMU Astronaut with detailed ISS exterior,
Quest Airlock, translation handrails, truss backbone, and solar arrays.
"""

import bpy
import math
from mathutils import Vector, Euler

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    coll = bpy.data.collections.new("EVA_Scene")
    bpy.context.scene.collection.children.link(coll)
    return coll

def create_pbr_material(name, base_color, metallic=0.0, roughness=0.5, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()

    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_out.location = (300, 0)
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.location = (0, 0)

    node_bsdf.inputs['Base Color'].default_value = base_color
    node_bsdf.inputs['Metallic'].default_value = metallic
    node_bsdf.inputs['Roughness'].default_value = roughness

    if emission:
        node_bsdf.inputs['Emission Color'].default_value = emission
        node_bsdf.inputs['Emission Strength'].default_value = emission_strength

    mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

def build_scene():
    coll = reset_scene()

    print("[EVA Builder] Loading NASA EMU Astronaut...")
    bpy.ops.import_scene.gltf(filepath='/tmp/nasa_astronaut.glb')

    # Materials
    mat_gold_visor = create_pbr_material("EVA_Gold_Visor", (0.96, 0.78, 0.16, 1.0), metallic=1.0, roughness=0.03)
    mat_orthofabric = create_pbr_material("EVA_Orthofabric_White", (0.95, 0.95, 0.97, 1.0), metallic=0.06, roughness=0.45)
    mat_handrail = create_pbr_material("ISS_EVA_Handrail_Yellow", (0.98, 0.82, 0.08, 1.0), metallic=0.88, roughness=0.18, emission=(0.5, 0.4, 0.0, 1.0), emission_strength=1.2)
    mat_tether = create_pbr_material("Safety_Tether_Red", (0.90, 0.12, 0.10, 1.0), metallic=0.15, roughness=0.5)
    mat_iss_mmod = create_pbr_material("ISS_MMOD_Shielding", (0.92, 0.93, 0.95, 1.0), metallic=0.55, roughness=0.35)
    mat_iss_aluminum = create_pbr_material("ISS_Aerospace_Aluminum", (0.85, 0.88, 0.90, 1.0), metallic=0.85, roughness=0.25)
    mat_gold_mli = create_pbr_material("ISS_Gold_MLI_Foil", (0.95, 0.75, 0.15, 1.0), metallic=0.95, roughness=0.1)
    mat_solar_cells = create_pbr_material("ISS_Solar_Array_Photovoltaic", (0.04, 0.18, 0.42, 1.0), metallic=0.92, roughness=0.15)
    mat_radiator = create_pbr_material("ISS_Thermal_Radiator_White", (0.96, 0.96, 0.98, 1.0), metallic=0.2, roughness=0.4)
    mat_lights = create_pbr_material("Helmet_Floodlights", (1.0, 1.0, 1.0, 1.0), metallic=0.0, roughness=0.1, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=8.0)

    # 1. Configure Astronaut
    ast_obj = bpy.data.objects.get('astronaut1')
    if ast_obj:
        # Unparent from <3DSRoot> and preserve world transform
        mat_world = ast_obj.matrix_world.copy()
        ast_obj.parent = None
        ast_obj.matrix_world = mat_world
        
        root_obj = bpy.data.objects.get('<3DSRoot>')
        if root_obj:
            bpy.data.objects.remove(root_obj)

        ast_obj.name = "NASA_EMU_Astronaut"
        # Scale from inches to metric meters
        ast_obj.scale = (0.0254, 0.0254, 0.0254)
        
        # Position floating directly outside the Quest Airlock hatch & handrail
        ast_obj.location = (0.15, 0.35, -0.35)
        ast_obj.rotation_euler = (math.radians(10), math.radians(-8), math.radians(15))

        # Apply scale so vertex coordinates are in real-world meters
        bpy.ops.object.select_all(action='DESELECT')
        ast_obj.select_set(True)
        bpy.context.view_layer.objects.active = ast_obj
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

        # Update materials (Slot 0: Orthofabric suit, Slot 1: Gold reflective visor)
        if len(ast_obj.material_slots) >= 2:
            ast_obj.material_slots[0].material = mat_orthofabric
            ast_obj.material_slots[1].material = mat_gold_visor

    # 2. Build ISS Exterior (Quest Airlock + US Lab + Truss + Solar Arrays)
    iss_group = bpy.data.objects.new("ISS_Station_Exterior", None)
    bpy.context.scene.collection.objects.link(iss_group)

    # A. Quest Joint Airlock (Crew Lock + Equipment Lock)
    # Crew Lock cylinder
    bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=2.4, location=(-1.8, 1.6, 0.0), rotation=(0, math.pi/2, 0))
    crew_lock = bpy.context.active_object
    crew_lock.name = "Quest_Crew_Lock"
    crew_lock.data.materials.append(mat_iss_mmod)
    crew_lock.parent = iss_group

    # Equipment Lock cylinder (wider diameter)
    bpy.ops.mesh.primitive_cylinder_add(radius=1.65, depth=3.2, location=(-4.4, 1.6, 0.0), rotation=(0, math.pi/2, 0))
    eq_lock = bpy.context.active_object
    eq_lock.name = "Quest_Equipment_Lock"
    eq_lock.data.materials.append(mat_iss_mmod)
    eq_lock.parent = iss_group

    # EVA Hatch Outer Ring & Hatch Door
    bpy.ops.mesh.primitive_cylinder_add(radius=0.65, depth=0.15, location=(-0.55, 1.6, 0.0), rotation=(0, math.pi/2, 0))
    hatch_ring = bpy.context.active_object
    hatch_ring.name = "Quest_Hatch_Ring"
    hatch_ring.data.materials.append(mat_iss_aluminum)
    hatch_ring.parent = iss_group

    bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=0.08, location=(-0.5, 1.6, 0.0), rotation=(0, math.pi/2, 0))
    hatch_door = bpy.context.active_object
    hatch_door.name = "Quest_EVA_Hatch_Door"
    hatch_door.data.materials.append(mat_gold_mli)
    hatch_door.parent = iss_group

    # B. Yellow Translation Handrails & Standoffs
    handrail_coords = [
        (-0.7, 0.7, 0.6),
        (-0.7, 1.6, 0.95),
        (-0.7, 2.5, 0.6),
        (-1.5, 0.7, 0.95),
        (-2.4, 0.7, 0.95),
        (-1.5, 2.5, 0.95),
    ]
    for i, hc in enumerate(handrail_coords):
        # Yellow handrail bar
        bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=0.9, location=hc, rotation=(math.pi/2, 0, 0))
        rail = bpy.context.active_object
        rail.name = f"EVA_Translation_Handrail_{i+1}"
        rail.data.materials.append(mat_handrail)
        rail.parent = iss_group

        # Standoff brackets
        for s_off in [-0.38, 0.38]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.015, depth=0.12, location=(hc[0], hc[1] + s_off, hc[2] - 0.06), rotation=(0, 0, 0))
            so = bpy.context.active_object
            so.name = f"Handrail_Standoff_{i+1}_{s_off}"
            so.data.materials.append(mat_iss_aluminum)
            so.parent = iss_group

    # C. Portable Foot Restraint (PFR) Work Platform
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.85, 0.8, -0.6), scale=(0.5, 0.5, 0.08))
    pfr = bpy.context.active_object
    pfr.name = "EVA_Portable_Foot_Restraint_Socket"
    pfr.data.materials.append(mat_iss_aluminum)
    pfr.parent = iss_group

    # D. Safety Tether (Curved Red Cable from Astronaut to Handrail)
    # Create multi-segment spline/cylinder cable
    tether_points = [
        Vector((-0.1, 0.1, -0.1)),
        Vector((-0.3, 0.4, 0.1)),
        Vector((-0.5, 0.55, 0.35)),
        Vector((-0.7, 0.7, 0.6))
    ]
    for j in range(len(tether_points) - 1):
        p1 = tether_points[j]
        p2 = tether_points[j+1]
        mid = (p1 + p2) * 0.5
        delta = p2 - p1
        dist = delta.length
        phi = math.atan2(delta.y, delta.x)
        theta = math.acos(max(-1.0, min(1.0, delta.z / dist))) if dist > 0 else 0

        bpy.ops.mesh.primitive_cylinder_add(radius=0.015, depth=dist, location=mid, rotation=(0, theta, phi))
        seg = bpy.context.active_object
        seg.name = f"Safety_Tether_Segment_{j+1}"
        seg.data.materials.append(mat_tether)

    # E. Connected Pressurized Module: US Destiny Laboratory (extends in background)
    bpy.ops.mesh.primitive_cylinder_add(radius=2.2, depth=8.5, location=(-4.5, 4.8, 0.0), rotation=(math.pi/2, 0, 0))
    us_lab = bpy.context.active_object
    us_lab.name = "US_Destiny_Lab_Module"
    us_lab.data.materials.append(mat_iss_mmod)
    us_lab.parent = iss_group

    # Endcones on module
    for y_cone, z_rot in [(0.5, 0), (9.1, math.pi)]:
        bpy.ops.mesh.primitive_cone_add(radius1=2.2, radius2=1.4, depth=0.8, location=(-4.5, y_cone, 0.0), rotation=(math.pi/2, 0, z_rot))
        cone = bpy.context.active_object
        cone.name = f"Destiny_Endcone_{y_cone}"
        cone.data.materials.append(mat_iss_aluminum)
        cone.parent = iss_group

    # F. Integrated Truss Structure (S0 / P1 Backbone)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-4.5, 4.8, 3.2), scale=(18.0, 1.2, 1.2))
    truss = bpy.context.active_object
    truss.name = "Integrated_Truss_Structure"
    truss.data.materials.append(mat_iss_aluminum)
    truss.parent = iss_group

    # Truss Cross-Braces (Lattice effect)
    for tx in [-10, -7, -4, -1, 2, 5]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=2.8, location=(tx, 4.8, 3.2), rotation=(0, math.pi/4, 0))
        tb = bpy.context.active_object
        tb.name = f"Truss_Brace_{tx}"
        tb.data.materials.append(mat_iss_aluminum)
        tb.parent = iss_group

    # G. Photovoltaic Solar Array Wings (SAW) in the distance
    for saw_x in [-11.5, -9.5, 7.5, 9.5]:
        for saw_y in [-2.0, 7.5]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(saw_x, saw_y, 3.2), scale=(1.4, 6.5, 0.06))
            saw = bpy.context.active_object
            saw.name = f"Solar_Array_Wing_{saw_x}_{saw_y}"
            saw.data.materials.append(mat_solar_cells)
            saw.parent = iss_group

    # H. Thermal Heat Rejection Radiators
    for rad_x in [-2.5, 3.5]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(rad_x, 4.8, 5.2), scale=(0.12, 3.8, 2.6))
        rad = bpy.context.active_object
        rad.name = f"Thermal_Radiator_{rad_x}"
        rad.data.materials.append(mat_radiator)
        rad.parent = iss_group

    # 3. Export to GLB (Standard GLTF 2.0 without Draco compression for universal browser loading)
    out_paths = [
        "/Users/pavan/Desktop/PYRO-SI/assets/models/astronaut_eva.glb",
        "/Users/pavan/Desktop/PYRO-SI/public/assets/models/astronaut_eva.glb"
    ]
    for p in out_paths:
        bpy.ops.export_scene.gltf(
            filepath=p,
            export_format='GLB',
            use_selection=False,
            export_apply=True
        )
        print(f"[EVA Builder] Exported high-fidelity EVA model -> {p}")

    # 4. Render Studio Verification Image
    cam_data = bpy.data.cameras.new('Camera')
    cam = bpy.data.objects.new('Camera', cam_data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    # Camera looking at astronaut with ISS exterior in background
    cam.location = (2.4, -3.2, 1.2)
    cam.rotation_euler = (math.radians(72), math.radians(0), math.radians(35))

    # Space Sunlight
    sun_data = bpy.data.lights.new('Space_Sun', type='SUN')
    sun_data.energy = 5.0
    sun_data.color = (1.0, 0.98, 0.95)
    sun = bpy.data.objects.new('Space_Sun', sun_data)
    sun.location = (5.0, -8.0, 6.0)
    sun.rotation_euler = (math.radians(45), math.radians(20), math.radians(-30))
    bpy.context.scene.collection.objects.link(sun)

    # Earthshine Fill
    earthshine_data = bpy.data.lights.new('Earthshine', type='SUN')
    earthshine_data.energy = 1.2
    earthshine_data.color = (0.2, 0.5, 0.9)
    earthshine = bpy.data.objects.new('Earthshine', earthshine_data)
    earthshine.location = (0.0, 0.0, -5.0)
    earthshine.rotation_euler = (math.radians(-90), 0, 0)
    bpy.context.scene.collection.objects.link(earthshine)

    bpy.context.scene.render.resolution_x = 1200
    bpy.context.scene.render.resolution_y = 900
    bpy.context.scene.render.filepath = '/tmp/eva_preview_full.png'
    bpy.ops.render.render(write_still=True)
    print("[EVA Builder] Verification render saved -> /tmp/eva_preview_full.png")

if __name__ == "__main__":
    build_scene()
