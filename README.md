# 🧠 Intelligent Cognitive Alarm Platform (ICAP)

An AI-powered mobile alarm platform designed to improve wake-up habits by requiring users to complete cognitive challenges before dismissing an alarm.

ICAP combines a **React Native mobile application, FastAPI backend, PostgreSQL database, JWT authentication, Cognitive Challenge Engine, Adaptive Difficulty, Habit Scoring, Behavioral Analytics, and cloud deployment** into a complete full-stack application.

---

# 📌 Project Overview

Traditional alarm applications allow users to dismiss or snooze alarms without encouraging consistent wake-up behavior.

The **Intelligent Cognitive Alarm Platform (ICAP)** addresses this problem by introducing a cognitive verification mechanism.

When an alarm is triggered, the user is required to complete an AI-selected cognitive challenge before the alarm can be dismissed.

The challenge type and difficulty are determined by the system based on the user's performance and behavioral metrics. Users do not manually select the challenge type or difficulty.

The platform is designed to encourage:

* Consistent wake-up habits
* Cognitive engagement immediately after waking
* Behavioral improvement
* Personalized challenge difficulty
* Performance-based habit tracking

---

# 🎯 Project Objectives

The main objectives of ICAP are:

* Develop an intelligent alarm application that prevents direct alarm dismissal.
* Require users to complete cognitive challenges after an alarm is triggered.
* Dynamically select suitable challenge types and difficulty levels.
* Analyze user performance and wake-up behavior.
* Calculate and track habit scores.
* Provide adaptive difficulty based on user performance.
* Provide user profile and alarm management.
* Provide Coach and Administrator functionality.
* Integrate frontend, backend, database, and AI/ML components.
* Deploy the backend using Docker and Render.
* Validate the complete application using the production API.
* Deliver a complete full-stack mobile application.

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────┐
│        React Native Mobile App      │
│             Expo + TypeScript       │
│                                     │
│ • Authentication                    │
│ • User Profile                      │
│ • Alarm Scheduling                  │
│ • Cognitive Challenge UI            │
│ • Chat                              │
│ • Notifications                     │
│ • Coach / Admin Interfaces          │
└──────────────────┬──────────────────┘
                   │
                   │ Axios / REST API
                   ▼
┌─────────────────────────────────────┐
│          FastAPI Backend             │
│                                     │
│ • JWT Authentication                │
│ • User Management                   │
│ • Profile Management                │
│ • Alarm Management                  │
│ • Habit Management                  │
│ • Challenge Integration             │
│ • Challenge Evaluation              │
│ • Adaptive Difficulty               │
│ • Habit Scoring                     │
│ • Behavioral Analytics              │
│ • Chat Services                     │
│ • Coach Services                    │
│ • Administrator Services            │
│ • Notification Services             │
└──────────────────┬──────────────────┘
                   │
                   │ SQLAlchemy
                   ▼
