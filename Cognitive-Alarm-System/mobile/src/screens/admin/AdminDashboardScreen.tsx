import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../theme';

export function AdminDashboardScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Card>
        <Text style={styles.metric}>Users: 148</Text>
        <Text style={styles.metric}>Audit logs: 320</Text>
        <Text style={styles.metric}>Platform settings: Updated</Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  metric: { color: theme.colors.text, marginBottom: 8 },
});
