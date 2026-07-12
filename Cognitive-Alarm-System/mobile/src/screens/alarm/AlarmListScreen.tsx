import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAlarms } from '../../redux/slices/alarmsSlice';
import { theme } from '../../theme';

export function AlarmListScreen() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.alarms);

  useEffect(() => {
    dispatch(fetchAlarms());
  }, [dispatch]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Alarm Center</Text>
      <Text style={styles.subtitle}>Manage wake-up schedules and challenge settings.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text>Loading alarms…</Text> : null}
      {items.length === 0 && !loading ? <Text>No alarms yet. Create one from the API-backed flow.</Text> : null}
      {items.map((alarm) => (
        <Card key={alarm.id} style={styles.card}>
          <Text style={styles.alarmLabel}>{alarm.label || 'Alarm'}</Text>
          <Text style={styles.alarmTime}>{alarm.time}</Text>
          <Text style={styles.alarmMeta}>Repeat days: {alarm.days_of_week?.join(', ') || 'Daily'}</Text>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginBottom: 8 },
  error: { color: '#dc2626' },
  card: { marginBottom: 12 },
  alarmLabel: { fontWeight: '700', color: theme.colors.text },
  alarmTime: { fontSize: 20, color: theme.colors.primary, marginTop: 6 },
  alarmMeta: { color: theme.colors.muted, marginTop: 6 },
});
