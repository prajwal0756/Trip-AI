from ml.intent.intent_service import IntentService


# --------------------------------------------------
# LOAD SERVICE
# --------------------------------------------------

service = IntentService()


# --------------------------------------------------
# TEST QUERIES
# --------------------------------------------------

queries = [
    "I want a cheap place for trekking near Kathmandu",

    "I want a peaceful place with beautiful mountain views",

    "Can you suggest somewhere for my family?",

    "Where should I go if I like Pokhara?",

    "Show me some places where I can see sunrise",

    "I need somewhere to stay in Chitwan",

    "What is special about Mustang?",

    "Find historical places in Nepal",

    "I want to go somewhere quiet and less crowded",

    "What can I do in Pokhara?",

    "Show me destinations in Gandaki",

    "I want an adventurous vacation",
]


# --------------------------------------------------
# TEST
# --------------------------------------------------

print("\n" + "=" * 70)
print("INTENT CLASSIFICATION TEST")
print("=" * 70)


for query in queries:

    result = service.predict(query)

    print("\nQuery:")
    print(query)

    print(
        f"Intent: {result['intent']}"
    )

    print(
        f"Confidence: "
        f"{result['confidence']:.4f}"
    )