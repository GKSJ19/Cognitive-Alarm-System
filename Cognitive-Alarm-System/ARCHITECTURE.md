# Intelligent Cognitive Alarm Platform - Architecture & Implementation Guide

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                   Web & Mobile Clients                      │
│          React.js (Web) │ React Native (Mobile)             │
└────────┬────────────────────────────────────┬───────────────┘
         │                                    │
         │  HTTPS / WebSockets               │
         │                                    │
┌────────▼────────────────────────────────────▼───────────────┐
│                    API Gateway / Load Balancer              │
└────────┬─────────────────────────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────────────────────┐
│                   FastAPI Application                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            REST API Endpoints (40+)                 │   │
│  │  Auth │ Profile │ Habits │ Alarms │ Challenges │   │   │
│  │  Analytics │ Recommendations │ Dashboards          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Business Logic Layer (Engines)              │   │
│  │  - Challenge Engine (7 types × 5 difficulties)     │   │
│  │  - Analytics Engine (Behavior, Scoring)            │   │
│  │  - Recommendation Engine (AI-driven)               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       Data Model Layer (Pydantic + SQLAlchemy)      │   │
│  │  - Request/Response validation (Pydantic)          │   │
│  │  - ORM models (SQLAlchemy)                         │   │
│  │  - 13 database tables with relationships           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────┬─────────────────────────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────────────────────┐
│                   Persistence Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Primary)  │ Redis (Cache)             │   │
│  │  ┌────────────────┐    ┌────────────────────────┐  │   │
│  │  │ Users          │    │ Recommendation Cache   │  │   │
│  │  │ Habits         │    │ User Session Cache     │  │   │
│  │  │ Alarms         │    │ Analytics Cache        │  │   │
│  │  │ Challenges     │    └────────────────────────┘  │   │
│  │  │ Analytics      │                                │   │
│  │  │ Scores         │                                │   │
│  │  └────────────────┘                                │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
1. USER LOGIN
   Client → Auth.register/login → JWT Token → Stored Locally

2. HABIT TRACKING
   Client → Create Habit → HabitORM → Database
   Client → Log Progress → HabitProgressORM → Database

3. ALARM CREATION & WAKE-UP
   Client → Create Alarm → AlarmORM → Database
   Alarm Triggers → Generate Challenge → ChallengeORM
   User Responds → Verify Answer → ChallengeResultORM
   Record Stats → WakeUpStatsORM

4. ANALYTICS & SCORING
   System Collects Data → BehaviorAnalyzer
   BehaviorAnalyzer → HabitScoreCalculator
   Calculate Habit Score → HabitScoreORM
   RecommendationEngine → Recommendations
   Display on Dashboard

5. ADAPTIVE DIFFICULTY
   Challenge Result → Analyze Accuracy/Time
   Compare vs Threshold → Suggest Adjustment
   Update User Difficulty → DifficultyAdjustmentORM
