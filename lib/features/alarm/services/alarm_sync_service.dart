import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../../repositories/alarm_repository.dart';

class AlarmSyncService {
  final AlarmRepository _repository;
  final Connectivity _connectivity;
  StreamSubscription<List<ConnectivityResult>>? _subscription;
  bool _isDraining = false;

  AlarmSyncService({
    required AlarmRepository repository,
    Connectivity? connectivity,
  })  : _repository = repository,
        _connectivity = connectivity ?? Connectivity();

  void start() {
    _tryDrain();
    _subscription = _connectivity.onConnectivityChanged.listen((results) {
      final isOnline = results.any((r) => r != ConnectivityResult.none);
      if (isOnline) {
        _tryDrain();
      }
    });
  }

  Future<void> _tryDrain() async {
    if (_isDraining) return;
    _isDraining = true;
    try {
      await _repository.drainPendingQueue();
    } finally {
      _isDraining = false;
    }
  }

  void dispose() {
    _subscription?.cancel();
  }
}