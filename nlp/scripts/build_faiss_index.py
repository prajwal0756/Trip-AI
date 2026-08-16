import os
import pickle
import numpy as np
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer
import sys
import nlp
try:
    from tripai.nlp.config import FAISS_INDEX_PATH, FAISS_META_PATH, INDEX_DIR
    from tripai.nlp.data_loader import DatasetLoader
except ModuleNotFoundError:
    from nlp.config import FAISS_INDEX_PATH, FAISS_META_PATH, INDEX_DIR
    from nlp.data_loader import DatasetLoader

def build_index(dataset_path: str = None):
    print("Initializing Dataset Loader...")
    loader = DatasetLoader(dataset_path)
    df = loader.get_dataframe()
    
    print(f"Loaded {len(df)} destinations. Initializing Sentence Transformer...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    
    # 1. Embed destination descriptions
    descriptions = df["description"].tolist()
    print("Embedding descriptions (this may take a few seconds)...")
    embeddings = model.encode(descriptions, show_progress_bar=True, convert_to_numpy=True)
    
    # Normalize embeddings for Cosine Similarity (Inner Product)
    faiss.normalize_L2(embeddings)
    
    # 2. Build FAISS Flat Inner Product Index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)
    
    # Ensure index directory exists
    os.makedirs(INDEX_DIR, exist_ok=True)
    
    # 3. Save FAISS index
    print(f"Saving FAISS index to {FAISS_INDEX_PATH}...")
    faiss.write_index(index, FAISS_INDEX_PATH)
    
    # 4. Save metadata map
    meta = []
    for idx, row in df.iterrows():
        # Clean activities: parse into list if string
        acts = row.get("activities", "")
        if isinstance(acts, str):
            delimiters = [',', ';']
            activities_list = [acts]
            for delim in delimiters:
                new_acts = []
                for a in activities_list:
                    new_acts.extend(a.split(delim))
                activities_list = new_acts
            activities_list = [a.strip() for a in activities_list if a.strip()]
        elif isinstance(acts, list):
            activities_list = acts
        else:
            activities_list = []

        meta.append({
            "destination": row.get("destination_name", ""),
            "district": row.get("district", ""),
            "province": row.get("province", ""),
            "duration_days": int(row["average_duration_days"]) if pd.notna(row.get("average_duration_days")) else None,
            "budget_npr": int(row["estimated_budget_npr"]) if pd.notna(row.get("estimated_budget_npr")) else None,
            "category": row.get("category", ""),
            "activities": activities_list,
            "difficulty_level": str(row.get("difficulty_level", "")).lower() if pd.notna(row.get("difficulty_level")) else None,
            "description": row.get("description", "")
        })
        
    print(f"Saving metadata to {FAISS_META_PATH}...")
    with open(FAISS_META_PATH, "wb") as f:
        pickle.dump(meta, f)
        
    print("FAISS Index Build Completed Successfully!")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Build FAISS Index for TripAI NLP module")
    parser.add_argument("--dataset", type=str, default=None, help="Path to dataset CSV/Excel file")
    args = parser.parse_args()
    build_index(args.dataset)
