import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme, Snackbar, SegmentedButtons } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { validateEmail, validatePassword, validateName } from '../../utils/validators';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { register, isLoading, error, clearAuthError } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'coach' | 'admin'>('user');

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [successSnackbarVisible, setSuccessSnackbarVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    // Reset errors
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    const nameValidation = validateName(fullName);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    let confirmValidation = null;

    if (password !== confirmPassword) {
      confirmValidation = 'Passwords do not match';
    }

    if (nameValidation || emailValidation || passwordValidation || confirmValidation) {
      setNameError(nameValidation);
      setEmailError(emailValidation);
      setPasswordError(passwordValidation);
      setConfirmPasswordError(confirmValidation);
      return;
    }

    try {
      const response = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        role,
      });

      // Show success message and navigate to login screen
      setSuccessMessage('Registration successful! Redirecting to login...');
      setSuccessSnackbarVisible(true);
      
      // Navigate to Login screen
      setTimeout(() => {
        setSuccessSnackbarVisible(false);
        navigation.navigate('Login');
      }, 2000);
    } catch (err) {
      setSnackbarVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <LoadingOverlay visible={isLoading} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Join ICAP to start optimizing your mornings
          </Text>
        </View>

        <View style={styles.form}>
          <AppInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            error={nameError}
            autoCapitalize="words"
            leftIcon="account"
          />

          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            keyboardType="email-address"
            leftIcon="email"
          />

          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            secureTextEntry
            leftIcon="lock"
          />

          <AppInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmPasswordError}
            secureTextEntry
            leftIcon="lock-check"
          />

          <Text style={[styles.roleLabel, { color: theme.colors.onBackground }]}>Register as:</Text>
          <SegmentedButtons
            value={role}
            onValueChange={(val) => setRole(val as any)}
            buttons={[
              { value: 'user', label: 'User' },
              { value: 'coach', label: 'Coach' },
              { value: 'admin', label: 'Admin' },
            ]}
            style={styles.segmentedButtons}
          />

          <AppButton onPress={handleRegister} style={styles.submitButton}>
            Sign Up
          </AppButton>
        </View>

        <View style={styles.footer}>
          <Text style={{ color: theme.colors.onBackground }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Error Snackbar */}
        <Snackbar
          visible={snackbarVisible || !!error}
          onDismiss={() => {
            setSnackbarVisible(false);
            clearAuthError();
          }}
          action={{
            label: 'Close',
            onPress: () => {
              setSnackbarVisible(false);
              clearAuthError();
            },
          }}
          style={{ backgroundColor: theme.colors.error }}
        >
          {error || 'Registration failed. Please check inputs.'}
        </Snackbar>

        {/* Success Snackbar */}
        <Snackbar
          visible={successSnackbarVisible}
          onDismiss={() => setSuccessSnackbarVisible(false)}
          style={{ backgroundColor: '#10B981' }} // Emerald Green
        >
          {successMessage}
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});

export default RegisterScreen;
