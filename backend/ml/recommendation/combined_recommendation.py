from pathlib import Path

import pandas as pd
import joblib

from ml.embeddings.embedding_service import EmbeddingService


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

CSV_PATH = (
    BASE_DIR
    / "app"
    / "ai"
    / "recommendation"
    / "database.csv"
)

PKL_PATH = (
    BASE_DIR
    / "app"
    / "ai"
    / "recommendation"
    / "destination_similarity.pkl"
)


# ============================================================
# LOAD DATA / MODELS
# ============================================================

print("Loading recommendation data...")

df = pd.read_csv(CSV_PATH)

destination_similarity = joblib.load(PKL_PATH)

embedding_service = EmbeddingService()

print(
    f"Recommendation dataset loaded: {len(df)} destinations"
)


# ============================================================
# HELPERS
# ============================================================

def normalize_text(value):
    if value is None:
        return ""

    if pd.isna(value):
        return ""

    return str(value).strip().lower()


def safe_float(value, default=None):
    try:
        if value is None or pd.isna(value):
            return default

        return float(value)

    except (ValueError, TypeError):
        return default


def min_max_normalize(series):

    series = pd.to_numeric(
        series,
        errors="coerce"
    ).fillna(0)

    minimum = series.min()
    maximum = series.max()

    if maximum == minimum:
        return pd.Series(
            1.0,
            index=series.index
        )

    return (
        (series - minimum)
        /
        (maximum - minimum)
    )


def contains_any(value, values):

    value = normalize_text(value)

    if not value:
        return False

    if not values:
        return False

    return any(
        normalize_text(item) in value
        for item in values
    )


# ============================================================
# EXISTING FEATURE RECOMMENDATION
# ============================================================

def feature_recommend(
    destination_name: str,
    top_n: int = 10
):

    destination_name = normalize_text(
        destination_name
    )

    names = (
        df["destination_name"]
        .fillna("")
        .astype(str)
        .str.strip()
        .str.lower()
    )

    matches = df.index[
        names == destination_name
    ]

    if len(matches) == 0:

        raise ValueError(
            f"Destination '{destination_name}' not found."
        )

    idx = matches[0]

    similarity_scores = list(
        enumerate(
            destination_similarity[idx]
        )
    )

    similarity_scores.sort(
        key=lambda x: x[1],
        reverse=True
    )

    # Remove original destination
    similarity_scores = (
        similarity_scores[
            1:top_n + 1
        ]
    )

    indices = [
        item[0]
        for item in similarity_scores
    ]

    recommendations = df.iloc[
        indices
    ].copy()

    recommendations[
        "feature_similarity"
    ] = [
        item[1]
        for item in similarity_scores
    ]

    return recommendations


# ============================================================
# FEATURE SCORE
# ============================================================

def calculate_feature_score(
    recommendations
):

    recommendations = recommendations.copy()

    recommendations["feature_score"] = (
        recommendations[
            "feature_similarity"
        ] * 0.6

        +

        recommendations[
            "average_rating"
        ].astype(float)
        / 5.0
        * 0.2

        +

        recommendations[
            "popularity_score"
        ].astype(float)
        / 100.0
        * 0.2
    )

    return recommendations


# ============================================================
# SEMANTIC RECOMMENDATION
# ============================================================

def semantic_recommend(
    destination_name: str,
    top_n: int = 10
):

    destination_name = normalize_text(
        destination_name
    )

    names = (
        df["destination_name"]
        .fillna("")
        .astype(str)
        .str.strip()
        .str.lower()
    )

    matches = df.index[
        names == destination_name
    ]

    if len(matches) == 0:

        raise ValueError(
            f"Destination '{destination_name}' not found."
        )

    idx = matches[0]

    query = df.loc[
        idx,
        "description"
    ]

    results = embedding_service.search(
        query,
        top_n=top_n + 1
    )

    results = results[
        results[
            "destination_name"
        ]
        .fillna("")
        .astype(str)
        .str.strip()
        .str.lower()
        != destination_name
    ]

    return results.head(top_n)


# ============================================================
# COMBINED DESTINATION RECOMMENDATION
# ============================================================

def combined_recommend(
    destination_name: str,
    top_n: int = 10
):

    feature_results = feature_recommend(
        destination_name,
        top_n
    )

    feature_results = calculate_feature_score(
        feature_results
    )

    semantic_results = semantic_recommend(
        destination_name,
        top_n
    )

    combined = pd.merge(
        feature_results[
            [
                "destination_name",
                "feature_score"
            ]
        ],

        semantic_results[
            [
                "destination_name",
                "similarity_score"
            ]
        ],

        on="destination_name",
        how="outer"
    )

    combined["feature_score"] = (
        combined["feature_score"]
        .fillna(0)
    )

    combined["semantic_score"] = (
        combined["similarity_score"]
        .fillna(0)
    )

    combined["feature_score_norm"] = (
        min_max_normalize(
            combined["feature_score"]
        )
    )

    combined["semantic_score_norm"] = (
        min_max_normalize(
            combined["semantic_score"]
        )
    )

    combined["combined_score"] = (
        combined[
            "semantic_score_norm"
        ] * 0.55

        +

        combined[
            "feature_score_norm"
        ] * 0.30

        +

        combined[
            "feature_score_norm"
        ] * 0.15
    )

    combined = combined.sort_values(
        by="combined_score",
        ascending=False
    )

    return combined.head(
        top_n
    ).reset_index(
        drop=True
    )


