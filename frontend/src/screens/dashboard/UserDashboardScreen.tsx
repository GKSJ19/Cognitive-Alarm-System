import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme, Card, Button, IconButton, ProgressBar, Portal, Modal, Badge, List } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useAlarms } from '../../hooks/useAlarms';
import { useProfile } from '../../hooks/useProfile';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { notificationService, AppNotification } from '../../services/notificationService';

export const UserDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { alarms, history, getAlarms, getHistory, isLoading: alarmsLoading } = useAlarms();
  const { profile, getProfile } = useProfile();

  const [countdownText, setCountdownText] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load data on mount
  useEffect(() => {
    getAlarms();
    getHistory();
    getProfile();
    loadNotifications();
  }, [getAlarms, getHistory, getProfile]);

  // Handle periodic notification updates
  useEffect(() => {
    const checkNotifs = async () => {
      const generated = await notificationService.checkAndGenerate(profile, alarms, history);
      if (generated) {
        loadNotifications();
      }
    };
    if (alarms.length > 0 || history.length > 0) {
      checkNotifs();
    }
  }, [alarms, history, profile]);

  const loadNotifications = async () => {
    const list = await notificationService.getNotifications();
    setNotifications(list);
  };

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  };

  const clearAllNotifs = async () => {
    await notificationService.clearNotifications();
    loadNotifications();
  };

  const nextAlarm = alarms.filter(a => a.is_active).sort((a, b) => a.alarm_time.localeCompare(b.alarm_time))[0] || null;

  // Real-time alarm countdown
  useEffect(() => {
    if (!nextAlarm) {
      setCountdownText('');
      return;
    }

    const updateCountdown = () => {
      const [hoursStr, minutesStr] = nextAlarm.alarm_time.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      const now = new Date();
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const diffMs = target.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHrs > 0) {
        setCountdownText(`Rings in ${diffHrs}h ${diffMins}m`);
      } else {
        setCountdownText(`Rings in ${diffMins}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, [nextAlarm?.alarm_id, nextAlarm?.alarm_time]);

  // Dynamic Streaks Calculations from history
  const uniqueDates = Array.from(new Set(
    history.map(h => h.dismissed_at?.split('T')[0]).filter(Boolean)
  )).sort();

  let currentStreak = 0;
  let bestStreak = 0;

  if (uniqueDates.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastLogged = uniqueDates[uniqueDates.length - 1];

    if (lastLogged === todayStr || lastLogged === yesterdayStr) {
      currentStreak = 1;
      for (let i = uniqueDates.length - 1; i > 0; i--) {
        const d1 = new Date(uniqueDates[i]);
        const d2 = new Date(uniqueDates[i - 1]);
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
        } else if (diff > 1) {
          break;
        }
      }
    }

    let tempStreak = 1;
    bestStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const d1 = new Date(uniqueDates[i]);
      const d2 = new Date(uniqueDates[i - 1]);
      const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
  }

  // Gamification (Points, Levels, Progress)
  const totalXP = history.length * 150; // 150 XP per successful cognitive dismissal
  const level = Math.floor(totalXP / 500) + 1;
  const xpInLevel = totalXP % 500;
  const levelProgress = xpInLevel / 500;

  // Daily goals
  const todayStr = new Date().toISOString().split('T')[0];
  const goalWokeUp = history.some(h => h.dismissed_at?.split('T')[0] === todayStr);
  const goalChallenge = history.some(h => h.dismissed_at?.split('T')[0] === todayStr && h.solved);
  const goalSleep = history.length > 0; // Sleep tracking status indicator

  // Achievement Badges evaluation
  const badges = [
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Woke up before 7:00 AM',
      icon: 'weather-sunset-up',
      color: '#F59E0B',
      unlocked: history.some(h => {
        if (!h.wake_time) return false;
        const hr = parseInt(h.wake_time.split(':')[0], 10);
        return hr < 7;
      })
    },
    {
      id: 'mind_starter',
      name: 'Mind Starter',
      description: 'Solved first morning puzzle',
      icon: 'brain',
      color: '#7C3AED',
      unlocked: history.some(h => h.solved)
    },
    {
      id: 'consistent_3',
      name: 'Consistent',
      description: 'Achieved a 3-day streak',
      icon: 'fire',
      color: '#EF4444',
      unlocked: bestStreak >= 3
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Solved challenge in < 15s',
      icon: 'lightning-bolt',
      color: '#10B981',
      unlocked: history.some(h => h.solved && h.solve_time > 0 && h.solve_time <= 15)
    }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={alarmsLoading} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Dynamic header with notification bell */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.colors.onBackground }]}>
              Hello, {user?.full_name?.split(' ')[0] || 'User'}!
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Rise, solve, and conquer your routines.
            </Text>
          </View>
          <View style={styles.bellContainer}>
            <IconButton
              icon="bell"
              size={28}
              iconColor={theme.colors.primary}
              onPress={() => setShowNotifications(true)}
            />
            {unreadCount > 0 && (
              <Badge style={[styles.badgeIndicator, { backgroundColor: theme.colors.error }]}>
                {unreadCount}
              </Badge>
            )}
          </View>
        </View>

        {/* 1. Streak & XP Gamification Row */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { flex: 0.3, backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.center}>
              <IconButton icon="fire" iconColor="#EF4444" size={24} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{currentStreak}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Streak</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.3, backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.center}>
              <IconButton icon="trophy" iconColor="#F59E0B" size={24} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{bestStreak}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Best Streak</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 0.34, backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.center}>
              <IconButton icon="brain" iconColor="#7C3AED" size={24} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{totalXP} XP</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Total Points</Text>
            </Card.Content>
          </Card>
        </View>

        {/* 2. Level Progress Bar */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={{ paddingVertical: 12 }}>
            <View style={styles.levelHeader}>
              <Text style={[styles.levelTitle, { color: theme.colors.primary }]}>Level {level}</Text>
              <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                {xpInLevel} / 500 XP to Level {level + 1}
              </Text>
            </View>
            <ProgressBar progress={levelProgress} color={theme.colors.primary} style={styles.progressBar} />
          </Card.Content>
        </Card>

        {/* 3. Daily Goals Checklist */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Today's Goals</Text>
            <List.Item
              title="Woke up on time"
              titleStyle={{ textDecorationLine: goalWokeUp ? 'line-through' : 'none' }}
              left={props => <List.Icon {...props} icon={goalWokeUp ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} color={goalWokeUp ? '#10B981' : theme.colors.placeholder} />}
            />
            <List.Item
              title="Solved morning puzzle"
              titleStyle={{ textDecorationLine: goalChallenge ? 'line-through' : 'none' }}
              left={props => <List.Icon {...props} icon={goalChallenge ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} color={goalChallenge ? '#7C3AED' : theme.colors.placeholder} />}
            />
            <List.Item
              title="Sleep goals logged"
              titleStyle={{ textDecorationLine: goalSleep ? 'line-through' : 'none' }}
              left={props => <List.Icon {...props} icon={goalSleep ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} color={goalSleep ? '#3B82F6' : theme.colors.placeholder} />}
            />
          </Card.Content>
        </Card>

        {/* 4. Upcoming Alarm (Countdown) */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Upcoming Alarm</Text>
            {nextAlarm ? (
              <View style={styles.alarmInfo}>
                <View>
                  <Text style={[styles.alarmTime, { color: theme.colors.onSurface }]}>
                    {nextAlarm.alarm_time}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>{nextAlarm.title}</Text>
                  {countdownText ? (
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 12, marginTop: 4 }}>
                      ⏰ {countdownText}
                    </Text>
                  ) : null}
                </View>
                {nextAlarm.challenge_type ? (
                  <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 10, fontWeight: 'bold' }}>
                      🧠 {nextAlarm.challenge_type.toUpperCase()}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>No upcoming active alarms scheduled.</Text>
            )}
          </Card.Content>
        </Card>

        {/* 5. Personalized Recommendations */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Personalized Challenge Recommendation</Text>
            {history.length > 0 ? (
              <View>
                <Text style={{ color: theme.colors.onSurface, fontWeight: 'bold', fontSize: 14 }}>
                  🧠 Recommended Path: Math Problems (Medium)
                </Text>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, marginTop: 4 }}>
                  You solve Easy arithmetic in under 10 seconds. We suggest switching to Medium difficulty challenges to trigger higher morning cognitive alertness.
                </Text>
              </View>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Start waking up with alarms to unlock personalized challenge progression recommendations!
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* 6. Achievements & Badges Grid */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Achievement Badges</Text>
            <View style={styles.badgeGrid}>
              {badges.map(b => (
                <View key={b.id} style={[styles.badgeCell, { opacity: b.unlocked ? 1 : 0.4 }]}>
                  <View style={[styles.badgeIconBg, { backgroundColor: b.unlocked ? b.color + '20' : theme.colors.surfaceVariant }]}>
                    <IconButton icon={b.icon} size={28} iconColor={b.unlocked ? b.color : theme.colors.placeholder} />
                  </View>
                  <Text style={[styles.badgeName, { color: theme.colors.onSurface }]}>{b.name}</Text>
                  <Text style={[styles.badgeDesc, { color: theme.colors.onSurfaceVariant }]}>{b.description}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Button mode="elevated" icon="alarm-plus" onPress={() => navigation.navigate('Alarms', { screen: 'CreateAlarm' })} style={styles.actionBtn}>
                Add Alarm
              </Button>
              <Button mode="elevated" icon="alarm" onPress={() => navigation.navigate('Alarms', { screen: 'AlarmList' })} style={styles.actionBtn}>
                View Alarms
              </Button>
              <Button mode="elevated" icon="account-cog" onPress={() => navigation.navigate('Profile')} style={styles.actionBtn}>
                View Profile
              </Button>
              <Button mode="elevated" icon="settings" onPress={() => navigation.navigate('Settings')} style={styles.actionBtn}>
                Settings
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Recent Wake-up History</Text>
            {history.length === 0 ? (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>No recent alarms dismissed yet.</Text>
            ) : (
              <View>
                {history.slice(0, 3).map((log, idx) => (
                  <Text key={log.history_id || idx} style={[styles.activityText, { color: theme.colors.onSurfaceVariant }]}>
                    ⏰ Alarm dismissed at {log.wake_time} (Solved in {log.solve_time}s)
                  </Text>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Notification Center Slide Modal */}
      <Portal>
        <Modal
          visible={showNotifications}
          onDismiss={() => setShowNotifications(false)}
          contentContainerStyle={[styles.modalStyle, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>Notification Center</Text>
            <IconButton icon="close" size={24} onPress={() => setShowNotifications(false)} />
          </View>
          <View style={styles.modalControls}>
            <Button compact mode="text" onPress={markAllRead}>Mark all read</Button>
            <Button compact mode="text" textColor={theme.colors.error} onPress={clearAllNotifs}>Clear all</Button>
          </View>

          <ScrollView style={styles.modalScroll}>
            {notifications.length === 0 ? (
              <Text style={styles.emptyNotifs}>No notifications logged yet.</Text>
            ) : (
              notifications.map(n => {
                let notifIcon = 'bell';
                let iconColor = theme.colors.primary;
                if (n.category === 'bedtime') {
                  notifIcon = 'sleep';
                  iconColor = '#8B5CF6';
                } else if (n.category === 'alarm') {
                  notifIcon = 'alarm';
                  iconColor = '#EF4444';
                } else if (n.category === 'progress') {
                  notifIcon = 'fire';
                  iconColor = '#F59E0B';
                }
                return (
                  <List.Item
                    key={n.id}
                    title={n.title}
                    titleStyle={{ fontWeight: n.isRead ? 'normal' : 'bold', color: theme.colors.onSurface }}
                    description={n.content}
                    descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    left={props => <List.Icon {...props} icon={notifIcon} color={iconColor} />}
                    style={[styles.notifItem, { backgroundColor: n.isRead ? 'transparent' : theme.colors.surfaceVariant }]}
                  />
                );
              })
            )}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  bellContainer: {
    position: 'relative',
  },
  badgeIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statCard: {
    borderRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  center: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  statIcon: {
    margin: 0,
    height: 36,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  alarmInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmTime: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  badgeCell: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 6,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 12,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  modalStyle: {
    padding: 20,
    margin: 20,
    borderRadius: 16,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalScroll: {
    marginTop: 4,
  },
  emptyNotifs: {
    textAlign: 'center',
    marginVertical: 40,
    color: '#888',
  },
  notifItem: {
    borderRadius: 8,
    marginBottom: 6,
  },
});

export default UserDashboardScreen;
