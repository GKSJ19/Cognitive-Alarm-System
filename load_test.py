"""
Basic load/performance test for the authentication endpoints, per the
Milestone 4 evaluation criteria ("auth endpoints meet acceptable
response-time targets under expected concurrent load").

Usage:
    pip install locust
    locust -f load_test.py --host https://your-deployed-url.com

Then open http://localhost:8089, set number of users (e.g. 50) and
spawn rate (e.g. 5/sec), and start the test. Watch the response-time
and failure-rate charts.

For a quick one-off run without the web UI:
    locust -f load_test.py --host https://your-deployed-url.com \
        --headless -u 50 -r 5 -t 60s
"""

import random
import string
from locust import HttpUser, task, between


def _random_email():
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"loadtest_{suffix}@example.com"


class AuthUser(HttpUser):
    wait_time = between(0.5, 2)  # simulate realistic pacing between requests

    def on_start(self):
        """Each simulated user registers once, then logs in repeatedly."""
        self.email = _random_email()
        self.password = "LoadTestPass1"
        self.client.post("/auth/register", json={
            "username": self.email.split("@")[0],
            "email": self.email,
            "password": self.password,
        })

    @task(3)
    def login(self):
        with self.client.post(
            "/auth/login",
            json={"email": self.email, "password": self.password},
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                self.access_token = response.json()["access_token"]
            else:
                response.failure(f"Login failed: {response.status_code}")

    @task(5)
    def get_own_profile(self):
        token = getattr(self, "access_token", None)
        if not token:
            return
        headers = {"Authorization": f"Bearer {token}"}
        self.client.get("/users/me", headers=headers, name="/users/me")
