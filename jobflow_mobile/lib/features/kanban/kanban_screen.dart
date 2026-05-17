import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import '../../domain/entities/job_entity.dart';
import '../../domain/usecases/update_job_status_usecase.dart';
import '../../core/di/injection.dart';
import '../jobs/add_job_screen.dart';
import 'models/job_model.dart'; // for JobStatus
import 'providers/kanban_provider.dart';

class KanbanScreen extends ConsumerStatefulWidget {
  const KanbanScreen({super.key});

  @override
  ConsumerState<KanbanScreen> createState() => _KanbanScreenState();
}

class _KanbanScreenState extends ConsumerState<KanbanScreen> {
  String? _dragJobId;
  String? _hoveredColumn;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final jobsAsync = ref.watch(jobsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('KANBAN'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.of(context).pop()),
      ),
      body: jobsAsync.when(
        data: (jobs) => _buildBoard(context, jobs, cs),
        loading: () => Center(child: CircularProgressIndicator(color: cs.primary)),
        error: (e, _) => Center(child: Text('Erro: $e', style: TextStyle(color: cs.error))),
      ),
    );
  }

  Widget _buildBoard(BuildContext context, List<JobEntity> jobs, ColorScheme cs) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('PIPELINE', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 9, letterSpacing: 1.5, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text('Quadro Kanban', style: TextStyle(color: cs.onSurface, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text('Arraste e solte os cards entre colunas para atualizar o status.', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 11)),
        ]),
      ),
      const SizedBox(height: 8),
      Expanded(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= 600;
            final statuses = JobStatus.values;

            if (isWide) {
              // RESP-02: Desktop/tablet — flexible grid columns
              return AnimationLimiter(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: List.generate(statuses.length, (index) {
                    final status = statuses[index];
                    final columnJobs = jobs.where((j) => j.status == status.value).toList();
                    return Expanded(
                      child: AnimationConfiguration.staggeredList(
                        position: index,
                        duration: const Duration(milliseconds: 375),
                        child: SlideAnimation(
                          verticalOffset: 30.0,
                          child: FadeInAnimation(
                            child: _buildColumn(context, status, columnJobs, cs),
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              );
            }

            // Mobile — horizontal scroll
            return AnimationLimiter(
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: statuses.length,
                itemBuilder: (context, index) {
                  final status = statuses[index];
                  final columnJobs = jobs.where((j) => j.status == status.value).toList();
                  return AnimationConfiguration.staggeredList(
                    position: index,
                    duration: const Duration(milliseconds: 375),
                    child: SlideAnimation(
                      horizontalOffset: 60.0,
                      child: FadeInAnimation(
                        child: _buildColumn(context, status, columnJobs, cs),
                      ),
                    ),
                  );
                },
              ),
            );
          },
        ),
      ),
    ]);
  }

  Widget _buildColumn(BuildContext context, JobStatus status, List<JobEntity> jobs, ColorScheme cs) {
    final statusColor = _parseColor(status.colorHex);
    final isHovered = _hoveredColumn == status.value;

    return DragTarget<String>(
      onWillAcceptWithDetails: (details) {
        setState(() => _hoveredColumn = status.value);
        return true;
      },
      onLeave: (_) => setState(() => _hoveredColumn = null),
      onAcceptWithDetails: (details) {
        setState(() => _hoveredColumn = null);
        final jobId = details.data;
        ref.read(updateJobStatusUseCaseProvider)(
          UpdateJobStatusParams(jobId: jobId, newStatus: status.value),
        );
      },
      builder: (context, candidateData, rejectedData) {
        return Container(
          width: 280, margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
          decoration: BoxDecoration(
            color: isHovered ? cs.primary.withOpacity(0.04) : cs.surface.withOpacity(0.5),
            border: Border.all(color: isHovered ? cs.primary : cs.onSurface.withOpacity(0.06), width: isHovered ? 2 : 1, strokeAlign: isHovered ? BorderSide.strokeAlignInside : BorderSide.strokeAlignCenter),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(children: [
            // Column header
            Padding(
              padding: const EdgeInsets.all(14),
              child: Row(children: [
                Container(width: 8, height: 8, decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle)),
                const SizedBox(width: 8),
                Text(status.label, style: TextStyle(color: cs.onSurface, fontSize: 13, fontWeight: FontWeight.w600)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(color: statusColor.withOpacity(0.12), borderRadius: BorderRadius.circular(100)),
                  child: Text('${jobs.length}', style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w700, fontFamily: 'JetBrains Mono')),
                ),
              ]),
            ),
            // Cards
            Expanded(
              child: jobs.isEmpty
                  ? Center(child: Container(
                      margin: const EdgeInsets.all(14),
                      padding: const EdgeInsets.symmetric(vertical: 28),
                      decoration: BoxDecoration(
                        border: Border.all(color: cs.onSurface.withOpacity(0.08), style: BorderStyle.solid),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(child: Text('Solte aqui', style: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 11))),
                    ))
                  : AnimationLimiter(
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        itemCount: jobs.length,
                        itemBuilder: (context, i) => AnimationConfiguration.staggeredList(
                          position: i,
                          duration: const Duration(milliseconds: 300),
                          child: SlideAnimation(
                            verticalOffset: 20.0,
                            child: FadeInAnimation(
                              child: _buildCard(context, jobs[i], statusColor, cs),
                            ),
                          ),
                        ),
                      ),
                    ),
            ),
          ]),
        );
      },
    );
  }

  Widget _buildCard(BuildContext context, JobEntity job, Color statusColor, ColorScheme cs) {
    final isDragging = _dragJobId == job.id;

    return Draggable<String>(
      data: job.id,
      onDragStarted: () => setState(() => _dragJobId = job.id),
      onDragEnd: (_) => setState(() => _dragJobId = null),
      feedback: Material(
        color: Colors.transparent,
        child: SizedBox(width: 260, child: _cardContent(context, job, statusColor, cs, isDragging: true)),
      ),
      childWhenDragging: Opacity(opacity: 0.3, child: _cardContent(context, job, statusColor, cs)),
      child: GestureDetector(
        onTap: () => Navigator.of(context).push(
          PageRouteBuilder(
            pageBuilder: (_, animation, __) => AddJobScreen(job: job),
            transitionsBuilder: (_, animation, __, child) {
              return FadeTransition(opacity: animation, child: child);
            },
          ),
        ),
        child: Hero(
          tag: 'job_card_${job.id}',
          child: Material(
            color: Colors.transparent,
            child: _cardContent(context, job, statusColor, cs, isDragging: isDragging),
          ),
        ),
      ),
    );
  }

  Widget _cardContent(BuildContext context, JobEntity job, Color statusColor, ColorScheme cs, {bool isDragging = false}) {
    return _AnimatedCard(
      isDragging: isDragging,
      cs: cs,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Header: avatar + company + role
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(color: cs.primary.withOpacity(0.12), borderRadius: BorderRadius.circular(4)),
            child: Center(child: Text(job.company.isNotEmpty ? job.company[0].toUpperCase() : '?', style: TextStyle(color: cs.primary, fontSize: 13, fontWeight: FontWeight.w700))),
          ),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(job.company, style: TextStyle(color: cs.onSurface, fontSize: 13, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
            Text(job.role, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
          ])),
          Icon(Icons.drag_indicator, size: 14, color: cs.onSurface.withOpacity(0.2)),
        ]),

        // Details
        if (job.salary.isNotEmpty || job.location.isNotEmpty) ...[
          const SizedBox(height: 10),
          if (job.salary.isNotEmpty)
            _cardDetail(Icons.attach_money, job.salary, cs),
          if (job.location.isNotEmpty)
            _cardDetail(Icons.location_on, job.location, cs),
        ],
        if (job.appliedDate != null) ...[
          const SizedBox(height: 4),
          _cardDetail(Icons.calendar_today, '${job.appliedDate!.day}/${job.appliedDate!.month}/${job.appliedDate!.year}', cs),
        ],

        // Origin badge
        if (job.origin != 'application') ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(color: cs.onSurface.withOpacity(0.04), borderRadius: BorderRadius.circular(2)),
            child: Text(job.origin.toUpperCase(), style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 9, fontWeight: FontWeight.w500, letterSpacing: 0.5)),
          ),
        ],
      ]),
    );
  }

  Widget _cardDetail(IconData icon, String text, ColorScheme cs) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 3),
      child: Row(children: [
        Icon(icon, size: 11, color: cs.onSurface.withOpacity(0.35)),
        const SizedBox(width: 5),
        Expanded(child: Text(text, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 11, fontFamily: 'JetBrains Mono'), maxLines: 1, overflow: TextOverflow.ellipsis)),
      ]),
    );
  }

  Color _parseColor(String hex) {
    hex = hex.replaceFirst('#', '');
    return Color(int.parse('FF$hex', radix: 16));
  }
}

/// Micro-interaction: subtle scale on press (ANIM-03)
class _AnimatedCard extends StatefulWidget {
  final bool isDragging;
  final ColorScheme cs;
  final Widget child;

  const _AnimatedCard({required this.isDragging, required this.cs, required this.child});

  @override
  State<_AnimatedCard> createState() => _AnimatedCardState();
}

class _AnimatedCardState extends State<_AnimatedCard> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 100));
    _scale = Tween<double>(begin: 1.0, end: 0.96).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = widget.cs;
    final isDragging = widget.isDragging;

    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) => _controller.reverse(),
      onTapCancel: () => _controller.reverse(),
      child: ScaleTransition(
        scale: _scale,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDragging ? cs.primary.withOpacity(0.08) : cs.surface,
            border: Border.all(color: isDragging ? cs.primary : cs.onSurface.withOpacity(0.06), width: isDragging ? 2 : 1),
            borderRadius: BorderRadius.circular(8),
            boxShadow: isDragging ? [BoxShadow(color: cs.primary.withOpacity(0.2), blurRadius: 12, offset: const Offset(0, 4))] : null,
          ),
          child: widget.child,
        ),
      ),
    );
  }
}
