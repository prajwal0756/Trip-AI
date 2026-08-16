from pathlib import Path

import pandas as pd
import joblib

from ml.embeddings.embedding_service import EmbeddingService


# ==================================================
# 1. PATHS
# ==================================================

# backend/
BASE_DIR = Path(__file__).resolve().parents[2]

# Existing feature model files
CSV_PATH = BASE_DIR / "app" / "ai" / "recommendation" / "database.csv"

PKL_PATH = (
    BASE_DIR
    / "app"
    / "ai"
    / "recommendation"
    / "destination_similarity.pkl"
)


# ==================================================
# 2. LOAD EXISTING FEATURE MODEL
# ==================================================

df = pd.read_csv(CSV_PATH)

destination_similarity = joblib.load(PKL_PATH)


# ==================================================
# 3. LOAD EMBEDDING SERVICE
# ==================================================

embedding_service = EmbeddingService()


# ==================================================
# 4. EXISTING FEATURE RECOMMENDATION
# ==================================================

def feature_recommend(
    destination_name: str,
    top_n: int = 10
):

    destination_name = destination_name.strip().lower()

    names = (
        df["destination_name"]
        .str.strip()
        .str.lower()
    )

    matches = df.index[names == destination_name]

    if len(matches) == 0:
        raise ValueError(
            f"Destination '{destination_name}' not found."
        )

    idx = matches[0]

    similarity_scores = list(
        enumerate(destination_similarity[idx])
    )

    similarity_scores = sorted(
        similarity_scores,
        key=lambda x: x[1],
        reverse=True
    )

    # Remove the destination itself
    similarity_scores = similarity_scores[
        1:top_n + 1
    ]

    indices = [
        item[0]
        for item in similarity_scores
    ]

    recommendations = df.iloc[indices].copy()

    recommendations["feature_similarity"] = [
        item[1]
        for item in similarity_scores
    ]

    return recommendations


# ==================================================
# 5. EXISTING FEATURE SCORE
# ==================================================

def calculate_feature_score(recommendations):

    recommendations = recommendations.copy()

    recommendations["feature_score"] = (
        recommendations["feature_similarity"] * 0.6
        + recommendations["average_rating"] / 5 * 0.2
        + recommendations["popularity_score"] / 100 * 0.2
    )

    return recommendations


# ==================================================
# 6. SEMANTIC RECOMMENDATION
# ==================================================

def semantic_recommend(
    destination_name: str,
    top_n: int = 10
):

    destination_name = destination_name.strip().lower()

    names = (
        df["destination_name"]
        .str.strip()
        .str.lower()
    )

    matches = df.index[names == destination_name]

    if len(matches) == 0:
        raise ValueError(
            f"Destination '{destination_name}' not found."
        )

    idx = matches[0]

    # Use the destination's description
    # as the semantic query.
    query = df.loc[idx, "description"]

    results = embedding_service.search(
        query,
        top_n=top_n + 1
    )

    # Remove the original destination
    results = results[
        results["destination_name"].str.strip().str.lower()
        != destination_name
    ]

    return results.head(top_n)


# ==================================================
# 7. COMBINE BOTH MODELS
# ==================================================

