import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, List, Switch, Button, SegmentedButtons, Snackbar, useTheme } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeContext';
import { notificationService, NotificationSettings } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';

export const SettingsScreen: React.FC = () => {
  const paperTheme = useTheme();
  const { logout } = useAuth();
  const { themeMode, setThemeMode } = useAppTheme();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    bedtimeEnabled: true,
    alarmEnabled: true,
    habitEnabled: true,
    progressEnabled: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await notificationService.getSettings();
      setNotifSettings(saved);
    };
    loadSettings();
  }, []);

  const handleToggle = async (key: keyof NotificationSettings) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    await notificationService.saveSettings(updated);
    setSnackbarMessage('Notification settings updated');
  };

  const handleThemeChange = (value: string) => {
    setThemeMode(value as any);
    setSnackbarMessage(`Theme changed to ${value}`);
  };

  const triggerTestNotification = async (category: 'bedtime' | 'alarm' | 'habit' | 'progress') => {
    if (category === 'bedtime') {
      await notificationService.addNotification('🌙 Wind Down Reminder (Test)', 'Time to wind down! Rest well to keep your consistency score high.', 'bedtime');
    } else if (category === 'alarm') {
      await notificationService.addNotification('⏰ Upcoming Alarm (Test)', 'Test Alarm set for 07:30 AM tomorrow. Solve puzzle to dismiss!', 'alarm');
    } else if (category === 'habit') {
      await notificationService.addNotification('🧠 Habit Reminder (Test)', 'Routine Check: Keep your streak alive by scheduling mathematical puzzles.', 'habit');
    } else {
      await notificationService.addNotification('🔥 Streak Milestone! (Test)', 'Incredible! You are on a 5-day morning wake-up streak! Level Up!', 'progress');
    }
    setSnackbarMessage('Test notification generated in Notification Center! Check dashboard bell icon.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      {/* Theme selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.title, { color: paperTheme.colors.primary }]}>Appearance Theme</Text>
          <Text style={{ color: paperTheme.colors.onSurfaceVariant, marginBottom: 12, fontSize: 13 }}>
            Choose between light, dark, or automatic system matching.
          </Text>
          <SegmentedButtons
            value={themeMode}
            onValueChange={handleThemeChange}
            buttons={[
              { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
              { value: 'dark', label: 'Dark', icon: 'weather-night' },
              { value: 'system', label: 'System', icon: 'cellphone-link' },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Notification Categories */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.title, { color: paperTheme.colors.primary }]}>Notification Settings</Text>
          <Text style={{ color: paperTheme.colors.onSurfaceVariant, marginBottom: 12, fontSize: 13 }}>
            Enable or disable custom bedtime and routine reminders.
          </Text>

          <List.Item
            title="Bedtime Reminders"
            description="Wind down alerts before scheduled bedtime"
            left={props => <List.Icon {...props} icon="sleep" />}
            right={() => (
              <Switch
                value={notifSettings.bedtimeEnabled}
                onValueChange={() => handleToggle('bedtimeEnabled')}
                color={paperTheme.colors.primary}
              />
            )}
          />

          <List.Item
            title="Upcoming Alarm Alerts"
            description="Reminders of active morning alarms"
            left={props => <List.Icon {...props} icon="alarm" />}
            right={() => (
              <Switch
                value={notifSettings.alarmEnabled}
                onValueChange={() => handleToggle('alarmEnabled')}
                color={paperTheme.colors.primary}
              />
            )}
          />

          <List.Item
            title="Routine & Habit Reminders"
            description="Notification alerts if challenges are missed"
            left={props => <List.Icon {...props} icon="brain" />}
            right={() => (
              <Switch
                value={notifSettings.habitEnabled}
                onValueChange={() => handleToggle('habitEnabled')}
                color={paperTheme.colors.primary}
              />
            )}
          />

          <List.Item
            title="Streak & Progress Milestones"
            description="Congratulatory milestone updates"
            left={props => <List.Icon {...props} icon="fire" />}
            right={() => (
              <Switch
                value={notifSettings.progressEnabled}
                onValueChange={() => handleToggle('progressEnabled')}
                color={paperTheme.colors.primary}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Testing Center */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.title, { color: paperTheme.colors.primary }]}>Notification Testing Center</Text>
          <Text style={{ color: paperTheme.colors.onSurfaceVariant, marginBottom: 12, fontSize: 13 }}>
            Trigger a mock in-app notification to verify visual states.
          </Text>

          <View style={styles.btnGrid}>
            <Button compact mode="outlined" style={styles.testBtn} onPress={() => triggerTestNotification('bedtime')}>
              Bedtime
            </Button>
            <Button compact mode="outlined" style={styles.testBtn} onPress={() => triggerTestNotification('alarm')}>
              Alarm
            </Button>
            <Button compact mode="outlined" style={styles.testBtn} onPress={() => triggerTestNotification('habit')}>
              Habit
            </Button>
            <Button compact mode="outlined" style={styles.testBtn} onPress={() => triggerTestNotification('progress')}>
              Streak
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Account actions */}
      <Card style={styles.card}>
        <Card.Content style={{ alignItems: 'center' }}>
          <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 12, marginBottom: 16 }}>
            Logged in as Client | System Version 1.0.0
          </Text>
          <Button mode="contained" onPress={logout} buttonColor={paperTheme.colors.error} style={{ width: '100%' }}>
            Sign Out
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage(null)}
        duration={2000}
        style={{ backgroundColor: paperTheme.colors.secondary }}
      >
        {snackbarMessage}
      </Snackbar>
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
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  btnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  testBtn: {
    width: '48%',
    marginBottom: 10,
  },
});

export default SettingsScreen;
