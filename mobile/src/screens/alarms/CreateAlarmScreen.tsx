import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, SegmentedButtons, Switch, Snackbar, Button } from 'react-native-paper';
import { useAlarms } from '../../hooks/useAlarms';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface CreateAlarmScreenProps {
  navigation: any;
}

export const CreateAlarmScreen: React.FC<CreateAlarmScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { createAlarm, isLoading, error, clearError } = useAlarms();

  const [title, setTitle] = useState('');
  const [alarmTime, setAlarmTime] = useState('');
  const [vibration, setVibration] = useState(true);
  const [ringtone, setRingtone] = useState('cyber_alarm.mp3');
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [snoozeDuration, setSnoozeDuration] = useState('5');
  const [challengeRequired, setChallengeRequired] = useState(true);
  const [challengeType, setChallengeType] = useState('math');
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const [timeError, setTimeError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const handleSelectPreset = (preset: 'weekdays' | 'weekends' | 'everyday') => {
    if (preset === 'weekdays') {
      setSelectedDays([1, 2, 3, 4, 5]);
    } else if (preset === 'weekends') {
      setSelectedDays([0, 6]);
    } else {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  const handleSave = async () => {
    setTimeError(null);
    if (!alarmTime.trim() || !/^\d{2}:\d{2}$/.test(alarmTime.trim())) {
      setTimeError("Please specify time in HH:MM format");
      return;
    }

    try {
      const duration = parseInt(snoozeDuration, 10);
      await createAlarm({
        title: title.trim() || "Alarm",
        alarm_time: alarmTime.trim(),
        repeat_days: selectedDays.length > 0 ? selectedDays.join(',') : null,
        vibration,
        ringtone,
        snooze_enabled: snoozeEnabled,
        snooze_duration: isNaN(duration) ? 5 : duration,
        challenge_required: challengeRequired,
        challenge_type: challengeType,
        difficulty: difficulty,
        is_active: true
      }).unwrap();

      navigation.goBack();
    } catch (err) {
      setSnackbarVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <LoadingOverlay visible={isLoading} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>New Alarm</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Choose alarm configurations and puzzles
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <AppInput
              label="Alarm Time (HH:MM)"
              value={alarmTime}
              onChangeText={setAlarmTime}
              error={timeError}
              placeholder="e.g. 07:15"
              leftIcon="clock-outline"
            />

            <AppInput
              label="Alarm Label"
              value={title}
              onChangeText={setTitle}
              placeholder="Wake up!"
              leftIcon="label"
            />
          </Card.Content>
        </Card>

        {/* Repeat Configuration */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Repeat Days</Text>
            
            <View style={styles.daySelectorRow}>
              {daysOfWeek.map((day, idx) => {
                const selected = selectedDays.includes(idx);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton, 
                      { 
                        backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceVariant,
                        borderColor: theme.colors.outline 
                      }
                    ]}
                    onPress={() => toggleDay(idx)}
                  >
                    <Text style={[styles.dayText, { color: selected ? '#FFFFFF' : theme.colors.onSurfaceVariant }]}>
                      {day[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.presetRow}>
              <Button mode="outlined" compact onPress={() => handleSelectPreset('weekdays')} style={styles.presetBtn}>
                Weekdays
              </Button>
              <Button mode="outlined" compact onPress={() => handleSelectPreset('weekends')} style={styles.presetBtn}>
                Weekends
              </Button>
              <Button mode="outlined" compact onPress={() => handleSelectPreset('everyday')} style={styles.presetBtn}>
                Every day
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Alarm Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Alarm Ringtone & Vibration</Text>
            
            <View style={styles.switchRow}>
              <Text style={{ color: theme.colors.onSurface }}>Enable Vibration</Text>
              <Switch value={vibration} onValueChange={setVibration} />
            </View>

            <AppInput
              label="Ringtone"
              value={ringtone}
              onChangeText={setRingtone}
              placeholder="default"
              leftIcon="music"
            />

            <View style={styles.switchRow}>
              <Text style={{ color: theme.colors.onSurface }}>Enable Snooze</Text>
              <Switch value={snoozeEnabled} onValueChange={setSnoozeEnabled} />
            </View>

            {snoozeEnabled ? (
              <AppInput
                label="Snooze Duration (minutes)"
                value={snoozeDuration}
                onChangeText={setSnoozeDuration}
                keyboardType="numeric"
                placeholder="5"
                leftIcon="snooze"
              />
            ) : null}
          </Card.Content>
        </Card>

        {/* Cognitive Task Toggle */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.switchRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary, marginBottom: 0 }]}>
                Cognitive Challenge Required
              </Text>
              <Switch value={challengeRequired} onValueChange={setChallengeRequired} />
            </View>

            {challengeRequired ? (
              <View style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: theme.colors.surfaceVariant }}>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, lineHeight: 18 }}>
                  ✨ **AI Cognitive Model:** The challenge type and difficulty level will be automatically optimized and suggested by the AI engine based on your historical sleep latency and solve logs.
                </Text>
              </View>
            ) : null}

          </Card.Content>
        </Card>

        <View style={styles.btnRow}>
          <AppButton 
            mode="outlined" 
            onPress={() => navigation.goBack()} 
            style={[styles.btn, { marginRight: 8 }]}
          >
            Cancel
          </AppButton>
          <AppButton 
            mode="contained" 
            onPress={handleSave} 
            style={[styles.btn, { marginLeft: 8 }]}
          >
            Save
          </AppButton>
        </View>

        <Snackbar
          visible={snackbarVisible || !!error}
          onDismiss={() => {
            setSnackbarVisible(false);
            clearError();
          }}
          action={{
            label: 'Close',
            onPress: () => {
              setSnackbarVisible(false);
              clearError();
            },
          }}
          style={{ backgroundColor: theme.colors.error }}
        >
          {error || 'Failed to schedule alarm.'}
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  daySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  dayButton: {
    width: '12%',
    aspectRatio: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  presetBtn: {
    flex: 0.31,
    borderRadius: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  segmentedBtn: {
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  btn: {
    flex: 1,
  },
});

export default CreateAlarmScreen;
