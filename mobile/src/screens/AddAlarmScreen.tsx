import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, Switch, SegmentedButtons, Chip } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { addAlarm } from '../store/alarmSlice';
import api from '../services/api';
import { alarmAudio } from '../services/audioService';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SOUNDS = ['default', 'gentle', 'birds', 'chime', 'radar', 'beacon'];
const ALARM_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekday', label: 'Weekday' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'one-time', label: 'One-Time' },
];

export default function AddAlarmScreen({ navigation }: any) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [label, setLabel] = useState('Morning Alarm');
  const [time, setTime] = useState('07:00');
  const [alarmType, setAlarmType] = useState('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [sound, setSound] = useState('default');
  const [snoozeDuration, setSnoozeDuration] = useState('5');
  const [vibration, setVibration] = useState(true);
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (idx: number) => {
    setSelectedDays(prev =>
      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx].sort()
    );
  };

  const handleCreate = async () => {
    // Force audio unlock on user tap to guarantee autoplay later
    alarmAudio.forceUnlock();

    if (!time.match(/^\d{2}:\d{2}$/)) {
      setError('Please enter time in HH:MM format (e.g. 07:30)');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const payload = {
        label,
        time,
        alarm_type: alarmType,
        days_active: alarmType === 'daily' ? [0,1,2,3,4,5,6]
          : alarmType === 'weekday' ? [0,1,2,3,4]
          : alarmType === 'weekend' ? [5,6]
          : selectedDays,
        is_active: true,
        sound_name: sound,
        snooze_duration: parseInt(snoozeDuration) || 5,
        vibration,
        snooze_enabled: snoozeEnabled,
        difficulty: 'Medium',
      };
      const res = await api.post('/alarms/', payload);
      dispatch(addAlarm(res.data));
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create alarm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.surface} elevation={2}>
        <Text variant="headlineSmall" style={styles.title}>Add New Alarm</Text>

        {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

        <TextInput label="Alarm Label" value={label} onChangeText={setLabel} mode="outlined" style={styles.input} left={<TextInput.Icon icon="label" />} />
        <TextInput label="Time (HH:MM)" value={time} onChangeText={setTime} mode="outlined" style={styles.input} placeholder="07:00" keyboardType="numbers-and-punctuation" left={<TextInput.Icon icon="clock" />} />

        <Text variant="bodyMedium" style={styles.label}>Alarm Type</Text>
        <SegmentedButtons value={alarmType} onValueChange={setAlarmType} buttons={ALARM_TYPES} style={styles.segmented} />

        {alarmType === 'one-time' && (
          <>
            <Text variant="bodyMedium" style={styles.label}>Repeat Days</Text>
            <View style={styles.daysRow}>
              {DAYS.map((d, i) => (
                <Chip
                  key={d}
                  selected={selectedDays.includes(i)}
                  onPress={() => toggleDay(i)}
                  style={styles.dayChip}
                  compact
                >
                  {d}
                </Chip>
              ))}
            </View>
          </>
        )}

        <Text variant="bodyMedium" style={styles.label}>Alarm Sound</Text>
        <View style={styles.daysRow}>
          {SOUNDS.map(s => (
            <Chip key={s} selected={sound === s} onPress={() => setSound(s)} style={styles.dayChip} compact>
              {s}
            </Chip>
          ))}
        </View>
        <Button
          mode="outlined"
          compact
          icon="volume-high"
          onPress={() => alarmAudio.previewSound(sound)}
          style={{ marginBottom: 16, alignSelf: 'flex-start', borderRadius: 20 }}
        >
          Test Sound: {sound}
        </Button>

        <TextInput label="Snooze Duration (minutes)" value={snoozeDuration} onChangeText={setSnoozeDuration} mode="outlined" style={styles.input} keyboardType="numeric" left={<TextInput.Icon icon="alarm-snooze" />} />

        <View style={styles.switchRow}>
          <Text variant="bodyMedium">Vibration</Text>
          <Switch value={vibration} onValueChange={setVibration} color={theme.colors.primary} />
        </View>
        <View style={styles.switchRow}>
          <Text variant="bodyMedium">Snooze Enabled</Text>
          <Switch value={snoozeEnabled} onValueChange={setSnoozeEnabled} color={theme.colors.primary} />
        </View>

        <Button mode="contained" onPress={handleCreate} loading={loading} disabled={loading} style={styles.button} contentStyle={styles.buttonContent}>
          Create Alarm
        </Button>
        <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>
          Cancel
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  surface: { margin: 16, padding: 20, borderRadius: 20 },
  title: { fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  error: { marginBottom: 12, textAlign: 'center' },
  input: { marginBottom: 14 },
  label: { marginBottom: 8, fontWeight: '500', opacity: 0.7 },
  segmented: { marginBottom: 16 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  dayChip: { marginBottom: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  button: { marginTop: 8, borderRadius: 30 },
  buttonContent: { paddingVertical: 6 },
});
