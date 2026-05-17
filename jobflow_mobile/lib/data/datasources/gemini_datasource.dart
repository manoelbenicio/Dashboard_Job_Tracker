import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Gemini datasource — isolates all Google GenAI SDK calls
class GeminiDatasource {
  static const _apiKeyPref = 'gemini_api_key';
  static const _model = 'gemini-3.1-flash-lite';

  static const String systemPrompt = '''
Você é a Claire, uma coach executiva de carreira de elite e estrategista de IA integrada à plataforma JobFlow.

REGRA OBRIGATÓRIA: Sempre responda em Português do Brasil (pt-BR). Nunca responda em inglês.

Sua persona:
- Consultora executiva Fortune 500 com 20+ anos de experiência
- Especialista em posicionamento C-level, branding executivo e estratégia de carreira
- Orientada por dados, precisa e confiante nas decisões
- Tom: Profissional porém acolhedor, como uma mentora sênior de confiança

Suas capacidades:
1. **Análise de CV/Currículo**: Análise profunda de gaps contra vagas-alvo, otimização de palavras-chave, quantificação de conquistas
2. **Carta de Apresentação**: Cartas executivas personalizadas que combinam com a cultura da empresa e requisitos da vaga
3. **Preparação para Entrevista**: Coaching comportamental (STAR), estudos de caso e preparação para entrevistas de nível executivo com Q&A simulado
4. **Estratégia de Carreira**: Otimização de pipeline, negociação de ofertas, planejamento de trajetória profissional
5. **Inteligência de Mercado**: Tendências do setor, benchmarks de remuneração, posicionamento competitivo

Regras:
- Sempre seja específica e prática — nada de conselhos genéricos
- Use dados e métricas quando possível
- Formate respostas com seções claras, bullet points e destaques em negrito
- Ao analisar um CV ou vaga, faça perguntas esclarecedoras se informações críticas estiverem faltando
- Finalize análises importantes com um score de confiança (ex: "Confiança: 92%")
''';

  GenerativeModel? _generativeModel;
  String? _apiKey;

  bool get isConfigured => _generativeModel != null;

  /// Initialize with stored API key
  Future<bool> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _apiKey = prefs.getString(_apiKeyPref);
    if (_apiKey != null && _apiKey!.isNotEmpty) {
      _generativeModel = GenerativeModel(
        model: _model,
        apiKey: _apiKey!,
        systemInstruction: Content.system(systemPrompt),
      );
      return true;
    }
    return false;
  }

  /// Save API key and reconfigure model
  Future<void> setApiKey(String key) async {
    _apiKey = key;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_apiKeyPref, key);
    _generativeModel = GenerativeModel(
      model: _model,
      apiKey: key,
      systemInstruction: Content.system(systemPrompt),
    );
  }

  /// Send chat with history, returns response text
  Future<String> chat(List<Content> history, String userMessage) async {
    if (_generativeModel == null) {
      throw Exception('Claire AI não está configurada.');
    }
    final chat = _generativeModel!.startChat(history: history);
    final response = await chat.sendMessage(Content.text(userMessage));
    return response.text ?? 'Desculpe, não consegui gerar uma resposta.';
  }
}
