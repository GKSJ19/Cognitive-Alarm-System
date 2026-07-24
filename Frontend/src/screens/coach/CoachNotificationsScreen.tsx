import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, useTheme, Card, Avatar } from 'react-native-paper';
import { useCoach } from '../../hooks/useCoach';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { CoachNotificationItem } from '../../types/coach.types';

export const CoachNotificationsScreen: React.FC = () => {
  const theme = useTheme();
  const { notifications, getNotifications, isLoading } = useCoach();

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const renderNotification = ({ item }: { item: CoachNotificationItem }) => {
    let icon = "bell-ring";
    let iconBg = "#DBEAFE";
    let iconColor = "#1E40AF";

    if (item.type === 'HIGH_SCORE') {
      icon = "trophy";
      iconBg = "#DCFCE7";
      iconColor = "#166534";
    } else if (item.type === 'INACTIVE') {
      icon = "alert-circle";
      iconBg = "#FEE2E2";
      iconColor = "#DC2626";
    } else if (item.type === 'STREAK') {
      icon = "fire";
      iconBg = "#FEF3C7";
      iconColor = "#92400E";
    }

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Icon size={40} icon={icon} style={{ backgroundColor: iconBg }} color={iconColor} />
          <View style={styles.info}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{item.title}</Text>
            <Text style={[styles.msg, { color: theme.colors.onSurfaceVariant }]}>{item.message}</Text>
            <Text style={[styles.time, { color: '#64748B' }]}>{item.time}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={isLoading && !notifications} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={getNotifications} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              No client notifications or alerts at this time.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  msg: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  time: {
    fontSize: 10,
    marginTop: 6,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
});

export default CoachNotificationsScreen;
