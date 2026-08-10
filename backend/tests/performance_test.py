import time
from fastapi.testclient import TestClient
from app.main import app

def run_performance_test():
    client = TestClient(app)
    # Register/login user as admin to have access to all endpoints
    client.post(
        "/auth/register",
        json={
            "email": "perf@example.com",
            "password": "password",
            "full_name": "Performance User",
            "role": "admin"
        }
    )
    login_resp = client.post(
        "/auth/login",
        data={"username": "perf@example.com", "password": "password"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    endpoints = [
        ("/dashboard/summary", "GET"),
        ("/dashboard/statistics", "GET"),
        ("/dashboard/admin", "GET"),
        ("/dashboard/coach", "GET"),
        ("/reports/habit?format=json", "GET"),
        ("/reports/habit?format=pdf", "GET"),
        ("/reports/habit?format=excel", "GET"),
    ]
    
    print("\n================ LATENCY PERFORMANCE TEST ================")
    all_passed = True
    for path, method in endpoints:
        latencies = []
        for _ in range(5):  # Run 5 times to get average
            start = time.time()
            if method == "GET":
                resp = client.get(path, headers=headers)
            end = time.time()
            assert resp.status_code == 200, f"Expected 200 for {path}, got {resp.status_code}"
            latencies.append((end - start) * 1000)
        
        avg_latency = sum(latencies) / len(latencies)
        status_str = "PASSED" if avg_latency < 500.0 else "FAILED (SLOW)"
        print(f"[{status_str}] {method:4} {path:40} | Avg Latency: {avg_latency:6.2f}ms")
        if avg_latency >= 500.0:
            all_passed = False
            
    print("==========================================================")
    if all_passed:
        print("RESULT: SUCCESS - All endpoints responded under 500ms.")
    else:
        print("RESULT: FAILURE - Some endpoints exceeded 500ms SLA.")

if __name__ == "__main__":
    run_performance_test()
