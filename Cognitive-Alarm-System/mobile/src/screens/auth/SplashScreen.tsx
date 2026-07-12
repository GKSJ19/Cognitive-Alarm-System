import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { bootstrapAuth } from '../../redux/slices/authSlice';
import { theme } from '../../theme';

export function SplashScreen() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Intelligent Cognitive Alarm Platform</Text>
      <Text style={styles.subtitle}>Preparing your secure workspace…</Text>
      {loading ? <ActivityIndicator size="large" color={theme.colors.primary} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, padding: 24 },
  title: { fontSize: 26, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  subtitle: { marginTop: 10, color: theme.colors.muted, textAlign: 'center' },
});
