# from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.destination import Destination

from app.core.database import get_db

from app.schemas.destination import (
    DestinationList,
    DestinationDetail,
)

from app.services.destination_service import (
    get_all_destinations,
    get_destination_by_id,
    search_destinations,
    filter_destinations,
    get_popular_destinations,
    get_top_rated_destinations,
    get_budget_destinations,
    get_provinces,
    get_districts,
    get_categories,
    get_travel_types,
    get_destination_statistics,
    get_similar_destinations,
)

router = APIRouter(
    prefix="/destinations",
    tags=["Destinations"],
)

# =====================================================
# Search
# =====================================================

@router.get("/search", response_model=list[DestinationList])
def search(
    q: str,
    db: Session = Depends(get_db),
):
    return search_destinations(db, q)


# =====================================================
# Filter
# =====================================================

@router.get("/filter", response_model=list[DestinationList])
def filter_destination(
    province: str | None = None,
    district: str | None = None,
    category: str | None = None,
    travel_type: str | None = None,
    difficulty: str | None = None,
    best_season: str | None = None,
    family_friendly: str | None = None,
    budget_min: int | None = None,
    budget_max: int | None = None,
    db: Session = Depends(get_db),
):
    return filter_destinations(
        db,
        province,
        district,
        category,
        travel_type,
        difficulty,
        best_season,
        family_friendly,
        budget_min,
        budget_max,
    )


# =====================================================
# Popular
# =====================================================

@router.get("/popular", response_model=list[DestinationList])
def popular(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return get_popular_destinations(db, limit)


# =====================================================
# Top Rated
# =====================================================

@router.get("/top-rated", response_model=list[DestinationList])
def top_rated(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return get_top_rated_destinations(db, limit)


# =====================================================
# Budget Friendly
# =====================================================

@router.get("/budget", response_model=list[DestinationList])
def budget(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return get_budget_destinations(db, limit)


# =====================================================
# Metadata
# =====================================================

@router.get("/provinces")
def provinces(
    db: Session = Depends(get_db),
):
    return get_provinces(db)


@router.get("/districts")
def districts(
    db: Session = Depends(get_db),
):
    return get_districts(db)


@router.get("/categories")
def categories(
    db: Session = Depends(get_db),
):
    return get_categories(db)


@router.get("/travel-types")
def travel_types(
    db: Session = Depends(get_db),
):
    return get_travel_types(db)


# =====================================================
# Statistics
# =====================================================

@router.get("/statistics")
def statistics(
    db: Session = Depends(get_db),
):
    return get_destination_statistics(db)


# =====================================================
# All Destinations
# =====================================================

@router.get("/", response_model=list[DestinationList])
def all_destinations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return get_all_destinations(
        db,
        page,
        limit,
    )


# =====================================================
# Destination Detail
# =====================================================

@router.get(
    "/{destination_id}",
    response_model=DestinationDetail
)
def destination(
    destination_id: int,
    db: Session = Depends(get_db),
):

    destination = get_destination_by_id(
        db,
        destination_id,
    )

    if destination is None:
        raise HTTPException(
            status_code=404,
            detail="Destination not found",
        )

    # ---------------------------------------------
    # Images
    # ---------------------------------------------

    images = []

    for image in destination.images:

        images.append({
            "image_id": image.image_id,
            "destination_id": image.destination_id,
            "image_url": image.image_url,
            "image_type": image.image_type,
        })



# ---------------------------------------------
# Categories
# ---------------------------------------------


    categories = []

    for mapping in destination.categories:

        if mapping.category:

            categories.append({
                "category_id": mapping.category.category_id,
                "category": mapping.category.category,
            })


# ---------------------------------------------
# Activities
# ---------------------------------------------

    activities = []

    for mapping in destination.activity_mappings:

        if mapping.activity:

            activities.append({
                "activity_id": mapping.activity.activity_id,
                "activities": mapping.activity.activities,
                "difficulty_level": mapping.activity.difficulty_level,
            })
            

    # ---------------------------------------------
    # Build response
    # ---------------------------------------------

    return {
        "destination_id":
            destination.destination_id,

        "destination_name":
            destination.destination_name,

        "district":
            destination.district,

        "province":
            destination.province,

        "region":
            destination.region,

        "description":
            destination.description,

        "best_season":
            destination.best_season,

        "travel_type":
            destination.travel_type,

        "estimated_budget_npr":
            destination.estimated_budget_npr,

        "average_duration_days":
            destination.average_duration_days,

        "difficulty_level":
            destination.difficulty_level,

        "family_friendly":
            destination.family_friendly,

        "latitude":
            destination.latitude,

        "longitude":
            destination.longitude,

        "average_rating":
            destination.average_rating,

        "review_count":
            destination.review_count,

        "popularity_score":
            destination.popularity_score,

        "images":
            images,

        "categories":
            categories,

        "activities":
            activities,
    }


# =====================================================
# Similar Destinations
# =====================================================

@router.get("/{destination_id}", response_model=DestinationDetail)
def destination(
    destination_id: int,
    db: Session = Depends(get_db),
):

    destination = get_destination_by_id(
        db,
        destination_id,
    )

    if destination is None:
        raise HTTPException(
            status_code=404,
            detail="Destination not found",
        )

    # ---------------------------------------------
    # Images
    # ---------------------------------------------

    images = []

    for image in destination.images:
        images.append({
            "image_id": image.image_id,
            "image_url": image.image_url,
            "image_type": image.image_type,
        })

    # ---------------------------------------------
    # Categories
    # ---------------------------------------------

    categories = []

    for mapping in destination.categories:

        if mapping.category:

            categories.append({
                "category_id": mapping.category.category_id,
                "category": mapping.category.category,
            })

    # ---------------------------------------------
    # Activities
    # ---------------------------------------------

    activities = []

    for mapping in destination.activity_mappings:

        if mapping.activity:

            activities.append({
                "activity_id": mapping.activity.activity_id,
                "activities": mapping.activity.activities,
                "difficulty_level": mapping.activity.difficulty_level,
            })

    # ---------------------------------------------
    # Build response
    # ---------------------------------------------

    return {
        "destination_id": destination.destination_id,
        "destination_name": destination.destination_name,
        "district": destination.district,
        "province": destination.province,
        "region": destination.region,
        "description": destination.description,
        "best_season": destination.best_season,
        "travel_type": destination.travel_type,
        "estimated_budget_npr": destination.estimated_budget_npr,
        "average_duration_days": destination.average_duration_days,
        "difficulty_level": destination.difficulty_level,
        "family_friendly": destination.family_friendly,
        "latitude": destination.latitude,
        "longitude": destination.longitude,
        "average_rating": destination.average_rating,
        "review_count": destination.review_count,
        "popularity_score": destination.popularity_score,
        "images": images,
        "categories": categories,
        "activities": activities,
    }