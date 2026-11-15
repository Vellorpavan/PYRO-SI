/**
 * GODEYE // 3D Multi-Environment Orbital & Planetary Visualizer
 * Powered by Three.js WebGL & Blender 5.4 GLTF Assets
 * Authoritative 3D Engine for 4 Operational Spaceflight Environments:
 * 1. ISS & Earth Orbit   — NASA Blue Marble textured Earth globe, clouds, specular oceans, 51.6° Keplerian orbit & 3D ISS model
 * 2. Artemis Lunar Base  — Cratered regolith terrain, inflatable habitat dome, lunar rover, solar tower, comms dish, Earth in sky
 * 3. Mars Science Habitat— Red iron-oxide dunes, basalt rocks, geodesic dome, 6-wheel rocker-bogie rover, ECLSS annex, dusty sky fog
 * 4. EVA Spacewalk       — Detailed astronaut EMU spacesuit (gold visor, PLSS backpack, DCM), airlock hull, handrail, safety tether, Earth below
 */

let scene, camera, renderer, controls;
let earthOrbitGroup, lunarGroup, marsGroup, evaGroup;
let earthMesh, cloudsMesh, issModelGroup, issOrbitLine;
let marsBeaconLight, lunarEarthMesh, astronautGroup;
let activeEnvironment = 'ISS';
let clockTick = 0;
let animationFrameId = null;
let earthRotationSpeed = 0.0018;
let cameraTrackTarget = 'CENTER'; // 'CENTER' or 'TARGET'

export function initGodEyeGlobe() {
  const container = document.getElementById('godeye-globe-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 540;
  const height = container.clientHeight || 300;

  // Root Three.js Scene
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
  camera.position.set(0, 1.3, 4.8);
  camera.lookAt(0, 0, 0);

  // WebGL Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Clean container
  const existingCanvas = container.querySelector('canvas');
  if (existingCanvas) existingCanvas.remove();
  renderer.domElement.className = 'w-full h-full block';
  container.insertBefore(renderer.domElement, container.firstChild);

  // OrbitControls for true user interaction
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.8;
    controls.maxDistance = 18.0;
    controls.enablePan = false;
  }

  // Deep Space Starfield
  buildDeepSpaceStarfield();

  // Root Scene Groups for all 4 Environments
  earthOrbitGroup = new THREE.Group();
  lunarGroup = new THREE.Group();
  marsGroup = new THREE.Group();
  evaGroup = new THREE.Group();

  scene.add(earthOrbitGroup);
  scene.add(lunarGroup);
  scene.add(marsGroup);
  scene.add(evaGroup);

  // Build Environment 1: Realistic Earth + Orbiting 3D ISS
  buildRealisticEarthOrbit();

  // Build Environment 2: Artemis Lunar Base Camp (0.166g)
  buildLunarBaseEnvironment();

  // Build Environment 3: Mars Exploration Habitat (0.38g)
  buildMarsHabitatEnvironment();

  // Build Environment 4: Astronaut Extravehicular Spacewalk (µg)
  buildEVASpacewalkEnvironment();

  // Default to ISS Earth orbit
  switchEnvironment('ISS');

  // Window Resize Listener
  window.addEventListener('resize', handleGlobeResize);

  // Start Animation Loop
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animateGodEye3D();
}

/**
 * ============================================================================
 * ENVIRONMENT 1: EARTH & INTERNATIONAL SPACE STATION
 * ============================================================================
 */
