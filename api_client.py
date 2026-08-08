import requests
from config import PROFILE_URL
from auth import get_access_token


def get_user_profile():
    token = get_access_token()

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

    response = requests.get(PROFILE_URL, headers=headers)

    if response.status_code == 200:
        return response.json()

    return {
        "error": response.status_code,
        "message": response.text
    }


if __name__ == "__main__":
    profile = get_user_profile()
    print(profile)