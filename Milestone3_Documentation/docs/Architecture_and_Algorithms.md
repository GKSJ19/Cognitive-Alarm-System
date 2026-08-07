# Architecture & Algorithms

---

## 1. Technologies Used

- **Python (3.11+):** The core backend programming language chosen for its robust data science ecosystem.
- **FastAPI:** A high-performance web framework used to expose the AI engines via RESTful APIs. Chosen for its automatic Swagger documentation and asynchronous capabilities.
- **Scikit-learn:** Used for statistical metric normalization (`MinMaxScaler`) in the Habit Scoring Engine to ensure diverse metrics (hours, percentages, raw counts) share a uniform scale.
- **Pandas:** Utilized for tabular data manipulation, memory-efficient data framing, and calculating rolling averages of behavioral metrics.
- **NumPy:** Used for high-performance numerical operations and statistical aggregations (e.g., `np.mean`).
- **Pydantic:** Utilized for data validation and schema definitions for the API responses, ensuring type safety.
- **PostgreSQL:** The primary relational database designed to persist historical challenge sessions and daily habits (simulated via Python memory dictionaries for modular testing).

---

## 2. Project Structure

The codebase is organized using a clean, modular architecture:

```text
Milestone3_Code/
├── main.py                     # Application entry point and FastAPI initialization
├── app/
│   ├── database/
│   │   └── db_simulation.py    # Simulated in-memory database and data access methods
│   ├── models/
│   │   └── schemas.py          # Pydantic models for response validation
│   ├── routers/
│   │   └── dashboard.py        # API routing and endpoint definitions
│   └── services/
│       ├── adaptive_engine.py  # Adaptive difficulty logic
│       ├── analytics_engine.py # Behavioral statistics and insights
│       ├── recommendation_engine.py # Rules-based recommendation generation
│       └── scoring_engine.py   # Normalized habit scoring logic
```

---

## 3. System Workflow

1. **Data Collection:** The mobile/web frontend captures raw user interactions (e.g., snooze button clicks, challenge completion times, and sleep cycles) and submits them to the backend API over HTTPS.
2. **Data Aggregation (Analytics Engine):** The payload is loaded into Pandas DataFrames. The engine computes historical averages and identifies negative behavioral flags.
3. **Habit Scoring (Scoring Engine):** The engine retrieves these averages, normalizes them, and applies the 35/25/20/20 weighting algorithm to produce the user's Habit Score and tier classification.
4. **Adaptive Adjustment (Difficulty Engine):** The engine evaluates the user's challenge accuracy. If the user consistently aces the challenges, their database profile is updated to a harder difficulty level.
5. **Recommendation Generation (Recommendation Engine):** The engine cross-references the computed analytics and habit score to generate personalized, actionable tips as an array of strings.
6. **Dashboard Delivery:** FastAPI orchestrates the aforementioned engines in real-time and returns the aggregated JSON response back to the client UI.

---

## 4. Algorithms Used

### 4.1 Difficulty Adaptation Algorithm
A state-machine threshold algorithm. It transitions states (`Current_Level -> Next_Level`) based on bounded constraints.

**Source File:** `app/services/adaptive_engine.py` → Class `AdaptiveDifficultyEngine`
```text
IF Success_Rate >= 85.0 AND Level < Expert THEN
    Level = Level + 1
ELSE IF Success_Rate < 50.0 AND Level > Beginner THEN
    Level = Level - 1
END IF
```

### 4.2 Weighted Habit Scoring Algorithm
A multi-variable linear equation normalized using `MinMaxScaler` to bind diverse metrics into a uniform 0-100 scale.

**Source File:** `app/services/scoring_engine.py` → Class `HabitScoringEngine`

```text
Habit_Score = (Consistency * 0.35) + (Accuracy * 0.25) + (Snooze_Score * 0.20) + (Sleep_Score * 0.20)
Where:
  Snooze_Score = 100 - MinMaxScaler(snooze_count, range=[0, 5])  # 0 snoozes = 100, 5+ snoozes = 0
  Sleep_Score  = MIN(100, (Sleep_Duration / 8.0) * 100)          # 8 hours = 100%
  Consistency  = 80.0 (Simulated baseline for demonstration)
  Accuracy     = accuracy_percent (Direct from user data)
```

### 4.3 Recommendation Rule-Based System
A deterministic expert system that maps statistical Boolean flags to human-readable actionable insights based on cascading IF statements.

**Source File:** `app/services/recommendation_engine.py` → Class `RecommendationEngine`

```text
IF is_sleep_deprived = True  → "Increase sleep duration to at least 7-8 hours."
                              → "Sleep earlier to improve morning alertness."
IF high_snooze_dependency     → "Reduce snooze usage to avoid sleep fragmentation."
IF accuracy_percent < 70      → "Improve challenge accuracy by practicing more memory puzzles."
IF habit_score < 75           → "Maintain consistency with your wake-up time."
IF none of the above          → "Great job! Maintain your current excellent habits."
```
