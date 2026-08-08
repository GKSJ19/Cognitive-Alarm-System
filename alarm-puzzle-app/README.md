# Alarm + Math Puzzle App

A real alarm app with login, a home screen, real alarms, a math-puzzle
dismiss flow, a dashboard, and challenges — all backed by real data, no
placeholders.

This project is fully wired: native Android/iOS scaffolding, navigation,
permissions, and all screens are already in place. You only need to run
`npm install` and set up your own free Firebase project for login.

## What's real here

- **Android alarms**: `AlarmManager` (via `notifee`) schedules exact-time
  alarms that fire even if the app is fully closed, with a full-screen
  intent that shows the puzzle over the lock screen with looping sound —
  the same mechanism real alarm-clock apps use.
- **iOS alarms**: local notifications with sound. iOS does not allow
  third-party apps to override silent mode/Do Not Disturb without Apple's
  Critical Alerts entitlement (rarely granted). Prioritize Android first
  if reliable ringing matters most.
- **Login/signup**: real Firebase Authentication (email/password) — not a
  mock. Each account's alarms and solve history are stored separately.
- **Dashboard & Challenges**: every stat (streaks, attempts, solve time,
  challenge progress) is computed from entries written to on-device
  storage at the moment a puzzle is actually solved.

## 1. Install dependencies

```bash
npm install
cd ios && pod install && cd ..   # macOS only, for iOS
```

## 2. Set up Firebase (required for login)

1. Go to https://console.firebase.google.com → create a project (free).
2. **Build → Authentication → Get started** → enable **Email/Password**.
3. **Build → Firestore Database → Create database** (start in test mode).
4. **Project settings → General → Your apps → Add app → Web** (`</>` icon).
   Register it and copy the `firebaseConfig` object shown.
5. Paste those values into `src/utils/firebaseConfig.js`, replacing the
   `YOUR_...` placeholders.

## 3. Run it

```bash
npx react-native start
# in a second terminal:
npx react-native run-android
# or
npx react-native run-ios
```

Android 12+ will prompt you to allow exact alarms and notifications the
first time — accept both, or scheduled alarms won't fire.

## Project structure

```
App.js                          navigation + auth state + alarm-tap routing
src/screens/LoginScreen.js      real Firebase sign-in
src/screens/SignupScreen.js     real Firebase account creation
src/screens/HomeScreen.js       landing page, real next-alarm + quick stats
src/screens/AlarmScreen.js      set & manage alarms
src/screens/PuzzleScreen.js     math puzzle that must be solved to dismiss
src/screens/DashboardScreen.js  real stats from stored solve history
src/screens/ChallengesScreen.js real progress toward streak/speed/volume goals
src/utils/alarms.js             schedules real OS alarms via notifee
src/utils/auth.js               Firebase Auth helpers
src/utils/firebaseConfig.js     <- put your Firebase project keys here
src/utils/storage.js            AsyncStorage persistence, scoped per user
src/utils/puzzle.js             math puzzle generator, difficulty 1-5
```

## Known limitation

Alarms and solve history are stored **on-device**, scoped per signed-in
account. They are not yet synced to Firestore across multiple devices —
that would be a follow-up step if you want the same account to share data
across phones.