function buildRealisticEarthOrbit() {
  const textureLoader = new THREE.TextureLoader();

  // Earth Sphere
  const earthGeom = new THREE.SphereGeometry(1.65, 64, 64);
  const dayTex = textureLoader.load('./assets/textures/earth_day.jpg');
  dayTex.encoding = THREE.sRGBEncoding;
  const specTex = textureLoader.load('./assets/textures/earth_spec.jpg');
  const cloudsTex = textureLoader.load('./assets/textures/earth_clouds.png');

  const earthMat = new THREE.MeshPhongMaterial({
    color: 0x1e40af,
    map: dayTex,
    specularMap: specTex,
    specular: new THREE.Color(0x60a5fa),
    shininess: 32,
    emissive: new THREE.Color(0x0c1e4a),
    emissiveIntensity: 0.25
  });

  earthMesh = new THREE.Mesh(earthGeom, earthMat);
  earthMesh.rotation.z = THREE.MathUtils.degToRad(23.5); // Earth axial tilt
  earthOrbitGroup.add(earthMesh);

  // Outer Atmospheric Cloud Layer
  const cloudGeom = new THREE.SphereGeometry(1.675, 48, 48);
  const cloudMat = new THREE.MeshPhongMaterial({
    map: cloudsTex,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });
  cloudsMesh = new THREE.Mesh(cloudGeom, cloudMat);
  earthOrbitGroup.add(cloudsMesh);

  // Atmospheric Fresnel Glow Halo
  const haloGeom = new THREE.SphereGeometry(1.78, 36, 36);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  });
  earthOrbitGroup.add(new THREE.Mesh(haloGeom, haloMat));

  // Keplerian ISS Orbit Trajectory Ring (51.6° inclination)
  const orbitCurve = new THREE.EllipseCurve(0, 0, 2.15, 2.15, 0, 2 * Math.PI, false, 0);
  const orbitPts = orbitCurve.getPoints(120).map(p => new THREE.Vector3(p.x, p.y, 0));
  const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPts);
  const orbitMat = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.85, linewidth: 2 });
  issOrbitLine = new THREE.Line(orbitGeom, orbitMat);
  issOrbitLine.rotation.x = THREE.MathUtils.degToRad(51.6);
  issOrbitLine.rotation.y = THREE.MathUtils.degToRad(25.0);
  earthOrbitGroup.add(issOrbitLine);

  // ISS Model Mounting Group
  issModelGroup = new THREE.Group();
  earthOrbitGroup.add(issModelGroup);

  // Ambient & Sun Lighting for Earth
  const amb = new THREE.AmbientLight(0xffffff, 0.7);
  earthOrbitGroup.add(amb);

  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(6, 3, 5);
  earthOrbitGroup.add(sun);

  // Load Real 3D ISS Station GLB Model from Blender
  loadISSModel();
}

function loadISSModel() {
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const loader = new THREE.GLTFLoader();
    loader.load(
      './assets/models/iss_station.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.045, 0.045, 0.045);
        issModelGroup.add(model);
        console.log('[3D Engine] Loaded Blender iss_station.glb successfully');
      },
      undefined,
      () => createProceduralISSFallback()
    );
  } else {
    createProceduralISSFallback();
  }
}

function createProceduralISSFallback() {
  const truss = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.035, 0.035),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
  );
  issModelGroup.add(truss);

  const mod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.28, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.3 })
  );
  mod.rotation.x = Math.PI / 2;
  issModelGroup.add(mod);

  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
  for (let s of [-0.22, 0.22]) {
    const saw = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.005), solarMat);
    saw.position.set(s, 0, 0);
    issModelGroup.add(saw);
  }
}

/**
 * ============================================================================
 * ENVIRONMENT 2: ARTEMIS LUNAR BASE CAMP (0.166g)
 * ============================================================================
 */
