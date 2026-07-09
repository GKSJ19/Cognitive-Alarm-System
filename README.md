# Lucid — Cognitive Alarm Platform (Flutter frontend)

This is the Flutter frontend for the puzzle-to-dismiss cognitive alarm app,
matching the design of the web prototype built earlier (dark UI, mint/violet
accent, pulsing "neural rings" clock).

## What's included
- `lib/main.dart` — app entry point, wires up state + routing
- `lib/theme/app_theme.dart` — color tokens and text styles
- `lib/models/models.dart` — Alarm, WakeLogEntry, UserData
- `lib/state/app_state.dart` — mock auth + alarm/puzzle logic (ChangeNotifier)
- `lib/screens/auth_screen.dart` — login / register
- `lib/screens/dashboard_screen.dart` — neural clock, alarm list, stats, log
- `lib/screens/alarm_ring_screen.dart` — full-screen puzzle-to-dismiss alarm
- `lib/widgets/neural_clock.dart` — animated pulsing clock face
- `lib/widgets/alarm_tile.dart` — alarm list item

## Setup
1. Make sure you have the Flutter SDK installed (`flutter --version`).
2. Copy this folder into your project, or use it as the project root.
3. Install dependencies:
   ```
   flutter pub get
   ```
4. Run it:
   ```
   flutter run
   ```

## How it works
- Register an account, then log in. Auth is currently a mock in-memory
  store in `AppState` — no real backend, no password hashing, resets on
  app restart. This is intentional for prototyping the UX; swap it for
  real calls to a User Service (see the backend architecture/schema docs)
  before shipping.
- Add an alarm with a time and a puzzle type (math / memory / mixed).
- Use "Test alarm now" to trigger immediately without waiting for the clock.
- When ringing, the puzzle screen cannot be dismissed by the back gesture —
  only by solving the puzzle. Wrong answers increase difficulty and
  re-roll the puzzle within the same mode (so "Memory only" always stays
  memory puzzles).
- Each solve logs solve time, wrong attempts, and an engagement score, and
  increments your streak.

## Next steps (not yet implemented here)
- Real backend integration (see the FastAPI/PostgreSQL schema discussed
  separately) for the User, Alarm, and Verification services.
- Local push notifications / background alarm scheduling (this demo only
  fires while the app is open, via `Timer.periodic`); production use needs
  a plugin like `android_alarm_manager_plus` / `flutter_local_notifications`
  plus platform-specific background execution.
- Real audio for the alarm sound instead of `SystemSound.alert`.
- Server-side answer verification so puzzle solutions can't be bypassed
  by inspecting client state.

