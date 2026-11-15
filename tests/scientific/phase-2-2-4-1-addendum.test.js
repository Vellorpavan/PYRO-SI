/**
 * Phase 2.2.4.1 Evidence Closure Addendum Tests
 * 
 * Verifies:
 * 1. WSTF 25-Second Ignition Duration:
 *    - Unverified classification (no primary WSTF or NASA record produced).
 *    - Not attributed to WSTF as an established fact.
 *    - Disclaimed as NASA-STD-6001B standard requirement.
 * 2. Ignition Source Energy vs Fluence Distinction:
 *    - 750 ± 50 J verified as standard chemical igniter total thermal energy (NASA-STD-6001B App A.1.2).
 *    - 2000 kJ/m² classified as unverified secondary literature energy fluence (not an active standard clause).
 *    - Verified that total energy (J) and energy fluence (kJ/m²) are NOT interchangeable.
 *    - Gas burner alternative verified as requestor-specified option under Section 7.1.3.
 * 3. De Ris Equations:
 *    - Thin-fuel and thick-fuel equations explicitly marked UNVERIFIED.
 *    - Not used as calculation paths in software.
 * 4. Runtime Model Input Contract & Boundary Behavior:
 *    - Oxygen concentration units, software bounds, and behavior at/below LOI (Math.max(0.1, ...)).
 *    - LOI units, bounds [12.5, 24.0], and UNVERIFIED_MODELLED_HEURISTIC status.
 *    - Pressure units, reference values (10.2 / 14.7 psia), and zero pressure (hard vacuum) behavior.
 *    - Ventilation units and piecewise thresholds (<2.0, 2.0–22.0, >22.0 cm/s).
 *    - Gravity dependence solely via vBuoyant and vEffective (no explicit g exponent).
 *    - evaluatePhysiologicalAtmosphere zero-pressure boundary handling.
 */

import { calculateFlammability, evaluatePhysiologicalAtmosphere } from '../../src/modules/flammability-simulator/physics-model.js';

