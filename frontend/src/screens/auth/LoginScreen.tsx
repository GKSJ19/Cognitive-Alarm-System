import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, useTheme, Snackbar, Button, Divider } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { validateEmail, validatePassword } from '../../utils/validators';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ENV } from '../../config/env';

WebBrowser.maybeCompleteAuthSession();

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

  // --- Google Sign-In Setup ---
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: ENV.GOOGLE_CLIENT_ID,
    androidClientId: ENV.GOOGLE_CLIENT_ID,
    webClientId: ENV.GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.idToken) {
      handleRealGoogleLogin(response.authentication.idToken);
    }
  }, [response]);

  const handleRealGoogleLogin = async (idToken: string) => {
    try {
      await socialLogin({
        provider: 'google',
        identity_token: idToken,
      });
    } catch (err) {
      setSnackbarVisible(true);
    }
  };

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
    if (provider === 'google') {
      const isClientConfigured = ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_ID !== 'your-google-oauth-client-id-here';
      if (isClientConfigured) {
        try {
          await promptAsync();
          return;
        } catch (error) {
          console.error('Failed to trigger Google Sign-In, falling back to mock:', error);
        }
      }
      
      // Fallback to Mock Google login
      console.log('Using Mock Google Sign-In');
      try {
        const identityToken = `mock_google_${Date.now()}`;
        const mockEmail = `google_user_${Math.floor(Math.random() * 1000)}@example.com`;
        const mockFullName = 'Google Test User';
        
        await socialLogin({
          provider: 'google',
          identity_token: identityToken,
          email: mockEmail,
          full_name: mockFullName,
        });
      } catch (err) {
        setSnackbarVisible(true);
      }
    } else if (provider === 'apple') {
      try {
        const isAppleAvailable = await AppleAuthentication.isAvailableAsync();
        if (isAppleAvailable) {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
          
          if (credential.identityToken) {
            const givenName = credential.fullName?.givenName || '';
            const familyName = credential.fullName?.familyName || '';
            const fullName = `${givenName} ${familyName}`.trim() || undefined;
            
            await socialLogin({
              provider: 'apple',
              identity_token: credential.identityToken,
              email: credential.email || undefined,
              full_name: fullName,
            });
            return;
          }
        }
      } catch (err) {
        console.error('Apple Sign-In failed or not supported, falling back to mock:', err);
      }
      
      // Fallback to Mock Apple login
      console.log('Using Mock Apple Sign-In');
      try {
        const identityToken = `mock_apple_${Date.now()}`;
        const mockEmail = `apple_user_${Math.floor(Math.random() * 1000)}@example.com`;
        const mockFullName = 'Apple Test User';
        
        await socialLogin({
          provider: 'apple',
          identity_token: identityToken,
          email: mockEmail,
          full_name: mockFullName,
        });
      } catch (err) {
        setSnackbarVisible(true);
      }
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
