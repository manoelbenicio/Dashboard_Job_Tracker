import '../repositories/ai_repository.dart';
import '../../core/usecases/usecase.dart';
import '../../core/error/failures.dart';

class ChatWithClaireParams {
  final List<AiChatMessage> history;
  final String userMessage;
  final String? imageBase64;

  ChatWithClaireParams({required this.history, required this.userMessage, this.imageBase64});
}

class ChatWithClaireUseCase implements UseCase<String, ChatWithClaireParams> {
  final AiRepository repository;

  ChatWithClaireUseCase(this.repository);

  @override
  Future<String> call(ChatWithClaireParams params) async {
    try {
      return await repository.chat(params.history, params.userMessage);
    } catch (e) {
      throw AiFailure('Falha ao comunicar com a Claire: $e');
    }
  }
}
