import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, List } from 'react-native-paper';

export const ChallengeManagementScreen = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>Challenge Templates</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Cognitive puzzle difficulty tuning</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.sec, { color: theme.colors.primary }]}>Active Categories</Text>
          <List.Item title="Math Puzzles" description="Difficulty modifiers: easy (2 terms addition), medium (3 terms), hard (multiplication)" left={props => <List.Icon {...props} icon="calculator" />} />
          <List.Item title="Memory Matrix" description="Difficulty modifiers: Grid sizes from 3x3 to 5x5" left={props => <List.Icon {...props} icon="grid" />} />
          <List.Item title="Pattern Copy" description="Difficulty modifiers: String length from 6 to 12 chars" left={props => <List.Icon {...props} icon="keyboard" />} />
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

export default ChallengeManagementScreen;
