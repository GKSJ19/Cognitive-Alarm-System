import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboardStats, getSolves } from '../utils/storage';

function StatCard({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

function habitLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Solid';
  if (score >= 35) return 'Building';
  if (score > 0) return 'Just starting';
  return 'No data yet';
}

function HabitScoreCard({ score, hasData }) {
  return (
    <View style={styles.habitCard}>
      <View style={styles.habitRing}>
        <Text style={styles.habitScoreText}>{hasData ? score : '—'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.habitTitle}>Habit Score</Text>
        <Text style={styles.habitSubtitle}>
          {hasData
            ? `${habitLabel(score)} · streak + speed + accuracy`
            : 'Solve a puzzle to start building this'}
        </Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await getDashboardStats();
        const solves = await getSolves();
        setStats(s);
        setRecent(solves.slice(-10).reverse());
      })();
    }, [])
  );

  if (!stats) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <HabitScoreCard score={stats.habitScore} hasData={stats.totalAlarms > 0} />

      <View style={styles.grid}>
        <StatCard label="Alarms dismissed" value={stats.totalAlarms} />
        <StatCard label="Current streak" value={`${stats.currentStreak}d`} />
        <StatCard label="Longest streak" value={`${stats.longestStreak}d`} />
        <StatCard
          label="Avg attempts"
          value={stats.totalAlarms ? stats.avgAttempts : '—'}
        />
        <StatCard
          label="Avg solve time"
          value={
            stats.totalAlarms
              ? `${Math.round(stats.avgSolveTimeMs / 1000)}s`
              : '—'
          }
        />
      </View>

      <Text style={styles.subheader}>Recent solves</Text>
      {recent.length === 0 && (
        <Text style={styles.empty}>
          Nothing yet — this fills in from real dismissed alarms.
        </Text>
      )}
      {recent.map((r, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.rowDate}>
            {new Date(r.dismissedAt).toLocaleString()}
          </Text>
          <Text style={styles.rowDetail}>
            {r.attempts} attempt{r.attempts !== 1 ? 's' : ''} ·{' '}
            {Math.round(r.timeToSolveMs / 1000)}s
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115', padding: 20 },
  header: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 16 },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 24,
    marginBottom: 10,
  },
  habitCard: {
    backgroundColor: '#1c1f26',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#4f7cff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  habitScoreText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  habitTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  habitSubtitle: { color: '#8a8f98', marginTop: 2, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    backgroundColor: '#1c1f26',
    borderRadius: 14,
    padding: 16,
    width: '47%',
  },
  cardValue: { color: '#fff', fontSize: 26, fontWeight: '700' },
  cardLabel: { color: '#8a8f98', marginTop: 4 },
  empty: { color: '#8a8f98' },
  row: {
    backgroundColor: '#1c1f26',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  rowDate: { color: '#fff' },
  rowDetail: { color: '#8a8f98', marginTop: 2 },
});
