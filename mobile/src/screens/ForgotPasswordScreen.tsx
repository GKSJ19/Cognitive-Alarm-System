import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, HelperText } from 'react-native-paper';
import api from '../services/api';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    try {
      setLoading(true);
      setError('');
      // In a real app this would call a /auth/forgot-password endpoint
      // For now we simulate a success after a short delay
      await new Promise(r => setTimeout(r, 1500));
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
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
        <Text style={styles.icon}>🔐</Text>
        <Text variant="headlineMedium" style={styles.title}>Forgot Password</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {sent
            ? 'Check your email for a password reset link.'
            : "Enter your email and we'll send you a reset link."}
        </Text>

        {!sent && (
          <>
            {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Send Reset Link
            </Button>
          </>
        )}

        {sent && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Back to Login
          </Button>
        )}

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.linkButton}
        >
          ← Back to Login
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  surface: {
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  error: {
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    marginTop: 8,
    borderRadius: 30,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 16,
  },
});
