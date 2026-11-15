/**
 * Research Co-Pilot Knowledge Engine
 * Manages evidence-based responses from NASA PSI knowledge store.
 */

import knowledgeStore from '../../data/reference/copilot-knowledge.json' with { type: 'json' };

export function queryKnowledgeBase(rawQuery) {
  const q = (rawQuery || '').toLowerCase();

  if (q.includes('saffire') || q.includes('cygnus') || q.includes('large scale') || q.includes('fabric')) {
    return knowledgeStore.saffire;
  }
  if (q.includes('cool') || q.includes('flex') || q.includes('droplet') || q.includes('invisible') || q.includes('re-ignit')) {
    return knowledgeStore.coolflames;
  }
  if (q.includes('lunar') || q.includes('moon') || q.includes('artemis') || q.includes('partial') || q.includes('0.16')) {
    return knowledgeStore.moon;
  }
  if (q.includes('suppress') || q.includes('extinguish') || q.includes('water mist') || q.includes('halon') || q.includes('efield') || q.includes('electric')) {
    return knowledgeStore.suppress;
  }
  if (q.includes('cir') || q.includes('acme') || q.includes('mdca') || q.includes('glovebox') || q.includes('msg')) {
    return knowledgeStore.cir;
  }

  return null;
}

export function getPresetResponse(key) {
  return knowledgeStore[key] || null;
}
