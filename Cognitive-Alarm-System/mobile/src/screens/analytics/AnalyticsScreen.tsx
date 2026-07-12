import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAnalytics } from '../../redux/slices/analyticsSlice';
import { theme } from '../../theme';

export function AnalyticsScreen() {
  const dispatch = useAppDispatch();
  const { summary, loading, error } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.subtitle}>Monitor habits, sleep, and progress trends from the API.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Card>
        {loading ? <Text>Loading analytics…</Text> : null}
        {summary ? (
          <>
            <Text style={styles.metric}>Habit score: {summary.habitScore}%</Text>
            <Text style={styles.metric}>Sleep adherence: {summary.sleepGoal}</Text>
            <Text style={styles.metric}>Wake target: {summary.wakeGoal}</Text>
          </>
        ) : null}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginBottom: 8 },
  metric: { marginBottom: 8, color: theme.colors.text },
  error: { color: '#dc2626' },
});
