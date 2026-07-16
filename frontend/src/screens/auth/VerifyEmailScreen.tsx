import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme, Snackbar } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';

interface VerifyEmailScreenProps {
  route: any;
  navigation: any;
}

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const { verifyEmail, isLoading, error, clearAuthError } = useAuth();
  const initialEmail = route?.params?.email || '';

  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [resendSnackbarVisible, setResendSnackbarVisible] = useState(false);

  const handleVerify = async () => {
    setTokenError(null);

    if (!token.trim()) {
      setTokenError('Verification token is required');
      return;
    }

    try {
      await verifyEmail(token.trim());
      // Successful verification automatically logs the user in via Redux state change (isAuthenticated = true)
    } catch (err) {
      setSnackbarVisible(true);
    }
  };

  const handleResend = () => {
    // Mock resending verification email
    setResendSnackbarVisible(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <LoadingOverlay visible={isLoading} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>Verify Email</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {initialEmail 
              ? `We've sent a verification link to ${initialEmail}. Please copy the token from the email (printed to FastAPI backend console) and paste it below.`
              : 'Please enter the verification token sent to your email to verify your account.'}
          </Text>
        </View>

        <View style={styles.form}>
          <AppInput
            label="Verification Token"
            value={token}
            onChangeText={setToken}
            error={tokenError}
            placeholder="Paste token here"
            leftIcon="shield-check"
          />

          <AppButton onPress={handleVerify} style={styles.submitButton}>
            Verify Account
          </AppButton>
          
          <AppButton mode="outlined" onPress={handleResend} style={styles.resendButton}>
            Resend Email
          </AppButton>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Back to Log In</Text>
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
          {error || 'Verification failed. Please check the token.'}
        </Snackbar>

        {/* Resend Success Snackbar */}
        <Snackbar
          visible={resendSnackbarVisible}
          onDismiss={() => setResendSnackbarVisible(false)}
          style={{ backgroundColor: '#10B981' }} // Emerald Green
          duration={3000}
        >
          Verification email resent successfully! (Check backend logs)
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
  resendButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});

export default VerifyEmailScreen;
