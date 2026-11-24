from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.review import router as review_router
from app.api.destination import router as destination_router
from app.api.recommendation import router as recommendation_router
from app.api.ai import router as ai_router
from app.api.homestay import router as homestay_router
from app.api.search_history import router as search_history_router
from app.api.booking import router as booking_router
from app.api.owner import router as owner_router


app = FastAPI(
    title="TripAI API",
    version="1.0.0",
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# API ROUTERS
# =====================================================

app.include_router(auth_router)
app.include_router(destination_router)
app.include_router(recommendation_router)
app.include_router(ai_router)
app.include_router(homestay_router)

app.include_router(owner_router)
app.include_router(search_history_router)
app.include_router(booking_router)
app.include_router(review_router)


# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():

    return {
        "message": "TripAI API is running"
    }