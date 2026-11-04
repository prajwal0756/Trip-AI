import os
import secrets

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

from ml.ai_pipeline import AIPipeline

app = FastAPI(
    title="Ghumantey AI Service",
    description="Isolated AI recommendation service",
    version="1.0.0",
)

AI_SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN")

if not AI_SERVICE_TOKEN:
    raise RuntimeError("AI_SERVICE_TOKEN environment variable is missing")

pipeline = None


class QueryRequest(BaseModel):
    query: str


def get_pipeline():
    global pipeline

    if pipeline is None:
        pipeline = AIPipeline()

    return pipeline


@app.get("/")
def health_check():
    return {"status": "AI service is running"}


@app.post("/ai/query")
def ai_query(
    request: QueryRequest,
    authorization: str = Header(default=""),
):
    expected = f"Bearer {AI_SERVICE_TOKEN}"

    if not secrets.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        return get_pipeline().process(request.query)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="AI recommendation processing failed",
        )