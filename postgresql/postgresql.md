# PostgreSQL Documentation - Intelligent Cognitive Alarm Platform

## Database Name

cognitive_alarm_db

## Purpose

PostgreSQL is the primary relational database of the Intelligent Cognitive Alarm Platform.

It stores structured application data and maintains relationships between entities.

---

## Tables

### 1. users

Purpose:

Stores user profile and authentication-related information.

### 2. alarms

Purpose:

Stores alarm scheduling information.

Supported alarm types:

- Daily Alarm
- Weekday Alarm
- Weekend Alarm
- One-Time Alarm
- Smart Adaptive Alarm

### 3. habits

Purpose:

Stores habit management information.

### 4. scores

Purpose:

Stores habit scoring information.

### 5. reports

Purpose:

Stores report information.

Supported report formats:

- PDF
- Excel

---

## Relationships

- users → alarms
- users → habits
- users → scores
- users → reports

Foreign key:

user_id

---

## Source

This PostgreSQL database design is based on the Intelligent Cognitive Alarm Platform project PDF.

The database supports:

- User Authentication
- User Profile Management
- Habit Management
- Alarm Scheduling
- Habit Scoring
- Reports

---

## Current Status

- Database created successfully.
- Tables created successfully.
- Primary Keys implemented.
- Foreign Keys implemented.
- Sample data inserted.
- SQL validation completed.
- Backup completed.