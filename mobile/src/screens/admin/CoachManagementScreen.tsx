import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, List } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingOverlay from '../../components/common/LoadingOverlay';

export const CoachManagementScreen = () => {
  const theme = useTheme();
  const { coaches, getCoaches, isLoading } = useAdmin();

  useEffect(() => {
    getCoaches();
  }, [getCoaches]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>Coaches list</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Roster of wellness coaches</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          {coaches.length === 0 ? (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No coaches configured.</Text>
          ) : (
            coaches.map(coach => (
              <List.Item
                key={coach.id}
                title={coach.full_name}
                description={coach.email}
                left={props => <List.Icon {...props} icon="account-tie-outline" color={theme.colors.primary} />}
              />
            ))
          )}
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
});

export default CoachManagementScreen;
