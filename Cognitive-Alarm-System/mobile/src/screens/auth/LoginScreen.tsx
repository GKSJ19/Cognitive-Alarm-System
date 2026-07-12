import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AppButton } from '../../components/AppButton';
import { FormInput } from '../../components/FormInput';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loginUser } from '../../redux/slices/authSlice';
import { theme } from '../../theme';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof loginSchema>;

export function LoginScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: FormValues) => {
    dispatch(loginUser(values));
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Secure login with JWT authentication.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <FormInput label="Email" value={value} onChangeText={onChange} placeholder="you@example.com" />
        )}
      />
      {errors.email ? <Text style={styles.helper}>{errors.email.message}</Text> : null}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <FormInput label="Password" value={value} onChangeText={onChange} placeholder="••••••••" secureTextEntry />
        )}
      />
      {errors.password ? <Text style={styles.helper}>{errors.password.message}</Text> : null}
      <AppButton title={loading ? 'Signing in…' : 'Sign in'} onPress={handleSubmit(onSubmit)} />
      <AppButton title="Create account" variant="secondary" onPress={() => navigation.navigate('Register')} style={styles.secondaryButton} />
      <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>Forgot password?</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginBottom: 16 },
  error: { color: '#dc2626', marginBottom: 12 },
  helper: { color: '#dc2626', marginBottom: 8, fontSize: 12 },
  secondaryButton: { marginTop: 12 },
  link: { color: theme.colors.primary, textAlign: 'center', marginTop: 16 },
});
