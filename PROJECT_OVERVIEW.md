# Project Overview — Intelligent Cognitive Alarm Platform (Milestone 2)

## 📌 Executive Summary
The **Intelligent Cognitive Alarm Platform** is an AI-powered wake-up system built for the **Anti Gravity Internship**. Unlike conventional alarm applications that allow users to repeatedly snooze or dismiss alarms half-asleep, this platform forces users to complete cognitive challenges (Math, Logic, Memory, Word Games, Pattern Recognition, Riddles, Quick Quizzes) to turn off the alarm.

## 🎯 Objectives
- **Cognitive Awakening**: Engage the user's prefrontal cortex at alarm time.
- **Adaptive Difficulty**: Use performance history to automatically adjust challenge difficulty (Easy, Medium, Hard).
- **Gamification**: Reward wakefulness with XP, streaks, and achievement badges.
- **Dual-Database Architecture**: Store relational data (users, alarms, streaks) in PostgreSQL and high-volume analytics/logs in MongoDB.
- **Production Infrastructure**: Full Docker containerization, comprehensive test suite, and clean REST APIs.

## 🔑 Key Deliverables (Milestone 2)
1. **7 Cognitive Challenge Categories**
   - Mathematical Problems (Arithmetic, Percentages, Algebra)
   - Logic Puzzles (Number Patterns, Logical Reasoning, Missing Elements)
   - Memory Challenges (Words, Numbers, Image Sequences, Position Memory)
   - Word Games (Unscramble, Synonyms, Antonyms, Vocab Completion)
   - Pattern Recognition (Shape Sequences, Color Patterns, Progressions)
   - Riddles (Short Reasoning, Everyday Logic)
   - Quick Quizzes (General Knowledge, Science)
2. **Adaptive Difficulty Engine**
   - Calculates rolling success rate over recent attempts to select appropriate difficulty.
3. **Gamified XP & Badge System**
   - Base scores, speed bonuses, XP multipliers, and 15 unlockable badges.
4. **User Progress & Leaderboard APIs**
   - `/api/v1/progress/summary`, `/api/v1/progress/categories`, `/api/v1/progress/leaderboard`.
5. **Docker Infrastructure**
   - Multi-service deployment with PostgreSQL 16, MongoDB 7, Mongo-Express, and FastAPI.
