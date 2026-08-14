import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Card, Avatar, Button, IconButton } from 'react-native-paper';
import { useCoach } from '../../hooks/useCoach';
import LoadingOverlay from '../../components/common/LoadingOverlay';

import ThemeBackground from '../../components/common/ThemeBackground';

interface CoachDashboardScreenProps {
  navigation: any;
}

export const CoachDashboardScreen: React.FC<CoachDashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { dashboardSummary, getDashboardSummary, isLoading } = useCoach();

  useEffect(() => {
    getDashboardSummary();
  }, [getDashboardSummary]);

  const cards = dashboardSummary?.summary_cards;
  const notifications = dashboardSummary?.notifications || [];

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={isLoading && !dashboardSummary} />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={getDashboardSummary} tintColor="#A58BFF" />}
        >
          <View style={styles.header}>
            <Text style={[styles.welcomeText, { color: '#FFFFFF' }]}>
              Coaching Dashboard
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Client telemetry, wake-up performance analytics, and smart alert notifications
            </Text>
          </View>

          {/* --- SUMMARY CARDS GRID --- */}
          <View style={styles.gridRow}>
            <Card style={[styles.cardCol, { backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
              <Card.Content style={styles.cardInner}>
                <Avatar.Icon size={36} icon="account-group" style={{ backgroundColor: '#2C2243' }} color="#A58BFF" />
                <Text style={[styles.cardVal, { color: '#A58BFF' }]}>{cards?.assigned_users ?? 0}</Text>
                <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Assigned Clients</Text>
              </Card.Content>
            </Card>

          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="account-check" style={{ backgroundColor: '#DCFCE7' }} color="#166534" />
              <Text style={[styles.cardVal, { color: '#059669' }]}>{cards?.active_users_today ?? 0}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Active Today</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.gridRow}>
          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="trophy-outline" style={{ backgroundColor: '#EDE9FE' }} color="#5B21B6" />
              <Text style={[styles.cardVal, { color: theme.colors.secondary }]}>{cards?.average_habit_score?.toFixed(1) ?? '0.0'}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Avg Client Score</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="trending-up" style={{ backgroundColor: '#FEF3C7' }} color="#92400E" />
              <Text style={[styles.cardVal, { color: cards?.weekly_improvement && cards.weekly_improvement >= 0 ? '#16A34A' : '#DC2626' }]}>
                {cards?.weekly_improvement && cards.weekly_improvement >= 0 ? `+${cards.weekly_improvement.toFixed(1)}` : `${cards?.weekly_improvement?.toFixed(1) ?? '0.0'}`}
              </Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Weekly Progress</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.gridRow}>
          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="target" style={{ backgroundColor: '#FCE7F3' }} color="#9D174D" />
              <Text style={[styles.cardVal, { color: '#BE185D' }]}>{cards?.total_challenges_completed ?? 0}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Total Solves</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.cardCol, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardInner}>
              <Avatar.Icon size={36} icon="timer-outline" style={{ backgroundColor: '#E0E7FF' }} color="#3730A3" />
              <Text style={[styles.cardVal, { color: '#4338CA' }]}>{cards?.average_completion_time ? `${cards.average_completion_time}s` : '0s'}</Text>
              <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>Avg Solve Time</Text>
            </Card.Content>
          </Card>
        </View>

        {/* --- SMART NOTIFICATIONS FEED --- */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeading, { color: theme.colors.onBackground }]}>Smart Client Notifications</Text>
          <Button mode="text" compact onPress={() => navigation.navigate('CoachNotifications')}>
            View All
          </Button>
        </View>

        <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            {notifications.length === 0 ? (
              <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginVertical: 10 }}>
                No active notifications or alerts.
              </Text>
            ) : (
              notifications.slice(0, 5).map((note: any) => (
                <View key={note.id} style={styles.actRow}>
                  <Avatar.Icon size={32} icon={note.type === 'HIGH_SCORE' ? 'trophy' : note.type === 'INACTIVE' ? 'alert-circle' : 'fire'} style={{ backgroundColor: note.type === 'INACTIVE' ? '#FEE2E2' : '#DCFCE7' }} color={note.type === 'INACTIVE' ? '#DC2626' : '#166534'} />
                  <View style={styles.actContent}>
                    <Text style={[styles.actTitle, { color: theme.colors.onSurface }]}>{note.title}</Text>
                    <Text style={[styles.actSub, { color: theme.colors.onSurfaceVariant }]}>{note.message}</Text>
                    <Text style={[styles.actTime, { color: '#64748B' }]}>{note.time}</Text>
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* --- QUICK NAVIGATION --- */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <Button mode="contained" icon="message-text" onPress={() => navigation.navigate('ChatTab')} style={{ flex: 0.48, borderRadius: 14 }} buttonColor="#38BDF8">
            Client & Admin DM
          </Button>
          <Button mode="outlined" icon="account-group" onPress={() => navigation.navigate('AssignedUsers')} style={{ flex: 0.48, borderRadius: 14 }}>
            Assigned Clients
          </Button>
        </View>
      </ScrollView>
    </View>
  </ThemeBackground>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardCol: {
    width: '48%',
    borderRadius: 16,
  },
  cardInner: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardVal: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },
  cardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartCard: {
    borderRadius: 16,
    marginBottom: 14,
  },
  actRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actContent: {
    marginLeft: 12,
    flex: 1,
  },
  actTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  actSub: {
    fontSize: 12,
    marginTop: 2,
  },
  actTime: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default CoachDashboardScreen;
