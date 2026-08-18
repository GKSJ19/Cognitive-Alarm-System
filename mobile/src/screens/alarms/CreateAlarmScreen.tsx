import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Text, useTheme, Switch, Snackbar, Button, IconButton } from 'react-native-paper';
import { useAlarms } from '../../hooks/useAlarms';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import ThemeBackground from '../../components/common/ThemeBackground';
import TimeWheelPicker from '../../components/common/TimeWheelPicker';
import AlarmVolumeSlider from '../../components/common/AlarmVolumeSlider';

interface CreateAlarmScreenProps {
  navigation: any;
}

export const CreateAlarmScreen: React.FC<CreateAlarmScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { createAlarm, isLoading, error, clearError } = useAlarms();

  const [title, setTitle] = useState('Wake up');
  const [alarmTime, setAlarmTime] = useState('05:06');
  const [vibration, setVibration] = useState(true);
  const [ringtone, setRingtone] = useState('Default');
  const [volume, setVolume] = useState(80);
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [snoozeDuration, setSnoozeDuration] = useState('5');
  const [challengeRequired, setChallengeRequired] = useState(true);
  const [challengeType, setChallengeType] = useState('math');
  const [difficulty, setDifficulty] = useState('medium');
  
  // Default: Everyday (0..6 selected)
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const [timeError, setTimeError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isTitleModalVisible, setIsTitleModalVisible] = useState(false);
  const [isRingtoneModalVisible, setIsRingtoneModalVisible] = useState(false);

  // Day buttons Monday to Sunday
  const daysList = [
    { label: 'M', index: 1 },
    { label: 'T', index: 2 },
    { label: 'W', index: 3 },
    { label: 'T', index: 4 },
    { label: 'F', index: 5 },
    { label: 'S', index: 6 },
    { label: 'S', index: 0 },
  ];

  const ringtoneOptions = ['Default', 'Cyber Alarm', 'Gentle Chimes', 'Digital Pulse', 'Morning Breeze'];

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const getRepeatLabel = () => {
    if (selectedDays.length === 7) return 'Everyday';
    if (selectedDays.length === 5 && [1, 2, 3, 4, 5].every(d => selectedDays.includes(d))) return 'Weekdays';
    if (selectedDays.length === 2 && [0, 6].every(d => selectedDays.includes(d))) return 'Weekends';
    if (selectedDays.length === 0) return 'Never';
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return selectedDays.map(d => dayNames[d]).join(', ');
  };

  const handleSave = async () => {
    setTimeError(null);
    if (!alarmTime.trim() || !/^\d{2}:\d{2}$/.test(alarmTime.trim())) {
      setTimeError("Please specify valid alarm time");
      return;
    }

    try {
      const duration = parseInt(snoozeDuration, 10);
      await createAlarm({
        title: title.trim() || "Wake up",
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
    <ThemeBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LoadingOverlay visible={isLoading} />
        
        {/* Custom Header Bar (matching screenshot) */}
        <View style={styles.topHeaderBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <IconButton icon="chevron-left" size={28} iconColor="#FFFFFF" style={{ margin: 0 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {/* Time Drum Wheel Picker */}
          <TimeWheelPicker value={alarmTime} onChange={setAlarmTime} />

          {/* Repeat Schedule Section */}
          <View style={styles.repeatSection}>
            <Text style={styles.repeatHeaderTitle}>{getRepeatLabel()}</Text>
            <View style={styles.dayPillsRow}>
              {daysList.map((dayItem) => {
                const selected = selectedDays.includes(dayItem.index);
                return (
                  <TouchableOpacity
                    key={dayItem.index}
                    style={[
                      styles.dayPill,
                      selected ? styles.dayPillActive : styles.dayPillInactive
                    ]}
                    onPress={() => toggleDay(dayItem.index)}
                  >
                    <Text style={[
                      styles.dayPillText,
                      selected ? styles.dayPillTextActive : styles.dayPillTextInactive
                    ]}>
                      {dayItem.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Settings List Card */}
          <View style={styles.settingsCard}>
            
            {/* Alarm Name */}
            <TouchableOpacity style={styles.settingRow} onPress={() => setIsTitleModalVisible(true)}>
              <Text style={styles.settingLabel}>Alarm Name</Text>
              <Text style={styles.settingValue}>{title || 'Wake up'}</Text>
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Alarm Sound */}
            <TouchableOpacity style={styles.settingRow} onPress={() => setIsRingtoneModalVisible(true)}>
              <Text style={styles.settingLabel}>Alarm Sound</Text>
              <Text style={styles.settingValue}>{ringtone}</Text>
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Alarm Volume */}
            <View style={styles.sliderRowContainer}>
              <AlarmVolumeSlider value={volume} onChange={setVolume} />
            </View>

            <View style={styles.rowDivider} />

            {/* Vibration */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Switch
                value={vibration}
                onValueChange={setVibration}
                thumbColor="#FFFFFF"
                trackColor={{ false: '#352D4A', true: '#A58BFF' }}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* Snooze */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Snooze</Text>
                <Text style={styles.settingSub}>{snoozeDuration} minutes, 3 times</Text>
              </View>
              <Switch
                value={snoozeEnabled}
                onValueChange={setSnoozeEnabled}
                thumbColor="#FFFFFF"
                trackColor={{ false: '#352D4A', true: '#A58BFF' }}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* Cognitive Challenge */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Cognitive Challenge</Text>
                <Text style={styles.settingSub}>AI optimized wake-up puzzle</Text>
              </View>
              <Switch
                value={challengeRequired}
                onValueChange={setChallengeRequired}
                thumbColor="#FFFFFF"
                trackColor={{ false: '#352D4A', true: '#A58BFF' }}
              />
            </View>

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
            {error || 'Failed to save alarm.'}
          </Snackbar>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Title Modal */}
      <Modal visible={isTitleModalVisible} transparent animationType="fade" onRequestClose={() => setIsTitleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Alarm Name</Text>
            <TextInput
              style={styles.modalInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Wake up"
              placeholderTextColor="#A098BA"
              autoFocus
            />
            <Button mode="contained" onPress={() => setIsTitleModalVisible(false)} buttonColor="#A58BFF" textColor="#0D0B14">
              Done
            </Button>
          </View>
        </View>
      </Modal>

      {/* Ringtone Selector Modal */}
      <Modal visible={isRingtoneModalVisible} transparent animationType="fade" onRequestClose={() => setIsRingtoneModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Alarm Sound</Text>
            {ringtoneOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionRow}
                onPress={() => { setRingtone(option); setIsRingtoneModalVisible(false); }}
              >
                <Text style={[styles.optionText, ringtone === option && { color: '#A58BFF', fontWeight: 'bold' }]}>
                  {option}
                </Text>
                {ringtone === option ? <IconButton icon="check" size={20} iconColor="#A58BFF" /> : null}
              </TouchableOpacity>
            ))}
            <Button mode="outlined" onPress={() => setIsRingtoneModalVisible(false)} textColor="#A58BFF" style={{ marginTop: 12 }}>
              Close
            </Button>
          </View>
        </View>
      </Modal>

    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 4,
  },
  doneBtn: {
    backgroundColor: '#A58BFF',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
  },
  doneBtnText: {
    color: '#0D0B14',
    fontWeight: 'bold',
    fontSize: 15,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  repeatSection: {
    marginVertical: 16,
  },
  repeatHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    marginLeft: 4,
  },
  dayPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPillActive: {
    backgroundColor: '#A58BFF',
  },
  dayPillInactive: {
    backgroundColor: '#262036',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
  },
  dayPillText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  dayPillTextActive: {
    color: '#0D0B14',
  },
  dayPillTextInactive: {
    color: '#A098BA',
  },
  settingsCard: {
    backgroundColor: 'rgba(26, 22, 38, 0.85)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    elevation: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingValue: {
    fontSize: 14,
    color: '#A098BA',
    fontWeight: '500',
  },
  settingSub: {
    fontSize: 12,
    color: '#A098BA',
    marginTop: 2,
  },
  sliderRowContainer: {
    paddingVertical: 6,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 11, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '90%',
    backgroundColor: '#1A1626',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#262036',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A58BFF',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
});

export default CreateAlarmScreen;
