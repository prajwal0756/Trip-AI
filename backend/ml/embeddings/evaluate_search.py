import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# --------------------------------------------------
# 1. LOAD EMBEDDINGS
# --------------------------------------------------

embeddings = np.load(
    "ml/embeddings/output/destination_embeddings.npy"
)

metadata = pd.read_csv(
    "ml/embeddings/output/destination_metadata.csv"
)

print(f"Loaded embeddings: {embeddings.shape}")
print(f"Loaded destinations: {len(metadata)}")


# --------------------------------------------------
# 2. LOAD MODEL
# --------------------------------------------------

model = SentenceTransformer("all-MiniLM-L6-v2")


# --------------------------------------------------
# 3. SEARCH FUNCTION
# --------------------------------------------------

def semantic_search(query, top_n=5):

    query_embedding = model.encode([query])

    similarities = cosine_similarity(
        query_embedding,
        embeddings
    )[0]

    top_indices = np.argsort(similarities)[::-1][:top_n]

    results = metadata.iloc[top_indices].copy()

    results["similarity_score"] = similarities[top_indices]

    return results.reset_index(drop=True)


# --------------------------------------------------
# 4. TEST QUERIES
# --------------------------------------------------

queries = [
    "I want a peaceful mountain destination",
    "I want to go trekking and hiking",
    "I want to see beautiful lakes",
    "I want to experience Nepali culture and history",
    "I want to see beautiful sunrise views",
    "I want an adventure destination",
    "I want a place suitable for families",
    "I want a quiet destination away from crowds",
    "I want to visit a religious place",
    "I want beautiful natural scenery",
]


# --------------------------------------------------
# 5. RUN TESTS
# --------------------------------------------------

for query in queries:

    print("\n" + "=" * 70)
    print(f"QUERY: {query}")
    print("=" * 70)

    results = semantic_search(query, top_n=5)

    for index, row in results.iterrows():

        print(f"\n{index + 1}. {row['destination_name']}")

        print(
            f"   Similarity: "
            f"{row['similarity_score']:.4f}"
        )

        print(
            f"   Category: "
            f"{row['category']}"
        )

        print(
            f"   Travel type: "
            f"{row['travel_type']}"
        )

        print(
            f"   Activities: "
            f"{row['activities']}"
        )

        print(
            f"   Description: "
            f"{row['description']}"
        )