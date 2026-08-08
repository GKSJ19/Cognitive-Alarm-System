import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/env_config.dart';
import '../errors/network_exceptions.dart';

class ApiClient {
  ApiClient({required Future<String?> Function() getAccessToken})
      : _dio = _buildDio(getAccessToken);

  final Dio _dio;

  Future<bool> Function()? onUnauthorized;

  static Dio _buildDio(Future<String?> Function() getAccessToken) {
    final dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        sendTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: const {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await getAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );

    if (kDebugMode) {
      dio.interceptors.add(
        LogInterceptor(requestBody: true, responseBody: true, responseHeader: false),
      );
    }

    return dio;
  }

  Future<Map<String, dynamic>> get(
      String path, {
        Map<String, dynamic>? queryParameters,
      }) {
    return _get(path, queryParameters: queryParameters, isRetry: false);
  }

  Future<Map<String, dynamic>> _get(
      String path, {
        Map<String, dynamic>? queryParameters,
        required bool isRetry,
      }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return _asMap(response.data);
    } on DioException catch (e) {
      if (await _shouldRetryAfterRefresh(e, isRetry)) {
        return _get(path, queryParameters: queryParameters, isRetry: true);
      }
      throw _mapError(e);
    }
  }

  // options is new — lets callers (e.g. the OAuth2 form-encoded login
  // endpoint) override the default JSON content type without every
  // other repository needing to know or care.
  Future<Map<String, dynamic>> post(String path, {Map<String, dynamic>? data, Options? options}) {
    return _post(path, data: data, options: options, isRetry: false);
  }

  Future<Map<String, dynamic>> _post(
      String path, {
        Map<String, dynamic>? data,
        Options? options,
        required bool isRetry,
      }) async {
    try {
      final response = await _dio.post(path, data: data, options: options);
      return _asMap(response.data);
    } on DioException catch (e) {
      if (await _shouldRetryAfterRefresh(e, isRetry)) {
        return _post(path, data: data, options: options, isRetry: true);
      }
      throw _mapError(e);
    }
  }

  Future<Map<String, dynamic>> put(String path, {Map<String, dynamic>? data}) {
    return _put(path, data: data, isRetry: false);
  }

  Future<Map<String, dynamic>> _put(
      String path, {
        Map<String, dynamic>? data,
        required bool isRetry,
      }) async {
    try {
      final response = await _dio.put(path, data: data);
      return _asMap(response.data);
    } on DioException catch (e) {
      if (await _shouldRetryAfterRefresh(e, isRetry)) {
        return _put(path, data: data, isRetry: true);
      }
      throw _mapError(e);
    }
  }

  Future<void> delete(String path) {
    return _delete(path, isRetry: false);
  }

  Future<void> _delete(String path, {required bool isRetry}) async {
    try {
      await _dio.delete(path);
    } on DioException catch (e) {
      if (await _shouldRetryAfterRefresh(e, isRetry)) {
        return _delete(path, isRetry: true);
      }
      throw _mapError(e);
    }
  }

  Future<bool> _shouldRetryAfterRefresh(DioException e, bool isRetry) async {
    if (isRetry) return false;
    if (e.response?.statusCode != 401) return false;
    final handler = onUnauthorized;
    if (handler == null) return false;
    return handler();
  }

  Map<String, dynamic> _asMap(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    return {'data': data};
  }

  Exception _mapError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.transformTimeout:
        return const ApiTimeoutException(
          'The request timed out. Check your connection and try again.',
        );
      case DioExceptionType.connectionError:
        return const NetworkException(
          "Couldn't reach the server. Check that the API base URL is correct "
              "and the backend is reachable.",
        );
      case DioExceptionType.badResponse:
        final status = e.response?.statusCode ?? 0;
        final serverMessage = _extractMessage(e.response?.data);
        if (status == 401) {
          return UnauthorizedException(serverMessage ?? 'Session expired. Please log in again.');
        }
        if (status >= 500) {
          return ServerException(serverMessage ?? 'Server error ($status). Please try again later.');
        }
        return ApiException(serverMessage ?? 'Request failed ($status).');
      case DioExceptionType.cancel:
        return const ApiException('Request was cancelled.');
      case DioExceptionType.badCertificate:
        return const NetworkException('Could not verify the server\'s security certificate.');
      default:
        return ApiException(e.message ?? 'Unexpected network error.');
    }
  }

  String? _extractMessage(dynamic data) {
    if (data is Map && data['message'] is String) return data['message'] as String;
    if (data is Map && data['error'] is String) return data['error'] as String;
    return null;
  }
}