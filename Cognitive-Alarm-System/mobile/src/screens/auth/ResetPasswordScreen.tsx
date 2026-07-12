import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { FormInput } from '../../components/FormInput';
import { ScreenContainer } from '../../components/ScreenContainer';
import { authApi } from '../../services/api';
import { theme } from '../../theme';

export function ResetPasswordScreen({ navigation, route }: any) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const token = route?.params?.token || '';

  const handleReset = async () => {
    try {
      await authApi.resetPassword({ token, password });
      setStatus('Password updated successfully.');
    } catch (error: any) {
      setStatus(error.response?.data?.detail || 'Reset failed');
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Create a new password for your account.</Text>
      <FormInput label="New password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <AppButton title="Save password" onPress={handleReset} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Back to login</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginBottom: 16 },
  status: { color: theme.colors.primary, marginBottom: 12 },
  link: { color: theme.colors.primary, textAlign: 'center', marginTop: 16 },
});
