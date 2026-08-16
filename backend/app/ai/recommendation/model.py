
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).parent

CSV_PATH = BASE_DIR / "database.csv"
PKL_PATH = BASE_DIR / "destination_similarity.pkl"


# Load only once
df = pd.read_csv(CSV_PATH)

import joblib

destination_similarity = joblib.load(PKL_PATH)


def recommend(destination_name: str, top_n: int = 10):

    # Normalize user input
    destination_name = destination_name.strip().lower()

    # Normalize dataframe names
    names = df["destination_name"].str.strip().str.lower()

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

    similarity_scores = similarity_scores[1:top_n+1]

    indices = [i[0] for i in similarity_scores]

    recommendations = df.iloc[indices].copy()

    recommendations["similarity_score"] = [
        i[1] for i in similarity_scores
    ]

    return recommendations


def rank_destinations(recommendations):

    recommendations = recommendations.copy()

    recommendations["final_score"] = (
        recommendations["similarity_score"] * 0.6
        + recommendations["average_rating"] / 5 * 0.2
        + recommendations["popularity_score"] / 100 * 0.2
    )

    recommendations = recommendations.sort_values(
        by="final_score",
        ascending=False,
    )

    return recommendations


def get_recommendations(destination_name: str, top_n: int = 10):

    recommendations = recommend(
        destination_name,
        top_n
    )

    recommendations = rank_destinations(
        recommendations
    )

    return recommendations[
        [
            "destination_name",
            "similarity_score",
            "final_score",
        ]
    ].to_dict(
        orient="records"
    )