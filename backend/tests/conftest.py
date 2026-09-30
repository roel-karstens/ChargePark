"""Test configuration and fixtures."""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
import jwt

# Set test mode BEFORE importing any app modules
os.environ["TESTING"] = "true"

# Import models and dependencies (which will create the test database)
from app.models.project import Base
from app.dependencies import engine, SessionLocal
from app.main import app
from app.dependencies import get_db

# Create all tables in the test database
Base.metadata.create_all(bind=engine)

# Verify tables were created
with engine.connect() as conn:
    result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
    tables = result.fetchall()
    print(f"Created tables: {tables}")


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


# Apply the dependency override
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Create valid auth headers for testing."""
    # Create a valid JWT token for testing
    payload = {
        "sub": "12345678-abcd-4e76-90ab-123456789abc",
        "iat": 1516239022,
    }
    token = jwt.encode(
        payload,
        "test-secret",
        algorithm="HS256",
    )
    return {
        "Authorization": f"Bearer {token}"
    }


@pytest.fixture(scope="session", autouse=True)
def cleanup():
    """Clean up test database after tests."""
    yield
    # Clean up the test database file
    if os.path.exists("test_temp.db"):
        os.remove("test_temp.db")


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Create valid auth headers for testing."""
    # Create a valid JWT token for testing
    payload = {
        "sub": "12345678-abcd-4e76-90ab-123456789abc",
        "iat": 1516239022,
    }
    token = jwt.encode(
        payload,
        "test-secret",
        algorithm="HS256",
    )
    return {
        "Authorization": f"Bearer {token}"
    }


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Create valid auth headers for testing."""
    # Create a valid JWT token for testing
    payload = {
        "sub": "12345678-abcd-4e76-90ab-123456789abc",
        "iat": 1516239022,
    }
    token = jwt.encode(
        payload,
        "test-secret",
        algorithm="HS256",
    )
    return {
        "Authorization": f"Bearer {token}"
    }


@pytest.fixture
def db_session():
    """Create database session for testing."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()
