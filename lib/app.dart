import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/themes/app_theme.dart';
import 'core/routes/app_router.dart';
import 'core/services/notification_service.dart';
import 'core/storage/hive_service.dart';
import 'core/providers/fcm_token_sync_provider.dart';
import 'features/alarm/screens/alarm_ringing_screen.dart';
import 'package:cognitive_alarm_platform/core/providers/theme_provider.dart';
import 'package:cognitive_alarm_platform/core/widgets/theme_toggle_switch.dart';

class NueraApp extends ConsumerStatefulWidget {
  const NueraApp({super.key});

  @override
  ConsumerState<NueraApp> createState() => _NueraAppState();
}

class _NueraAppState extends ConsumerState<NueraApp> {
  StreamSubscription<String>? _tapSubscription;

  @override
  void initState() {
    super.initState();

    _tapSubscription = NotificationService.onNotificationTap.listen(_openAlarm);
  }

  @override
  void dispose() {
    _tapSubscription?.cancel();
    super.dispose();
  }

  void _openAlarm(String alarmId) {
    final alarm = HiveService.instance.getAlarmById(alarmId);
    if (alarm == null) return;

    final navigator = rootNavigatorKey.currentState;
    if (navigator == null) return;

    navigator.push(
      MaterialPageRoute(
        builder: (_) => AlarmRingingScreen(alarm: alarm),
        fullscreenDialog: true,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(goRouterProvider);

    ref.watch(fcmTokenSyncProvider);

    final themeMode = ref.watch(themeModeProvider);
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Nuera — Wake your mind',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}