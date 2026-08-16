from pathlib import Path
import sys


# --------------------------------------------------
# PROJECT ROOT
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# --------------------------------------------------
# IMPORT FRIEND'S NLP
# --------------------------------------------------

from nlp.orchestrator import NLPOrchestrator


class NLPService:

    def __init__(self):

        print("Loading TripAI NLP service...")

        self.orchestrator = NLPOrchestrator()

        print("NLP service loaded successfully.")

    def parse(self, text: str):

        if not text or not text.strip():
            raise ValueError(
                "Query cannot be empty."
            )

        return self.orchestrator.route_and_parse(
            text.strip()
        )