import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../theme';

export function CoachDashboardScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Coach Dashboard</Text>
      <Card>
        <Text style={styles.metric}>Assigned users: 24</Text>
        <Text style={styles.metric}>Performance trend: Improving</Text>
        <Text style={styles.metric}>Recommendations: 3 new</Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  metric: { color: theme.colors.text, marginBottom: 8 },
});
