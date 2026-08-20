# Intelligent Cognitive Alarm Platform - API Documentation

## Overview
The Intelligent Cognitive Alarm Platform is an AI-powered wake-up optimization system that uses adaptive cognitive challenges to help users wake up successfully and build healthy morning habits. Built with FastAPI, the platform provides a comprehensive REST API for managing alarms, tracking habits, generating challenges, and providing personalized recommendations.

**Version:** 2.0.0  
**Framework:** FastAPI  
**Database:** PostgreSQL / SQLite  
**Language:** Python 3.8+

---

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Application                      │
├─────────────────────────────────────────────────────────────┤
│  Authentication │ Habits │ Alarms │ Challenges │ Analytics │
├─────────────────────────────────────────────────────────────┤
│           Business Logic Layer (Engines)                    │
│    ┌─────────────────────────────────────────────────────┐  │
│    │ Challenge │ Analytics │ Behavior │ Recommendation   │  │
│    │  Engine   │  Engine   │ Analyzer │   Engine         │  │
│    └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│              SQLAlchemy ORM Layer                           │
│    ┌─────────────────────────────────────────────────────┐  │
│    │ User │ Profile │ Habit │ Alarm │ Challenge │ Stats  │  │
│    │ Verification │ Analytics │ Recommendations         │  │
│    └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│            PostgreSQL Database                              │
└─────────────────────────────────────────────────────────────┘
```

### Module Architecture

```
main.py (FastAPI Application)
    ├── auth.py (Authentication & Authorization)
    │   ├── JWT Token Management
    │   ├── Password Hashing
    │   ├── Role-Based Access Control
    │   └── User Context Management
    ├── enhanced_models.py (Pydantic Data Models)
    │   ├── User Models
    │   ├── Habit Models
    │   ├── Alarm Models
    │   ├── Challenge Models
    │   ├── Analytics Models
    │   └── Dashboard Models
    ├── enhanced_database.py (SQLAlchemy ORM)
    │   ├── 13 ORM Classes
    │   ├── Relationships & Constraints
    │   ├── Database Session Management
    │   └── Query Helpers
    ├── challenge_engine.py (Cognitive Challenges)
    │   ├── 7 Challenge Types
    │   ├── Difficulty Levels
    │   ├── Point Calculation
    │   └── Personalization
    └── analytics_engine.py (Intelligence)
        ├── Behavior Analysis
        ├── Habit Scoring
        ├── Recommendation Generation
        └── Difficulty Adjustment
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login & get token
- `GET /api/auth/me` - Get current user

### User Profile
- `POST /api/profile/setup` - Setup user profile
- `GET /api/profile` - Get user profile

### Habit Management
- `POST /api/habits/create` - Create new habit
- `GET /api/habits` - List all habits
- `POST /api/habits/{id}/log-progress` - Log daily progress

### Alarm Management
- `POST /api/alarms/create` - Create new alarm
- `GET /api/alarms` - List all alarms

### Challenges
- `POST /api/challenges/generate` - Generate challenge
- `POST /api/challenges/{id}/verify` - Verify challenge response

### Wake-Up Analytics
- `POST /api/wake-up/record` - Record wake-up event
- `GET /api/wake-up/stats` - Get wake-up statistics

### Analytics
- `GET /api/analytics/habit-score` - Get habit score
- `GET /api/analytics/behavior` - Get behavioral analytics
- `GET /api/recommendations` - Get personalized recommendations

### Dashboards
- `GET /api/dashboard/user` - User dashboard
- `GET /api/dashboard/coach` - Wellness coach dashboard
- `GET /api/dashboard/admin` - Administrator dashboard

---

## Key Features

### 1. Intelligent Challenge Generation
The platform generates cognitive challenges from 7 different types:
- **Math Challenges**: Arithmetic problems
- **Logic Puzzles**: Lateral thinking problems
- **Memory Challenges**: Number sequences
- **Pattern Recognition**: Mathematical sequences
- **Word Games**: Anagram solving
- **Riddles**: Lateral thinking riddles
- **Quick Quiz**: Trivia questions

Each challenge adapts to 5 difficulty levels (Beginner → Expert) based on user performance.

### 2. Adaptive Difficulty System
- Tracks user accuracy and response time
- Automatically adjusts difficulty:
  - **Increase**: Accuracy > 85% + Speed > 75%
  - **Decrease**: Accuracy < 50%
  - **Maintain**: Moderate performance

### 3. Weighted Habit Scoring (0-100)
```
Total Score = 
  (Wake-up Consistency × 35%) +
  (Challenge Completion × 25%) +
  (Snooze Reduction × 20%) +
  (Sleep Adherence × 20%)
```

### 4. Behavioral Analytics
- Snooze patterns (frequency, trend, average)
- Wake-up consistency (time variance, peak hours)
- Challenge performance (accuracy by type/difficulty)
- Productivity correlation analysis

### 5. Smart Recommendations
- Personalized recommendations based on analytics
- Priority ranking (High/Medium/Low)
- Actionable suggestions with confidence scores
- Difficulty adjustment suggestions

---

## Data Models

