import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { signIn } from '../utils/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    if (!email || !password) {
      setError('Enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Auth listener in App.js handles navigation on success.
    } catch (e) {
      setError(readableAuthError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to your alarms</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

export function readableAuthError(e) {
  const code = e?.code || '';
  if (code.includes('invalid-email')) return 'That email looks invalid.';
  if (code.includes('user-not-found') || code.includes('wrong-password'))
    return 'Incorrect email or password.';
  if (code.includes('email-already-in-use'))
    return 'An account already exists for that email.';
  if (code.includes('weak-password'))
    return 'Password should be at least 6 characters.';
  if (code.includes('network-request-failed'))
    return 'Network error — check your connection.';
  return 'Something went wrong. Please try again.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
    padding: 24,
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 30, fontWeight: '700', textAlign: 'center' },
  subtitle: {
    color: '#8a8f98',
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#1c1f26',
    color: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { color: '#ff5c5c', marginBottom: 12, textAlign: 'center' },
  button: {
    backgroundColor: '#4f7cff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: '#4f7cff', textAlign: 'center', marginTop: 18 },
});