function buildLunarBaseEnvironment() {
  // Harsh Lunar Direct Sunlight (High Contrast, Deep Shadows)
  const lunarSun = new THREE.DirectionalLight(0xffffff, 3.0);
  lunarSun.position.set(8, 5, 6);
  lunarGroup.add(lunarSun);

  const lunarEarthshine = new THREE.DirectionalLight(0x38bdf8, 0.35);
  lunarEarthshine.position.set(-6, 2, -4);
  lunarGroup.add(lunarEarthshine);

  const lunarAmb = new THREE.AmbientLight(0x1e293b, 0.25);
  lunarGroup.add(lunarAmb);

  // Earth Visible Hanging in the Black Lunar Sky
  const earthInMoonSkyGeom = new THREE.SphereGeometry(0.75, 32, 32);
  const textureLoader = new THREE.TextureLoader();
  const moonSkyEarthTex = textureLoader.load('./assets/textures/earth_day.jpg');
  moonSkyEarthTex.encoding = THREE.sRGBEncoding;

  const earthInMoonSkyMat = new THREE.MeshPhongMaterial({
    color: 0x1d4ed8,
    map: moonSkyEarthTex,
    specular: new THREE.Color(0x38bdf8),
    shininess: 30
  });
  lunarEarthMesh = new THREE.Mesh(earthInMoonSkyGeom, earthInMoonSkyMat);
  lunarEarthMesh.position.set(5.2, 3.8, -5.5);
  lunarGroup.add(lunarEarthMesh);

  // Load Blender 5.4 Lunar Base Model (Habitat Dome, Craters, Lunar Rover, Solar Tower)
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const loader = new THREE.GLTFLoader();
    loader.load(
      './assets/models/lunar_habitat.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.32, 0.32, 0.32);
        model.position.set(0, -0.65, 0);
        lunarGroup.add(model);
        console.log('[3D Engine] Loaded Blender lunar_habitat.glb successfully');
      },
      undefined,
      () => createProceduralLunarFallback()
    );
  } else {
    createProceduralLunarFallback();
  }
}

function createProceduralLunarFallback() {
  // Cratered Regolith Terrain
  const terrain = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.95, metalness: 0.05 })
  );
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.6;
  lunarGroup.add(terrain);

  // Habitat Dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.1 })
  );
  dome.position.set(0, -0.6, 0);
  lunarGroup.add(dome);

  // Solar Tower
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
  mast.position.set(-2.2, 0.6, -1.5);
  lunarGroup.add(mast);
}

/**
 * ============================================================================
 * ENVIRONMENT 3: MARS EXPLORATION HABITAT (0.38g)
 * ============================================================================
 */
function buildMarsHabitatEnvironment() {
  // Warm Martian Sunlight & Atmospheric Scatter
  const marsSun = new THREE.DirectionalLight(0xffedd5, 2.5);
  marsSun.position.set(7, 5, 5);
  marsGroup.add(marsSun);

  const marsSkyAmb = new THREE.AmbientLight(0x7c2d12, 0.55);
  marsGroup.add(marsSkyAmb);

  // Pulsing Emergency Navigation Beacon
  const beaconGeom = new THREE.SphereGeometry(0.12, 16, 16);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  marsBeaconLight = new THREE.Mesh(beaconGeom, beaconMat);
  marsBeaconLight.position.set(-1.4, 1.4, 1.2);
  marsGroup.add(marsBeaconLight);

  // Load Blender 5.4 Mars Habitat Model (Geodesic Dome, Iron Dunes, Basalt Rocks, Mars Rover)
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const loader = new THREE.GLTFLoader();
    loader.load(
      './assets/models/mars_habitat.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.32, 0.32, 0.32);
        model.position.set(0, -0.65, 0);
        marsGroup.add(model);
        console.log('[3D Engine] Loaded Blender mars_habitat.glb successfully');
      },
      undefined,
      () => createProceduralMarsFallback()
    );
  } else {
    createProceduralMarsFallback();
  }
}

function createProceduralMarsFallback() {
  // Red Dunes Terrain
  const terrain = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.9, metalness: 0.05 })
  );
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.6;
  marsGroup.add(terrain);

  // Geodesic Dome
  const dome = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.4, 2),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.2 })
  );
  dome.position.set(0, -0.1, 0);
  marsGroup.add(dome);
}

/**
 * ============================================================================
 * ENVIRONMENT 4: EXTRAVEHICULAR ACTIVITY (EVA) SPACEWALK (µg)
 * ============================================================================
 */