```

---

## Module Deep Dive

### 1. Authentication Module (auth.py)

**Purpose**: Secure user authentication and authorization

**Key Components**:
- **Password Hashing**: Using bcrypt with salt rounds = 12
- **JWT Token**: RS256 algorithm, 30-minute expiry
- **OAuth2**: Bearer token scheme
- **RBAC**: Three roles (User, Wellness Coach, Administrator)

**Code Structure**:
```python
├── hash_password()           # Bcrypt password hashing
├── verify_password()         # Verify hashed password
├── create_access_token()     # Generate JWT token
├── decode_token()            # Parse and validate JWT
├── get_current_user()        # Dependency for auth endpoints
├── get_admin_user()          # Admin role check
├── get_coach_user()          # Coach role check
└── UserRole                  # Role constants and validation
```

**Security Features**:
- Password hashing with bcrypt (OWASP compliant)
- JWT token signing with secret key
- Token expiration and refresh mechanism
- Role-based access control
- Dependency injection for clean code

---

### 2. Data Models Module (enhanced_models.py)

**Purpose**: Define all request/response data structures with validation

**40+ Pydantic Models** organized into categories:

**User Models**:
- `UserRegister` - Registration request
- `UserLogin` - Login credentials
- `UserProfile` - User preferences
- `UserInfo` - Full user info with profile

**Habit Models**:
- `HabitCreate` - Habit creation request
- `Habit` - Complete habit data
- `HabitProgress` - Daily progress record

**Alarm Models**:
- `AlarmCreate` - Alarm creation request
- `Alarm` - Complete alarm data
- `AlarmType` - Enum: DAILY, WEEKDAY, WEEKEND, ONE_TIME, SMART_ADAPTIVE

**Challenge Models**:
- `ChallengeCreate` - Challenge creation request
- `Challenge` - Complete challenge data
- `ChallengeType` - Enum: MATH, LOGIC, MEMORY, WORD, PATTERN, RIDDLE, QUIZ
- `DifficultyLevel` - Enum: BEGINNER, EASY, MEDIUM, HARD, EXPERT

**Analytics Models**:
- `WakeUpStats` - Wake-up statistics record
- `HabitScore` - Habit score components
- `BehaviorAnalytics` - Behavior analysis results

**Dashboard Models**:
- `UserDashboard` - User dashboard view
- `CoachDashboard` - Coach dashboard view
- `AdminDashboard` - Admin dashboard view

---

### 3. Database Module (enhanced_database.py)

**Purpose**: ORM models and database session management

**13 SQLAlchemy ORM Classes**:

```
User ─┬─→ UserProfile
      ├─→ Habit ─→ HabitProgress
      ├─→ Alarm ─→ WakeUpVerification
      ├─→ Challenge ─→ ChallengeResult
      ├─→ WakeUpStats
      ├─→ HabitScore
      ├─→ BehaviorAnalytics
      ├─→ Recommendation
      └─→ DifficultyAdjustment
