import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../kanban/providers/kanban_provider.dart';

/// Layout 4: Indra Matrix — Data-Dense Grid, Terminal Aesthetic
class DashboardMatrix extends ConsumerWidget {
  const DashboardMatrix({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          title: const Text('JOBFLOW // MATRIX v3.0'),
          floating: true,
          actions: [
            Container(
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: cs.secondary.withOpacity(0.12),
                border: Border.all(color: cs.secondary.withOpacity(0.2)),
              ),
              child: Text('● LIVE', style: TextStyle(color: cs.secondary, fontSize: 10, fontWeight: FontWeight.bold)),
            )
          ],
        ),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              _claireWidget(context, cs),
              const SizedBox(height: 24),
              _dominanceTile(context, ref, cs),
              const SizedBox(height: 12),
              _kpiGrid(context, ref, cs),
              const SizedBox(height: 24),
              _pipelineRegistry(context, ref, cs),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _claireWidget(BuildContext context, ColorScheme cs) {
    return GestureDetector(
      onTap: () => context.push('/claire'),
      child: Container(
        decoration: BoxDecoration(
          color: cs.surface,
          border: Border.all(color: cs.primary.withOpacity(0.3)),
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: cs.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: Icon(Icons.auto_awesome, color: cs.primary, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Claire IA Coach Executiva', style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 14)),
                Text('Pronta para estratégia & análise', style: TextStyle(color: cs.onSurface.withOpacity(0.6), fontSize: 11)),
              ]),
            ),
            Icon(Icons.chevron_right, color: cs.onSurface.withOpacity(0.4), size: 20),
          ],
        ),
      ),
    );
  }

  Widget _dominanceTile(BuildContext context, WidgetRef ref, ColorScheme cs) {
    final k = ref.watch(kpiProvider);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: cs.surface, border: Border.all(color: cs.onSurface.withOpacity(0.04))),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('ÍNDICE DE DOMINÂNCIA', style: Theme.of(context).textTheme.labelSmall),
            const SizedBox(height: 4),
            Text(k.dominance, style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 32, color: cs.onSurface)),
            const SizedBox(height: 4),
            Text('▲ TOP 1% GLOBAL', style: TextStyle(color: cs.primary, fontSize: 10, fontWeight: FontWeight.bold)),
          ]),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(7, (i) => Container(margin: const EdgeInsets.only(left: 3), width: 8, height: 10.0 + (i * 5), color: i == 6 ? cs.primary : cs.secondary)),
          )
        ],
      ),
    );
  }

  Widget _kpiGrid(BuildContext context, WidgetRef ref, ColorScheme cs) {
    final k = ref.watch(kpiProvider);
    return GridView.count(
      crossAxisCount: 3, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 1.2,
      children: [
        _tile(context, '${k.sent}', 'ENV', '+12%', cs.secondary, cs),
        _tile(context, k.responseRate, 'RESP', '+5%', cs.secondary, cs),
        _tile(context, '${k.interviews}', 'ENTV', '+22%', cs.secondary, cs),
        _tile(context, '${k.offers}', 'OFERTA', '+1', cs.secondary, cs),
        _tile(context, k.speed, 'VELOC', '-8%', cs.error, cs),
        _tile(context, k.completion, 'COMPL', 'AA', cs.secondary, cs),
      ],
    );
  }

  Widget _tile(BuildContext context, String val, String label, String delta, Color c, ColorScheme cs) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(color: cs.surface, border: Border.all(color: cs.onSurface.withOpacity(0.04))),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Text(val, style: Theme.of(context).textTheme.displayMedium?.copyWith(fontSize: 22, color: cs.onSurface)),
        const SizedBox(height: 4),
        Text(label, style: Theme.of(context).textTheme.labelSmall?.copyWith(fontSize: 8)),
        const SizedBox(height: 4),
        Text(delta, style: TextStyle(color: c, fontSize: 9, fontWeight: FontWeight.bold)),
      ]),
    );
  }

  Widget _pipelineRegistry(BuildContext context, WidgetRef ref, ColorScheme cs) {
    final jobsAsync = ref.watch(jobsProvider);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        child: Row(children: [
          Expanded(flex: 2, child: Text('ALVO', style: Theme.of(context).textTheme.labelSmall?.copyWith(fontSize: 9))),
          Expanded(flex: 1, child: Text('FASE', style: Theme.of(context).textTheme.labelSmall?.copyWith(fontSize: 9))),
          Expanded(flex: 1, child: Text('STATUS', style: Theme.of(context).textTheme.labelSmall?.copyWith(fontSize: 9))),
        ]),
      ),
      Divider(color: cs.onSurface.withOpacity(0.2), height: 1),
      jobsAsync.when(
        data: (jobs) {
          if (jobs.isEmpty) return Padding(padding: const EdgeInsets.all(16), child: Text('Nenhum registro no pipeline.', style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 12)));
          return Column(children: jobs.take(5).map((job) {
            Color sc = cs.secondary;
            if (job.status.toLowerCase() == 'pending') sc = cs.onSurface;
            if (job.status.toLowerCase() == 'rejected') sc = cs.error;
            return Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(border: Border(bottom: BorderSide(color: cs.onSurface.withOpacity(0.03)))),
              child: Row(children: [
                Expanded(flex: 2, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(job.role, style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                  Text(job.company, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 10), maxLines: 1, overflow: TextOverflow.ellipsis),
                ])),
                Expanded(flex: 1, child: Text(job.stage.toUpperCase(), style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 9))),
                Expanded(flex: 1, child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: sc.withOpacity(0.1), borderRadius: BorderRadius.circular(2)),
                  child: Text(job.status.toUpperCase(), style: TextStyle(color: sc, fontSize: 8, fontWeight: FontWeight.bold)),
                )),
              ]),
            );
          }).toList());
        },
        loading: () => Center(child: CircularProgressIndicator(color: cs.primary)),
        error: (e, _) => Padding(padding: const EdgeInsets.all(16), child: Text('Erro: $e', style: TextStyle(color: cs.error, fontSize: 12))),
      ),
    ]);
  }
}
