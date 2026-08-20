# Installation & Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Python 3.8+
- Node.js 14+ with npm
- Git

### Step 1: Clone & Navigate

```bash
cd "Cognitive-Alarm-System"
```

### Step 2: Backend Setup

```bash
# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Start Backend

```bash
python main.py
```

✅ Backend running at: http://localhost:8000

### Step 4: Frontend Setup (in a new terminal)

```bash
# Install dependencies
npm install

# Start development server
npm start
```

✅ Frontend running at: http://localhost:3000

---

## Detailed Setup Instructions

### Backend Setup Details

#### Option 1: Using Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Run the application
python main.py
```

#### Option 2: Direct Installation

```bash
# Install packages globally
pip install -r requirements.txt

# Run the application
python main.py
```

#### Verify Backend

Open browser: http://localhost:8000/docs
You should see the Swagger API documentation.

### Frontend Setup Details

```bash
# Install all dependencies
npm install

# Start development server with hot reload
npm start

# Build for production
npm build
```

#### Verify Frontend

Open browser: http://localhost:3000
You should see the Cognitive Alarm System dashboard.

---

## Configuration

### Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` to customize settings:

```env
# Database
DATABASE_URL=sqlite:///./alarm_system.db

# API
API_HOST=0.0.0.0
API_PORT=8000

# AI Models
ANOMALY_CONTAMINATION=0.1
PATTERN_EPS=0.5
```

---

## Database Setup

The SQLite database is created automatically on first run.

To reset the database:

```bash
# Delete existing database
rm alarm_system.db

# Restart the backend (creates fresh database)
python main.py
```

---

## Troubleshooting

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### Module Not Found

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Reinstall requirements
pip install --upgrade -r requirements.txt

# Or check virtual environment is activated
which python  # Should show venv path
```

### CORS Error

**Error**: `Cross-Origin Request Blocked`

**Solution**: Ensure backend is running with CORS enabled
- Check `main.py` has CORS middleware
- Restart backend
- Clear browser cache

### React App Won't Start

**Error**: `Something is already using port 3000`

**Solution**:
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### Dependencies Installation Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Testing the Installation

### Test Backend API

```bash
# Check health
curl http://localhost:8000/health

# Create a test alarm
curl -X POST http://localhost:8000/alarms/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Alarm",
    "time": "09:00",
    "frequency": "daily",
    "enabled": true,
    "intensity": 5
  }'
```

### Test Frontend

1. Open http://localhost:3000
2. Click "+ Create New Alarm"
3. Fill in the form and submit
4. Verify alarm appears in the list

---

## Development Tips

### Hot Reload

**Frontend**: Changes auto-reload in browser (React)

**Backend**: Install `auto-reload`:
```bash
pip install python-dotenv

# Then restart manually
```

### API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Database Inspection

For SQLite database visualization:
```bash
# Install SQLite viewer
pip install sqlite-web

# Run viewer
sqlite_web alarm_system.db
```

### Logging

Check terminal output for logs from both frontend and backend servers.

---

## Production Deployment

### Backend

```bash
# Use production server
pip install gunicorn

gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

### Frontend

```bash
# Create optimized build
npm run build

# Serve with a static server
npm install -g serve
serve -s build -l 3000
```

---

## Getting Help

1. Check logs in terminal windows
2. Verify all prerequisites are installed: `python --version`, `node --version`
3. Ensure ports 3000 and 8000 are available
4. Try clearing caches and reinstalling

---

**Ready to use the Cognitive Alarm System! 🚀**
