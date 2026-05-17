import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../kanban/models/job_model.dart';
import '../../core/di/injection.dart';
import '../../core/services/job_share_service.dart';
import '../../core/services/job_scraper_service.dart';
import '../../domain/entities/job_entity.dart';

class AddJobScreen extends ConsumerStatefulWidget {
  final JobEntity? job;
  final String? jobId; // PLAT-02: for deep link resolution

  const AddJobScreen({super.key, this.job, this.jobId});

  bool get isEditMode => job != null || jobId != null;

  @override
  ConsumerState<AddJobScreen> createState() => _AddJobScreenState();
}

class _AddJobScreenState extends ConsumerState<AddJobScreen> {
  final _urlCtrl = TextEditingController();
  final _companyCtrl = TextEditingController();
  final _roleCtrl = TextEditingController();
  final _salaryCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  final _jobUrlCtrl = TextEditingController();

  bool _fetching = false;
  String _fetchError = '';
  String _selectedStatus = 'under_review';
  String _selectedOrigin = 'application';
  DateTime _appliedDate = DateTime.now();
  JobEntity? _resolvedJob;

  @override
  void initState() {
    super.initState();
    final job = widget.job;
    if (job != null) {
      _prefillFrom(job);
    } else if (widget.jobId != null) {
      // PLAT-02: Resolve job from deep link ID
      _resolveDeepLink(widget.jobId!);
    }
  }

  void _prefillFrom(JobEntity job) {
    _resolvedJob = job;
    _companyCtrl.text = job.company;
    _roleCtrl.text = job.role;
    _salaryCtrl.text = job.salary;
    _locationCtrl.text = job.location;
    _descCtrl.text = job.description;
    _notesCtrl.text = job.notes;
    _jobUrlCtrl.text = job.url;
    _selectedStatus = job.status;
    _selectedOrigin = job.origin;
    _appliedDate = job.appliedDate ?? DateTime.now();
  }

  Future<void> _resolveDeepLink(String jobId) async {
    setState(() => _fetching = true);
    try {
      final repo = ref.read(jobRepositoryProvider);
      final jobs = await repo.watchJobs().first;
      final match = jobs.where((j) => j.id == jobId).firstOrNull;
      if (match != null) {
        setState(() => _prefillFrom(match));
      } else {
        setState(() => _fetchError = 'Job ID "$jobId" não encontrado');
      }
    } catch (e) {
      setState(() => _fetchError = 'Erro ao carregar: $e');
    } finally {
      setState(() => _fetching = false);
    }
  }