export function runPhase2241AddendumTests(assert) {
  const flam = calculateFlammability({ o2: 34.0, psi: 8.2, flow: 8.0, g: 0.166 });

  // =========================================================================
  // 1. WSTF 25-Second Ignition Duration Verification
  // =========================================================================
  const nomex = flam.materialProvenance.nomex;
  const test1 = nomex.nasaStd6001B_Test1;
  const config = test1.specimenConfiguration;

  assert(config.ignitionDwellVerification !== undefined,
    'Must provide ignitionDwellVerification object');
  assert(config.ignitionDwellVerification.status === 'UNVERIFIED',
    '25 s ignition dwell must be classified as UNVERIFIED');
  assert(config.ignitionDwellVerification.wstfRecordProduced === false,
    'wstfRecordProduced must be false (no primary record produced)');
  assert(config.ignitionDwellVerification.standardRequirement === false,
    '25 s dwell must NOT be a standard NASA-STD-6001B requirement');
  assert(config.ignitionDwellVerification.classification === 'UNVERIFIED_LABORATORY_ANECDOTE',
    'Classification must be UNVERIFIED_LABORATORY_ANECDOTE');
  assert(!config.ignitionMethod.includes('established WSTF protocol'),
    'Must not attribute 25 s dwell to WSTF as an established fact');

  // =========================================================================
  // 2. Ignition Source Energy and Duration (J vs kJ/m² Non-Interchangeability)
  // =========================================================================
  const energyAudit = config.ignitionEnergyAudit;
  assert(energyAudit !== undefined, 'Must provide ignitionEnergyAudit object');
  assert(energyAudit.standardDeliveredEnergy.includes('750 ± 50 J'),
    'Delivered energy must cite 750 ± 50 J per NASA-STD-6001B App A.1.2');
  assert(energyAudit.standardDeliveredEnergy.includes('NASA-STD-6001B'),
    '750 ± 50 J must cite NASA-STD-6001B w/Change 3');
  assert(energyAudit.energyDensityLiteratureClaim.includes('2000 kJ/m²'),
    'Energy density must record 2000 kJ/m² claim');
  assert(energyAudit.energyDensityLiteratureClaim.includes('NOT an active NASA-STD-6001B standard requirement clause'),
    '2000 kJ/m² must NOT be attributed to active NASA standard');
  assert(energyAudit.quantitiesInterchangeable === false,
    'Scalar energy (J) and energy fluence (kJ/m²) must NOT be interchangeable');
  assert(energyAudit.gasBurnerAlternative.includes('Alternative ignition source permitted under Section 7.1.3'),
    'Gas burner must be documented as requestor alternative, not standard baseline');

  // =========================================================================
  // 3. De Ris Equations Classification & Calculation Path
  // =========================================================================
  const deRis = flam.deRisModelAssumptions;
  assert(deRis.originalFormulations.thinFuelStatus.includes('UNVERIFIED'),
    'De Ris thin-fuel formulation must be labeled UNVERIFIED');
  assert(deRis.originalFormulations.thickFuelStatus.includes('UNVERIFIED'),
    'De Ris thick-fuel formulation must be labeled UNVERIFIED');
  assert(deRis.originalFormulations.calculationPath === 'NOT_USED_IN_APPLICATION_CALCULATION',
    'De Ris analytical equations must NOT be used as calculation paths in application');
  assert(deRis.originalFormulations.note.includes('NOT used as calculation paths'),
    'Must state formulations are from literature and not used as calculation paths');

  // =========================================================================
  // 4. Runtime Model Input Contract & Boundary Testing
  // =========================================================================
  const contract = flam.runtimeInputContract;
  assert(contract !== undefined, 'Must provide runtimeInputContract object');

  // 4.1 Oxygen Concentration Contract & Boundaries
  const o2Contract = contract.oxygenConcentration;
  assert(o2Contract.units.includes('% O2'), 'Oxygen units must be % O2 by volume');
  assert(o2Contract.softwareImplementationBounds.minFloor === 0.0, 'Oxygen software floor must be 0.0');

  // Boundary test: Negative O2 sanitized to 0.0
  const negO2 = calculateFlammability({ o2: -10.0, psi: 14.7, flow: 10.0, g: 1.0 });
  assert(negO2.ppo2 === 0.0, 'Negative O2 input must sanitize to 0.0 pO2');

  // Boundary test: O2 at or below LOI behavior (Math.max(0.1, ...))
  const belowLoi = calculateFlammability({ o2: 14.0, psi: 14.7, flow: 10.0, g: 1.0 });
  assert(belowLoi.spreadIndex > 0.0, 'spreadIndex below LOI retains small non-zero base due to 0.1 floor');
  assert(belowLoi.rates.nomex === '0.0', 'Nomex spread rate below LOI must be clamped to 0.0');

  const hypoxicPurge = calculateFlammability({ o2: 8.0, psi: 14.7, flow: 10.0, g: 1.0 });
  assert(hypoxicPurge.rates.sibal === '0.2', 'SIBAL spread rate in hypoxic purge (<10% O2) must be clamped to 0.2');

  // 4.2 Limiting Oxygen Index (LOI)
  const loiContract = contract.limitingOxygenIndex;
  assert(loiContract.clampingBounds[0] === 12.5 && loiContract.clampingBounds[1] === 24.0,
    'LOI clamping bounds must be [12.5, 24.0]');
  assert(loiContract.epistemicStatus === 'UNVERIFIED_MODELLED_HEURISTIC',
    'LOI status must be UNVERIFIED_MODELLED_HEURISTIC');

  // 4.3 Pressure Contract & Zero Pressure (Hard Vacuum)
  const pressContract = contract.pressure;
  assert(pressContract.units === 'psia (pounds per square inch absolute)',
    'Pressure units must be psia');
  assert(pressContract.referenceValue.includes('10.2 psia') && pressContract.referenceValue.includes('14.7 psia'),
    'Pressure references must cite 10.2 psia (pressScale) and 14.7 psia (pressureFactor)');

  // Boundary test: Zero pressure (hard vacuum)
  const zeroPress = calculateFlammability({ o2: 21.0, psi: 0, flow: 10.0, g: 1.0 });
  assert(zeroPress.ppo2 === 0.0, 'Zero pressure must produce 0.0 pO2');
  assert(zeroPress.spreadIndex === 0.0, 'Zero pressure must evaluate spreadIndex to exactly 0.0');
  assert(zeroPress.riskScore === 8, 'Zero pressure must produce minimum software risk floor (8%)');
  assert(zeroPress.rates.sibal === '0.0', 'SIBAL rate in hard vacuum must be 0.0');
  assert(zeroPress.rates.pmma === '0.0', 'PMMA rate in hard vacuum must be 0.0');

  // Boundary test: Positive pressure below 0.1 software floor
  const tinyPress = calculateFlammability({ o2: 21.0, psi: 0.05, flow: 10.0, g: 1.0 });
  assert(tinyPress.ppo2 > 0.0, 'Positive sub-0.1 psi pressure must evaluate with software floor (0.1 psia)');

  // 4.4 Ventilation Input & Piecewise Discontinuous Thresholds
  const ventContract = contract.ventilation;
  assert(ventContract.units.includes('cm/s'), 'Ventilation units must be cm/s');
  assert(ventContract.implementationType === 'DISCONTINUOUS_SOFTWARE_HEURISTIC',
    'Ventilation implementation must be classified as DISCONTINUOUS_SOFTWARE_HEURISTIC');

  // Boundary tests for ventilation tiers (<2.0, 2.0–22.0, >22.0 cm/s in microgravity where vEff = flow)
  const lowVent = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 1.0, g: 0.0 });
  const midVent = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 10.0, g: 0.0 });
  const highVent = calculateFlammability({ o2: 21.0, psi: 14.7, flow: 30.0, g: 0.0 });
  assert(lowVent.spreadIndex < midVent.spreadIndex, 'Low vent (<2 cm/s) must yield lower spreadIndex than optimal vent');
  assert(highVent.spreadIndex < midVent.spreadIndex, 'High vent (>22 cm/s) must yield lower spreadIndex than optimal vent');

  // 4.5 Gravity Dependence Mechanism
  const gravContract = contract.gravityDependence;
  assert(gravContract.couplingMechanism.includes('Enters spreadIndex SOLELY through vBuoyant'),
    'Gravity must couple solely through vBuoyant and vEffective, not as separate exponent');
  assert(gravContract.microgravityBehavior.includes('vEffective = vForced'),
    'In microgravity, effective velocity must equal forced ventilation');

  // 4.6 Physiological Boundary Evaluation at Zero Pressure
  const physVacuum = evaluatePhysiologicalAtmosphere({ o2: 21.0, psi: 0 });
  assert(physVacuum.totalPress_kPa === 0.0, 'Zero pressure must evaluate to 0.0 kPa total pressure');
  assert(physVacuum.PIO2_mmHg === 0.0, 'Zero pressure must evaluate to 0.0 mmHg PIO2');
  assert(physVacuum.status === 'NON_COMPLIANT_LOW_PRESSURE',
    'Zero pressure must trigger NON_COMPLIANT_LOW_PRESSURE');
}
