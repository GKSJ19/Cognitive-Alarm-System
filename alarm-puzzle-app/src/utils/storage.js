import AsyncStorage from '@react-native-async-storage/async-storage';
import { currentUser } from './auth';

// Keys are scoped per signed-in user so accounts don't share data.
function alarmsKey() {
  const uid = currentUser()?.uid ?? 'anon';
  return `@alarm_puzzle/${uid}/alarms`;
}
function solvesKey() {
  const uid = currentUser()?.uid ?? 'anon';
  return `@alarm_puzzle/${uid}/solves`;
}

// ---------- Alarms ----------

export async function getAlarms() {
  const raw = await AsyncStorage.getItem(alarmsKey());
  return raw ? JSON.parse(raw) : [];
}

export async function saveAlarm(alarm) {
  const alarms = await getAlarms();
  const idx = alarms.findIndex((a) => a.id === alarm.id);
  if (idx >= 0) {
    alarms[idx] = alarm;
  } else {
    alarms.push(alarm);
  }
  await AsyncStorage.setItem(alarmsKey(), JSON.stringify(alarms));
  return alarms;
}

export async function deleteAlarm(id) {
  const alarms = await getAlarms();
  const next = alarms.filter((a) => a.id !== id);
  await AsyncStorage.setItem(alarmsKey(), JSON.stringify(next));
  return next;
}

// ---------- Solve history (real data, no dummy values) ----------
// Each entry: { alarmId, scheduledFor, dismissedAt, attempts, timeToSolveMs }

export async function getSolves() {
  const raw = await AsyncStorage.getItem(solvesKey());
  return raw ? JSON.parse(raw) : [];
}

export async function recordSolve(entry) {
  const solves = await getSolves();
  solves.push(entry);
  await AsyncStorage.setItem(solvesKey(), JSON.stringify(solves));
  return solves;
}

export async function getDashboardStats() {
  const solves = await getSolves();
  if (solves.length === 0) {
    return {
      totalAlarms: 0,
      avgAttempts: 0,
      avgSolveTimeMs: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  const totalAlarms = solves.length;
  const avgAttempts =
    solves.reduce((sum, s) => sum + s.attempts, 0) / totalAlarms;
  const avgSolveTimeMs =
    solves.reduce((sum, s) => sum + s.timeToSolveMs, 0) / totalAlarms;

  // Streak = consecutive days with a recorded dismiss, most recent first
  const days = [
    ...new Set(
      solves.map((s) => new Date(s.dismissedAt).toDateString())
    ),
  ]
    .map((d) => new Date(d))
    .sort((a, b) => b - a);

  let currentStreak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const day of days) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === cursor.getTime()) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (d.getTime() < cursor.getTime()) {
      break;
    }
  }

  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (days[i - 1] - days[i]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 1;
    }
  }
  if (days.length === 0) longestStreak = 0;

  return {
    totalAlarms,
    avgAttempts: Math.round(avgAttempts * 10) / 10,
    avgSolveTimeMs: Math.round(avgSolveTimeMs),
    currentStreak,
    longestStreak,
  };
}
