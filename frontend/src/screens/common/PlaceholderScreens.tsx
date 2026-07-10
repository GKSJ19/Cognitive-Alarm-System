import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
