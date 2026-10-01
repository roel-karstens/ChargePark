"""API dependencies for FastAPI."""

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Use DATABASE_URL from .env (Supabase) or fallback to SQLite
DATABASE_URL = settings.database_url or (
    "sqlite:///./test_temp.db" if settings.environment == "testing" else "sqlite:///./test.db"
)

if DATABASE_URL.startswith("postgresql"):
    # PostgreSQL connection (Supabase)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before using them
    )
else:
    # SQLite connection
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
