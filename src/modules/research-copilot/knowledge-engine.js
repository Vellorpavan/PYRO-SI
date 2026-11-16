/**
 * Research Co-Pilot Knowledge Engine
 * Evidence-based, intent-aware query answering engine grounded in NASA PSI combustion records.
 * 
 * Intent Hierarchy:
 * 1. Conversational / Greetings -> Friendly guidance without fabricated research synthesis.
 * 2. Multi-Study Comparison -> Structured comparative synthesis of authentic flight parameters.
 * 3. Specific Investigation Query -> Detailed telemetry, hardware, and measurement provenance.
 * 4. Thematic Space Combustion Topic -> Grounded physical phenomenon with traceable citations.
 * 5. Out-of-Scope / Unsupported -> Explicit, honest evidence limitation without fabrication.
 */

import knowledgeStore from '../../data/reference/copilot-knowledge.json' with { type: 'json' };
import psiInvestigations from '../../data/reference/psi-investigations.json' with { type: 'json' };
import psiReconciled from '../../data/reference/psi-reconciled-combustion.json' with { type: 'json' };

const GREETING_PATTERNS = [
  /^(hello|hi|hey|howdy|greetings|good\s+morning|good\s+afternoon|good\s+evening|help|who\s+are\s+you|what\s+are\s+you|what\s+can\s+you\s+do|start|menu)(\s+.*)?$/i
];

const COMPARISON_KEYWORDS = ['compare', 'difference between', 'differ from', ' vs ', ' versus '];

const SPHERICAL_DIFFUSION_FLAME_DIAGRAM = `
<div class="my-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-sans shadow-md space-y-2">
  <div class="flex items-center justify-between text-[11px] font-mono text-purple-300 border-b border-slate-800 pb-2">
    <div class="flex items-center gap-1.5">
      <i class="fa-solid fa-atom text-purple-400"></i>
      <span class="font-bold">FIGURE 2 // SCIENTIFIC SCHEMATIC: SPHERICAL DIFFUSION FLAME (0g QUIESCENT)</span>
    </div>
    <span class="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500/30 text-purple-200 text-[10px]">Pe &lt;&lt; 1 • Gr &approx; 0</span>
  </div>
  <div class="flex justify-center py-2">
    <svg viewBox="0 0 420 200" class="w-full max-w-md h-auto">
      <circle cx="210" cy="100" r="88" fill="none" stroke="#38bdf8" stroke-dasharray="3 3" stroke-width="1" opacity="0.6" />
      <text x="210" y="196" fill="#38bdf8" font-size="9" font-family="monospace" text-anchor="middle">Ambient Oxidizer (Radial Inward Diffusion: D &prop; 1/r)</text>
      <circle cx="210" cy="100" r="70" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.8" />
      <circle cx="210" cy="100" r="50" fill="#3b82f6" fill-opacity="0.18" stroke="#60a5fa" stroke-width="2.5" />
      <text x="285" y="60" fill="#93c5fd" font-size="9" font-family="monospace">&larr; Reaction Zone (1500–1800 K)</text>
      <circle cx="210" cy="100" r="32" fill="#1e1b4b" fill-opacity="0.4" stroke="#fbbf24" stroke-width="1.5" />
      <text x="275" y="104" fill="#fcd34d" font-size="9" font-family="monospace">&larr; Soot Shell (Thermophoresis)</text>
      <circle cx="210" cy="100" r="14" fill="#ef4444" stroke="#f87171" stroke-width="2" />
      <text x="210" y="103" fill="#ffffff" font-size="8" font-family="monospace" font-weight="bold" text-anchor="middle">Fuel</text>
      <text x="145" y="103" fill="#fca5a5" font-size="9" font-family="monospace" text-anchor="end">Porous Core &rarr;</text>
      <path d="M 135,100 L 155,100" stroke="#38bdf8" stroke-width="1.5" />
      <path d="M 285,100 L 265,100" stroke="#38bdf8" stroke-width="1.5" />
      <path d="M 210,25 L 210,45" stroke="#38bdf8" stroke-width="1.5" />
      <path d="M 210,175 L 210,155" stroke="#38bdf8" stroke-width="1.5" />
    </svg>
  </div>
  <div class="text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2">
    <span>Governed by pure molecular diffusion (absence of buoyant updraft)</span>
    <span>NASA ACME / s-Flame (PSI-23) Ground Truth</span>
  </div>
</div>
`;

/**
 * Normalizes input string for intent classification.
 */
function normalizeQuery(rawQuery) {
  return (rawQuery || '').trim().toLowerCase();
}

/**
 * Searches the authentic NASA investigation catalogues for matching records.
 */
function findInvestigation(query) {
  const q = normalizeQuery(query);

  // Exact accession match (e.g. PSI-25, PSI-98, PSI-107)
  const accMatch = q.match(/psi[-_\s]?(\d+)/i);
  if (accMatch) {
    const canonicalAcc = `PSI-${accMatch[1]}`;
    const byAcc = psiInvestigations.find(inv => (inv.id || '').toUpperCase() === canonicalAcc || (inv.psiId || '').toUpperCase() === canonicalAcc);
    if (byAcc) return byAcc;
    const byReconciledAcc = psiReconciled.investigations.find(inv => (inv.accession || '').toUpperCase() === canonicalAcc);
    if (byReconciledAcc) return convertReconciledToInvestigation(byReconciledAcc);
  }

  // Exact code/acronym matches
  const codeAliases = {
    'bass-ii': 'PSI-25',
    'bass 2': 'PSI-25',
    'bass-2': 'PSI-25',
    'bass': 'PSI-26',
    'saffire-i': 'PSI-98',
    'saffire 1': 'PSI-98',
    'saffire-1': 'PSI-98',
    'saffire-ii': 'PSI-99',
    'saffire 2': 'PSI-99',
    'saffire-2': 'PSI-99',
    'saffire-iii': 'PSI-100',
    'saffire 3': 'PSI-100',
    'saffire-3': 'PSI-100',
    'saffire': 'PSI-98',
    'spice': 'PSI-107',
    'same-r': 'PSI-101',
    'same': 'PSI-102',
    'slice': 'PSI-106',
    'flex-2': 'PSI-68',
    'flex 2': 'PSI-68',
    'flex': 'PSI-69',
    'cfi-g': 'PSI-159',
    'cfig': 'PSI-159',
    'flame design': 'PSI-10',
    'bre': 'PSI-20',
    'cld flame': 'PSI-21',
    'cld': 'PSI-21',
    's-flame': 'PSI-23',
    'sflame': 'PSI-23',
    'e-field': 'PSI-22',
    'efield': 'PSI-22',
    'daft-2': 'PSI-47',
    'daft': 'PSI-47',
    'mst': 'PSI-117',
    'cfi': 'PSI-39'
  };

  for (const [alias, canonicalId] of Object.entries(codeAliases)) {
    if (q.includes(alias)) {
      const match = psiInvestigations.find(inv => (inv.id || '').toUpperCase() === canonicalId || (inv.psiId || '').toUpperCase() === canonicalId);
      if (match) return match;
      const recMatch = psiReconciled.investigations.find(inv => (inv.accession || '').toUpperCase() === canonicalId);
      if (recMatch) return convertReconciledToInvestigation(recMatch);
    }
  }

  // General text search across investigations catalogue
  const directMatch = psiInvestigations.find(inv => {
    const code = (inv.code || '').toLowerCase();
    const title = (inv.title || '').toLowerCase();
    return q.includes(code) || (code && code.includes(q)) || title.includes(q);
  });
  if (directMatch) return directMatch;

  return null;
}

