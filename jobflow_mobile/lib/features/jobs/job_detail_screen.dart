import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../domain/entities/job_entity.dart';
import '../../data/models/job_data_model.dart';

/// Status config for badges
const _statusConfig = {
  'applied': {'label': 'Applied', 'color': Color(0xFF3B82F6)},
  'under_review': {'label': 'Under Review', 'color': Color(0xFF8B5CF6)},
  'interview': {'label': 'Interview', 'color': Color(0xFFF59E0B)},
  'offer': {'label': 'Offer', 'color': Color(0xFF10B981)},
  'accepted': {'label': 'Accepted', 'color': Color(0xFF4EDEA3)},
  'rejected': {'label': 'Rejected', 'color': Color(0xFFEF4444)},
};

const _allStatuses = ['applied', 'under_review', 'interview', 'offer', 'accepted', 'rejected'];

class JobDetailScreen extends ConsumerStatefulWidget {
  final String jobId;
  const JobDetailScreen({super.key, required this.jobId});

  @override
  ConsumerState<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends ConsumerState<JobDetailScreen> {
  final _commentController = TextEditingController();
  bool _loading = true;
  JobEntity? _job;
  List<Map<String, dynamic>> _comments = [];

  @override
  void initState() {
    super.initState();
    _loadJob();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  CollectionReference get _jobsCol {
    final uid = FirebaseAuth.instance.currentUser?.uid ?? '';
    return FirebaseFirestore.instance.collection('users').doc(uid).collection('jobs');
  }

  Future<void> _loadJob() async {
    setState(() => _loading = true);
    try {
      final doc = await _jobsCol.doc(widget.jobId).get();
      if (doc.exists) {
        _job = JobModel.fromFirestore(doc);
        // Load comments subcollection
        final commSnap = await _jobsCol.doc(widget.jobId).collection('comments')
            .orderBy('createdAt', descending: false).get();
        _comments = commSnap.docs.map((d) => {'id': d.id, ...d.data()}).toList();
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _updateField(String field, String value) async {
    await _jobsCol.doc(widget.jobId).update({
      field: value,
      'updatedAt': FieldValue.serverTimestamp(),
    });
    _loadJob();
  }

  Future<void> _updateStatus(String status) async {
    await _jobsCol.doc(widget.jobId).update({
      'status': status,
      'stage': status,
      'updatedAt': FieldValue.serverTimestamp(),
    });
    _loadJob();
  }

  Future<void> _addComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;
    await _jobsCol.doc(widget.jobId).collection('comments').add({
      'text': text,
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
    _commentController.clear();
    _loadJob();
  }

  Future<void> _deleteComment(String commentId) async {
    await _jobsCol.doc(widget.jobId).collection('comments').doc(commentId).delete();
    _loadJob();
  }

  Future<void> _deleteJob() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF002B3A),
        title: const Text('Excluir Candidatura', style: TextStyle(color: Colors.white)),
        content: Text(
          'Tem certeza que deseja excluir ${_job?.role ?? ''} na ${_job?.company ?? ''}?',
          style: const TextStyle(color: Color(0xFF7A9CAE)),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Excluir', style: TextStyle(color: Color(0xFFE91E63))),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await _jobsCol.doc(widget.jobId).delete();
      if (mounted) context.pop();
    }
  }

  void _editField(String field, String currentValue, {bool multiline = false}) {
    final ctrl = TextEditingController(text: currentValue);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF002B3A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 20, right: 20, top: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(field.toUpperCase(), style: const TextStyle(color: Color(0xFF7A9CAE), fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8)),
            const SizedBox(height: 12),
            TextField(
              controller: ctrl,
              autofocus: true,
              maxLines: multiline ? 5 : 1,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF7A9CAE))),
                focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF00B0BD))),
              ),
            ),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(child: OutlinedButton(
                onPressed: () => Navigator.pop(ctx),
                style: OutlinedButton.styleFrom(foregroundColor: const Color(0xFF7A9CAE), side: const BorderSide(color: Color(0xFF7A9CAE))),
                child: const Text('Cancelar'),
              )),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton(
                onPressed: () { _updateField(field, ctrl.text); Navigator.pop(ctx); },
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00B0BD), foregroundColor: const Color(0xFF002B3A)),
                child: const Text('Salvar'),
              )),
            ]),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: const Color(0xFF0F1117),
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: const Center(child: CircularProgressIndicator(color: Color(0xFF00B0BD))),
      );
    }

    if (_job == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0F1117),
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
        body: const Center(child: Text('Vaga não encontrada', style: TextStyle(color: Color(0xFF7A9CAE)))),
      );
    }

    final job = _job!;
    final statusCfg = _statusConfig[job.status] ?? _statusConfig['applied']!;
    final statusColor = statusCfg['color'] as Color;
    final statusLabel = statusCfg['label'] as String;

    return Scaffold(
      backgroundColor: const Color(0xFF0F1117),
      appBar: AppBar(
        backgroundColor: const Color(0xFF002B3A),
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => context.pop()),
        title: const Text('Detalhes', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w300)),
        actions: [
          IconButton(icon: const Icon(Icons.delete_outline, color: Color(0xFFE91E63)), onPressed: _deleteJob),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadJob,
        color: const Color(0xFF00B0BD),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ─── Company Header Card ───
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF002B3A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Container(
                      width: 52, height: 52,
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(child: Text(
                        job.company.isNotEmpty ? job.company[0].toUpperCase() : '?',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: statusColor),
                      )),
                    ),
                    const SizedBox(width: 14),
                    Expanded(child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(job.company, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 2),
                        Text(job.role, style: const TextStyle(color: Color(0xFF7A9CAE), fontSize: 13)),
                      ],
                    )),
                  ]),
                  const SizedBox(height: 16),
                  // Status selector
                  GestureDetector(
                    onTap: () => _showStatusPicker(),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: statusColor.withOpacity(0.3)),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: statusColor)),
                        const SizedBox(width: 8),
                        Text(statusLabel, style: TextStyle(color: statusColor, fontSize: 13, fontWeight: FontWeight.w600)),
                        const SizedBox(width: 6),
                        Icon(Icons.keyboard_arrow_down, size: 16, color: statusColor),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ─── Details Card ───
            _buildCard([
              _buildDetailRow('Empresa', job.company, Icons.business, () => _editField('company', job.company)),
              _buildDetailRow('Cargo', job.role, Icons.work_outline, () => _editField('role', job.role)),
              _buildDetailRow('Salário', job.salary, Icons.attach_money, () => _editField('salary', job.salary), mono: true),
              _buildDetailRow('Localização', job.location, Icons.location_on_outlined, () => _editField('location', job.location)),
              _buildDetailRow('Origem', job.origin, Icons.label_outline, () => _editField('origin', job.origin)),
              _buildDetailRow('Data', job.appliedDate?.toString().split(' ')[0] ?? '—', Icons.calendar_today, null, mono: true),
            ]),
            const SizedBox(height: 16),

            // ─── Description ───
            _buildCard([
              _buildDetailRow('Descrição', job.description, Icons.description, () => _editField('description', job.description, multiline: true)),
              _buildDetailRow('Notas', job.notes, Icons.note_alt_outlined, () => _editField('notes', job.notes, multiline: true)),
            ]),
            const SizedBox(height: 16),

            // ─── Comments ───
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF002B3A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('COMENTÁRIOS (${_comments.length})',
                    style: const TextStyle(color: Color(0xFF7A9CAE), fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.8)),
                  const SizedBox(height: 12),
                  if (_comments.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Center(child: Text('Nenhum comentário ainda.', style: TextStyle(color: Color(0xFF7A9CAE), fontSize: 13))),
                    ),
                  ..._comments.map((c) => _buildCommentTile(c)),
                  const SizedBox(height: 8),
                  Row(children: [
                    Expanded(child: TextField(
                      controller: _commentController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        hintText: 'Adicionar comentário...',
                        hintStyle: TextStyle(color: Color(0xFF7A9CAE), fontSize: 13),
                        enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF7A9CAE))),
                        focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF00B0BD))),
                      ),
                      onSubmitted: (_) => _addComment(),
                    )),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: _addComment,
                      icon: const Icon(Icons.send, color: Color(0xFF00B0BD), size: 20),
                    ),
                  ]),
                ],
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  void _showStatusPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF002B3A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: _allStatuses.map((s) {
            final cfg = _statusConfig[s]!;
            final c = cfg['color'] as Color;
            final l = cfg['label'] as String;
            return ListTile(
              leading: Container(width: 10, height: 10, decoration: BoxDecoration(shape: BoxShape.circle, color: c)),
              title: Text(l, style: const TextStyle(color: Colors.white, fontSize: 14)),
              selected: s == _job?.status,
              selectedTileColor: c.withOpacity(0.08),
              onTap: () { Navigator.pop(ctx); _updateStatus(s); },
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF002B3A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon, VoidCallback? onEdit, {bool mono = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Icon(icon, size: 14, color: const Color(0xFF7A9CAE)),
          const SizedBox(width: 10),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label.toUpperCase(), style: const TextStyle(color: Color(0xFF7A9CAE), fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.6)),
              const SizedBox(height: 3),
              Text(
                value.isEmpty ? '—' : (value.length > 120 ? '${value.substring(0, 120)}...' : value),
                style: TextStyle(
                  color: value.isEmpty ? const Color(0xFF7A9CAE) : Colors.white,
                  fontSize: 13,
                  fontFamily: mono ? 'JetBrains Mono' : null,
                ),
              ),
            ],
          )),
          if (onEdit != null)
            GestureDetector(
              onTap: onEdit,
              child: const Icon(Icons.edit, size: 14, color: Color(0xFF7A9CAE)),
            ),
        ],
      ),
    );
  }

  Widget _buildCommentTile(Map<String, dynamic> comment) {
    final ts = comment['createdAt'];
    String dateStr = '';
    if (ts is Timestamp) {
      dateStr = '${ts.toDate().day}/${ts.toDate().month}/${ts.toDate().year} ${ts.toDate().hour}:${ts.toDate().minute.toString().padLeft(2, '0')}';
    }
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF00B0BD).withOpacity(0.04),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(dateStr, style: const TextStyle(color: Color(0xFF7A9CAE), fontSize: 10, fontFamily: 'JetBrains Mono')),
            GestureDetector(
              onTap: () => _deleteComment(comment['id']),
              child: const Icon(Icons.close, size: 14, color: Color(0xFFE91E63)),
            ),
          ]),
          const SizedBox(height: 6),
          Text(comment['text'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.5)),
        ],
      ),
    );
  }
}
