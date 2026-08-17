from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.homestay import Homestay


def get_homestays(
    db: Session,
    district: str | None = None,
    province: str | None = None,
    limit: int = 20,
):
    query = db.query(Homestay)

    if district:
        query = query.filter(
            Homestay.district.ilike(district)
        )

    if province:
        query = query.filter(
            Homestay.province.ilike(province)
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
# SEARCH HOMESTAYS
# =====================================================

def search_homestays(
    db: Session,
    query: str,
    limit: int = 50,
):
    search = f"%{query.strip()}%"

    return (
        db.query(Homestay)
        .filter(
            or_(
                Homestay.homestay_name.ilike(search),
                Homestay.district.ilike(search),
                Homestay.province.ilike(search),
                Homestay.municipality.ilike(search),
                Homestay.address.ilike(search),
                Homestay.key_feature_vibe.ilike(search),
                Homestay.amenities.ilike(search),
                Homestay.activities.ilike(search),
                Homestay.nearby_attractions.ilike(search),
                Homestay.homestay_type.ilike(search),
                Homestay.description.ilike(search),
            )
        )
        .order_by(
            Homestay.rating.desc().nullslast(),
            Homestay.review_count.desc().nullslast(),
        )
        .limit(limit)
        .all()
    )


def get_homestay(
    db: Session,
    homestay_id: str,
):
    return (
        db.query(Homestay)
        .filter(Homestay.homestay_id == homestay_id)
        .first()
    )


def get_nearby_homestays(
    db: Session,
    district: str,
    limit: int = 6,
):
    return (
        db.query(Homestay)
        .filter(Homestay.district.ilike(district))
        .order_by(
            Homestay.rating.desc().nullslast(),
            Homestay.review_count.desc().nullslast(),
        )
        .limit(limit)
        .all()
    )