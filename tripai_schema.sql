
-- TripAI PostgreSQL Schema
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    phone_number VARCHAR(30),
    role VARCHAR(30) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destinations (
    destination_id INTEGER PRIMARY KEY,
    destination_name VARCHAR(200) NOT NULL,
    district VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    category VARCHAR(255),
    travel_type VARCHAR(100),
    activities TEXT,
    best_season VARCHAR(100),
    estimated_budget_npr INTEGER,
    average_duration_days INTEGER,
    difficulty_level VARCHAR(50),
    family_friendly BOOLEAN,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating BETWEEN 0 AND 5),
    review_count INTEGER DEFAULT 0,
    popularity_score DECIMAL(5,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activities (
    activity_id SERIAL PRIMARY KEY,
    activities VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
    image_id SERIAL PRIMARY KEY,
    destination_id INTEGER NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    image_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    destination_id INTEGER NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    review_text TEXT,
    rating_value INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    destination_id INTEGER NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id,destination_id)
);

CREATE TABLE destination_category (
    destination_category_id SERIAL PRIMARY KEY,
    destination_id INTEGER NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    UNIQUE(destination_id,category_id)
);

CREATE TABLE destination_activity (
    destination_activity_id SERIAL PRIMARY KEY,
    destination_id INTEGER NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
    UNIQUE(destination_id,activity_id)
);

CREATE TABLE homestays (
    homestay_id SERIAL PRIMARY KEY,
    destination_id INTEGER NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    homestay_name VARCHAR(200) NOT NULL,
    owner_name VARCHAR(150),
    description TEXT,
    address TEXT,
    contact_number VARCHAR(30),
    price_per_night_npr INTEGER,
    capacity INTEGER,
    facilities TEXT,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating BETWEEN 0 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE homestay_images (
    image_id SERIAL PRIMARY KEY,
    homestay_id INTEGER NOT NULL REFERENCES homestays(homestay_id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE homestay_reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    homestay_id INTEGER NOT NULL REFERENCES homestays(homestay_id) ON DELETE CASCADE,
    review_text TEXT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE search_history (
    search_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    search_text VARCHAR(255) NOT NULL,
    search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result_count INTEGER DEFAULT 0
);

CREATE TABLE sentiment_analysis (
    sentiment_id SERIAL PRIMARY KEY,
    review_id INTEGER UNIQUE NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
    sentiment_label VARCHAR(50),
    sentiment_score DECIMAL(5,4),
    extracted_keywords TEXT,
    analyzed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destination_embeddings (
    embedding_id SERIAL PRIMARY KEY,
    destination_id INTEGER UNIQUE NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    tag_embedding TEXT,
    ranking_embedding TEXT,
    model_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dest_name ON destinations(destination_name);
CREATE INDEX idx_dest_province ON destinations(province);
CREATE INDEX idx_dest_district ON destinations(district);
CREATE INDEX idx_dest_category ON destinations(category);
CREATE INDEX idx_dest_travel_type ON destinations(travel_type);
CREATE INDEX idx_review_destination ON reviews(destination_id);
CREATE INDEX idx_favorite_user ON favorites(user_id);
CREATE INDEX idx_search_user ON search_history(user_id);
