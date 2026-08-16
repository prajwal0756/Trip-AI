from ml.nlp_service import NLPService


service = NLPService()


queries = [
    "I want a peaceful place away from crowded cities",
    "I want an easy trekking destination near Pokhara for my family",
    "I want a cheap place for trekking near Kathmandu",
    "Show me some places where I can see sunrise",
]


for query in queries:

    print("\n" + "=" * 70)

    print("QUERY:")
    print(query)

    result = service.parse(query)

    print("\nNLP RESULT:")

    for key, value in result.items():

        if key not in [
            "top_candidates",
            "mood_scores"
        ]:
            print(
                f"{key}: {value}"
            )