function buildEVASpacewalkEnvironment() {
  // Harsh Space Sunlight & Blue Earthshine from below
  const evaSun = new THREE.DirectionalLight(0xffffff, 2.8);
  evaSun.position.set(6, 4, 5);
  evaGroup.add(evaSun);

  const earthAlbedo = new THREE.DirectionalLight(0x0284c7, 1.2);
  earthAlbedo.position.set(0, -5, 2);
  evaGroup.add(earthAlbedo);

  const evaAmb = new THREE.AmbientLight(0xffffff, 0.5);
  evaGroup.add(evaAmb);

  // Blue Marble Earth Visible in Orbit Below
  const earthBelowGeom = new THREE.SphereGeometry(3.5, 48, 48);
  const textureLoader = new THREE.TextureLoader();
  const earthBelowTex = textureLoader.load('./assets/textures/earth_day.jpg');
  earthBelowTex.encoding = THREE.sRGBEncoding;

  const earthBelowMat = new THREE.MeshPhongMaterial({
    color: 0x1d4ed8,
    map: earthBelowTex,
    specular: new THREE.Color(0x38bdf8),
    shininess: 25
  });
  const earthBelowMesh = new THREE.Mesh(earthBelowGeom, earthBelowMat);
  earthBelowMesh.position.set(0, -5.2, -1.5);
  evaGroup.add(earthBelowMesh);

  // Astronaut Mounting Group
  astronautGroup = new THREE.Group();
  evaGroup.add(astronautGroup);

  // Load Blender 5.4 Astronaut EVA Model (EMU spacesuit, gold visor, PLSS, airlock, tether)
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const loader = new THREE.GLTFLoader();
    loader.load(
      './assets/models/astronaut_eva.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.75, 0.75, 0.75);
        model.position.set(0, -0.2, 0);
        astronautGroup.add(model);
        console.log('[3D Engine] Loaded Blender astronaut_eva.glb successfully');
      },
      undefined,
      () => createProceduralEVAFallback()
    );
  } else {
    createProceduralEVAFallback();
  }
}

function createProceduralEVAFallback() {
  // Helmet with Gold Visor
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
  );
  helmet.position.set(0, 0.7, 0);
  astronautGroup.add(helmet);

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.05 })
  );
  visor.position.set(0, 0.7, 0.12);
  visor.scale.set(0.9, 0.7, 0.8);
  astronautGroup.add(visor);

  // Torso & PLSS Backpack
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.75, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
  );
  torso.position.set(0, 0.15, 0);
  astronautGroup.add(torso);

  const plss = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.85, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.3 })
  );
  plss.position.set(0, 0.2, -0.32);
  astronautGroup.add(plss);
}

function buildDeepSpaceStarfield() {
  const starsGeom = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 750; i++) {
    const x = (Math.random() - 0.5) * 80;
    const y = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 80;
    starPositions.push(x, y, z);
  }
  starsGeom.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.055, transparent: true, opacity: 0.85 });
  scene.add(new THREE.Points(starsGeom, starsMat));
}

/**
 * ============================================================================
 * UNIFIED ENVIRONMENT STATE SWITCHER
 * ============================================================================
 */