# ============================================================
# QUERY-BASED AI RECOMMENDATION
# ============================================================

def query_recommend(
    query: str,
    nlp_result: dict,
    top_n: int = 10
):
    """
    Natural-language AI recommendation.

    The user can write things such as:

        "I want a peaceful 3 day trip near Pokhara
         with mountain views and local food"

    The system combines:

        NLP preferences
        +
        semantic embeddings
        +
        structured preference matching
        +
        rating
        +
        popularity
    """

    query = query.strip()

    # ========================================================
    # 1. RETRIEVE BROAD SEMANTIC CANDIDATES
    # ========================================================

    # IMPORTANT:
    # Do not apply every NLP field as a hard filter.
    #
    # Semantic retrieval should first find destinations
    # that are generally related to the user's request.

    semantic_results = embedding_service.search(
        query=query,
        top_n=min(
            100,
            len(df)
        ),
        filters=None
    )

    if semantic_results.empty:

        return pd.DataFrame()

    # ========================================================
    # 2. MERGE WITH COMPLETE DESTINATION DATA
    # ========================================================

    candidates = pd.merge(
        semantic_results[
            [
                "destination_id",
                "destination_name",
                "similarity_score"
            ]
        ],

        df,

        on=[
            "destination_id",
            "destination_name"
        ],

        how="inner"
    )

    if candidates.empty:

        return pd.DataFrame()

    # ========================================================
    # 3. INITIAL SCORE
    # ========================================================

    candidates["semantic_score"] = (
        pd.to_numeric(
            candidates[
                "similarity_score"
            ],
            errors="coerce"
        )
        .fillna(0)
    )

    # ========================================================
    # 4. SEMANTIC NORMALIZATION
    # ========================================================

    candidates[
        "semantic_score_norm"
    ] = min_max_normalize(
        candidates[
            "semantic_score"
        ]
    )

    # ========================================================
    # 5. PREFERENCE SCORE
    # ========================================================

    candidates[
        "preference_score"
    ] = 0.0

    # --------------------------------------------------------
    # Location
    # --------------------------------------------------------

    district = nlp_result.get(
        "district"
    )

    province = nlp_result.get(
        "province"
    )

    location = nlp_result.get(
        "location"
    )

    destination = nlp_result.get(
        "destination"
    )

    if district:

        district_mask = (
            candidates["district"]
            .fillna("")
            .astype(str)
            .str.strip()
            .str.lower()
            ==
            normalize_text(district)
        )

        candidates.loc[
            district_mask,
            "preference_score"
        ] += 0.25

    elif province:

        province_mask = (
            candidates["province"]
            .fillna("")
            .astype(str)
            .str.strip()
            .str.lower()
            ==
            normalize_text(province)
        )

        candidates.loc[
            province_mask,
            "preference_score"
        ] += 0.20

    elif location:

        location_value = normalize_text(
            location
        )

        location_mask = (
            candidates[
                "destination_name"
            ]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.contains(
                location_value,
                regex=False
            )
        )

        location_mask |= (
            candidates[
                "district"
            ]
            .fillna("")
            .astype(str)
            .str.lower()
            ==
            location_value
        )

        location_mask |= (
            candidates[
                "province"
            ]
            .fillna("")
            .astype(str)
            .str.lower()
            ==
            location_value
        )

        candidates.loc[
            location_mask,
            "preference_score"
        ] += 0.20

    # ========================================================
    # 6. CATEGORY
    # ========================================================

    category = nlp_result.get(
        "category"
    )

    if category:

        category_mask = (
            candidates[
                "category"
            ]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.contains(
                normalize_text(category),
                regex=False
            )
        )

        candidates.loc[
            category_mask,
            "preference_score"
        ] += 0.15

    # ========================================================
    # 7. ACTIVITIES
    # ========================================================

    activities = nlp_result.get(
        "activities",
        []
    )

    if isinstance(
        activities,
        str
    ):

        activities = [
            activities
        ]

    if activities:

        activity_matches = (
            candidates[
                "activities"
            ]
            .fillna("")
            .astype(str)
            .apply(
                lambda value:
                sum(
                    1
                    for activity
                    in activities
                    if normalize_text(activity)
                    in normalize_text(value)
                )
            )
        )

        candidates[
            "preference_score"
        ] += (
            activity_matches.clip(
                upper=len(activities)
            )
            / max(
                len(activities),
                1
            )
            * 0.20
        )

    # ========================================================
    # 8. TRAVEL TYPE
    # ========================================================

    travel_type = nlp_result.get(
        "travel_type"
    )

    if travel_type:

        travel_mask = (
            candidates[
                "travel_type"
            ]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.contains(
                normalize_text(
                    travel_type
                ),
                regex=False
            )
        )

        candidates.loc[
            travel_mask,
            "preference_score"
        ] += 0.10

    # ========================================================
    # 9. DIFFICULTY
    # ========================================================

    difficulty = nlp_result.get(
        "difficulty_level"
    )

    if difficulty:

        difficulty_mask = (
            candidates[
                "difficulty_level"
            ]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.strip()
            ==
            normalize_text(
                difficulty
            )
        )

        candidates.loc[
            difficulty_mask,
            "preference_score"
        ] += 0.10

    # ========================================================
    # 10. FAMILY / GROUP TYPE
    # ========================================================

    group_type = nlp_result.get(
        "group_type"
    )

    if normalize_text(
        group_type
    ) == "family":

        family_mask = (
            candidates[
                "family_friendly"
            ]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.strip()
            .isin(
                [
                    "yes",
                    "true",
                    "1"
                ]
            )
        )

        candidates.loc[
            family_mask,
            "preference_score"
        ] += 0.10

    # ========================================================
    # 11. BUDGET
    # ========================================================

    budget = safe_float(
        nlp_result.get(
            "budget_npr"
        )
    )

    if budget and budget > 0:

        candidate_budget = pd.to_numeric(
            candidates[
                "estimated_budget_npr"
            ],
            errors="coerce"
        )

        budget_difference = (
            abs(
                candidate_budget
                - budget
            )
            / budget
        )

        # Perfect budget match = 1
        #
        # 10% difference = 0.9
        #
        # 50% difference = 0.5
        #
        # Very expensive destination = low score

        budget_score = (
            1
            - budget_difference
        ).clip(
            lower=0,
            upper=1
        )

        candidates[
            "budget_score"
        ] = budget_score

    else:

        candidates[
            "budget_score"
        ] = 0.5

    # ========================================================
    # 12. DURATION
    # ========================================================

    duration = safe_float(
        nlp_result.get(
            "duration_days"
        )
    )

    if duration and duration > 0:

        destination_duration = pd.to_numeric(
            candidates[
                "average_duration_days"
            ],
            errors="coerce"
        )

        duration_difference = (
            abs(
                destination_duration
                - duration
            )
            / max(
                duration,
                1
            )
        )

        candidates[
            "duration_score"
        ] = (
            1
            - duration_difference
        ).clip(
            lower=0,
            upper=1
        )

    else:

        candidates[
            "duration_score"
        ] = 0.5

    # ========================================================
    # 13. RATING
    # ========================================================

    candidates[
        "rating_score"
    ] = (
        pd.to_numeric(
            candidates[
                "average_rating"
            ],
            errors="coerce"
        )
        .fillna(0)
        / 5.0
    ).clip(
        lower=0,
        upper=1
    )

    # ========================================================
    # 14. POPULARITY
    # ========================================================

    candidates[
        "popularity_score_norm"
    ] = (
        pd.to_numeric(
            candidates[
                "popularity_score"
            ],
            errors="coerce"
        )
        .fillna(0)
        / 100.0
    ).clip(
        lower=0,
        upper=1
    )

    # ========================================================
    # 15. FINAL AI SCORE
    # ========================================================

    candidates[
        "final_score"
    ] = (

        # Meaning of user's sentence
        candidates[
            "semantic_score_norm"
        ] * 0.45

        +

        # Explicit preferences
        candidates[
            "preference_score"
        ] * 0.20

        +

        # Budget
        candidates[
            "budget_score"
        ] * 0.10

        +

        # Duration
        candidates[
            "duration_score"
        ] * 0.05

        +

        # Quality
        candidates[
            "rating_score"
        ] * 0.10

        +

        # Popularity
        candidates[
            "popularity_score_norm"
        ] * 0.10
    )

    # ========================================================
    # 16. SORT
    # ========================================================

    candidates = candidates.sort_values(
        by=[
            "final_score",
            "semantic_score",
            "average_rating"
        ],

        ascending=[
            False,
            False,
            False
        ]
    )

    # ========================================================
    # 17. RETURN
    # ========================================================

    return candidates[
        [
            "destination_id",
            "destination_name",
            "district",
            "province",
            "category",
            "travel_type",
            "activities",
            "difficulty_level",
            "family_friendly",
            "best_season",
            "estimated_budget_npr",
            "average_duration_days",
            "average_rating",
            "review_count",
            "popularity_score",
            "latitude",
            "longitude",
            "description",
            "similarity_score",
            "final_score"
        ]
    ].head(
        top_n
    ).reset_index(
        drop=True
    )