import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Card, List } from 'react-native-paper';
import { useAdmin } from '../../hooks/useAdmin';
import LoadingOverlay from '../../components/common/LoadingOverlay';

export const SystemLogsScreen = () => {
  const theme = useTheme();
  const { logs, getLogs, isLoading } = useAdmin();

  useEffect(() => {
    getLogs();
  }, [getLogs]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>System Audit Logs</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Recent diagnostic events log</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          {logs.length === 0 ? (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No security logs registered.</Text>
          ) : (
            logs.map((log, index) => (
              <List.Item
                key={index}
                title={`${log.action} - ${log.user}`}
                description={log.timestamp}
                left={props => <List.Icon {...props} icon="shield-alert-outline" color={theme.colors.error} />}
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

export default SystemLogsScreen;
