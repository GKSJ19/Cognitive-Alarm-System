import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  category: 'bedtime' | 'alarm' | 'habit' | 'progress';
}

export interface NotificationSettings {
  bedtimeEnabled: boolean;
  alarmEnabled: boolean;
  habitEnabled: boolean;
  progressEnabled: boolean;
}

const SETTINGS_KEY = 'notification_settings';
const NOTIFICATIONS_KEY = 'notification_logs';

export const notificationService = {
  async getSettings(): Promise<NotificationSettings> {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      bedtimeEnabled: true,
      alarmEnabled: true,
      habitEnabled: true,
      progressEnabled: true,
    };
  },

  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
  },

  async getNotifications(): Promise<AppNotification[]> {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  },

  async addNotification(title: string, content: string, category: AppNotification['category']): Promise<void> {
    try {
      const list = await this.getNotifications();
      const newNotif: AppNotification = {
        id: Math.random().toString(36).substring(7),
        title,
        content,
        timestamp: new Date().toISOString(),
        isRead: false,
        category,
      };
      
      // Keep up to 20 notifications
      const updated = [newNotif, ...list].slice(0, 20);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {}
  },

  async markAsRead(id: string): Promise<void> {
    try {
      const list = await this.getNotifications();
      const updated = list.map(n => n.id === id ? { ...n, isRead: true } : n);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {}
  },

  async markAllAsRead(): Promise<void> {
    try {
      const list = await this.getNotifications();
      const updated = list.map(n => ({ ...n, isRead: true }));
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {}
  },

  async clearNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    } catch (e) {}
  },

  async checkAndGenerate(profile: any, alarms: any[], history: any[]): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      const existing = await this.getNotifications();
      const todayStr = new Date().toISOString().split('T')[0];
      let generatedAny = false;

      // Helper to avoid generating duplicates on the same day
      const hasTodayCategory = (cat: string) => {
        return existing.some(n => n.category === cat && n.timestamp.startsWith(todayStr));
      };

      // 1. Bedtime Reminder
      if (settings.bedtimeEnabled && profile?.preferred_sleep_time && !hasTodayCategory('bedtime')) {
        const [sleepHr, sleepMin] = profile.preferred_sleep_time.split(':').map(Number);
        const now = new Date();
        const sleepTarget = new Date();
        sleepTarget.setHours(sleepHr, sleepMin, 0, 0);
        
        // Bedtime reminder 30 minutes before sleep
        const diffMs = sleepTarget.getTime() - now.getTime();
        const diffMins = diffMs / (1000 * 60);
        if (diffMins > 0 && diffMins <= 45) {
          await this.addNotification(
            '🌙 Wind Down Time',
            `Your bedtime is at ${profile.preferred_sleep_time}. Start winding down now for better sleep!`,
            'bedtime'
          );
          generatedAny = true;
        }
      }

      // 2. Upcoming Alarm
      if (settings.alarmEnabled && alarms.length > 0 && !hasTodayCategory('alarm')) {
        const activeAlarms = alarms.filter(a => a.is_active);
        if (activeAlarms.length > 0) {
          const next = [...activeAlarms].sort((a, b) => a.alarm_time.localeCompare(b.alarm_time))[0];
          await this.addNotification(
            '⏰ Upcoming Alarm',
            `Your next active alarm "${next.title}" is set for ${next.alarm_time}. Sleep well!`,
            'alarm'
          );
          generatedAny = true;
        }
      }

      // 3. Habit Reminder
      if (settings.habitEnabled && !hasTodayCategory('habit')) {
        const now = new Date();
        // Send a habit reminder at 8:00 PM (20:00) if they haven't solved an alarm today
        if (now.getHours() >= 20) {
          const solvedToday = history.some(h => {
            const dateStr = h.dismissed_at?.split('T')[0];
            return dateStr === todayStr && h.solved;
          });
          if (!solvedToday) {
            await this.addNotification(
              '🧠 Cognitive Routine Check',
              "You haven't completed any cognitive challenges today! Build your streak by scheduling alarms.",
              'habit'
            );
            generatedAny = true;
          }
        }
      }

      // 4. Progress / Streak Milestones
      if (settings.progressEnabled && history.length > 0 && !hasTodayCategory('progress')) {
        // Find consecutive wake-ups
        const uniqueDates = Array.from(new Set(
          history.map(h => h.dismissed_at?.split('T')[0]).filter(Boolean)
        )).sort();
        
        if (uniqueDates.length > 0) {
          const currentStreak = calculateStreak(uniqueDates);
          if (currentStreak > 0 && (currentStreak === 3 || currentStreak === 5 || currentStreak === 7)) {
            await this.addNotification(
              '🔥 Streak Milestone!',
              `Incredible consistency! You are on a ${currentStreak}-day morning wake-up streak! Keep it up.`,
              'progress'
            );
            generatedAny = true;
          }
        }
      }

      return generatedAny;
    } catch (e) {
      return false;
    }
  }
};

function calculateStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;
  
  let currentStreak = 1;
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Verify if last logged date is today or yesterday
  const lastLogged = sortedDates[sortedDates.length - 1];
  if (lastLogged !== todayStr && lastLogged !== yesterdayStr) {
    return 0;
  }
  
  for (let i = sortedDates.length - 1; i > 0; i--) {
    const d1 = new Date(sortedDates[i]);
    const d2 = new Date(sortedDates[i - 1]);
    const diffDays = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      currentStreak++;
    } else if (diffDays > 1) {
      break;
    }
  }
  
  return currentStreak;
}

export default notificationService;
