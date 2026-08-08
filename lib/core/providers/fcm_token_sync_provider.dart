import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_provider.dart';

final fcmTokenSyncProvider = Provider<void>((ref) {
  ref.listen(authStateProvider, (previous, next) {
    final user = next.value;
    if (user == null) return;

    FirebaseMessaging.instance.getToken().then((token) {
      if (token == null) return;
      _saveToken(uid: user.uid, token: token);
    });
  });

  // Also keep it fresh if the token rotates while already signed in.
  FirebaseMessaging.instance.onTokenRefresh.listen((token) {
    final uid = ref.read(authStateProvider).value?.uid;
    if (uid == null) return;
    _saveToken(uid: uid, token: token);
  });
});

Future<void> _saveToken({required String uid, required String token}) async {
  try {
    await FirebaseFirestore.instance
        .collection('users')
        .doc(uid)
        .set({'fcmToken': token}, SetOptions(merge: true));
  } catch (e) {
    if (kDebugMode) {
      debugPrint('Failed to save FCM token: $e');
    }
  }
}