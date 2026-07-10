import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme, Snackbar } from 'react-native-paper';
import authService from '../../services/authService';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { validateEmail } from '../../utils/validators';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <LoadingOverlay visible={isLoading} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>Reset Password</Text>
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

          <AppButton onPress={handleResetPassword} style={styles.submitButton}>
            Send Reset Link
          </AppButton>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Back to Log In</Text>
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
          style={{ backgroundColor: '#10B981' }} // Emerald Green
          duration={5000}
        >
          {successMsg}
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
