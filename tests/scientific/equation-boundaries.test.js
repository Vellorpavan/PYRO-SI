/**
 * Scientific Equation Boundary Tests
 * Validates edge cases, non-linear physical behavior, and clamping bounds.
 */

import { calculateFlammability } from '../../src/modules/flammability-simulator/physics-model.js';

export function runEquationBoundaryTests(assert) {
  // 1. Quiescent zero-g boundary (v_flow = 0, g = 0)
  const quiescent0g = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 0.0, g: 0.0 });
  assert(quiescent0g.vBuoyant === 0.0, 'In quiescent zero-g, buoyant velocity must be exactly 0.0 cm/s');
  assert(quiescent0g.vEffective === 0.0, 'In quiescent zero-g, effective velocity must be exactly 0.0 cm/s');
  assert(quiescent0g.loi > 18.0, 'Quiescent conditions should raise LOI due to absence of convective oxidizer transport');

  // 2. High gravity boundary (1.0g Earth vs 2.0g hypergravity)
  const earth1g = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 0.0, g: 1.0 });
  assert(Math.abs(earth1g.vBuoyant - 32.0) < 0.01, 'At 1.0g, buoyant velocity scale must be 32.0 cm/s');
  assert(earth1g.vEffective >= 32.0, 'At 1.0g, effective velocity equals buoyant draft');

  const hyper2g = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 0.0, g: 2.0 });
  assert(hyper2g.vBuoyant > earth1g.vBuoyant, 'Hypergravity (2.0g) must increase buoyant velocity scale above 1.0g');

  // 3. Clamping bounds: LOI physical extinction floor (12.5%)
  const highO2HighFlow = calculateFlammability({ o2: 100.0, psi: 20.0, flow: 50.0, g: 1.0 });
  assert(highO2HighFlow.loi >= 12.5, 'LOI must not drop below physical lower bound of 12.5%');
  assert(highO2HighFlow.loi <= 24.0, 'LOI must not exceed upper bound of 24.0%');

  // 4. Clamping bounds: Hazard score range [8, 99]
  assert(quiescent0g.riskScore >= 8, 'Risk score must be at least 8% (lower floor)');
  assert(highO2HighFlow.riskScore <= 99, 'Risk score must be clamped at 99% (no 100% certainty)');

  // 5. Zero-oxygen boundary (hypothetical inert nitrogen purge)
  const inertPurge = calculateFlammability({ o2: 0.1, psi: 14.7, flow: 10.0, g: 0.0 });
  assert(inertPurge.rates.nomex === '0.0', 'Nomex must not burn in inert purge');
  assert(parseFloat(inertPurge.rates.sibal) < 0.5, 'SIBAL rate must approach near-zero in hypoxic purge');

  // 6. Sub-threshold Nomex flammability (LOI 28-30%)
  const nomexISS = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 12.0, g: 0.0 });
  assert(nomexISS.rates.nomex === '0.0', 'Nomex must have 0.0 mm/s spread in 21% O2');

  // 7. Phase 2.2 Boundary Tests: Microgravity Transport & Domain Governance
  // 7a. 0g with zero forced flow (quiescent) must explicitly return MODEL_OUT_OF_SCOPE
  assert(quiescent0g.modelDomainStatus === 'MODEL_OUT_OF_SCOPE', 'Quiescent 0g must return MODEL_OUT_OF_SCOPE (convective proxy inapplicable)');
  assert(quiescent0g.convectiveRegime === 'QUIESCENT_DIFFUSION_GOVERNED', 'Quiescent 0g must be classified as QUIESCENT_DIFFUSION_GOVERNED');
  assert(quiescent0g.combustionMechanisms.molecularDiffusion.status === 'DOMINANT_TRANSPORT_REGIME', 'Molecular diffusion must be flagged as dominant transport regime in quiescent 0g');

  // 7b. 0g with nonzero forced flow must be VALIDATED_CONVECTIVE_PROXY
  const flow0g = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 15.0, g: 0.0 });
  assert(flow0g.modelDomainStatus === 'VALIDATED_CONVECTIVE_PROXY', '0g with forced flow must be within VALIDATED_CONVECTIVE_PROXY domain');
  assert(flow0g.convectiveRegime === 'FORCED_CONVECTION_DOMINATED', '0g with forced flow must be classified as FORCED_CONVECTION_DOMINATED');

  // 7c. 1g with zero forced flow (natural buoyant convection)
  const natural1g = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 0.0, g: 1.0 });
  assert(natural1g.modelDomainStatus === 'VALIDATED_CONVECTIVE_PROXY', '1g natural convection must be in VALIDATED_CONVECTIVE_PROXY');
  assert(natural1g.convectiveRegime === 'BUOYANCY_DOMINATED', '1g natural convection must be classified as BUOYANCY_DOMINATED');

  // 7d. Missing material and oxygen inputs
  const missingInputs = calculateFlammability({ psi: 14.7 });
  assert(missingInputs.hasMissingInputs, 'Omission of o2, flow, g must trigger hasMissingInputs flag');
  assert(missingInputs.modelDomainStatus === 'INSUFFICIENT_MODEL_INPUTS', 'Missing inputs must return INSUFFICIENT_MODEL_INPUTS');
  assert(missingInputs.missingInputs.includes('o2'), 'missingInputs array must list o2');
}
