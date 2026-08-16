from pathlib import Path
import json
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from collections import Counter


# --------------------------------------------------
# PATHS
# --------------------------------------------------

# This is:
# backend/ml/intent/
BASE_DIR = Path(__file__).resolve().parent

# intents.json is directly inside:
# backend/ml/intent/
DATA_PATH = BASE_DIR / "intents.json"

# Model will be saved inside:
# backend/ml/intent/model/
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "intent_classifier.pkl"


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

print(f"Loading training data from:")
print(DATA_PATH)

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)


texts = [item["text"] for item in data]
labels = [item["intent"] for item in data]


print(f"\nLoaded {len(data)} training examples.")

print("\nIntent distribution:")

for intent, count in Counter(labels).items():
    print(f"{intent}: {count}")


# --------------------------------------------------
# TRAIN / TEST SPLIT
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    texts,
    labels,
    test_size=0.20,
    random_state=42,
    stratify=labels
)


print(f"\nTraining examples: {len(X_train)}")
print(f"Testing examples: {len(X_test)}")


# --------------------------------------------------
# MODEL
# --------------------------------------------------

model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            sublinear_tf=True,
            min_df=1
        )
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced"
        )
    )
])


# --------------------------------------------------
# TRAIN
# --------------------------------------------------

print("\nTraining intent classifier...")

model.fit(
    X_train,
    y_train
)

print("Training complete.")


# --------------------------------------------------
# EVALUATION
# --------------------------------------------------

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print(f"\nAccuracy: {accuracy:.4f}")

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# --------------------------------------------------
# SAVE MODEL
# --------------------------------------------------

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    model,
    MODEL_PATH
)

print("\nModel saved to:")
print(MODEL_PATH)