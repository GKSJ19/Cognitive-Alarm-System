import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, List } from 'react-native-paper';

export const MessagesScreen = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>Message Center</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Motivational notes delivered to your clients</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.sec, { color: theme.colors.primary }]}>Sent Messages History</Text>
          <List.Item
            title="Keep up the great work!"
            description="Sent to Client Jane Doe | Status: Read"
            left={props => <List.Icon {...props} icon="message-check" color="#10B981" />}
          />
          <List.Item
            title="Let's reset alarms for early week"
            description="Sent to Client John Smith | Status: Delivered"
            left={props => <List.Icon {...props} icon="message-text" color={theme.colors.secondary} />}
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
    marginBottom: 16,
  },
  sec: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default MessagesScreen;
