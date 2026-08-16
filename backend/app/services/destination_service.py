from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc, func

from app.models.destination import Destination


# =====================================================
# GET ALL DESTINATIONS
# =====================================================

def get_all_destinations(
    db: Session,
    page: int = 1,
    limit: int = 20,
):
    offset = (page - 1) * limit

    return (
        db.query(Destination)
        .order_by(Destination.destination_id)
        .offset(offset)
        .limit(limit)
        .all()
    )


# =====================================================
# GET DESTINATION BY ID
# =====================================================

def get_destination_by_id(
    db: Session,
    destination_id: int,
):
    return (
        db.query(Destination)
        .filter(
            Destination.destination_id == destination_id
        )
        .first()
    )


# =====================================================
# SEARCH DESTINATIONS
# =====================================================

def search_destinations(
    db: Session,
    query: str,
):
    search = f"%{query.strip()}%"

    return (
        db.query(Destination)
        .filter(
            or_(
                Destination.destination_name.ilike(search),
                Destination.district.ilike(search),
                Destination.province.ilike(search),
                Destination.region.ilike(search),
                Destination.category.ilike(search),
                Destination.travel_type.ilike(search),
                Destination.activities_text.ilike(search),
                Destination.description.ilike(search),
            )
        )
        .order_by(
            Destination.popularity_score.desc()
        )
        .all()
    )


# =====================================================
# FILTER DESTINATIONS
# =====================================================

def filter_destinations(
    db: Session,
    province: str | None = None,
    district: str | None = None,
    category: str | None = None,
    travel_type: str | None = None,
    difficulty: str | None = None,
    best_season: str | None = None,
    family_friendly: str | None = None,
    budget_min: int | None = None,
    budget_max: int | None = None,
):
    query = db.query(Destination)

    if province:
        query = query.filter(
            Destination.province.ilike(province)
        )

    if district:
        query = query.filter(
            Destination.district.ilike(district)
        )

    if category:
        query = query.filter(
            Destination.category.ilike(category)
        )

    if travel_type:
        query = query.filter(
            Destination.travel_type.ilike(travel_type)
        )

    if difficulty:
        query = query.filter(
            Destination.difficulty_level.ilike(difficulty)
        )

    if best_season:
        query = query.filter(
            Destination.best_season.ilike(best_season)
        )

    if family_friendly:
        query = query.filter(
            Destination.family_friendly.ilike(
                family_friendly
            )
        )

    if budget_min is not None:
        query = query.filter(
            Destination.estimated_budget_npr >= budget_min
        )

    if budget_max is not None:
        query = query.filter(
            Destination.estimated_budget_npr <= budget_max
        )

    return (
        query
        .order_by(Destination.popularity_score.desc())
        .all()
    )


# =====================================================
# POPULAR DESTINATIONS
# =====================================================

def get_popular_destinations(
    db: Session,
    limit: int = 10,
):
    return (
        db.query(Destination)
        .order_by(
            desc(Destination.popularity_score)
        )
        .limit(limit)
        .all()
    )


# =====================================================
# TOP RATED DESTINATIONS
# =====================================================

def get_top_rated_destinations(
    db: Session,
    limit: int = 10,
):
    return (
        db.query(Destination)
        .order_by(
            desc(Destination.average_rating)
        )
        .limit(limit)
        .all()
    )


# =====================================================
# BUDGET DESTINATIONS
# =====================================================

def get_budget_destinations(
    db: Session,
    limit: int = 10,
):
    return (
        db.query(Destination)
        .filter(
            Destination.estimated_budget_npr.isnot(None)
        )
        .order_by(
            asc(Destination.estimated_budget_npr)
        )
        .limit(limit)
        .all()
    )


# =====================================================
# PROVINCES
# =====================================================

def get_provinces(db: Session):

    rows = (
        db.query(Destination.province)
        .filter(Destination.province.isnot(None))
        .distinct()
        .order_by(Destination.province)
        .all()
    )

    return [
        row[0]
        for row in rows
    ]


# =====================================================
# DISTRICTS
# =====================================================

def get_districts(db: Session):

    rows = (
        db.query(Destination.district)
        .filter(Destination.district.isnot(None))
        .distinct()
        .order_by(Destination.district)
        .all()
    )

    return [
        row[0]
        for row in rows
    ]


# =====================================================
# CATEGORIES
# =====================================================

def get_categories(db: Session):

    rows = (
        db.query(Destination.category)
        .filter(Destination.category.isnot(None))
        .distinct()
        .order_by(Destination.category)
        .all()
    )

    return [
        row[0]
        for row in rows
    ]


# =====================================================
# TRAVEL TYPES
# =====================================================

def get_travel_types(db: Session):

    rows = (
        db.query(Destination.travel_type)
        .filter(Destination.travel_type.isnot(None))
        .distinct()
        .order_by(Destination.travel_type)
        .all()
    )

    return [
        row[0]
        for row in rows
    ]


# =====================================================
# STATISTICS
# =====================================================

def get_destination_statistics(
    db: Session,
):

    total = (
        db.query(
            func.count(
                Destination.destination_id
            )
        )
        .scalar()
    )

    provinces = (
        db.query(Destination.province)
        .filter(Destination.province.isnot(None))
        .distinct()
        .count()
    )

    districts = (
        db.query(Destination.district)
        .filter(Destination.district.isnot(None))
        .distinct()
        .count()
    )

    categories = (
        db.query(Destination.category)
        .filter(Destination.category.isnot(None))
        .distinct()
        .count()
    )

    return {
        "total_destinations": total or 0,
        "total_provinces": provinces,
        "total_districts": districts,
        "total_categories": categories,
    }


# =====================================================
# SIMILAR DESTINATIONS
# =====================================================

def get_similar_destinations(
    db: Session,
    destination_id: int,
):
    """
    Temporary database fallback.

    The real AI similarity model will be connected
    to this endpoint after the basic API is stable.
    """

    return (
        db.query(Destination)
        .filter(
            Destination.destination_id != destination_id
        )
        .order_by(
            Destination.popularity_score.desc()
        )
        .limit(5)
        .all()
    )