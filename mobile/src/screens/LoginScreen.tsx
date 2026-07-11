import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setToken, setRefreshToken, setUser } from '../store/authSlice';
import api from '../services/api';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const theme = useTheme();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginResponse = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      dispatch(setToken(loginResponse.data.access_token));
      if (loginResponse.data.refresh_token) {
        dispatch(setRefreshToken(loginResponse.data.refresh_token));
      }

      const userResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${loginResponse.data.access_token}` },
      });
      dispatch(setUser(userResponse.data));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Surface style={styles.surface} elevation={4}>
        <Text style={styles.logoIcon}>⏰</Text>
        <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Sign in to CogniAlarm</Text>

        {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!showPass}
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
          right={<TextInput.Icon icon={showPass ? 'eye-off' : 'eye'} onPress={() => setShowPass(!showPass)} />}
        />

        <Button
          mode="text"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotBtn}
          compact
        >
          Forgot Password?
        </Button>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading || !email || !password}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          style={styles.linkButton}
        >
          Don't have an account? Sign Up
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  surface: { padding: 28, borderRadius: 24, alignItems: 'center' },
  logoIcon: { fontSize: 48, marginBottom: 12 },
  title: { fontWeight: 'bold', marginBottom: 4 },
  subtitle: { marginBottom: 24, opacity: 0.6 },
  error: { marginBottom: 12, textAlign: 'center' },
  input: { width: '100%', marginBottom: 12 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 8 },
  button: { width: '100%', marginTop: 4, borderRadius: 30 },
  buttonContent: { paddingVertical: 6 },
  linkButton: { marginTop: 16 },
});
