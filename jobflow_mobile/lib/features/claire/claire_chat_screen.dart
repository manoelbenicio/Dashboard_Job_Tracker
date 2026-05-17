import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:convert';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'providers/claire_provider.dart';

class ClaireChatScreen extends ConsumerStatefulWidget {
  const ClaireChatScreen({super.key});

  @override
  ConsumerState<ClaireChatScreen> createState() => _ClaireChatScreenState();
}

class _ClaireChatScreenState extends ConsumerState<ClaireChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _apiKeyController = TextEditingController();
  final ImagePicker _imagePicker = ImagePicker();
  File? _attachedImage;

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _apiKeyController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(_scrollController.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty && _attachedImage == null) return;
    _controller.clear();
    if (_attachedImage != null) {
      final bytes = _attachedImage!.readAsBytesSync();
      final b64 = base64Encode(bytes);
      ref.read(claireChatProvider.notifier).sendMessageWithImage(
        text.isEmpty ? 'Analise esta imagem.' : text, b64,
      );
      setState(() => _attachedImage = null);
    } else {
      ref.read(claireChatProvider.notifier).sendMessage(text);
    }
    _scrollToBottom();
  }

  Future<void> _pickImage(ImageSource source) async {
    final picked = await _imagePicker.pickImage(source: source, maxWidth: 1024, imageQuality: 80);
    if (picked != null) setState(() => _attachedImage = File(picked.path));
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(claireChatProvider);
    final cs = Theme.of(context).colorScheme;
    if (chatState.messages.isNotEmpty) _scrollToBottom();

    return Scaffold(
      appBar: AppBar(
        title: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(color: cs.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
            child: Icon(Icons.auto_awesome, color: cs.primary, size: 16),
          ),
          const SizedBox(width: 8),
          const Text('CLAIRE IA'),
        ]),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.of(context).pop()),
        actions: [
          if (!chatState.isConfigured)
            IconButton(icon: Icon(Icons.key, color: cs.error), onPressed: () => _showApiKeyDialog()),
        ],
      ),
      body: Column(children: [
        if (!chatState.isConfigured)
          GestureDetector(
            onTap: () => _showApiKeyDialog(),
            child: Container(
              width: double.infinity, padding: const EdgeInsets.all(12),
              color: cs.error.withOpacity(0.1),
              child: Row(children: [
                Icon(Icons.warning_amber, color: cs.error, size: 16),
                const SizedBox(width: 8),
                Expanded(child: Text('Toque aqui para configurar sua chave API do Gemini e ativar a Claire IA', style: TextStyle(color: cs.error, fontSize: 12))),
                Icon(Icons.chevron_right, color: cs.error, size: 16),
              ]),
            ),
          ),
        Expanded(
          child: ListView.builder(
            controller: _scrollController, padding: const EdgeInsets.all(16),
            itemCount: chatState.messages.length + (chatState.isLoading ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == chatState.messages.length && chatState.isLoading) return _buildTypingIndicator(cs);
              return _buildMessageBubble(chatState.messages[index], cs);
            },
          ),
        ),
        if (chatState.error != null)
          Container(
            width: double.infinity, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: cs.error.withOpacity(0.1),
            child: Text(chatState.error!, style: TextStyle(color: cs.error, fontSize: 11), maxLines: 2, overflow: TextOverflow.ellipsis),
          ),
        _buildInputArea(chatState, cs),
      ]),
    );
  }

  Widget _buildMessageBubble(ClaireMessage message, ColorScheme cs) {
    final isUser = message.isUser;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
        margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUser ? cs.primary.withOpacity(0.15) : cs.surface,
          borderRadius: BorderRadius.circular(12).copyWith(
            bottomRight: isUser ? const Radius.circular(2) : null,
            bottomLeft: !isUser ? const Radius.circular(2) : null,
          ),
          border: Border.all(color: isUser ? cs.primary.withOpacity(0.3) : cs.onSurface.withOpacity(0.08)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (!isUser)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.auto_awesome, color: cs.primary.withOpacity(0.7), size: 12),
                const SizedBox(width: 4),
                Text('CLAIRE', style: TextStyle(color: cs.primary.withOpacity(0.7), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              ]),
            ),
          SelectableText(message.text, style: TextStyle(color: cs.onSurface, fontSize: 13, height: 1.5)),
        ]),
      ),
    );
  }

  Widget _buildTypingIndicator(ColorScheme cs) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(12).copyWith(bottomLeft: const Radius.circular(2)), border: Border.all(color: cs.onSurface.withOpacity(0.08))),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: cs.primary.withOpacity(0.6))),
          const SizedBox(width: 10),
          Text('Claire está pensando...', style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 12, fontStyle: FontStyle.italic)),
        ]),
      ),
    );
  }

  Widget _buildInputArea(ClaireChatState chatState, ColorScheme cs) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      decoration: BoxDecoration(color: cs.surface, border: Border(top: BorderSide(color: cs.onSurface.withOpacity(0.06)))),
      child: SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
        if (chatState.messages.length <= 1)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Wrap(spacing: 8, runSpacing: 6, children: [
              _buildQuickChip('📄 Analisar Gaps no CV', () => ref.read(claireChatProvider.notifier).analyzeCvGap(), cs),
              _buildQuickChip('✉️ Carta de Apresentação', () => ref.read(claireChatProvider.notifier).draftCoverLetter(), cs),
              _buildQuickChip('🎯 Prep. Entrevista', () => ref.read(claireChatProvider.notifier).interviewPrep(), cs),
            ]),
          ),
        Row(children: [
          Expanded(child: TextField(
            controller: _controller, enabled: !chatState.isLoading,
            style: TextStyle(color: cs.onSurface, fontSize: 14),
            decoration: InputDecoration(
              hintText: chatState.isConfigured ? 'Pergunte à Claire qualquer coisa...' : 'Configure a chave API primeiro...',
              hintStyle: TextStyle(color: cs.onSurface.withOpacity(0.35), fontSize: 13),
              filled: true, fillColor: cs.surface,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.1))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.1))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide(color: cs.primary, width: 1.5)),
            ),
            onSubmitted: (_) => _sendMessage(), textInputAction: TextInputAction.send,
          )),
          const SizedBox(width: 8),
          // Image attachment button
          GestureDetector(
            onTap: () => showModalBottomSheet(
              context: context,
              backgroundColor: cs.surface,
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
              builder: (ctx) => SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
                ListTile(leading: Icon(Icons.photo_library, color: cs.primary), title: const Text('Galeria'), onTap: () { Navigator.pop(ctx); _pickImage(ImageSource.gallery); }),
                ListTile(leading: Icon(Icons.camera_alt, color: cs.primary), title: const Text('Câmera'), onTap: () { Navigator.pop(ctx); _pickImage(ImageSource.camera); }),
              ])),
            ),
            child: Container(
              width: 36, height: 36,
              decoration: BoxDecoration(color: _attachedImage != null ? cs.primary.withOpacity(0.2) : cs.surface, shape: BoxShape.circle, border: Border.all(color: cs.onSurface.withOpacity(0.1))),
              child: Icon(_attachedImage != null ? Icons.image : Icons.attach_file, color: _attachedImage != null ? cs.primary : cs.onSurface.withOpacity(0.4), size: 18),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: chatState.isLoading ? null : _sendMessage,
            child: Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: chatState.isLoading ? cs.onSurface.withOpacity(0.2) : cs.primary, shape: BoxShape.circle),
              child: Icon(Icons.arrow_upward, color: chatState.isLoading ? cs.onSurface.withOpacity(0.4) : cs.onPrimary, size: 20),
            ),
          ),
        ]),
      ])),
    );
  }

  Widget _buildQuickChip(String label, VoidCallback onTap, ColorScheme cs) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(color: cs.surface, border: Border.all(color: cs.primary.withOpacity(0.3)), borderRadius: BorderRadius.circular(100)),
        child: Text(label, style: TextStyle(fontSize: 11, color: cs.primary, fontWeight: FontWeight.w600)),
      ),
    );
  }

  void _showApiKeyDialog() {
    final cs = Theme.of(context).colorScheme;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: cs.surface,
        title: Text('Configurar Chave API Gemini', style: TextStyle(fontSize: 16, color: cs.onSurface)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Insira sua chave API do Google Gemini para ativar a Claire IA.\n\nObtenha uma grátis em ai.google.dev', style: TextStyle(color: cs.onSurface.withOpacity(0.6), fontSize: 12)),
          const SizedBox(height: 16),
          TextField(
            controller: _apiKeyController,
            style: TextStyle(color: cs.onSurface, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'AIzaSy...', hintStyle: TextStyle(color: cs.onSurface.withOpacity(0.3)),
              filled: true, fillColor: cs.surface,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: cs.primary.withOpacity(0.3))),
            ),
          ),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: Text('Cancelar', style: TextStyle(color: cs.onSurface.withOpacity(0.5)))),
          TextButton(
            onPressed: () {
              final key = _apiKeyController.text.trim();
              if (key.isNotEmpty) { ref.read(claireChatProvider.notifier).setApiKey(key); Navigator.of(context).pop(); }
            },
            child: Text('Salvar', style: TextStyle(color: cs.primary, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