export function switchEnvironment(envKey) {
  activeEnvironment = envKey;

  // 1. Isolate Visibility: strictly ensure ONLY the active scene group is visible
  if (earthOrbitGroup) earthOrbitGroup.visible = (envKey === 'ISS');
  if (lunarGroup) lunarGroup.visible = (envKey === 'MOON');
  if (marsGroup) marsGroup.visible = (envKey === 'MARS');
  if (evaGroup) evaGroup.visible = (envKey === 'SUIT' || envKey === 'EVA');

  // 2. Adjust Camera & Scene Atmosphere Fog
  if (!camera) return;

  if (envKey === 'ISS') {
    scene.fog = null;
    camera.position.set(0, 1.3, 4.8);
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.minDistance = 2.0;
      controls.maxDistance = 14.0;
    }
  } else if (envKey === 'MOON') {
    scene.fog = null; // Vacuum, no atmospheric haze
    camera.position.set(0, 1.6, 5.0);
    if (controls) {
      controls.target.set(0, 0.3, 0);
      controls.minDistance = 2.0;
      controls.maxDistance = 12.0;
    }
  } else if (envKey === 'MARS') {
    // Dusty Salmon/Butterscotch Martian Atmosphere Fog
    scene.fog = new THREE.FogExp2(0x9a3412, 0.045);
    camera.position.set(0, 1.8, 5.2);
    if (controls) {
      controls.target.set(0, 0.4, 0);
      controls.minDistance = 2.0;
      controls.maxDistance = 12.0;
    }
  } else if (envKey === 'SUIT' || envKey === 'EVA') {
    scene.fog = null; // LEO Vacuum
    camera.position.set(0, 0.5, 3.2);
    if (controls) {
      controls.target.set(0, 0.4, 0);
      controls.minDistance = 1.4;
      controls.maxDistance = 8.0;
    }
  }

  if (controls) controls.update();

  // 3. Immediately Synchronize Telemetry Display
  updateEnvironmentTelemetry(0);
}

/**
 * Updates telemetry readouts and coordinate strings per active celestial body
 */
function updateEnvironmentTelemetry(speed) {
  const envTitle = document.getElementById('hud-env-title');
  const altVal = document.getElementById('hud-alt-val');
  const velVal = document.getElementById('hud-vel-val');
  const coordVal = document.getElementById('hud-coord-val');

  if (activeEnvironment === 'ISS') {
    if (envTitle) envTitle.textContent = 'ISS (Current Orbit)';
    if (altVal) altVal.textContent = 'Alt: 408.4 km | Inc: 51.6°';
    if (velVal) velVal.textContent = 'Vel: 7.66 km/s (Orbital)';

    const lat = (Math.sin(speed) * 51.6).toFixed(2);
    const lon = (((speed * 180 / Math.PI) % 360) - 180).toFixed(2);
    const latStr = `${Math.abs(lat)}° ${lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(lon)}° ${lon >= 0 ? 'E' : 'W'}`;
    if (coordVal) coordVal.textContent = `${latStr}, ${lonStr} (WGS84 Sub-Sat Track)`;

  } else if (activeEnvironment === 'MOON') {
    if (envTitle) envTitle.textContent = 'Artemis Base Camp (Moon)';
    if (altVal) altVal.textContent = 'Elev: +1,240 m (Peak of Eternal Light)';
    if (velVal) velVal.textContent = 'Grav: 0.166g (1.62 m/s²)';
    if (coordVal) coordVal.textContent = '89.90° S, 0.00° E (IAU Selenographic)';

  } else if (activeEnvironment === 'MARS') {
    if (envTitle) envTitle.textContent = 'Jezero Outpost (Mars)';
    if (altVal) altVal.textContent = 'Atm: 0.09 psi (610 Pa CO₂)';
    if (velVal) velVal.textContent = 'Grav: 0.380g (3.72 m/s²)';
    if (coordVal) coordVal.textContent = '18.38° N, 77.58° E (IAU Areocentric)';

  } else if (activeEnvironment === 'SUIT' || activeEnvironment === 'EVA') {
    if (envTitle) envTitle.textContent = 'EVA Spacewalk (Quest Airlock)';
    if (altVal) altVal.textContent = 'Suit: 100% O₂ at 4.3 psi (29.6 kPa)';
    if (velVal) velVal.textContent = 'Grav: 0.00001g (Freefall µg)';
    if (coordVal) coordVal.textContent = 'Rel: X+1.2m, Y-0.8m (LVLH Frame)';
  }
}

export function resetGlobeCamera() {
  switchEnvironment(activeEnvironment);
}

