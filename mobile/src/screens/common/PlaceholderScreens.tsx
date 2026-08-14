import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, List, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import NotificationsScreenComponent from './NotificationsScreen';
import ThemeBackground from '../../components/common/ThemeBackground';

export const SettingsScreen = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  return (
    <ThemeBackground>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: '#A58BFF' }]}>Application Settings</Text>
            <List.Item title="Vibrate on Alarm" titleStyle={{ color: '#FFFFFF' }} left={props => <List.Icon {...props} icon="vibrate" color="#A58BFF" />} />
            <List.Item title="Dark Mode" titleStyle={{ color: '#FFFFFF' }} description="Enabled (Obsidian Purple)" descriptionStyle={{ color: '#A098BA' }} left={props => <List.Icon {...props} icon="theme-light-dark" color="#A58BFF" />} />
            <List.Item title="System Version" titleStyle={{ color: '#FFFFFF' }} description="1.0.0" descriptionStyle={{ color: '#A098BA' }} left={props => <List.Icon {...props} icon="information-outline" color="#A58BFF" />} />
            <Button mode="contained" onPress={logout} buttonColor="#F87171" textColor="#FFFFFF" style={{ marginTop: 20, borderRadius: 20 }}>
              Sign Out
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </ThemeBackground>
  );
};

export const NotificationsScreen = NotificationsScreenComponent;

export const AchievementsScreen = () => {
  return (
    <ThemeBackground>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: '#A58BFF' }]}>Your Achievements</Text>
            <List.Item title="Early Bird" titleStyle={{ color: '#FFFFFF' }} description="Woke up before 6 AM 3 days in a row" descriptionStyle={{ color: '#A098BA' }} left={props => <List.Icon {...props} icon="trophy" color="#FBBF24" />} />
            <List.Item title="Math Wizard" titleStyle={{ color: '#FFFFFF' }} description="Solved 10 hard math puzzles" descriptionStyle={{ color: '#A098BA' }} left={props => <List.Icon {...props} icon="trophy" color="#FBBF24" />} />
            <List.Item title="Focus Master" titleStyle={{ color: '#FFFFFF' }} description="Solved memory challenges with 100% accuracy" descriptionStyle={{ color: '#A098BA' }} left={props => <List.Icon {...props} icon="star-circle" color="#A58BFF" />} />
          </Card.Content>
        </Card>
      </ScrollView>
    </ThemeBackground>
  );
};

export const ReportsScreen = () => {
  return (
    <ThemeBackground>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, { color: '#A58BFF' }]}>Weekly Sleep & Cognitive Summary</Text>
            <Text style={{ color: '#FFFFFF', marginBottom: 12, fontSize: 15 }}>Average Wake time: 07:15 AM</Text>
            <Text style={{ color: '#FFFFFF', marginBottom: 12, fontSize: 15 }}>Average Puzzle solve time: 14 seconds</Text>
            <Text style={{ color: '#A098BA', fontSize: 13 }}>Consistent wake-up times improve cognitive baseline scores by 24% week-over-week.</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(26, 22, 38, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

