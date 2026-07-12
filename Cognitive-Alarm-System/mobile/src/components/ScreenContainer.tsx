import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { theme } from '../theme';

type Props = {
  children: React.ReactNode;
};

export function ScreenContainer({ children }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.colors.background },
  inner: { flex: 1, padding: 20, gap: 16 },
});
