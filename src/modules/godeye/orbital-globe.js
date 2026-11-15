/**
 * GODEYE // 3D Orbital & Extraterrestrial Environments Visualizer
 * Real 3D Interactive WebGL Engine powered by Three.js & Blender 5.4 GLTF Assets
 * Features:
 * 1. Realistic Earth Globe with NASA Blue Marble Day map, Specular oceans & Cloud layer
 * 2. Real 3D ISS Station Model (iss_station.glb) orbiting along 51.6° Keplerian path
 * 3. 3D Lunar Base Camp Scene (lunar_habitat.glb) with cratered regolith & habitat dome
 * 4. 3D Mars Exploration Habitat Scene (mars_habitat.glb) with red dunes & geodesic dome
 * 5. Full OrbitControls (Rotate, Zoom, Pan) & Habitat Switcher
 */

let scene, camera, renderer, controls;
let earthOrbitGroup, lunarGroup, marsGroup;
let earthMesh, cloudsMesh, issModelGroup;
let issOrbitLine;
let activeEnvironment = 'ISS';
let clockTick = 0;
let animationFrameId = null;

export function initGodEyeGlobe() {
  const container = document.getElementById('godeye-globe-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 540;
  const height = container.clientHeight || 300;

  // Scene & Camera Setup
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060913, 0.035);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1.2, 4.8);
  camera.lookAt(0, 0, 0);

  // High-performance WebGL Renderer
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
    controls.minDistance = 2.0;
    controls.maxDistance = 18.0;
    controls.enablePan = false;
  }

  // Lighting Rig
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
  sunLight.position.set(8, 4, 6);
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0x7c3aed, 1.1);
  rimLight.position.set(-6, -2, -4);
  scene.add(rimLight);

  // Background Starfield
  buildDeepSpaceStarfield();

  // Root Scene Groups for Environments
  earthOrbitGroup = new THREE.Group();
  lunarGroup = new THREE.Group();
  marsGroup = new THREE.Group();

  scene.add(earthOrbitGroup);
  scene.add(lunarGroup);
  scene.add(marsGroup);

  lunarGroup.visible = false;
  marsGroup.visible = false;

  // Build Environment 1: Realistic Earth + Orbiting 3D ISS
  buildRealisticEarthOrbit();

  // Build Environment 2: 3D Lunar Base Camp (from GLB or procedural fallback)
  loadLunarHabitatEnvironment();

  // Build Environment 3: 3D Mars Exploration Habitat (from GLB or procedural fallback)
  loadMarsHabitatEnvironment();

  // Window Resize Listener
  window.addEventListener('resize', handleGlobeResize);

  // Start Animation Loop
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animateGodEye3D();
}

/**
 * Builds realistic Earth with NASA Blue Marble, Specular map, Clouds & Atmosphere
 */
function buildRealisticEarthOrbit() {
  const textureLoader = new THREE.TextureLoader();

  // Earth Sphere
  const earthGeom = new THREE.SphereGeometry(1.65, 64, 64);
  
  // Try loading local textures, fall back cleanly if needed
  const dayTex = textureLoader.load('./assets/textures/earth_day.jpg');
  dayTex.encoding = THREE.sRGBEncoding;
  const specTex = textureLoader.load('./assets/textures/earth_spec.jpg');
  const cloudsTex = textureLoader.load('./assets/textures/earth_clouds.png');

  const earthMat = new THREE.MeshPhongMaterial({
    color: 0x1e40af,
    map: dayTex,
    specularMap: specTex,
    specular: new THREE.Color(0x60a5fa),
    shininess: 30,
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

  // Load Real 3D ISS Station GLTF Model
  loadISSModel();
}

/**
 * Loads the 3D ISS model created in Blender
 */
function loadISSModel() {
  if (typeof THREE.GLTFLoader === 'undefined') {
    createProceduralISSFallback();
    return;
  }

  const loader = new THREE.GLTFLoader();
  loader.load(
    './assets/models/iss_station.glb',
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.045, 0.045, 0.045);
      issModelGroup.add(model);
      console.log('[3D Engine] ISS 3D Model loaded successfully from Blender export');
    },
    undefined,
    (err) => {
      console.warn('[3D Engine] Loading iss_station.glb fallback to procedural ISS model:', err);
      createProceduralISSFallback();
    }
  );
}

/**
 * Procedural fallback for ISS in case GLB file fails to load
 */
function createProceduralISSFallback() {
  const issTruss = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.04, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 })
  );
  issModelGroup.add(issTruss);

  const moduleDestiny = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12),
    new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.4, roughness: 0.3 })
  );
  moduleDestiny.rotation.z = Math.PI / 2;
  issModelGroup.add(moduleDestiny);

  // Solar Arrays
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0a2558, metalness: 0.8, roughness: 0.2, emissive: 0x061838 });
  for (let sx of [-0.35, -0.22, 0.22, 0.35]) {
    const wingU = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.01), solarMat);
    wingU.position.set(sx, 0.2, 0);
    issModelGroup.add(wingU);
    const wingD = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.01), solarMat);
    wingD.position.set(sx, -0.2, 0);
    issModelGroup.add(wingD);
  }
}

/**
 * Loads the 3D Lunar Base Camp scene
 */
