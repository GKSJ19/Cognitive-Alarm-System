import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { FormInput } from '../../components/FormInput';
import { ScreenContainer } from '../../components/ScreenContainer';
import { authApi } from '../../services/api';
import { theme } from '../../theme';

export function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSend = async () => {
    try {
      await authApi.forgotPassword(email);
      setStatus('A recovery link has been requested.');
    } catch (error: any) {
      setStatus(error.response?.data?.detail || 'Request failed');
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email and we’ll help you restore access.</Text>
      <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <AppButton title="Send recovery link" onPress={handleSend} />
      <Text style={styles.link} onPress={() => navigation.goBack()}>Back to login</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginBottom: 16 },
  status: { color: theme.colors.primary, marginBottom: 12 },
  link: { color: theme.colors.primary, textAlign: 'center', marginTop: 16 },
});
