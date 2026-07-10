import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, List, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';

export const SettingsScreen = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Application Settings</Text>
          <List.Item title="Vibrate on Alarm" left={props => <List.Icon {...props} icon="vibrate" />} />
          <List.Item title="Dark Mode" left={props => <List.Icon {...props} icon="theme-light-dark" />} />
          <List.Item title="System Version" description="1.0.0" left={props => <List.Icon {...props} icon="information-outline" />} />
          <Button mode="contained" onPress={logout} buttonColor={theme.colors.error} style={{ marginTop: 20 }}>
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export const NotificationsScreen = () => {
  const theme = useTheme();
  return (
    <View style={[styles.centeredContainer, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Notifications</Text>
      <Text style={{ color: theme.colors.onSurfaceVariant }}>No new notifications.</Text>
    </View>
  );
};

export const AchievementsScreen = () => {
  const theme = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Your Achievements</Text>
          <List.Item title="Early Bird" description="Woke up before 6 AM 3 days in a row" left={props => <List.Icon {...props} icon="trophy" color="#F59E0B" />} />
          <List.Item title="Math Wizard" description="Solved 10 hard math puzzles" left={props => <List.Icon {...props} icon="trophy" color="#F59E0B" />} />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export const ReportsScreen = () => {
  const theme = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Weekly Sleep Summary</Text>
          <Text style={{ color: theme.colors.onSurface, marginBottom: 12 }}>Average Wake time: 07:15 AM</Text>
          <Text style={{ color: theme.colors.onSurface }}>Average Puzzle solve time: 14 seconds</Text>
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
