import { Platform } from 'react-native';

type AlarmData = {
  _id?: string;
  label: string;
  time: string; // HH:MM
  alarm_type: string;
  days_active: number[];
  is_active: boolean;
  sound_name: string;
  snooze_duration: number;
  vibration: boolean;
  snooze_enabled: boolean;
};

type NavigateFn = (screen: string, params?: any) => void;

class AlarmSchedulerService {
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private firedAlarms: Set<string> = new Set(); // track already fired alarms this minute
  private navigate: NavigateFn | null = null;

  setNavigate(fn: NavigateFn) {
    this.navigate = fn;
  }

  start(getAlarms: () => AlarmData[]) {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(() => {
      const now = new Date();
      const currentHH = String(now.getHours()).padStart(2, '0');
      const currentMM = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHH}:${currentMM}`;
      const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1; // convert to Mon=0..Sun=6

      const alarms = getAlarms();

      for (const alarm of alarms) {
        if (!alarm.is_active) continue;
        if (alarm.time !== currentTime) continue;

        const fireKey = `${alarm._id}-${currentTime}`;
        if (this.firedAlarms.has(fireKey)) continue;

        // Check if today is a valid day for this alarm
        let shouldRing = false;
        if (alarm.alarm_type === 'daily') {
          shouldRing = true;
        } else if (alarm.alarm_type === 'weekday') {
          shouldRing = currentDay <= 4; // Mon-Fri
        } else if (alarm.alarm_type === 'weekend') {
          shouldRing = currentDay >= 5; // Sat-Sun
        } else if (alarm.alarm_type === 'one-time') {
          shouldRing = alarm.days_active.includes(currentDay);
        }

        if (shouldRing) {
          this.firedAlarms.add(fireKey);
          this.ringAlarm(alarm);
        }
      }

      // Clear fired set each minute
      if (now.getSeconds() === 59) {
        this.firedAlarms.clear();
      }
    }, 5000); // check every 5 seconds
  }

  private ringAlarm(alarm: AlarmData) {
    if (this.navigate) {
      this.navigate('AlarmRing', { alarm });
    }
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const alarmScheduler = new AlarmSchedulerService();
