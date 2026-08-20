# 🧠 Cognitive Alarm System

An intelligent alarm platform that goes beyond conventional alarms by learning from user behaviour, analyzing alarm and sensor data, and providing adaptive alarms, cognitive challenges, analytics, and personalized recommendations.

## 📌 Overview

The **Cognitive Alarm System** is an AI-powered platform designed to make alarms more intelligent and personalized.

Instead of simply triggering an alarm at a fixed time, the system analyzes user interactions such as:

* Alarm dismissals
* Snooze behaviour
* Wake-up patterns
* Challenge performance
* Habit consistency
* Sensor readings

The collected information can be used by the AI layer to identify patterns, detect anomalies, evaluate alarm effectiveness, adapt alarm behaviour, and generate personalized recommendations.

## 🎯 Objectives

* Provide intelligent and adaptive alarm management.
* Learn from individual user behaviour.
* Detect abnormal patterns in sensor data.
* Analyze wake-up and snooze behaviour.
* Provide cognitive challenges during alarm verification.
* Calculate habit and performance scores.
* Generate personalized recommendations.
* Provide analytics through backend APIs and dashboards.
* Maintain a modular architecture that can be extended with additional AI models.

## ✨ Key Features

### 🔐 Secure Authentication

* User registration and login.
* Password-based authentication.
* Role-based access support for users, coaches, and administrators.
* Protected backend APIs.

### ⏰ Intelligent Alarm Management

* Create, update, and delete alarms.
* Daily, weekday, weekend, and one-time alarm support.
* Configurable alarm intensity.
* Smart/adaptive alarm support.
* Alarm behaviour tracking.

### 🧠 AI-Powered Intelligence

The AI layer includes:

* **Anomaly Detection** — identifies unusual sensor behaviour.
* **Pattern Learning** — learns recurring patterns from historical data.
* **Adaptive Alarm System** — adapts alarm behaviour based on user interactions.
* **Predictive Analytics** — evaluates alarm effectiveness and generates insights.
* **Behaviour Analytics** — analyzes snooze, wake-up, challenge, and productivity patterns.
* **Personalized Recommendations** — generates recommendations based on user performance.
* **Difficulty Adjustment** — suggests suitable cognitive challenge difficulty.

### 🧩 Cognitive Challenges

The platform supports multiple challenge types:

* Mathematics
* Logic
* Memory
* Word
* Pattern
* Riddle
* Quiz

Challenges can be associated with alarms and used as wake-up verification.

### 📊 Analytics

The system can calculate and analyze:

* Wake-up consistency
* Snooze reduction
* Challenge completion
* Challenge accuracy
* Sleep adherence
* Habit score
* Productivity correlation
* Alarm effectiveness
* User behaviour patterns

### 📈 Dashboards

The platform is designed to provide:

* User dashboard
* Coach dashboard
* Admin dashboard
* Alarm statistics
* Habit performance
* Challenge performance
* Recommendation insights
* Productivity trends

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │      Frontend       │
                         │   React / Web UI    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     FastAPI API     │
                         │       main.py       │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
             ┌────────────┐ ┌─────────────┐ ┌──────────────┐
             │ AI Models  │ │  Analytics  │ │   Database   │
             │ai_models.py│ │   Engine    │ │ database.py  │
             └────────────┘ └─────────────┘ └──────────────┘
                    │               │                │
                    └───────────────┼────────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ Intelligent Results │
                         │ Predictions /       │
                         │ Recommendations /   │
                         │ Adaptive Alarms     │
                         └─────────────────────┘
```

## 🤖 AI Module

The AI component is organized into four major areas:

### 1. Anomaly Detection

The system processes sensor data and identifies abnormal values or behaviour.

```text
Sensor Data
     ↓
Preprocessing
     ↓
Anomaly Detector
     ↓
Anomaly Score
     ↓
Normal / Abnormal
```

### 2. Pattern Learning

Historical data is analyzed to identify recurring user or sensor patterns.

```text
Historical Data
      ↓
Pattern Learning
      ↓
Detected Patterns
      ↓
Behaviour Prediction
```

### 3. Adaptive Alarm System

The system records how users interact with alarms and uses that information to improve future alarm behaviour.

```text
Alarm
  ↓
User Action
  ↓
Snooze / Dismiss / Complete
  ↓
Behaviour History
  ↓
Adaptive Model
  ↓
