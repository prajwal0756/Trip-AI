from pathlib import Path

import joblib


class IntentService:

    def __init__(self):

        # Find this directory:
        # backend/ml/intent/
        BASE_DIR = Path(__file__).resolve().parent

        # Load trained model
        model_path = (
            BASE_DIR
            / "model"
            / "intent_classifier.pkl"
        )

        self.model = joblib.load(model_path)

        print("Intent classifier loaded successfully.")


    def predict(self, text: str):

        # Clean user input
        text = text.strip()

        if not text:
            raise ValueError(
                "Input text cannot be empty."
            )

        # Predict intent
        intent = self.model.predict(
            [text]
        )[0]

        # Get probability for every intent
        probabilities = self.model.predict_proba(
            [text]
        )[0]

        # Get highest probability
        confidence = probabilities.max()

        return {
            "text": text,
            "intent": intent,
            "confidence": float(confidence)
        }