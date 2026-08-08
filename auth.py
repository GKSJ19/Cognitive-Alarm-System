import requests
from config import LOGIN_URL

EMAIL = "test@example.com"
PASSWORD = "TestPass123"

def get_access_token():
    response = requests.post(
        LOGIN_URL,
        json={
            "email": EMAIL,
            "password": PASSWORD
        }
    )
    print(response.status_code)
    print(response.text)
    return response.json()["access_token"]