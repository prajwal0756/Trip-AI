from typing import Dict, Any
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.destination import Destination
from pathlib import Path
import pandas as pd
from ml.intent.intent_service import IntentService
from ml.nlp_service import NLPService
from ml.embeddings.embedding_service import EmbeddingService
from ml.recommendation.combined_recommendation import (
    feature_recommend,
    query_recommend,
)
# ==================================================
# DATABASE
# ==================================================

BASE_DIR = Path(__file__).resolve().parents[2]

DATABASE_PATH = (
    BASE_DIR
    / "backend"
    / "app"
    / "ai"
    / "recommendation"
    / "database.csv"
)


class AIPipeline:

    def __init__(self):

        print("Loading TripAI AI pipeline...")

        # ----------------------------------------------
        # Load services
        # ----------------------------------------------

        self.intent_service = IntentService()

        self.nlp_service = NLPService()

        self.destination_df = pd.read_csv(DATABASE_PATH)



        print("TripAI AI pipeline loaded successfully.")

    def _filter_destinations(self, nlp_result):
        """
        Filter destination database using structured
        location information extracted by the NLP pipeline.
        """

        df = self.destination_df.copy()

        location = nlp_result.get("location")
        district = nlp_result.get("district")
        province = nlp_result.get("province")

        # --------------------------------------------------
        # 1. District has highest priority
        # --------------------------------------------------

        if district:
            district_lower = district.strip().lower()

            df = df[
                df["district"]
                .astype(str)
                .str.strip()
                .str.lower()
                == district_lower
            ]

            return df

        # --------------------------------------------------
        # 2. Province
        # --------------------------------------------------

        if province:
            province_lower = province.strip().lower()

            df = df[
                df["province"]
                .astype(str)
                .str.strip()
                .str.lower()
                == province_lower
            ]

            return df

        # --------------------------------------------------
        # 3. Location
        # --------------------------------------------------

        if location:

            location_lower = (
                location.strip().lower()
            )

            # Destination name
            mask = (
                df["destination_name"]
                .astype(str)
                .str.strip()
                .str.lower()
                .str.contains(
                    location_lower,
                    regex=False
                )
            )

            # If not found, try district
            if not mask.any():

                mask = (
                    df["district"]
                    .astype(str)
                    .str.strip()
                    .str.lower()
                    == location_lower
                )

            # If not found, try province
            if not mask.any():

                mask = (
                    df["province"]
                    .astype(str)
                    .str.strip()
                    .str.lower()
                    == location_lower
                )

            df = df[mask]

        return df

    # ==================================================
    # MAIN ENTRY POINT
    # ==================================================

    def process(self, query: str) -> Dict[str, Any]:

        if not query or not query.strip():
            raise ValueError(
                "Query cannot be empty."
            )

        query = query.strip()

        # ----------------------------------------------
        # 1. Intent classification
        # ----------------------------------------------

        intent_result = self.intent_service.predict(
            query
        )

        intent = str(
            intent_result["intent"]
        )

        intent_confidence = float(
            intent_result["confidence"]
        )

        # ----------------------------------------------
        # 2. Route according to intent
        # ----------------------------------------------

        if intent == "recommendation":

            return self._recommendation(
                query,
                intent,
                intent_confidence
            )

        elif intent == "similar_destination":

            return self._similar_destination(
                query,
                intent,
                intent_confidence
            )

        elif intent == "destination_information":

            return self._destination_information(
                query,
                intent,
                intent_confidence
            )

        elif intent == "destination_search":

            return self._destination_search(
                query,
                intent,
                intent_confidence
            )

        elif intent == "activity_search":

            return self._activity_search(
                query,
                intent,
                intent_confidence
            )

        elif intent == "accommodation_search":

            return self._accommodation_search(
                query,
                intent,
                intent_confidence
            )

        elif intent == "greeting":

            return self._greeting(
                query,
                intent,
                intent_confidence
            )

        # ----------------------------------------------
        # Unknown intent fallback
        # ----------------------------------------------

        return {
            "query": query,
            "intent": {
                "name": intent,
                "confidence": intent_confidence
            },
            "response_type": "recommendation",
            "results": []
        }

    # ==================================================
    # RECOMMENDATION
    # ==================================================

    def _recommendation(
        self,
        query: str,
        intent: str,
        intent_confidence: float
    ):

        # ----------------------------------------------
        # NLP extraction
        # ----------------------------------------------

        nlp_result = self.nlp_service.parse(
            query
        )

        # ----------------------------------------------
        # Semantic + structured recommendation
        # ----------------------------------------------

        results = query_recommend(
            query=query,
            nlp_result=nlp_result,
            top_n=10
        )

        # ----------------------------------------------
        # Attach destination images from PostgreSQL
        # ----------------------------------------------

        db = SessionLocal()

        try:
            image_map = {}

            destination_ids = (
                results["destination_id"]
                .dropna()
                .astype(int)
                .tolist()
                if "destination_id" in results.columns
                else []
            )

            if destination_ids:

                destinations = (
                    db.query(Destination)
                    .filter(
                        Destination.destination_id.in_(
                            destination_ids
                        )
                    )
                    .all()
                )

                for destination in destinations:

                    image_url = None

                    if destination.images:
                        image_url = (
                            destination.images[0].image_url
                        )

                    image_map[
                        destination.destination_id
                    ] = image_url

            if image_map:

                results = results.copy()

                results["image_url"] = (
                    results["destination_id"]
                    .astype(int)
                    .map(image_map)
                )

        finally:
            db.close()

        return {
            "query": query,

            "intent": {
                "name": intent,
                "confidence": intent_confidence
            },

            "response_type": "recommendation",

            "nlp": {
                "destination": nlp_result.get(
                    "destination"
                ),

                "location": nlp_result.get(
                    "location"
                ),

                "district": nlp_result.get(
                    "district"
                ),

                "province": nlp_result.get(
                    "province"
                ),

                "category": nlp_result.get(
                    "category"
                ),

                "activities": nlp_result.get(
                    "activities",
                    []
                ),

                "difficulty_level": nlp_result.get(
                    "difficulty_level"
                ),

                "group_type": nlp_result.get(
                    "group_type"
                ),

                "mood_tags": nlp_result.get(
                    "mood_tags",
                    []
                ),

                "duration_days": nlp_result.get(
                    "duration_days"
                ),

                "budget_npr": nlp_result.get(
                    "budget_npr"
                )
            },

            "results": self._dataframe_to_records(
                results
            )
        }

    # ==================================================
    # SIMILAR DESTINATION
    # ==================================================

    def _similar_destination(
        self,
        query: str,
        intent: str,
        intent_confidence: float
    ):

        # Extract possible destination from NLP
        nlp_result = self.nlp_service.parse(
            query
        )

        destination = nlp_result.get(
            "destination"
        )

        if not destination:

            # Try location if destination was not
            # directly recognized.
            destination = nlp_result.get(
                "location"
            )

        if not destination:

            return {
                "query": query,
                "intent": {
                    "name": intent,
                    "confidence": intent_confidence
                },
                "response_type": "similar_destination",
                "error": (
                    "Please specify a destination "
                    "to find similar places."
                ),
                "results": []
            }

        try:

            results = feature_recommend(
                destination_name=destination,
                top_n=10
            )

        except ValueError as exc:

            return {
                "query": query,
                "intent": {
                    "name": intent,
                    "confidence": intent_confidence
                },
                "response_type": "similar_destination",
                "error": str(exc),
                "results": []
            }

        return {
            "query": query,

            "intent": {
                "name": intent,
                "confidence": intent_confidence
            },

            "response_type": "similar_destination",

            "destination": destination,

            "results": self._dataframe_to_records(
                results
            )
        }

    # ==================================================
    # DESTINATION INFORMATION
    # ==================================================

    def _destination_information(
        self,
        query: str,
        intent: str,
        intent_confidence: float
    ):

        nlp_result = self.nlp_service.parse(
            query
        )

        destination = nlp_result.get(
            "destination"
        )

        location = nlp_result.get(
            "location"
        )

        search_name = (
            destination
            or location
        )

        if not search_name:

            return {
                "query": query,

                "intent": {
                    "name": intent,
                    "confidence": intent_confidence
                },

                "response_type":
                    "destination_information",

                "error":
                    "Please specify a destination.",

                "destination": None
            }

        search_lower = (
            search_name
            .lower()
            .strip()
        )

        df = self.destination_df.copy()

        # Exact destination match
        destination_names = (
            df["destination_name"]
            .astype(str)
            .str.strip()
            .str.lower()
        )

        matches = df[
            destination_names == search_lower
        ]

        # --------------------------------------------------
        # If exact match fails, try partial match
        # --------------------------------------------------

        if matches.empty:

            matches = df[
                destination_names.str.contains(
                    search_lower,
                    regex=False
                )
            ]

        # --------------------------------------------------
        # If still not found, try first part of location
        # --------------------------------------------------

        if matches.empty and "(" in search_lower:

            base_name = (
                search_lower
                .split("(")[0]
                .strip()
            )

            matches = df[
                destination_names.str.contains(
                    base_name,
                    regex=False
                )
            ]
    

        # If exact match doesn't exist,
        # search partial name.
        if matches.empty:

            matches = df[
                df["destination_name"]
                .astype(str)
                .str.lower()
                .str.contains(
                    search_lower,
                    regex=False
                )
            ]

        if matches.empty:

            return {
                "query": query,

                "intent": {
                    "name": intent,
                    "confidence": intent_confidence
                },

                "response_type":
                    "destination_information",

                "error":
                    f"Destination '{search_name}' "
                    "was not found.",

                "destination": search_name
            }

        row = matches.iloc[0]

        return {
            "query": query,

            "intent": {
                "name": intent,
                "confidence": intent_confidence
            },

            "response_type":
                "destination_information",

            "destination":
                row["destination_name"],

            "information": {
                "district":
                    row["district"],

                "province":
                    row["province"],

                "category":
                    row["category"],

                "travel_type":
                    row["travel_type"],

                "activities":
                    row["activities"],

                "best_season":
                    row["best_season"],

                "estimated_budget_npr":
                    int(row["estimated_budget_npr"]),

                "average_duration_days":
                    int(row["average_duration_days"]),

                "difficulty_level":
                    row["difficulty_level"],

                "family_friendly":
                    row["family_friendly"],

                "average_rating":
                    int(row["average_rating"]),

                "review_count":
                    int(row["review_count"]),

                "description":
                    row["description"]
            }
        }

        print("\n[DEBUG DESTINATION INFORMATION]")

        print("NLP destination:")
        print(nlp_result.get("destination"))

        print("NLP location:")
        print(nlp_result.get("location"))

        print("NLP district:")
        print(nlp_result.get("district"))

        print("NLP province:")
        print(nlp_result.get("province"))

        print("\nDatabase matching:")
        print(
            self.destination_df[
                self.destination_df["destination_name"]
                .astype(str)
                .str.lower()
                .str.contains(
                    "mustang",
                    regex=False
                )
            ][
                [
                    "destination_name",
                    "district",
                    "province"
                ]
            ]
        )

    # ==================================================
    # DESTINATION SEARCH
    # ==================================================

    def _destination_search(
        self,
        query: str,
        intent: str,
        intent_confidence: float):

        nlp_result = self.nlp_service.parse(
            query
        )

        df = self._filter_destinations(
            nlp_result
        )

        results = df[
            [
                "destination_id",
                "destination_name",
                "district",
                "province",
                "category",
                "travel_type",
                "activities",
                "average_rating",
                "popularity_score",
                "description"
            ]
        ].copy()

        results = results.sort_values(
            by=[
                "popularity_score",
                "average_rating"
            ],
            ascending=False
        )

        results = results.head(
            20
        )

        return {
            "query": query,

            "intent": {
                "name": intent,
                "confidence": intent_confidence
            },

            "response_type": "destination_search",

            "location": nlp_result.get(
                "location"
            ),

            "district": nlp_result.get(
                "district"
            ),

            "province": nlp_result.get(
                "province"
            ),

            "results": self._dataframe_to_records(
                results
            )
        }

        # ----------------------------------------------
        # District
        # ----------------------------------------------

        if district:

            df = df[
                df["district"]
                .astype(str)
                .str.lower()
                .str.strip()
                ==
                district.lower().strip()
            ]

        # ----------------------------------------------
        # Province
        # ----------------------------------------------

        elif province:

            df = df[
                df["province"]
                .astype(str)
                .str.lower()
                .str.strip()
                ==
                province.lower().strip()
            ]

        # ----------------------------------------------
        # Location / destination
        # ----------------------------------------------

        elif location:

            location_lower = (
                location.lower().strip()
            )

            mask = (
                df["destination_name"]
                .astype(str)
                .str.lower()
                .str.contains(
                    location_lower,
                    regex=False
                )
            )

            if not mask.any():

                # Try district
                mask = (
                    df["district"]
                    .astype(str)
                    .str.lower()
                    .str.strip()
                    ==
                    location_lower
                )

            if not mask.any():

                # Try province
                mask = (
                    df["province"]
                    .astype(str)
                    .str.lower()
                    .str.strip()
                    ==
                    location_lower
                )

            df = df[mask]

        return df
    # ==================================================
    # ACTIVITY SEARCH
    # ==================================================

    def _activity_search(
        self,
        query: str,
        intent: str,
        intent_confidence: float):

        nlp_result = self.nlp_service.parse(
            query
        )

        df = self._filter_destinations(
            nlp_result
        )

        # ----------------------------------------------
        # Extract activities
        # ----------------------------------------------

        activity_counts = {}

        for activity_string in (
            df["activities"]
            .dropna()
            .astype(str)
        ):

            activities = [
                item.strip()
                for item in activity_string.split(",")
                if item.strip()
            ]

            for activity in activities:

                activity_counts[activity] = (
                    activity_counts.get(
                        activity,
                        0
                    ) + 1
                )

        activities = sorted(
            activity_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )

        activity_names = [
            item[0]
            for item in activities
        ]

    # ----------------------------------------------
    # Destination results
    # ----------------------------------------------

        results = df[
            [
                "destination_id",
                "destination_name",
                "district",
                "province",
                "category",
                "activities",
                "description",
                "average_rating",
                "popularity_score"
            ]
        ].copy()

        results = results.sort_values(
            by=[
                "average_rating",
                "popularity_score"
            ],
            ascending=False
        )

        results = results.head(
            10
        )

        return {
            "query": query,

            "intent": {
                "name": intent,
                "confidence": intent_confidence
            },

            "response_type": "activity_search",

            "location": nlp_result.get(
                "location"
            ),

            "district": nlp_result.get(
                "district"
            ),

            "province": nlp_result.get(
                "province"
            ),

            "activities": activity_names,

            "results": self._dataframe_to_records(
                results
            )
        }
    # ==================================================
    # ACCOMMODATION SEARCH
    # ==================================================

    def _accommodation_search(
        self,
        query: str,
        intent: str,
        intent_confidence: float
    ):
        """
        Accommodation search placeholder.

        Accommodation/homestay data is not currently available,
        so this feature is intentionally deferred to a later phase.
        """

        return {
            "query": query,

            "intent": {
                "name": intent,
                "confidence": intent_confidence
            },

            "response_type": "accommodation_search",

            "message": (
                "Accommodation recommendations are not available "
                "yet. This feature will be added in a future version."
            ),

            "results": []
        }

    # ==================================================
    # GREETING
    # ==================================================

    def _greeting(
        self,
        query: str,
        intent: str,
        intent_confidence: float
    ):

        return {
            "query": query,

            "intent": {
                "name": intent,
                "confidence": intent_confidence
            },

            "response_type": "greeting",

            "message": (
                "Hello! I'm TripAI. "
                "I can help you find destinations, "
                "activities, accommodation, and "
                "similar places in Nepal."
            ),

            "results": []
        }

    # ==================================================
    # DATAFRAME → JSON
    # ==================================================

    @staticmethod
    def _dataframe_to_records(
        dataframe
    ):

        if dataframe is None:
            return []

        if dataframe.empty:
            return []

        records = dataframe.to_dict(
            orient="records"
        )

        # Convert NumPy values to normal
        # Python values where possible.
        cleaned = []

        for record in records:

            cleaned_record = {}

            for key, value in record.items():

                if hasattr(
                    value,
                    "item"
                ):

                    try:
                        value = value.item()

                    except Exception:
                        pass

                cleaned_record[key] = value

            cleaned.append(
                cleaned_record
            )

        return cleaned