┌─────────────────────────────────────┐
│          PostgreSQL Database         │
│                                     │
│ • Users                             │
│ • Profiles                          │
│ • Alarms                            │
│ • Habits                            │
│ • Challenges                        │
│ • Notifications                     │
│ • Chat Data                         │
│ • Coach Data                        │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│      Cognitive Challenge Engine      │
│                                     │
│ • Challenge Selection               │
│ • Difficulty Selection              │
│ • Performance Evaluation            │
│ • Adaptive Difficulty               │
│ • Habit Scoring                     │
│ • Behavioral Analysis               │
└─────────────────────────────────────┘
```

---

# 💻 Technology Stack

## Frontend

* React Native
* Expo
* TypeScript
* React Navigation
* Redux Toolkit
* Axios
* Expo Notifications
* Expo Application Services (EAS)

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT
* Uvicorn
* REST APIs
* Docker

## Database

* PostgreSQL
* SQLAlchemy ORM

## AI / ML

* Cognitive Challenge Engine
* Adaptive Difficulty
* Habit Scoring
* Behavioral Analytics
* Performance-based Challenge Selection

## Deployment

* GitHub
* Docker
* Render
* PostgreSQL
* Expo / EAS

---

# 📱 Mobile Application

The ICAP mobile application was developed using **React Native with Expo and TypeScript**.

The mobile application provides the primary interface through which users interact with the ICAP system.

## Implemented Features

### Authentication

* User registration
* User login
* JWT authentication
* Role-based authentication
* Protected application routes
* Secure API communication

### User Profile

* User profile display
* Profile information management
* Profile API integration
* User-specific data handling

### Alarm Management

* Alarm creation
* Alarm scheduling
* Alarm updating
* Alarm deletion
* Alarm status management
* Global alarm scheduling
* User-specific alarm management

### Cognitive Challenge

* Cognitive challenge interface
* Challenge presentation
* Challenge completion
* Challenge evaluation
* Challenge result handling
* Integration with backend challenge services

### Chat

* Chat interface
* Chat detail screen
* Chat service integration
* Backend chat communication
* WebSocket-related backend support

### Notifications

* Notification integration
* Alarm-related notification support
* Backend notification services
* Notification API integration

### Coach Functionality

* Coach interface
* Coach-related screens
* Coach API integration
* User performance/habit information

### Administrator Functionality

* Administrator interface
* Admin authentication
* Admin-related screens
* User management support
* Administrative API integration

---

# 📁 Mobile Project Structure

```text
mobile/
├── assets/
├── src/
│   ├── config/
│   ├── screens/
│   │   ├── chat/
│   │   ├── common/
│   │   └── ...
│   ├── services/
│   └── ...
├── App.tsx
├── app.json
├── eas.json
├── babel.config.js
├── package.json
└── package-lock.json
```

---

# ⚙️ FastAPI Backend

The backend was developed using **FastAPI** and provides the REST APIs required by the mobile application.

The backend follows a modular architecture using:

* Routers
* Services
* Schemas
* Models
* Authentication
* Database integration
* Utility modules

---

# 🔐 Authentication & Authorization

JWT-based authentication was implemented for secure communication between the mobile application and backend.

## Implemented Components

* User registration
* User login
* JWT token generation
* JWT token validation
* Protected routes
* Role-based authorization
* User access control
* Coach access control
* Administrator access control

The backend validates authenticated requests before allowing access to protected resources.

---

# 👤 User Management

The user management module provides:

* User registration
* User authentication
* User information management
* Role management
* User profile management
* Protected user APIs

The system supports different application roles such as:

* User
* Wellness Coach
* Administrator

---

# 👤 User Profile Module

The Profile module provides functionality for managing user information.

Implemented functionality includes:

* Profile retrieval
* Profile updates
* User-specific profile data
* Profile API integration
* Authenticated profile access

---

# ⏰ Alarm Scheduling Module

The Alarm module is one of the core components of ICAP.

Implemented functionality includes:

* Create alarm
* Retrieve alarms
* Update alarm
* Delete alarm
* Enable/disable alarms
* Schedule alarms
* Manage user-specific alarms
* Global alarm scheduling
* Alarm ownership validation

The alarm system is integrated with the cognitive challenge workflow.

---

# 🧠 Cognitive Challenge Engine Integration

The Cognitive Challenge Engine is a core feature of ICAP.

The platform integrates multiple types of cognitive challenges, including:

* Math challenges
* Memory challenges
* Attention challenges

The system also supports:

* Challenge generation
* Challenge selection
* Challenge evaluation
* Difficulty levels
* Performance tracking
* Adaptive difficulty

The user does not manually choose the challenge type or difficulty.

Instead, the system uses performance-related information to determine the appropriate challenge.

---

# 🎚️ Adaptive Difficulty

Adaptive Difficulty was integrated to personalize the challenge experience.

The system evaluates user performance and uses it to determine appropriate challenge difficulty.

This helps prevent:

* Challenges being too easy
* Challenges being unnecessarily difficult
* Repetitive challenge experiences

The objective is to provide a challenge level appropriate to the user's current performance.

---

# 📊 Habit Scoring

Habit Scoring was integrated to evaluate user wake-up behavior.

The scoring system can consider factors such as:

* Alarm completion
* Challenge completion
* Challenge performance
* Wake-up consistency
* Challenge difficulty
* User performance

The resulting score can be used to represent the user's habit progress.

---

# 📈 Behavioral Analytics

Behavioral analytics functionality was integrated to analyze user performance and wake-up patterns.

The backend supports analysis of:

* Wake-up behavior
* Challenge performance
* Habit progress
* Challenge completion
* Performance trends

These analytics can support adaptive challenge selection and habit improvement.

---

# 💬 Chat Module

The application contains a chat system for communication and wellness-related interaction.

## Mobile Components

* Chat screen
* Chat detail screen
* Chat service
* API integration

## Backend Components

* Chat router
* Chat schemas
* Chat service
* WebSocket manager
* Chat-related models

---

# 🧑‍🏫 Coach Module

The Coach module supports wellness monitoring and user-related interactions.

Implemented backend functionality includes:

* Coach authentication
* Coach routes
* Coach services
* User-related information
* Habit/performance information
* Coach dashboard support

---

# 🛡️ Administrator Module

The Administrator module provides system-level management functionality.

Implemented functionality includes:

* Administrator authentication
* Role-based access
* User management
* Administrative APIs
* Admin services
* Dashboard-related functionality

---

# 🔔 Notification Module

The notification system supports alarm and user activity workflows.

Backend components include:

* Notification models
* Notification schemas
* Notification router
* Notification services

The mobile application integrates notification functionality for user-facing alarm events.

---

# 🔗 Frontend–Backend Integration

The React Native application communicates with the FastAPI backend using **Axios** and REST APIs.

```text
Mobile Application
       │
       │ Axios
       ▼
