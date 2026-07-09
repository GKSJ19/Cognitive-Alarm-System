import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/models.dart';

/// Thin wrapper so the fallback beep (used only if the bundled alarm.mp3
/// asset is missing or fails to play) reads clearly at the call site.
class SystemSoundFallback {
  static void play() => SystemSound.play(SystemSoundType.alert);
}

/// App-wide state: mock authentication + per-user alarms/log/streak +
/// live puzzle session state while an alarm is ringing.
///
/// NOTE: authentication here is an in-memory mock for prototyping the UX.
/// It is NOT secure and resets on app restart. Replace with real calls to
/// the User Service (see backend architecture doc) before shipping.
class AppState extends ChangeNotifier {
  // ---- mock auth store ----
  final Map<String, String> _users = {}; // username -> password
  final Map<String, UserData> _dataStore = {};
  String? currentUser;

  // ---- live clock ----
  TimeOfDay now = TimeOfDay.now();
  Timer? _clockTimer;

  // ---- active puzzle session (non-null while an alarm is ringing) ----
  PuzzleSession? activeSession;

  AppState() {
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
  }

  UserData get data => _dataStore[currentUser!]!;

  // ---------------- AUTH ----------------
  String? register(String username, String password, String confirm) {
    if (username.trim().isEmpty || password.isEmpty) {
      return 'Username and password are required.';
    }
    if (password.length < 4) return 'Password must be at least 4 characters.';
    if (password != confirm) return 'Passwords do not match.';
    if (_users.containsKey(username)) return 'That username is already taken.';
    _users[username] = password;
    _dataStore[username] = UserData();
    _loginAs(username);
    return null;
  }

  String? login(String username, String password) {
    if (!_users.containsKey(username)) return 'No account with that username. Register first.';
    if (_users[username] != password) return 'Incorrect password.';
    _loginAs(username);
    return null;
  }

  void _loginAs(String username) {
    currentUser = username;
    _dataStore.putIfAbsent(username, () => UserData());
    notifyListeners();
  }

  void logout() {
    currentUser = null;
    activeSession = null;
    notifyListeners();
  }

  // ---------------- CLOCK / SCHEDULING ----------------
  void _tick() {
    now = TimeOfDay.now();
    if (currentUser != null) _checkAlarms();
    notifyListeners();
  }

  void _checkAlarms() {
    final key = '${now.hour}:${now.minute}';
    for (final alarm in data.alarms) {
      if (alarm.active && alarm.time.hour == now.hour && alarm.time.minute == now.minute) {
        if (alarm.lastFiredKey != key) {
          alarm.lastFiredKey = key;
          fireAlarm(alarm.mode);
        }
      }
    }
  }

  // ---------------- ALARM CRUD ----------------
  void addAlarm(TimeOfDay time, PuzzleMode mode) {
    data.alarms.add(Alarm(id: DateTime.now().microsecondsSinceEpoch.toString(), time: time, mode: mode));
    notifyListeners();
  }

  void toggleAlarm(String id) {
    final alarm = data.alarms.firstWhere((a) => a.id == id);
    alarm.active = !alarm.active;
    notifyListeners();
  }

  // ---------------- PUZZLE / ALARM RINGING ----------------
  /// Manually trigger a test alarm, e.g. from a "Test alarm now" button,
  /// using whichever puzzle mode the user has selected in the add-alarm form.
  void fireAlarm(PuzzleMode mode) {
    activeSession = PuzzleSession(mode: mode);
    activeSession!.rollPuzzle();
    _startBeeping(); // fire-and-forget; playback starts as soon as it's ready
    notifyListeners();
  }

  Timer? _beepTimer;
  final AudioPlayer _alarmPlayer = AudioPlayer();

  Future<void> _startBeeping() async {
    try {
      await _alarmPlayer.stop();
      await _alarmPlayer.setReleaseMode(ReleaseMode.loop);
      await _alarmPlayer.play(AssetSource('audio/alarm.mp3'), volume: 1.0);
    } catch (e) {
      // If the asset is missing or playback fails, fall back to a repeating
      // system alert sound so the alarm still makes *some* noise.
      _beepTimer?.cancel();
      _beepTimer = Timer.periodic(const Duration(milliseconds: 700), (_) {
        SystemSoundFallback.play();
      });
    }
  }

  Future<void> _stopBeeping() async {
    _beepTimer?.cancel();
    _beepTimer = null;
    try {
      await _alarmPlayer.stop();
    } catch (_) {}
  }

