import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/di/injection.dart';
import '../../../core/error/failures.dart';
import '../../../core/usecases/usecase.dart';
import '../../../domain/repositories/ai_repository.dart';
import '../../../domain/usecases/chat_with_claire_usecase.dart';

/// Uma mensagem na conversa com a Claire AI
class ClaireMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ClaireMessage({
    required this.text,
    required this.isUser,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

/// Estado do chat da Claire AI
class ClaireChatState {
  final List<ClaireMessage> messages;
  final bool isLoading;
  final bool isConfigured;
  final String? error;

  ClaireChatState({
    this.messages = const [],
    this.isLoading = false,
    this.isConfigured = false,
    this.error,
  });

  ClaireChatState copyWith({
    List<ClaireMessage>? messages,
    bool? isLoading,
    bool? isConfigured,
    String? error,
  }) {
    return ClaireChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isConfigured: isConfigured ?? this.isConfigured,
      error: error,
    );
  }
}

/// Riverpod notifier para o estado do chat Claire AI
class ClaireChatNotifier extends StateNotifier<ClaireChatState> {
  final Ref ref;

  ClaireChatNotifier(this.ref) : super(ClaireChatState()) {
    _init();
  }

  Future<void> _init() async {
    try {
      final initUseCase = ref.read(initClaireUseCaseProvider);
      final configured = await initUseCase(const NoParams());
      
      state = state.copyWith(
        isConfigured: configured,
        messages: [
          ClaireMessage(
            text: 'Bem-vindo de volta. Sou a Claire, sua estrategista executiva de carreira.\n\n'
                'Posso te ajudar com:\n'
                '• **Análise de Gaps no CV** — comparar seu perfil com vagas-alvo\n'
                '• **Cartas de Apresentação** — rascunhos personalizados de nível executivo\n'
                '• **Preparação para Entrevista** — frameworks STAR e Q&A simulado\n'
                '• **Estratégia de Carreira** — otimização de pipeline e posicionamento\n\n'
                'No que você gostaria de trabalhar?',
            isUser: false,
          ),
        ],
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  /// Definir a chave API do Gemini
  Future<void> setApiKey(String key) async {
    final useCase = ref.read(setClaireApiKeyUseCaseProvider);
    await useCase(key);
    state = state.copyWith(isConfigured: true, error: null);
  }

  /// Enviar mensagem do usuário
  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMessage = ClaireMessage(text: text, isUser: true);
    state = state.copyWith(
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    );

    try {
      final chatUseCase = ref.read(chatWithClaireUseCaseProvider);
      
      final history = state.messages
          .where((m) => state.messages.indexOf(m) > 0)
          .where((m) => m != userMessage)
          .map((m) => AiChatMessage(text: m.text, isUser: m.isUser))
          .toList();

      final responseText = await chatUseCase(
        ChatWithClaireParams(history: history, userMessage: text),
      );

      final aiMessage = ClaireMessage(text: responseText, isUser: false);
      state = state.copyWith(
        messages: [...state.messages, aiMessage],
        isLoading: false,
      );
    } on AiFailure catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.message,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Atalhos de ações rápidas
  Future<void> analyzeCvGap() async {
    await sendMessage('Gostaria que você analisasse meu CV em relação a uma vaga-alvo. Quais informações você precisa?');
  }

  Future<void> draftCoverLetter() async {
    await sendMessage('Preciso de ajuda para redigir uma carta de apresentação executiva. Vamos começar — quais detalhes você precisa?');
  }

  Future<void> interviewPrep() async {
    await sendMessage('Tenho uma entrevista em breve e preciso de preparação. Me guie pelo processo.');
  }

  /// Enviar mensagem com imagem anexada (multimodal)
  Future<void> sendMessageWithImage(String text, String base64Image) async {
    final userMessage = ClaireMessage(text: '📎 [Imagem anexada] $text', isUser: true);
    state = state.copyWith(
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    );

    try {
      final chatUseCase = ref.read(chatWithClaireUseCaseProvider);
      // Send with image context — the use case will handle multimodal
      final responseText = await chatUseCase(
        ChatWithClaireParams(
          history: [],
          userMessage: text,
          imageBase64: base64Image,
        ),
      );

      final aiMessage = ClaireMessage(text: responseText, isUser: false);
      state = state.copyWith(
        messages: [...state.messages, aiMessage],
        isLoading: false,
      );
    } on AiFailure catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

// Providers — backed by clean architecture
// ─────────────────────────────────────────────────────────

final claireChatProvider = StateNotifierProvider<ClaireChatNotifier, ClaireChatState>((ref) {
  return ClaireChatNotifier(ref);
});
