from pathlib import Path

import numpy as np
import pandas as pd

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class EmbeddingService:

    def __init__(
        self,
        model_name="all-MiniLM-L6-v2"
    ):

        # --------------------------------------------------
        # FIND BACKEND DIRECTORY
        # --------------------------------------------------

        BACKEND_DIR = Path(
            __file__
        ).resolve().parents[2]

        embedding_path = (
            BACKEND_DIR
            / "ml"
            / "embeddings"
            / "output"
            / "destination_embeddings.npy"
        )

        metadata_path = (
            BACKEND_DIR
            / "ml"
            / "embeddings"
            / "output"
            / "destination_metadata.csv"
        )

        # --------------------------------------------------
        # LOAD MODEL
        # --------------------------------------------------

        print("Loading embedding model...")

        self.model = SentenceTransformer(
            model_name
        )

        # --------------------------------------------------
        # LOAD EMBEDDINGS
        # --------------------------------------------------

        self.embeddings = np.load(
            embedding_path
        )

        # --------------------------------------------------
        # LOAD METADATA
        # --------------------------------------------------

        self.metadata = pd.read_csv(
            metadata_path
        )

        print(
            "Embedding service loaded successfully."
        )

        print(
            f"Destinations: "
            f"{len(self.metadata)}"
        )

        print(
            f"Embedding shape: "
            f"{self.embeddings.shape}"
        )

    # ======================================================
    # SEARCH
    # ======================================================

    def search(
        self,
        query,
        top_n=5,
        filters=None
    ):
        """
        Perform semantic destination search.

        Optional structured filters:

            district
            province
            category
            activities

        Example:

            filters = {
                "district": "Kaski",
                "province": "Gandaki",
                "category": "Trekking",
                "activities": ["Trekking"]
            }
        """

        # --------------------------------------------------
        # 1. Convert query into embedding
        # --------------------------------------------------

        query_embedding = self.model.encode(
            [query]
        )

        # --------------------------------------------------
        # 2. Calculate cosine similarity
        # --------------------------------------------------

        similarities = cosine_similarity(
            query_embedding,
            self.embeddings
        )[0]

        # --------------------------------------------------
        # 3. Start with every destination as candidate
        # --------------------------------------------------

        candidate_mask = np.ones(
            len(self.metadata),
            dtype=bool
        )

        # --------------------------------------------------
        # 4. Apply structured filters
        # --------------------------------------------------

        if filters:

            # ----------------------------------------------
            # DISTRICT
            # ----------------------------------------------

            district = filters.get(
                "district"
            )

            if district:

                candidate_mask &= (
                    self.metadata["district"]
                    .fillna("")
                    .astype(str)
                    .str.lower()
                    .str.strip()
                    == district.lower().strip()
                )

            # ----------------------------------------------
            # PROVINCE
            # ----------------------------------------------

            province = filters.get(
                "province"
            )

            if province:

                candidate_mask &= (
                    self.metadata["province"]
                    .fillna("")
                    .astype(str)
                    .str.lower()
                    .str.strip()
                    == province.lower().strip()
                )

            # ----------------------------------------------
            # CATEGORY
            # ----------------------------------------------

            category = filters.get(
                "category"
            )

            if category:

                candidate_mask &= (
                    self.metadata["category"]
                    .fillna("")
                    .astype(str)
                    .str.lower()
                    .str.strip()
                    == category.lower().strip()
                )

            # ----------------------------------------------
            # ACTIVITIES
            # ----------------------------------------------

            activities = filters.get(
                "activities",
                []
            )

            if activities:

                def contains_activity(value):

                    if pd.isna(value):
                        return False

                    value = str(
                        value
                    ).lower()

                    return any(
                        activity.lower().strip()
                        in value
                        for activity in activities
                    )

                activity_mask = (
                    self.metadata["activities"]
                    .apply(
                        contains_activity
                    )
                )

                candidate_mask &= (
                    activity_mask
                )

        # --------------------------------------------------
        # 5. Get candidate indices
        # --------------------------------------------------

        candidate_indices = np.where(
            candidate_mask
        )[0]

        # --------------------------------------------------
        # 6. Handle no matches
        # --------------------------------------------------

        if len(candidate_indices) == 0:

            print(
                "No destinations matched "
                "the structured filters."
            )

            return pd.DataFrame(
                columns=[
                    "destination_id",
                    "destination_name",
                    "district",
                    "province",
                    "category",
                    "travel_type",
                    "activities",
                    "description",
                    "similarity_score"
                ]
            )

        # --------------------------------------------------
        # 7. Get similarity scores for candidates
        # --------------------------------------------------

        candidate_scores = (
            similarities[
                candidate_indices
            ]
        )

        # --------------------------------------------------
        # 8. Sort candidates by semantic similarity
        # --------------------------------------------------

        ranking_order = np.argsort(
            candidate_scores
        )[::-1]

        selected_positions = (
            ranking_order[:top_n]
        )

        top_indices = (
            candidate_indices[
                selected_positions
            ]
        )

        # --------------------------------------------------
        # 9. Build result dataframe
        # --------------------------------------------------

        results = self.metadata.iloc[
            top_indices
        ].copy()

        results["similarity_score"] = (
            similarities[top_indices]
        )

        results = results.reset_index(
            drop=True
        )

        # --------------------------------------------------
        # 10. Return useful columns
        # --------------------------------------------------

        return results[
            [
                "destination_id",
                "destination_name",
                "district",
                "province",
                "category",
                "travel_type",
                "activities",
                "description",
                "similarity_score"
            ]
        ]