Improved Alarm Behaviour
```

### 4. Predictive Analytics

Historical behaviour is analyzed to estimate alarm effectiveness and provide recommendations.

## 🧮 Habit and Behaviour Analytics

The analytics layer evaluates multiple behavioural indicators:

| Metric                   | Purpose                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| Wake-up Consistency      | Measures consistency of waking at the scheduled time                |
| Challenge Completion     | Measures completion of cognitive challenges                         |
| Snooze Reduction         | Measures improvement in avoiding repeated snoozes                   |
| Sleep Adherence          | Measures adherence to the user's preferred sleep duration           |
| Challenge Accuracy       | Measures cognitive challenge performance                            |
| Productivity Correlation | Studies the relationship between wake-up behaviour and productivity |

These metrics can be combined to generate an overall habit score.

## 🛠️ Technology Stack

### Frontend

* React
* JavaScript
* CSS
* Tailwind CSS
* Framer Motion
* Recharts

### Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy
* Uvicorn

### AI / Data Processing

* Python
* NumPy
* Scikit-learn
* Machine Learning models
* Behavioural analytics

### Database

* SQLite for local/development use
* PostgreSQL support for scalable deployment
* SQLAlchemy ORM

### Development Tools

* Git
* GitHub
* VS Code
* Docker

## 📁 Project Structure

```text
Cognitive-Alarm-System/
│
├── backend/
│   └── Backend application modules
│
├── frontend/
│   └── Frontend application
│
├── ai_models.py
├── analytics_engine.py
├── main.py
├── models.py
├── database.py
│
├── cognitive_challenge_engine.py
│
├── API_DOCUMENTATION.md
├── ARCHITECTURE.md
├── FEATURES.md
├── CONFIGURATION.md
├── DATABASE_DOCUMENTATION.md
├── DEPENDENCIES.md
├── FOLDER_STRUCTURE.md
├── INSTALLATION_GUIDE.md
├── PROJECT_OVERVIEW.md
├── TESTING_GUIDE.md
│
├── .env.example
├── docker-compose.yml
└── README.md
```

## 🔌 Important API Endpoints

### Health

```text
GET /health
```

Checks backend availability.

### Alarm Management

```text
POST   /alarms/create
GET    /alarms
GET    /alarms/{alarm_id}
PUT    /alarms/{alarm_id}
DELETE /alarms/{alarm_id}
```

### Sensor and Anomaly Detection

```text
POST /sensors/data
GET  /sensors/{sensor_id}/anomalies
```

### Pattern Learning

```text
POST /patterns/learn
GET  /patterns/{sensor_id}/predict
```

### User Behaviour

```text
POST /behaviors/record
GET  /behaviors/{alarm_id}/predict
```

### Analytics

```text
GET /analytics/alarm/{alarm_id}/health
GET /analytics/overview
```

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/GKSJ19/Cognitive-Alarm-System.git
cd Cognitive-Alarm-System
```

### 2. Create a Python virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

On Linux/macOS:

```bash
source venv/bin/activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file based on:

```text
.env.example
```

Do not commit passwords, API keys, or other secrets.

### 5. Start the FastAPI backend

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

## 🧪 Testing

The project can be tested at multiple levels:

* Backend API testing
* AI model testing
* Database testing
* Frontend integration testing
* End-to-end testing

Sample API requests can be tested using:

* FastAPI Swagger UI
* Postman
* Frontend application

## 🔄 AI Data Flow

```text
User / Sensor Data
        ↓
     FastAPI
        ↓
 Data Validation
        ↓
 AI Processing
        ↓
 ┌──────┴─────────┐
 ↓                ↓
Pattern        Anomaly
Learning       Detection
 ↓                ↓
 └──────┬─────────┘
        ↓
Behaviour Analytics
        ↓
Prediction
        ↓
Recommendations
        ↓
Adaptive Alarm
```

## 🌟 Future Enhancements

* Train AI models using larger real-world datasets.
* Improve personalized alarm prediction.
* Add advanced time-series forecasting.
* Improve anomaly detection accuracy.
* Add continuous model evaluation.
* Introduce online learning for changing user behaviour.
* Improve mobile and wearable integration.
* Add real-time notifications.
* Deploy the backend using Docker and cloud infrastructure.
* Expand analytics and recommendation capabilities.

## 👥 Team Contribution

The project follows a modular team-based architecture.

### AI / ML

Responsible for:

* AI models
* Anomaly detection
* Pattern learning
* Adaptive alarm intelligence
* Behaviour analytics
* Predictive analytics
* Recommendation logic

### Backend

Responsible for:

* FastAPI services
* Authentication
* API integration
* Database services
* Backend business logic

### Frontend

Responsible for:

* User interface
* Dashboards
* Alarm interaction
* Analytics visualization
* Frontend-backend integration

## 📄 Documentation

Additional project documentation is available in:

* `ARCHITECTURE.md`
* `API_DOCUMENTATION.md`
* `DATABASE_DOCUMENTATION.md`
* `FEATURES.md`
* `INSTALLATION_GUIDE.md`
* `TESTING_GUIDE.md`
* `PROJECT_OVERVIEW.md`

## 🔒 Security

* Never commit `.env` files containing secrets.
* Use `.env.example` as the configuration template.
* Passwords should be securely hashed.
* Protected APIs should use authentication and authorization.
* Production deployments should use HTTPS and secure database credentials.

## 📜 License

This project is licensed under the MIT License.

## 👨‍💻 Project

**Cognitive Alarm System**

An intelligent alarm platform combining adaptive alarms, cognitive challenges, behavioural analytics, and AI-powered recommendations.
