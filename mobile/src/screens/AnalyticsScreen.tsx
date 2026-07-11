import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, Card, Title, Paragraph, useTheme, ProgressBar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../services/api';

export default function AnalyticsScreen() {
  const theme = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data);
    } catch (err) {
      console.log('Error fetching analytics', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium">Analytics & Habits</Text>
      </View>

      <Surface style={styles.section} elevation={1}>
        <Title>Overall Habit Score</Title>
        <Text variant="displayLarge" style={{ color: theme.colors.primary, marginVertical: 8 }}>
          {stats?.habit_score || 0}
        </Text>
        <ProgressBar progress={(stats?.habit_score || 0) / 100} color={theme.colors.primary} />
        <Paragraph style={styles.note}>Based on your wake-up consistency and challenge accuracy.</Paragraph>
      </Surface>

      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Card.Content>
            <Title>Productivity</Title>
            <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
              {stats?.productivity_score || 0}%
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.halfCard}>
          <Card.Content>
            <Title>Accuracy</Title>
            <Text variant="headlineMedium" style={{ color: theme.colors.error }}>
              {stats?.challenge_accuracy || 0}%
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Surface style={styles.section} elevation={1}>
        <Title>Sleep Trends</Title>
        <Paragraph>Consistent sleep schedule detected over the last 7 days.</Paragraph>
        <View style={styles.mockChart}>
          <View style={[styles.bar, { height: 60, backgroundColor: theme.colors.primary }]} />
          <View style={[styles.bar, { height: 80, backgroundColor: theme.colors.primary }]} />
          <View style={[styles.bar, { height: 75, backgroundColor: theme.colors.primary }]} />
          <View style={[styles.bar, { height: 90, backgroundColor: theme.colors.primary }]} />
          <View style={[styles.bar, { height: 85, backgroundColor: theme.colors.primary }]} />
          <View style={[styles.bar, { height: 95, backgroundColor: theme.colors.secondary }]} />
          <View style={[styles.bar, { height: 85, backgroundColor: theme.colors.primary }]} />
        </View>
        <View style={styles.chartLabels}>
          <Text>M</Text><Text>T</Text><Text>W</Text><Text>T</Text><Text>F</Text><Text>S</Text><Text>S</Text>
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  note: {
    marginTop: 12,
    opacity: 0.7,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  halfCard: {
    flex: 1,
  },
  mockChart: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 10,
  },
  bar: {
    width: 20,
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 8,
    opacity: 0.6,
  }
});
