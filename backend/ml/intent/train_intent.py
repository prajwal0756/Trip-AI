from pathlib import Path
import json
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from collections import Counter
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

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

y_pred = model.predict(X_test)


# =====================================================
# MODEL EVALUATION
# =====================================================

accuracy = accuracy_score(y_test, y_pred)

precision_macro = precision_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0
)

recall_macro = recall_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0
)

f1_macro = f1_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0
)

precision_weighted = precision_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0
)

recall_weighted = recall_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0
)

f1_weighted = f1_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0
)


print("\n" + "=" * 60)
print("INTENT CLASSIFICATION EVALUATION")
print("=" * 60)

print(f"Accuracy           : {accuracy:.4f}")
print(f"Macro Precision    : {precision_macro:.4f}")
print(f"Macro Recall       : {recall_macro:.4f}")
print(f"Macro F1-score     : {f1_macro:.4f}")
print(f"Weighted Precision : {precision_weighted:.4f}")
print(f"Weighted Recall    : {recall_weighted:.4f}")
print(f"Weighted F1-score  : {f1_weighted:.4f}")


print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        digits=4,
        zero_division=0
    )
)
# =====================================================
# CONFUSION MATRIX
# =====================================================

import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix

# Keep the original class names for the model
labels = [
    "accommodation_search",
    "activity_search",
    "destination_information",
    "destination_search",
    "greeting",
    "recommendation",
    "similar_destination"
]

# Human-readable labels for the figure
display_labels = [
    "Accommodation\nSearch",
    "Activity\nSearch",
    "Destination\nInformation",
    "Destination\nSearch",
    "Greeting",
    "Recommendation",
    "Similar\nDestination"
]

cm = confusion_matrix(y_test, y_pred, labels=labels)

plt.figure(figsize=(12, 9))

ax = sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=display_labels,
    yticklabels=display_labels,
    cbar=True,
    linewidths=0.5,
    linecolor="white",
    annot_kws={"size": 14}
)

plt.title(
    "Confusion Matrix - TripAI Intent Classification",
    fontsize=18,
    fontweight="bold",
    pad=15
)

plt.xlabel(
    "Predicted Intent",
    fontsize=14,
    fontweight="bold",
    labelpad=12
)

plt.ylabel(
    "Actual Intent",
    fontsize=14,
    fontweight="bold",
    labelpad=12
)

plt.xticks(
    rotation=25,
    ha="right",
    fontsize=11
)

plt.yticks(
    rotation=0,
    fontsize=11
)

plt.tight_layout()
os.makedirs("evaluation", exist_ok=True)
plt.savefig(
    "evaluation/confusion.png",
    dpi=300,
    bbox_inches="tight"
)

plt.close()

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

# =====================================================
# SAVE METRICS
# =====================================================

