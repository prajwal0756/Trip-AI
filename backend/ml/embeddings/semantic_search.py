import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# --------------------------------------------------
# 1. LOAD SAVED EMBEDDINGS
# --------------------------------------------------

embeddings = np.load(
    "ml/embeddings/output/destination_embeddings.npy"
)

print(f"Loaded embeddings: {embeddings.shape}")


# --------------------------------------------------
# 2. LOAD DESTINATION METADATA
# --------------------------------------------------

metadata = pd.read_csv(
    "ml/embeddings/output/destination_metadata.csv"
)

print(f"Loaded destinations: {len(metadata)}")


# --------------------------------------------------
# 3. LOAD EMBEDDING MODEL
# --------------------------------------------------

model = SentenceTransformer("all-MiniLM-L6-v2")


# --------------------------------------------------
# 4. SEMANTIC SEARCH FUNCTION
# --------------------------------------------------

def semantic_search(query, top_n=5):

    # Convert user query into an embedding
    query_embedding = model.encode([query])

    # Compare query embedding with all destination embeddings
    similarities = cosine_similarity(
        query_embedding,
        embeddings
    )[0]

    # Get indices of highest similarity scores
    top_indices = np.argsort(similarities)[::-1][:top_n]

    # Create result dataframe
    results = metadata.iloc[top_indices].copy()

    # Add similarity score
    results["similarity_score"] = similarities[top_indices]

    # Reset index
    results = results.reset_index(drop=True)

    return results


# --------------------------------------------------
# 5. TEST SEARCH
# --------------------------------------------------

queries = [
    "I want a peaceful place surrounded by mountains.",
    "I want a destination for trekking and adventure.",
    "I want to experience Nepali culture and history.",
    "I want a beautiful lake surrounded by nature.",
    "I want a place suitable for my family.",
    "I want to see beautiful sunrise views.",
    "I want a quiet place away from crowded cities.",
]

for query in queries:

    print("\n======================================")
    print(f"QUERY: {query}")
    print("======================================")

    results = semantic_search(query, top_n=5)

    for index, row in results.iterrows():

        print(
            f"{index + 1}. "
            f"{row['destination_name']} "
            f"-> {row['similarity_score']:.4f}"
        )

print("\n======================================")
print("SEMANTIC SEARCH RESULTS")
print("======================================")

print(f"\nQuery: {query}\n")

for index, row in results.iterrows():

    print(
        f"{index + 1}. "
        f"{row['destination_name']} "
        f"-> similarity: {row['similarity_score']:.4f}"
    )