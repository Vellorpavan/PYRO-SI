/**
 * UI Scientific Labels and Disclaimers Audit Tests
 * Verifies that all UI labels, disclaimers, and epistemic tags adhere to scientific integrity rules.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = path.resolve(__dirname, '../../index.html');

export function runUiScientificLabelsTests(assert) {
  const html = fs.readFileSync(indexPath, 'utf8');

  // 1. Excised Claims: Unsupported ±14% must NOT exist anywhere in index.html
  assert(!html.includes('±14%'), 'index.html must NOT contain unsupported empirical claim ±14%');
  assert(!html.includes('CONCEPTUAL BOUND: ±14%'), 'index.html must NOT contain CONCEPTUAL BOUND: ±14%');

  // 2. Normative Standard Citations
  assert(html.includes('NASA-STD-3001 REV F'), 'index.html must cite current applicable NASA-STD-3001 REV F');
  assert(html.includes('[V2 6003]'), 'index.html must cite [V2 6003] inspired pO2 requirement');

  // 3. Epistemic Classification Badges
  assert(html.includes('THEORETICAL PROXY (MODELLED)'), 'index.html must feature THEORETICAL PROXY (MODELLED) badge');
  assert(html.includes('EXPLORATORY THEORETICAL CONTINUUM'), 'index.html must feature EXPLORATORY THEORETICAL CONTINUUM badge');

  // 4. Assumptions and Limitations Disclosures
  assert(html.includes('MODEL ASSUMPTIONS & LIMITATIONS:'), 'index.html must display MODEL ASSUMPTIONS & LIMITATIONS disclosure');
  assert(html.includes("T'IEN / FERKUL (1999) THEORY"), "index.html must cite T'ien / Ferkul low-buoyancy theoretical model");

  // 5. Dynamic Hero Count ID
  assert(html.includes('id="hero-psi-count"'), 'index.html must have dynamic hero-psi-count element');
}
