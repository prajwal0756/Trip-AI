from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.review import Review
from app.models.destination import Destination
from app.schemas.review import ReviewCreate, ReviewResponse


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"],
)


@router.post(
    "/",
    response_model=ReviewResponse,
)
def create_review(
    request: ReviewCreate,
    db: Session = Depends(get_db),
):
    destination = (
        db.query(Destination)
        .filter(
            Destination.destination_id ==
            request.destination_id
        )
        .first()
    )

    if not destination:
        raise HTTPException(
            status_code=404,
            detail="Destination not found.",
        )

    review = Review(
        user_id=request.user_id,
        destination_id=request.destination_id,
        review_text=request.review_text,
        rating_value=request.rating_value,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@router.get(
    "/destination/{destination_id}",
    response_model=list[ReviewResponse],
)
def get_destination_reviews(
    destination_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(Review)
        .filter(
            Review.destination_id == destination_id
        )
        .order_by(
            Review.review_date.desc()
        )
        .all()
    )