import 'dart:convert';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// Cloud-based job scraper with dual-API fallback:
///   1. Primary: Google Gemini API
///   2. Fallback: OpenAI API
/// No localhost dependency — works on any device.
class JobScraperService {
  static const _geminiKeyPref = 'gemini_api_key';
  static const _openaiKeyPref = 'openai_api_key';
  static const _geminiModel = 'gemini-3.1-flash-lite';
  static const _openaiModel = 'gpt-4o-mini';

  static const String _prompt = '''
Analise esta URL de vaga de emprego e extraia as informações.
URL: {{URL}}

Retorne APENAS um JSON válido (sem markdown, sem code blocks, sem explicação):
{
  "company": "nome da empresa",
  "role": "título/cargo da vaga",
  "salary": "faixa salarial (se disponível, caso contrário string vazia)",
  "location": "localização da vaga",
  "description": "resumo da descrição da vaga em 2-3 frases"
}

Se não conseguir acessar a URL ou extrair algum campo, use string vazia.
Retorne SOMENTE o JSON.
''';

  /// Main entry point — tries Gemini first, falls back to OpenAI
  static Future<Map<String, String>> scrapeJob(String url) async {
    final prefs = await SharedPreferences.getInstance();
    final geminiKey = prefs.getString(_geminiKeyPref);
    final openaiKey = prefs.getString(_openaiKeyPref);

    if ((geminiKey == null || geminiKey.isEmpty) &&
        (openaiKey == null || openaiKey.isEmpty)) {
      throw Exception(
        'Configure pelo menos uma chave API (Gemini ou OpenAI) nas Configurações para usar a importação por URL.',
      );
    }

    final prompt = _prompt.replaceAll('{{URL}}', url);

    // ─── Try Gemini first ───
    if (geminiKey != null && geminiKey.isNotEmpty) {
      try {
        final result = await _tryGemini(geminiKey, prompt);
        return result;
      } catch (e) {
        // Gemini failed — fall through to OpenAI
        if (openaiKey == null || openaiKey.isEmpty) {
          rethrow; // No fallback available
        }
      }
    }

    // ─── Fallback: OpenAI ───
    if (openaiKey != null && openaiKey.isNotEmpty) {
      return _tryOpenAI(openaiKey, prompt);
    }

    throw Exception('Nenhuma API disponível para importação.');
  }

  /// Try Gemini API
  static Future<Map<String, String>> _tryGemini(String apiKey, String prompt) async {
    final model = GenerativeModel(
      model: _geminiModel,
      apiKey: apiKey,
    );

    final response = await model
        .generateContent([Content.text(prompt)])
        .timeout(const Duration(seconds: 15));
    final text = response.text ?? '';

    return _parseJson(text);
  }

  /// Try OpenAI API
  static Future<Map<String, String>> _tryOpenAI(String apiKey, String prompt) async {
    final response = await http.post(
      Uri.parse('https://api.openai.com/v1/chat/completions'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: jsonEncode({
        'model': _openaiModel,
        'messages': [
          {'role': 'user', 'content': prompt},
        ],
        'temperature': 0.3,
        'max_tokens': 500,
      }),
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode != 200) {
      throw Exception('OpenAI API erro: ${response.statusCode}');
    }

    final data = jsonDecode(response.body);
    final text = data['choices']?[0]?['message']?['content'] ?? '';
    return _parseJson(text);
  }

  /// Parse JSON from AI response (handles markdown wrapping)
  static Map<String, String> _parseJson(String text) {
    String jsonStr = text.trim();
    // Strip markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr
          .replaceAll(RegExp(r'^```\w*\n?'), '')
          .replaceAll(RegExp(r'\n?```$'), '');
    }

    try {
      final data = jsonDecode(jsonStr.trim()) as Map<String, dynamic>;
      return {
        'company': (data['company'] ?? '').toString(),
        'role': (data['role'] ?? '').toString(),
        'salary': (data['salary'] ?? '').toString(),
        'location': (data['location'] ?? '').toString(),
        'description': (data['description'] ?? '').toString(),
      };
    } catch (_) {
      throw Exception(
        'Não foi possível extrair dados da vaga. Tente novamente ou preencha manualmente.',
      );
    }
  }
}