```

**Key Tables**:

1. **user**: Core user entity
   - Fields: user_id, email, hashed_password, first_name, last_name, role
   - Relationships: Profile, Habits, Alarms, Challenges, Stats

2. **user_profile**: User preferences
   - Fields: timezone, wake_up_time, sleep_duration, difficulty_preference
   - One-to-One with User

3. **habit**: Habit definitions
   - Fields: name, category, goal, frequency, is_active
   - One-to-Many with HabitProgress

4. **habit_progress**: Daily habit tracking
   - Fields: date, completed, notes
   - Many-to-One with Habit

5. **alarm**: Alarm configurations
   - Fields: title, time, type, days, enabled, intensity
   - One-to-Many with Challenge

6. **challenge**: Challenge definitions
   - Fields: type, difficulty, content, correct_answer, time_limit
   - One-to-Many with ChallengeResult

7. **wake_up_stats**: Daily wake-up statistics
   - Fields: date, scheduled_time, actual_time, snoozed, snooze_count

8. **habit_score**: Daily calculated scores
   - Fields: date, wake_up_consistency, challenge_completion, snooze_reduction, sleep_adherence, total_score

---

### 4. Challenge Engine (challenge_engine.py)

**Purpose**: Generate and manage cognitive challenges

**7 Challenge Types** with 5 difficulty levels:

1. **Math Challenge**
   - Beginner: Addition (1-5)
   - Easy: Addition & Subtraction (1-20)
   - Medium: Multiplication (1-10)
   - Hard: Division & Mixed (1-100)
   - Expert: Exponentiation & Complex

2. **Logic Puzzle**
   - Riddle-style logic problems
   - Curated library with 50+ puzzles
   - Adaptive complexity

3. **Memory Challenge**
   - Number sequence memorization
   - Display time: 3s (Expert) to 5s (Beginner)
   - Sequence length: 4-10 digits

4. **Pattern Recognition**
   - Arithmetic sequences
   - Fibonacci sequences
   - Exponential patterns

5. **Word Game**
   - Anagram solving
   - 5 word difficulty levels
   - 100+ word database

6. **Riddle**
   - Lateral thinking riddles
   - 5 difficulty categories
   - 200+ riddle database

7. **Quick Quiz**
   - Trivia questions (History, Geography, Science)
   - 5 difficulty levels
   - 300+ question database

**Scoring System**:
```
Base Points = Difficulty Level × 10
Time Bonus = (Time Limit - Time Taken) / Time Limit × Base Points × 0.5
Total Points = Base Points + Time Bonus
```

---

### 5. Analytics Engine (analytics_engine.py)

**Purpose**: Analyze behavior, calculate scores, generate recommendations

**Three Main Classes**:

1. **BehaviorAnalyzer**
   - `analyze_snooze_patterns()`: Snooze frequency, count, trend
   - `analyze_wake_up_patterns()`: Success rate, consistency, peak hours
   - `analyze_challenge_performance()`: Accuracy by type/difficulty
   - `analyze_productivity_correlation()`: Wake-up vs productivity correlation
   - `calculate_habit_consistency()`: Percentage of days habits completed

2. **HabitScoreCalculator**
   - Weighted scoring model (35-35-20-20 split)
   - `calculate_wake_up_consistency_score()`: No-snooze rate
   - `calculate_challenge_completion_score()`: Challenge accuracy
   - `calculate_snooze_reduction_score()`: Trend analysis
   - `calculate_sleep_adherence_score()`: Schedule adherence
   - `generate_daily_habit_score()`: Complete daily score

3. **RecommendationEngine**
   - `generate_recommendations()`: 5 priority-ranked recommendations
   - Covers: Sleep, Wake-up, Cognitive, Habit, Productivity
   - Confidence scores and action items

---

### 6. Main Application (app.py)

**Purpose**: FastAPI application with 40+ REST endpoints

**40+ Endpoints** organized by feature:

**Authentication** (5 endpoints):
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- POST `/api/auth/refresh-token`
- POST `/api/auth/logout`

**User Profile** (3 endpoints):
- POST `/api/profile/setup`
- GET `/api/profile`
- PUT `/api/profile`

**Habits** (7 endpoints):
- POST `/api/habits/create`
- GET `/api/habits`
- GET `/api/habits/{id}`
- PUT `/api/habits/{id}`
- DELETE `/api/habits/{id}`
- POST `/api/habits/{id}/log-progress`
- GET `/api/habits/{id}/progress`

**Alarms** (6 endpoints):
- POST `/api/alarms/create`
- GET `/api/alarms`
- GET `/api/alarms/{id}`
- PUT `/api/alarms/{id}`
- DELETE `/api/alarms/{id}`
- PUT `/api/alarms/{id}/toggle`

**Challenges** (5 endpoints):
- POST `/api/challenges/generate`
- GET `/api/challenges/{id}`
- POST `/api/challenges/{id}/verify`
- GET `/api/challenges/history`
- GET `/api/challenges/stats`

**Wake-Up** (4 endpoints):
- POST `/api/wake-up/start`
- POST `/api/wake-up/verify`
- POST `/api/wake-up/complete`
- GET `/api/wake-up/history`

**Analytics** (6 endpoints):
- GET `/api/analytics/habit-score`
- GET `/api/analytics/habits/breakdown`
- GET `/api/analytics/wake-up/patterns`
- GET `/api/analytics/challenges/performance`
- GET `/api/analytics/snooze/patterns`
- GET `/api/analytics/productivity/correlation`

**Recommendations** (4 endpoints):
- GET `/api/recommendations`
- GET `/api/recommendations/difficulty`
- POST `/api/recommendations/{id}/dismiss`
- GET `/api/recommendations/history`

**Dashboards** (3 endpoints):
- GET `/api/dashboard/user`
- GET `/api/dashboard/coach`
- GET `/api/dashboard/admin`

---

## Data Flow Examples

### Example 1: User Registration & Setup

```
1. POST /api/auth/register
   Request: {email, password, first_name, last_name, role}
   ↓
2. Hash password using bcrypt
   ↓
3. Create UserORM in database
   ↓
4. Create default UserProfileORM
   ↓
5. Return user_id and success message
   ↓
