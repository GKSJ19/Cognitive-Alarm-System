import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setToken, setRefreshToken, setUser } from '../store/authSlice';
import api from '../services/api';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const theme = useTheme();
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      setError('');

      await api.post('/auth/register', { email, password, full_name: name });

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
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
        <Text style={styles.logoIcon}>✨</Text>
        <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Join Cognitive Alarm Platform</Text>

        {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
        />
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
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading || !email || !password || !name}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign Up
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.linkButton}
        >
          Already have an account? Login
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
  input: { width: '100%', marginBottom: 14 },
  button: { width: '100%', marginTop: 8, borderRadius: 30 },
  buttonContent: { paddingVertical: 6 },
  linkButton: { marginTop: 16 },
});