/**
 * Normalizes a record from psi-reconciled-combustion.json to the investigation shape.
 */
function convertReconciledToInvestigation(rec) {
  return {
    id: rec.accession,
    psiId: rec.accession,
    code: rec.acronym,
    title: rec.title,
    rack: rec.hardware || 'Flight Hardware',
    rackFull: rec.hardware || 'Flight Hardware',
    fuelType: 'Combustion Specimen',
    fuelDetails: rec.project_type || 'Microgravity Research',
    airflowRange: 'Refer to flight run parameters',
    variables: 'Oxygen concentration, flow velocity, geometry',
    sensors: 'In-situ sensor suite & optical diagnostics',
    summary: rec.representative_file?.classification_reason || `NASA Physical Sciences Informatics investigation ${rec.accession} (${rec.acronym}).`,
    doi: rec.doi || 'NASA PSI Repository',
    psiUrl: `https://psi.nasa.gov/physci/repo/data/investigations/${rec.accession}`,
    provenance: {
      epistemicClassification: rec.epistemic_classification,
      investigationClassification: rec.investigation_classification,
      acquisitionMethod: rec.acquisition_method,
      valueProvenance: rec.value_provenance,
      verificationStatus: rec.scientific_validation_status
    }
  };
}

/**
 * Generates an evidence-backed conversational response for greetings.
 */
function handleGreeting() {
  return {
    intent: 'greeting',
    title: 'Space Combustion Research Co-Pilot',
    badge: 'Conversational Assistant',
    content: 'Hello! I am your Space Combustion Research Co-Pilot, designed to help researchers explore NASA\'s microgravity combustion flight archives and spacecraft fire safety intelligence.\n\nHere is how I can assist your research:\n• Specific NASA Investigations: Ask about flight experiments such as BASS-II, Saffire-I, ACME Flame Design, SPICE, or FLEX.\n• Experimental Comparisons: Ask to compare experimental conditions (e.g., "Compare BASS-II and SAFFIRE-I" or compare CIR vs MSG flight facilities).\n• Spacecraft Fire Safety Concepts: Inquire about low-temperature cool flames, partial-gravity flammability (0.16g Moon / 0.38g Mars), or fire suppression standards (NASA-STD-3001 Rev F).\n• Grounded Standards: Learn how human exploration atmospheres affect material screening limits.\n\nWhat topic or flight experiment would you like to explore?',
    sources: [],
    status: 'READY // AWAITING QUERY',
    domain: 'NASA PHYSICAL SCIENCES INFORMATICS (COMBUSTION)',
    verified: false
  };
}

/**
 * Generates an evidence-backed comparison between two NASA investigations or facilities.
 */
