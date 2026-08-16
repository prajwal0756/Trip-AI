from ml.ai_pipeline import TripAIPipeline


# --------------------------------------------------
# LOAD PIPELINE
# --------------------------------------------------

pipeline = TripAIPipeline()


# --------------------------------------------------
# TEST QUERIES
# --------------------------------------------------

queries = [

    "I want a peaceful place away from crowded cities",

    "I want an easy trekking destination near Pokhara for my family",

    "Show me some places where I can see sunrise",

    "I want to go somewhere quiet and less crowded",

    "Find me a destination for nature and adventure"

]


# --------------------------------------------------
# RUN TESTS
# --------------------------------------------------

for query in queries:

    print("\n")
    print("=" * 70)

    print("QUERY:")
    print(query)

    result = pipeline.process(query)

    print("\nINTENT:")
    print(
        result["intent"]
    )

    print("\nNLP:")

    nlp = result["nlp"]

    print(
        "Location:",
        nlp.get("location")
    )

    print(
        "District:",
        nlp.get("district")
    )

    print(
        "Province:",
        nlp.get("province")
    )

    print(
        "Category:",
        nlp.get("category")
    )

    print(
        "Activities:",
        nlp.get("activities")
    )

    print(
        "Mood:",
        nlp.get("mood_tags")
    )

    print("\nSEMANTIC RESULTS:")

    for result_item in result["semantic_results"]:

        print(
            f"- {result_item['destination_name']}"
            f" | score="
            f"{result_item['similarity_score']:.4f}"
        )