from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app import config

# SQLite connection args for multi-threaded/concurrent environments.
# check_same_thread is false so that multiple FastAPI threads can share the connection safely.
connect_args = {"check_same_thread": False} if config.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    config.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

# Configure SQLite WAL (Write-Ahead Logging) and Foreign Keys constraints at connection time.
# WAL mode drastically improves read/write concurrency and prevents "database is locked" errors.
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if config.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA journal_mode=WAL;")
            cursor.execute("PRAGMA foreign_keys=ON;")
        finally:
            cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    FastAPI dependency that yields a database session and ensures it is
    properly closed when the request lifecycle ends.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
