import os
import sys

# Ensure parent and nlp directories are in sys.path
nlp_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(nlp_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if nlp_dir not in sys.path:
    sys.path.insert(0, nlp_dir)

import nlp

from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
try:
    from tripai.nlp.orchestrator import NLPOrchestrator
except ModuleNotFoundError:
    from nlp.orchestrator import NLPOrchestrator

# Initialize FastAPI App
app = FastAPI(
    title="TripAI NLP Intent Extraction Service",
    description="Microservice that parses natural language travel queries into structured intents.",
    version="1.0.0"
)

# Global orchestrator instance (lazy-loaded on startup)
orchestrator = None

@app.on_event("startup")
def startup_event():
    global orchestrator
    dataset_path = os.environ.get("TRIPAI_DATASET_PATH", None)
    orchestrator = NLPOrchestrator(dataset_path=dataset_path)

# Request Models
class ParseRequest(BaseModel):
    text: str = Field(..., description="Raw text input from the user", example="Pokhara for 3 days on a budget of 20000 rupees")
    conversation_history: Optional[List[Dict[str, Any]]] = Field(default=None, description="Optional conversation history for multi-turn parsing")

# Response Models
class ParseResponse(BaseModel):
    destination: Optional[str] = Field(None, description="Extracted named destination")
    district: Optional[str] = Field(None, description="Extracted district name matching dataset")
    province: Optional[str] = Field(None, description="Extracted province name matching dataset")
    duration_days: Optional[int] = Field(None, description="Extracted average duration in days")
    budget_npr: Optional[int] = Field(None, description="Extracted estimated budget in Nepalese Rupees")
    group_type: Optional[str] = Field(None, description="solo | family | friends | couple | null")
    category: Optional[str] = Field(None, description="Category matching dataset field")
    activities: List[str] = Field(default_factory=list, description="Array of matching activities from dataset")
    difficulty_level: Optional[str] = Field(None, description="easy | moderate | hard | null")
    mood_tags: List[str] = Field(default_factory=list, description="Extracted mood tag preferences")
    semantic_query: str = Field(..., description="Cleaned version of query for vector search")
    trick_or_ambiguous: bool = Field(..., description="True if query is nonsensical, conflicting, or adversarial")
    confidence: float = Field(..., description="Confidence score between 0 and 1")
    missing_fields: List[str] = Field(default_factory=list, description="List of required but missing fields")
    
    # Extra performance diagnostics (fully compatible with JSON response)
    resolved_layer: Optional[int] = Field(None, description="The routing layer that resolved the query")
    latency_ms: Optional[int] = Field(None, description="Execution time in milliseconds")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "TripAI NLP Intent Extraction",
        "dataset_configured": orchestrator.loader.dataset_path if orchestrator else None
    }

@app.post("/nlp/parse", response_model=ParseResponse)
def parse_intent(request: ParseRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Request text cannot be empty.")
    
    try:
        result = orchestrator.route_and_parse(request.text)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal parsing error: {str(e)}")
