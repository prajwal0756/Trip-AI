from ml.recommendation.combined_recommendation import query_recommend
from ml.nlp_service import NLPService


nlp_service = NLPService()


query = (
    "I want an easy trekking destination "
    "near Pokhara for my family"
)


# --------------------------------------------------
# NLP
# --------------------------------------------------

nlp_result = nlp_service.parse(
    query
)


print("\nNLP RESULT")
print("=" * 70)

for key, value in nlp_result.items():

    if key not in [
        "top_candidates",
        "mood_scores"
    ]:
        print(
            f"{key}: {value}"
        )


# --------------------------------------------------
# QUERY RECOMMENDATION
# --------------------------------------------------

results = query_recommend(
    query,
    nlp_result,
    top_n=10
)


print("\n")
print("=" * 70)
print("QUERY RECOMMENDATIONS")
print("=" * 70)


if results.empty:

    print(
        "No recommendations found."
    )

else:

    for index, row in results.iterrows():

        print(
            f"\n{index + 1}. "
            f"{row['destination_name']}"
        )

        print(
            f"   District: "
            f"{row['district']}"
        )

        print(
            f"   Category: "
            f"{row['category']}"
        )

        print(
            f"   Difficulty: "
            f"{row['difficulty_level']}"
        )

        print(
            f"   Family friendly: "
            f"{row['family_friendly']}"
        )

        print(
            f"   Semantic: "
            f"{row['similarity_score']:.4f}"
        )

        print(
            f"   Final: "
            f"{row['final_score']:.4f}"
        )