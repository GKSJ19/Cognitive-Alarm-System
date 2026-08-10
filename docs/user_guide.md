# User Guide

This guide describes how to interact with the Intelligent Cognitive Alarm platform, highlighting user roles, scoring metrics, dashboards, and reports.

---

## 1. User Roles

The platform supports three distinct types of users:

1. **Standard User (`user`):**
   * Configures alarms and challenge rules.
   * Clears alarms by solving cognitive games.
   * Views personal habit trends and exports historical reports.
2. **Wellness Coach (`wellness_coach`):**
   * Oversees all assigned clients (users).
   * Views a list of clients and checks client progress.
   * Inspects client dashboard metrics to provide tailored guidance.
3. **System Administrator (`admin`):**
   * Exercises full system access.
   * Views administrative metrics (total alarms, users, database logs, and categories).
   * Restores database backups and alters system configurations.

---

## 2. Scoring System & Morning Metrics

To encourage positive wake-up routines, the platform calculates a **Daily Habit Score** based on four major metrics (using a rolling 7-entry history):

* **Wake-Up Consistency (30%):** Measures how quickly you dismiss the alarm after it starts. Dismissals under 3 minutes award maximum points.
* **Challenge Completion (30%):** Tracks the ratio of alarms successfully solved without forced bypasses.
* **Snooze Reduction (20%):** Deduces points for multiple snooze interactions. Zero snoozes award full score.
* **Sleep Schedule Adherence (20%):** Checks how closely your actual sleep duration match bedtime preferences.

---

## 3. Reports & File Exports

Users can review their history or download files in PDF or Excel sheets:

* **Habit Reports:** Evaluates score trends over dates.
* **Wake-up Reports:** Tracks time delays, snooze interactions, and wake consistency.
* **Challenge Performance Reports:** Reports game solving speeds and answer accuracies.
* **Productivity Reports:** Summarizes morning efficiency ratings.
* **Sleep Analytics Reports:** Visualizes sleep durations and bedtime adherence rates.
