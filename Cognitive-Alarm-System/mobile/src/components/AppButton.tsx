import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { theme } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
};

export function AppButton({ title, onPress, variant = 'primary', style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' ? styles.secondary : styles.primary,
        style,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  label: { fontSize: 15, fontWeight: '600', color: theme.colors.card },
  pressed: { opacity: 0.9 },
});
