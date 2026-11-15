/**
 * Flammability Simulator Physics Model
 * Computes combustion parameters, flame spread rates, and fire hazard indices.
 * 
 * NOTE: Empirical demonstration formulas grounded in qualitative insights
 * from BASS-II, SAFFIRE, and ACME CFI-G. Subject to formal peer-reviewed validation.
 */

import { clamp } from '../../utils/math.js';

export function calculateFlammability({ o2, psi, flow, g }) {
  // Oxygen Partial Pressure (pO2 = %O2 * P_total)
  const ppo2 = (o2 / 100) * psi;

  // Effective air velocity combining forced ventilation + natural buoyant draft
  // In microgravity (g=0), vBuoyant is 0. On Earth (g=1), vBuoyant ~ 32 cm/s.
  const vBuoyant = 32 * Math.sqrt(g);
  const vEffective = Math.sqrt(flow * flow + vBuoyant * vBuoyant);

  // Limiting Oxygen Index (LOI) estimation
  // Flow factor: very low flow allows heat loss (raises LOI), moderate flow feeds O2 (lowers LOI)
  const flowFactor = (vEffective >= 3 && vEffective <= 25) ? -1.4 : (vEffective < 3 ? 1.8 : 0.4);
  const pressureFactor = Math.pow(14.7 / psi, 0.18);
  const loi = clamp((17.5 + flowFactor) * pressureFactor, 12.5, 24.0);

  // Flame spread index scaling
  const o2Ratio = Math.pow(Math.max(0.1, (o2 - loi) / (21 - 15.5)), 1.35);
  const pressScale = Math.pow(psi / 10.2, 0.35);
  const ventBonus = vEffective < 2 ? 0.35 : (vEffective <= 22 ? 1.25 : 0.95);
  const spreadIndex = Math.max(0, o2Ratio * pressScale * ventBonus);

  // Composite ignition risk score (0–99%)
  const rawRisk = spreadIndex * 38 + (o2 > 30 ? 22 : 0);
  const riskScore = clamp(Math.round(rawRisk), 8, 99);

  // Material spread rates (relative mm/s)
  const sibalRate = (2.2 * spreadIndex).toFixed(1);
  const pmmaRate = (0.95 * spreadIndex).toFixed(1);
  const silRate = (0.58 * spreadIndex).toFixed(1);
  const nomexRate = o2 < 27.5 ? (0.0).toFixed(1) : (0.35 * spreadIndex).toFixed(1);

  // Suppression protocol recommendation
  let suppressionRec = '';
  if (o2 >= 32 || riskScore >= 75) {
    suppressionRec = 'CRITICAL O₂ HAZARD: Rapid depressurization (<5 psi) recommended over chemical agents. Shut off all forced ventilation ducts immediately to starve flame front. Deploy localized nitrogen blanket purge ports.';
  } else if (g === 0) {
    suppressionRec = 'MICROGRAVITY QUENCH PROTOCOL: Isolate module ventilation to allow flame to self-extinguish in CO₂ combustion blanket. Caution: Inspect for cool flame persistence (500–800 K) with thermal IR before venting.';
  } else {
    suppressionRec = 'NOMINAL PROTOCOL: Deploy ultrafine water mist (30–80 µm droplets) or portable CO₂ extinguisher. Maintain ventilation scrubbers on post-fire carbon monoxide removal mode.';
  }

  return {
    ppo2,
    vBuoyant,
    vEffective,
    loi,
    spreadIndex,
    riskScore,
    rates: {
      sibal: sibalRate,
      pmma: pmmaRate,
      silicone: silRate,
      nomex: nomexRate
    },
    suppressionRec
  };
}
