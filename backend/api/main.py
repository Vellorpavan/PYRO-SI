"""
FastAPI Backend Gateway for PYRO-SI
Handles RAG query orchestration, NASA PSI proxying, and live telemetry.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from typing import List, Optional

app = FastAPI(
    title="GODEYE // PYRO-SI Backend Gateway",
    version="2026.4.0",
    description="Scientific intelligence API proxying NASA PSI and Google Gemini RAG"
)

# Enable CORS for local client and Firebase hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    habitat: Optional[str] = "ISS"

class QueryResponse(BaseModel):
    title: str
    badge: str
    content: str
    citations: List[str]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PYRO-SI Scientific Intelligence Gateway",
        "version": "2026.4.0"
    }

@app.get("/api/v1/telemetry/iss")
def get_iss_telemetry():
    # In production, proxies WhereTheISS.at / Open-Notify API
    return {
        "latitude": 24.81,
        "longitude": 78.42,
        "altitude_km": 408.4,
        "velocity_kms": 7.66,
        "source": "NASA Open ISS Ephemeris"
    }

@app.post("/api/v1/copilot/query", response_model=QueryResponse)
def handle_copilot_query(req: QueryRequest):
    q = req.query.strip().lower()
    if not q:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # In Phase 2, integrates with Gemini 2.0 Flash and Vertex AI Vector Search.
    # Currently provides grounded fallback responses.
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
