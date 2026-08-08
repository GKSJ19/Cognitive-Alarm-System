import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSolves, getDashboardStats } from '../utils/storage';

function ProgressBar({ progress }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

function ChallengeCard({ title, description, progress, progressLabel }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{description}</Text>
      <ProgressBar progress={progress} />
      <Text style={styles.cardProgressLabel}>{progressLabel}</Text>
    </View>
  );
}

export default function ChallengesScreen() {
  const [solves, setSolves] = useState([]);
  const [stats, setStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setSolves(await getSolves());
        setStats(await getDashboardStats());
      })();
    }, [])
  );

  if (!stats) return null;

  const total = stats.totalAlarms;
  const streakGoal = 7;
  const volumeGoal = 20;
  const firstTryCount = solves.filter((s) => s.attempts === 1).length;
  const firstTryRate = total ? firstTryCount / total : 0;
  const bestTime = solves.length
    ? Math.min(...solves.map((s) => s.timeToSolveMs))
    : null;
  const speedGoalMs = 10000;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Challenges</Text>
      <Text style={styles.subheader}>
        Built from your {total} real solved alarm{total === 1 ? '' : 's'}
      </Text>

      <ChallengeCard
        title="7-Day Streak"
        description="Dismiss an alarm every day for a week straight."
        progress={stats.currentStreak / streakGoal}
        progressLabel={`${Math.min(stats.currentStreak, streakGoal)} / ${streakGoal} days`}
      />

      <ChallengeCard
        title="20 Solved"
        description="Solve 20 puzzles to dismiss real alarms."
        progress={total / volumeGoal}
        progressLabel={`${Math.min(total, volumeGoal)} / ${volumeGoal}`}
      />

      <ChallengeCard
        title="First-Try Club"
        description="Get your first-attempt success rate to 70%."
        progress={firstTryRate / 0.7}
        progressLabel={
          total ? `${Math.round(firstTryRate * 100)}% first-try` : 'No data yet'
        }
      />

      <ChallengeCard
        title="Speed Solver"
        description="Solve a puzzle in under 10 seconds."
        progress={bestTime ? Math.min(1, speedGoalMs / bestTime) : 0}
        progressLabel={
          bestTime
            ? `Best: ${Math.round(bestTime / 1000)}s`
            : 'No data yet'
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115', padding: 20 },
  header: { fontSize: 28, fontWeight: '700', color: '#fff' },
  subheader: { color: '#8a8f98', marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cardDesc: { color: '#8a8f98', marginTop: 4, marginBottom: 12 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0f1115',
    overflow: 'hidden',
  },
  barFill: { height: 8, backgroundColor: '#4f7cff', borderRadius: 4 },
  cardProgressLabel: { color: '#8a8f98', marginTop: 8, fontSize: 13 },
});
