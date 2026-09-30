"""API dependencies for FastAPI."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# Use test database for testing, SQLite file for development
if os.getenv("TESTING") == "true":
    DATABASE_URL = "sqlite:///./test_temp.db"
else:
    DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
