import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import {
  getAlarms,
  saveAlarm,
  deleteAlarm as deleteAlarmStorage,
} from '../utils/storage';
import { scheduleAlarm, cancelAlarm, ensurePermissions } from '../utils/alarms';

function nextTimestampFor(hours, minutes) {
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

export default function AlarmScreen() {
  const [alarms, setAlarms] = useState([]);
  const [pickerTime, setPickerTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const load = useCallback(async () => {
    const stored = await getAlarms();
    setAlarms(stored.sort((a, b) => a.timestamp - b.timestamp));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    ensurePermissions();
  }, []);

  async function addAlarm() {
    const timestamp = nextTimestampFor(
      pickerTime.getHours(),
      pickerTime.getMinutes()
    );
    const alarm = {
      id: `alarm_${Date.now()}`,
      timestamp,
      level: 2,
      enabled: true,
    };
    await saveAlarm(alarm);
    await scheduleAlarm(alarm);
    load();
  }

  async function toggleAlarm(alarm) {
    const updated = { ...alarm, enabled: !alarm.enabled };
    await saveAlarm(updated);
    if (updated.enabled) {
      await scheduleAlarm(updated);
    } else {
      await cancelAlarm(updated.id);
    }
    load();
  }

  async function removeAlarm(alarm) {
    await cancelAlarm(alarm.id);
    const remaining = await deleteAlarmStorage(alarm.id);
    setAlarms(remaining);
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Alarms</Text>

      <View style={styles.addRow}>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.timeButtonText}>
            {pickerTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={addAlarm}>
          <Text style={styles.addButtonText}>Add Alarm</Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={pickerTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (selected) setPickerTime(selected);
          }}
        />
      )}

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No alarms set yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.alarmRow}>
            <View>
              <Text style={styles.alarmTime}>{formatTime(item.timestamp)}</Text>
              <Text style={styles.alarmSub}>
                {item.enabled ? 'On' : 'Off'}
              </Text>
            </View>
            <View style={styles.alarmActions}>
              <Switch
                value={item.enabled}
                onValueChange={() => toggleAlarm(item)}
              />
              <TouchableOpacity onPress={() => removeAlarm(item)}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f1115' },
  header: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 16 },
  addRow: { flexDirection: 'row', gap: 12 },
  timeButton: {
    flex: 1,
    backgroundColor: '#1c1f26',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  timeButtonText: { color: '#fff', fontSize: 18 },
  addButton: {
    backgroundColor: '#4f7cff',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  empty: { color: '#8a8f98', textAlign: 'center', marginTop: 40 },
  alarmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1f26',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  alarmTime: { color: '#fff', fontSize: 22, fontWeight: '600' },
  alarmSub: { color: '#8a8f98', marginTop: 2 },
  alarmActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  delete: { color: '#ff5c5c', fontWeight: '600' },
});
