# Cognitive Alarm System - Frontend Client

## Developer Details
- **Team Member:** Kanishka
- **Branch:** Kanishka

---

## Project Overview

This is the frontend mobile application client for the **Cognitive Alarm System**. Built using **React Native**, **Expo**, and **TypeScript**, this application helps users wake up mindfully by prompting them to solve cognitive challenges (like math puzzles) to dismiss active alarms. 

State management is powered by **Redux Toolkit**, navigation is handled via **React Navigation**, and UI styling is built on **React Native Paper**.

---

## Getting Started & Running Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository and navigate to the frontend folder:
   ```bash
   cd Cognitive-Alarm-System/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the Expo Metro Bundler:
```bash
npx expo start
```
From the interactive terminal menu:
- Press **`w`** to run in your web browser.
- Press **`a`** to open in an Android Emulator.
- Press **`i`** to open in an iOS Simulator.
- Scan the **QR Code** using the Expo Go application on iOS or Android to run it directly on a physical device.

---

## Folder Structure

```text
frontend/
├── src/
│   ├── components/      # Common reusable UI components (AppButton, AppCard, AppInput, etc.)
│   ├── config/          # Environment configs and base urls
│   ├── hooks/           # Custom React hooks (useAuth, useAlarms, useProfile)
│   ├── navigation/      # Navigation configurations (AppNavigator, AuthNavigator)
│   ├── screens/         # Screen components (Login, Register, Dashboard, Alarms, Profile)
│   ├── services/        # API client modules for Axios REST integration
│   ├── store/           # Redux state store config and slices (Auth, Profile, Alarms)
│   ├── theme/           # UI theme definitions and color tokens
│   ├── types/           # TypeScript interface definitions
│   └── utils/           # Helper functions and validators
├── App.tsx              # Application entry point
├── app.json             # Expo project configuration
├── package.json         # Project dependency manifest
└── tsconfig.json        # TypeScript configuration settings
```

---

## 💻 Frontend Data Models & Redux Store Schema

### 1. TypeScript Interface Models

#### `User` (Authentication User Object)
Tracks session owner profiles and roles:
- `id` (string): Unique identifier of the user.
- `full_name` (string): The user's full name.
- `email` (string): User's registered email address.
- `role` (string): User authorization role (`'user' | 'coach' | 'admin'`).
- `is_active` (boolean): Flag to toggle account status.
- `is_verified` (boolean): Email verification status.

#### `Profile` (Detailed User Routine Preferences)
Stores demographic details and sleep schedule configurations:
- `profile_id` (string): Unique profile identifier.
- `user_id` (string): Reference linking to the owner user.
- `profile_photo` (string | null): Relative path/URI to user avatar.
- `phone_number` (string | null): Contact phone.
- `gender` (string | null): Self-identified gender.
- `date_of_birth` (string | null): Birth date.
- `occupation` (string | null): User profession.
- `timezone` (string): Preferred timezone.
- `preferred_wakeup_time` (string | null): Target wake-up time (e.g. `06:30`).
- `preferred_sleep_time` (string | null): Target bed time (e.g. `22:30`).
- `bio` (string | null): Personal bio.

#### `Alarm` (Alarm Schedule Config Scheme)
Controls alarm triggers and dismiss conditions:
- `alarm_id` (string): Unique identifier of the alarm.
- `user_id` (string): Reference to the creator user.
- `title` (string): Name/Title of the alarm.
- `alarm_time` (string): Trigger time (e.g. `07:30`).
- `repeat_days` (string | null): Comma-separated active days (e.g. `1,2,3,4,5` for weekdays).
- `challenge_required` (boolean): Flag to force cognitive puzzle completion.
- `challenge_type` (string): Type of cognitive puzzle to solve (e.g. `'math'`).
- `difficulty` (string): Puzzle difficulty level (`'easy' | 'hard'`).
- `vibrate` (boolean): Toggle device vibration.
- `snooze_enabled` (boolean): Toggle snooze button.
- `snooze_duration` (number): Snooze length in minutes.
- `is_active` (boolean): Toggle alarm on or off.

---

### 2. Redux Store State Schema

The Redux root state maps the application state as follows:

```typescript
export interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
  };
  profile: {
    profile: Profile | null;
    isLoading: boolean;
    error: string | null;
  };
  alarms: {
    alarms: Alarm[];
    history: AlarmHistory[];
    isLoading: boolean;
    error: string | null;
  };
}
```

---

### 3. Frontend Architecture & Flow Schema

Below is the architectural schema representing the React Native frontend application navigation hierarchy, state propagation, and API synchronization flow:

```text
       ┌────────────────────────────────────────────────────────┐
       │               AppNavigator (Navigation Routing)         │
       ├────────────────────────────────────────────────────────┤
       │  AuthNavigator                                         │
       │   ├── SplashScreen                                     │
       │   ├── LoginScreen                                      │
       │   └── RegisterScreen                                   │
       │                                                        │
       │  Drawer/TabNavigator (Authenticated Routes)            │
       │   ├── UserDashboardScreen                              │
       │   ├── AlarmListScreen                                  │
       │   │    ├── AddAlarmScreen                              │
       │   │    └── EditAlarmScreen                             │
       │   ├── ProfileScreen                                    │
       │   │    └── EditProfileScreen                           │
       │   └── SettingsScreen                                   │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             Redux Store (State Management)              │
       ├──────────────────────────┬─────────────────────────────┤
       │  authSlice               │  profileSlice               │
       │   ├── user               │   ├── profile               │
       │   ├── token              │   └── isLoading             │
       │   └── isAuthenticated    │                             │
       ├──────────────────────────┼─────────────────────────────┤
       │  alarmSlice              │  Axios Client (API Sync)    │
       │   ├── alarms             │   ├── Auth Requests         │
       │   └── history            │   ├── Profile Requests      │
       │                          │   └── Alarm Requests        │
       └──────────────────────────┴─────────────────────────────┘
```