FastAPI REST API
       │
       │ SQLAlchemy
       ▼
PostgreSQL Database
```

The application was configured to use the **production backend API URL**.

The complete frontend-to-backend communication was tested using the deployed production API.

---

# 🗄️ Database Integration

PostgreSQL was used as the production database.

SQLAlchemy ORM was used for database interaction.

The database supports entities related to:

* Users
* Profiles
* Alarms
* Habits
* Challenges
* Coaches
* Notifications
* Chat

Database connectivity and production API integration were tested successfully.

---

# 🐳 Docker Configuration

The FastAPI backend was containerized using Docker.

The backend includes:

```text
Dockerfile
compose.yaml
requirements.txt
```

Docker was used to provide a consistent deployment environment for the backend.

---

# ☁️ Backend Deployment

The backend was deployed using **Render**.

Deployment architecture:

```text
GitHub
   │
   ▼
Backend Repository
   │
   ▼
Docker Build
   │
   ▼
Render
   │
   ▼
FastAPI Production API
   │
   ▼
PostgreSQL
```

The deployed production API was successfully integrated with the React Native mobile application.

---

# 📱 Production API Integration

The mobile application was configured to communicate with the deployed backend rather than only using a local development server.

The production workflow was tested as:

```text
React Native App
       ↓
Production API URL
       ↓
Render
       ↓
FastAPI Backend
       ↓
PostgreSQL
```

Production API testing was completed successfully.

---

# 🔒 Environment Configuration

Sensitive configuration values are stored using environment variables.

Examples include:

```text
DATABASE_URL
JWT_SECRET_KEY
API_BASE_URL
EMAIL configuration
OAuth configuration
```

Sensitive files such as `.env` are excluded from Git using `.gitignore`.

The repository also excludes unnecessary generated files such as:

```text
node_modules/
.expo/
dist/
__pycache__/
venv/
*.db
```

---

# 🧪 Testing & Validation

The application underwent overall testing and production validation.

## Backend Testing

* Authentication API testing
* User API testing
* Profile API testing
* Alarm API testing
* Habit API testing
* Challenge API testing
* Coach API testing
* Administrator API testing
* Notification API testing
* Chat API testing
* Database connectivity testing
* Production API testing

## Mobile Testing

* Registration testing
* Login testing
* Role-based navigation testing
* Profile testing
* Alarm scheduling testing
* Challenge workflow testing
* Chat testing
* Notification testing
* API integration testing
* Production backend connectivity testing

## Integration Testing

* Mobile → FastAPI
* FastAPI → PostgreSQL
* FastAPI → Cognitive Challenge Engine
* Challenge → Evaluation
* Evaluation → Habit Scoring
* Backend → Production deployment
* Production API → Mobile application

---

# 🐛 Final Bug Fixing

Final application bug fixing was completed as part of Milestone 4.

The final phase included:

* Identifying frontend issues
* Identifying backend issues
* Fixing API integration problems
* Fixing navigation issues
* Fixing UI-related issues
* Fixing production configuration issues
* Fixing authentication workflow issues
* Validating database connectivity
* Validating production API behavior
* Verifying complete application workflows

---

# 🚀 Final Deployment

The final deployment preparation and validation were completed.

Completed deployment activities:

* Backend Docker configuration
* Backend GitHub repository management
* Render deployment
* PostgreSQL production integration
* Production API configuration
* Mobile production API configuration
* Backend production testing
* Mobile production API testing
* Deployment validation
* Final application verification

---

# 🏆 Milestone 4 – Final Completion

Milestone 4 represents the **final completion and validation phase** of the ICAP project.

The following major activities were completed:

### 🔧 Final Bug Fixing

All identified major frontend, backend, integration, and production issues were reviewed and fixed.

### 🧪 Overall Application Testing

The complete application was tested across the mobile application, backend APIs, database, cognitive challenge workflow, and production environment.

### 🔗 Final Integration

The React Native frontend, FastAPI backend, PostgreSQL database, and Cognitive Challenge Engine were integrated and validated as a complete system.

### 🚀 Deployment Preparation

The backend was containerized using Docker and prepared for cloud deployment.

### ☁️ Production Deployment

The backend was deployed through Render and connected to the production PostgreSQL database.

### 🌐 Production Validation

The production API was tested and successfully connected with the React Native mobile application.

### ✅ Final Application Verification

The major application workflows were tested end-to-end to verify that the complete ICAP system operates correctly.

---

# 📊 Final System Workflow

```text
                User
                 │
                 ▼
        React Native Mobile App
                 │
                 ▼
          JWT Authentication
                 │
                 ▼
         Alarm Scheduling
                 │
                 ▼
          Alarm is Triggered
                 │
                 ▼
       Cognitive Challenge
                 │
                 ▼
       Challenge Evaluation
                 │
                 ▼
       Performance Analysis
                 │
          ┌──────┴──────┐
          ▼             ▼
   Habit Scoring   Adaptive Difficulty
          │             │
          └──────┬──────┘
                 ▼
        Behavioral Analytics
                 │
                 ▼
          PostgreSQL Database
                 │
                 ▼
       Coach / Admin Dashboard
