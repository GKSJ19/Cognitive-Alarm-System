import 'dart:async';

import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../core/errors/failures.dart';
import '../core/storage/hive_service.dart';
import '../features/alarm/models/alarm_model.dart';
import '../features/alarm/models/pending_sync_operation.dart';
import 'alarm_api_mapper.dart';


class AlarmRepository {
  final HiveService _hiveService;
  final ApiClient _apiClient;

  AlarmRepository({
    required HiveService hiveService,
    required ApiClient apiClient,
  })  : _hiveService = hiveService,
        _apiClient = apiClient;

  List<AlarmModel> getAllAlarms() {
    try {
      final alarms = _hiveService.getAllAlarms();
      alarms.sort((a, b) {
        final aMinutes = a.time.hour * 60 + a.time.minute;
        final bMinutes = b.time.hour * 60 + b.time.minute;
        return aMinutes.compareTo(bMinutes);
      });
      return alarms;
    } catch (e) {
      throw mapExceptionToFailure(e);
    }
  }

  AlarmModel? getAlarmById(String id) {
    try {
      return _hiveService.getAlarmById(id);
    } catch (e) {
      throw mapExceptionToFailure(e);
    }
  }

  Future<AlarmModel> createAlarm(AlarmModel alarm) async {
    try {
      await _hiveService.saveAlarm(alarm);
    } catch (e) {
      throw mapExceptionToFailure(e);
    }
    unawaited(_pushToBackend(alarm));
    return alarm;
  }

  Future<AlarmModel> updateAlarm(AlarmModel alarm) async {
    try {
      await _hiveService.saveAlarm(alarm);
    } catch (e) {
      throw mapExceptionToFailure(e);
    }
    unawaited(_pushToBackend(alarm));
    return alarm;
  }

  Future<void> deleteAlarm(String id) async {
    // Capture the backendId before deleting locally — once the Hive
    // record is gone, there's no way to look it back up.
    final backendId = getAlarmById(id)?.backendId;
    try {
      await _hiveService.deleteAlarm(id);
    } catch (e) {
      throw mapExceptionToFailure(e);
    }
    unawaited(_deleteFromBackend(localId: id, backendId: backendId));
  }

  Future<AlarmModel> toggleAlarm(String id) async {
    final alarm = getAlarmById(id);
    if (alarm == null) {
      throw const CacheFailure('Alarm not found');
    }
    return updateAlarm(alarm.copyWith(isEnabled: !alarm.isEnabled));
  }

  Future<void> _pushToBackend(AlarmModel alarm) async {
    // Once an alarm has a backendId, further syncs should be updates
    // against the existing backend record, not new creates (which
    // would otherwise mint a duplicate document server-side each time).
    final isUpdate = alarm.backendId != null;
    final payload = isUpdate
        ? AlarmApiMapper.toUpdateJson(alarm)
        : AlarmApiMapper.toCreateJson(alarm);

    try {
      final response = isUpdate
          ? await _apiClient.put(
        ApiEndpoints.alarmById(alarm.backendId!),
        data: payload,
      )
          : await _apiClient.post(ApiEndpoints.alarms, data: payload);

      final backendId = AlarmApiMapper.extractBackendId(response);
      if (backendId != null && backendId != alarm.backendId) {
        // Stamp the local record with its backend id so future
        // update/delete calls target the correct backend document.
        // Re-saving here (rather than returning it up) keeps this
        // reconciliation entirely internal to the sync path.
        await _hiveService.saveAlarm(alarm.copyWith(backendId: backendId));
      }
    } catch (_) {
      await _enqueue(PendingSyncOperation(
        alarmId: alarm.id,
        type: SyncOperationType.update,
        payload: payload,
        queuedAt: DateTime.now(),
      ));
    }
  }

  Future<void> _deleteFromBackend({
    required String localId,
    required String? backendId,
  }) async {
    if (backendId == null) {
      // Alarm never successfully synced to the backend in the first
      // place (e.g. created while offline and never pushed) — nothing
      // to delete server-side, and nothing to queue either.
      return;
    }
    try {
      await _apiClient.delete(ApiEndpoints.alarmById(backendId));
    } catch (_) {
      await _enqueue(PendingSyncOperation(
        alarmId: localId,
        type: SyncOperationType.delete,
        // backendId travels in the payload so drainPendingQueue can
        // still target the right backend record on retry — alarmId
        // alone isn't enough since it's the local id, not the backend's.
        payload: {'backendId': backendId},
        queuedAt: DateTime.now(),
      ));
    }
  }

  Future<void> _enqueue(PendingSyncOperation op) async {
    final box = _hiveService.pendingSyncBox;
    final existingKey = box.keys.cast<dynamic>().firstWhere(
          (k) => box.get(k)?.alarmId == op.alarmId,
      orElse: () => null,
    );
    if (existingKey != null) {
      await box.delete(existingKey);
    }
    if (op.type == SyncOperationType.delete) {
      final backendId = op.payload?['backendId'] as String?;

      if (backendId == null || backendId.isEmpty) {
        // Don't queue invalid delete operations.
        return;
      }
    }
    await box.add(op);
  }

  /// Drains queued backend operations. Call this when connectivity returns.
  Future<void> drainPendingQueue() async {
    final box = _hiveService.pendingSyncBox;
    final keys = box.keys.toList();
    for (final key in keys) {
      final op = box.get(key);
      if (op == null) continue;
      try {
        if (op.type == SyncOperationType.delete) {
          final backendId = op.payload?['backendId'] as String?;

          if (backendId == null || backendId.isEmpty) {
            // Invalid queued delete operation.
            // It never received a backend ID, so discard it.
            await box.delete(key);
            continue;
          }

          await _apiClient.delete(ApiEndpoints.alarmById(backendId));
        } else {
          await _apiClient.post(ApiEndpoints.alarms, data: op.payload);
        }
        await box.delete(key);
      } catch (_) {
        // still offline / backend still down — leave queued, retry later
      }
    }
  }
}