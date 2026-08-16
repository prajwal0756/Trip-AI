from app.ai.recommendation.model import get_recommendations

results = get_recommendations(
    "Phewa Lake"
)

for item in results[:5]:
    print(item["destination_name"])