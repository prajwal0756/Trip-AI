from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User

from app.schemas.search_history import (
    SearchHistoryCreate,
    SearchHistoryResponse,
)

from app.services.search_history_service import (
    create_search_history,
    get_search_history,
    delete_search_history,
)


router = APIRouter(
    prefix="/search-history",
    tags=["Search History"],
)


# =====================================================
# SAVE SEARCH
# =====================================================

@router.post(
    "/",
    response_model=SearchHistoryResponse,
)
def save_search(
    data: SearchHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    return create_search_history(
        db=db,
        user_id=current_user.user_id,
        query=data.query,
        search_type=data.search_type,
    )


# =====================================================
# GET USER SEARCH HISTORY
# =====================================================

@router.get(
    "/",
    response_model=list[SearchHistoryResponse],
)
def search_history(
    limit: int = Query(
        default=10,
        ge=1,
        le=50,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_search_history(
        db=db,
        user_id=current_user.user_id,
        limit=limit,
    )


# =====================================================
# DELETE USER SEARCH HISTORY
# =====================================================

@router.delete("/")
def clear_search_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    delete_search_history(
        db=db,
        user_id=current_user.user_id,
    )

    return {
        "message": "Search history cleared successfully"
    }
