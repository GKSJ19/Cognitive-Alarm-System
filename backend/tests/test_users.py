from unittest.mock import AsyncMock, MagicMock
import uuid
from fastapi.testclient import TestClient
import pytest
from app.main import app
from app.database.session import get_db_session
from app.models.user import User

@pytest.fixture
def mock_admin_session():
    session = AsyncMock()
    
    # Mock JWT validation finding an admin user
    admin_user = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        full_name="Admin User",
        is_active=True,
        is_superuser=True
    )
    
    # For get_current_user
    user_result = MagicMock()
    user_result.scalar_one_or_none.return_value = admin_user
    
    # For users list
    user_list = [
        User(email="user1@example.com", full_name="User One"),
        User(email="user2@example.com", full_name="User Two")
    ]
    list_result = MagicMock()
    list_result.scalars.return_value.all.return_value = user_list
    
    session.execute.side_effect = [
        user_result, # check user inside dependency
        list_result  # fetch users inside router
    ]
    return session

def test_list_users_as_admin(mock_admin_session):
    def override_db():
        yield mock_admin_session

    app.dependency_overrides[get_db_session] = override_db
    
    response = TestClient(app).get(
        "/api/v1/users/",
        headers={"Authorization": "Bearer mocked_token"}
    )
    
    app.dependency_overrides.clear()
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["email"] == "user1@example.com"
