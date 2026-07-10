import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Card, SegmentedButtons, Snackbar } from 'react-native-paper';
import { useHabits } from '../../hooks/useHabits';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface CreateHabitScreenProps {
  navigation: any;
}

export const CreateHabitScreen: React.FC<CreateHabitScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { createHabit, isLoading, error, clearError } = useHabits();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [reminderTime, setReminderTime] = useState('');
  const [targetDays, setTargetDays] = useState('7');
  
  const [titleError, setTitleError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleSave = async () => {
    setTitleError(null);
    if (!title.trim()) {
      setTitleError("Habit title is required");
      return;
    }

    try {
      const parsedDays = parseInt(targetDays, 10);
      await createHabit({
        title: title.trim(),
        description: description.trim(),
        frequency,
        reminder_time: reminderTime.trim() || null,
        target_days: isNaN(parsedDays) ? 7 : parsedDays,
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
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>New Habit</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Set goals to build consistent routines
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <AppInput
              label="Habit Title"
              value={title}
              onChangeText={setTitle}
              error={titleError}
              placeholder="e.g. Morning Meditations"
              leftIcon="check-bold"
            />

            <AppInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Meditate for 10 minutes using the Headspace app"
              multiline
              numberOfLines={3}
              leftIcon="text"
            />

            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Frequency</Text>
            <SegmentedButtons
              value={frequency}
              onValueChange={setFrequency}
              buttons={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
              ]}
              style={styles.segmentedBtn}
            />

            <AppInput
              label="Reminder Time (HH:MM)"
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="e.g. 08:00"
              leftIcon="bell"
            />

            <AppInput
              label="Target Days per Period"
              value={targetDays}
              onChangeText={setTargetDays}
              keyboardType="numeric"
              placeholder="7"
              leftIcon="target"
            />
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
            Create
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
          {error || 'Failed to create habit.'}
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

export default CreateHabitScreen;