function loadLunarHabitatEnvironment() {
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const loader = new THREE.GLTFLoader();
    loader.load(
      './assets/models/lunar_habitat.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.35, 0.35, 0.35);
        model.position.set(0, -0.6, 0);
        lunarGroup.add(model);
        console.log('[3D Engine] Lunar Base Camp 3D Model loaded successfully');
      },
      undefined,
      () => createProceduralLunarFallback()
    );
  } else {
    createProceduralLunarFallback();
  }

  // Add distant Earth rising in the black lunar sky
  const earthInMoonSky = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0x1d4ed8, emissive: 0x0f172a, specular: 0x38bdf8 })
  );
  earthInMoonSky.position.set(4.5, 3.2, -4.0);
  lunarGroup.add(earthInMoonSky);
}

function createProceduralLunarFallback() {
  // Lunar Terrain
  const terrain = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x555558, roughness: 0.95 })
  );
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.5;
  lunarGroup.add(terrain);

  // Inflatable Dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.35, metalness: 0.1 })
  );
  dome.position.set(0, -0.5, 0);
  lunarGroup.add(dome);
}

/**
 * Loads the 3D Mars Exploration Habitat scene
 */
function loadMarsHabitatEnvironment() {
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const loader = new THREE.GLTFLoader();
    loader.load(
      './assets/models/mars_habitat.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.35, 0.35, 0.35);
        model.position.set(0, -0.6, 0);
        marsGroup.add(model);
        console.log('[3D Engine] Mars Habitat 3D Model loaded successfully');
      },
      undefined,
      () => createProceduralMarsFallback()
    );
  } else {
    createProceduralMarsFallback();
  }
}

function createProceduralMarsFallback() {
  const terrain = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 })
  );
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.5;
  marsGroup.add(terrain);

  const dome = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.3, 2),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.2 })
  );
  dome.position.set(0, -0.1, 0);
  marsGroup.add(dome);
}

function buildDeepSpaceStarfield() {
  const starsGeom = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 600; i++) {
    const x = (Math.random() - 0.5) * 60;
    const y = (Math.random() - 0.5) * 60;
    const z = (Math.random() - 0.5) * 60;
    starPositions.push(x, y, z);
  }
  starsGeom.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.05, transparent: true, opacity: 0.8 });
  scene.add(new THREE.Points(starsGeom, starsMat));
}

/**
 * Switches the active 3D environment scene
 */
export function switchEnvironment(envKey) {
  activeEnvironment = envKey;

  // Reset visibility
  earthOrbitGroup.visible = false;
  lunarGroup.visible = false;
  marsGroup.visible = false;

  if (envKey === 'ISS') {
    earthOrbitGroup.visible = true;
    camera.position.set(0, 1.4, 4.8);
    if (controls) controls.target.set(0, 0, 0);
  } else if (envKey === 'MOON') {
    lunarGroup.visible = true;
    camera.position.set(0, 1.8, 4.2);
    if (controls) controls.target.set(0, 0, 0);
  } else if (envKey === 'MARS') {
    marsGroup.visible = true;
    camera.position.set(0, 1.8, 4.2);
    if (controls) controls.target.set(0, 0, 0);
  } else if (envKey === 'SUIT') {
    lunarGroup.visible = true;
    camera.position.set(0, 0.9, 2.5); // Zoom into habitat airlock
    if (controls) controls.target.set(0, 0.2, 1.2);
  }

  if (controls) controls.update();
}

/**
 * Resets camera to default framing
 */
export function resetGlobeCamera() {
  switchEnvironment(activeEnvironment);
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

/**
 * 60 FPS Animation Loop
 */
function animateGodEye3D() {
  animationFrameId = requestAnimationFrame(animateGodEye3D);
  clockTick += 0.015;

  if (controls) controls.update();

  // Animate Earth day/night rotation & clouds
  if (earthMesh) {
    earthMesh.rotation.y += 0.0018;
  }
  if (cloudsMesh) {
    cloudsMesh.rotation.y += 0.0024;
  }

  // Compute Keplerian ISS Orbit Position
  if (issModelGroup && issOrbitLine) {
    const orbitRadius = 2.15;
    const speed = clockTick * 0.45;
    const ox = Math.cos(speed) * orbitRadius;
    const oy = Math.sin(speed) * orbitRadius;
    
    // Position on the 51.6° inclined plane
    const pos = new THREE.Vector3(ox, oy, 0);
    pos.applyEuler(issOrbitLine.rotation);
    issModelGroup.position.copy(pos);
    
    // Align station facing along flight path
    issModelGroup.rotation.y = clockTick * 0.2;
    issModelGroup.rotation.z = Math.sin(clockTick * 0.1) * 0.2;

    // Update Telemetry Callout Badge if present
    const altVel = document.getElementById('hud-altvel-home');
    const coordEl = document.getElementById('hud-coord-val');
    const lat = (Math.sin(speed) * 51.6).toFixed(2);
    const lon = (((speed * 180 / Math.PI) % 360) - 180).toFixed(2);
    const latStr = `${Math.abs(lat)}° ${lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(lon)}° ${lon >= 0 ? 'E' : 'W'}`;

    if (coordEl) {
      coordEl.textContent = `${latStr}, ${lonStr}`;
    }
    if (altVel) {
      altVel.textContent = `Alt: 408.4 km | Vel: 7.66 km/s | ${latStr}, ${lonStr}`;
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

export const animateGodEyeGlobe = () => {
  // Loop is self-driven inside initGodEyeGlobe via animateGodEye3D()
};
