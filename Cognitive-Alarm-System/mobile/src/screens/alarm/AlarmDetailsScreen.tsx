import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { alarmsApi } from '../../services/api';
import { useAppDispatch } from '../../hooks/redux';
import { fetchAlarms } from '../../redux/slices/alarmsSlice';
import { theme } from '../../theme';

export function AlarmDetailsScreen({ navigation, route }: any) {
  const dispatch = useAppDispatch();
  const alarm = route?.params?.alarm;

  const handleDelete = async () => {
    Alert.alert('Delete alarm', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await alarmsApi.remove(alarm.id);
            await dispatch(fetchAlarms());
            navigation.goBack();
          } catch (err) {
            console.warn('Delete failed', err);
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Alarm Details</Text>
      <Card>
        <Text style={styles.label}>{alarm.label}</Text>
        <Text style={styles.time}>{alarm.time}</Text>
        <Text style={styles.meta}>Repeat: {alarm.days_of_week?.join(', ') || 'Daily'}</Text>
        <Text style={styles.meta}>Active: {alarm.is_active ? 'Yes' : 'No'}</Text>
      </Card>

      <AppButton title="Edit" onPress={() => navigation.navigate('CreateAlarm', { alarm })} />
      <AppButton title="Delete" variant="secondary" onPress={handleDelete} style={{ marginTop: 12 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  label: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  time: { fontSize: 20, color: theme.colors.primary, marginTop: 8 },
  meta: { color: theme.colors.muted, marginTop: 6 },
});
