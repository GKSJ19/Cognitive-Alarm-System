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