  /// Submits an answer for a math puzzle. Returns true if correct.
  bool submitMathAnswer(int value) {
    final session = activeSession!;
    if (value == session.currentMathAnswer) {
      _resolveSession(session);
      return true;
    }
    session.registerWrong();
    session.rollPuzzle();
    notifyListeners();
    return false;
  }

  /// Registers one tapped tile index for the memory puzzle.
  /// Returns 'wrong', 'progress', or 'solved'.
  String submitMemoryTap(int index) {
    final session = activeSession!;
    session.memoryUserSeq.add(index);
    final pos = session.memoryUserSeq.length - 1;
    if (session.memoryUserSeq[pos] != session.memorySequence[pos]) {
      session.registerWrong();
      session.rollPuzzle();
      notifyListeners();
      return 'wrong';
    }
    if (session.memoryUserSeq.length == session.memorySequence.length) {
      _resolveSession(session);
      return 'solved';
    }
    notifyListeners();
    return 'progress';
  }

  void _resolveSession(PuzzleSession session) {
    _stopBeeping();
    final solveSeconds = DateTime.now().difference(session.startedAt).inSeconds;
    final engagement = (100 - session.wrongAttempts * 12 - max(0, 8 - solveSeconds) * 3).clamp(20, 100);
    data.log.insert(
      0,
      WakeLogEntry(
        time: DateTime.now(),
        solveSeconds: solveSeconds,
        wrongAttempts: session.wrongAttempts,
        engagementScore: engagement,
      ),
    );
    if (data.log.length > 8) data.log.removeLast();
    data.streak += 1;
    activeSession = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _clockTimer?.cancel();
    _beepTimer?.cancel();
    _alarmPlayer.dispose();
    super.dispose();
  }
}

/// Holds all state for one in-progress alarm-dismiss puzzle session.
/// Puzzle type is re-rolled from [mode] on every attempt, which is what
/// guarantees "Memory only" alarms never silently show a math puzzle.
class PuzzleSession {
  final PuzzleMode mode;
  final DateTime startedAt = DateTime.now();
  final Random _rand = Random();

  int difficulty = 1;
  int wrongAttempts = 0;

  late PuzzleKind currentKind;
  int currentMathAnswer = 0;
  String currentMathQuestion = '';

  List<int> memorySequence = [];
  List<int> memoryUserSeq = [];

  PuzzleSession({required this.mode});

  void registerWrong() {
    wrongAttempts++;
    difficulty = min(5, difficulty + 1);
  }

  void rollPuzzle() {
    currentKind = _pickKind();
    if (currentKind == PuzzleKind.math) {
      _generateMath();
    } else {
      _generateMemory();
    }
  }

  PuzzleKind _pickKind() {
    switch (mode) {
      case PuzzleMode.math:
        return PuzzleKind.math;
      case PuzzleMode.memory:
        return PuzzleKind.memory;
      case PuzzleMode.mixed:
        return _rand.nextBool() ? PuzzleKind.math : PuzzleKind.memory;
    }
  }

  int _randInt(int min, int max) => min + _rand.nextInt(max - min + 1);

  void _generateMath() {
    final d = difficulty;
    int a, b, c, answer;
    String q;
    switch (d) {
      case 1:
        a = _randInt(2, 9);
        b = _randInt(2, 9);
        answer = a + b;
        q = '$a + $b';
        break;
      case 2:
        a = _randInt(3, 12);
        b = _randInt(2, 9);
        answer = a - b;
        q = '$a − $b';
        break;
      case 3:
        a = _randInt(3, 9);
        b = _randInt(2, 9);
        answer = a * b;
        q = '$a × $b';
        break;
      case 4:
        a = _randInt(2, 9);
        b = _randInt(2, 9);
        c = _randInt(2, 9);
        answer = a * b + c;
        q = '$a × $b + $c';
        break;
      default:
        a = _randInt(2, 9);
        b = _randInt(2, 9);
        c = _randInt(2, 6);
        answer = (a + b) * c;
        q = '($a + $b) × $c';
    }
    currentMathAnswer = answer;
    currentMathQuestion = q;
  }

  void _generateMemory() {
    final len = 3 + difficulty;
    memorySequence = List.generate(len, (_) => _randInt(0, 8));
    memoryUserSeq = [];
  }
}

enum PuzzleKind { math, memory }
