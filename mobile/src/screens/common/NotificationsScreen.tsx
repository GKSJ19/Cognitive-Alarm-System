import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, Chip, IconButton, Modal, Portal, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../store/slices/notificationSlice';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { BroadcastNotification } from '../../types/notification.types';

import ThemeBackground from '../../components/common/ThemeBackground';

export const NotificationsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, isLoading } = useSelector((state: RootState) => state.notifications);

  // Selected notification for modal detail view
  const [selectedNotif, setSelectedNotif] = useState<BroadcastNotification | null>(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchNotifications());
  };

  const handleOpenDetail = (notif: BroadcastNotification) => {
    setSelectedNotif(notif);
    if (!notif.is_read) {
      dispatch(markNotificationRead(notif.id));
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const getPriorityStyle = (p: string) => {
    switch ((p || '').toLowerCase()) {
      case 'urgent': return { bg: '#451A1A', text: '#F87171' };
      case 'high': return { bg: '#3D2E14', text: '#FBBF24' };
      case 'low': return { bg: '#231E33', text: '#A098BA' };
      default: return { bg: '#2C2243', text: '#A58BFF' };
    }
  };

  const renderNotificationItem = ({ item }: { item: BroadcastNotification }) => {
    const pStyle = getPriorityStyle(item.priority);
    const formattedTime = item.created_at
      ? new Date(item.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => handleOpenDetail(item)}>
        <Card
          style={[
            styles.card,
            item.is_read ? styles.readCard : styles.unreadCard
          ]}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.leftIconColumn}>
              <IconButton
                icon={item.is_read ? 'bell-outline' : 'bell-badge'}
                iconColor={item.is_read ? '#6D6586' : '#A58BFF'}
                size={28}
                style={{ margin: 0 }}
              />
            </View>

            <View style={styles.infoColumn}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !item.is_read && styles.unreadTitleText]}>
                  {item.title}
                </Text>
                {!item.is_read && (
                  <View style={styles.unreadDot} />
                )}
              </View>

              <Text style={styles.messageSnippet} numberOfLines={2}>
                {item.message}
              </Text>

              <View style={styles.footerRow}>
                <Chip compact style={{ backgroundColor: pStyle.bg, height: 24 }}>
                  <Text style={{ color: pStyle.text, fontSize: 10, fontWeight: 'bold' }}>
                    {item.priority.toUpperCase()}
                  </Text>
                </Chip>
                <Text style={styles.timeText}>{formattedTime}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={isLoading && notifications.length === 0} message="Syncing notifications..." />

        {/* Header bar with Unread Count & Mark All Read action */}
        <View style={styles.topHeader}>
          <View style={styles.badgeRow}>
            <Text style={styles.headerTitle}>System Broadcasts</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#A58BFF" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconButton icon="bell-off-outline" size={60} iconColor="#6D6586" />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySub}>You're all caught up! Check back later for announcements.</Text>
            </View>
          }
        />

        {/* MODAL DIALOG FOR FULL NOTIFICATION DETAIL */}
        <Portal>
          <Modal
            visible={!!selectedNotif}
            onDismiss={() => setSelectedNotif(null)}
            contentContainerStyle={styles.modalContainer}
          >
            {selectedNotif && (
              <View style={styles.modalContent}>
                <View style={styles.modalHeaderRow}>
                  <Chip compact style={{ backgroundColor: getPriorityStyle(selectedNotif.priority).bg }}>
                    <Text style={{ color: getPriorityStyle(selectedNotif.priority).text, fontSize: 10, fontWeight: 'bold' }}>
                      {selectedNotif.priority.toUpperCase()}
                    </Text>
                  </Chip>
                  <IconButton icon="close" size={20} iconColor="#A098BA" onPress={() => setSelectedNotif(null)} />
                </View>

                <Text style={styles.modalTitle}>{selectedNotif.title}</Text>
                <Text style={styles.modalMeta}>
                  Published by {selectedNotif.created_by_name} • {selectedNotif.created_at ? new Date(selectedNotif.created_at).toLocaleString() : ''}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.modalMessage}>{selectedNotif.message}</Text>

                <Button mode="contained" onPress={() => setSelectedNotif(null)} style={styles.modalCloseBtn} buttonColor="#A58BFF" textColor="#0D0B14">
                  Dismiss
                </Button>
              </View>
            )}
          </Modal>
        </Portal>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#141021',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(165, 139, 255, 0.12)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  unreadBadge: {
    backgroundColor: '#A58BFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 10,
  },
  unreadBadgeText: {
    color: '#0D0B14',
    fontSize: 11,
    fontWeight: 'bold',
  },
  markAllText: {
    color: '#A58BFF',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 12,
    borderRadius: 20,
    elevation: 4,
    borderWidth: 1,
  },
  unreadCard: {
    backgroundColor: 'rgba(26, 22, 38, 0.95)',
    borderColor: 'rgba(165, 139, 255, 0.3)',
  },
  readCard: {
    backgroundColor: 'rgba(26, 22, 38, 0.65)',
    borderColor: 'rgba(165, 139, 255, 0.1)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  leftIconColumn: {
    marginRight: 8,
  },
  infoColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  unreadTitleText: {
    color: '#C4B5FF',
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A58BFF',
    marginLeft: 6,
  },
  messageSnippet: {
    fontSize: 13,
    color: '#A098BA',
    marginVertical: 4,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  timeText: {
    fontSize: 11,
    color: '#6D6586',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#A098BA',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  modalContainer: {
    backgroundColor: '#1A1626',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.2)',
    elevation: 8,
  },
  modalContent: {
    alignItems: 'flex-start',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  modalMeta: {
    fontSize: 12,
    color: '#A098BA',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(165, 139, 255, 0.15)',
    width: '100%',
    marginVertical: 14,
  },
  modalMessage: {
    fontSize: 14,
    color: '#E2D9FF',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalCloseBtn: {
    width: '100%',
    borderRadius: 20,
  },
});

export default NotificationsScreen;
