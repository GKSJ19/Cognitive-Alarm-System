import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';

export const CoachAnalyticsScreen = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>Wellness Analytics</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Routine efficiency tracking charts</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.sec, { color: theme.colors.primary }]}>Challenge Accuracy Trends</Text>
          <Text style={{ color: theme.colors.onSurface, lineHeight: 22, marginTop: 8 }}>
            Clients resolve math puzzles 18% faster in the second half of the week compared to Monday mornings.
          </Text>
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
  },
});

export default CoachAnalyticsScreen;
