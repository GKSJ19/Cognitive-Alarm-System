import 'dart:io';
import 'package:flutter/services.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';


@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {

  if (kDebugMode) {
    debugPrint('FCM background message: ${message.messageId}');
  }
}

class FcmService {
  FcmService._();

  static final FcmService instance = FcmService._();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;


  Future<void> init({
    void Function(String token)? onTokenReady,
    void Function(RemoteMessage message)? onForegroundMessage,
    void Function(RemoteMessage message)? onMessageOpenedApp,
  }) async {
// Skip Firebase Messaging on unsupported desktop platforms.
    if (!kIsWeb &&
        !(Platform.isAndroid || Platform.isIOS || Platform.isMacOS)) {
      if (kDebugMode) {
        debugPrint('FCM is not supported on this platform.');
      }
      return;
    }

    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (kDebugMode) {
      debugPrint('FCM permission status: ${settings.authorizationStatus}');
    }

    try {
      final token = await _messaging.getToken();

      if (kDebugMode) {
        debugPrint('FCM Token: $token');
      }

      if (token != null) {
        onTokenReady?.call(token);
      }

      _messaging.onTokenRefresh.listen((newToken) {
        onTokenReady?.call(newToken);
      });
    } on MissingPluginException {
      if (kDebugMode) {
        debugPrint('FCM getToken() is not supported on this platform.');
      }
    }

    FirebaseMessaging.onMessage.listen((message) {
      if (kDebugMode) {
        debugPrint(
          'FCM foreground message: ${message.notification?.title}',
        );
      }
      onForegroundMessage?.call(message);
    });

    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      onMessageOpenedApp?.call(message);
    });

    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      onMessageOpenedApp?.call(initialMessage);
    }
  }
}