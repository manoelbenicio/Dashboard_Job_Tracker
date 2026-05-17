import '../repositories/ai_repository.dart';
import '../../core/usecases/usecase.dart';
import '../../core/error/failures.dart';

class InitClaireUseCase implements UseCase<bool, NoParams> {
  final AiRepository repository;

  InitClaireUseCase(this.repository);

  @override
  Future<bool> call(NoParams params) async {
    try {
      return await repository.initialize();
    } catch (e) {
      throw AiFailure('Falha ao inicializar a Claire: $e');
    }
  }
}
