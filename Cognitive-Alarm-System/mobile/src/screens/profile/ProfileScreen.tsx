import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { fetchNotifications } from '../../redux/slices/notificationsSlice';
import { theme } from '../../theme';

export function ProfileScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>
      <Card>
        <Text style={styles.label}>{user?.name || 'User name'}</Text>
        <Text style={styles.meta}>{user?.email || 'No email'}</Text>
        <Text style={styles.meta}>Role: {user?.role || 'user'}</Text>
      </Card>
      <AppButton title="Notifications" onPress={() => navigation.navigate('Notifications')} />
      <AppButton title="Coach dashboard" variant="secondary" onPress={() => navigation.navigate('CoachDashboard')} style={styles.button} />
      <AppButton title="Admin dashboard" variant="secondary" onPress={() => navigation.navigate('AdminDashboard')} style={styles.button} />
      <AppButton title="Sign out" variant="secondary" onPress={() => dispatch(logoutUser())} style={styles.button} />
      {items.map((item) => (
        <Card key={item.id} style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody}>{item.message}</Text>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  label: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  meta: { color: theme.colors.muted, marginTop: 4 },
  button: { marginTop: 10 },
  notificationCard: { marginTop: 10 },
  notificationTitle: { fontWeight: '700', color: theme.colors.text },
  notificationBody: { color: theme.colors.muted, marginTop: 4 },
});
