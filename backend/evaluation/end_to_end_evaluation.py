import requests
from collections import Counter

# ============================================================
# CONFIGURATION
# ============================================================

API_URL = "http://127.0.0.1:8000"

# Change this ONLY if your AI endpoint is different.
AI_ENDPOINT = f"{API_URL}/ai/query"


# ============================================================
# TEST DATASET
# ============================================================

TEST_CASES = [
    {
        "query": "Suggest some peaceful places to visit in Nepal.",
        "expected_intent": "recommendation",
    },
    {
        "query": "I want places for hiking and trekking.",
        "expected_intent": "activity_search",
    },
    {
        "query": "Tell me about Pokhara.",
        "expected_intent": "destination_information",
    },
    {
        "query": "Find some destinations in Nepal.",
        "expected_intent": "destination_search",
    },
    {
        "query": "I need a homestay for my trip.",
        "expected_intent": "accommodation_search",
    },
    {
        "query": "What places are similar to Sarangkot?",
        "expected_intent": "similar_destination",
    },
    {
        "query": "Hello",
        "expected_intent": "greeting",
    },
    {
        "query": "Recommend destinations for nature and relaxation.",
        "expected_intent": "recommendation",
    },
    {
        "query": "Where can I go for photography?",
        "expected_intent": "activity_search",
    },
    {
        "query": "What is special about Chitwan?",
        "expected_intent": "destination_information",
    },
    {
        "query": "Show me destinations around Kathmandu.",
        "expected_intent": "destination_search",
    },
    {
        "query": "Find accommodation for a family trip.",
        "expected_intent": "accommodation_search",
    },
    {
        "query": "What destinations are similar to Poon Hill?",
        "expected_intent": "similar_destination",
    },
    {
        "query": "Can you recommend a relaxing trip with friends?",
        "expected_intent": "recommendation",
    },
    {
        "query": "Good morning TripAI.",
        "expected_intent": "greeting",
    },
    {
        "query": "I want to go somewhere for mountain views.",
        "expected_intent": "recommendation",
    },
    {
        "query": "Which places are good for camping?",
        "expected_intent": "activity_search",
    },
    {
        "query": "Give me information about Lumbini.",
        "expected_intent": "destination_information",
    },
    {
        "query": "Find me a homestay near Pokhara.",
        "expected_intent": "accommodation_search",
    },
    {
        "query": "Suggest places similar to Phewa Lake.",
        "expected_intent": "similar_destination",
    },
]


# ============================================================
# SEND QUERY
# ============================================================

def send_query(query):

    payload = {
        "query": query
    }

    try:
        response = requests.post(
            AI_ENDPOINT,
            json=payload,
            timeout=60
        )

        return response

    except Exception as e:
        print(f"Request error: {e}")
        return None


# ============================================================
# EXTRACT INTENT
# ============================================================

def extract_intent(data):

    if not isinstance(data, dict):
        return None

    if "intent" in data:
        intent = data["intent"]

        if isinstance(intent, dict):
            return intent.get("name")

        return intent

    if "data" in data and isinstance(data["data"], dict):
        intent = data["data"].get("intent")

        if isinstance(intent, dict):
            return intent.get("name")

        return intent

    if "result" in data and isinstance(data["result"], dict):
        intent = data["result"].get("intent")

        if isinstance(intent, dict):
            return intent.get("name")

        return intent

    return None


# ============================================================
# EVALUATION
# ============================================================

def main():

    print("=" * 70)
    print("TRIPAI END-TO-END SYSTEM EVALUATION")
    print("=" * 70)

    total = len(TEST_CASES)

    successful_requests = 0
    correct_intents = 0

    results = []

    for index, test in enumerate(TEST_CASES, start=1):

        query = test["query"]
        expected = test["expected_intent"]

        print(f"\n[{index}/{total}]")
        print(f"Query: {query}")
        print(f"Expected intent: {expected}")

        response = send_query(query)

        if response is None:

            results.append({
                "query": query,
                "expected": expected,
                "actual": None,
                "request_success": False,
                "intent_correct": False,
            })

            print("Result: REQUEST FAILED")
            continue

        if response.status_code < 400:

            successful_requests += 1

            try:
                data = response.json()
            except Exception:
                data = {}

            actual = extract_intent(data)

            print(f"Actual intent: {actual}")

            if actual == expected:

                correct_intents += 1
                print("Result: PASS")

                results.append({
                    "query": query,
                    "expected": expected,
                    "actual": actual,
                    "request_success": True,
                    "intent_correct": True,
                })

            else:

                print("Result: FAIL")

                results.append({
                    "query": query,
                    "expected": expected,
                    "actual": actual,
                    "request_success": True,
                    "intent_correct": False,
                })

        else:

            print(
                f"Request failed with HTTP "
                f"{response.status_code}"
            )

            results.append({
                "query": query,
                "expected": expected,
                "actual": None,
                "request_success": False,
                "intent_correct": False,
            })


    # ========================================================
    # METRICS
    # ========================================================

    request_success_rate = (
        successful_requests / total
    ) * 100

    end_to_end_success_rate = (
        correct_intents / total
    ) * 100


    # ========================================================
    # RESULTS
    # ========================================================

    print("\n")
    print("=" * 70)
    print("END-TO-END EVALUATION RESULTS")
    print("=" * 70)

    print(f"Total test queries       : {total}")
    print(f"Successful API requests  : {successful_requests}")
    print(f"Correct intent results   : {correct_intents}")

    print(
        f"API success rate         : "
        f"{request_success_rate:.2f}%"
    )

    print(
        f"End-to-end success rate  : "
        f"{end_to_end_success_rate:.2f}%"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()