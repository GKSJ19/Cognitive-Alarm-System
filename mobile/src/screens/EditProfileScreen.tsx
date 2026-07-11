import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, SegmentedButtons } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setProfile } from '../store/profileSlice';
import api from '../services/api';

const DIFFICULTIES = [
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' },
];

export default function EditProfileScreen({ navigation }: any) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile.profile);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [timeZone, setTimeZone] = useState(profile?.time_zone || 'UTC');
  const [wakeupTime, setWakeupTime] = useState(profile?.preferred_wakeup_time || '07:00');
  const [sleepGoal, setSleepGoal] = useState(profile?.sleep_duration_goal ? String(profile.sleep_duration_goal) : '8');
  const [difficulty, setDifficulty] = useState(profile?.difficulty_preference || 'Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      const payload = {
        full_name: fullName,
        phone: phone || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        time_zone: timeZone,
        preferred_wakeup_time: wakeupTime,
        sleep_duration_goal: sleepGoal ? parseFloat(sleepGoal) : 8,
        difficulty_preference: difficulty,
      };
      const res = await api.put('/users/profile', payload);
      dispatch(setProfile(res.data));
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.surface} elevation={2}>
        <Text variant="headlineSmall" style={styles.title}>Edit Profile</Text>

        {error ? <Text style={[styles.msg, { color: theme.colors.error }]}>{error}</Text> : null}
        {success ? <Text style={[styles.msg, { color: '#22c55e' }]}>✓ Profile updated!</Text> : null}

        <TextInput label="Full Name" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.input} />
        <TextInput label="Phone" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} keyboardType="phone-pad" />
        <TextInput label="Age" value={age} onChangeText={setAge} mode="outlined" style={styles.input} keyboardType="numeric" />
        <TextInput label="Gender (Male/Female/Other)" value={gender} onChangeText={setGender} mode="outlined" style={styles.input} />
        <TextInput label="Time Zone (e.g. Asia/Kolkata)" value={timeZone} onChangeText={setTimeZone} mode="outlined" style={styles.input} />
        <TextInput label="Wake-up Time (HH:MM)" value={wakeupTime} onChangeText={setWakeupTime} mode="outlined" style={styles.input} placeholder="07:00" />
        <TextInput label="Sleep Goal (hours)" value={sleepGoal} onChangeText={setSleepGoal} mode="outlined" style={styles.input} keyboardType="numeric" />

        <Text variant="bodyMedium" style={styles.label}>Challenge Difficulty</Text>
        <SegmentedButtons
          value={difficulty}
          onValueChange={setDifficulty}
          buttons={DIFFICULTIES}
          style={styles.segmented}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Save Changes
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
  msg: { marginBottom: 12, textAlign: 'center', fontWeight: '500' },
  input: { marginBottom: 14 },
  label: { marginBottom: 8, fontWeight: '500', opacity: 0.7 },
  segmented: { marginBottom: 20 },
  button: { marginTop: 8, borderRadius: 30 },
  buttonContent: { paddingVertical: 6 },
});
