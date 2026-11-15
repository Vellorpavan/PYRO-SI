/**
 * Scientific Unit Conversion Tests
 * Verifies exact thermodynamic and dimensional unit transformations.
 */

import { calculateFlammability, evaluatePhysiologicalAtmosphere, PSI_TO_KPA, KPA_TO_PSI } from '../../src/modules/flammability-simulator/physics-model.js';

export function runUnitConversionTests(assert) {
  // 1. Exact conversion constants
  assert(Math.abs(PSI_TO_KPA - 6.894757) < 0.00001, 'PSI to kPa conversion constant must be 6.894757');
  assert(Math.abs(PSI_TO_KPA * KPA_TO_PSI - 1.0) < 0.00001, 'Reciprocal conversion must equal 1.0');

  // 2. Dalton Law pO2 unit conversions
  const iss = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 12.0, g: 0.0 });
  const expectedPsi = (21.0 / 100) * 14.7;
  const expectedKpa = expectedPsi * PSI_TO_KPA;

  assert(Math.abs(iss.ppo2 - expectedPsi) < 0.001, `Calculated pO2 (${iss.ppo2}) must match exact Dalton product in psi`);
  assert(Math.abs(iss.ppo2_kPa - expectedKpa) < 0.01, `Calculated pO2 in kPa (${iss.ppo2_kPa}) must match psi * 6.894757`);

  // 3. Artemis Lunar Base Camp (8.2 psia, 34% O2)
  const lunar = calculateFlammability({ o2: 34.0, psi: 8.2, flow: 8.0, g: 0.166 });
  const lunarPO2_psi = 0.34 * 8.2; // 2.788 psia
  const lunarPO2_kPa = lunarPO2_psi * PSI_TO_KPA; // 19.22 kPa

  assert(Math.abs(lunar.ppo2 - 2.788) < 0.01, 'Lunar pO2 must equal 2.788 psia');
  assert(Math.abs(lunar.ppo2_kPa - 19.22) < 0.05, 'Lunar pO2 must equal 19.22 kPa (Normoxic band)');

  // 4. Physiological unit evaluation (Artemis EAM PIO2 calculation)
  const phys = evaluatePhysiologicalAtmosphere({ o2: 34.0, psi: 8.2 });
  assert(Math.abs(phys.totalPress_kPa - 56.54) < 0.1, 'Total pressure 8.2 psi must convert to 56.54 kPa');
  assert(Math.abs(phys.PIO2_mmHg - 128.2) < 0.5, 'Artemis EAM inspired PIO2 must convert to ~128.2 mmHg');
  assert(phys.isMildHypoxia, 'Artemis EAM PIO2 (128.2 mmHg) must be classified as mild hypoxia (127–144 mmHg)');

  // 5. Velocity scale units (cm/s)
  assert(typeof iss.vEffective === 'number', 'Effective velocity must be a numerical scalar in cm/s');
  assert(iss.vEffective >= 0.0, 'Effective velocity must be non-negative');

  // 6. Spread rates units (mm/s formatted to 1 decimal place)
  assert(/^\d+\.\d$/.test(iss.rates.sibal), 'SIBAL spread rate must be a string formatted with 1 decimal place');
  assert(/^\d+\.\d$/.test(iss.rates.pmma), 'PMMA spread rate must be a string formatted with 1 decimal place');
}
