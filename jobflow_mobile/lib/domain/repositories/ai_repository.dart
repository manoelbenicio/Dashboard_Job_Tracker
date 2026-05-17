/// Abstract AI repository — decouples presentation from Gemini SDK
abstract class AiRepository {
  /// Whether the AI service has been configured with an API key
  bool get isConfigured;

  /// Initialize with stored API key, returns true if configured
  Future<bool> initialize();

  /// Save a new API key
  Future<void> setApiKey(String key);

  /// Send a chat message with conversation history, returns AI response text
  Future<String> chat(List<AiChatMessage> history, String userMessage);
}

/// Framework-agnostic chat message for the domain layer
class AiChatMessage {
  final String text;
  final bool isUser;

  const AiChatMessage({required this.text, required this.isUser});
}
