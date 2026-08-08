from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient
import pytest
from app.main import app
from app.database.session import get_db_session
from app.models.user import User
from app.models.role import Role

@pytest.fixture
def mock_session():
    session = AsyncMock()
    
    # Mock result for user select query (no user exists yet)
    user_exists_result = MagicMock()
    user_exists_result.scalar_one_or_none.return_value = None
    
    # Mock role query result
    role_result = MagicMock()
    role_result.scalar_one_or_none.return_value = Role(name="user")
    
    # Mock final user selectinload query result
    created_user = User(
        email="test@example.com",
        full_name="Test User",
        is_active=True,
        is_superuser=False
    )
    user_select_result = MagicMock()
    user_select_result.scalar_one.return_value = created_user
    
    # Return different mocks for consecutive execute calls
    session.execute.side_effect = [
        user_exists_result,  # check email existence
        role_result,         # fetch default role
        user_select_result   # load created user relations
    ]
    
    return session

def test_register_user_success(mock_session):
    def override_db():
        yield mock_session

    app.dependency_overrides[get_db_session] = override_db
    
    response = TestClient(app).post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "securepassword", "full_name": "Test User"},
    )
    
    app.dependency_overrides.clear()
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
