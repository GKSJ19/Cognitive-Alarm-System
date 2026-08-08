import 'dart:async';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/foundation.dart';
import 'dart:io';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

class NotificationService {
  NotificationService._();

  static final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
  FlutterLocalNotificationsPlugin();

  static final _tapController = StreamController<String>.broadcast();
  static Stream<String> get onNotificationTap => _tapController.stream;

  static bool _pluginInitialized = false;

  /// Headless-safe initialization: timezone data + plugin registration
  /// only. Safe to call from a background isolate (e.g. BootReceiver's
  /// headless FlutterEngine on reboot), where there is no foreground UI
  /// to show a system permission dialog. Idempotent — safe to call
  /// multiple times; only does real work once per isolate.
  static Future<void> initializeHeadless() async {
    if (_pluginInitialized) return;

    tz.initializeTimeZones();
    final TimezoneInfo timeZoneInfo = await FlutterTimezone.getLocalTimezone();

    String timezone = timeZoneInfo.identifier;

    if (timezone == 'Asia/Calcutta') {
      timezone = 'Asia/Kolkata';
    }

    try {
      tz.setLocalLocation(tz.getLocation(timezone));
    } catch (e) {
      debugPrint('Unknown timezone: $timezone. Falling back to Asia/Kolkata');
      tz.setLocalLocation(tz.getLocation('Asia/Kolkata'));
    }

    const AndroidInitializationSettings androidSettings =
    AndroidInitializationSettings('@mipmap/ic_launcher');

    const WindowsInitializationSettings windowsSettings =
    WindowsInitializationSettings(
      appName: 'Cognitive Alarm Platform',
      appUserModelId: 'com.example.cognitive_alarm_platform',
      guid: '12345678-1234-1234-1234-123456789012',
    );

    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
      windows: windowsSettings,
    );

    await flutterLocalNotificationsPlugin.initialize(
      settings: settings,
      onDidReceiveNotificationResponse: _onTap,
      onDidReceiveBackgroundNotificationResponse: _onBackgroundTap,
    );

    _pluginInitialized = true;
  }

  /// Full initialization for normal (foreground) app launch: headless
  /// init above, plus notification-tap handling and the runtime
  /// permission prompts that require a visible UI.
  static Future<void> initialize() async {
    await initializeHeadless();

    final launchDetails =
    await flutterLocalNotificationsPlugin.getNotificationAppLaunchDetails();
    final payload = launchDetails?.notificationResponse?.payload;
    if ((launchDetails?.didNotificationLaunchApp ?? false) && payload != null) {
      scheduleMicrotask(() => _tapController.add(payload));
    }

    // These were defined below but never actually called anywhere in
    // the codebase — without them, Android never prompts the user for
    // notification or exact-alarm permission at runtime. Declaring the
    // permissions in the manifest is necessary but not sufficient; this
    // is what triggers the actual system permission dialogs. Without
    // this call, scheduled alarms silently do nothing even though the
    // scheduling code itself runs without error.
    await requestPermission();
    await requestExactAlarmPermission();
  }

  @pragma('vm:entry-point')
  static void _onTap(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null) _tapController.add(payload);
  }

  @pragma('vm:entry-point')
  static void _onBackgroundTap(NotificationResponse response) {

  }

  static Future<void> requestPermission() async {
    if (!Platform.isAndroid) return;

    await flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()?.requestNotificationsPermission();
  }

  static Future<void> requestExactAlarmPermission() async {
    if (!Platform.isAndroid) return;

    final android = flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

    final canSchedule = await android?.canScheduleExactNotifications();
    debugPrint("Can schedule exact notifications: $canSchedule");

    final status = await Permission.scheduleExactAlarm.status;
    debugPrint("Permission status: $status");

    if (!status.isGranted) {
      await Permission.scheduleExactAlarm.request();
    }
  }

  /// Prompts the user to exempt this app from battery optimization.
  /// Without this, OEM battery managers (Xiaomi/Samsung/Oppo especially)
  /// can kill scheduled alarms even when exactAllowWhileIdle is set
  /// correctly. Must be called from a foreground context with a visible
  /// UI — never from the headless boot-reschedule path.
  /// Requires REQUEST_IGNORE_BATTERY_OPTIMIZATIONS in AndroidManifest.xml.
  static Future<void> requestIgnoreBatteryOptimizations() async {
    if (!Platform.isAndroid) return;

    final status = await Permission.ignoreBatteryOptimizations.status;
    debugPrint("Battery optimization exemption status: $status");

    if (!status.isGranted) {
      await Permission.ignoreBatteryOptimizations.request();
    }
  }

  static Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledTime,
    String? payload,
    bool playSound = true,
    bool enableVibration = true,
  }) async {
    final tz.TZDateTime tzScheduledTime = tz.TZDateTime.from(scheduledTime, tz.local);

    debugPrint("Scheduling notification");
    debugPrint("ID: $id");
    debugPrint("Time: $tzScheduledTime");

    final AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'nuera_wake_channel',
      'Nuera Wake Alerts',
      channelDescription: 'Alerts that help you wake your mind, on schedule.',
      importance: Importance.max,
      priority: Priority.high,
      playSound: playSound,
      enableVibration: enableVibration,
      fullScreenIntent: true,
      category: AndroidNotificationCategory.alarm,
    );

    final NotificationDetails notificationDetails =
    NotificationDetails(android: androidDetails);

    await flutterLocalNotificationsPlugin.zonedSchedule(
      id: id,
      title: title,
      body: body,
      scheduledDate: tzScheduledTime,
      notificationDetails: notificationDetails,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      payload: payload,
    );
  }

  /// Shows a notification immediately — used for FCM foreground push
  /// messages, which arrive with no advance schedule (unlike alarms,
  /// which use scheduleNotification above).
  static Future<void> showImmediate({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'nuera_push_channel',
      'Nuera Push Notifications',
      channelDescription: 'Habit alerts and reminders pushed from the server.',
      importance: Importance.high,
      priority: Priority.high,
    );

    const NotificationDetails notificationDetails =
    NotificationDetails(android: androidDetails);


    await flutterLocalNotificationsPlugin.show(
      id: id,
      title: title,
      body: body,
      notificationDetails: notificationDetails,
      payload: payload,
    );
  }

  static Future<void> cancelNotification(int id) async {
    await flutterLocalNotificationsPlugin.cancel(id: id);
  }


  static int notificationIdFor(String alarmId) => alarmId.hashCode & 0x7FFFFFFF;
}