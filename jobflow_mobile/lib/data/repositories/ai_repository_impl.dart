import 'package:google_generative_ai/google_generative_ai.dart';
import '../../domain/repositories/ai_repository.dart';
import '../datasources/gemini_datasource.dart';

/// Concrete AI repository — translates domain AiChatMessage ↔ Gemini Content
class AiRepositoryImpl implements AiRepository {
  final GeminiDatasource _datasource;

  AiRepositoryImpl(this._datasource);

  @override
  bool get isConfigured => _datasource.isConfigured;

  @override
  Future<bool> initialize() => _datasource.initialize();

  @override
  Future<void> setApiKey(String key) => _datasource.setApiKey(key);

  @override
  Future<String> chat(List<AiChatMessage> history, String userMessage) {
    // Convert domain messages → Gemini Content objects
    final geminiHistory = history
        .map((m) => Content(m.isUser ? 'user' : 'model', [TextPart(m.text)]))
        .toList();
    return _datasource.chat(geminiHistory, userMessage);
  }
}
