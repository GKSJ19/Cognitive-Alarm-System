import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, useTheme, Avatar, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, store } from '../store/store';
import { setAlarms } from '../store/alarmSlice';
import { setProfile } from '../store/profileSlice';
import api from '../services/api';
import { alarmScheduler } from '../services/alarmScheduler';

export default function HomeScreen({ navigation }: any) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const alarms = useSelector((state: RootState) => state.alarms.alarms);
  const profile = useSelector((state: RootState) => state.profile.profile);

  useEffect(() => {
    fetchData();
    // Start background alarm scheduler
    alarmScheduler.setNavigate(navigation.navigate);
    alarmScheduler.start(() => store.getState().alarms.alarms);
    return () => alarmScheduler.stop();
  }, []);

  const fetchData = async () => {
    try {
      const [alarmsRes, profileRes] = await Promise.all([
        api.get('/alarms/'),
        api.get('/users/profile'),
      ]);
      dispatch(setAlarms(alarmsRes.data));
      dispatch(setProfile(profileRes.data));
    } catch (e) {}
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const activeAlarms = alarms.filter(a => a.is_active);
  const nextAlarm = activeAlarms.sort((a, b) => a.time.localeCompare(b.time))[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Greeting Header */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="bodyLarge" style={{ opacity: 0.7 }}>{greeting},</Text>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{displayName} 👋</Text>
          </View>
          <Avatar.Text
            size={48}
            label={displayName.slice(0, 2).toUpperCase()}
            style={{ backgroundColor: theme.colors.primary }}
            onTouchEnd={() => navigation.navigate('Profile')}
          />
        </View>
      </Surface>

      {/* Next Alarm Card */}
      <Surface style={styles.card} elevation={3}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>⏰ Next Alarm</Text>
        </View>
        {nextAlarm ? (
          <View>
            <Text style={[styles.bigTime, { color: theme.colors.primary }]}>{nextAlarm.time}</Text>
            <Text variant="bodyLarge" style={{ marginBottom: 8 }}>{nextAlarm.label}</Text>
            <Chip icon="repeat">{nextAlarm.alarm_type}</Chip>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>😴</Text>
            <Text variant="bodyMedium" style={{ opacity: 0.6 }}>No active alarms</Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.primary, marginTop: 8 }}
              onPress={() => navigation.navigate('Alarms')}
            >
              + Add Alarm
            </Text>
          </View>
        )}
      </Surface>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Surface style={[styles.statCard, { flex: 1 }]} elevation={2}>
          <Text style={styles.statIcon}>⏰</Text>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            {alarms.length}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>Total Alarms</Text>
        </Surface>
        <Surface style={[styles.statCard, { flex: 1 }]} elevation={2}>
          <Text style={styles.statIcon}>✅</Text>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#22c55e' }}>
            {activeAlarms.length}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>Active</Text>
        </Surface>
        <Surface style={[styles.statCard, { flex: 1 }]} elevation={2}>
          <Text style={styles.statIcon}>🌙</Text>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
            {profile?.sleep_duration_goal || 8}h
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>Sleep Goal</Text>
        </Surface>
      </View>

      {/* Alarm List Preview */}
      {alarms.length > 0 && (
        <Surface style={styles.card} elevation={2}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12 }}>Recent Alarms</Text>
          {alarms.slice(0, 3).map((alarm) => (
            <View key={alarm._id} style={styles.alarmRow}>
              <View>
                <Text variant="titleMedium" style={{ color: alarm.is_active ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                  {alarm.time}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.6 }}>{alarm.label}</Text>
              </View>
              <Chip compact style={{ height: 28 }}>
                {alarm.is_active ? '🟢 ON' : '⚫ OFF'}
              </Chip>
            </View>
          ))}
        </Surface>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 24,
    paddingTop: 52,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { margin: 16, marginTop: 0, borderRadius: 20, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bigTime: { fontSize: 52, fontWeight: 'bold', marginBottom: 4 },
  emptyCard: { alignItems: 'center', paddingVertical: 16 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: { borderRadius: 16, padding: 16, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 4 },
  alarmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
});
