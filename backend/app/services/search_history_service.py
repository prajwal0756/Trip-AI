from sqlalchemy.orm import Session

from app.models.search_history import SearchHistory


def create_search_history(
    db: Session,
    user_id: int,
    query: str,
    search_type: str = "destination",
):
    query = query.strip()

    if not query:
        return None

    history = SearchHistory(
        user_id=user_id,
        query=query,
        search_type=search_type,
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history


def get_search_history(
    db: Session,
    user_id: int,
    limit: int = 10,
):
    return (
        db.query(SearchHistory)
        .filter(
            SearchHistory.user_id == user_id
        )
        .order_by(
            SearchHistory.created_at.desc()
        )
        .limit(limit)
        .all()
    )


def delete_search_history(
    db: Session,
    user_id: int,
):
    (
        db.query(SearchHistory)
        .filter(
            SearchHistory.user_id == user_id
        )
        .delete(
            synchronize_session=False
        )
    )

    db.commit()