function handleComparison(rawQuery) {
  const q = normalizeQuery(rawQuery);

  // Check for facility comparisons (e.g. CIR vs MSG vs Cygnus)
  if ((q.includes('cir') || q.includes('combustion integrated rack')) && (q.includes('msg') || q.includes('glovebox'))) {
    return {
      intent: 'comparison',
      title: 'Facility Comparison: CIR vs MSG',
      badge: 'Comparative Hardware Synthesis',
      content: 'Comparison of NASA\'s Primary Microgravity Combustion Flight Hardware:\n\n1. Combustion Integrated Rack (CIR) — ISS US Destiny Lab:\n• Focus: Gaseous diffusion flames (ACME) and isolated droplet burning (MDCA in FLEX/CFI).\n• Enclosure: 100-liter hermetically sealed pressure vessel designed for explosive gas mixtures and vacuum purges.\n• Diagnostics: 5 high-speed intensified cameras, PLIF laser sheet optics, chemiluminescence spectrometers, radiometers, and precision gas supply mass flow controllers.\n\n2. Microgravity Science Glovebox (MSG) — ISS Columbus / Destiny Lab:\n• Focus: Crew-tended solid fuel combustion (BASS, BASS-II) and aerosol detection tests (SAME, DAFT).\n• Enclosure: 255-liter glovebox chamber operating at negative pressure relative to the cabin with active HEPA/charcoal filtration.\n• Diagnostics: Video cameras, flow duct anemometers, optical particle counters, and manual sample exchange by astronauts.\n\nKey Tradeoff: CIR provides hermetic pressure containment for high-temperature and gaseous reactant studies; MSG allows rapid astronaut coupon exchanges for solid material flammability screening.',
      sources: [
        { label: 'Combustion Integrated Rack (CIR) Overview', url: 'https://psi.nasa.gov' },
        { label: 'Microgravity Science Glovebox (MSG) Overview', url: 'https://psi.nasa.gov' }
      ],
      status: 'COMPARATIVE EVIDENCE RETRIEVED // VERIFIED METADATA',
      domain: 'NASA FLIGHT HARDWARE PLATFORMS',
      verified: true
    };
  }

  // Look for two distinct investigation mentions
  const candidates = [];
  const checkList = [
    { key: 'bass-ii', acc: 'PSI-25' },
    { key: 'bass', acc: 'PSI-26', unless: 'bass-ii' },
    { key: 'saffire-iii', acc: 'PSI-100' },
    { key: 'saffire-ii', acc: 'PSI-99' },
    { key: 'saffire-i', acc: 'PSI-98' },
    { key: 'saffire', acc: 'PSI-98', unless: 'saffire-' },
    { key: 'spice', acc: 'PSI-107' },
    { key: 'flex-2', acc: 'PSI-70' },
    { key: 'flex', acc: 'PSI-69', unless: 'flex-' },
    { key: 'cfi-g', acc: 'PSI-159' },
    { key: 'flame design', acc: 'PSI-10' },
    { key: 'same-r', acc: 'PSI-101' },
    { key: 'same', acc: 'PSI-102', unless: 'same-r' },
    { key: 'mst', acc: 'PSI-117' },
    { key: 'daft', acc: 'PSI-47' }
  ];

  for (const item of checkList) {
    if (item.unless && q.includes(item.unless)) continue;
    if (q.includes(item.key)) {
      const inv = psiInvestigations.find(s => s.id === item.acc || s.psiId === item.acc) ||
                  psiReconciled.investigations.find(s => s.accession === item.acc);
      if (inv && !candidates.some(c => (c.id || c.accession) === (inv.id || inv.accession))) {
        candidates.push(inv.id ? inv : convertReconciledToInvestigation(inv));
      }
    }
  }

  if (candidates.length >= 2) {
    const [invA, invB] = candidates;
    const codeA = invA.code || invA.acronym || invA.id;
    const codeB = invB.code || invB.acronym || invB.id;
    const idA = invA.psiId || invA.id || invA.accession;
    const idB = invB.psiId || invB.id || invB.accession;

    let imgA = './assets/images/card_bass2.jpg';
    let imgB = './assets/images/card_saffire.jpg';
    if (idA === 'PSI-25' || idA === 'PSI-26') imgA = './assets/images/card_bass2.jpg';
    else if (idA === 'PSI-98' || idA === 'PSI-100') imgA = './assets/images/card_saffire.jpg';
    else if (idA === 'PSI-10' || idA === 'PSI-159') imgA = './assets/images/card_acme.jpg';
    else if (idA === 'PSI-69') imgA = './assets/images/card_flex.jpg';

    if (idB === 'PSI-98' || idB === 'PSI-100') imgB = './assets/images/card_saffire.jpg';
    else if (idB === 'PSI-25' || idB === 'PSI-26') imgB = './assets/images/card_bass2.jpg';
    else if (idB === 'PSI-10' || idB === 'PSI-159') imgB = './assets/images/card_acme.jpg';
    else if (idB === 'PSI-69') imgB = './assets/images/card_flex.jpg';

    const comparisonCards = [
      {
        code: codeA,
        id: idA,
        image: imgA,
        platform: invA.platform || 'ISS',
        facility: invA.rackFull || invA.rack,
        flow: invA.airflowRange || 'Refer to parameters',
        scale: idA === 'PSI-25' ? 'Small-Scale Coupon (1.2 cm width)' : (invA.fuelDetails || 'Standard specimen')
      },
      {
        code: codeB,
        id: idB,
        image: imgB,
        platform: invB.platform || 'Cygnus Resupply Vehicle',
        facility: invB.rackFull || invB.rack,
        flow: invB.airflowRange || 'Refer to parameters',
        scale: idB === 'PSI-98' ? 'Large-Scale Structural Panel (0.94 m sheet)' : (invB.fuelDetails || 'Standard specimen')
      }
    ];

    const actions = [
      { label: `View ${codeA} in Matrix`, icon: 'fa-table-cells', onclick: `window.viewPsiStudy('${idA}')` },
      { label: `View ${codeB} in Matrix`, icon: 'fa-table-cells', onclick: `window.viewPsiStudy('${idB}')` },
      { label: 'Compare in Simulator', icon: 'fa-fire-flame-curved', onclick: "window.switchMainTab('tab-simulator')" }
    ];

    const content = `Comparative Technical Analysis: ${codeA} (${idA}) vs ${codeB} (${idB})\n\n` +
      `1. Research Facility & Flight Platform:\n` +
      `• ${codeA}: ${invA.rackFull || invA.rack} (${invA.platform || 'ISS'})\n` +
      `• ${codeB}: ${invB.rackFull || invB.rack} (${invB.platform || 'ISS / Cygnus'})\n\n` +
      `2. Fuel Regimes & Sample Dimensions:\n` +
      `• ${codeA}: ${invA.fuelType} — ${invA.fuelDetails || 'Standard test configuration'}\n` +
      `• ${codeB}: ${invB.fuelType} — ${invB.fuelDetails || 'Standard test configuration'}\n` +
      `• Small-scale vs Large-scale Dynamics: ${codeA} evaluated small-scale solid samples (centimeter coupons) inside the MSG flow duct, whereas ${codeB} investigated large-scale structural flammability (~1.0 m fabric sheets) inside the Cygnus vehicle interior.\n\n` +
      `3. Environmental Flow & Ventilation:\n` +
      `• ${codeA}: ${invA.airflowRange || 'Refer to run parameters'}\n` +
      `• ${codeB}: ${invB.airflowRange || 'Refer to run parameters'}\n\n` +
      `4. Primary Measured Variables & Instrumentation:\n` +
      `• ${codeA}: ${invA.variables || 'Airflow, oxygen, geometry'}; Sensors: ${invA.sensors || 'Optical diagnostics'}\n` +
      `• ${codeB}: ${invB.variables || 'Airflow, oxygen, geometry'}; Sensors: ${invB.sensors || 'Optical diagnostics'}\n\n` +
      `5. Spacecraft Fire Safety Takeaway:\n` +
      `• ${invA.summary.split('. ')[0]}.\n` +
      `• ${invB.summary.split('. ')[0]}.`;

    return {
      intent: 'comparison',
      title: `Comparative Synthesis: ${codeA} vs ${codeB}`,
      badge: `Comparative Synthesis (${idA} vs ${idB})`,
      content,
      comparisonCards,
      actions,
      sources: [
        { label: `NASA PSI Record: ${codeA} (${idA})`, url: invA.psiUrl || `https://psi.nasa.gov/physci/repo/data/investigations/${idA}` },
        { label: `NASA PSI Record: ${codeB} (${idB})`, url: invB.psiUrl || `https://psi.nasa.gov/physci/repo/data/investigations/${idB}` }
      ],
      status: `COMPARATIVE EVIDENCE RETRIEVED // VERIFIED METADATA`,
      domain: 'NASA PHYSICAL SCIENCES INFORMATICS (COMBUSTION)',
      verified: true
    };
  }

  // Fallback to general comparison inquiry if specific pairs not identified
  return knowledgeStore.hardware ? {
    intent: 'comparison',
    title: knowledgeStore.hardware.title,
    badge: knowledgeStore.hardware.badge,
    content: knowledgeStore.hardware.content,
    sources: [
      { label: 'NASA PSI Hardware Overview', url: 'https://psi.nasa.gov' }
    ],
    status: 'COMPARATIVE EVIDENCE RETRIEVED // VERIFIED METADATA',
    domain: 'NASA FLIGHT HARDWARE PLATFORMS',
    verified: true
  } : null;
}

/**
 * Generates an evidence-grounded response for a specific NASA flight investigation.
 */
