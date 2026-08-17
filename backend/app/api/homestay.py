from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.homestay import Homestay
from app.schemas.homestay import HomestayResponse
from app.services.homestay_service import search_homestays


router = APIRouter(
    prefix="/homestays",
    tags=["Homestays"],
)


# =====================================================
# SEARCH HOMESTAYS
# =====================================================

@router.get(
    "/search",
    response_model=list[HomestayResponse],
)
def search(
    q: str,
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return search_homestays(
        db,
        q,
        limit,
    )


# =====================================================
# ALL HOMESTAYS
# =====================================================

@router.get(
    "/",
    response_model=list[HomestayResponse],
)
def get_homestays(
    district: str | None = Query(default=None),
    province: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Homestay)

    if district:
        query = query.filter(
            Homestay.district.ilike(
                district.strip()
            )
        )

    if province:
        query = query.filter(
            Homestay.province.ilike(
                province.strip()
            )
        )

    return (
        query
        .order_by(
            Homestay.rating.desc().nullslast(),
            Homestay.review_count.desc().nullslast(),
        )
        .limit(limit)
        .all()
    )


# =====================================================
# HOMESTAYS BY DISTRICT
# =====================================================

@router.get(
    "/district/{district}",
    response_model=list[HomestayResponse],
)
def get_homestays_by_district(
    district: str,
    limit: int = Query(default=6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    return (
        db.query(Homestay)
        .filter(
            Homestay.district.ilike(
                district.strip()
            )
        )
        .order_by(
            Homestay.rating.desc().nullslast(),
            Homestay.review_count.desc().nullslast(),
        )
        .limit(limit)
        .all()
    )