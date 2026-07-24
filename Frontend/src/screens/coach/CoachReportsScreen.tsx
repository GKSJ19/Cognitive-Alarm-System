import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, List } from 'react-native-paper';

export const CoachReportsScreen = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>Weekly Clients Report</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Routine compliance summaries</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.sec, { color: theme.colors.primary }]}>Active Logs</Text>
          <List.Item
            title="92% Alarm Success Rate"
            description="Across 12 monitored alarms"
            left={props => <List.Icon {...props} icon="trending-up" color="#10B981" />}
          />
          <List.Item
            title="78% Habit Completion"
            description="Overall weekly completion rate"
            left={props => <List.Icon {...props} icon="run-fast" color={theme.colors.secondary} />}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
  },
  sec: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default CoachReportsScreen;
