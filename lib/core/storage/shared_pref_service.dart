import 'package:shared_preferences/shared_preferences.dart';

import '../errors/exceptions.dart';

class SharedPrefService {
  SharedPrefService._();
  static final SharedPrefService instance = SharedPrefService._();

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  SharedPreferences get _p {
    final prefs = _prefs;
    if (prefs == null) {
      throw const CacheException('SharedPrefService.init() must be called before use');
    }
    return prefs;
  }

  // ---- Keys ----
  static const _keyOnboardingComplete = 'onboarding_complete';
  static const _keyThemeMode = 'theme_mode'; // 'system' | 'light' | 'dark'

  // ---- Generic ----
  Future<void> setString(String key, String value) async {
    try {
      await _p.setString(key, value);
    } catch (e) {
      throw CacheException('Failed to write $key: $e');
    }
  }

  String? getString(String key) {
    try {
      return _p.getString(key);
    } catch (e) {
      throw CacheException('Failed to read $key: $e');
    }
  }

  Future<void> setBool(String key, bool value) async {
    try {
      await _p.setBool(key, value);
    } catch (e) {
      throw CacheException('Failed to write $key: $e');
    }
  }

  bool? getBool(String key) {
    try {
      return _p.getBool(key);
    } catch (e) {
      throw CacheException('Failed to read $key: $e');
    }
  }

  Future<void> remove(String key) async {
    try {
      await _p.remove(key);
    } catch (e) {
      throw CacheException('Failed to remove $key: $e');
    }
  }

  Future<void> clear() async {
    try {
      await _p.clear();
    } catch (e) {
      throw CacheException('Failed to clear preferences: $e');
    }
  }

  Future<void> setOnboardingComplete(bool complete) => setBool(_keyOnboardingComplete, complete);
  bool get onboardingComplete => getBool(_keyOnboardingComplete) ?? false;

  Future<void> setThemeMode(String mode) => setString(_keyThemeMode, mode);
  String? get themeMode => getString(_keyThemeMode);
}