import asyncio
import time
import aiohttp
import statistics

# Configuration
BASE_URL = "http://127.0.0.1:8002/api/v1"
NUM_REQUESTS = 100
CONCURRENCY = 10

# Mock JWT token for auth (using a dummy one, or relying on mock endpoints if any)
HEADERS = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjY4M2Q0MGZlMGNlOTVlYmRhZmY4NWQiLCJyb2xlIjoidXNlciIsImV4cCI6MjA4Njk3ODQ1MCwiaWF0IjoxNzg2OTc0ODUwLCJqdGkiOiI4ZDYxOThhNWU1YWM1MTBlIiwidHlwZSI6ImFjY2VzcyJ9.FAKE_SIGNATURE",
    "Content-Type": "application/json"
}

async def fetch_alarms(session):
    start_time = time.time()
    try:
        async with session.get(f"{BASE_URL}/alarms", headers=HEADERS) as response:
            await response.read()
            return time.time() - start_time, response.status
    except Exception as e:
        return time.time() - start_time, 500

async def create_alarm(session):
    payload = {
        "label": "Test Alarm",
        "time": "07:00",
        "alarm_type": "weekday",
        "days_active": [1, 2, 3, 4, 5],
        "is_active": True,
        "sound_name": "default",
        "snooze_duration": 5,
        "vibration": True,
        "snooze_enabled": True,
        "difficulty": "Medium"
    }
    start_time = time.time()
    try:
        async with session.post(f"{BASE_URL}/alarms", json=payload, headers=HEADERS) as response:
            await response.read()
            return time.time() - start_time, response.status
    except Exception as e:
        return time.time() - start_time, 500

async def generate_challenge(session):
    start_time = time.time()
    try:
        async with session.get(f"{BASE_URL}/challenges/generate?difficulty=Medium", headers=HEADERS) as response:
            await response.read()
            return time.time() - start_time, response.status
    except Exception as e:
        return time.time() - start_time, 500

async def worker(queue, results):
    async with aiohttp.ClientSession() as session:
        while True:
            task = await queue.get()
            if task is None:
                break
            action, func = task
            duration, status = await func(session)
            results.append((action, duration, status))
            queue.task_done()

async def run_load_test():
    print(f"Starting Load Test: {NUM_REQUESTS} requests, Concurrency: {CONCURRENCY}")
    queue = asyncio.Queue()
    results = []

    # Enqueue tasks
    for _ in range(NUM_REQUESTS):
        queue.put_nowait(("GET /alarms", fetch_alarms))
        queue.put_nowait(("POST /alarms", create_alarm))
        queue.put_nowait(("GET /challenges/generate", generate_challenge))

    workers = [asyncio.create_task(worker(queue, results)) for _ in range(CONCURRENCY)]
    
    await queue.join()
    
    # Stop workers
    for _ in range(CONCURRENCY):
        queue.put_nowait(None)
    await asyncio.gather(*workers)

    # Analyze results
    print("\n--- Load Test Results ---")
    summary = {}
    for action, duration, status in results:
        if action not in summary:
            summary[action] = {'durations': [], 'status_codes': {}}
        summary[action]['durations'].append(duration)
        summary[action]['status_codes'][status] = summary[action]['status_codes'].get(status, 0) + 1

    for action, data in summary.items():
        durations = data['durations']
        avg_time = statistics.mean(durations) * 1000
        p95_time = statistics.quantiles(durations, n=100)[94] * 1000
        print(f"Action: {action}")
        print(f"  Total Requests: {len(durations)}")
        print(f"  Avg Latency: {avg_time:.2f} ms")
        print(f"  P95 Latency: {p95_time:.2f} ms")
        print(f"  Status Codes: {data['status_codes']}")
        print()

if __name__ == "__main__":
    asyncio.run(run_load_test())
