import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/api_client.dart';
import '../core/storage/shared_pref_service.dart';
import '../core/storage/secure_storage_service.dart';
import '../core/storage/hive_service.dart';
import '../repositories/alarm_repository.dart';
import '../features/alarm/services/alarm_sync_service.dart';


final sharedPrefServiceProvider = Provider<SharedPrefService>((ref) {
  return SharedPrefService.instance;
});

final secureStorageServiceProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

final hiveServiceProvider = Provider<HiveService>((ref) {
  return HiveService.instance;
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    getAccessToken: () async => ref.read(secureStorageServiceProvider).accessToken,
  );
});
final alarmRepositoryProvider = Provider<AlarmRepository>((ref) {
  return AlarmRepository(
    hiveService: ref.watch(hiveServiceProvider),
    apiClient: ref.watch(apiClientProvider),
  );
});

final alarmSyncServiceProvider = Provider<AlarmSyncService>((ref) {
  final service = AlarmSyncService(
    repository: ref.watch(alarmRepositoryProvider),
  );
  service.start();
  ref.onDispose(() => service.dispose());
  return service;
});