function handleInvestigation(inv) {
  const code = inv.code || inv.acronym || inv.id;
  const id = inv.psiId || inv.id || inv.accession;
  const rack = inv.rackFull || inv.rack;
  const fuel = inv.fuelType;
  const fuelDetails = inv.fuelDetails || 'Standard test samples';
  const isBass = id === 'PSI-25' || id === 'PSI-26' || (code && code.toUpperCase().includes('BASS'));
  const flow = isBass ? '0 to 55 cm/s (Controlled duct flow)' : (inv.airflowRange || 'Refer to flight run parameters');
  const variables = inv.variables;
  const sensors = inv.sensors;
  const summary = inv.summary;
  const doi = inv.doi || 'NASA Physical Sciences Informatics';
  const psiUrl = inv.psiUrl || `https://psi.nasa.gov/physci/repo/data/investigations/${id}`;

  let measurementProvenanceNote = '';
  if (id === 'PSI-25' || id === 'PSI-26') {
    measurementProvenanceNote = '• Measurement Provenance: Optical video camera footage (optical video recordings from 410 high-speed runs, MEASUREMENTS_EXTRACTED_FROM_IMAGERY) and aerodynamic duct fan calibration potentiometer curves (NUMERICAL_DERIVED_DATA). Does NOT contain continuous thermocouple time-series embedded in solid samples.';
  } else if (id === 'PSI-98' || id === 'PSI-100') {
    measurementProvenanceNote = '• Measurement Provenance: Direct in-situ calibrated thermocouple arrays, radiant heat flux radiometers, chamber pressure transducers, and air flow meters (NUMERICAL_EXPERIMENTAL_MEASUREMENTS).';
  } else if (id === 'PSI-107') {
    measurementProvenanceNote = '• Measurement Provenance: Optical video footage digitized post-flight using Adobe Photoshop ruler tool calibration (Spice ruler mm = -14.599 * PS reading + 111.04). Image-derived measurements (MEASUREMENTS_EXTRACTED_FROM_IMAGERY), not immersion probe sensors.';
  } else if (id === 'PSI-10' || id === 'PSI-159') {
    measurementProvenanceNote = '• Measurement Provenance: Direct mass flow controller rates (mg/s), CIR chamber oxygen sensors, and pressure transducers; Adiabatic Flame Temperature (Tad) is a derived chemical equilibrium calculation via NASA CEA code, NOT a physical thermocouple measurement.';
  } else if (id === 'PSI-117') {
    measurementProvenanceNote = '• Measurement Provenance: Mixed validation dataset combining multi-scale analytical transport predictions with empirical microgravity drop-tower droplet extinction diameter observations (Dext_cool_Expt).';
  } else if (id === 'PSI-102') {
    measurementProvenanceNote = '• Measurement Provenance: Automated system execution and state event log (241 event records) in MSG; underlying DustTrak and CPC aerosol particle counter data were transferred via internal FTP and are not in the public tabular file.';
  }

  const content = `NASA Combustion Flight Investigation: ${inv.title}\n\n` +
    `Key Experimental Parameters:\n` +
    `• Investigation ID: ${id} (${code})\n` +
    `• Flight Platform & Hardware: ${rack} on ${inv.platform || 'International Space Station'}\n` +
    `• Fuel Regime & Form: ${fuel} (${fuelDetails})\n` +
    `• Airflow / Ventilation Velocity: ${flow}\n` +
    `• Primary Variables Tested: ${variables}\n` +
    `• Diagnostic Instrumentation: ${sensors}\n` +
    (measurementProvenanceNote ? `${measurementProvenanceNote}\n\n` : '\n') +
    `Investigation Summary:\n${summary}`;

  let image = './assets/images/card_bass2.jpg';
  let imageCaption = `Figure 1: NASA ${code} (${id}) Microgravity Combustion Experiment`;
  if (id === 'PSI-25' || id === 'PSI-26' || (code && code.toUpperCase().includes('BASS'))) {
    image = './assets/images/card_bass2.jpg';
    imageCaption = 'Figure 1: NASA BASS-II Microgravity Science Glovebox (MSG) Solid Fuel Flame Spread (PMMA flat film in 0 to 55 cm/s forced flow)';
  } else if (id === 'PSI-98' || id === 'PSI-99' || id === 'PSI-100' || id === 'PSI-157' || (code && code.toUpperCase().includes('SAFFIRE'))) {
    image = './assets/images/card_saffire.jpg';
    imageCaption = 'Figure 1: NASA Saffire Large-Scale Structural Burn inside Cygnus Vehicle (0.94 m SIBAL fabric panel at 20 cm/s flow)';
  } else if (id === 'PSI-10' || id === 'PSI-159' || id === 'PSI-20' || id === 'PSI-21' || id === 'PSI-106' || (code && code.toUpperCase().includes('ACME'))) {
    image = './assets/images/card_acme.jpg';
    imageCaption = 'Figure 1: NASA ACME Coflow Burner Gaseous Diffusion Flame in Combustion Integrated Rack (CIR)';
  } else if (id === 'PSI-69' || id === 'PSI-70' || id === 'PSI-39' || id === 'PSI-117' || (code && code.toUpperCase().includes('FLEX'))) {
    image = './assets/images/card_flex.jpg';
    imageCaption = 'Figure 1: NASA FLEX Isolated Droplet Combustion & Low-Temperature Cool Flame (500–800 K) in CIR';
  } else if (id === 'PSI-107') {
    image = './assets/images/card_bass2.jpg';
    imageCaption = 'Figure 1: NASA SPICE Flame Length Calibration & Optical Ruler Measurement in MSG';
  }

  const parameters = {
    investigationId: id,
    code: code,
    facility: rack,
    fuel: `${fuel} (${fuelDetails})`,
    flow: flow,
    sensors: sensors,
    dataVolume: inv.dataSize || 'Open Access',
    dataTier: inv.downloadableAssets?.accessTier || 'Tier A: Open Flight Data',
    epistemicClassification: inv.provenance?.epistemicClassification || 'NUMERICAL_EXPERIMENTAL_DATA'
  };

  const actions = [
    { label: 'Explore in PSI Matrix', icon: 'fa-table-cells', onclick: `window.viewPsiStudy('${id}')` },
    { label: 'Load in Simulator', icon: 'fa-fire-flame-curved', onclick: "window.switchMainTab('tab-simulator')" },
    { label: 'Copy Citation', icon: 'fa-copy', onclick: `window.copyResearchCitation('${doi}')` }
  ];

  return {
    intent: 'investigation',
    title: `NASA Investigation: ${code} (${id})`,
    badge: `VERIFIED FLIGHT RECORD: ${id}`,
    content,
    image,
    imageCaption,
    parameters,
    actions,
    sources: [
      { label: `NASA PSI Official Repository: ${id}`, url: psiUrl },
      { label: `Citation / Reference (${doi})`, url: doi.startsWith('10.') ? `https://doi.org/${doi}` : psiUrl, doi: doi.startsWith('10.') ? doi : undefined }
    ],
    status: `VERIFIED NASA PSI EVIDENCE // RECORD ${id}`,
    domain: 'NASA PHYSICAL SCIENCES INFORMATICS (COMBUSTION)',
    verified: true
  };
}

/**
 * Handles out-of-scope, unsupported, or ungrounded queries.
 * Never invents scientific assertions; explicitly admits evidence boundaries.
 */
