# Installation Guide

Follow these steps to prepare your local machine for ICAP development.

## 1. Prerequisites
Ensure you have the following installed on your system:
- **Git**
- **Node.js** (v18+ recommended)
- **Python** (v3.11+ recommended)

## 2. Clone the Repository
Clone the codebase and navigate to the project root.
```bash
git clone <your-repository-url>
cd Milestone_1_Code
```

## 3. Backend Installation
Navigate to the backend directory and install the Python dependencies. It is highly recommended to use a virtual environment.

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# Install the application and dependencies in development mode
pip install -e .[dev]
```

## 4. Frontend Installation
Navigate to the frontend directory and install the Node modules.

```bash
cd ../frontend
npm install
```

## 5. Running the Application

**Run the Backend (Terminal 1):**
```bash
cd backend
# Ensure venv is activated
uvicorn app.main:app --reload --port 8000
```
*Note: The backend will automatically create the SQLite database and seed demo users on the first run.*

**Run the Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173` in your browser. You can log in using the auto-generated demo account:
- **Email:** `demo@icap.dev`
- **Password:** `Demo@123`
