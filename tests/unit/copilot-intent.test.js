/**
 * Unit Tests for Intent-Aware Research Co-Pilot Knowledge Engine
 * Module: tests/unit/copilot-intent.test.js
 * 
 * Verifies:
 * 1. 'hello' produces a conversational greeting without fabricated research synthesis.
 * 2. 'What is BASS-II?' retrieves authentic NASA information (PSI-25, MSG, solid fuels).
 * 3. 'Compare BASS-II and SAFFIRE-I' produces an evidence-backed comparative synthesis.
 * 4. An unsupported question produces an explicit evidence limitation.
 * 5. Every factual research answer exposes traceable sources.
 * 6. A failed retrieval does not silently fall back to fabricated scientific content.
 */

import { queryKnowledgeBase, getPresetResponse } from '../../src/modules/research-copilot/knowledge-engine.js';

export function runCopilotIntentTests(assert) {
  console.log('\n[18/18] Research Co-Pilot Intent-Aware Verification Tests...');

  // Test 1: Greetings & Conversational Inputs
  const greetingQueries = ['hello', 'hi', 'hey', 'Greetings', 'good morning', 'help', 'who are you'];
  for (const q of greetingQueries) {
    const res = queryKnowledgeBase(q);
    assert(res !== null, `Query '${q}' must return a response`);
    assert(res.intent === 'greeting', `Query '${q}' must have intent 'greeting'`);
    assert(res.badge === 'Conversational Assistant', `Query '${q}' badge must be 'Conversational Assistant'`);
    assert(res.verified === false, `Query '${q}' must NOT be labeled verified`);
    assert(res.status === 'READY // AWAITING QUERY', `Query '${q}' status must be 'READY // AWAITING QUERY'`);
    assert(res.sources.length === 0, `Query '${q}' sources must be empty`);
    assert(!res.content.includes('Direct PSI Mapping'), `Query '${q}' must not fabricate a research synthesis`);
  }

  // Test 2: Specific Investigation Retrieval (e.g. BASS-II / PSI-25)
  const bassQuery = queryKnowledgeBase('What is BASS-II?');
  assert(bassQuery !== null, "Query 'What is BASS-II?' must return a response");
  assert(bassQuery.intent === 'investigation', "Intent must be 'investigation'");
  assert(bassQuery.badge.includes('PSI-25'), "Badge must cite 'PSI-25'");
  assert(bassQuery.title.includes('BASS-II'), "Title must include 'BASS-II'");
  assert(bassQuery.content.includes('Microgravity Science Glovebox'), "Content must mention 'Microgravity Science Glovebox'");
  assert(bassQuery.content.includes('PMMA'), "Content must mention solid fuel like PMMA");
  assert(bassQuery.content.includes('0 to 55 cm/s'), "Content must cite 0 to 55 cm/s flow range");
  assert(bassQuery.content.includes('MEASUREMENTS_EXTRACTED_FROM_IMAGERY') || bassQuery.content.includes('optical video'), "Content must disclose video extraction provenance");
  assert(bassQuery.verified === true, "Authentic investigation must be verified");
  assert(bassQuery.sources.length >= 2, "Investigation response must include at least 2 traceable sources");
  assert(bassQuery.sources.some(s => s.url.includes('PSI-25')), "Sources must include official PSI-25 repository link");

  // Specific Saffire-I Retrieval
  const saffireQuery = queryKnowledgeBase('Tell me about SAFFIRE-I');
  assert(saffireQuery !== null, "Query 'Tell me about SAFFIRE-I' must return a response");
  assert(saffireQuery.intent === 'investigation', "Intent must be 'investigation'");
  assert(saffireQuery.badge.includes('PSI-98'), "Badge must cite 'PSI-98'");
  assert(saffireQuery.content.includes('Cygnus'), "Content must mention Cygnus spacecraft");
  assert(saffireQuery.content.includes('NUMERICAL_EXPERIMENTAL_MEASUREMENTS') || saffireQuery.content.includes('thermocouple'), "Must cite thermocouple instrumentation");
  assert(saffireQuery.verified === true, "Must be verified");

  // Test 3: Multi-Investigation Comparison (e.g. BASS-II vs SAFFIRE-I)
  const compQuery = queryKnowledgeBase('Compare BASS-II and SAFFIRE-I');
  assert(compQuery !== null, "Comparison query must return a response");
  assert(compQuery.intent === 'comparison', "Intent must be 'comparison'");
  assert(compQuery.title.includes('BASS-II vs SAFFIRE-I'), "Title must show BASS-II vs SAFFIRE-I");
  assert(compQuery.content.includes('Microgravity Science Glovebox') && compQuery.content.includes('Cygnus'), "Content must compare MSG and Cygnus facilities");
  assert(compQuery.content.includes('Small-scale') || compQuery.content.includes('1.2 cm') || compQuery.content.includes('1.0 m'), "Content must compare small-scale vs large-scale");
  assert(compQuery.verified === true, "Comparison of authentic studies must be verified");
  assert(compQuery.sources.length >= 2, "Comparison must include sources for both investigations");

  // Test 4: Unsupported / Out-of-Scope Queries
  const unsupportedQueries = [
    'What is the speed of sound on Mars?',
    'Quantum entanglement in black holes',
    'Who was the third president of the United States?',
    'Recipe for chocolate chip cookies'
  ];
  for (const q of unsupportedQueries) {
    const res = queryKnowledgeBase(q);
    assert(res !== null, `Unsupported query '${q}' must return a response`);
    assert(res.intent === 'unsupported', `Query '${q}' intent must be 'unsupported'`);
    assert(res.badge === 'Evidence Limitation', `Query '${q}' badge must be 'Evidence Limitation'`);
    assert(res.verified === false, `Query '${q}' must NOT be labeled verified`);
    assert(res.status === 'OUT OF SCOPE // NO NASA EVIDENCE', `Status must be 'OUT OF SCOPE // NO NASA EVIDENCE'`);
    assert(res.sources.length === 0, `Query '${q}' sources must be empty`);
    assert(res.content.includes('No matching experimental datasets or scientific records were found'), `Must state no matching records were found`);
    assert(!res.content.includes('STATUS: SYNTHESIZED VERIFIED'), `Must NOT claim synthesized verified`);
  }

  // Test 5: Thematic Scientific Queries
  const coolFlamesQuery = queryKnowledgeBase('What are cool flames in space?');
  assert(coolFlamesQuery !== null, "Query 'What are cool flames in space?' must return a response");
  assert(coolFlamesQuery.intent === 'thematic', "Intent must be 'thematic'");
  assert(coolFlamesQuery.content.includes('500–800 K'), "Must describe 500-800 K cool flame temperature");
  assert(coolFlamesQuery.sources.some(s => s.doi && s.doi.includes('10.1016')), "Must include peer-reviewed DOI citation (Nayagam et al. 2012)");

  // Test 6: Preset Responses
  const moonPreset = getPresetResponse('moon');
  assert(moonPreset !== null, "Preset 'moon' must return valid response");
  assert(moonPreset.badge.includes('0.16g'), "Moon preset must cite 0.16g");

  const hardwarePreset = getPresetResponse('hardware');
  assert(hardwarePreset !== null, "Preset 'hardware' must return valid response");
  assert(hardwarePreset.title.includes('CIR vs MSG vs Cygnus'), "Hardware preset must compare facilities");

  const alarmsPreset = getPresetResponse('alarms');
  assert(alarmsPreset !== null, "Preset 'alarms' must return valid response");
  assert(alarmsPreset.content.includes('SAME-R') && alarmsPreset.content.includes('DAFT'), "Alarms preset must cover SAME-R and DAFT");
}
