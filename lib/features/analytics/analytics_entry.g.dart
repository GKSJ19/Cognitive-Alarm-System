// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'analytics_entry.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AnalyticsEntryAdapter extends TypeAdapter<AnalyticsEntry> {
  @override
  final int typeId = 1;

  @override
  AnalyticsEntry read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return AnalyticsEntry(
      id: fields[0] as String,
      alarmId: fields[1] as String,
      categoryKey: fields[2] as String,
      attempts: fields[3] as int,
      scheduledTime: fields[4] as DateTime,
      dismissedAt: fields[5] as DateTime,
    );
  }

  @override
  void write(BinaryWriter writer, AnalyticsEntry obj) {
    writer
      ..writeByte(6)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.alarmId)
      ..writeByte(2)
      ..write(obj.categoryKey)
      ..writeByte(3)
      ..write(obj.attempts)
      ..writeByte(4)
      ..write(obj.scheduledTime)
      ..writeByte(5)
      ..write(obj.dismissedAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AnalyticsEntryAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
