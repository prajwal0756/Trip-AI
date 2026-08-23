# from sqlalchemy.orm import Session

# from app.models.destination import Destination
# from app.ai.recommendation.model import get_recommendations


# def recommend_destinations(
#     db: Session,
#     destination_name: str,
#     top_n: int = 10,
# ):

#     ai_results = get_recommendations(
#         destination_name,
#         top_n,
#     )

#     final_results = []

#     for item in ai_results:

#         destination = (
#             db.query(Destination)
#             .filter(
#                 Destination.destination_name ==
#                 item["destination_name"]
#             )
#             .first()
#         )

#         if destination:

#             final_results.append(

#                 {
#                     "destination_id":
#                         destination.destination_id,

#                     "destination_name":
#                         destination.destination_name,

#                     "province":
#                         destination.province,

#                     "district":
#                         destination.district,

#                     "category":
#                         destination.category,

#                     "travel_type":
#                         destination.travel_type,

#                     "activities": destination.activities_text,

#                     "best_season":
#                         destination.best_season,

#                     "estimated_budget_npr":
#                         destination.estimated_budget_npr,

#                     "average_rating":
#                         destination.average_rating,

#                     "review_count":
#                         destination.review_count,

#                     "popularity_score":
#                         destination.popularity_score,

#                     "latitude":
#                         destination.latitude,

#                     "longitude":
#                         destination.longitude,

#                     "description":
#                         destination.description,

#                     "similarity_score":
#                         item["similarity_score"],

#                     "final_score":
#                         item["final_score"],

#                 }

#             )

#     return final_results
from sqlalchemy.orm import Session

from app.models.destination import Destination
from app.ai.recommendation.model import get_recommendations


def recommend_destinations(
    db: Session,
    destination_name: str,
    top_n: int = 10,
):

    ai_results = get_recommendations(
        destination_name,
        top_n,
    )

    final_results = []

    for item in ai_results:

        destination = (
            db.query(Destination)
            .filter(
                Destination.destination_name ==
                item["destination_name"]
            )
            .first()
        )

        if destination:

            # ---------------------------------------------
            # Get first available destination image
            # ---------------------------------------------

            image_url = None

            if destination.images:
                image_url = destination.images[0].image_url

            final_results.append(

                {
                    "destination_id":
                        destination.destination_id,

                    "destination_name":
                        destination.destination_name,

                    "province":
                        destination.province,

                    "district":
                        destination.district,

                    "category":
                        destination.category,

                    "travel_type":
                        destination.travel_type,

                    "activities":
                        destination.activities_text,

                    "best_season":
                        destination.best_season,

                    "estimated_budget_npr":
                        destination.estimated_budget_npr,

                    "average_rating":
                        destination.average_rating,

                    "review_count":
                        destination.review_count,

                    "popularity_score":
                        destination.popularity_score,

                    "latitude":
                        destination.latitude,

                    "longitude":
                        destination.longitude,

                    "description":
                        destination.description,

                    # -----------------------------------------
                    # Destination image
                    # -----------------------------------------

                    "image_url":
                        image_url,

                    "similarity_score":
                        item["similarity_score"],

                    "final_score":
                        item["final_score"],
                }

            )

    return final_results