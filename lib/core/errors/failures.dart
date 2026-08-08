import 'exceptions.dart';

sealed class Failure {
  final String message;

  const Failure(this.message);

  @override
  String toString() => message;
}

class ServerFailure extends Failure {
  final int? statusCode;

  const ServerFailure(super.message, {this.statusCode});
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'No internet connection']);
}

class TimeoutFailure extends Failure {
  const TimeoutFailure([super.message = 'Request timed out']);
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([super.message = 'Session expired, please log in again']);
}

class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Local cache read/write failed']);
}

class ValidationFailure extends Failure {
  final Map<String, List<String>>? fieldErrors;

  const ValidationFailure(super.message, {this.fieldErrors});
}

class UnknownFailure extends Failure {
  const UnknownFailure([super.message = 'Something went wrong']);
}

Failure mapExceptionToFailure(Object error) {
  return switch (error) {
    UnauthorizedException e => UnauthorizedFailure(e.message),
    ValidationException e => ValidationFailure(e.message, fieldErrors: e.fieldErrors),
    ServerException e => ServerFailure(e.message, statusCode: e.statusCode),
    NetworkException e => NetworkFailure(e.message),
    TimeoutException e => TimeoutFailure(e.message),
    CacheException e => CacheFailure(e.message),
    _ => UnknownFailure(error.toString()),
  };
}

