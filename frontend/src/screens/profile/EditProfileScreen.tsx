import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Card, Snackbar } from 'react-native-paper';
import { useProfile } from '../../hooks/useProfile';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface EditProfileScreenProps {
  navigation: any;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { profile, isLoading, error, updateProfile, clearError } = useProfile();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [occupation, setOccupation] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [wakeupTime, setWakeupTime] = useState('');
  const [sleepTime, setSleepTime] = useState('');
  const [bio, setBio] = useState('');
  
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      setPhoneNumber(profile.phone_number || '');
      setGender(profile.gender || '');
      setDateOfBirth(profile.date_of_birth || '');
      setOccupation(profile.occupation || '');
      setTimezone(profile.timezone || 'UTC');
      setWakeupTime(profile.preferred_wakeup_time || '');
      setSleepTime(profile.preferred_sleep_time || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({
        phone_number: phoneNumber.trim(),
        gender: gender.trim(),
        date_of_birth: dateOfBirth.trim(),
        occupation: occupation.trim(),
        timezone: timezone.trim(),
        preferred_wakeup_time: wakeupTime.trim(),
        preferred_sleep_time: sleepTime.trim(),
        bio: bio.trim(),
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
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>Edit Profile</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Keep your schedule and contact details up-to-date
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Sleep Schedule</Text>
            
            <AppInput
              label="Preferred Wake-up Time (HH:MM)"
              value={wakeupTime}
              onChangeText={setWakeupTime}
              placeholder="e.g. 06:30"
              leftIcon="alarm"
            />

            <AppInput
              label="Preferred Sleep Time (HH:MM)"
              value={sleepTime}
              onChangeText={setSleepTime}
              placeholder="e.g. 22:30"
              leftIcon="sleep"
            />

            <AppInput
              label="Timezone"
              value={timezone}
              onChangeText={setTimezone}
              placeholder="UTC"
              leftIcon="earth"
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Personal Information</Text>

            <AppInput
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={3}
              leftIcon="book-open-outline"
            />

            <AppInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="+1234567890"
              leftIcon="phone"
            />

            <AppInput
              label="Gender"
              value={gender}
              onChangeText={setGender}
              placeholder="Male, Female, Non-binary..."
              leftIcon="gender-male-female"
            />

            <AppInput
              label="Date of Birth"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              leftIcon="calendar"
            />

            <AppInput
              label="Occupation"
              value={occupation}
              onChangeText={setOccupation}
              placeholder="Software Engineer, Student..."
              leftIcon="briefcase"
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
          {error || 'Failed to update profile details.'}
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

export default EditProfileScreen;
