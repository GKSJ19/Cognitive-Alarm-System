# Installation Guide

This document describes how to install and run the Intelligent Cognitive Alarm System on your local development environment.

---

## 1. Backend Local Setup (Python)

### Prerequisites
* Python 3.10 or higher.
* Virtualenv utility.

### Steps:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   * **Windows:**
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   * **macOS/Linux:**
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     ```
3. Install package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure local environment variables:
   * Copy the example configuration:
     ```bash
     cp .env.example .env
     ```
   * Configure the target values inside `.env` (default is SQLite).
5. Spin up the FastAPI API server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
6. Access interactive API documentation at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 2. Frontend Local Setup (React Native / Expo)

### Prerequisites
* Node.js (v18 or higher).
* Expo Go app installed on your testing device.

### Steps:
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the bundler:
   ```bash
   npx expo start
   ```
4. Scan the QR code displayed in the terminal using your phone camera (iOS) or Expo Go app (Android) to test.

---

## 3. Running Unit Tests
Validate code changes using pytest:
```bash
cd backend
pytest
```
