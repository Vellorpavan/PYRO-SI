"""
NASA Physical Sciences Informatics (PSI) Combustion RAG Engine
Grounds research queries in authentic NASA microgravity flight investigations,
peer-reviewed mission papers, and official spacecraft fire safety standards.
"""

from dataclasses import dataclass
import json
import logging
import os
import re
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("pyro_si.rag")

SPHERICAL_DIFFUSION_FLAME_DIAGRAM = """
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
      <!-- Radial Inward Diffusion Gradient (Ambient O2) -->
      <circle cx="210" cy="100" r="88" fill="none" stroke="#38bdf8" stroke-dasharray="3 3" stroke-width="1" opacity="0.6" />
      <text x="210" y="196" fill="#38bdf8" font-size="9" font-family="monospace" text-anchor="middle">Ambient Oxidizer (Radial Inward Diffusion: D &prop; 1/r)</text>

      <!-- Thermal Radiation Boundary -->
      <circle cx="210" cy="100" r="70" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.8" />
      
      <!-- Blue Chemiluminescence Reaction Zone (CH* / C2* emission) -->
      <circle cx="210" cy="100" r="50" fill="#3b82f6" fill-opacity="0.18" stroke="#60a5fa" stroke-width="2.5" />
      <text x="285" y="60" fill="#93c5fd" font-size="9" font-family="monospace">&larr; Reaction Zone (1500–1800 K)</text>
      
      <!-- Soot Shell Boundary -->
      <circle cx="210" cy="100" r="32" fill="#1e1b4b" fill-opacity="0.4" stroke="#fbbf24" stroke-width="1.5" />
      <text x="275" y="104" fill="#fcd34d" font-size="9" font-family="monospace">&larr; Soot Shell (Thermophoresis)</text>

      <!-- Fuel Droplet / Porous Burner Core -->
      <circle cx="210" cy="100" r="14" fill="#ef4444" stroke="#f87171" stroke-width="2" />
      <text x="210" y="103" fill="#ffffff" font-size="8" font-family="monospace" font-weight="bold" text-anchor="middle">Fuel</text>
      <text x="145" y="103" fill="#fca5a5" font-size="9" font-family="monospace" text-anchor="end">Porous Core &rarr;</text>

      <!-- Radial Inflow Markers -->
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
"""

@dataclass
class RetrievedPassage:
    investigation_id: str
    title: str
    facility: str
    fuel: str
    flow_velocity: str
    sensors: str
    epistemic_classification: str
    summary: str
    doi: str
    psi_url: str
    relevance_score: float
    supporting_excerpt: str


