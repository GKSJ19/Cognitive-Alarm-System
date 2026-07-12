import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AppButton } from '../../components/AppButton';
import { FormInput } from '../../components/FormInput';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { registerUser } from '../../redux/slices/authSlice';
import { theme } from '../../theme';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof registerSchema>;

export function RegisterScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (values: FormValues) => {
    dispatch(registerUser(values));
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Join the Intelligent Cognitive Alarm Platform.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Controller control={control} name="name" render={({ field: { onChange, value } }) => <FormInput label="Full name" value={value} onChangeText={onChange} placeholder="Asha Rao" />} />
      {errors.name ? <Text style={styles.helper}>{errors.name.message}</Text> : null}
      <Controller control={control} name="email" render={({ field: { onChange, value } }) => <FormInput label="Email" value={value} onChangeText={onChange} placeholder="you@example.com" />} />
      {errors.email ? <Text style={styles.helper}>{errors.email.message}</Text> : null}
      <Controller control={control} name="password" render={({ field: { onChange, value } }) => <FormInput label="Password" value={value} onChangeText={onChange} placeholder="••••••••" secureTextEntry />} />
      {errors.password ? <Text style={styles.helper}>{errors.password.message}</Text> : null}
      <AppButton title={loading ? 'Creating account…' : 'Register'} onPress={handleSubmit(onSubmit)} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Already have an account?</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginBottom: 16 },
  error: { color: '#dc2626', marginBottom: 12 },
  helper: { color: '#dc2626', marginBottom: 8, fontSize: 12 },
  link: { color: theme.colors.primary, textAlign: 'center', marginTop: 16 },
});
