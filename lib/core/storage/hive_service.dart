import 'package:hive_flutter/hive_flutter.dart';

import '../../features/alarm/models/alarm_model.dart';
import '../../features/alarm/models/pending_sync_operation.dart';
import '../errors/exceptions.dart';


class HiveService {
  HiveService._();
  static final HiveService instance = HiveService._();

  static const String _alarmsBoxName = 'alarms';
  static const String pendingSyncBoxName = 'pending_sync_queue';

  Box<AlarmModel>? _alarmsBox;
  Box<PendingSyncOperation>? _pendingSyncBox;


  Future<void> init() async {
    await Hive.initFlutter();
    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(AlarmModelAdapter());
    }
    if (!Hive.isAdapterRegistered(5)) {
      Hive.registerAdapter(PendingSyncOperationAdapter());
    }
    _alarmsBox = await Hive.openBox<AlarmModel>(_alarmsBoxName);
    _pendingSyncBox =
    await Hive.openBox<PendingSyncOperation>(pendingSyncBoxName);
  }

  Box<AlarmModel> get _box {
    final box = _alarmsBox;
    if (box == null) {
      throw const CacheException(
        'HiveService.init() must be called before use',
      );
    }
    return box;
  }

  Box<PendingSyncOperation> get pendingSyncBox {
    final box = _pendingSyncBox;
    if (box == null) {
      throw const CacheException(
        'HiveService.init() must be called before use',
      );
    }
    return box;
  }

  List<AlarmModel> getAllAlarms() {
    try {
      return _box.values.toList();
    } catch (e) {
      throw CacheException('Failed to read alarms: $e');
    }
  }

  AlarmModel? getAlarmById(String id) {
    try {
      return _box.get(id);
    } catch (e) {
      throw CacheException('Failed to read alarm $id: $e');
    }
  }

  Future<void> saveAlarm(AlarmModel alarm) async {
    try {
      await _box.put(alarm.id, alarm);
    } catch (e) {
      throw CacheException('Failed to save alarm ${alarm.id}: $e');
    }
  }

  Future<void> deleteAlarm(String id) async {
    try {
      await _box.delete(id);
    } catch (e) {
      throw CacheException('Failed to delete alarm $id: $e');
    }
  }
}