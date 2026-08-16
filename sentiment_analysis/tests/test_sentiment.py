import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import config, database, schemas, models, crud
from app.main import app
from app.sentiment import analyzer

# Use an in-memory SQLite database for test runs to prevent polluting local files.
TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    """
    Creates the database tables before tests and drops them after.
    Loads the Hugging Face model once for the test session.
    """
    models.Base.metadata.create_all(bind=engine)
    analyzer.load_model()  # Ensure model is cached/loaded
    yield
    models.Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """
    Provides a clean database session per test and rolls back transactions
    to keep test cases isolated.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    """
    Provides a FastAPI TestClient with the database dependency overridden.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[database.get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# =====================================================================
# 1. Preprocessing & Input Validation Tests
# =====================================================================

def test_validation_empty_and_whitespace():
    # Empty text
    with pytest.raises(ValueError, match="cannot be empty"):
        schemas.SentimentAnalysisRequest(text="")

    # Whitespace-only text
    with pytest.raises(ValueError, match="cannot be empty"):
        schemas.SentimentAnalysisRequest(text="    \n   \t  ")


def test_validation_repeated_chars_spam():
    # Excessive consecutive characters
    with pytest.raises(ValueError, match="spam"):
        schemas.SentimentAnalysisRequest(text="This place is so goooooodddddddd!")
        
    with pytest.raises(ValueError, match="spam"):
        schemas.SentimentAnalysisRequest(text="aaaaaaaaaaaaa")


def test_validation_all_caps_consonant_gibberish():
    # All caps consonant gibberish
    with pytest.raises(ValueError, match="spam"):
        schemas.SentimentAnalysisRequest(text="BCDFGHJKLMNPQRST")
        
    # All caps abbreviation/word WITH vowels (Should pass validation)
    request = schemas.SentimentAnalysisRequest(text="AMAZING PLACE IN NEPAL")
    assert request.text == "AMAZING PLACE IN NEPAL"


def test_validation_text_normalization():
    # Surrounding whitespace should be trimmed
    request = schemas.SentimentAnalysisRequest(text="   Clean me up   ")
    assert request.text == "Clean me up"


def test_validation_html_stripping():
    request = schemas.SentimentAnalysisRequest(text="<b>Great</b> place with <i>nice view</i>.")
    assert request.text == "Great place with nice view."


def test_validation_promotional_urls_and_contacts():
    # Reject URL promotional links
    with pytest.raises(ValueError, match="contains promotional links"):
        schemas.SentimentAnalysisRequest(text="Visit our website www.spamhomestay.com for discount")
    with pytest.raises(ValueError, match="contains promotional links"):
        schemas.SentimentAnalysisRequest(text="Check this out: https://bookingbypass.com/room")
        
    # Reject contact details (phone numbers)
    with pytest.raises(ValueError, match="contains phone numbers"):
        schemas.SentimentAnalysisRequest(text="Call me directly at 9841234567 for discount!")
    with pytest.raises(ValueError, match="contains phone numbers"):
        schemas.SentimentAnalysisRequest(text="Contact details: +977-9801234567")


# =====================================================================
# 2. Clause Splitting Tests
# =====================================================================

def test_clause_splitting():
    # Split on sentence boundaries
    text_sentence = "Room was tidy. Service was excellent!"
    clauses = analyzer.split_into_clauses(text_sentence)
    assert clauses == ["Room was tidy", "Service was excellent"]

    # Split on contrast conjunctions
    text_conjunction = "The view was beautiful but the bed was uncomfortable."
    clauses = analyzer.split_into_clauses(text_conjunction)
    assert clauses == ["The view was beautiful", "the bed was uncomfortable"]

    # Split on mixed sentence + conjunctions
    text_mixed = "The hosts were super friendly, however the room was cold. We still liked it though it was far."
    clauses = analyzer.split_into_clauses(text_mixed)
    assert clauses == [
        "The hosts were super friendly",
        "the room was cold",
        "We still liked it",
        "it was far"
    ]

    # Split on Romanized Nepali contrast conjunctions
    text_nepali = "Room ramro thyo tara toilet safa thiyena"
    clauses = analyzer.split_into_clauses(text_nepali)
    assert clauses == ["Room ramro thyo", "toilet safa thiyena"]

    # Split on Devanagari script contrast conjunctions
    text_devanagari = "कोठा सफा थियो तर बाथरुम सानो थियो।"
    clauses = analyzer.split_into_clauses(text_devanagari)
    assert clauses == ["कोठा सफा थियो", "बाथरुम सानो थियो"]


# =====================================================================
# 3. Sentiment Analyzer Core & Coercion Tests
# =====================================================================

def test_sentiment_coercion_to_neutral():
    # "It was okay" generally returns low-confidence positive in this model.
    # It should be coerced to neutral.
    res = analyzer.analyze_review_sentiment("It was okay")
    assert res["overall_label"] == "neutral"
    
    # Check that high confidence positive keeps positive label
    res_pos = analyzer.analyze_review_sentiment("The room was absolutely amazing and beautiful!")
    assert res_pos["overall_label"] == "positive"


def test_sentiment_combination_mixed():
    # Mixed positive and negative clauses
    text = "The room was beautiful but the service was terrible."
    res = analyzer.analyze_review_sentiment(text)
    assert res["overall_label"] == "mixed"
    # Overall score should be close to 0 (average of positive and negative clause values)
    assert -0.5 < res["overall_score"] < 0.5


# =====================================================================
# 4. Mismatch Flag & Sarcasm Tests (The Academic Limitations)
# =====================================================================

def test_mismatch_flag():
    # Case A: Positive text but rating is low (1 or 2 stars) -> Mismatch
    res_mismatch_1 = analyzer.analyze_review_sentiment(
        text="The room was absolutely amazing and beautiful!",
        star_rating=1
    )
    assert res_mismatch_1["mismatch_flag"] is True

    # Case B: Negative text but rating is high (4 or 5 stars) -> Mismatch
    res_mismatch_2 = analyzer.analyze_review_sentiment(
        text="The service was completely terrible and the room was dirty.",
        star_rating=5
    )
    assert res_mismatch_2["mismatch_flag"] is True

    # Case C: Positive text and high rating -> No Mismatch
    res_match_pos = analyzer.analyze_review_sentiment(
        text="The room was absolutely amazing and beautiful!",
        star_rating=5
    )
    assert res_match_pos["mismatch_flag"] is False


def test_sarcasm_limitation_demonstration():
    """
    Demonstrates the known, explicit limitation that word-level models cannot reliably 
    detect sarcasm, and shows how the mismatch_flag acts as a partial mitigation.
    """
    # Sarcastic text that scores positive/neutral but has a 1-star rating:
    sarcastic_review = "Great, the ceiling leaked all night and soaked my bags."
    
    # 1. Run inference
    res = analyzer.analyze_review_sentiment(sarcastic_review, star_rating=1)
    
    # Because "Great" starts the sentence, a word-level sentiment model may score the text
    # as positive or neutral (low confidence).
    # If overall score is positive or neutral, the mismatch flag will mitigate this when combined
    # with the 1-star rating.
    # Let's inspect the outcome.
    print(f"Sarcastic review label: {res['overall_label']}, score: {res['overall_score']}, mismatch: {res['mismatch_flag']}")
    
    # Mismatch flag should be triggered if the model incorrectly evaluates it as positive
    # due to the word "Great", when rating is 1. If the model successfully evaluates it as negative,
    # then it matches the 1 star rating (mismatch is False, which is correct as the sentiment is indeed negative).
    # Either way, we show that the combination of rating + text captures the user's negative experience.
    if res["overall_label"] == "positive":
        assert res["mismatch_flag"] is True


# =====================================================================
# 5. FastAPI Endpoints & Integration Tests
# =====================================================================

def test_api_analyze_without_saving(client):
    payload = {
        "text": "The homestay was clean and the host was welcoming.",
        "star_rating": 4
    }
    response = client.post("/sentiment/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_label"] == "positive"
    assert data["mismatch_flag"] is False
    assert len(data["clauses"]) >= 1


def test_api_analyze_and_store(client, db_session):
    review_id = "rev-101"
    homestay_id = "home-999"
    payload = {
        "text": "The location was bad but the view was beautiful.",
        "star_rating": 3,
        "review_id": review_id,
        "homestay_id": homestay_id
    }
    
    # 1. Submit review
    response = client.post("/sentiment/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_label"] == "mixed"
    
    # 2. Check that it was saved
    db_review = crud.get_review_sentiment(db_session, review_id)
    assert db_review is not None
    assert db_review.overall_label == "mixed"
    assert db_review.homestay_id == homestay_id
    
    # 3. Retrieve from endpoint
    get_res = client.get(f"/review/{review_id}/sentiment")
    assert get_res.status_code == 200
    assert get_res.json()["overall_label"] == "mixed"


def test_api_duplicate_review_rejected(client):
    payload = {
        "text": "Good place.",
        "review_id": "duplicate-id",
        "homestay_id": "home-1"
    }
    # First request
    res1 = client.post("/sentiment/analyze", json=payload)
    assert res1.status_code == 200
    
    # Second request with same review_id
    res2 = client.post("/sentiment/analyze", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


# =====================================================================
# 6. Database Incremental Aggregation & Bayesian Rating Tests
# =====================================================================

def test_incremental_aggregation_math(client, db_session):
    homestay_id = "bayesian-test-homestay"
    
    # Calculate baseline platform average (initially no reviews, so fallback is 0.0)
    baseline_avg = crud.get_platform_average_score(db_session)
    assert baseline_avg == config.DEFAULT_PLATFORM_AVG_SCORE
    
    # Insert Review 1 (Positive, score = 0.9)
    # The platform-wide average after this review will be 0.9.
    res1 = client.post("/sentiment/analyze", json={
        "text": "Absolutely fantastic!",
        "review_id": "rev-b1",
        "homestay_id": homestay_id
    })
    assert res1.status_code == 200
    score1 = res1.json()["overall_score"]
    
    # Check that aggregate was created
    agg = crud.get_homestay_sentiment_agg(db_session, homestay_id)
    assert agg is not None
    assert agg.pos_count == 1
    assert agg.neg_count == 0
    # For v = 1 and m = 10, C = score1 (since only 1 review exists platform-wide).
    # Formula: (1 / 11) * score1 + (10 / 11) * score1 = score1.
    assert pytest.approx(agg.weighted_avg_score, rel=1e-4) == score1
    
    # Insert Review 2 (Negative, score = -0.8)
    # The platform-wide average will now be: (score1 + score2) / 2
    res2 = client.post("/sentiment/analyze", json={
        "text": "Very bad experience.",
        "review_id": "rev-b2",
        "homestay_id": homestay_id
    })
    assert res2.status_code == 200
    score2 = res2.json()["overall_score"]
    
    # Fetch updated aggregate
    agg_updated = crud.get_homestay_sentiment_agg(db_session, homestay_id)
    assert agg_updated.pos_count == 1
    assert agg_updated.neg_count == 1
    
    # Incremental R (raw average) = (score1 + score2) / 2
    R = (score1 + score2) / 2
    assert pytest.approx(agg_updated.avg_score, rel=1e-4) == R
    
    # Platform average C = R (since only these two reviews exist in the system)
    C = crud.get_platform_average_score(db_session)
    assert pytest.approx(C, rel=1e-4) == R
    
    # Weighted average score = (2 / 12) * R + (10 / 12) * C = R
    assert pytest.approx(agg_updated.weighted_avg_score, rel=1e-4) == R


def test_get_non_existent_homestay_aggregate(client):
    # If homestay doesn't exist, we return a default object with 0 counts 
    # and weighted_avg_score equal to platform average (0.0 initially here)
    response = client.get("/homestay/non-existent-homestay/sentiment")
    assert response.status_code == 200
    data = response.json()
    assert data["homestay_id"] == "non-existent-homestay"
    assert data["pos_count"] == 0
    assert data["total_reviews"] == 0
    assert data["weighted_avg_score"] == 0.0