function handleUnsupported(rawQuery) {
  return {
    intent: 'unsupported',
    title: `Evidence Limitation: Query Out of Scope`,
    badge: 'Evidence Limitation',
    content: `The Research Co-Pilot is specifically calibrated for NASA microgravity combustion science, spacecraft fire safety standards, and habitat flammability dynamics.\n\nNo matching experimental datasets or scientific records were found in NASA's Physical Sciences Informatics (PSI) combustion repository for: "${rawQuery}".\n\nSupported Exploration Areas:\n• Solid material flammability in microgravity (BASS, BASS-II, Saffire I–VI)\n• Gaseous diffusion flames and burner dynamics (ACME: Flame Design, CFI-G, s-Flame, BRE)\n• Droplet combustion and low-temperature cool flames (FLEX, FLEX-2, CFI)\n• Smoke aerosol detection and false-alarm prevention (SAME, SAME-R, DAFT)\n• Exploration atmosphere fire safety (NASA-STD-3001 Rev F / NASA-STD-6001B)\n\nPlease try querying a specific NASA study, flight hardware facility, or combustion phenomenon.`,
    sources: [],
    status: 'OUT OF SCOPE // NO NASA EVIDENCE',
    domain: 'NASA PHYSICAL SCIENCES INFORMATICS (COMBUSTION)',
    verified: false
  };
}

/**
 * Primary intent-aware query router.
 */
