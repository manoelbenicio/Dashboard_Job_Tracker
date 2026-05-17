import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/responsive_grid.dart';
import '../../kanban/providers/kanban_provider.dart';

/// Layout 5: Indra Aurora — Luminous Gradients, Kanban Preview, Sky-Blue Accents
class DashboardAurora extends ConsumerWidget {
  const DashboardAurora({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final k = ref.watch(kpiProvider);

    return CustomScrollView(slivers: [
      SliverAppBar(floating: true, title: Row(children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(color: cs.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
          child: Text('JF', style: TextStyle(color: cs.primary, fontWeight: FontWeight.w900, fontSize: 12)),
        ),
        const SizedBox(width: 8),
        Text('JobFlow', style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 16)),
        const Spacer(),
        CircleAvatar(radius: 14, backgroundColor: cs.primary.withOpacity(0.15), child: Text('MB', style: TextStyle(color: cs.primary, fontSize: 10, fontWeight: FontWeight.bold))),
      ])),
      SliverPadding(padding: const EdgeInsets.all(16), sliver: SliverList(delegate: SliverChildListDelegate(AnimationConfiguration.toStaggeredList(
        duration: const Duration(milliseconds: 375),
        childAnimationBuilder: (widget) => SlideAnimation(
          verticalOffset: 30.0,
          child: FadeInAnimation(child: widget),
        ),
        children: [
        // Dominance card with gradient border
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [cs.surface, cs.primary.withOpacity(0.08)]),
            border: Border.all(color: cs.primary.withOpacity(0.2)),
          ),
          child: Column(children: [
            Text('PROBABILIDADE DE DOMINÂNCIA', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 9, letterSpacing: 1.5, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(k.dominance.replaceAll('%', ''), style: TextStyle(color: cs.primary, fontSize: 56, fontWeight: FontWeight.w900, height: 1)),
              Padding(padding: const EdgeInsets.only(top: 8), child: Text('%', style: TextStyle(color: cs.primary, fontSize: 24, fontWeight: FontWeight.bold))),
            ]),
            const SizedBox(height: 4),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text('▲ +2.4%', style: TextStyle(color: cs.secondary, fontSize: 11, fontWeight: FontWeight.bold)),
              Text('  vs último quarter', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 10)),
            ]),
          ]),
        ),
        const SizedBox(height: 16),

        // RESP-03: Responsive KPI pills
        ResponsiveGrid(spacing: 8, runSpacing: 8, children: [
          _pill(context, '${k.sent}', 'Enviadas', cs),
          _pill(context, k.responseRate, 'Resposta', cs),
          _pill(context, '${k.interviews}', 'Entrevistas', cs),
          _pill(context, '${k.offers}', 'Ofertas', cs),
        ]),
        const SizedBox(height: 24),

        // Pipeline Board (Kanban preview)
        Text('QUADRO DO PIPELINE', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 9, letterSpacing: 1.5, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        _kanbanPreview(context, ref, cs),

        const SizedBox(height: 24),
        // Claire card
        GestureDetector(
          onTap: () => context.push('/claire'),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              gradient: LinearGradient(colors: [cs.primary.withOpacity(0.12), cs.secondary.withOpacity(0.08)]),
              border: Border.all(color: cs.primary.withOpacity(0.2)),
            ),
            child: Row(children: [
              Icon(Icons.auto_awesome, color: cs.primary, size: 22),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Claire IA Coach', style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 14)),
                Text('Estratégia & análise executiva', style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 11)),
              ])),
              Icon(Icons.chevron_right, color: cs.primary),
            ]),
          ),
        ),
      ])))),
    ]);
  }

  Widget _pill(BuildContext context, String val, String label, ColorScheme cs) {
    return _InteractivePill(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: cs.primary.withOpacity(0.1))),
        child: Row(children: [
          Text(val, style: TextStyle(color: cs.onSurface, fontSize: 22, fontWeight: FontWeight.w900)),
          const SizedBox(width: 8),
          Expanded(child: Text(label, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 10))),
        ]),
      ),
    );
  }

  Widget _kanbanPreview(BuildContext context, WidgetRef ref, ColorScheme cs) {
    final jobsAsync = ref.watch(jobsProvider);
    return jobsAsync.when(
      data: (jobs) {
        final applied = jobs.where((j) => j.stage.toLowerCase().contains('appl')).take(2).toList();
        final interview = jobs.where((j) => j.stage.toLowerCase().contains('inter')).take(2).toList();
        return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(child: _kanbanColumn('APLICADAS (${applied.length})', applied, cs.primary, cs)),
          const SizedBox(width: 8),
          Expanded(child: _kanbanColumn('ENTREVISTA (${interview.length})', interview, cs.secondary, cs)),
        ]);
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Text('Erro: $e'),
    );
  }

  Widget _kanbanColumn(String title, List jobs, Color accent, ColorScheme cs) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Container(width: 6, height: 6, decoration: BoxDecoration(color: accent, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(title, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 9, fontWeight: FontWeight.bold)),
      ]),
      const SizedBox(height: 8),
      ...jobs.map((job) => Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(8), border: Border.all(color: accent.withOpacity(0.12))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(job.role, style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
          Text(job.company, style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 10)),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: accent.withOpacity(0.1), borderRadius: BorderRadius.circular(3)),
            child: Text(job.status.toUpperCase(), style: TextStyle(color: accent, fontSize: 8, fontWeight: FontWeight.bold)),
          ),
        ]),
      )),
      if (jobs.isEmpty) Text('Nenhum item', style: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 10)),
    ]);
  }
}

class _InteractivePill extends StatefulWidget {
  final Widget child;
  const _InteractivePill({required this.child});
  @override
  State<_InteractivePill> createState() => _InteractivePillState();
}

class _InteractivePillState extends State<_InteractivePill> {
  bool _pressed = false;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.95 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: widget.child,
      ),
    );
  }
}
