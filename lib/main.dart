import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:android_alarm_manager_plus/android_alarm_manager_plus.dart';
import 'package:flutter/foundation.dart' show kDebugMode, debugPrint, debugPrintStack;
import 'package:hive_flutter/hive_flutter.dart';


import 'app.dart';
import 'firebase_options.dart';
import 'core/services/notification_service.dart';
import 'core/services/alarm_scheduler.dart';
import 'core/services/fcm_service.dart';
import 'core/storage/shared_pref_service.dart';
import 'core/storage/hive_service.dart';
import 'core/services/boot_reschedule.dart';
import 'dart:ui' as ui;
import 'core/storage/secure_storage_service.dart';
import 'features/analytics/analytics_service.dart';
import 'providers/core_providers.dart';
import 'core/providers/auth_provider.dart';

@pragma('vm:entry-point')
void rescheduleAlarmsCallback() {
  WidgetsFlutterBinding.ensureInitialized();
  // Headless init only — this runs in BootReceiver's standalone
  // FlutterEngine with no foreground UI, so we must NOT call the full
  // NotificationService.initialize() here: it triggers permission
  // request dialogs, which need an Activity and will crash or silently
  // fail in this context. initializeHeadless() does just the timezone
  // setup + plugin registration that scheduleNotification() needs.
  NotificationService.initializeHeadless().then((_) {
    AlarmScheduler.rescheduleAll();
  });
}

Future<void> _registerBootCallbackHandle() async {
  if (!Platform.isAndroid) return;

  final handle = ui.PluginUtilities.getCallbackHandle(
    rescheduleAlarmsCallback,
  );
  if (handle == null) return;

  final prefs = await SharedPreferences.getInstance();
  await prefs.setInt(
    'reschedule_callback_handle',
    handle.toRawHandle(),
  );
}

Future<void> main() async {
  runZonedGuarded(_bootstrap, (error, stack) {
    // Anything thrown inside an async gap that nothing else caught —
    // e.g. an exception inside GoRouter's async `redirect` callback —
    // used to disappear silently (no snackbar, no error screen, the
    // navigation just never completed). Logging it here turns that
    // class of bug back into something visible in the console instead
    // of "app is stuck, no idea why."
    debugPrint('Uncaught zone error: $error');
    debugPrintStack(stackTrace: stack);
  });
}

Future<void> _bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();

  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    debugPrint('Uncaught Flutter error: ${details.exception}');
    debugPrintStack(stackTrace: details.stack);
  };

  await SharedPrefService.instance.init();
  await HiveService.instance.init();

// TEMPORARY - Remove after running once
  await HiveService.instance.pendingSyncBox.clear();
  await Hive.openBox('recommendationsCache');
  await AnalyticsService.instance.init();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  await NotificationService.initialize();

  final container = ProviderContainer();

  // Product requirement: no persistent session. Every app launch must
  // land on Login, never auto-resume into Home. Rather than special-
  // casing this in SplashScreen or the router's redirect (which would
  // leave any OTHER guarded route — e.g. a deep link straight into
  // /coach-dashboard — still able to see a stale valid session and let
  // it through), we wipe the session at the true single entry point:
  // before anything in the widget tree runs. This clears both auth
  // systems the app has (Firebase, for Google sign-in; and the secure-
  // storage JWT pair, for email/password) via the same logout() used by
  // the Sign Out button, so isLoggedIn is guaranteed false on every
  // fresh launch, for every route, with no route-specific logic to keep
  // in sync.
  try {
    await container.read(authRepositoryProvider).logout();
  } catch (e, st) {
    // Must never block app startup — if this throws, the app should
    // still launch. isLoggedIn()'s own try/catch (see auth_repository.dart)
    // is the fallback safety net for whatever state this leaves behind.
    debugPrint('Startup session clear failed: $e');
    debugPrintStack(stackTrace: st);
  }

  if (Platform.isAndroid) {
    await AndroidAlarmManager.initialize();
    await _registerBootCallbackHandle();
    await AlarmScheduler.rescheduleAll();
  }

  container.read(alarmSyncServiceProvider);

  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const NueraApp(),
    ),
  );
}