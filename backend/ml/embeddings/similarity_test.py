from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Our user query
query = "I want a peaceful place surrounded by mountains."

# Destination descriptions
destinations = [
    "A peaceful mountain village with beautiful scenery.",
    "A busy city with shopping malls and restaurants.",
    "A beautiful lake surrounded by mountains and forests."
]

# Convert all text to embeddings
query_embedding = model.encode([query])
destination_embeddings = model.encode(destinations)

# Calculate similarity
similarities = cosine_similarity(
    query_embedding,
    destination_embeddings
)[0]

# Display results
for destination, score in zip(destinations, similarities):
    print(f"{score:.4f} - {destination}")