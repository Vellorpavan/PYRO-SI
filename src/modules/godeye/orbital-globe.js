/**
 * GODEYE // 3D Orbital & Tactical Globe Visualizer
 * Powered by Three.js WebGL
 */

let scene, camera, renderer, globeGroup, earthMesh, moonGroup, issMarker, targetRing;
let isDraggingGlobe = false;
let prevMouse = { x: 0, y: 0 };
let targetRotation = { x: 0.25, y: -0.6 };
let clockTick = 0;
let animationFrameId = null;

export function initGodEyeGlobe() {
  const container = document.getElementById('godeye-globe-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 500;
  const height = container.clientHeight || 460;

  // Scene & Camera
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06080e, 0.045);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1.2, 5.0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Remove existing canvas element if re-initializing
  const existingCanvas = container.querySelector('canvas');
  if (existingCanvas) {
    existingCanvas.remove();
  }
  renderer.domElement.className = 'w-full h-full block';
  container.insertBefore(renderer.domElement, container.firstChild);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x223355, 1.4);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
  dirLight.position.set(5, 3, 4);
  scene.add(dirLight);

  const warmLight = new THREE.PointLight(0xff6b00, 1.1, 15);
  warmLight.position.set(-4, -2, -2);
  scene.add(warmLight);

  // Globe Hierarchy
  globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Earth Sphere
  const earthGeom = new THREE.SphereGeometry(1.65, 40, 40);
  const earthMat = new THREE.MeshPhongMaterial({
    color: 0x0f1c30,
    emissive: 0x050c18,
    specular: 0x00f0ff,
    shininess: 24,
    wireframe: false,
    flatShading: false
  });
  earthMesh = new THREE.Mesh(earthGeom, earthMat);
  globeGroup.add(earthMesh);

  // Tactical Lat/Lon Grid
  const wireGeom = new THREE.SphereGeometry(1.665, 24, 18);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.14
  });
  const wireMesh = new THREE.Mesh(wireGeom, wireMat);
  globeGroup.add(wireMesh);

  // Atmosphere Glow
  const haloGeom = new THREE.SphereGeometry(1.78, 32, 32);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.05
  });
  globeGroup.add(new THREE.Mesh(haloGeom, haloMat));

  // ISS Orbit Ring
  const issOrbitCurve = new THREE.EllipseCurve(0, 0, 1.98, 1.98, 0, 2 * Math.PI, false, 0);
  const issPoints = issOrbitCurve.getPoints(90).map(p => new THREE.Vector3(p.x, p.y, 0));
  const issOrbitGeom = new THREE.BufferGeometry().setFromPoints(issPoints);
  const issOrbitMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75 });
  const issOrbitLine = new THREE.Line(issOrbitGeom, issOrbitMat);
  issOrbitLine.rotation.x = Math.PI / 3.4;
  issOrbitLine.rotation.y = Math.PI / 6;
  globeGroup.add(issOrbitLine);

  // ISS Satellite Marker
  const issGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const issMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });
  issMarker = new THREE.Mesh(issGeo, issMat);
  globeGroup.add(issMarker);

  // Artemis Cislunar Trajectory
  const artemisOrbitCurve = new THREE.EllipseCurve(0.5, 0, 2.85, 2.15, 0, 2 * Math.PI, false, 0);
  const artemisPoints = artemisOrbitCurve.getPoints(100).map(p => new THREE.Vector3(p.x, 0, p.y));
  const artemisGeom = new THREE.BufferGeometry().setFromPoints(artemisPoints);
  const artemisMat = new THREE.LineDashedMaterial({ color: 0xff6b00, dashSize: 0.12, gapSize: 0.06, transparent: true, opacity: 0.65 });
  const artemisLine = new THREE.Line(artemisGeom, artemisMat);
  artemisLine.computeLineDistances();
  globeGroup.add(artemisLine);

  // Moon Node
  moonGroup = new THREE.Group();
  moonGroup.position.set(3.2, 0.4, -0.6);
  const moonGeom = new THREE.SphereGeometry(0.32, 20, 20);
  const moonMat = new THREE.MeshPhongMaterial({
    color: 0x475569,
    emissive: 0x1e293b,
    specular: 0xffffff,
    shininess: 6
  });
  const moonMesh = new THREE.Mesh(moonGeom, moonMat);
  moonGroup.add(moonMesh);

  const moonWire = new THREE.Mesh(
    new THREE.SphereGeometry(0.33, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xff6b00, wireframe: true, transparent: true, opacity: 0.25 })
  );
  moonGroup.add(moonWire);
  globeGroup.add(moonGroup);

  // Starfield
  const starsGeom = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 450; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    starPositions.push(x, y, z);
  }
  starsGeom.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.04, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Points(starsGeom, starsMat));

  // Mouse & Touch Controls
  const domElem = renderer.domElement;
  domElem.addEventListener('mousedown', (e) => {
    isDraggingGlobe = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mouseup', () => { isDraggingGlobe = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isDraggingGlobe) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    targetRotation.y += dx * 0.005;
    targetRotation.x += dy * 0.005;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  domElem.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDraggingGlobe = true;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });
  window.addEventListener('touchend', () => { isDraggingGlobe = false; });
  window.addEventListener('touchmove', (e) => {
    if (!isDraggingGlobe || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - prevMouse.x;
    const dy = e.touches[0].clientY - prevMouse.y;
    targetRotation.y += dx * 0.007;
    targetRotation.x += dy * 0.007;
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  window.addEventListener('resize', onGlobeResize);
}

export function onGlobeResize() {
  const container = document.getElementById('godeye-globe-container');
  if (!container || !renderer || !camera) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

export function resetGlobeCamera() {
  targetRotation = { x: 0.25, y: -0.6 };
}

export function animateGodEyeGlobe() {
  animationFrameId = requestAnimationFrame(animateGodEyeGlobe);
  if (!renderer || !scene || !camera) return;

  clockTick += 0.016;

  // Inertial smooth rotation
  globeGroup.rotation.y += (targetRotation.y - globeGroup.rotation.y) * 0.08;
  globeGroup.rotation.x += (targetRotation.x - globeGroup.rotation.x) * 0.08;

  if (!isDraggingGlobe) {
    targetRotation.y += 0.0012; // slow continuous orbit
  }

  // Update ISS position along orbit
  const orbitAngle = clockTick * 0.9;
  const r = 1.98;
  const rawX = Math.cos(orbitAngle) * r;
  const rawY = Math.sin(orbitAngle) * r;

  const cosX = Math.cos(Math.PI / 3.4);
  const sinX = Math.sin(Math.PI / 3.4);
  const cosY = Math.cos(Math.PI / 6);
  const sinY = Math.sin(Math.PI / 6);

  const y1 = rawY * cosX;
  const z1 = -rawY * sinX;
  const x2 = rawX * cosY + z1 * sinY;
  const z2 = -rawX * sinY + z1 * cosY;

  issMarker.position.set(x2, y1, z2);

  renderer.render(scene, camera);
}
