import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, FAB, Surface, Switch, IconButton, Chip, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setAlarms, removeAlarm, updateAlarm } from '../store/alarmSlice';
import { Alarm } from '../store/alarmSlice';
import api from '../services/api';
import { alarmAudio } from '../services/audioService';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function AlarmCard({ alarm, onToggle, onEdit, onDelete }: {
  alarm: Alarm;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const activeDays = alarm.days_active.map(d => DAY_NAMES[d]).join(', ');

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={[styles.timeText, { color: alarm.is_active ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
            {alarm.time}
          </Text>
          <Text variant="bodyMedium" style={styles.labelText}>{alarm.label}</Text>
          <View style={styles.chipsRow}>
            <Chip compact icon="repeat" style={styles.chip}>{alarm.alarm_type}</Chip>
            <Chip compact icon="volume-high" style={styles.chip}>{alarm.sound_name}</Chip>
          </View>
          {alarm.days_active.length > 0 && (
            <Text variant="bodySmall" style={{ opacity: 0.5, marginTop: 4 }}>{activeDays}</Text>
          )}
        </View>
        <View style={styles.cardRight}>
          <Switch
            value={alarm.is_active}
            onValueChange={onToggle}
            color={theme.colors.primary}
          />
        </View>
      </View>
      <Divider style={{ marginVertical: 8 }} />
      <View style={styles.cardActions}>
        <View style={styles.metaRow}>
          {alarm.snooze_enabled && (
            <Text variant="bodySmall" style={{ opacity: 0.5 }}>⏰ Snooze {alarm.snooze_duration}min</Text>
          )}
          {alarm.vibration && (
            <Text variant="bodySmall" style={{ opacity: 0.5, marginLeft: 12 }}>📳 Vibrate</Text>
          )}
        </View>
        <View style={styles.actionBtns}>
          <IconButton icon="pencil" size={18} onPress={onEdit} />
          <IconButton icon="delete" size={18} onPress={onDelete} iconColor={theme.colors.error} />
        </View>
      </View>
    </Surface>
  );
}

export default function AlarmsScreen({ navigation }: any) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const alarms = useSelector((state: RootState) => state.alarms.alarms);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlarms();
    const unsubscribe = navigation.addListener('focus', fetchAlarms);
    return unsubscribe;
  }, [navigation]);

  const fetchAlarms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/alarms/');
      dispatch(setAlarms(res.data));
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (alarm: Alarm) => {
    // Force audio unlock on user tap to guarantee autoplay later
    alarmAudio.forceUnlock();

    try {
      const res = await api.patch(`/alarms/${alarm._id}/toggle`);
      dispatch(updateAlarm(res.data));
    } catch (e) {}
  };

  const handleDelete = (alarm: Alarm) => {
    Alert.alert(
      'Delete Alarm',
      `Delete "${alarm.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/alarms/${alarm._id}`);
              dispatch(removeAlarm(alarm._id!));
            } catch (e) {}
          },
        },
      ]
    );
  };

  if (loading && alarms.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>My Alarms</Text>
        <Text variant="bodyMedium" style={{ opacity: 0.5 }}>{alarms.length} alarm{alarms.length !== 1 ? 's' : ''}</Text>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⏰</Text>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>No alarms yet</Text>
          <Text variant="bodyMedium" style={{ opacity: 0.5, textAlign: 'center' }}>
            Tap the + button to create your first alarm
          </Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={item => item._id || Math.random().toString()}
          renderItem={({ item }) => (
            <AlarmCard
              alarm={item}
              onToggle={() => handleToggle(item)}
              onEdit={() => navigation.navigate('EditAlarm', { alarm: item })}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddAlarm')}
        color="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 20, paddingBottom: 8 },
  headerTitle: { fontWeight: 'bold' },
  list: { padding: 16, paddingBottom: 100 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1 },
  cardRight: { marginLeft: 12 },
  timeText: { fontSize: 38, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  labelText: { marginTop: 2, marginBottom: 8, opacity: 0.7 },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { height: 26 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  actionBtns: { flexDirection: 'row' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 72, marginBottom: 16 },
  fab: { position: 'absolute', bottom: 24, right: 24 },
});
