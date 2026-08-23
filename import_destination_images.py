from pathlib import Path
import re
import shutil
import psycopg2

# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path("/Users/prajwalsubedi/Desktop/MinorProject_TripAi")

SOURCE_FOLDERS = [
    Path("/Users/prajwalsubedi/Desktop/TripAI model/images"),
    Path("/Users/prajwalsubedi/Desktop/TripAI model/images (1)"),
]

DESTINATION_FOLDER = PROJECT_ROOT / "public" / "destination-images"

DATABASE_URL = "postgresql://postgres:tripai%40@localhost:5433/tripai"

VALID_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".jfif",
}

# ============================================================
# EXTRACT DESTINATION ID
# ============================================================

def extract_destination_id(filename):
    stem = Path(filename).stem.strip()

    # img119.jpg -> 119
    match = re.match(r"^img(\d+)", stem, re.IGNORECASE)
    if match:
        return int(match.group(1))

    # 708 - Name.jpg
    # 926Saljhandi.jpg
    # 941.jfif
    # 1723.Bhardaha.jfif
    match = re.match(r"^(\d+)", stem)
    if match:
        return int(match.group(1))

    return None


# ============================================================
# FIND ALL IMAGES
# ============================================================

image_files = []

for folder in SOURCE_FOLDERS:

    if not folder.exists():
        print(f"WARNING: Folder not found: {folder}")
        continue

    for file in folder.rglob("*"):

        if not file.is_file():
            continue

        if file.suffix.lower() not in VALID_EXTENSIONS:
            continue

        destination_id = extract_destination_id(file.name)

        if destination_id is None:
            print(f"SKIP - No destination ID: {file.name}")
            continue

        image_files.append(
            (destination_id, file)
        )


print()
print("=" * 60)
print("TripAI Destination Image Import")
print("=" * 60)
print(f"Images with detected destination IDs: {len(image_files)}")
print()


# ============================================================
# CONNECT DATABASE
# ============================================================

try:

    connection = psycopg2.connect(
        DATABASE_URL
    )

    cursor = connection.cursor()

except Exception as error:

    print("DATABASE CONNECTION FAILED")
    print(error)
    raise SystemExit(1)


# ============================================================
# GET VALID DESTINATION IDS
# ============================================================

cursor.execute(
    "SELECT destination_id FROM destinations"
)

valid_destination_ids = {
    row[0]
    for row in cursor.fetchall()
}


print(
    f"Destinations in database: "
    f"{len(valid_destination_ids)}"
)

print()


# ============================================================
# CREATE DESTINATION IMAGE DIRECTORY
# ============================================================

DESTINATION_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# IMPORT
# ============================================================

inserted = 0
skipped_existing = 0
invalid_destination = 0
copied = 0


for destination_id, source_file in image_files:

    # --------------------------------------------------------
    # Verify destination exists
    # --------------------------------------------------------

    if destination_id not in valid_destination_ids:

        print(
            f"SKIP - Destination {destination_id} "
            f"does not exist: {source_file.name}"
        )

        invalid_destination += 1
        continue


    # --------------------------------------------------------
    # Preserve filename but make it safe for URL usage
    # --------------------------------------------------------

    safe_filename = source_file.name

    destination_file = (
        DESTINATION_FOLDER /
        safe_filename
    )


    # --------------------------------------------------------
    # Copy image if it isn't already there
    # --------------------------------------------------------

    if not destination_file.exists():

        shutil.copy2(
            source_file,
            destination_file
        )

        copied += 1


    # --------------------------------------------------------
    # URL used by React
    # --------------------------------------------------------

    image_url = (
        f"/destination-images/{safe_filename}"
    )


    # --------------------------------------------------------
    # Check whether this exact image is already in DB
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT image_id
        FROM images
        WHERE destination_id = %s
        AND image_url = %s
        """,
        (
            destination_id,
            image_url,
        ),
    )

    existing = cursor.fetchone()


    if existing:

        skipped_existing += 1
        continue


    # --------------------------------------------------------
    # Insert image
    # --------------------------------------------------------

    cursor.execute(
        """
        INSERT INTO images
        (
            destination_id,
            image_url,
            image_type
        )
        VALUES
        (
            %s,
            %s,
            %s
        )
        """,
        (
            destination_id,
            image_url,
            source_file.suffix.lower().replace(".", ""),
        ),
    )

    inserted += 1

    print(
        f"ADDED  {destination_id} -> "
        f"{source_file.name}"
    )


# ============================================================
# COMMIT
# ============================================================

connection.commit()

cursor.close()
connection.close()


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 60)
print("IMPORT COMPLETE")
print("=" * 60)

print(f"Images detected:       {len(image_files)}")
print(f"Images copied:         {copied}")
print(f"Database rows added:   {inserted}")
print(f"Already existed:       {skipped_existing}")
print(f"Invalid destination:   {invalid_destination}")

print()
print(
    f"Images are available at:"
)
print(
    DESTINATION_FOLDER
)
print()
