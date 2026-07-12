import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchNotifications } from '../../redux/slices/notificationsSlice';
import { theme } from '../../theme';

export function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Notifications</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text>Loading notifications…</Text> : null}
      {items.map((item) => (
        <Card key={item.id} style={styles.card}>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.body}>{item.message}</Text>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  titleText: { fontWeight: '700', color: theme.colors.text },
  body: { color: theme.colors.muted, marginTop: 4 },
  card: { marginBottom: 10 },
  error: { color: '#dc2626' },
});
