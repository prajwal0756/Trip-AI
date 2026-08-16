from embedding_service import EmbeddingService


# Create embedding service
service = EmbeddingService()


# Test query
query = "I want a peaceful mountain destination"


# Search
results = service.search(
    query,
    top_n=5
)


# Display results
print("\n======================================")
print("SEMANTIC SEARCH")
print("======================================")

print(f"\nQuery: {query}\n")


for index, row in results.iterrows():

    print(
        f"{index + 1}. "
        f"{row['destination_name']} "
        f"-> {row['similarity_score']:.4f}"
    )