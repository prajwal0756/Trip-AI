from ml.ai_pipeline import AIPipeline


# ==================================================
# LOAD PIPELINE
# ==================================================

pipeline = AIPipeline()


# ==================================================
# TEST QUERIES
# ==================================================

queries = [

    # Recommendation
    "I want a peaceful place away from crowded cities",
    "I want an easy trekking destination near Pokhara for my family",

    # Similar destination
    "Show me destinations similar to Phewa Lake",

    # Destination information
    "Tell me about Mustang",

    # Destination search
    "Show me destinations in Gandaki",

    # Activity search
    "What can I do in Pokhara?",

    # Accommodation
    "Where can I stay in Chitwan?",

    # Greeting
    "Hello TripAI",
]


# ==================================================
# RUN TESTS
# ==================================================

for query in queries:

    print("\n")
    print("=" * 80)
    print("QUERY")
    print("=" * 80)
    print(query)

    try:

        result = pipeline.process(query)

        # --------------------------------------------------
        # INTENT
        # --------------------------------------------------

        print("\nINTENT")
        print(result.get("intent"))

        # --------------------------------------------------
        # RESPONSE TYPE
        # --------------------------------------------------

        print("\nRESPONSE TYPE")
        print(result.get("response_type"))

        # --------------------------------------------------
        # DESTINATION
        # --------------------------------------------------

        if result.get("destination"):

            print("\nDESTINATION")
            print(result["destination"])

        # --------------------------------------------------
        # NLP
        # --------------------------------------------------

        if result.get("nlp"):

            print("\nNLP")

            for key, value in result["nlp"].items():

                print(
                    f"{key}: {value}"
                )

        # --------------------------------------------------
        # ACTIVITIES
        # --------------------------------------------------

        if result.get("activities"):

            print("\nACTIVITIES")

            print(
                result["activities"]
            )

        # --------------------------------------------------
        # DESTINATION INFORMATION
        # --------------------------------------------------

        if result.get("information"):

            print("\nDESTINATION INFORMATION")

            information = result["information"]

            for key, value in information.items():

                print(
                    f"{key}: {value}"
                )

        # --------------------------------------------------
        # MESSAGE
        # --------------------------------------------------

        if result.get("message"):

            print("\nMESSAGE")

            print(
                result["message"]
            )

        # --------------------------------------------------
        # ERROR
        # --------------------------------------------------

        if result.get("error"):

            print("\nERROR")

            print(
                result["error"]
            )

        # --------------------------------------------------
        # RESULTS
        # --------------------------------------------------

       # --------------------------------------------------
# RESULT COUNT
# --------------------------------------------------

        if result.get("response_type") == "destination_information":

            # A destination-information response represents
            # one destination record.
            result_count = 1 if result.get("information") else 0

            print(
                "\nRESULT COUNT:",
                result_count
            )

        else:

            results = result.get(
                "results",
                []
            )

            print(
                "\nRESULT COUNT:",
                len(results)
            )
        # Show top 5 results
        for i, item in enumerate(
            results[:5],
            start=1
        ):

            print(
                f"\n{i}. "
                f"{item.get('destination_name', 'Unknown')}"
            )

            # Final recommendation score
            if item.get("final_score") is not None:

                print(
                    "   Final score:",
                    round(
                        float(
                            item["final_score"]
                        ),
                        4
                    )
                )

            # Feature similarity
            if item.get("feature_similarity") is not None:

                print(
                    "   Feature similarity:",
                    round(
                        float(
                            item["feature_similarity"]
                        ),
                        4
                    )
                )

            # Semantic similarity
            if item.get("similarity_score") is not None:

                print(
                    "   Semantic similarity:",
                    round(
                        float(
                            item["similarity_score"]
                        ),
                        4
                    )
                )

            # Optional metadata
            if item.get("district"):

                print(
                    "   District:",
                    item["district"]
                )

            if item.get("province"):

                print(
                    "   Province:",
                    item["province"]
                )

            if item.get("category"):

                print(
                    "   Category:",
                    item["category"]
                )

            if item.get("difficulty_level"):

                print(
                    "   Difficulty:",
                    item["difficulty_level"]
                )

            if item.get("family_friendly"):

                print(
                    "   Family friendly:",
                    item["family_friendly"]
                )

    except Exception as exc:

        print(
            "\nPIPELINE ERROR:",
            exc
        )