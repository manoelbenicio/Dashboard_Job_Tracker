import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  bool _isSignUp = false;
  bool _showPassword = false;
  bool _loading = false;
  String _error = '';
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (_emailCtrl.text.trim().isEmpty || _passCtrl.text.trim().isEmpty) return;
    setState(() { _loading = true; _error = ''; });
    try {
      final auth = ref.read(authActionsProvider);
      if (_isSignUp) {
        await auth.signup(_emailCtrl.text.trim(), _passCtrl.text.trim(), _nameCtrl.text.trim().isNotEmpty ? _nameCtrl.text.trim() : _emailCtrl.text.split('@')[0]);
      } else {
        await auth.login(_emailCtrl.text.trim(), _passCtrl.text.trim());
      }
    } catch (e) {
      final msg = e.toString();
      if (msg.contains('user-not-found') || msg.contains('invalid-credential')) {
        _error = 'Email ou senha inválidos.';
      } else if (msg.contains('email-already-in-use')) {
        _error = 'Já existe uma conta com este email.';
      } else if (msg.contains('weak-password')) {
        _error = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (msg.contains('invalid-email')) {
        _error = 'Insira um email válido.';
      } else {
        _error = 'Falha na autenticação. Tente novamente.';
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleGoogle() async {
    setState(() { _loading = true; _error = ''; });
    try {
      await ref.read(authActionsProvider).googleLogin();
    } catch (e) {
      final msg = e.toString();
      if (!msg.contains('popup-closed') && !msg.contains('cancelled')) {
        setState(() => _error = 'Google: $msg');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              const SizedBox(height: 32),
              // Logo
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: cs.primary.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
                  child: Icon(Icons.rocket_launch, color: cs.primary, size: 28),
                ),
                const SizedBox(width: 12),
                Text('JobFlow', style: TextStyle(color: cs.onSurface, fontSize: 28, fontWeight: FontWeight.w900)),
              ]),
              const SizedBox(height: 8),
              Text('DSS-JOBFLOW-2026 · EXECUTIVE TRACKER', textAlign: TextAlign.center,
                style: TextStyle(color: cs.primary.withOpacity(0.6), fontSize: 9, letterSpacing: 2, fontWeight: FontWeight.w600)),
              const SizedBox(height: 40),

              // Header
              Text(_isSignUp ? 'Comece Agora' : 'Bem-vindo de volta',
                style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1)),
              const SizedBox(height: 4),
              RichText(text: TextSpan(children: [
                TextSpan(text: _isSignUp ? 'Inicie sua busca\n' : 'Entre para\n', style: TextStyle(color: cs.onSurface, fontSize: 24, fontWeight: FontWeight.w300)),
                TextSpan(text: _isSignUp ? 'inteligente' : 'continuar', style: TextStyle(color: cs.primary, fontSize: 24, fontWeight: FontWeight.w300)),
                TextSpan(text: _isSignUp ? ' de emprego' : ' sua jornada', style: TextStyle(color: cs.onSurface, fontSize: 24, fontWeight: FontWeight.w300)),
              ])),
              const SizedBox(height: 32),

              // Name field (sign-up only)
              if (_isSignUp) ...[
                _buildLabel('Nome Completo', cs),
                _buildField(_nameCtrl, 'Seu nome completo', Icons.person, false, cs),
                const SizedBox(height: 16),
              ],

              // Email
              _buildLabel('Email *', cs),
              _buildField(_emailCtrl, 'voce@empresa.com', Icons.mail, false, cs),
              const SizedBox(height: 16),

              // Password
              _buildLabel('Senha *', cs),
              _buildField(_passCtrl, '••••••••', Icons.lock, true, cs),
              const SizedBox(height: 8),

              // Error
              if (_error.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(10), margin: const EdgeInsets.only(top: 8),
                  decoration: BoxDecoration(color: cs.error.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                  child: Row(children: [
                    Icon(Icons.error_outline, color: cs.error, size: 14),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error, style: TextStyle(color: cs.error, fontSize: 12))),
                  ]),
                ),
              const SizedBox(height: 24),

              // Submit button
              ElevatedButton(
                onPressed: _loading ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: cs.primary, foregroundColor: cs.onPrimary,
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: _loading
                    ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: cs.onPrimary))
                    : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const Icon(Icons.arrow_forward, size: 16),
                        const SizedBox(width: 8),
                        Text(_isSignUp ? 'Criar Conta' : 'Entrar', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      ]),
              ),
              const SizedBox(height: 20),

              // Divider
              Row(children: [
                Expanded(child: Divider(color: cs.onSurface.withOpacity(0.1))),
                Padding(padding: const EdgeInsets.symmetric(horizontal: 12), child: Text('OU', style: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 11))),
                Expanded(child: Divider(color: cs.onSurface.withOpacity(0.1))),
              ]),
              const SizedBox(height: 20),

              // Google button
              OutlinedButton(
                onPressed: _loading ? null : _handleGoogle,
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: cs.onSurface.withOpacity(0.1)),
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Text('G', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF4285F4))),
                  const SizedBox(width: 10),
                  Text('Continuar com Google', style: TextStyle(color: cs.onSurface, fontSize: 14)),
                ]),
              ),
              const SizedBox(height: 24),

              // Toggle sign in/up
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text(_isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?',
                  style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 13)),
                TextButton(
                  onPressed: () => setState(() { _isSignUp = !_isSignUp; _error = ''; }),
                  child: Text(_isSignUp ? 'Entrar' : 'Criar Conta', style: TextStyle(color: cs.primary, fontWeight: FontWeight.bold, fontSize: 13)),
                ),
              ]),

              // Footer
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.shield, color: cs.onSurface.withOpacity(0.3), size: 11),
                const SizedBox(width: 4),
                Text('Protegido pelo Firebase', style: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 10)),
              ]),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text, ColorScheme cs) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(text, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
    );
  }

  Widget _buildField(TextEditingController ctrl, String hint, IconData icon, bool isPassword, ColorScheme cs) {
    return TextField(
      controller: ctrl,
      obscureText: isPassword && !_showPassword,
      style: TextStyle(color: cs.onSurface, fontSize: 14),
      decoration: InputDecoration(
        hintText: hint, hintStyle: TextStyle(color: cs.onSurface.withOpacity(0.25)),
        prefixIcon: Icon(icon, size: 16, color: cs.onSurface.withOpacity(0.4)),
        suffixIcon: isPassword
            ? IconButton(icon: Icon(_showPassword ? Icons.visibility_off : Icons.visibility, size: 16, color: cs.onSurface.withOpacity(0.4)), onPressed: () => setState(() => _showPassword = !_showPassword))
            : null,
        filled: true, fillColor: cs.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.08))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.08))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: cs.primary, width: 1.5)),
      ),
      onSubmitted: (_) => _handleSubmit(),
    );
  }
}
