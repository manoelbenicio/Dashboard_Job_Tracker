import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:share_plus/share_plus.dart';

/// Mobile Resume Builder — Tab-based (Edit tab / Preview tab)
class ResumeBuilderScreen extends ConsumerStatefulWidget {
  const ResumeBuilderScreen({super.key});

  @override
  ConsumerState<ResumeBuilderScreen> createState() => _ResumeBuilderScreenState();
}

class _ResumeBuilderScreenState extends ConsumerState<ResumeBuilderScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _loading = true;

  // Resume data
  final _nameCtrl = TextEditingController();
  final _titleCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _summaryCtrl = TextEditingController();
  List<Map<String, dynamic>> _experience = [{'company': '', 'role': '', 'period': '', 'bullets': ['']}];
  List<Map<String, dynamic>> _education = [{'institution': '', 'degree': '', 'year': ''}];
  List<String> _skills = [''];
  List<String> _certifications = [''];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadResume();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameCtrl.dispose(); _titleCtrl.dispose(); _emailCtrl.dispose();
    _phoneCtrl.dispose(); _locationCtrl.dispose(); _summaryCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadResume() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    try {
      final doc = await FirebaseFirestore.instance.collection('users').doc(user.uid).collection('resume').doc('current').get();
      if (doc.exists) {
        final data = doc.data()!;
        _nameCtrl.text = data['fullName'] ?? '';
        _titleCtrl.text = data['title'] ?? '';
        _emailCtrl.text = data['email'] ?? '';
        _phoneCtrl.text = data['phone'] ?? '';
        _locationCtrl.text = data['location'] ?? '';
        _summaryCtrl.text = data['summary'] ?? '';
        _experience = List<Map<String, dynamic>>.from((data['experience'] as List? ?? []).map((e) => Map<String, dynamic>.from(e)));
        _education = List<Map<String, dynamic>>.from((data['education'] as List? ?? []).map((e) => Map<String, dynamic>.from(e)));
        _skills = List<String>.from(data['skills'] ?? ['']);
        _certifications = List<String>.from(data['certifications'] ?? ['']);
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _saveResume() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    await FirebaseFirestore.instance.collection('users').doc(user.uid).collection('resume').doc('current').set({
      'fullName': _nameCtrl.text, 'title': _titleCtrl.text,
      'email': _emailCtrl.text, 'phone': _phoneCtrl.text,
      'location': _locationCtrl.text, 'summary': _summaryCtrl.text,
      'experience': _experience, 'education': _education,
      'skills': _skills, 'certifications': _certifications,
      'updatedAt': FieldValue.serverTimestamp(),
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: const Text('Resume saved!'), backgroundColor: Theme.of(context).colorScheme.primary),
      );
    }
  }

  String _generatePlainText() {
    final buf = StringBuffer();
    buf.writeln(_nameCtrl.text);
    buf.writeln(_titleCtrl.text);
    buf.writeln('${_emailCtrl.text} | ${_phoneCtrl.text} | ${_locationCtrl.text}');
    buf.writeln();
    if (_summaryCtrl.text.isNotEmpty) { buf.writeln('SUMMARY'); buf.writeln(_summaryCtrl.text); buf.writeln(); }
    buf.writeln('EXPERIENCE');
    for (final exp in _experience) {
      buf.writeln('${exp['role']} — ${exp['company']}');
      buf.writeln(exp['period']);
      for (final b in (exp['bullets'] as List)) { if (b.toString().isNotEmpty) buf.writeln('  • $b'); }
      buf.writeln();
    }
    buf.writeln('EDUCATION');
    for (final edu in _education) { buf.writeln('${edu['degree']} — ${edu['institution']} (${edu['year']})'); }
    buf.writeln();
    buf.writeln('SKILLS: ${_skills.where((s) => s.isNotEmpty).join(', ')}');
    if (_certifications.any((c) => c.isNotEmpty)) {
      buf.writeln(); buf.writeln('CERTIFICATIONS');
      for (final c in _certifications) { if (c.isNotEmpty) buf.writeln('  • $c'); }
    }
    return buf.toString();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(color: cs.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
            child: Icon(Icons.description_outlined, color: cs.primary, size: 16),
          ),
          const SizedBox(width: 8),
          const Text('RESUME BUILDER'),
        ]),
        actions: [
          IconButton(icon: Icon(Icons.share, color: cs.primary), onPressed: () => Share.share(_generatePlainText())),
          IconButton(icon: Icon(Icons.save, color: cs.primary), onPressed: _saveResume),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: cs.primary,
          labelColor: cs.primary,
          unselectedLabelColor: cs.onSurface.withOpacity(0.5),
          tabs: const [
            Tab(icon: Icon(Icons.edit_outlined, size: 18), text: 'Edit'),
            Tab(icon: Icon(Icons.preview_outlined, size: 18), text: 'Preview'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [_buildEditTab(cs), _buildPreviewTab(cs)],
            ),
    );
  }

  Widget _buildEditTab(ColorScheme cs) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Contact
        _sectionCard(cs, Icons.person_outline, 'Contact', [
          _field(_nameCtrl, 'Full Name'), _field(_titleCtrl, 'Professional Title'),
          _field(_emailCtrl, 'Email'), _field(_phoneCtrl, 'Phone'),
          _field(_locationCtrl, 'Location'),
        ]),
        const SizedBox(height: 12),

        // Summary
        _sectionCard(cs, Icons.article_outlined, 'Summary', [
          TextField(controller: _summaryCtrl, maxLines: 4, style: TextStyle(color: cs.onSurface, fontSize: 13),
            decoration: _inputDecor('Professional summary...', cs)),
        ]),
        const SizedBox(height: 12),

        // Experience
        _sectionCardDynamic(cs, Icons.work_outline, 'Experience', _experience, () {
          setState(() => _experience.add({'company': '', 'role': '', 'period': '', 'bullets': ['']}));
        }, (i) {
          final exp = _experience[i];
          return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (i > 0) Divider(color: cs.onSurface.withOpacity(0.06)),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Position ${i + 1}', style: TextStyle(fontSize: 11, color: cs.onSurface.withOpacity(0.4), letterSpacing: 0.8)),
              if (_experience.length > 1) IconButton(icon: Icon(Icons.close, size: 14, color: const Color(0xFFE91E63)), onPressed: () => setState(() => _experience.removeAt(i))),
            ]),
            _dynamicField(exp, 'role', 'Role', cs), _dynamicField(exp, 'company', 'Company', cs),
            _dynamicField(exp, 'period', 'Period (e.g. Jan 2022 – Present)', cs),
            ...List.generate((exp['bullets'] as List).length, (j) {
              return Row(children: [
                Text('•', style: TextStyle(color: cs.onSurface.withOpacity(0.4))),
                const SizedBox(width: 6),
                Expanded(child: TextFormField(
                  initialValue: exp['bullets'][j],
                  onChanged: (v) => exp['bullets'][j] = v,
                  style: TextStyle(color: cs.onSurface, fontSize: 12),
                  decoration: _inputDecor('Achievement...', cs),
                )),
              ]);
            }),
            TextButton.icon(onPressed: () => setState(() => (exp['bullets'] as List).add('')),
              icon: Icon(Icons.add, size: 14, color: cs.primary), label: Text('Add bullet', style: TextStyle(fontSize: 11, color: cs.primary))),
          ]);
        }),
        const SizedBox(height: 12),

        // Education
        _sectionCardDynamic(cs, Icons.school_outlined, 'Education', _education, () {
          setState(() => _education.add({'institution': '', 'degree': '', 'year': ''}));
        }, (i) {
          final edu = _education[i];
          return Column(children: [
            if (i > 0) Divider(color: cs.onSurface.withOpacity(0.06)),
            _dynamicField(edu, 'degree', 'Degree', cs),
            _dynamicField(edu, 'institution', 'Institution', cs),
            _dynamicField(edu, 'year', 'Year', cs),
          ]);
        }),
        const SizedBox(height: 12),

        // Skills
        _listSection(cs, Icons.star_outline, 'Skills', _skills, () => setState(() => _skills.add(''))),
        const SizedBox(height: 12),

        // Certifications
        _listSection(cs, Icons.workspace_premium_outlined, 'Certifications', _certifications, () => setState(() => _certifications.add(''))),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildPreviewTab(ColorScheme cs) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(8),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 24)],
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Header
          Center(child: Column(children: [
            Text(_nameCtrl.text.isEmpty ? 'Your Name' : _nameCtrl.text, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Color(0xFF0f1117))),
            const SizedBox(height: 4),
            Text(_titleCtrl.text, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF00B0BD))),
            const SizedBox(height: 6),
            Text([_emailCtrl.text, _phoneCtrl.text, _locationCtrl.text].where((s) => s.isNotEmpty).join(' • '),
              style: const TextStyle(fontSize: 11, color: Color(0xFF888888))),
          ])),
          Container(height: 2, margin: const EdgeInsets.symmetric(vertical: 16), color: const Color(0xFF00B0BD)),

          // Summary
          if (_summaryCtrl.text.isNotEmpty) ...[
            _previewHeading('PROFESSIONAL SUMMARY'),
            Text(_summaryCtrl.text, style: const TextStyle(fontSize: 12, color: Color(0xFF333333), height: 1.6)),
            const SizedBox(height: 16),
          ],

          // Experience
          if (_experience.any((e) => (e['company'] ?? '').isNotEmpty)) ...[
            _previewHeading('EXPERIENCE'),
            ..._experience.where((e) => (e['company'] ?? '').isNotEmpty).map((exp) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Flexible(child: Text('${exp['role']} — ${exp['company']}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF0f1117)))),
                  Text(exp['period'] ?? '', style: const TextStyle(fontSize: 11, color: Color(0xFF888888))),
                ]),
                const SizedBox(height: 4),
                ...((exp['bullets'] as List?) ?? []).where((b) => b.toString().isNotEmpty).map((b) =>
                  Padding(padding: const EdgeInsets.only(left: 8, bottom: 2), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('• ', style: TextStyle(fontSize: 11, color: Color(0xFF444444))),
                    Expanded(child: Text(b, style: const TextStyle(fontSize: 11, color: Color(0xFF444444), height: 1.4))),
                  ]))),
              ]),
            )),
            const SizedBox(height: 8),
          ],

          // Education
          if (_education.any((e) => (e['institution'] ?? '').isNotEmpty)) ...[
            _previewHeading('EDUCATION'),
            ..._education.where((e) => (e['institution'] ?? '').isNotEmpty).map((edu) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Flexible(child: Text('${edu['degree']} — ${edu['institution']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF0f1117)))),
                Text(edu['year'] ?? '', style: const TextStyle(fontSize: 11, color: Color(0xFF888888))),
              ]),
            )),
            const SizedBox(height: 16),
          ],

          // Skills
          if (_skills.any((s) => s.isNotEmpty)) ...[
            _previewHeading('SKILLS'),
            Wrap(spacing: 6, runSpacing: 6, children: _skills.where((s) => s.isNotEmpty).map((s) =>
              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFe6f7f8), borderRadius: BorderRadius.circular(4)),
                child: Text(s, style: const TextStyle(fontSize: 11, color: Color(0xFF00838f))))).toList()),
            const SizedBox(height: 16),
          ],

          // Certifications
          if (_certifications.any((c) => c.isNotEmpty)) ...[
            _previewHeading('CERTIFICATIONS'),
            ..._certifications.where((c) => c.isNotEmpty).map((c) => Padding(padding: const EdgeInsets.only(bottom: 2), child: Text('• $c', style: const TextStyle(fontSize: 11, color: Color(0xFF444444))))),
          ],
        ]),
      ),
    );
  }

  // Helpers
  Widget _previewHeading(String title) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2, color: Color(0xFF00B0BD))),
  );

  Widget _sectionCard(ColorScheme cs, IconData icon, String title, List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: cs.onSurface.withOpacity(0.06))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [Icon(icon, color: cs.primary, size: 18), const SizedBox(width: 8), Text(title, style: TextStyle(color: cs.onSurface, fontSize: 14, fontWeight: FontWeight.w600))]),
        const SizedBox(height: 12),
        ...children,
      ]),
    );
  }

  Widget _sectionCardDynamic(ColorScheme cs, IconData icon, String title, List items, VoidCallback onAdd, Widget Function(int) builder) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: cs.onSurface.withOpacity(0.06))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon, color: cs.primary, size: 18), const SizedBox(width: 8),
          Expanded(child: Text(title, style: TextStyle(color: cs.onSurface, fontSize: 14, fontWeight: FontWeight.w600))),
          IconButton(icon: Icon(Icons.add, color: cs.primary, size: 18), onPressed: onAdd),
        ]),
        ...List.generate(items.length, builder),
      ]),
    );
  }

  Widget _listSection(ColorScheme cs, IconData icon, String title, List<String> items, VoidCallback onAdd) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: cs.onSurface.withOpacity(0.06))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(icon, color: cs.primary, size: 18), const SizedBox(width: 8),
          Expanded(child: Text(title, style: TextStyle(color: cs.onSurface, fontSize: 14, fontWeight: FontWeight.w600))),
          IconButton(icon: Icon(Icons.add, color: cs.primary, size: 18), onPressed: onAdd),
        ]),
        Wrap(spacing: 8, runSpacing: 8, children: List.generate(items.length, (i) =>
          SizedBox(width: 140, child: Row(children: [
            Expanded(child: TextFormField(initialValue: items[i], onChanged: (v) => items[i] = v,
              style: TextStyle(color: cs.onSurface, fontSize: 12), decoration: _inputDecor('Item', cs))),
            if (items.length > 1) IconButton(icon: Icon(Icons.close, size: 12, color: const Color(0xFFE91E63)), onPressed: () => setState(() => items.removeAt(i))),
          ])))),
      ]),
    );
  }

  Widget _field(TextEditingController ctrl, String hint) {
    final cs = Theme.of(context).colorScheme;
    return Padding(padding: const EdgeInsets.only(bottom: 8), child: TextField(controller: ctrl,
      style: TextStyle(color: cs.onSurface, fontSize: 13), decoration: _inputDecor(hint, cs)));
  }

  Widget _dynamicField(Map<String, dynamic> map, String key, String hint, ColorScheme cs) {
    return Padding(padding: const EdgeInsets.only(bottom: 6), child: TextFormField(
      initialValue: map[key] ?? '', onChanged: (v) => map[key] = v,
      style: TextStyle(color: cs.onSurface, fontSize: 13), decoration: _inputDecor(hint, cs)));
  }

  InputDecoration _inputDecor(String hint, ColorScheme cs) => InputDecoration(
    hintText: hint, hintStyle: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 12),
    isDense: true, contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: cs.onSurface.withOpacity(0.1))),
    focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: cs.primary)),
  );
}
