import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme, Snackbar, Button, Divider } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { validateEmail, validatePassword } from '../../utils/validators';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { login, socialLogin, isLoading, error, clearAuthError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleLogin = async () => {
    // Reset errors
    setEmailError(null);
    setPasswordError(null);

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (emailValidation || passwordValidation) {
      setEmailError(emailValidation);
      setPasswordError(passwordValidation);
      return;
    }

    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setSnackbarVisible(true);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      // Mocking identity token logic for local development
      const identityToken = `mock-${provider}-identity-token-${Date.now()}`;
      const mockEmail = `${provider}_user_${Math.floor(Math.random() * 1000)}@example.com`;
      const mockFullName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} Test User`;
      
      await socialLogin({
        provider,
        identity_token: identityToken,
        email: mockEmail,
        full_name: mockFullName,
      });
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
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Sign in to set your cognitive alarm
          </Text>
        </View>

        <View style={styles.form}>
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

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <AppButton onPress={handleLogin} style={styles.submitButton}>
            Log In
          </AppButton>
        </View>

        <View style={styles.dividerContainer}>
          <Divider style={styles.divider} />
          <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant, backgroundColor: theme.colors.background }]}>
            OR CONTINUE WITH
          </Text>
        </View>

        <View style={styles.socialContainer}>
          <Button
            mode="outlined"
            icon="google"
            onPress={() => handleSocialLogin('google')}
            style={styles.socialButton}
            textColor={theme.colors.onBackground}
          >
            Google
          </Button>

          <Button
            mode="outlined"
            icon="apple"
            onPress={() => handleSocialLogin('apple')}
            style={styles.socialButton}
            textColor={theme.colors.onBackground}
          >
            Apple
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={{ color: theme.colors.onBackground }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Sign Up</Text>
          </TouchableOpacity>
        </View>

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
          {error || 'Authentication failed. Please verify credentials.'}
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
    marginBottom: 36,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginVertical: 8,
  },
  submitButton: {
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    position: 'absolute',
    alignSelf: 'center',
    left: '35%',
    right: '35%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 0.48,
    borderRadius: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});

export default LoginScreen;
