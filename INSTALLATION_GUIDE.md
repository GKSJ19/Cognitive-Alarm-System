# Installation & Setup Guide — Milestone 2

## 📋 Prerequisites
- **Python**: 3.11 or higher
- **Docker**: Docker Desktop 4.x+ with Docker Compose v2
- **Git**: 2.x+

---

## 🐳 Option 1: Docker Deployment (Recommended)

1. Clone repository and navigate to root directory:
   ```bash
   git clone https://github.com/your-username/intelligent-cognitive-alarm-platform.git
   cd intelligent-cognitive-alarm-platform
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Launch services:
   ```bash
   docker compose up --build
   ```

4. Verify services:
   - **FastAPI Documentation**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
   - **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
   - **Mongo Express UI**: [http://localhost:8081](http://localhost:8081)

---

## 💻 Option 2: Local Python Development Setup

1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -e ".[dev]"
   ```

3. Ensure local PostgreSQL and MongoDB servers are running, or update `.env` to point to external instances.

4. Start FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
