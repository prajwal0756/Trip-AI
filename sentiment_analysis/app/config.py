import os
from pathlib import Path

# Base Directory of the Project
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Model Configurations ---
# Target Hugging Face sentiment model
MODEL_NAME = os.getenv(
    "TRIPAI_SENTIMENT_MODEL", 
    "lxyuan/distilbert-base-multilingual-cased-sentiments-student"
)

# Confidence threshold below which a class prediction (positive/negative) is coerced to neutral.
# Helps catch near-neutral/low-confidence reviews.
NEUTRAL_THRESHOLD = float(os.getenv("TRIPAI_NEUTRAL_THRESHOLD", "0.60"))

# --- Database Configurations ---
# SQLite database path. Default is sentiment_analysis.db in the root project directory.
DATABASE_URL = os.getenv("TRIPAI_DATABASE_URL", f"sqlite:///{BASE_DIR}/sentiment_analysis.db")

# --- Sentiment Aggregation Configs ---
# Bayesian minimum-review threshold (m)
BAYESIAN_MIN_REVIEWS = int(os.getenv("TRIPAI_BAYESIAN_MIN_REVIEWS", "10"))

# Default platform-wide sentiment score fallback when no reviews exist.
DEFAULT_PLATFORM_AVG_SCORE = float(os.getenv("TRIPAI_DEFAULT_PLATFORM_AVG", "0.0"))

# --- Mismatch Logic Configs ---
# Absolute difference threshold between normalized rating [-1.0, 1.0] and overall score [-1.0, 1.0].
# Ratings: 5 -> 1.0, 4 -> 0.5, 3 -> 0.0, 2 -> -0.5, 1 -> -1.0
# A difference >= 1.2 flags a mismatch (e.g. 5 stars but negative score, or 1 star but positive score).
RATING_MISMATCH_THRESHOLD = float(os.getenv("TRIPAI_RATING_MISMATCH_THRESHOLD", "1.2"))
