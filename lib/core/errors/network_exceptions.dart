
class ApiException implements Exception {
  final String message;
  const ApiException(this.message);
  @override
  String toString() => message;
}

class NetworkException implements Exception {
  final String message;
  const NetworkException(this.message);
  @override
  String toString() => message;
}

class ApiTimeoutException implements Exception {
  final String message;
  const ApiTimeoutException(this.message);
  @override
  String toString() => message;
}

class UnauthorizedException implements Exception {
  final String message;
  const UnauthorizedException(this.message);
  @override
  String toString() => message;
}

class ServerException implements Exception {
  final String message;
  const ServerException(this.message);
  @override
  String toString() => message;
}