6. Client stores credentials locally
   ↓
7. POST /api/profile/setup
   Request: {timezone, wake_up_time, sleep_duration, difficulty}
   ↓
8. Update UserProfileORM with preferences
   ↓
9. Return updated profile
```

### Example 2: Daily Wake-Up Flow

```
1. Alarm triggers at scheduled time
   ↓
2. POST /api/challenges/generate
   ↓
3. ChallengeEngine generates challenge based on user difficulty
   ↓
4. Return challenge question, type, difficulty, time limit
   ↓
5. User solves challenge
   ↓
6. POST /api/challenges/{id}/verify
   Request: {user_answer, time_taken, hint_used}
   ↓
7. Verify answer correctness
   ↓
8. Calculate points using scoring algorithm
   ↓
9. Store ChallengeResultORM
   ↓
10. POST /api/wake-up/record
    Request: {scheduled_time, actual_time, snoozed, snooze_count}
    ↓
11. Store WakeUpStatsORM
    ↓
12. Return success message
```

### Example 3: Analytics & Recommendations

```
1. GET /api/analytics/habit-score
   ↓
2. Query last 30 days of WakeUpStatsORM
   ↓
3. Query ChallengeResultORM
   ↓
4. Query HabitProgressORM
   ↓
5. HabitScoreCalculator.generate_daily_habit_score()
   - Calculate 4 component scores
   - Apply weights (35%, 25%, 20%, 20%)
   - Return total score (0-100)
   ↓
6. Store HabitScoreORM with date
   ↓
7. GET /api/recommendations
   ↓
8. BehaviorAnalyzer analyzes patterns
   ↓
9. RecommendationEngine generates recommendations
   ↓
10. Return 5 priority-ranked recommendations
    ↓
11. Store RecommendationORM in database
```

---

## Database Relationships

### User Relationships
```sql
User (1) ──── (1) UserProfile
User (1) ──── (N) Habit
User (1) ──── (N) Alarm
User (1) ──── (N) Challenge
User (1) ──── (N) WakeUpStats
User (1) ──── (N) HabitScore
User (1) ──── (N) BehaviorAnalytics
User (1) ──── (N) Recommendation
```

### Habit Relationships
```sql
Habit (1) ──── (N) HabitProgress
```

### Alarm Relationships
```sql
Alarm (1) ──── (N) WakeUpVerification
Alarm (1) ──── (N) Challenge
```

### Challenge Relationships
```sql
Challenge (1) ──── (N) ChallengeResult
```

---

## Performance Optimization Strategies

### 1. Database Optimization
- **Indexing**: Foreign keys, frequently queried fields
- **Query Optimization**: Eager loading with `joinedload()`
- **Connection Pooling**: SQLAlchemy connection pool

### 2. Caching
- **Redis Cache**: Recommendations (1 hour TTL)
- **In-Memory Cache**: Challenge libraries (loaded on startup)
- **ETags**: For recommendation endpoints

### 3. Async Operations
- **FastAPI async/await**: Non-blocking I/O
- **Background Tasks**: Report generation, notifications
- **Task Queue**: Celery for long-running tasks

### 4. API Optimization
- **Pagination**: For list endpoints (limit 50)
- **Lazy Loading**: Challenge details on demand
- **Response Compression**: Gzip for large payloads

---

## Error Handling

### HTTP Status Codes
- **200 OK**: Successful GET/POST
- **201 Created**: Resource created
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing/invalid auth
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Unexpected error

### Error Response Format
```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "details": {...}
}
```

---

## Next Steps for Development

1. **Frontend Implementation** (React.js)
   - Authentication UI
   - Habit dashboard
   - Challenge interface
   - Analytics visualization

2. **Mobile App** (React Native)
   - Push notifications
   - Offline support
   - Native alarm integration

3. **Advanced Features**
   - Machine learning predictions
   - Social challenges
   - Integration with wearables
   - Voice commands

4. **Deployment**
   - Docker containerization
   - AWS/GCP/Azure deployment
   - CI/CD pipeline
   - Monitoring and logging

