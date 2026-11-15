# AI Research Co-Pilot Capability & RAG Architecture Audit
**Project:** GODEYE // PYRO-SI — Fire Safety Intelligence Platform  
**Component:** AI Research Co-Pilot (`knowledge-engine.js`, `copilot-knowledge.json`, `backend/api/main.py`)  
**Auditor:** Independent Scientific & Technical Audit Team  
**Date:** November 15, 2026  
**Status:** AUDIT COMPLETE — CURRENT CLASSIFICATION: STATIC HEURISTIC KNOWLEDGE LOOKUP

---

## 1. Executive Summary

This audit assesses the technical architecture, evidence grounding, and intelligence capabilities of the **AI Research Co-Pilot** in the **GODEYE // PYRO-SI** platform.

### Primary Audit Findings:
1. **Frontend Client:** The current browser-side research co-pilot (`src/modules/research-copilot/knowledge-engine.js`) operates via **client-side keyword substring matching** against a static JSON store (`src/data/reference/copilot-knowledge.json`). It does **not** call a live large language model (LLM) or execute client-side neural embedding retrieval.
2. **Backend API:** The FastAPI backend gateway (`backend/api/main.py`) contains a stub endpoint `/api/v1/copilot/query` that returns a hardcoded mock citation envelope without connecting to an external vector database or the Google Gemini API.
3. **Scientific Quality of Answers:** Although the content in `copilot-knowledge.json` was authored by subject-matter experts using authentic NASA technical documentation (citing Saffire-I, FLEX cool flames, ACME CFI-G, and SAME-R), the mechanism cannot dynamically answer arbitrary research questions outside the five pre-indexed topic buckets.
4. **Path to Production:** To achieve genuine evidence-grounded scientific intelligence, a true Retrieval-Augmented Generation (RAG) pipeline utilizing Google Gemini 2.0 Flash, text-embedding-004, and a vector database must be implemented.

---

## 2. Technical Inspection of the Current Implementation

### 2.1. Client-Side Substring Matching Engine
The current query logic in `src/modules/research-copilot/knowledge-engine.js` is structured as follows:

```javascript
export function queryKnowledgeBase(rawQuery) {
  const q = (rawQuery || '').toLowerCase();

  // Bucket 1: Saffire / Cygnus / Large-Scale Fabric Burns
  if (q.includes('saffire') || q.includes('cygnus') || q.includes('large scale') || q.includes('fabric')) {
    return knowledgeStore.saffire;
  }
  // Bucket 2: Cool Flames / Droplets / Low-Temperature Combustion
  if (q.includes('cool') || q.includes('flex') || q.includes('droplet') || q.includes('invisible') || q.includes('re-ignit')) {
    return knowledgeStore.coolflames;
  }
  // Bucket 3: Lunar / Partial Gravity / Exploration Atmosphere
  if (q.includes('lunar') || q.includes('moon') || q.includes('artemis') || q.includes('partial') || q.includes('0.16')) {
    return knowledgeStore.moon;
  }
  // Bucket 4: Fire Suppression / Extinguishment / Water Mist / E-Field
  if (q.includes('suppress') || q.includes('extinguish') || q.includes('water mist') || q.includes('halon') || q.includes('efield') || q.includes('electric')) {
    return knowledgeStore.suppress;
  }
  // Bucket 5: Combustion Integrated Rack / Racks / Hardware Facilities
  if (q.includes('cir') || q.includes('acme') || q.includes('mdca') || q.includes('glovebox') || q.includes('msg')) {
    return knowledgeStore.cir;
  }

  return null;
}
```

#### Technical Limitations:
- **Zero Semantic Generalization:** A query asking *"How does low-speed ventilation sustain solid combustion?"* fails to match any keyword and returns `null` (triggering the fallback response), even though BASS-II directly addresses this question.
- **Order Dependency & Shadowing:** If a user asks *"How does water mist suppress lunar fires?"*, the first condition matching either `lunar` or `suppress` wins based strictly on `if-else` hierarchy.
- **No Multi-Document Synthesis:** The engine cannot aggregate insights across multiple datasets (e.g., comparing Saffire-I solid fabric flame spread with BASS-II PMMA spread).

---

### 2.2. Content Store Inspection (`copilot-knowledge.json`)
The five responses in the static store are verified for factual authenticity:

1. **`saffire`:** Correctly details the Saffire-I Cygnus post-egress experiment, $0.94\text{ m}$ SIBAL cotton/fiberglass fabric card, $20\text{ cm/s}$ flow velocity, and flame spread rates ($2.24\text{ mm/s}$ concurrent, $0.34\text{ mm/s}$ opposed). Cites DOI `10.1016/j.actaastro.2019.03.023`.
2. **`coolflames`:** Correctly details the FLEX droplet combustion discovery of sustained cool flame burning ($500\text{--}800\text{ K}$) without visible light emission, sustained by low-temperature chemical chain-branching. Cites DOI `10.60555/mbq8-0451`.
3. **`moon`:** Correctly details the $1/6\text{th }g$ intermediate buoyant convection regime, exploration atmosphere ($34\%\ \text{O}_2\text{ at }8.2\text{ psia}$), and the upcoming FM-2 lunar payload. Cites DOI `10.1016/j.proci.2020.06.012`.
4. **`suppress`:** Correctly notes why gaseous Halon 1301 is restricted in closed spacecraft life support systems due to toxic HF/HBr pyrolyzate accumulation, and details the NASA-approved deployment of ultrafine water mist ($30\text{--}80\ \mu\text{m}$) and nitrogen purge. Cites DOI `10.1016/j.proci.2018.06.128`.
5. **`cir`:** Correctly describes the Combustion Integrated Rack (CIR) in the US Destiny Laboratory, the 100-liter chamber, and its modular inserts (ACME, MDCA). Cites NASA Glenn FCF Operations Guide.

