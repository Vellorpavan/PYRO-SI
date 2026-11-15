/**
 * Unit Tests for Flammability Physics Model
 */

import { calculateFlammability } from '../../src/modules/flammability-simulator/physics-model.js';

export function runFlammabilityModelTests(assert) {
  // Test 1: ISS Nominal Environment
  const issRes = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 12.0, g: 0.0 });
  assert(issRes.ppo2 > 3.0 && issRes.ppo2 < 3.2, 'ISS pO2 should be ~3.08 psi');
  assert(issRes.vBuoyant === 0, 'In 0g, buoyant velocity must be 0');
  assert(issRes.vEffective === 12.0, 'In 0g, effective velocity equals forced ventilation');
  assert(issRes.riskScore < 50, 'ISS nominal fire risk score should be moderate (<50)');

  // Test 2: Lunar Base Exploration Atmosphere (High O2 hazard)
  const moonRes = calculateFlammability({ o2: 34.0, psi: 8.2, flow: 8.0, g: 0.166 });
  assert(moonRes.riskScore >= 75, 'Lunar base with 34% O2 must trigger elevated or critical risk (>=75%)');
  assert(parseFloat(moonRes.rates.sibal) > parseFloat(issRes.rates.sibal), 'SIBAL flame spread rate in lunar base must exceed ISS nominal');

  // Test 3: Nomex behavior below threshold
  const lowO2Res = calculateFlammability({ o2: 20.0, psi: 14.7, flow: 10.0, g: 1.0 });
  assert(lowO2Res.rates.nomex === '0.0', 'Nomex should have 0.0 spread rate below 27.5% O2');

  // Test 4: Extreme Bound Clamping
  const extremeRes = calculateFlammability({ o2: 100.0, psi: 20.0, flow: 50.0, g: 1.0 });
  assert(extremeRes.riskScore <= 99, 'Risk score must be capped at 99%');
  assert(extremeRes.loi >= 12.5, 'LOI must remain above lower physical bound 12.5%');
}
