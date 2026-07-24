import os

# Use a disposable SQLite DB for tests, and dummy settings -- set these
# BEFORE importing the app, since config.py reads them at import time.
os.environ["DATABASE_URL"] = "sqlite:///./test_milestone2.db"
os.environ["SECRET_KEY"] = "test-secret-key-for-pytest-only"

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def db_session_factory():
    return SessionLocal


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    yield
    try:
        os.remove("test_milestone2.db")
    except FileNotFoundError:
        pass
