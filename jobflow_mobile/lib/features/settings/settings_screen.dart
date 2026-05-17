import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/themes/theme_provider.dart';
import '../../core/usecases/usecase.dart';
import '../../core/di/injection.dart';
import '../claire/providers/claire_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final TextEditingController _apiKeyController = TextEditingController();
  final TextEditingController _openaiKeyController = TextEditingController();
  bool _apiKeyObscured = true;
  bool _openaiKeyObscured = true;
  bool _apiKeySaved = false;
  bool _openaiKeySaved = false;

  @override
  void initState() {
    super.initState();
    _loadApiKey();
    _loadOpenaiKey();
  }

  Future<void> _loadApiKey() async {
    final initUseCase = ref.read(initClaireUseCaseProvider);
    final configured = await initUseCase(const NoParams());
    if (configured && mounted) {
      setState(() {
        _apiKeyController.text = '••••••••••••••••';
        _apiKeySaved = true;
      });
    }
  }

  Future<void> _loadOpenaiKey() async {
    final prefs = await SharedPreferences.getInstance();
    final key = prefs.getString('openai_api_key');
    if (key != null && key.isNotEmpty && mounted) {
      setState(() {
        _openaiKeyController.text = '••••••••••••••••';
        _openaiKeySaved = true;
      });
    }
  }

  Future<void> _saveOpenaiKey() async {
    final key = _openaiKeyController.text.trim();
    if (key.isEmpty || key.startsWith('••')) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('openai_api_key', key);
    if (mounted) {
      setState(() => _openaiKeySaved = true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('OpenAI API Key salva ✓'),
          backgroundColor: Theme.of(context).colorScheme.secondary,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _saveApiKey() async {
    final key = _apiKeyController.text.trim();
    if (key.isEmpty || key.startsWith('••')) return;

    await ref.read(claireChatProvider.notifier).setApiKey(key);
    if (mounted) {
      setState(() => _apiKeySaved = true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('API Key salva ✓'),
          backgroundColor: Theme.of(context).colorScheme.secondary,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  void dispose() {
    _apiKeyController.dispose();
    _openaiKeyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeState = ref.watch(themeProvider);
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('CONFIGURAÇÕES'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ─── SECTION 1: API KEY ───
          _sectionHeader(cs, 'GEMINI API KEY'),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: cs.surface,
              border: Border.all(color: cs.onSurface.withOpacity(0.08)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Necessária para Claire AI e funções de IA',
                  style: TextStyle(fontSize: 12, color: cs.onSurface.withOpacity(0.5)),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _apiKeyController,
                        obscureText: _apiKeyObscured,
                        style: TextStyle(fontSize: 13, color: cs.onSurface),
                        decoration: InputDecoration(
                          hintText: 'Cole sua API key aqui...',
                          hintStyle: TextStyle(color: cs.onSurface.withOpacity(0.3)),
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: BorderSide(color: cs.onSurface.withOpacity(0.15)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: BorderSide(color: cs.onSurface.withOpacity(0.15)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: BorderSide(color: cs.primary),
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _apiKeyObscured ? Icons.visibility_off : Icons.visibility,
                              size: 18,
                              color: cs.onSurface.withOpacity(0.4),
                            ),
                            onPressed: () => setState(() => _apiKeyObscured = !_apiKeyObscured),
                          ),
                        ),
                        onChanged: (_) {
                          if (_apiKeySaved) setState(() => _apiKeySaved = false);
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: _apiKeySaved ? null : _saveApiKey,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _apiKeySaved ? cs.secondary : cs.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      ),
                      child: Text(_apiKeySaved ? '✓' : 'Salvar', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // ─── SECTION 1b: OPENAI API KEY (FALLBACK) ───
          _sectionHeader(cs, 'OPENAI API KEY (FALLBACK)'),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: cs.surface,
              border: Border.all(color: cs.onSurface.withOpacity(0.08)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Backup: se Gemini falhar, OpenAI assume automaticamente',
                  style: TextStyle(fontSize: 12, color: cs.onSurface.withOpacity(0.5)),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _openaiKeyController,
                        obscureText: _openaiKeyObscured,
                        style: TextStyle(fontSize: 13, color: cs.onSurface),
                        decoration: InputDecoration(
                          hintText: 'Cole sua OpenAI API key aqui...',
                          hintStyle: TextStyle(color: cs.onSurface.withOpacity(0.3)),
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: BorderSide(color: cs.onSurface.withOpacity(0.15)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: BorderSide(color: cs.onSurface.withOpacity(0.15)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: BorderSide(color: cs.primary),
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _openaiKeyObscured ? Icons.visibility_off : Icons.visibility,
                              size: 18,
                              color: cs.onSurface.withOpacity(0.4),
                            ),
                            onPressed: () => setState(() => _openaiKeyObscured = !_openaiKeyObscured),
                          ),
                        ),
                        onChanged: (_) {
                          if (_openaiKeySaved) setState(() => _openaiKeySaved = false);
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: _openaiKeySaved ? null : _saveOpenaiKey,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _openaiKeySaved ? cs.secondary : cs.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      ),
                      child: Text(_openaiKeySaved ? '✓' : 'Salvar', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ─── SECTION 2: DASHBOARD LAYOUT ───
          _sectionHeader(cs, 'DASHBOARD LAYOUT'),
          const SizedBox(height: 4),
          Text(
            'Altera a estrutura, KPIs e widgets do painel',
            style: TextStyle(fontSize: 11, color: cs.onSurface.withOpacity(0.4)),
          ),
          const SizedBox(height: 12),
          ...IndraLayout.values.map((layout) => _buildLayoutOption(layout, themeState, cs)),

          const SizedBox(height: 24),

          // ─── SECTION 3: COLOR PALETTE ───
          _sectionHeader(cs, 'PALETA DE CORES'),
          const SizedBox(height: 4),
          Text(
            'Altera somente as cores — layout permanece intacto',
            style: TextStyle(fontSize: 11, color: cs.onSurface.withOpacity(0.4)),
          ),
          const SizedBox(height: 12),
          ...IndraPalette.values.map((palette) => _buildPaletteOption(palette, themeState, cs)),

          const SizedBox(height: 32),

          // ─── DANGER ZONE: ACCOUNT DELETION ───
          _sectionHeader(cs, 'ZONA DE PERIGO'),
          const SizedBox(height: 4),
          Text(
            'Excluir sua conta desativará o acesso. Dados retidos por 5 anos.',
            style: TextStyle(fontSize: 11, color: const Color(0xFFE91E63).withOpacity(0.7)),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _showDeleteAccountDialog(context, cs),
              icon: const Icon(Icons.delete_forever, size: 18, color: Color(0xFFE91E63)),
              label: const Text('Excluir Minha Conta', style: TextStyle(color: Color(0xFFE91E63))),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFE91E63), width: 1),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context, ColorScheme cs) {
    final confirmCtrl = TextEditingController();
    bool deleting = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF002B3A),
          title: Row(children: const [
            Icon(Icons.warning_amber, color: Color(0xFFE91E63), size: 22),
            SizedBox(width: 10),
            Text('Confirmar Exclusão', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w300)),
          ]),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Esta ação irá desativar sua conta. Seus dados serão retidos por 5 anos para conformidade legal.',
                style: TextStyle(color: Color(0xFF7A9CAE), fontSize: 13, height: 1.5),
              ),
              const SizedBox(height: 16),
              const Text('Digite EXCLUIR para confirmar:', style: TextStyle(color: Color(0xFF7A9CAE), fontSize: 12)),
              const SizedBox(height: 8),
              TextField(
                controller: confirmCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                decoration: const InputDecoration(
                  hintText: 'EXCLUIR',
                  hintStyle: TextStyle(color: Color(0xFF7A9CAE)),
                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF7A9CAE))),
                  focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFFE91E63))),
                ),
                onChanged: (_) => setDialogState(() {}),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: confirmCtrl.text != 'EXCLUIR' || deleting
                  ? null
                  : () async {
                      setDialogState(() => deleting = true);
                      try {
                        final user = FirebaseAuth.instance.currentUser;
                        if (user != null) {
                          final retentionExpiry = DateTime.now().add(const Duration(days: 365 * 5));
                          await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
                            'isActive': false,
                            'deletedAt': FieldValue.serverTimestamp(),
                            'retentionExpiry': retentionExpiry.toIso8601String(),
                            'deletionReason': 'user_requested',
                            'email': user.email ?? '',
                          }, SetOptions(merge: true));
                          await FirebaseAuth.instance.signOut();
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Erro: $e'), backgroundColor: const Color(0xFFE91E63)),
                          );
                        }
                        setDialogState(() => deleting = false);
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: confirmCtrl.text == 'EXCLUIR' ? const Color(0xFFE91E63) : Colors.grey,
              ),
              child: Text(deleting ? 'Processando...' : 'Excluir Conta'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(ColorScheme cs, String title) {
    return Text(
      title,
      style: TextStyle(
        color: cs.onSurface.withOpacity(0.5),
        fontSize: 10,
        fontWeight: FontWeight.w600,
        letterSpacing: 1.2,
      ),
    );
  }

  Widget _buildLayoutOption(IndraLayout layout, IndraThemeState themeState, ColorScheme cs) {
    final isActive = layout == themeState.layout;

    return GestureDetector(
      onTap: () => ref.read(themeProvider.notifier).setLayout(layout),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isActive ? cs.primary.withOpacity(0.08) : cs.surface,
          border: Border.all(
            color: isActive ? cs.primary : cs.onSurface.withOpacity(0.08),
            width: isActive ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: isActive ? cs.primary.withOpacity(0.15) : cs.onSurface.withOpacity(0.05),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(layout.icon, color: isActive ? cs.primary : cs.onSurface.withOpacity(0.4), size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(layout.displayName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: cs.onSurface)),
              Text(layout.subtitle, style: TextStyle(fontSize: 11, color: isActive ? cs.primary : cs.onSurface.withOpacity(0.4))),
            ],
          )),
          if (isActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: cs.secondary.withOpacity(0.12), borderRadius: BorderRadius.circular(4)),
              child: Text('ATIVO', style: TextStyle(color: cs.secondary, fontSize: 8, fontWeight: FontWeight.bold)),
            ),
        ]),
      ),
    );
  }

  Widget _buildPaletteOption(IndraPalette palette, IndraThemeState themeState, ColorScheme cs) {
    final isActive = palette == themeState.palette;

    return GestureDetector(
      onTap: () => ref.read(themeProvider.notifier).setPalette(palette),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isActive ? cs.primary.withOpacity(0.08) : cs.surface,
          border: Border.all(
            color: isActive ? cs.primary : cs.onSurface.withOpacity(0.08),
            width: isActive ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(children: [
          // Color swatch circle
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: palette.swatch.withOpacity(0.2),
              border: Border.all(color: palette.swatch, width: 2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Center(
              child: Container(
                width: 16, height: 16,
                decoration: BoxDecoration(
                  color: palette.swatch,
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(palette.displayName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: cs.onSurface)),
              Text(palette.subtitle, style: TextStyle(fontSize: 11, color: isActive ? cs.primary : cs.onSurface.withOpacity(0.4))),
            ],
          )),
          if (isActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: cs.secondary.withOpacity(0.12), borderRadius: BorderRadius.circular(4)),
              child: Text('ATIVO', style: TextStyle(color: cs.secondary, fontSize: 8, fontWeight: FontWeight.bold)),
            ),
        ]),
      ),
    );
  }
}