def combined_recommend(
    destination_name: str,
    top_n: int = 10
):

    # ----------------------------------------------
    # Feature model
    # ----------------------------------------------

    feature_results = feature_recommend(
        destination_name,
        top_n=top_n
    )

    feature_results = calculate_feature_score(
        feature_results
    )


    # ----------------------------------------------
    # Semantic model
    # ----------------------------------------------

    semantic_results = semantic_recommend(
        destination_name,
        top_n=top_n
    )


    # ----------------------------------------------
    # Merge both result sets
    # ----------------------------------------------

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


    # ----------------------------------------------
    # Fill missing scores
    # ----------------------------------------------

    combined["feature_score"] = (
        combined["feature_score"]
        .fillna(0)
    )

    combined["semantic_score"] = (
        combined["similarity_score"]
        .fillna(0)
    )


    # ----------------------------------------------
    # Normalize scores
    # ----------------------------------------------

    def min_max_normalize(series):

        minimum = series.min()
        maximum = series.max()

        if maximum == minimum:
            return pd.Series(
                1.0,
                index=series.index
            )

        return (
            (series - minimum)
            / (maximum - minimum)
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


    # ----------------------------------------------
    # Combined score
    # ----------------------------------------------

    combined["combined_score"] = (
        combined["feature_score_norm"] * 0.5
        + combined["semantic_score_norm"] * 0.5
    )


    # ----------------------------------------------
    # Sort
    # ----------------------------------------------

    combined = combined.sort_values(
        by="combined_score",
        ascending=False
    )

    return combined.head(top_n).reset_index(
        drop=True
    )


# ==================================================
# 8. TEST
# ==================================================

if __name__ == "__main__":

    destination = "Phewa Lake"

    results = combined_recommend(
        destination,
        top_n=10
    )

    print("\n")
    print("=" * 80)
    print(f"COMBINED RECOMMENDATIONS FOR: {destination}")
    print("=" * 80)

    for index, row in results.iterrows():

        print(
            f"\n{index + 1}. "
            f"{row['destination_name']}"
        )

        print(
            f"   Feature score: "
            f"{row['feature_score']:.4f}"
        )

        print(
            f"   Semantic score: "
            f"{row['semantic_score']:.4f}"
        )

        print(
            f"   Combined score: "
            f"{row['combined_score']:.4f}"
        )

# ==================================================
# 9. QUERY-BASED RECOMMENDATION
# ==================================================

def query_recommend(
    query: str,
    nlp_result: dict,
    top_n: int = 10
):
    """
    Recommend destinations from a natural-language query.

    Flow:

        User query
             ↓
        NLP extracted preferences
             ↓
        Semantic candidate retrieval
             ↓
        Structured preference filtering
             ↓
        Final ranking
    """

    # --------------------------------------------------
    # 1. Build semantic filters
    # --------------------------------------------------

    filters = {
        "district": nlp_result.get("district"),
        "province": nlp_result.get("province"),
        "category": nlp_result.get("category"),
        "activities": nlp_result.get(
            "activities",
            []
        )
    }

    # Remove empty filters
    filters = {
        key: value
        for key, value in filters.items()
        if value
    }

    # --------------------------------------------------
    # 2. Retrieve semantic candidates
    # --------------------------------------------------

    semantic_results = embedding_service.search(
        query,
        top_n=50,
        filters=filters
    )

    if semantic_results.empty:
        return pd.DataFrame()

    # --------------------------------------------------
    # 3. Merge with full destination dataset
    # --------------------------------------------------

    candidates = pd.merge(
        semantic_results[
            [
                "destination_name",
                "similarity_score"
            ]
        ],
        df,
        on="destination_name",
        how="inner"
    )

    if candidates.empty:
        return pd.DataFrame()

    # --------------------------------------------------
# 4. Apply difficulty constraint
# --------------------------------------------------

    difficulty = nlp_result.get(
        "difficulty_level"
    )

    if difficulty:

        difficulty_mask = (
            candidates["difficulty_level"]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.strip()
            == difficulty.lower().strip()
        )

        filtered = candidates[
            difficulty_mask
        ].copy()

        # Difficulty is an explicit user requirement,
        # so use it as a hard constraint when matches exist.
        if not filtered.empty:
            candidates = filtered

    # --------------------------------------------------
    # 5. Apply family constraint
    # --------------------------------------------------

    group_type = nlp_result.get(
        "group_type"
    )

    if group_type == "family":

        family_values = (
            candidates["family_friendly"]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.strip()
        )

        family_mask = family_values.isin(
            [
                "yes",
                "true",
                "1"
            ]
        )

        filtered = candidates[
            family_mask
        ].copy()

        # Family-friendly is an explicit requirement.
        if not filtered.empty:
            candidates = filtered

    # --------------------------------------------------
    # 6. Semantic score normalization
    # --------------------------------------------------

    semantic_min = (
        candidates["similarity_score"].min()
    )

    semantic_max = (
        candidates["similarity_score"].max()
    )

    if semantic_max == semantic_min:

        candidates["semantic_score_norm"] = 1.0

    else:

        candidates["semantic_score_norm"] = (
            (
                candidates["similarity_score"]
                - semantic_min
            )
            /
            (
                semantic_max
                - semantic_min
            )
        )

    # --------------------------------------------------
    # 7. Rating score
    # --------------------------------------------------

    candidates["rating_score"] = (
        candidates["average_rating"]
        / 5.0
    )

    # --------------------------------------------------
    # 8. Popularity score
    # --------------------------------------------------

    candidates["popularity_score_norm"] = (
        candidates["popularity_score"]
        / 100.0
    )

    # --------------------------------------------------
    # 9. Final ranking score
    # --------------------------------------------------

    candidates["final_score"] = (
        candidates["semantic_score_norm"] * 0.60
        +
        candidates["rating_score"] * 0.20
        +
        candidates["popularity_score_norm"] * 0.20
    )

    # --------------------------------------------------
    # 10. Sort
    # --------------------------------------------------

    candidates = candidates.sort_values(
        by="final_score",
        ascending=False
    )

    # --------------------------------------------------
    # 11. Return useful fields
    # --------------------------------------------------

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
            "average_rating",
            "popularity_score",
            "similarity_score",
            "final_score"
        ]
    ].head(
        top_n
    ).reset_index(
        drop=True
    )