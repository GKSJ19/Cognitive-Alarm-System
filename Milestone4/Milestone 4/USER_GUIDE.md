# User Guide: Alarm & Challenge Service

Welcome to the Cognitive Alarm Platform's Alarm and Challenge Service! This guide explains how to spin up the service locally and test its core functionality.

## Prerequisites
- Docker and Docker Compose installed.
- Python 3.10+ (for running the load test locally).

## Running the Service Locally

1. **Start the Environment:**
   Navigate to the root `platform/` directory where the `docker-compose.yml` file is located and run:
   ```bash
   docker compose up -d --build
   ```
   This will start the MongoDB database, Auth Service, AI Service, API Gateway (Nginx), and the Alarm Service.

2. **Verify it's running:**
   Check the status of the services:
   ```bash
   docker compose ps
   ```
   The `alarm-service` should be running and accessible via the API Gateway at `http://localhost/api/v1`.

## Core Features

### 1. Managing Alarms
- **Creating an alarm:** You can create an alarm by sending a `POST /api/v1/alarms` request with the time, repeat days, and desired challenge difficulty.
- **Viewing alarms:** You can fetch your active alarms using `GET /api/v1/alarms`.

### 2. Solving Challenges
When an alarm rings, a cognitive challenge is required to dismiss it.
- **Generate a challenge:** The app calls `GET /api/v1/challenges/generate?difficulty=Medium` to get a math or memory challenge.
- **Verify your answer:** The app calls `POST /api/v1/challenges/verify` with your answer. If correct, the alarm stops!

## Running the Performance Tests
To verify the performance of the alarm scheduling and challenge generation (Milestone 4 requirements):

1. Navigate to the `alarm-service/` directory.
2. Install the required dependencies:
   ```bash
   pip install aiohttp
   ```
3. Run the load test:
   ```bash
   python load_test.py
   ```
4. The test will execute 100 concurrent requests against the local service and print out the average and P95 latency metrics for Alarm Creation, Fetching, and Challenge Generation.
