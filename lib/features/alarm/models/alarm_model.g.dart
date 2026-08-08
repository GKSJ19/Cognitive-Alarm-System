

part of 'alarm_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AlarmModelAdapter extends TypeAdapter<AlarmModel> {
  @override
  final int typeId = 0;

  @override
  AlarmModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return AlarmModel(
      id: fields[0] as String,
      time: fields[1] as DateTime,
      label: fields[2] as String,
      challengeType: fields[3] as String,
      vibration: fields[4] as bool,
      sound: fields[5] as bool,
      isEnabled: fields[6] as bool,
      repeatDays: (fields[7] as List).cast<int>(),
      soundPath: fields[8] as String?,
      backendId: fields[9] as String?,
      difficulty: fields[10] as String? ?? 'Medium',
      isAdaptive: fields[11] as bool? ?? false,
      scheduledVia: fields[12] as String? ?? 'device',
    );
  }

  @override
  void write(BinaryWriter writer, AlarmModel obj) {
    writer
      ..writeByte(13)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.time)
      ..writeByte(2)
      ..write(obj.label)
      ..writeByte(3)
      ..write(obj.challengeType)
      ..writeByte(4)
      ..write(obj.vibration)
      ..writeByte(5)
      ..write(obj.sound)
      ..writeByte(6)
      ..write(obj.isEnabled)
      ..writeByte(7)
      ..write(obj.repeatDays)
      ..writeByte(8)
      ..write(obj.soundPath)
      ..writeByte(9)
      ..write(obj.backendId)
      ..writeByte(10)
      ..write(obj.difficulty)
      ..writeByte(11)
      ..write(obj.isAdaptive)
      ..writeByte(12)
      ..write(obj.scheduledVia);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
          other is AlarmModelAdapter &&
              runtimeType == other.runtimeType &&
              typeId == other.typeId;
}