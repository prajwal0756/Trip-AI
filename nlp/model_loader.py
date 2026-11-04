from functools import lru_cache
from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=None)
def get_sentence_transformer(model_name="all-MiniLM-L6-v2"):
    print(f"Loading shared embedding model: {model_name}")
    return SentenceTransformer(model_name)
