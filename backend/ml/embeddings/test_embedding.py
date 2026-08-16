from sentence_transformers import SentenceTransformer

# Load the embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Example sentence
text = "A peaceful mountain destination with beautiful scenery."

# Convert text into an embedding
embedding = model.encode(text)

print("Embedding:")
print(embedding)

print("\nEmbedding dimensions:")
print(len(embedding))