import os
import pickle
import faiss
import numpy as np
from typing import Dict, Any, List
from sentence_transformers import SentenceTransformer
import sys
import nlp
try:
    from tripai.nlp.config import FAISS_INDEX_PATH, FAISS_META_PATH
except ModuleNotFoundError:
    from nlp.config import FAISS_INDEX_PATH, FAISS_META_PATH

class Layer2Semantic:
    def __init__(self):
        # Initialize Sentence Transformer model
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        
        # Load FAISS index and metadata
        if not os.path.exists(FAISS_INDEX_PATH) or not os.path.exists(FAISS_META_PATH):
            raise FileNotFoundError("FAISS index or metadata files do not exist. Please run build_faiss_index.py first.")
            
        self.index = faiss.read_index(FAISS_INDEX_PATH)
        with open(FAISS_META_PATH, "rb") as f:
            self.metadata = pickle.load(f)
            
        # Define mood anchors
        self.mood_anchors = {
            "relaxation": [
                "stressed out and need to unwind",
                "peaceful and quiet retreat in nature",
                "calm environment away from city crowds",
                "relaxing homestay with scenic views",
                "gentle lake walks and meditation",
                "soothing yoga and wellness retreat",
                "quiet temple environment",
                "peace and quiet scenic walks",
                "mindfulness and slow-paced travel",
                "spiritual cleansing and healing atmosphere",
                "refreshing breeze and quiet lakes",
                "escape from stress and burnout"
            ],
            "adventure": [
                "thrill seeking adrenaline rush",
                "bored and want extreme sports",
                "challenging mountain trekking and climbing",
                "white water rafting and paragliding",
                "wildlife safari in dense jungle",
                "camping under the stars in the wilderness",
                "high-altitude exploration and mountaineering",
                "bungee jumping and canyoning",
                "adventurous offroad biking trails",
                "rock climbing and forest trail hikes",
                "rugged trails and wild discovery",
                "excitement and physical challenge"
            ],
            "cultural": [
                "historical temples and religious shrines",
                "traditional Newari architecture and woodwork",
                "local festivals and cultural dance performances",
                "museum visit to learn ancient history",
                "pilgrimage sites and sacred monuments",
                "authentic village tour and heritage walks",
                "learning about local traditions and pottery",
                "monasteries and buddhist stupas",
                "old palaces and royal courtyards",
                "historical artifacts and ancient history",
                "spiritual pilgrimage and religious ceremonies",
                "cultural observation and folk music"
            ],
            "nature": [
                "scenic green hills and mountains",
                "lush national parks and dense forests",
                "wildlife sighting of rare birds and rhinos",
                "beautiful lakes and flowing waterfalls",
                "sunrise viewing over snow-capped peaks",
                "tea garden tour with rolling hills",
                "biodiverse conservation area exploration",
                "panoramic mountain viewing points",
                "pristine botanical gardens and rivers",
                "flora and fauna photography in the wild",
                "crystal clear lakes and clean air",
                "spectacular valley views and mountain range"
            ]
        }
        
        # Precompute mood anchor embeddings
        self.mood_embeddings = {}
        for mood, phrases in self.mood_anchors.items():
            phr_embeddings = self.model.encode(phrases, convert_to_numpy=True)
            faiss.normalize_L2(phr_embeddings)
            # We store the individual phrase embeddings to compute max similarity
            self.mood_embeddings[mood] = phr_embeddings

    def match(self, text: str, k: int = 5) -> Dict[str, Any]:
        # Embed query
        query_vector = self.model.encode([text], convert_to_numpy=True)
        faiss.normalize_L2(query_vector)
        
        # 1. Search FAISS index for top-k destinations
        scores, indices = self.index.search(query_vector, k)
        
        top_destinations = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(self.metadata) and idx >= 0:
                meta = self.metadata[idx].copy()
                meta["similarity_score"] = float(score)
                top_destinations.append(meta)
                
        # 2. Compute mood tag similarities
        mood_scores = {}
        for mood, embeddings in self.mood_embeddings.items():
            # Cosine similarity is dot product because vectors are normalized
            similarities = np.dot(embeddings, query_vector[0])
            # Take the max similarity among all phrases for this mood
            mood_scores[mood] = float(np.max(similarities))
            
        # Boost mood scores based on specific high-confidence keywords
        text_lower = text.lower()
        if any(w in text_lower for w in ["honeymoon", "romantic", "anniversary", "couple", "wife", "husband"]):
            mood_scores["relaxation"] = max(mood_scores["relaxation"], 0.6)
            mood_scores["nature"] = max(mood_scores["nature"], 0.5)
        if any(w in text_lower for w in ["stressed", "burnt out", "burnout", "tired", "quiet", "calm", "relax", "meditation"]):
            mood_scores["relaxation"] = max(mood_scores["relaxation"], 0.7)
        if any(w in text_lower for w in ["bored", "adventure", "trekking", "trek", "climb", "thrill", "adrenaline"]):
            mood_scores["adventure"] = max(mood_scores["adventure"], 0.7)
        if any(w in text_lower for w in ["culture", "festival", "tradition", "heritage", "temple", "monastery", "history", "dance"]):
            mood_scores["cultural"] = max(mood_scores["cultural"], 0.7)
        if any(w in text_lower for w in ["wildlife", "safari", "lake", "mountain", "scenic", "view", "nature"]):
            mood_scores["nature"] = max(mood_scores["nature"], 0.7)
            
        # Select mood tags above threshold (e.g. 0.35)
        selected_moods = [mood for mood, score in mood_scores.items() if score >= 0.35]
        # Sort moods by score descending
        selected_moods = sorted(selected_moods, key=lambda m: mood_scores[m], reverse=True)
        
        # 3. Formulate output prediction
        # If we have a very strong top match (e.g., > 0.60), we can extract its attributes
        best_match = top_destinations[0] if top_destinations else None
        best_score = best_match["similarity_score"] if best_match else 0.0
        
        output = {
            "destination": None,
            "district": None,
            "province": None,
            "duration_days": None,
            "budget_npr": None,
            "group_type": None,
            "category": None,
            "activities": [],
            "difficulty_level": None,
            "mood_tags": selected_moods,
            "semantic_query": text.strip(),
            "trick_or_ambiguous": False,
            "confidence": float(best_score),
            "missing_fields": [],
            # Layer-specific diagnostics
            "top_candidates": top_destinations,
            "mood_scores": mood_scores
        }
        
        # If the semantic similarity is high, populate broad category/activities attributes
        # if best_match and best_score >= 0.50:
        #     output["category"] = best_match["category"]
        #     output["activities"] = best_match["activities"]
        #     output["difficulty_level"] = best_match["difficulty_level"]

        # IMPORTANT:
# Do not copy category, activities, or difficulty from the
# top semantic candidate into the user's extracted preferences.
#
# These values belong to the candidate destination, not the
# user's query.
#
# The top_candidates list already contains this information
# for the recommendation/ranking stage.
#
# User preferences should come from:
# - Layer 1 explicit extraction
# - Layer 3 LLM extraction
#
# Therefore we intentionally leave:
# category
# activities
# difficulty_level
#
# empty here unless Layer 1 explicitly extracted them.
            
        # If specific fields are still missing, fill them from top_candidates if they are consistent
        # For category and district, if all top-3 candidates have the same category, we can infer it
        if len(top_destinations) >= 3 and not output["category"]:
            top_cats = [d["category"] for d in top_destinations[:3] if d["category"]]
            if len(top_cats) == 3 and len(set(top_cats)) == 1:
                output["category"] = top_cats[0]
                
        # Populate missing fields checklist
        all_required = ["destination", "duration_days", "budget_npr", "category", "activities"]
        output["missing_fields"] = [f for f in all_required if output[f] is None or (f == "activities" and not output[f])]
        
        return output