  @override
  void dispose() {
    _urlCtrl.dispose();
    _companyCtrl.dispose();
    _roleCtrl.dispose();
    _salaryCtrl.dispose();
    _locationCtrl.dispose();
    _descCtrl.dispose();
    _notesCtrl.dispose();
    _jobUrlCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchFromUrl() async {
    final url = _urlCtrl.text.trim();
    if (url.isEmpty) return;
    setState(() { _fetching = true; _fetchError = ''; });
    try {
      final data = await JobScraperService.scrapeJob(url);
      setState(() {
        _companyCtrl.text = data['company'] ?? '';
        _roleCtrl.text = data['role'] ?? '';
        _salaryCtrl.text = data['salary'] ?? '';
        _locationCtrl.text = data['location'] ?? '';
        _descCtrl.text = data['description'] ?? '';
        _jobUrlCtrl.text = url;
      });
    } catch (e) {
      setState(() => _fetchError = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      setState(() => _fetching = false);
    }
  }

  Future<void> _submit() async {
    if (_companyCtrl.text.trim().isEmpty || _roleCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Empresa e Cargo são obrigatórios'), backgroundColor: Colors.red),
      );
      return;
    }

    final job = JobEntity(
      id: widget.job?.id ?? '', // Firestore will generate if empty
      company: _companyCtrl.text.trim(),
      role: _roleCtrl.text.trim(),
      stage: widget.job?.stage ?? _selectedStatus,
      status: _selectedStatus,
      location: _locationCtrl.text.trim(),
      salary: _salaryCtrl.text.trim(),
      description: _descCtrl.text.trim(),
      url: _jobUrlCtrl.text.trim(),
      origin: _selectedOrigin,
      notes: _notesCtrl.text.trim(),
      appliedDate: _appliedDate,
    );

    try {
      if (widget.isEditMode) {
        await ref.read(updateJobUseCaseProvider)(job);
      } else {
        await ref.read(addJobUseCaseProvider)(job);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.isEditMode ? '${job.role} atualizada ✓' : '${job.role} na ${job.company} adicionada ✓'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    final isEdit = widget.isEditMode;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'EDITAR CANDIDATURA' : 'NOVA CANDIDATURA'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.of(context).pop()),
        actions: [
          if (isEdit && _resolvedJob != null)
            IconButton(
              icon: const Icon(Icons.share),
              tooltip: 'Compartilhar',
              onPressed: () => JobShareService.shareJob(_resolvedJob!),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Hero(
          tag: _resolvedJob != null ? 'job_card_${_resolvedJob!.id}' : 'job_card_new',
          child: Material(
            color: Colors.transparent,
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              // URL Scraper bar
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: cs.primary.withOpacity(0.15))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Icon(Icons.link, color: cs.primary, size: 18),
                const SizedBox(width: 8),
                Text('IMPORTAR DA URL', style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1)),
              ]),
              const SizedBox(height: 10),
              Row(children: [
                Expanded(child: TextField(
                  controller: _urlCtrl,
                  style: TextStyle(color: cs.onSurface, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'Cole a URL da vaga (LinkedIn, Indeed, Glassdoor...)',
                    hintStyle: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 12),
                    filled: true, fillColor: cs.surface,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.08))),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.08))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: cs.primary)),
                  ),
                  onSubmitted: (_) => _fetchFromUrl(),
                )),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _fetching || _urlCtrl.text.trim().isEmpty ? null : _fetchFromUrl,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: cs.primary, foregroundColor: cs.onPrimary,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                  child: _fetching
                      ? SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: cs.onPrimary))
                      : Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.download, size: 14, color: cs.onPrimary),
                          const SizedBox(width: 4),
                          const Text('Buscar', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ]),
                ),
              ]),
              if (_fetchError.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(children: [
                  Icon(Icons.error_outline, color: cs.error, size: 14),
                  const SizedBox(width: 6),
                  Expanded(child: Text(_fetchError, style: TextStyle(color: cs.error, fontSize: 11))),
                ]),
              ],
            ]),
          ),
          const SizedBox(height: 20),

          // Form fields
          _sectionLabel('DADOS DA VAGA', cs),
          const SizedBox(height: 12),

          Row(children: [
            Expanded(child: _field('Empresa *', _companyCtrl, 'Ex: Google', cs)),
            const SizedBox(width: 12),
            Expanded(child: _field('Cargo *', _roleCtrl, 'Ex: Senior Engineer', cs)),
          ]),
          const SizedBox(height: 12),

          Row(children: [
            Expanded(child: _dropdownField('Status', _selectedStatus, JobStatus.values.map((e) => e.value).toList(), JobStatus.values.map((e) => e.label).toList(), (v) => setState(() => _selectedStatus = v), cs)),
            const SizedBox(width: 12),
            Expanded(child: _dropdownField('Origem', _selectedOrigin, ['application', 'referral', 'recruiter', 'other'], ['Candidatura', 'Indicação', 'Recrutador', 'Outro'], (v) => setState(() => _selectedOrigin = v), cs)),
          ]),
          const SizedBox(height: 12),

          Row(children: [
            Expanded(child: _field('Salário', _salaryCtrl, '\$120k - \$180k', cs)),
            const SizedBox(width: 12),
            Expanded(child: _field('Localização', _locationCtrl, 'São Paulo, SP', cs)),
          ]),
          const SizedBox(height: 12),

          // Applied date
          GestureDetector(
            onTap: () async {
              final picked = await showDatePicker(context: context, initialDate: _appliedDate, firstDate: DateTime(2020), lastDate: DateTime(2030));
              if (picked != null) setState(() => _appliedDate = picked);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
              decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(6), border: Border.all(color: cs.onSurface.withOpacity(0.08))),
              child: Row(children: [
                Icon(Icons.calendar_today, size: 14, color: cs.onSurface.withOpacity(0.4)),
                const SizedBox(width: 8),
                Text('Data: ${_appliedDate.day}/${_appliedDate.month}/${_appliedDate.year}', style: TextStyle(color: cs.onSurface, fontSize: 13)),
              ]),
            ),
          ),
          const SizedBox(height: 12),

          _field('URL da Vaga', _jobUrlCtrl, 'https://...', cs),
          const SizedBox(height: 12),
          _field('Descrição', _descCtrl, 'Breve descrição da vaga...', cs, maxLines: 4),
          const SizedBox(height: 12),
          _field('Notas Pessoais', _notesCtrl, 'Notas pessoais...', cs, maxLines: 3),
          const SizedBox(height: 24),

          // Action buttons
          Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: cs.onSurface.withOpacity(0.1)),
                  minimumSize: const Size(0, 48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: Text('Cancelar', style: TextStyle(color: cs.onSurface.withOpacity(0.6))),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: cs.primary, foregroundColor: cs.onPrimary,
                  minimumSize: const Size(0, 48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: Text(isEdit ? 'Salvar Alterações' : 'Adicionar Candidatura', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              ),
            ),
          ]), // closes Row
          const SizedBox(height: 32),
        ]), // closes Column
      ), // closes Material
    ), // closes Hero
  ), // closes SingleChildScrollView
); // closes Scaffold
}

  Widget _sectionLabel(String text, ColorScheme cs) {
    return Text(text, style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1.2));
  }

  Widget _field(String label, TextEditingController ctrl, String hint, ColorScheme cs, {int maxLines = 1}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.w600)),
      const SizedBox(height: 4),
      TextField(
        controller: ctrl, maxLines: maxLines,
        style: TextStyle(color: cs.onSurface, fontSize: 13),
        decoration: InputDecoration(
          hintText: hint, hintStyle: TextStyle(color: cs.onSurface.withOpacity(0.25), fontSize: 12),
          filled: true, fillColor: cs.surface,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.08))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: cs.onSurface.withOpacity(0.08))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: cs.primary)),
        ),
      ),
    ]);
  }

  Widget _dropdownField(String label, String value, List<String> values, List<String> labels, ValueChanged<String> onChanged, ColorScheme cs) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.w600)),
      const SizedBox(height: 4),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(6), border: Border.all(color: cs.onSurface.withOpacity(0.08))),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: value, isExpanded: true, dropdownColor: cs.surface,
            style: TextStyle(color: cs.onSurface, fontSize: 13),
            items: List.generate(values.length, (i) => DropdownMenuItem(value: values[i], child: Text(labels[i]))),
            onChanged: (v) => onChanged(v!),
          ),
        ),
      ),
    ]);
  }
}
