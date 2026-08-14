import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme, Snackbar } from 'react-native-paper';
import authService from '../../services/authService';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { validateEmail } from '../../utils/validators';

import ThemeBackground from '../../components/common/ThemeBackground';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleResetPassword = async () => {
    setEmailError(null);
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ email: email.trim() });
      setSuccessMsg(response.message || 'Reset link sent. Please check your email.');
      setEmail('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to initiate reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <LoadingOverlay visible={isLoading} />

          <View style={styles.header}>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
              leftIcon="email"
            />

            <AppButton onPress={handleResetPassword} style={styles.submitButton} buttonColor="#A58BFF" textColor="#0D0B14">
              Send Reset Link
            </AppButton>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: '#A58BFF', fontWeight: 'bold' }}>Back to Log In</Text>
            </TouchableOpacity>
          </View>

          {/* Error Snackbar */}
          <Snackbar
            visible={!!errorMsg}
            onDismiss={() => setErrorMsg(null)}
            action={{
              label: 'Close',
              onPress: () => setErrorMsg(null),
            }}
            style={{ backgroundColor: theme.colors.error }}
          >
            {errorMsg}
          </Snackbar>

          {/* Success Snackbar */}
          <Snackbar
            visible={!!successMsg}
            onDismiss={() => setSuccessMsg(null)}
            style={{ backgroundColor: '#34D399' }}
            duration={5000}
          >
            {successMsg}
          </Snackbar>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemeBackground>
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
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
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

export default ForgotPasswordScreen;