```

---

# 👨‍💻 Full Stack Contribution

As the **Full Stack Developer and Team Lead**, my major contributions to ICAP include both frontend and backend development and the integration of the complete application.

## Frontend Development

* Developed the React Native mobile application.
* Used Expo and TypeScript for mobile development.
* Implemented application navigation.
* Implemented authentication interfaces.
* Implemented role-based navigation.
* Developed user profile functionality.
* Developed alarm scheduling functionality.
* Integrated cognitive challenge workflows.
* Developed chat interfaces.
* Integrated notification functionality.
* Developed Coach-related interfaces.
* Developed Administrator-related interfaces.
* Integrated REST APIs using Axios.
* Configured production API connectivity.
* Configured Expo/EAS application settings.
* Performed mobile application testing.
* Fixed frontend bugs and integration issues.

## Backend Development

* Developed the FastAPI backend.
* Designed modular backend architecture.
* Implemented JWT authentication.
* Implemented role-based authorization.
* Developed REST APIs.
* Developed user management APIs.
* Developed profile APIs.
* Developed alarm scheduling APIs.
* Integrated cognitive challenge functionality.
* Integrated adaptive difficulty.
* Integrated habit scoring.
* Integrated behavioral analytics.
* Developed chat services.
* Developed coach services.
* Developed administrator services.
* Developed notification services.
* Integrated production email functionality.
* Integrated PostgreSQL using SQLAlchemy.
* Configured Docker deployment.
* Performed backend API testing.
* Performed production API testing.
* Fixed backend and production issues.

## Deployment & Integration

* Managed GitHub repositories and branches.
* Maintained the mobile project repository.
* Maintained the separate backend deployment repository.
* Configured Docker for backend deployment.
* Deployed backend using Render.
* Integrated PostgreSQL production database.
* Configured production API URL.
* Connected mobile application to the production backend.
* Performed complete frontend-backend integration testing.
* Performed final production validation.
* Completed final bug fixing and application testing.

---

# 👥 Project Team

**Project:** Intelligent Cognitive Alarm Platform (ICAP)

**Team:** Team 3

**Role:** Full Stack Developer & Team Lead

---

# 📌 Milestone 4 Final Status

| Area                                   | Status      |
| -------------------------------------- | ----------- |
| React Native Mobile Application        | ✅ Completed |
| FastAPI Backend                        | ✅ Completed |
| JWT Authentication                     | ✅ Completed |
| Role-Based Authorization               | ✅ Completed |
| User Profile                           | ✅ Completed |
| Alarm Scheduling                       | ✅ Completed |
| Cognitive Challenge Engine Integration | ✅ Completed |
| Adaptive Difficulty                    | ✅ Completed |
| Habit Scoring                          | ✅ Completed |
| Behavioral Analytics                   | ✅ Completed |
| Chat Integration                       | ✅ Completed |
| Notification Services                  | ✅ Completed |
| Coach Module                           | ✅ Completed |
| Administrator Module                   | ✅ Completed |
| PostgreSQL Integration                 | ✅ Completed |
| Docker Configuration                   | ✅ Completed |
| Render Deployment                      | ✅ Completed |
| Production API Integration             | ✅ Completed |
| Final Bug Fixing                       | ✅ Completed |
| Overall Application Testing            | ✅ Completed |
| Production Validation                  | ✅ Completed |
| Final Integration Testing              | ✅ Completed |
| Final Application Verification         | ✅ Completed |

---

# 🏁 Conclusion

The **Intelligent Cognitive Alarm Platform (ICAP)** has successfully reached the final Milestone 4 stage.

The project delivers a complete full-stack solution consisting of:

* **React Native + Expo mobile application**
* **FastAPI backend**
* **PostgreSQL database**
* **JWT authentication**
* **Cognitive Challenge Engine**
* **Adaptive Difficulty**
* **Habit Scoring**
* **Behavioral Analytics**
* **Coach and Administrator modules**
* **Chat and Notification services**
* **Docker-based backend deployment**
* **Render cloud deployment**
* **Production API integration**

The final application has undergone **bug fixing, overall application testing, final integration, deployment preparation, production validation, and complete system verification**.

**ICAP is completed as a fully integrated full-stack application for Milestone 4.**
