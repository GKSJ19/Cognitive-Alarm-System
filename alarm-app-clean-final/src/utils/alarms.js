import { Platform } from 'react-native';
import notifee, {
  AndroidImportance,
  AndroidCategory,
  TriggerType,
  TimestampTrigger,
  AndroidNotificationSetting,
} from '@notifee/react-native';

const CHANNEL_ID = 'alarm-channel';

export async function ensurePermissions() {
  await notifee.requestPermission();

  if (Platform.OS === 'android') {
    // Android 12+ requires the user to explicitly allow exact alarms.
    const settings = await notifee.getNotificationSettings();
    if (
      settings.android.alarm !== AndroidNotificationSetting.ENABLED
    ) {
      await notifee.openAlarmPermissionSettings();
    }

    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Alarms',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  }
}

// Schedules a real OS-level alarm. On Android this fires even if the app
// is fully closed/killed and shows a full-screen puzzle prompt over the
// lock screen. On iOS this becomes a local notification with sound; it
// will NOT bypass silent mode/DND without Apple's Critical Alerts
// entitlement, which is granted case-by-case and rarely for consumer apps.
export async function scheduleAlarm(alarm) {
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: alarm.timestamp, // ms since epoch, next fire time
    alarmManager:
      Platform.OS === 'android'
        ? { allowWhileIdle: true }
        : undefined,
  };

  await notifee.createTriggerNotification(
    {
      id: alarm.id,
      title: 'Alarm',
      body: 'Solve the puzzle to dismiss',
      data: { alarmId: alarm.id, level: String(alarm.level ?? 2) },
      android: {
        channelId: CHANNEL_ID,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        fullScreenAction: {
          id: 'default', // opens the app to the Puzzle screen
        },
        pressAction: { id: 'default' },
        loopSound: true,
        ongoing: true,
        autoCancel: false,
      },
      ios: {
        sound: 'default',
        critical: false, // set true only if you obtain the entitlement
        interruptionLevel: 'timeSensitive',
      },
    },
    trigger
  );
}

export async function cancelAlarm(id) {
  await notifee.cancelTriggerNotification(id);
}
