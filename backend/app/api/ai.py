from fastapi import APIRouter, HTTPException

from pydantic import BaseModel

from ml.ai_pipeline import AIPipeline


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


# =====================================================
# LOAD AI PIPELINE ONCE
# =====================================================

pipeline = AIPipeline()


# =====================================================
# REQUEST
# =====================================================

class AIQueryRequest(BaseModel):

    query: str


# =====================================================
# QUERY
# =====================================================

@router.post("/query")
def ai_query(
    request: AIQueryRequest,
):

    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty",
        )

    try:

        result = pipeline.process(
            query
        )

        return result

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )