from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func, case

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
    search_text = query.strip()

    if not search_text:
        return []

    search = f"%{search_text}%"

    # -------------------------------------------------
    # First try to find the exact destination.
    # This allows us to find its district and return
    # nearby destinations from the same district.
    # -------------------------------------------------

    target = (
        db.query(Destination)
        .filter(
            func.lower(
                Destination.destination_name
            ) == search_text.lower()
        )
        .first()
    )

    target_district = None

    if target:
        target_district = target.district

    # -------------------------------------------------
    # Search results
    # -------------------------------------------------

    conditions = [
        Destination.destination_name.ilike(search),
        Destination.district.ilike(search),
        Destination.province.ilike(search),
        Destination.region.ilike(search),
        Destination.category.ilike(search),
        Destination.travel_type.ilike(search),
        Destination.activities_text.ilike(search),
        Destination.description.ilike(search),
    ]

    # If exact destination exists, also include
    # destinations from the same district.
    if target_district:
        conditions.append(
            Destination.district.ilike(target_district)
        )

    # -------------------------------------------------
    # Relevance ordering
    #
    # 0 = exact destination
    # 1 = same district
    # 2 = other search matches
    # -------------------------------------------------

    relevance_order = case(
        (
            func.lower(
                Destination.destination_name
            ) == search_text.lower(),
            0,
        ),
        (
            target_district is not None,
            case(
                (
                    func.lower(
                        Destination.district
                    ) == target_district.lower(),
                    1,
                ),
                else_=2,
            ),
        ),
        else_=2,
    )

    return (
        db.query(Destination)
        .filter(or_(*conditions))
        .order_by(
            relevance_order.asc(),
            Destination.popularity_score.desc(),
            Destination.average_rating.desc(),
        )
        .limit(20)
        .all()
    )

    # -------------------------------------------------
    # Find direct text matches
    # -------------------------------------------------

    direct_matches = (
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
            desc(Destination.popularity_score),
            desc(Destination.average_rating),
        )
        .all()
    )

    if not direct_matches:
        return []

    # -------------------------------------------------
    # Choose best matching destination as reference
    # -------------------------------------------------

    exact_name_match = next(
        (
            destination
            for destination in direct_matches
            if destination.destination_name
            and destination.destination_name.lower().strip()
            == cleaned_query.lower()
        ),
        None,
    )

    reference = exact_name_match or direct_matches[0]

    # -------------------------------------------------
    # Start result list with direct matches
    # -------------------------------------------------

    results = []
    seen_ids = set()

    # Exact name first
    if exact_name_match:
        results.append(exact_name_match)
        seen_ids.add(exact_name_match.destination_id)

    # Other direct text matches
    for destination in direct_matches:
        if destination.destination_id not in seen_ids:
            results.append(destination)
            seen_ids.add(destination.destination_id)

    # -------------------------------------------------
    # Find nearby destinations
    #
    # Uses simple latitude/longitude distance.
    # This is sufficient for TripAI search ranking.
    # -------------------------------------------------

    if (
        reference.latitude is not None
        and reference.longitude is not None
    ):
        nearby = (
            db.query(Destination)
            .filter(
                Destination.destination_id
                != reference.destination_id,

                Destination.latitude.isnot(None),
                Destination.longitude.isnot(None),
            )
            .order_by(
                (
                    func.power(
                        Destination.latitude
                        - reference.latitude,
                        2,
                    )
                    +
                    func.power(
                        Destination.longitude
                        - reference.longitude,
                        2,
                    )
                ).asc()
            )
            .limit(10)
            .all()
        )

        # -------------------------------------------------
        # Add nearby destinations
        #
        # Prefer same district first.
        # -------------------------------------------------

        same_district = [
            destination
            for destination in nearby
            if destination.district
            and reference.district
            and destination.district.lower().strip()
            == reference.district.lower().strip()
        ]

        other_nearby = [
            destination
            for destination in nearby
            if destination not in same_district
        ]

        for destination in same_district + other_nearby:
            if destination.destination_id not in seen_ids:
                results.append(destination)
                seen_ids.add(destination.destination_id)

    # -------------------------------------------------
    # Limit search result size
    # -------------------------------------------------

    return results[:20]


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
        .order_by(
            Destination.popularity_score.desc()
        )
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
# BUDGET FRIENDLY DESTINATIONS
# =====================================================

def get_budget_destinations(
    db: Session,
    limit: int = 10,
):
    return (
        db.query(Destination)
        .order_by(
            Destination.estimated_budget_npr.asc()
        )
        .limit(limit)
        .all()
    )


# =====================================================
# METADATA
# =====================================================

def get_provinces(db: Session):
    return (
        db.query(Destination.province)
        .distinct()
        .order_by(Destination.province)
        .all()
    )


def get_districts(db: Session):
    return (
        db.query(Destination.district)
        .distinct()
        .order_by(Destination.district)
        .all()
    )


def get_categories(db: Session):
    return (
        db.query(Destination.category)
        .distinct()
        .order_by(Destination.category)
        .all()
    )


def get_travel_types(db: Session):
    return (
        db.query(Destination.travel_type)
        .distinct()
        .order_by(Destination.travel_type)
        .all()
    )


# =====================================================
# STATISTICS
# =====================================================

def get_destination_statistics(db: Session):
    total = (
        db.query(
            func.count(Destination.destination_id)
        ).scalar()
    )

    provinces = (
        db.query(Destination.province)
        .distinct()
        .count()
    )

    districts = (
        db.query(Destination.district)
        .distinct()
        .count()
    )

    categories = (
        db.query(Destination.category)
        .distinct()
        .count()
    )

    return {
        "total_destinations": total,
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
    Temporary similar-destination function.

    Finds destinations from the same district
    or province. Later this can be replaced
    with the recommendation model.
    """

    destination = (
        db.query(Destination)
        .filter(
            Destination.destination_id == destination_id
        )
        .first()
    )

    if not destination:
        return []

    query = (
        db.query(Destination)
        .filter(
            Destination.destination_id != destination_id
        )
    )

    if destination.district:
        query = query.filter(
            Destination.district.ilike(
                destination.district
            )
        )

    results = (
        query
        .order_by(
            Destination.popularity_score.desc(),
            Destination.average_rating.desc(),
        )
        .limit(6)
        .all()
    )

    return results