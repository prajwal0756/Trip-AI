# TripAI Sentiment Analysis Module

A standalone, high-performance real-time sentiment analysis and running aggregation module for **TripAI**—a Nepal-focused homestay and travel recommendation platform. 

This service analyzes incoming homestay reviews, stores the detailed analysis (including per-clause breakdowns and rating-mismatch flags), and incrementally updates a running Bayesian-averaged sentiment rating per homestay.

---

## 🚀 Key Features

* **Multi-Clause Analysis**: Reviews are automatically split on sentence boundaries and contrast conjunctions (both English and Nepali/Romanized Nepali, e.g., `but`, `however`, `tara`, `tarapani`, `तर`, `तापनि`) to correctly evaluate mixed-sentiment reviews (e.g. *"room was clean but service was bad"*).
* **Nepalese Language Support**: Supports English, Romanized Nepali, and native Devanagari script (including Devanagari sentence boundary danda `।` characters).
* **Anti-Fraud & Contact Leak Prevention**:
  * Strips HTML tags from inputs.
  * Rejects promotional links/URLs.
  * Rejects phone numbers (Nepali formats like `98xxxxxxxx`/`97xxxxxxxx` and international patterns) to prevent homestays from bypassing booking fees by leaking contact details in reviews.
* **Opinionated Score Aggregation (Non-Dilution)**: Factual/neutral clauses (e.g., *"It is located in Kathmandu."*) do not dilute the sentiment score intensity of opinionated clauses. Continuous scoring is averaged strictly over opinionated (positive and negative) segments.
* **Rating Mismatch & Sarcasm Mitigation**: Compares computed sentiment to the user's star rating. If they disagree strongly (e.g., 5★ rating with negative text), a `mismatch_flag` is set to `true`, serving as a partial, indirect catch for sarcasm.
* **Incremental Bayesian Aggregation**: Homestay aggregate scores are updated incrementally on each review insertion without querying all reviews from scratch. Weighted scores use a Bayesian rating formula:
  $$\text{weighted\_avg\_score} = \frac{v}{v+m} \cdot R + \frac{m}{v+m} \cdot C$$
  where $v$ is review count, $R$ is homestay average score, $C$ is platform average score, and $m=10$ (minimum-review threshold).

---

## 🛠️ Tech Stack

* **Framework**: FastAPI (Asynchronous lifespan handlers)
* **Model**: `lxyuan/distilbert-base-multilingual-cased-sentiments-student` (via Hugging Face `transformers` pipeline, loaded once at startup)
* **Database**: SQLite with Write-Ahead Logging (WAL) enabled for safe concurrent writes.
* **ORM**: SQLAlchemy 2.0
* **Validation**: Pydantic v2
* **Test Runner**: Pytest

---

## 📦 Directory Structure

```text
sentiment_analysis/
├── app/
│   ├── sentiment/
│   │   ├── __init__.py
│   │   └── analyzer.py     # Clause-splitting & model inference logic
│   ├── __init__.py
│   ├── config.py           # Configuration, thresholds, and variables
│   ├── crud.py             # DB transactions and Bayesian aggregation
│   ├── database.py         # SQLAlchemy engine and WAL mode setups
│   ├── main.py             # FastAPI routing and lifecycle lifespan
│   ├── models.py           # SQLAlchemy database tables
│   └── schemas.py          # Pydantic schema validation & spamblock
├── tests/
│   ├── __init__.py
│   └── test_sentiment.py   # 16 unit & integration tests
├── requirements.txt        # Python dependency manifest
├── run.py                  # Entrypoint runner script
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
Make sure you have Python 3.10+ installed. In your terminal, run:
```bash
pip install -r requirements.txt
```

### 2. Start the Server
Run the FastAPI application using the runner script:
```bash
python run.py
```
*Note: The first launch will take a moment to download the model weight file (~268MB) from the Hugging Face Hub. Subsequent runs will load it instantly from your local cache.*

---

## 🔌 API Endpoints

Once the server starts, you can visit **`http://localhost:8000/docs`** in your browser to interact with the API via the Swagger UI.

### `POST /sentiment/analyze`
Analyzes a review's text and optional star rating. If `review_id` and `homestay_id` are provided, results are saved to the database, and the homestay aggregate is updated.

* **Payload Example**:
  ```json
  {
    "text": "Amazing homestay tara the room was quite cold.",
    "star_rating": 4,
    "review_id": "rev-001",
    "homestay_id": "home-dhulikhel"
  }
  ```
* **Response Example**:
  ```json
  {
    "overall_label": "mixed",
    "overall_score": 0.0891,
    "confidence": 0.8245,
    "clauses": [
      { "text": "Amazing homestay", "label": "positive", "score": 0.9852 },
      { "text": "the room was quite cold", "label": "negative", "score": 0.6638 }
    ],
    "mismatch_flag": false,
    "review_id": "rev-001",
    "homestay_id": "home-dhulikhel"
  }
  ```

### `GET /review/{id}/sentiment`
Retrieves stored analysis results for a specific review.

### `GET /homestay/{id}/sentiment`
Retrieves running aggregated sentiment metrics for a homestay. If the homestay has no reviews, returns a default response matching the platform-wide average score.

---

## 🧪 Running Tests

The test suite runs 16 comprehensive unit and integration tests covering spam block, danda/conjunction clause splitting, Bayesian math, and mismatch limits:
```bash
python -m pytest -v tests/test_sentiment.py
```

---

## ⚠️ Known Scope Limitations

1. **Sarcasm Detection**: Traditional word/clause-level sentiment models cannot reliably detect complex semantic sarcasm (e.g. *"Great, the ceiling fell down"*). The `mismatch_flag` is implemented as an indirect mitigation but is not a complete fix.
2. **Synchronous CPU Inference**: Deep learning inference is CPU-bound and synchronous, meaning high concurrent request loads can cause execution queues. This design choice is tailored for the academic scope of the TripAI project.
