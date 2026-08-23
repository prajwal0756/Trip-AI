from pathlib import Path
import re

import pandas as pd

from app.core.database import SessionLocal
from app.models.homestay import Homestay


BASE_DIR = Path(__file__).resolve().parent.parent
EXCEL_PATH = BASE_DIR / "homestay.xlsx"


def clean(value):
    if pd.isna(value):
        return None
    return value


def clean_price(value):
    """
    Convert price values such as:

        1015
        "1015"
        "700 (Room only)"
        "1,500 NPR"
        "NPR 1200"

    into numeric NPR values.
    """
    if pd.isna(value):
        return None

    if isinstance(value, (int, float)):
        return float(value)

    value = str(value).strip()

    if not value:
        return None

    # Find the first numeric value.
    match = re.search(r"\d+(?:,\d+)*(?:\.\d+)?", value)

    if not match:
        return None

    number = match.group(0).replace(",", "")

    try:
        return float(number)
    except ValueError:
        return None


def main():
    print(f"Reading: {EXCEL_PATH}")

    df = pd.read_excel(EXCEL_PATH)

    print(f"Rows found: {len(df)}")

    db = SessionLocal()

    try:
        inserted = 0
        updated = 0

        for _, row in df.iterrows():

            homestay_id = str(row["homestay_id"]).strip()

            existing = (
                db.query(Homestay)
                .filter(
                    Homestay.homestay_id == homestay_id
                )
                .first()
            )

            data = {
                "homestay_id": homestay_id,

                "homestay_name": clean(
                    row["homestay_name"]
                ),

                "district": clean(
                    row["district"]
                ),

                "province": clean(
                    row["province"]
                ),

                "municipality": clean(
                    row["municipality"]
                ),

                "address": clean(
                    row["address"]
                ),

                "latitude": clean(
                    row["latitude"]
                ),

                "longitude": clean(
                    row["longitude"]
                ),

                # IMPORTANT:
                # Clean values like "700 (Room only)"
                "price_per_night_npr": clean_price(
                    row["price_per_night_npr"]
                ),

                "key_feature_vibe": clean(
                    row["key_feature_vibe"]
                ),

                "max_guests": clean(
                    row["max_guests"]
                ),

                "room_count": clean(
                    row["room_count"]
                ),

                "meals_available": clean(
                    row["meals_available"]
                ),

                "meal_types": clean(
                    row["meal_types"]
                ),

                "amenities": clean(
                    row["amenities"]
                ),

                "activities": clean(
                    row["activities"]
                ),

                "nearby_attractions": clean(
                    row["nearby_attractions"]
                ),

                "homestay_type": clean(
                    row["homestay_type"]
                ),

                "family_friendly": clean(
                    row["family_friendly"]
                ),

                "rating": clean(
                    row["rating"]
                ),

                "review_count": clean(
                    row["review_count"]
                ),

                "description": clean(
                    row["description"]
                ),
            }

            if existing:

                for key, value in data.items():
                    setattr(existing, key, value)

                updated += 1

            else:

                db.add(
                    Homestay(**data)
                )

                inserted += 1

        db.commit()

        print()
        print("===================================")
        print("Homestay import completed")
        print("===================================")
        print(f"Rows in Excel : {len(df)}")
        print(f"Inserted      : {inserted}")
        print(f"Updated       : {updated}")
        print("===================================")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()

