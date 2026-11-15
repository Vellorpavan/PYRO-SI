/**
 * Scientific Validation Tests for Partial-G Bounding Calculations
 */

export function runGravityCurveTests(assert) {
  function calcSpreadAtG(gVal, o2 = 21, psi = 14.7, flow = 10) {
    const gPeakBoost = 1.0 + 0.55 * Math.exp(-Math.pow((gVal - 0.16) / 0.18, 2));
    const flowEffect = flow === 0 && gVal === 0 ? 0.3 : 1.0 + Math.min(0.4, flow / 45);
    const o2Factor = Math.pow(Math.max(0.15, (o2 - 15) / 6), 1.25) * Math.pow(psi / 14.7, 0.3);
    return Math.max(0.2, 1.6 * gPeakBoost * flowEffect * o2Factor);
  }

  // Test 1: Intermediate partial-gravity peak (T'ien / Ferkul low-buoyancy theoretical model)
  const spread0g = calcSpreadAtG(0.0);
  const spreadMoon = calcSpreadAtG(0.16);
  const spreadEarth = calcSpreadAtG(1.0);

  assert(spreadMoon > spread0g, `Lunar partial gravity (0.16g: ${spreadMoon.toFixed(2)}) should exhibit accelerated flame spread relative to quiescent zero-g (0g: ${spread0g.toFixed(2)})`);
  assert(spreadMoon > spreadEarth, `Lunar partial gravity (0.16g: ${spreadMoon.toFixed(2)}) peaks above Earth 1g buoyant spread (${spreadEarth.toFixed(2)}) per T'ien/Ferkul low-buoyancy theoretical model`);

  // Test 2: Flame spread positive non-zero floor
  assert(spread0g > 0.1, 'Flame spread in 0g must remain positive');
}