---

### 2.3. Backend Gateway Inspection (`backend/api/main.py`)
Lines 57–74 of `backend/api/main.py` handle `/api/v1/copilot/query`:
```python
@app.post("/api/v1/copilot/query", response_model=QueryResponse)
def handle_copilot_query(req: QueryRequest):
    q = req.query.strip().lower()
    if not q:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    return QueryResponse(
        title=f"Grounded Response: {req.query}",
        badge="NASA PSI RAG v1",
        content=(
            "Analysis cross-referenced against NASA's Physical Sciences Informatics (PSI) repository. "
            "Relevant investigations include BASS-II (forced duct solid flammability), Saffire (large-scale cabin burns), "
            "and ACME CFI-G (partial-gravity peak flammability)."
        ),
        citations=["10.2514/6.2014-0414", "10.1016/j.actaastro.2019.03.023", "10.1016/j.proci.2020.06.012"]
    )
```

#### Audit Finding:
The backend currently returns a static template with three static citations. It does not invoke an LLM, vectorize the prompt, or retrieve chunks from an indexed corpus.

---

## 3. Requirements for a Fully Evidence-Grounded RAG Pipeline

To elevate the AI Research Co-Pilot from a demonstration prototype to a production-grade scientific research instrument, the following architecture must be deployed:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 NASA PSI DOCUMENT CORPUS                                    │
│  [NASA/TM Reports]    [AIAA / Elsevier Papers]    [PSI Experimental CSVs]    [EIRD Specs]   │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. INGESTION & CHUNKING PIPELINE                                                           │
│  - PyMuPDF / pdfplumber for technical papers                                                │
│  - Semantic markdown chunking (512 tokens with 64-token overlap)                            │
│  - Metadata tagging: [PSI-ID, DOI, Author, Flight Year, Gravity Regime, Fuel Type]          │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. EMBEDDING & VECTOR INDEXING                                                             │
│  - Model: Google text-embedding-004 (768 dimensions)                                       │
│  - Vector Database: ChromaDB (local development) / Vertex AI Vector Search (production)    │
│  - Metric: Cosine similarity with HNSW indexing                                             │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. HYBRID RETRIEVAL & RERANKING                                                            │
│  - Dense semantic search (embeddings) + Sparse lexical search (BM25 for exact terms)        │
│  - Top-K: Retrieve 10 candidates; Reciprocal Rank Fusion (RRF) reranking to Top-3           │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. GENERATIVE SYNTHESIS & FACTUAL GROUNDING                                                 │
│  - Model: Google Gemini 2.0 Flash (`gemini-2.0-flash-exp` or `gemini-1.5-pro`)              │
│  - Strict system prompt with citation enforcement                                           │
│  - Temperature: 0.1 (low hallucination, high determinism)                                   │
│  - Verifiable citation mapping: every assertion must attribute chunk DOI or PSI Record ID   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Document Ingestion Specification
The corpus must ingest the official primary documents already identified in the dataset catalog:
- `NASA/TM-2015-218704` (BASS-II Final Operations Report)
- `Acta Astronautica 10.1016/j.actaastro.2019.03.023` (Saffire-I Flight Experiment)
- `Proc. Combust. Inst. 10.1016/j.proci.2020.06.012` (ACME CFI-G Cool Diffusion Flames)
- `NASA-STD-6001B` (Flammability, Odor, Offgassing, and Compatibility Requirements)
- `NASA-STD-3001` (Human-System Integration Architecture)

### 3.2. Grounded System Prompt Specification
```text
You are GODEYE // PYRO-SI, a NASA Physical Sciences Informatics (PSI) scientific research assistant.
You provide rigorous, evidence-based answers regarding microgravity combustion physics, spacecraft fire safety, 
and partial-gravity flammability.

STRICT GROUNDING RULES:
1. Base your answer ONLY on the provided context retrieved from NASA PSI investigations.
2. If the context does not contain sufficient information, state explicitly: "Insufficient experimental data in NASA PSI archives."
3. Every quantitative claim (burn rate, oxygen percentage, pressure, extinction limit) MUST include its exact citation [e.g., PSI-25, DOI: 10.2514/6.2014-0414].
4. Never extrapolate lunar or partial-g results beyond documented ACME CFI-G and drop-tower findings without labeling them as theoretical approximations.
```

---

## 4. Current vs Target Capability Comparison

| Capability | Current Status in Application | Required Target Implementation |
| :--- | :--- | :--- |
| **Query Understanding** | Static keyword substring check | Gemini semantic intent parser + embedding similarity |
| **Document Search** | 5 fixed JSON objects | Vector similarity search across 10+ PSI investigations |
| **Response Generation** | Pre-written text templates | Live Gemini 2.0 Flash synthesis with context injection |
| **Citation Attribution** | Hardcoded citation string | Dynamic bracketed chunk-level DOI attribution |
| **Uncertainty Handling** | Generic fallback message | Grounded acknowledgement of data gaps / unverified regimes |
| **Telemetry Awareness** | Disconnected from co-pilot | Context injection of live habitat state ($p\text{O}_2, g, v$) |

---

## 5. Implementation Priority Matrix

1. **Immediate (Phase 1):** Update UI to clearly label the co-pilot as *"NASA PSI Knowledge Engine v1.0 (Curated Grounded Reference)"* so users understand it queries a verified expert corpus rather than an open-ended conversational agent.
2. **Short-Term (Phase 2):** Connect `backend/api/main.py` to the Gemini API (`google-genai` SDK) using `GEMINI_API_KEY` from `.env`.
3. **Mid-Term (Phase 3):** Embed the full text of all 10 PSI technical reports and experimental metadata into ChromaDB using Google `text-embedding-004`.
