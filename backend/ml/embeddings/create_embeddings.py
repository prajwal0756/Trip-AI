import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from pathlib import Path


# --------------------------------------------------
# 1. LOAD DATASET
# --------------------------------------------------

df = pd.read_csv("../data/final_destination.csv")

print(f"Loaded {len(df)} destinations.")


# --------------------------------------------------
# 2. CREATE SEMANTIC TEXT
# --------------------------------------------------

def create_semantic_text(row):
    return (
        f"{row['destination_name']}. "
        f"{row['description']}"
    )


df["semantic_text"] = df.apply(create_semantic_text, axis=1)


# --------------------------------------------------
# 3. DISPLAY EXAMPLE
# --------------------------------------------------

print("\nExample semantic text:")
print(df["semantic_text"].iloc[0])


# --------------------------------------------------
# 4. LOAD EMBEDDING MODEL
# --------------------------------------------------

print("\nLoading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Model loaded successfully.")


# --------------------------------------------------
# 5. GENERATE EMBEDDINGS
# --------------------------------------------------

print("\nGenerating embeddings...")

embeddings = model.encode(
    df["semantic_text"].tolist(),
    show_progress_bar=True
)

print("\nEmbedding generation completed.")

print("Embedding shape:", embeddings.shape)


# --------------------------------------------------
# 6. CREATE OUTPUT DIRECTORY
# --------------------------------------------------

output_dir = Path("ml/embeddings/output")
output_dir.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# 7. SAVE EMBEDDINGS
# --------------------------------------------------

embedding_path = output_dir / "destination_embeddings.npy"

np.save(embedding_path, embeddings)

print(f"\nEmbeddings saved to: {embedding_path}")


# --------------------------------------------------
# 8. SAVE METADATA
# --------------------------------------------------

metadata = df[
    [
        "destination_id",
        "destination_name",
        "district",
        "province",
        "category",
        "travel_type",
        "activities",
        "description",
        "semantic_text",
    ]
].copy()

metadata_path = output_dir / "destination_metadata.csv"

metadata.to_csv(metadata_path, index=False)

print(f"Metadata saved to: {metadata_path}")


# --------------------------------------------------
# 9. FINAL INFORMATION
# --------------------------------------------------

print("\n--------------------------------------")
print("EMBEDDING GENERATION COMPLETE")
print("--------------------------------------")
print(f"Destinations: {len(df)}")
print(f"Embedding dimensions: {embeddings.shape[1]}")
print(f"Embedding file: {embedding_path}")
print(f"Metadata file: {metadata_path}")