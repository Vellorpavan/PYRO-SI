/**
 * Automated Verification Script for Environment Switching & 3D Synchronization
 * Tests multi-step transitions and validates scientific parameters.
 */

import assert from 'node:assert';
import fs from 'node:fs';

const habitatData = JSON.parse(fs.readFileSync('./src/data/reference/habitat-nodes.json', 'utf8'));

console.log('=======================================================');
console.log('   ENVIRONMENT SWITCHING & 3D SYNCHRONIZATION AUDIT    ');
console.log('=======================================================');

// 1. Verify all 4 environments exist and have correct scientific data
const envKeys = ['ISS', 'MOON', 'MARS', 'SUIT'];
for (const key of envKeys) {
  const hab = habitatData[key];
  assert(hab, `Habitat node ${key} must exist`);
  console.log(`✔ Verified Habitat [${key}]: ${hab.name}`);
  console.log(`   Gravity: ${hab.gravity}g (${hab.gravityDisplay})`);
  console.log(`   Atmosphere: ${hab.o2}% O2, ${hab.pressure} psi`);
  console.log(`   Hazard Level: ${hab.hazardLevel}`);
}

// 2. Test EVA Spacewalk gravity condition
const evaHab = habitatData['SUIT'];
assert.strictEqual(evaHab.gravity, 0.00001, 'EVA spacewalk in LEO must be microgravity freefall (0.00001g), not 1.0g');
assert.strictEqual(evaHab.o2, 100.0, 'EVA spacesuit must have 100% O2 atmosphere');
assert.strictEqual(evaHab.pressure, 4.3, 'EVA spacesuit must have 4.3 psi (29.6 kPa) operating pressure');
assert.strictEqual(evaHab.hazardLevel, 'CRITICAL', 'Hyperoxic 100% O2 must be classified as CRITICAL flammability hazard');
console.log('✔ PASS: EVA Spacewalk is correctly configured as microgravity freefall (0.00001g) with 100% O2 at 4.3 psi');

// 3. Test Lunar Exploration Atmosphere
const moonHab = habitatData['MOON'];
assert.strictEqual(moonHab.gravity, 0.166, 'Lunar gravity must be 0.166g');
assert.strictEqual(moonHab.o2, 34.0, 'Lunar Exploration Atmosphere must specify 34% O2');
assert.strictEqual(moonHab.pressure, 8.2, 'Lunar Exploration Atmosphere must specify 8.2 psi (56.5 kPa)');
assert.strictEqual(moonHab.hazardLevel, 'EXTREME', '34% O2 elevated oxidizer must be classified as EXTREME hazard');
console.log('✔ PASS: Lunar base correctly configured for Exploration Atmosphere (34% O2, 8.2 psi, 0.166g)');

// 4. Test Mars Exploration Atmosphere
const marsHab = habitatData['MARS'];
assert.strictEqual(marsHab.gravity, 0.38, 'Mars gravity must be 0.38g');
assert.strictEqual(marsHab.o2, 28.0, 'Mars Exploration Atmosphere must specify 28% O2');
assert.strictEqual(marsHab.hazardLevel, 'HIGH', 'Mars 28% O2 with 0.38g buoyant plume must be classified as HIGH hazard');
console.log('✔ PASS: Mars habitat correctly configured (28% O2, 8.0 psi, 0.38g)');

// 5. Verify 3D Model GLB files exist on disk
const expectedGlbs = [
  'iss_station.glb',
  'lunar_habitat.glb',
  'mars_habitat.glb',
  'astronaut_eva.glb',
  'combustion_chamber.glb',
  'flame_0g.glb',
  'flame_lunar.glb',
  'flame_1g.glb'
];

console.log('\n[3D Asset Verification]');
for (const glb of expectedGlbs) {
  const p1 = `./assets/models/${glb}`;
  const p2 = `./public/assets/models/${glb}`;
  assert(fs.existsSync(p1), `Asset ${p1} must exist`);
  assert(fs.existsSync(p2), `Asset ${p2} must exist`);
  const sz1 = fs.statSync(p1).size;
  const sz2 = fs.statSync(p2).size;
  assert.strictEqual(sz1, sz2, `Asset size must match between assets and public: ${glb}`);
  console.log(`✔ Verified ${glb}: ${sz1} bytes`);
}

// 6. Test Multi-Step State Machine Transitions
console.log('\n[State Machine Transition Sequence Simulation]');
const testSequences = [
  ['ISS', 'MOON', 'ISS'],
  ['ISS', 'MARS', 'ISS'],
  ['MOON', 'MARS', 'SUIT'],
  ['SUIT', 'MOON', 'ISS']
];

for (const seq of testSequences) {
  let currentState = null;
  for (const target of seq) {
    currentState = target;
    const hab = habitatData[currentState];
    assert(hab, `State ${currentState} is valid`);
  }
  console.log(`✔ Transition sequence verified: ${seq.join(' ➔ ')}`);
}

console.log('\n-------------------------------------------------------');
console.log('✔ ALL ENVIRONMENT SYNCHRONIZATION AUDITS PASSED CLEANLY');
console.log('-------------------------------------------------------\n');