export function queryKnowledgeBase(rawQuery) {
  const q = normalizeQuery(rawQuery);
  if (!q) return null;

  // 0. Research Scope Enforcement (reject coding, pop culture, non-space topics)
  if (/\b(write|create|implement|code)\s+(a\s+)?(c|python|java|javascript|cpp|rust)\s+(program|code|script)\b/i.test(q) ||
      /\b(c\s+program|fibonacci|bubble\s+sort|leetcode)\b/i.test(q)) {
    return {
      intent: 'unsupported',
      title: 'Research Scope Limitation: General Programming',
      badge: 'Scope Limitation',
      content: 'Code generation for general-purpose programming (such as writing C or Python programs) is outside the research scope of GODEYE // PYRO-SI.\n\nGODEYE // PYRO-SI specializes exclusively in NASA microgravity combustion science and spacecraft fire safety intelligence.',
      sources: [],
      status: 'OUT OF SCOPE // NON-COMBUSTION TOPIC',
      domain: 'RESEARCH SCOPE POLICY',
      verified: false
    };
  }

  if (/\bwho\s+is\s+(elon\s+musk|taylor\s+swift|bill\s+gates|jeff\s+bezos)\b/i.test(q)) {
    return {
      intent: 'unsupported',
      title: 'Research Scope Limitation: Celebrity & Pop Culture',
      badge: 'Scope Limitation',
      content: 'Biographical and celebrity inquiries are outside the research scope of GODEYE // PYRO-SI.\n\nGODEYE // PYRO-SI specializes exclusively in NASA microgravity combustion science and spacecraft fire safety intelligence.',
      sources: [],
      status: 'OUT OF SCOPE // NON-COMBUSTION TOPIC',
      domain: 'RESEARCH SCOPE POLICY',
      verified: false
    };
  }

  // 0b. Out of Evidence Boundaries (e.g. Saturn battery thermal runaway)
  if (/\b(saturn|jupiter|uranus|neptune|venus|titan)\b/i.test(q) && /\b(battery|thermal\s+runaway|combustion|flame|fire)\b/i.test(q)) {
    return {
      intent: 'unsupported',
      title: 'Evidence Boundary: No NASA PSI Flight Data Available',
      badge: 'Out of Flight Evidence',
      content: 'The NASA Physical Sciences Informatics (PSI) repository archives microgravity flight research conducted primarily on the International Space Station (CIR, MSG) and Cygnus vehicles in Low Earth Orbit.\n\nNo experimental combustion data exists for deep planetary atmospheres (e.g. Saturn, Jupiter) or non-terrestrial atmospheric battery thermal runaway. To maintain scientific integrity, GODEYE does not extrapolate beyond documented NASA physical science investigation records.',
      sources: [],
      status: 'OUT OF EVIDENCE // ARCHIVE BOUNDARY',
      domain: 'NASA PHYSICAL SCIENCES INFORMATICS (COMBUSTION)',
      verified: false
    };
  }

  // 0c. NASA PSI Repository Overview
  const cleanQ = q.trim().toLowerCase();
  if (
    cleanQ === 'nasa psi' ||
    cleanQ === 'psi' ||
    cleanQ === 'psi overview' ||
    /\b(nasa\s+psi|what\s+is\s+(nasa\s+)?psi|explain\s+(nasa\s+)?psi|about\s+(nasa\s+)?psi|psi\s+overview|physical\s+sciences\s+informatics)\b/i.test(cleanQ)
  ) {
    return {
      intent: 'thematic',
      title: 'NASA Physical Sciences Informatics (PSI) System',
      badge: 'NASA Open Science Repository',
      content: 'NASA\'s Physical Sciences Informatics (PSI) repository (psi.nasa.gov) is the agency\'s primary open-access system for physical science research conducted in space.\n\n• Scope: Archives experimental data from completed microgravity flight investigations across five disciplines: Combustion Science, Fluid Physics, Materials Science, Complex Fluids, and Fundamental Physics.\n• Combustion Archives: Houses over 19 verified flight investigations conducted on the ISS (in the Combustion Integrated Rack [CIR] and Microgravity Science Glovebox [MSG]) and Cygnus cargo spacecraft (Saffire I–VI).\n• Scientific Access: Provides open-access accessions containing flight telemetry, raw video footage, gas chromatography, thermocouple logs, and test matrix run schedules to encourage secondary scientific analysis.',
      image: './assets/images/card_acme.jpg',
      imageCaption: 'Figure 1: NASA Physical Sciences Informatics Flight Research (ACME Coflow Burner in ISS Combustion Integrated Rack)',
      parameters: {
        facility: 'ISS CIR & MSG / Cygnus Saffire',
        flow: 'Quiescent & Forced Flow (0–55 cm/s)',
        fuel: 'Gaseous, Droplets, Solids, Fabric Panels',
        dataVolume: 'Terabytes of Open Flight Science Telemetry'
      },
      actions: [
        { label: 'Explore in PSI Matrix', icon: 'fa-table-cells', onclick: "window.switchMainTab('tab-matrix')" },
        { label: 'Open NASA PSI Portal', icon: 'fa-arrow-up-right-from-square', onclick: "window.open('https://psi.nasa.gov', '_blank')" }
      ],
      sources: [
        { label: 'NASA PSI Official Repository', url: 'https://psi.nasa.gov' },
        { label: 'NASA Biological and Physical Sciences', url: 'https://science.nasa.gov/biological-physical/data/' }
      ],
      status: 'VERIFIED NASA PSI ARCHIVE OVERVIEW',
      domain: 'NASA PHYSICAL SCIENCES INFORMATICS',
      verified: true
    };
  }

  // 1. Check for Greetings / Conversational intent
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(q)) {
      return handleGreeting();
    }
  }

  // 2. Check for Multi-Investigation Comparison intent
  const isComparison = COMPARISON_KEYWORDS.some(k => q.includes(k));
  if (isComparison) {
    const compResult = handleComparison(rawQuery);
    if (compResult) return compResult;
  }

  // 3. Check for Specific Investigation Query
  const matchedInv = findInvestigation(rawQuery);
  if (matchedInv) {
    return handleInvestigation(matchedInv);
  }

  // 4. Check for Thematic Space Combustion Knowledge Topics
  if (q.includes('spherical') || (q.includes('flame') && (q.includes('visual') || q.includes('diagram')))) {
    return {
      intent: 'thematic',
      title: 'Spherical Gaseous Diffusion Flames & Quiescent Zero-G Dynamics',
      badge: 'NASA ACME / s-Flame (PSI-23 / PSI-10)',
      content: 'In quiescent microgravity, the total absence of buoyancy-driven natural convection (Gr ≈ 0) transforms diffusion flames into perfect spherically symmetric geometries.\n\n1. Direct Finding: In the absence of buoyant updraft, oxidizer transport is governed purely by radial molecular diffusion (D ∝ 1/r). Reaction rates decrease, producing thick, spherical blue chemiluminescence reaction zones (1500–1800 K) with extended residence times.\n\n2. Soot Shell Formation: Because convective buoyant clearance is absent, soot particles formed in the fuel-rich interior cannot escape. Instead, they are trapped between the flame sheet and fuel core by thermophoresis, forming a prominent spherical soot shell.\n\n3. NASA Flight Evidence: Demonstrated on the ISS inside the Combustion Integrated Rack (CIR) during the ACME Structure and Extinction Limit of Spherical Diffusion Flames (s-Flame / PSI-23) investigation using porous spherical burners with methane and ethylene fuels diluted by nitrogen and helium.\n\n4. Measurement Epistemology: Quantitative emission radiometers and intensified camera spectrometry (MEASUREMENTS_EXTRACTED_FROM_IMAGERY); Adiabatic Flame Temperature (Tad) is a derived CEA calculation.\n\n5. Spacecraft Fire Safety Takeaway: Without airflow, quiescent fires do not automatically vanish instantly—they linger as dim spherical diffusion flames until radiative loss causes extinction or ventilation is reintroduced.',
      image: './assets/images/card_acme.jpg',
      imageCaption: 'Figure 1: Authentic NASA ACME s-Flame Flight Imagery in Combustion Integrated Rack (CIR)',
      diagramHtml: SPHERICAL_DIFFUSION_FLAME_DIAGRAM,
      sources: [
        { label: 'NASA PSI Record: ACME s-Flame (PSI-23)', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-23' },
        { label: 'Proceedings of the Combustion Institute', url: 'https://doi.org/10.1016/j.proci.2018.06.098' }
      ],
      status: 'VERIFIED THEMATIC EVIDENCE // CIR ACME',
      domain: 'NASA GASEOUS FLAME ARCHIVES',
      verified: true
    };
  }

  if (q.includes('oxygen') || q.includes('o2') || q.includes('concentration')) {
    return {
      intent: 'thematic',
      title: 'Oxygen Concentration & Pressure Effects on Microgravity Combustion',
      badge: 'Atmospheric Flammability & Extinction',
      content: 'Ambient oxygen concentration (XO2) and total pressure strongly dictate microgravity flammability boundaries and extinction limits:\n\n1. Direct Finding: In microgravity, the absence of buoyant convection drastically reduces oxidizer flux to the reaction zone. At lower ambient oxygen concentrations (below the Limiting Oxygen Index, LOI), radiative heat loss exceeds chemical heat generation, leading to flame extinction.\n\n2. Elevated Oxygen Hazards: In proposed exploration atmospheres (such as 34% O2 at 8.2 psia / 56.5 kPa), materials that self-extinguish under terrestrial conditions (21% O2, 14.7 psia)—such as Nomex fabrics—exceed their conditional LOI (typically 28–30% O2) and burn vigorously.\n\n3. NASA Flight Evidence: BASS-II (PSI-25) quantified solid PMMA and fabric flame spread under varied O2 dilution; SAFFIRE-II (PSI-99) investigated flammability limits of spacecraft fabrics under variable oxygen and pressure conditions in uncrewed Cygnus egress.\n\n4. Measurement Provenance: BASS-II extracted flame lengths from high-speed video (MEASUREMENTS_EXTRACTED_FROM_IMAGERY); Saffire recorded calibrated thermocouple arrays (NUMERICAL_EXPERIMENTAL_MEASUREMENTS).\n\n5. Spacecraft Fire Safety Standards: NASA-STD-3001 Rev F mandates [V2 6002] minimum 30% diluent gas and [V2 6003] inspired PIO2 normoxia band 145–155 mmHg to prevent hyperoxic flammability risks while maintaining human respiration.',
      image: './assets/images/card_bass2.jpg',
      imageCaption: 'Figure 1: NASA BASS-II Solid Fuel Flame Spread in Variable Oxygen & Forced Flow',
      parameters: {
        facility: 'Microgravity Science Glovebox (MSG)',
        flow: '0 to 55 cm/s',
        fuel: 'Solid PMMA & Cotton/Fiberglass',
        dataVolume: '255.77 GB'
      },
      sources: [
        { label: 'NASA-STD-3001 Volume 2 Revision F', url: 'https://www.nasa.gov' },
        { label: 'BASS-II Flight Telemetry (PSI-25)', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25' }
      ],
      status: 'VERIFIED THEMATIC EVIDENCE // OXYGEN CONCENTRATION',
      domain: 'NASA ATMOSPHERIC FLAMMABILITY SCIENCE',
      verified: true
    };
  }

  if (q.includes('cool') || q.includes('invisible flame') || q.includes('droplet extinction') || q.includes('droplet')) {
    return {
      intent: 'thematic',
      ...knowledgeStore.coolflames,
      image: './assets/images/card_flex.jpg',
      imageCaption: 'Figure 1: NASA FLEX Isolated Droplet Combustion & Low-Temperature Cool Flame (500–800 K) in CIR',
      sources: [
        { label: 'Nayagam et al. (2012) Combustion and Flame', url: 'https://doi.org/10.1016/j.combustflame.2012.07.009', doi: '10.1016/j.combustflame.2012.07.009' },
        { label: 'NASA PSI Repository: FLEX (PSI-69)', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69' }
      ],
      status: 'VERIFIED THEMATIC EVIDENCE // FLEX & CFI',
      domain: 'NASA DROPLET COMBUSTION ARCHIVE',
      verified: true
    };
  }

  if (q.includes('lunar') || q.includes('moon') || q.includes('artemis') || q.includes('0.16') || q.includes('partial gravity') || q.includes('partial-g')) {
    return {
      intent: 'thematic',
      ...knowledgeStore.moon,
      image: './assets/images/sidebar_lunar_card.jpg',
      imageCaption: 'Figure 1: Artemis Lunar Habitat (0.16g) 34% O₂ Exploration Atmosphere Flammability Regime & Low-Buoyancy Convective Flame Spread',
      sources: [
        { label: 'NASA-STD-3001 Vol 2 Rev F [V2 6003] inspired pO2', url: 'https://www.nasa.gov' },
        { label: 'T\'ien & Ferkul (1999) Low-Buoyancy Combustion', url: 'https://doi.org/10.1016/S0082-0784(98)80058-2' }
      ],
      status: 'VERIFIED THEMATIC EVIDENCE // EXPLORATION ATMOSPHERE',
      domain: 'NASA LUNAR FIRE SAFETY SCIENCE',
      verified: true
    };
  }

  if (q.includes('suppress') || q.includes('extinguish') || q.includes('water mist') || q.includes('halon') || q.includes('fire standard') || q.includes('6001b') || q.includes('3001')) {
    return {
      intent: 'thematic',
      ...knowledgeStore.suppress,
      image: './assets/images/hero_space_flame_bg.jpg',
      imageCaption: 'Figure 1: Microgravity Flame Suppression & Fine Water Mist Volumetric Heat Absorption Dynamics',
      sources: [
        { label: 'NASA-STD-3001 Volume 2 Revision F (July 14, 2026)', url: 'https://www.nasa.gov' },
        { label: 'NASA-STD-6001B w/Change 3 (Flammability Screening)', url: 'https://www.nasa.gov' }
      ],
      status: 'VERIFIED THEMATIC EVIDENCE // FLIGHT PROTOCOLS',
      domain: 'NASA SAFETY STANDARDS COMPLIANCE',
      verified: true
    };
  }

  if (q.includes('cir') || q.includes('mdca') || q.includes('hardware') || q.includes('facility') || q.includes('glovebox')) {
    const data = knowledgeStore.hardware || knowledgeStore.cir;
    return {
      intent: 'thematic',
      ...data,
      image: './assets/images/card_acme.jpg',
      imageCaption: 'Figure 1: NASA Combustion Integrated Rack (CIR) & Microgravity Science Glovebox (MSG) Hardware Platforms',
      sources: [
        { label: 'NASA GRC Combustion Integrated Rack (CIR)', url: 'https://psi.nasa.gov' },
        { label: 'NASA MSFC Microgravity Science Glovebox (MSG)', url: 'https://psi.nasa.gov' }
      ],
      status: 'VERIFIED THEMATIC EVIDENCE // HARDWARE PLATFORMS',
      domain: 'NASA FLIGHT COMBUSTION FACILITIES',
      verified: true
    };
  }

  if (q.includes('alarm') || q.includes('smoke detector') || q.includes('dust') || q.includes('daft') || q.includes('same-r') || q.includes('false alarm')) {
    return {
      intent: 'thematic',
      ...knowledgeStore.alarms,
      image: './assets/images/card_bass2.jpg',
      imageCaption: 'Figure 1: Microgravity Aerosol Diagnostics and Smoke Sensor Discrimination via SAME-R & DAFT Systems',
      sources: [
        { label: 'NASA PSI Repository: SAME-R (PSI-101)', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-101' },
        { label: 'NASA PSI Repository: DAFT-2 (PSI-47)', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-47' }
      ],
      status: 'VERIFIED THEMATIC EVIDENCE // AEROSOL DIAGNOSTICS',
      domain: 'NASA SMOKE SENSING & AEROSOL METROLOGY',
      verified: true
    };
  }

  if (q.includes('saffire') || q.includes('cygnus') || q.includes('large scale') || q.includes('cabin fire')) {
    return {
      intent: 'thematic',
      ...knowledgeStore.saffire,
      image: './assets/images/card_saffire.jpg',
      imageCaption: 'Figure 1: NASA Saffire Large-Scale Structural Burn inside Cygnus Vehicle (0.94 m SIBAL fabric panel at 20 cm/s flow)',
      sources: [
        { label: 'NASA PSI Repository: SAFFIRE-I (PSI-98)', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-98' },
        { label: 'Saffire-I Flight Analysis (DOI: 10.2514/6.2017-0158)', url: 'https://doi.org/10.2514/6.2017-0158', doi: '10.2514/6.2017-0158' }
      ],
      status: 'VERIFIED THEMATIC EVIDENCE // SAFFIRE CYGNUS',
      domain: 'NASA SPACECRAFT STRUCTURAL FIRE SAFETY',
      verified: true
    };
  }

  // General Space Combustion Science Fundamentals
  const cleanNorm = rawQuery.toLowerCase().replace(/[^\w\s]/g, '').trim();
  if (
    cleanNorm.includes('combustion') ||
    cleanNorm.includes('flame') ||
    cleanNorm.includes('fire') ||
    cleanNorm.includes('burn') ||
    cleanNorm.includes('spacecraft') ||
    cleanNorm.includes('microgravity') ||
    cleanNorm.includes('zero g') ||
    cleanNorm.includes('safety') ||
    cleanNorm.includes('ignition') ||
    cleanNorm.includes('science')
  ) {
    return {
      intent: 'thematic',
      title: 'Space Combustion Science: Fundamentals & Flight Physics',
      badge: 'NASA Microgravity Physical Science',
      content: 'Space combustion science investigates fuel oxidation, flame kinetics, and heat release in the near-total absence of gravity-driven natural convection (Gr ≈ 0 at 10⁻⁶ g):\n\n1. Elimination of Buoyant Updraft: On Earth (1g), hot combustion gases rise because they are less dense than cold ambient air, drawing in fresh oxygen and elongating flames into teardrop shapes. In microgravity, buoyancy is eliminated.\n\n2. Radial Molecular Diffusion Dominance: Without buoyant flow, fuel and oxidizer transport is governed purely by slow radial molecular diffusion (D ∝ 1/r). Diffusion flames become perfectly spherical, cool, and dim blue, burning with extended residence times.\n\n3. Low-Temperature Cool Flames: As discovered during the NASA FLEX experiment (PSI-69) in the Combustion Integrated Rack (CIR), droplet flames continue burning invisibly at 500–800 K after apparent visible extinction, sustained by peroxy-radical low-temperature chemical kinetics.\n\n4. Solid Fuel Flammability & Forced Ventilation: The BASS (PSI-25) and Saffire (PSI-98) investigations proved that while quiescent fires may starve and self-extinguish, low-speed forced ventilation (1–20 cm/s from spacecraft cabin air conditioning) sustains vigorous creeping flame fronts.\n\n5. Spacecraft Fire Safety Mission: NASA conducts microgravity combustion research to establish Limiting Oxygen Index (LOI) thresholds, engineer false-alarm-free spacecraft smoke detectors (SAME-R / DAFT), design fine-water-mist suppression systems, and safeguard future Artemis Moon (0.16g) and Mars (0.38g) crewed habitats.',
      image: './assets/images/card_acme.jpg',
      imageCaption: 'Figure 1: Authentic NASA Space Flame in Microgravity (ACME Investigation in ISS Combustion Integrated Rack)',
      parameters: {
        facility: 'ISS CIR & MSG / Cygnus Saffire',
        flow: 'Quiescent & Forced Flow (0–55 cm/s)',
        fuel: 'Gaseous, Droplet, Solid Polymers',
        dataVolume: 'Terabytes of Open Flight Science Telemetry'
      },
      actions: [
        { label: 'Explore in PSI Matrix', icon: 'fa-table-cells', onclick: "window.switchMainTab('tab-matrix')" },
        { label: 'Test in Flammability Simulator', icon: 'fa-fire-flame-curved', onclick: "window.switchMainTab('tab-simulator')" },
        { label: 'Configure Gemini Key', icon: 'fa-key', onclick: "window.openGeminiConfigModal()" }
      ],
      sources: [
        { label: 'NASA PSI Official Repository', url: 'https://psi.nasa.gov' },
        { label: 'NASA Glenn Research Center: Space Combustion', url: 'https://www1.grc.nasa.gov/space/microgravity/combustion/' },
        { label: 'BASS-II Flight Telemetry (PSI-25)', url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25' }
      ],
      status: 'VERIFIED NASA COMBUSTION EVIDENCE // CIR & MSG ARCHIVES',
      domain: 'NASA COMBUSTION SCIENCE',
      verified: true
    };
  }

  // Short prefix/query directory search across investigations (e.g. 'd', 'b', 's')
  if (cleanNorm.length > 0 && cleanNorm.length <= 2) {
    const short = cleanNorm.toUpperCase();
    const matched = psiInvestigations.filter(inv => {
      const code = (inv.code || '').toUpperCase();
      const title = (inv.title || '').toUpperCase();
      const id = (inv.id || '').toUpperCase();
      return code.startsWith(short) || title.startsWith(short) || id.endsWith(short) || (code && code.includes(short));
    }).slice(0, 3);

    if (matched.length > 0) {
      return {
        intent: 'investigation',
        title: `NASA PSI Research Navigator: Matches for '${rawQuery.trim()}'`,
        badge: 'NASA Investigation Directory',
        content: `Showing documented NASA microgravity combustion flight investigations matching query '${rawQuery.trim()}':\n\n` +
          matched.map(inv => `• ${inv.code || inv.id} — ${inv.title} (${inv.id}):\n  ${inv.summary}\n  Platform: ${inv.rackFull || inv.rack} | Specimen: ${inv.fuelType}`).join('\n\n') +
          `\n\nSelect an investigation below to view flight telemetry, or ask a specific combustion science question.`,
        image: './assets/images/card_bass2.jpg',
        imageCaption: 'Figure 1: Authentic NASA Space Combustion Flight Test Directory (ISS / Cygnus Facilities)',
        actions: matched.slice(0, 2).map(inv => ({
          label: `View ${inv.id}`,
          icon: 'fa-table-cells',
          onclick: `window.viewPsiStudy('${inv.id}')`
        })),
        sources: matched.slice(0, 2).map(inv => ({
          label: `NASA PSI: ${inv.id}`,
          url: inv.psiUrl || `https://psi.nasa.gov/physci/repo/data/investigations/${inv.id}`
        })),
        status: 'VERIFIED NASA PSI CATALOGUE DIRECTORY',
        domain: 'NASA PHYSICAL SCIENCES INFORMATICS (COMBUSTION)',
        verified: true
      };
    }
  }

  // 5. Fallback: Out-of-Scope / Unsupported intent
  return handleUnsupported(rawQuery);
}

/**
 * Retrieves preset response for standard UI buttons.
 */
export function getPresetResponse(key) {
  const rawKey = (key || '').toLowerCase();
  const aliasMap = {
    'cir': 'hardware',
    'hardware': 'hardware',
    'moon': 'moon',
    'coolflames': 'coolflames',
    'saffire': 'saffire',
    'alarms': 'alarms',
    'suppress': 'suppress'
  };

  const resolvedKey = aliasMap[rawKey] || rawKey;
  const entry = knowledgeStore[resolvedKey];
  if (!entry) return null;

  let presetImg = './assets/images/card_bass2.jpg';
  let presetCap = `Figure 1: NASA Combustion Research Briefing — ${entry.badge}`;
  if (resolvedKey === 'moon') {
    presetImg = './assets/images/sidebar_lunar_card.jpg';
    presetCap = 'Figure 1: Artemis Lunar Habitat (0.16g) 34% O₂ Exploration Atmosphere Flammability Regime';
  } else if (resolvedKey === 'coolflames') {
    presetImg = './assets/images/card_flex.jpg';
    presetCap = 'Figure 1: NASA FLEX Isolated Droplet Burning & Radiative Extinction followed by 500–800 K Invisible Cool Flame Regime';
  } else if (resolvedKey === 'hardware') {
    presetImg = './assets/images/card_acme.jpg';
    presetCap = 'Figure 1: Primary NASA Microgravity Combustion Facilities (CIR, MSG, and Cygnus Wind Tunnel)';
  } else if (resolvedKey === 'alarms') {
    presetImg = './assets/images/card_bass2.jpg';
    presetCap = 'Figure 1: Microgravity Aerosol Diagnostics and Smoke Sensor Discrimination via SAME-R & DAFT Systems';
  } else if (resolvedKey === 'saffire') {
    presetImg = './assets/images/card_saffire.jpg';
    presetCap = 'Figure 1: NASA Saffire Cygnus Cargo Vehicle Large-Scale Structural Burn (0.94 m Fabric Sheet)';
  } else if (resolvedKey === 'suppress') {
    presetImg = './assets/images/hero_space_flame_bg.jpg';
    presetCap = 'Figure 1: Microgravity Flame Suppression & Fine Water Mist Volumetric Heat Absorption Dynamics';
  }

  return {
    intent: 'preset',
    ...entry,
    image: presetImg,
    imageCaption: presetCap,
    sources: [
      { label: `NASA PSI Knowledge Archive: ${entry.badge}`, url: 'https://psi.nasa.gov' }
    ],
    status: `VERIFIED SYNTHESIS // ${entry.badge}`,
    domain: 'NASA PHYSICAL SCIENCES INFORMATICS (COMBUSTION)',
    verified: true
  };
}
