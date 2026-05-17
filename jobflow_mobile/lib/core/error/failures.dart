/// Base failure class for clean error propagation
abstract class Failure {
  final String message;
  const Failure(this.message);

  @override
  String toString() => message;
}

/// Firebase/server failures
class ServerFailure extends Failure {
  const ServerFailure([super.message = 'Erro no servidor. Tente novamente.']);
}

/// Authentication failures
class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Falha na autenticação.']);
}

/// AI service failures
class AiFailure extends Failure {
  const AiFailure([super.message = 'Claire AI não está configurada. Adicione sua chave API do Gemini nas Configurações.']);
}

/// Cache/local storage failures
class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Erro no armazenamento local.']);
}
