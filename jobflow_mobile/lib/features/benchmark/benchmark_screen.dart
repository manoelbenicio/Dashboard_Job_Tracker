import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_generative_ai/google_generative_ai.dart';

/// Mobile Executive Benchmark Dashboard — CV vs Job analysis
class BenchmarkScreen extends ConsumerStatefulWidget {
  const BenchmarkScreen({super.key});

  @override
  ConsumerState<BenchmarkScreen> createState() => _BenchmarkScreenState();
}

class _BenchmarkScreenState extends ConsumerState<BenchmarkScreen> {
  final _cvCtrl = TextEditingController();
  final _jobCtrl = TextEditingController();
  bool _running = false;
  int _currentPhase = 0;
  Map<String, dynamic>? _result;
  String? _error;

  final List<String> _phaseNames = [
    'CV Parsing & Extraction',
    'Job Requirements Mapping',
    'Skills Gap Analysis',
    'Experience Alignment',
    'Competitiveness Score',
    'Strategic Recommendations',
    'Executive Summary',
    'Action Plan Generation',
  ];

  Future<void> _runBenchmark() async {
    if (_cvCtrl.text.length < 50 || _jobCtrl.text.length < 30) {
      setState(() => _error = 'CV needs 50+ chars and Job needs 30+ chars');
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final apiKey = prefs.getString('gemini_api_key') ?? '';
    if (apiKey.isEmpty) {
      setState(() => _error = 'Configure Gemini API key in Settings first');
      return;
    }

    setState(() { _running = true; _currentPhase = 0; _result = null; _error = null; });

    try {
      final model = GenerativeModel(model: 'gemini-2.5-flash', apiKey: apiKey);

      // Simulate phased execution with a comprehensive prompt
      for (int i = 0; i < _phaseNames.length; i++) {
        setState(() => _currentPhase = i + 1);
        await Future.delayed(const Duration(milliseconds: 300));
      }

      final prompt = '''You are an executive career benchmark engine. Analyze this CV against the job posting.

CV:
${_cvCtrl.text}

JOB POSTING:
${_jobCtrl.text}

Provide a JSON response with these exact fields:
{
  "overallScore": 0-100,
  "skillsMatch": 0-100,
  "experienceMatch": 0-100,
  "educationMatch": 0-100,
  "cultureFit": 0-100,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "executiveSummary": "2-3 sentence summary"
}

Return ONLY valid JSON, no markdown.''';

      final response = await model.generateContent([Content.text(prompt)]);
      final text = response.text ?? '';

      // Parse JSON from response
      final jsonStart = text.indexOf('{');
      final jsonEnd = text.lastIndexOf('}');
      if (jsonStart == -1 || jsonEnd == -1) throw Exception('Invalid AI response');

      final jsonStr = text.substring(jsonStart, jsonEnd + 1);
      // Simple parse without importing dart:convert in header (already available)
      final Map<String, dynamic> parsed = {};
      
      // Extract scores
      final scoreRegex = RegExp(r'"(\w+)":\s*(\d+)');
      for (final match in scoreRegex.allMatches(jsonStr)) {
        parsed[match.group(1)!] = int.parse(match.group(2)!);
      }

      // Extract arrays
      final arrayRegex = RegExp(r'"(\w+)":\s*\[([^\]]*)\]');
      for (final match in arrayRegex.allMatches(jsonStr)) {
        final items = RegExp(r'"([^"]*)"').allMatches(match.group(2)!).map((m) => m.group(1)!).toList();
        parsed[match.group(1)!] = items;
      }

      // Extract summary
      final summaryRegex = RegExp(r'"executiveSummary":\s*"([^"]*(?:\\.[^"]*)*)"');
      final summaryMatch = summaryRegex.firstMatch(jsonStr);
      if (summaryMatch != null) parsed['executiveSummary'] = summaryMatch.group(1)!.replaceAll(r'\n', '\n');

      setState(() { _result = parsed; _running = false; });
    } catch (e) {
      setState(() { _error = e.toString(); _running = false; });
    }
  }

  @override
  void dispose() { _cvCtrl.dispose(); _jobCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(padding: const EdgeInsets.all(4), decoration: BoxDecoration(color: cs.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
            child: Icon(Icons.emoji_events_outlined, color: cs.primary, size: 16)),
          const SizedBox(width: 8),
          const Text('BENCHMARK'),
        ]),
      ),
      body: _result != null ? _buildResults(cs) : _buildInput(cs),
    );
  }

  Widget _buildInput(ColorScheme cs) {
    return ListView(padding: const EdgeInsets.all(16), children: [
      // CV Input
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: cs.onSurface.withOpacity(0.06))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [Icon(Icons.description_outlined, color: cs.primary, size: 18), const SizedBox(width: 8),
            Text('Your CV', style: TextStyle(color: cs.onSurface, fontSize: 14, fontWeight: FontWeight.w600))]),
          const SizedBox(height: 12),
          TextField(controller: _cvCtrl, maxLines: 6, style: TextStyle(color: cs.onSurface, fontSize: 12),
            decoration: InputDecoration(hintText: 'Paste your CV text here...', hintStyle: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.1))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.1))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: cs.primary)))),
        ]),
      ),
      const SizedBox(height: 12),

      // Job Input
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: cs.onSurface.withOpacity(0.06))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [Icon(Icons.work_outline, color: cs.primary, size: 18), const SizedBox(width: 8),
            Text('Target Job', style: TextStyle(color: cs.onSurface, fontSize: 14, fontWeight: FontWeight.w600))]),
          const SizedBox(height: 12),
          TextField(controller: _jobCtrl, maxLines: 6, style: TextStyle(color: cs.onSurface, fontSize: 12),
            decoration: InputDecoration(hintText: 'Paste job description here...', hintStyle: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.1))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.1))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: cs.primary)))),
        ]),
      ),
      const SizedBox(height: 16),

      // Phase tracker while running
      if (_running) ...[
        Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: cs.onSurface.withOpacity(0.06))),
          child: Column(children: List.generate(_phaseNames.length, (i) {
            final done = i < _currentPhase;
            final active = i == _currentPhase - 1;
            return Padding(padding: const EdgeInsets.symmetric(vertical: 4), child: Row(children: [
              Container(width: 24, height: 24, decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: done ? cs.primary.withOpacity(0.15) : cs.onSurface.withOpacity(0.04),
                border: Border.all(color: active ? cs.primary : cs.onSurface.withOpacity(0.1))),
                child: Center(child: done ? Icon(Icons.check, size: 12, color: cs.primary) : Text('${i + 1}', style: TextStyle(fontSize: 10, color: cs.onSurface.withOpacity(0.4))))),
              const SizedBox(width: 10),
              Expanded(child: Text(_phaseNames[i], style: TextStyle(fontSize: 12, color: active ? cs.primary : cs.onSurface.withOpacity(done ? 0.8 : 0.4), fontWeight: active ? FontWeight.w600 : FontWeight.normal))),
              if (active) SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: cs.primary)),
            ]));
          }))),
        const SizedBox(height: 16),
      ],

      if (_error != null) Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: const Color(0xFFEF4444).withOpacity(0.06), borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.15))),
        child: Row(children: [const Icon(Icons.error_outline, size: 14, color: Color(0xFFEF4444)), const SizedBox(width: 8),
          Expanded(child: Text(_error!, style: const TextStyle(fontSize: 11, color: Color(0xFFEF4444))))]),
      ),

      // Run button
      const SizedBox(height: 8),
      SizedBox(width: double.infinity, height: 48, child: ElevatedButton.icon(
        onPressed: _running ? null : _runBenchmark,
        icon: Icon(_running ? Icons.hourglass_top : Icons.play_arrow, size: 18),
        label: Text(_running ? 'Analyzing...' : 'Run Benchmark (8 Phases)'),
        style: ElevatedButton.styleFrom(backgroundColor: cs.primary, foregroundColor: cs.onPrimary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
      )),
      const SizedBox(height: 32),
    ]);
  }

  Widget _buildResults(ColorScheme cs) {
    final r = _result!;
    final overall = r['overallScore'] ?? 0;
    final skills = r['skillsMatch'] ?? 0;
    final experience = r['experienceMatch'] ?? 0;
    final education = r['educationMatch'] ?? 0;
    final culture = r['cultureFit'] ?? 0;

    return ListView(padding: const EdgeInsets.all(16), children: [
      // Back to input
      TextButton.icon(onPressed: () => setState(() => _result = null), icon: Icon(Icons.arrow_back, size: 14, color: cs.primary), label: Text('New Benchmark', style: TextStyle(color: cs.primary, fontSize: 12))),
      const SizedBox(height: 8),

      // Overall Score
      Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [cs.primary.withOpacity(0.08), cs.surface]),
          borderRadius: BorderRadius.circular(16), border: Border.all(color: cs.primary.withOpacity(0.2))),
        child: Column(children: [
          Text('OVERALL SCORE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1.2, color: cs.onSurface.withOpacity(0.4))),
          const SizedBox(height: 8),
          Text('$overall', style: TextStyle(fontSize: 48, fontWeight: FontWeight.w700, color: _scoreColor(overall), fontFamily: 'monospace')),
          Text(_scoreLabel(overall), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: _scoreColor(overall))),
        ]),
      ),
      const SizedBox(height: 16),

      // Score Bars
      _scoreBar(cs, 'Skills Match', skills), _scoreBar(cs, 'Experience', experience),
      _scoreBar(cs, 'Education', education), _scoreBar(cs, 'Culture Fit', culture),
      const SizedBox(height: 20),

      // Executive Summary
      if (r['executiveSummary'] != null) ...[
        _resultSection(cs, Icons.article_outlined, 'Executive Summary', [
          Text(r['executiveSummary'], style: TextStyle(fontSize: 12, color: cs.onSurface.withOpacity(0.8), height: 1.5)),
        ]),
        const SizedBox(height: 12),
      ],

      // Matched Skills
      if ((r['matchedSkills'] as List?)?.isNotEmpty == true) ...[
        _resultSection(cs, Icons.check_circle_outline, 'Matched Skills', [
          Wrap(spacing: 6, runSpacing: 6, children: (r['matchedSkills'] as List).map((s) =>
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: const Color(0xFF27AE60).withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
              child: Text(s, style: const TextStyle(fontSize: 11, color: Color(0xFF27AE60))))).toList()),
        ]),
        const SizedBox(height: 12),
      ],

      // Missing Skills
      if ((r['missingSkills'] as List?)?.isNotEmpty == true) ...[
        _resultSection(cs, Icons.highlight_off, 'Missing Skills', [
          Wrap(spacing: 6, runSpacing: 6, children: (r['missingSkills'] as List).map((s) =>
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: const Color(0xFFEF4444).withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
              child: Text(s, style: const TextStyle(fontSize: 11, color: Color(0xFFEF4444))))).toList()),
        ]),
        const SizedBox(height: 12),
      ],

      // Recommendations
      if ((r['recommendations'] as List?)?.isNotEmpty == true) ...[
        _resultSection(cs, Icons.lightbulb_outline, 'Recommendations', [
          ...(r['recommendations'] as List).asMap().entries.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(width: 20, height: 20, decoration: BoxDecoration(color: cs.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                child: Center(child: Text('${e.key + 1}', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: cs.primary)))),
              const SizedBox(width: 8),
              Expanded(child: Text(e.value, style: TextStyle(fontSize: 12, color: cs.onSurface.withOpacity(0.8), height: 1.4))),
            ]))),
        ]),
      ],
      const SizedBox(height: 32),
    ]);
  }

  Widget _scoreBar(ColorScheme cs, String label, int value) {
    return Padding(padding: const EdgeInsets.only(bottom: 10), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: TextStyle(fontSize: 12, color: cs.onSurface.withOpacity(0.7))),
        Text('$value%', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _scoreColor(value), fontFamily: 'monospace')),
      ]),
      const SizedBox(height: 4),
      ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(
        value: value / 100, minHeight: 6, backgroundColor: cs.onSurface.withOpacity(0.06), valueColor: AlwaysStoppedAnimation(_scoreColor(value)))),
    ]));
  }

  Widget _resultSection(ColorScheme cs, IconData icon, String title, List<Widget> children) {
    return Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: cs.onSurface.withOpacity(0.06))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [Icon(icon, color: cs.primary, size: 16), const SizedBox(width: 8), Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: cs.onSurface))]),
        const SizedBox(height: 10),
        ...children,
      ]));
  }

  Color _scoreColor(int score) {
    if (score >= 80) return const Color(0xFF27AE60);
    if (score >= 60) return const Color(0xFFFF9800);
    return const Color(0xFFEF4444);
  }

  String _scoreLabel(int score) {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Strong Candidate';
    if (score >= 60) return 'Moderate Fit';
    if (score >= 40) return 'Needs Improvement';
    return 'Significant Gaps';
  }
}
