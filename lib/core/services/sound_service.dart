import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';

class SoundService {
  SoundService._internal();
  static final SoundService instance = SoundService._internal();

  final AudioPlayer _player = AudioPlayer();
  bool _isPlaying = false;

  // ⚠️ FIXED: was 'sounds/alarm_default.mp3', which doesn't exist in
  // assets/sounds/ — that mismatch is why alarms weren't ringing.
  static const String _defaultAlarmAsset = 'sounds/classic-alarm.wav';

  bool get isPlaying => _isPlaying;

  Future<void> playAlarmSound({String? assetPath}) async {
    if (_isPlaying) return;
    _isPlaying = true;
    try {
      await _player.setReleaseMode(ReleaseMode.loop);
      await _player.play(AssetSource(assetPath ?? _defaultAlarmAsset));
    } catch (e) {
      // Previously silent — now logged so a bad asset path surfaces
      // instead of failing invisibly.
      if (kDebugMode) {
        debugPrint('SoundService: failed to play alarm sound "$assetPath": $e');
      }
      _isPlaying = false;
    }
  }

  Future<void> stopAlarmSound() async {
    if (!_isPlaying) return;
    _isPlaying = false;
    await _player.stop();
  }

  Future<void> dispose() async {
    await _player.dispose();
  }
}