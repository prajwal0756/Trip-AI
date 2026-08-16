import os
import sys

# Ensure parent directory is in sys.path for package imports
NLP_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(NLP_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

# Data Configurations
# Default path to the dataset. First checks TRIPAI_DATASET_PATH env var, then falls back to nlp/data/datasets.csv
LOCAL_DATASET_PATH = os.path.join(NLP_DIR, "data", "datasets.csv")
DEFAULT_DATASET_PATH = os.environ.get("TRIPAI_DATASET_PATH")
if not DEFAULT_DATASET_PATH or not os.path.exists(DEFAULT_DATASET_PATH):
    DEFAULT_DATASET_PATH = LOCAL_DATASET_PATH

# FAISS Index Configurations
INDEX_DIR = os.path.join(NLP_DIR, "index")
FAISS_INDEX_PATH = os.path.join(INDEX_DIR, "destinations.faiss")
FAISS_META_PATH = os.path.join(INDEX_DIR, "destinations_meta.pkl")

# Logging Configuration
LOG_DIR = os.path.join(NLP_DIR, "logs")
PIPELINE_LOG_PATH = os.path.join(LOG_DIR, "pipeline.log")

# Ollama / LLM Configurations
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")

# Confidence Routing Thresholds
# If Layer 1 extracts slots with combined confidence >= L1_CONFIDENCE_THRESHOLD, route directly.
L1_CONFIDENCE_THRESHOLD = 0.85
# If Layer 2 has a cosine similarity match >= L2_CONFIDENCE_THRESHOLD, route directly.
L2_CONFIDENCE_THRESHOLD = 0.65

