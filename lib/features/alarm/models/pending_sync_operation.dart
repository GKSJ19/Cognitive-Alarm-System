import 'package:hive/hive.dart';

enum SyncOperationType { create, update, delete }

class PendingSyncOperation {
  final String alarmId;
  final SyncOperationType type;
  final Map<String, dynamic>? payload; // null for delete
  final DateTime queuedAt;

  PendingSyncOperation({
    required this.alarmId,
    required this.type,
    this.payload,
    required this.queuedAt,
  });
}

class PendingSyncOperationAdapter extends TypeAdapter<PendingSyncOperation> {
  @override
  final int typeId = 5; // confirm this doesn't collide with an existing adapter

  @override
  PendingSyncOperation read(BinaryReader reader) {
    final numFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numFields; i++) reader.readByte(): reader.read(),
    };
    return PendingSyncOperation(
      alarmId: fields[0] as String,
      type: SyncOperationType.values[fields[1] as int],
      payload: (fields[2] as Map?)?.cast<String, dynamic>(),
      queuedAt: fields[3] as DateTime,
    );
  }

  @override
  void write(BinaryWriter writer, PendingSyncOperation obj) {
    writer
      ..writeByte(4)
      ..writeByte(0)
      ..write(obj.alarmId)
      ..writeByte(1)
      ..write(obj.type.index)
      ..writeByte(2)
      ..write(obj.payload)
      ..writeByte(3)
      ..write(obj.queuedAt);
  }
}