class NasaRagEngine:
    """
    Domain-Specific Retrieval-Augmented Generation Engine for NASA Combustion Science.
    """

    def __init__(self, data_dir: Optional[str] = None):
        if not data_dir:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            data_dir = os.path.join(base_dir, "src", "data", "reference")

        self.data_dir = data_dir
        self.investigations: List[Dict[str, Any]] = []
        self.reconciled_investigations: List[Dict[str, Any]] = []
        self.knowledge_store: Dict[str, Any] = {}
        self.load_catalogue()

    def load_catalogue(self):
        """Loads authentic NASA PSI catalogues and reference knowledge."""
        inv_path = os.path.join(self.data_dir, "psi-investigations.json")
        rec_path = os.path.join(self.data_dir, "psi-reconciled-combustion.json")
        kb_path = os.path.join(self.data_dir, "copilot-knowledge.json")

        try:
            if os.path.exists(inv_path):
                with open(inv_path, "r", encoding="utf-8") as f:
                    self.investigations = json.load(f)
        except Exception as e:
            logger.error(f"Failed loading psi-investigations.json: {e}")

        try:
            if os.path.exists(rec_path):
                with open(rec_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.reconciled_investigations = data.get("investigations", [])
        except Exception as e:
            logger.error(f"Failed loading psi-reconciled-combustion.json: {e}")

        try:
            if os.path.exists(kb_path):
                with open(kb_path, "r", encoding="utf-8") as f:
                    self.knowledge_store = json.load(f)
        except Exception as e:
            logger.error(f"Failed loading copilot-knowledge.json: {e}")

    def is_greeting(self, q: str) -> bool:
        """Detects general conversational greetings."""
        clean = q.strip().lower()
        return bool(re.match(r"^(hello|hi|hey|howdy|greetings|good\s+morning|good\s+afternoon|good\s+evening|help|who\s+are\s+you|what\s+can\s+you\s+do|start|menu)(\s+.*)?$", clean))

    def is_out_of_scope(self, q: str) -> Tuple[bool, Optional[str]]:
        """
        Enforces domain-specific research scope.
        Rejects general programming, entertainment, and pop-culture queries.
        Does NOT reject combustion questions merely because terminology is varied.
        """
        clean = q.strip().lower()

        # 1. Programming code generation requests
        if re.search(r"\b(write|create|implement|code|generate)\s+(a\s+)?(c|python|java|javascript|cpp|rust|go|c\+\+|html|css|sql|bash|ruby|php)\s+(program|code|script|function|app|class|tutorial)\b", clean):
            return True, "Code generation for general-purpose programming (such as writing C or Python programs) is outside the research scope of GODEYE // PYRO-SI."
        if re.search(r"\b(c\s+program|c\s+compiler|hello\s+world\s+in\s+c|fibonacci\s+in|bubble\s+sort|leetcode)\b", clean):
            return True, "General-purpose programming exercises are outside the research scope of GODEYE // PYRO-SI."

        # 2. Pop culture, entertainment, and non-space celebrities
        if re.search(r"\bwho\s+is\s+(elon\s+musk|taylor\s+swift|bill\s+gates|jeff\s+bezos|donald\s+trump|joe\s+biden|messi|ronaldo|kanye|drake)\b", clean):
            return True, "Biographical and celebrity inquiries are outside the research scope of GODEYE // PYRO-SI."
        if re.search(r"\b(celebrity|hollywood|box\s+office|movie\s+reviews|sports\s+scores|premier\s+league|nba\s+scores)\b", clean):
            return True, "Entertainment and pop-culture inquiries are outside the research scope of GODEYE // PYRO-SI."

        # 3. Unrelated consumer / non-scientific topics
        if re.search(r"\b(recipe\s+for|chocolate\s+chip\s+cookies|baking\s+cake|weather\s+in\s+tokyo|stock\s+market\s+tips|bitcoin\s+price)\b", clean):
            return True, "Everyday recipes, commercial finance, and general consumer topics are outside the research scope of GODEYE // PYRO-SI."

        return False, None

    def is_psi_overview(self, q: str) -> bool:
        """Identifies questions asking what NASA PSI is or general queries for NASA PSI."""
        clean = q.strip().lower()
        if clean in ("nasa psi", "psi", "psi overview", "what is psi", "what is nasa psi", "about psi", "about nasa psi", "physical sciences informatics"):
            return True
        return bool(re.search(r"\b(nasa\s+psi|what\s+is\s+(nasa\s+)?psi|explain\s+(nasa\s+)?psi|about\s+(nasa\s+)?psi|psi\s+overview|physical\s+sciences\s+informatics)\b", clean))

    def is_out_of_evidence(self, q: str) -> Tuple[bool, Optional[str]]:
        """
        Identifies queries asking about environments or phenomena for which NASA PSI has NO data,
        such as battery thermal runaway in Saturn's atmosphere, combustion in Neptune/Jupiter, etc.
        """
        clean = q.strip().lower()
        if re.search(r"\b(saturn|jupiter|uranus|neptune|venus|titan)\b", clean) and re.search(r"\b(battery|thermal\s+runaway|combustion|flame|fire)\b", clean):
            return True, "The NASA Physical Sciences Informatics (PSI) repository archives microgravity flight research conducted primarily on the International Space Station (CIR, MSG) and Cygnus vehicles in Low Earth Orbit. No experimental combustion data exists for deep planetary atmospheres (e.g. Saturn, Jupiter) or non-terrestrial atmospheric battery thermal runaway."
        if "saturn" in clean and "battery" in clean:
            return True, "No experimental flight data exists in NASA PSI for lithium battery thermal runaway in Saturn's atmosphere."
        return False, None

    def retrieve_passages(self, q: str, top_k: int = 4) -> List[RetrievedPassage]:
        """
        Hybrid retrieval across indexed investigation catalogues and records.
        """
        clean = q.strip().lower()
        results: List[RetrievedPassage] = []

        # 1. Short queries (1-2 characters, abbreviations, acronyms, or prefixes like 'd', 'b', 's', 'o2')
        if len(clean) <= 2:
            short = clean.upper()
            for inv in self.investigations:
                inv_id = (inv.get("id") or inv.get("psiId") or "").upper()
                code = (inv.get("code") or "").upper()
                title = (inv.get("title") or "").upper()
                rack = (inv.get("rackFull") or inv.get("rack") or "").upper()

                score = 0.0
                if short in ("O2", "OX"):
                    if "O2" in inv.get("variables", "") or "OXYGEN" in title or "BASS" in code or "SAFFIRE" in code:
                        score = 40.0
                elif code.startswith(short) or title.startswith(short) or inv_id.endswith(short):
                    score = 30.0
                elif short in code or short in inv_id:
                    score = 20.0
                elif short in title or short in rack:
                    score = 10.0

                if score > 0:
                    summary = inv.get("summary") or ""
                    results.append(RetrievedPassage(
                        investigation_id=inv_id,
                        title=f"{code} — {inv.get('title')}" if code else inv.get("title", ""),
                        facility=inv.get("rackFull") or inv.get("rack") or "",
                        fuel=f"{inv.get('fuelType', '')} {inv.get('fuelDetails', '')}".strip(),
                        flow_velocity=inv.get("airflowRange") or "",
                        sensors=inv.get("sensors") or "",
                        epistemic_classification=inv.get("provenance", {}).get("epistemicClassification") or "NUMERICAL_EXPERIMENTAL_DATA",
                        summary=summary,
                        doi=inv.get("doi") or "NASA PSI Repository",
                        psi_url=inv.get("psiUrl") or f"https://psi.nasa.gov/physci/repo/data/investigations/{inv_id}",
                        relevance_score=score,
                        supporting_excerpt=summary.split(". ")[0] if summary else inv.get("title", "")
                    ))

            results.sort(key=lambda x: x.relevance_score, reverse=True)
            return results[:top_k]

        STOP_WORDS = {
            "the", "is", "of", "on", "in", "at", "to", "what", "who", "how", "tell",
            "can", "you", "with", "about", "and", "for", "was", "are", "why", "does",
            "did", "from", "me", "give", "some", "any", "that", "this", "there", "which",
            "mw", "u", "pls", "please"
        }
        tokens = set(re.findall(r"\b[a-z0-9\-_]{2,}\b", clean)) - STOP_WORDS

        # Core space combustion terms that strongly signal microgravity combustion domain
        DOMAIN_TERMS = {
            "combustion", "flame", "flames", "fire", "fires", "burn", "burning",
            "microgravity", "spacecraft", "astronaut", "extinction", "quiescent",
            "diffusion", "droplet", "soot", "smoke", "suppression", "oxygen",
            "oxidizer", "pyrolysis", "fuel", "ignition", "hazard", "hazards",
            "safety", "pmma", "nomex", "sibal", "cool", "spherical", "aerosol",
            "flow", "partial", "lunar", "gravity", "space", "science"
        }

        has_domain_term = bool(tokens & DOMAIN_TERMS) or any(t in clean for t in ["combust", "flame", "fire", "burn", "micrograv", "smoke", "hazard", "space"])

        for inv in self.investigations:
            score = 0.0
            inv_id = (inv.get("id") or inv.get("psiId") or "").upper()
            code = (inv.get("code") or "").upper()
            title = inv.get("title") or ""
            rack = inv.get("rackFull") or inv.get("rack") or ""
            fuel = f"{inv.get('fuelType', '')} {inv.get('fuelDetails', '')}"
            flow = inv.get("airflowRange") or ""
            sensors = inv.get("sensors") or ""
            summary = inv.get("summary") or ""
            doi = inv.get("doi") or "NASA PSI Repository"
            psi_url = inv.get("psiUrl") or f"https://psi.nasa.gov/physci/repo/data/investigations/{inv_id}"
            epistemic = inv.get("provenance", {}).get("epistemicClassification") or "NUMERICAL_EXPERIMENTAL_DATA"

            search_corpus = f"{inv_id} {code} {title} {rack} {fuel} {flow} {sensors} {summary}".lower()

            if inv_id and inv_id.lower() in clean:
                score += 50.0
            if code and code.lower() in clean:
                score += 40.0

            for token in tokens:
                if token in search_corpus:
                    score += 5.0
                    if token in DOMAIN_TERMS:
                        score += 10.0

            if "cir" in clean and ("cir" in rack.lower() or "combustion integrated rack" in rack.lower()):
                score += 15.0
            if "msg" in clean and ("msg" in rack.lower() or "glovebox" in rack.lower()):
                score += 15.0
            if "cygnus" in clean and ("cygnus" in rack.lower() or "saffire" in code.lower()):
                score += 20.0
            if ("oxygen" in clean or "o2" in clean) and ("bass" in code.lower() or "saffire" in code.lower() or "acme" in code.lower()):
                score += 20.0
            if "spherical" in clean and ("acme" in code.lower() or "s-flame" in code.lower() or "flex" in code.lower()):
                score += 25.0
            if ("lunar" in clean or "partial" in clean) and ("bass" in code.lower() or "cir" in rack.lower()):
                score += 15.0

            # If user explicitly asked a combustion query, provide baseline points for seminal flight programs
            if has_domain_term and code in ["BASS-II", "SAFFIRE-I", "ACME", "FLEX"]:
                score += 10.0

            if score >= 10.0:
                supporting_excerpt = summary.split(". ")[0] if summary else title
                results.append(RetrievedPassage(
                    investigation_id=inv_id,
                    title=f"{code} — {title}" if code else title,
                    facility=rack,
                    fuel=fuel.strip(),
                    flow_velocity=flow,
                    sensors=sensors,
                    epistemic_classification=epistemic,
                    summary=summary,
                    doi=doi,
                    psi_url=psi_url,
                    relevance_score=score,
                    supporting_excerpt=supporting_excerpt
                ))

        results.sort(key=lambda x: x.relevance_score, reverse=True)
        return results[:top_k]

    def build_grounding_context(self, passages: List[RetrievedPassage]) -> str:
        """Formats retrieved passages into a structured evidence context for Gemini."""
        if not passages:
            return (
                "=== NASA PHYSICAL SCIENCES INFORMATICS (PSI) COMBUSTION REPOSITORY FOUNDATIONAL BASELINE ===\n"
                "The user is asking a combustion science or spacecraft fire safety inquiry.\n"
                "Ground your synthesis in NASA's documented microgravity combustion flight archives:\n"
                "• Microgravity Flame Dynamics: In 10⁻⁶ g (Gr ≈ 0), buoyant upward flow is eliminated. Transport is governed purely by radial molecular diffusion (D ∝ 1/r). Diffusion flames become spherical, dim blue, and cool.\n"
                "• Solid Material Flammability (BASS-II / PSI-25 & Saffire-I / PSI-98): Quiescent flames starve from lack of oxidizer flux and radiative loss. Low-speed forced airflow (1–20 cm/s from spacecraft ventilation systems) provides continuous oxidizer renewal and sustains creeping solid fuel combustion.\n"
                "• Droplet Burning & Low-Temperature Cool Flames (FLEX / PSI-69 & CFI / PSI-39): In the CIR, alkane droplets exhibit quasi-steady droplet combustion followed by invisible 500–800 K cool flames driven by peroxy radical chemistry.\n"
                "• Gaseous Flames & Radiation (ACME / PSI-23 & PSI-10): Spherical diffusion flames in CIR exhibit concentrated annular soot shells trapped by thermophoresis.\n"
                "• Smoke & Aerosol Detection (SAME-R / PSI-106 & DAFT / PSI-47): Measurement of submicron smoke aerosols and dust discrimination in microgravity.\n"
                "• Spacecraft Safety Standards: NASA-STD-3001 Rev F mandates [V2 6002] >=30% diluent and [V2 6003] inspired PIO2 145–155 mmHg; NASA-STD-6001B Test 1 screens upward flame propagation."
            )

        lines = ["=== AUTHENTIC NASA PHYSICAL SCIENCES INFORMATICS (PSI) RETRIEVED EVIDENCE ==="]
        for p in passages:
            lines.append(f"\n[Investigation ID: {p.investigation_id}]")
            lines.append(f"Title: {p.title}")
            lines.append(f"Flight Platform & Hardware: {p.facility}")
            lines.append(f"Fuel Specimen: {p.fuel}")
            lines.append(f"Ventilation / Airflow: {p.flow_velocity}")
            lines.append(f"Diagnostic Sensors: {p.sensors}")
            lines.append(f"Sensor Epistemology / Classification: {p.epistemic_classification}")
            lines.append(f"Investigation Summary: {p.summary}")
            lines.append(f"DOI Citation: {p.doi}")
            lines.append(f"Official NASA PSI URL: {p.psi_url}")
        return "\n".join(lines)


rag_engine = NasaRagEngine()