### User Model
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Habit Model
```json
{
  "habit_id": "uuid",
  "name": "Morning Exercise",
  "category": "fitness",
  "goal": "30 minutes daily",
  "frequency": "daily",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Challenge Model
```json
{
  "challenge_id": "uuid",
  "type": "math",
  "difficulty": "medium",
  "question": "What is 7 × 8?",
  "correct_answer": "56",
  "time_limit": 60,
  "points": 10,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Habit Score Model
```json
{
  "wake_up_consistency": 85.5,
  "challenge_completion": 75.0,
  "snooze_reduction": 90.0,
  "sleep_adherence": 80.0,
  "total_habit_score": 83.375,
  "date": "2024-01-01"
}
```

### Recommendation Model
```json
{
  "category": "wake_up",
  "title": "Improve Wake-Up Success",
  "description": "...",
  "action": "adjust_alarm_settings",
  "priority": "high",
  "confidence": 0.90
}
```

---

## Authentication

### JWT Token
- Issued on login
- Contains: `user_id`, `email`, `role`
- Expires in: 30 minutes
- Refresh endpoint available

### Role-Based Access Control
Three roles supported:
- **User**: Access personal alarms, habits, challenges
- **Wellness Coach**: View assigned users' analytics
- **Administrator**: Full platform access

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Database Schema

### Tables (13 ORM Classes)
1. **user** - User accounts with role and credentials
2. **user_profile** - User preferences and settings
3. **habit** - User habit definitions
4. **habit_progress** - Daily habit completion tracking
5. **alarm** - User alarms with configuration
6. **challenge** - Challenge definitions
7. **challenge_result** - Challenge response results
8. **wake_up_verification** - Wake-up challenge sessions
9. **wake_up_stats** - Daily wake-up statistics
10. **habit_score** - Daily weighted habit scores
11. **behavior_analytics** - Aggregated user behavior
12. **recommendation** - Generated recommendations
13. **difficulty_adjustment** - Difficulty change history

---

## Setup & Installation

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- pip or conda

### Installation
```bash
# Clone repository
git clone <repo>
cd Cognitive-Alarm-System

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python -c "from enhanced_database import Base, engine; Base.metadata.create_all(engine)"

# Run application
python app.py
```

### Configuration
Create `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost/alarm_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Usage Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user"
}
```

### Setup Profile
```bash
POST /api/profile/setup
Authorization: Bearer <token>
Content-Type: application/json

{
  "timezone": "America/New_York",
  "preferred_wake_up_time": "06:30",
  "sleep_duration": 7,
  "difficulty_preference": "medium"
}
```

### Create Habit
```bash
POST /api/habits/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Morning Exercise",
  "category": "fitness",
  "goal": "30 minutes daily",
  "frequency": "daily"
}
```

### Create Alarm
```bash
POST /api/alarms/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Morning Alarm",
  "alarm_time": "06:30",
  "alarm_type": "daily",
  "intensity": 5,
  "enabled": true
}
```

### Generate Challenge
```bash
POST /api/challenges/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "alarm_id": "alarm-uuid"
}
```

### Get Habit Score
```bash
GET /api/analytics/habit-score
Authorization: Bearer <token>
```

Response:
```json
{
  "wake_up_consistency": 85.5,
  "challenge_completion": 75.0,
  "snooze_reduction": 90.0,
  "sleep_adherence": 80.0,
  "total_habit_score": 83.375,
  "date": "2024-01-01"
}
```

---

## Performance & Scalability

### Optimization Strategies
- Database indexing on frequently queried fields
- Query optimization with proper joins
- Caching recommendations for 1 hour
- Async/await for non-blocking operations
- Connection pooling for database

### Scaling Considerations
- Horizontal scaling with load balancer
- Cache layer (Redis) for recommendations
- Background job queue (Celery) for reports
- Database read replicas for analytics

---

## Testing

### Unit Tests
```bash
pytest tests/unit/

# Test coverage
pytest --cov=. tests/
```

### Integration Tests
```bash
pytest tests/integration/
```

### API Tests
```bash
# Using httpx client
python -m pytest tests/api/
```

---

## Deployment

### Docker
```bash
# Build image
docker build -t cognitive-alarm .

# Run container
docker run -p 8000:8000 cognitive-alarm
```

### Production Deployment
- AWS ECS, GCP Cloud Run, or Azure App Service
- PostgreSQL RDS for database
- CloudFront/CDN for static assets
- Environment variables for secrets
- HTTPS only

---

## Troubleshooting

### Common Issues

**1. Database Connection Error**
- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Check credentials

**2. Authentication Failure**
- Verify token expiration
- Check `SECRET_KEY` matches
- Validate JWT algorithm

**3. Challenge Generation Fails**
- Verify `challenge_engine.py` is imported
- Check user difficulty preference is set
- Validate challenge type is supported

---

## Future Enhancements

- Mobile app (React Native)
- Voice commands for wake-up
- Integration with smart devices (IoT)
- Machine learning predictions
- Social features (challenges with friends)
- Advanced reporting and insights
- Blockchain for habit verification

---

## Support & Contribution

For issues or contributions, please submit via GitHub.

**Last Updated:** 2024  
**Maintainer:** Cognitive Alarm Team
