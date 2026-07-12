import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAnalytics } from '../../redux/slices/analyticsSlice';
import { theme } from '../../theme';

export function HomeDashboardScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { summary, loading, error } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <ScreenContainer>
      <Text style={styles.header}>Good morning</Text>
      <Text style={styles.title}>{user?.name || 'User'}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Card style={styles.card}>
        <Text style={styles.label}>Daily summary</Text>
        {loading ? <Text>Loading…</Text> : null}
        {summary ? (
          <>
            <Text style={styles.metric}>Habit score: {summary.habitScore}%</Text>
            <Text style={styles.metric}>Sleep goal: {summary.sleepGoal}</Text>
            <Text style={styles.metric}>Wake goal: {summary.wakeGoal}</Text>
          </>
        ) : null}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.label}>Next actions</Text>
        <Text style={styles.metric}>Sync alarms with your wearable</Text>
        <Text style={styles.metric}>Review cognitive challenge results</Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 16, color: theme.colors.muted },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  metric: { color: theme.colors.text, marginBottom: 6 },
  card: { marginTop: 4 },
  error: { color: '#dc2626' },
});