export function setCameraPerspective(mode) {
  if (!camera || !controls) return;
  if (mode === 'close') {
    if (activeEnvironment === 'ISS') {
      camera.position.set(0, 0.7, 2.5);
      controls.target.set(0, 0, 0);
    } else if (activeEnvironment === 'MOON') {
      camera.position.set(0, 0.8, 2.8);
      controls.target.set(0, 0.2, 0);
    } else if (activeEnvironment === 'MARS') {
      camera.position.set(0, 0.9, 2.9);
      controls.target.set(0, 0.25, 0);
    } else if (activeEnvironment === 'SUIT' || activeEnvironment === 'EVA') {
      camera.position.set(0, 0.35, 1.7);
      controls.target.set(0, 0.3, 0);
    }
  } else {
    resetGlobeCamera();
  }
  controls.update();
}

if (typeof window !== 'undefined') {
  window.switchGodEyeEnvironment = switchEnvironment;
  window.switchEnvironment = switchEnvironment;
  window.setEarthRotationSpeed = setEarthRotationSpeed;
  window.resetGlobeCamera = resetGlobeCamera;
  window.setCameraPerspective = setCameraPerspective;
}

export function handleGlobeResize() {
  const container = document.getElementById('godeye-globe-container');
  if (!container || !renderer || !camera) return;
  const width = container.clientWidth || 540;
  const height = container.clientHeight || 300;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

export function setEarthRotationSpeed(speedMultiplier) {
  earthRotationSpeed = 0.0018 * speedMultiplier;
}

/**
 * 60 FPS Animation Loop
 */
function animateGodEye3D() {
  animationFrameId = requestAnimationFrame(animateGodEye3D);
  clockTick += 0.015;

  if (controls) controls.update();

  // 1. Earth & ISS Dynamic Motion (Independent planet rotation vs Keplerian orbit)
  if (earthOrbitGroup && earthOrbitGroup.visible) {
    if (earthMesh) {
      earthMesh.rotation.y += earthRotationSpeed;
    }
    if (cloudsMesh) {
      cloudsMesh.rotation.y += earthRotationSpeed * 1.35;
    }

    if (issModelGroup && issOrbitLine) {
      const orbitRadius = 2.15;
      const speed = clockTick * 0.45;
      const ox = Math.cos(speed) * orbitRadius;
      const oy = Math.sin(speed) * orbitRadius;
      
      const pos = new THREE.Vector3(ox, oy, 0);
      pos.applyEuler(issOrbitLine.rotation);
      issModelGroup.position.copy(pos);
      
      issModelGroup.rotation.y = clockTick * 0.2;
      issModelGroup.rotation.z = Math.sin(clockTick * 0.1) * 0.2;

      // Update Keplerian sub-satellite telemetry
      updateEnvironmentTelemetry(speed);
    }
  }

  // 2. Moon Dynamics: Earth in the lunar sky rotates slowly
  if (lunarGroup && lunarGroup.visible) {
    if (lunarEarthMesh) {
      lunarEarthMesh.rotation.y += 0.002;
    }
  }

  // 3. Mars Dynamics: Emergency navigation beacon pulses
  if (marsGroup && marsGroup.visible) {
    if (marsBeaconLight) {
      const pulse = 0.5 + Math.sin(clockTick * 5.0) * 0.5;
      marsBeaconLight.scale.set(1.0 + pulse * 0.4, 1.0 + pulse * 0.4, 1.0 + pulse * 0.4);
    }
  }

  // 4. EVA Dynamics: Astronaut gently floats and sways on safety tether
  if (evaGroup && evaGroup.visible) {
    if (astronautGroup) {
      astronautGroup.position.y = Math.sin(clockTick * 0.8) * 0.05;
      astronautGroup.rotation.z = Math.sin(clockTick * 0.5) * 0.04;
      astronautGroup.rotation.y = Math.cos(clockTick * 0.4) * 0.05;
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

export const animateGodEyeGlobe = () => {
  // Loop is self-driven inside initGodEyeGlobe via animateGodEye3D()
};
