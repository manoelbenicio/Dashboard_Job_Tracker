import '../repositories/ai_repository.dart';
import '../../core/usecases/usecase.dart';
import '../../core/error/failures.dart';

class SetClaireApiKeyUseCase implements UseCase<void, String> {
  final AiRepository repository;

  SetClaireApiKeyUseCase(this.repository);

  @override
  Future<void> call(String apiKey) async {
    try {
      await repository.setApiKey(apiKey);
    } catch (e) {
      throw AiFailure('Falha ao definir a chave API da Claire: $e');
    }
  }
}
