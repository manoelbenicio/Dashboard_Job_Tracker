import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../kanban/providers/kanban_provider.dart';

/// Layout 2: Indra Pulse — Bloomberg Terminal, Giant Hero Counter, Real-Time Feed
class DashboardPulse extends ConsumerWidget {
  const DashboardPulse({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final k = ref.watch(kpiProvider);

    return CustomScrollView(slivers: [
      SliverAppBar(floating: true, title: Row(children: [
        Text('⚡ LIVE', style: TextStyle(color: cs.primary, fontSize: 11, fontWeight: FontWeight.bold)),
        const SizedBox(width: 8),
        Text('• MERCADO ABERTO', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 10)),
        const Spacer(),
        CircleAvatar(radius: 14, backgroundColor: cs.primary.withOpacity(0.2), child: Text('MB', style: TextStyle(color: cs.primary, fontSize: 10, fontWeight: FontWeight.bold))),
      ])),
      SliverPadding(padding: const EdgeInsets.all(16), sliver: SliverList(delegate: SliverChildListDelegate([
        // Giant hero counter
        Container(
          width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 32),
          decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(8)),
          child: Column(children: [
            Text('TAXA DE DOMINÂNCIA DO MERCADO', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 9, letterSpacing: 1.5, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(k.dominance, style: TextStyle(color: cs.primary, fontSize: 72, fontWeight: FontWeight.w900, height: 1)),
            const SizedBox(height: 4),
            Text('▲ +2.4% NO ÚLTIMO QUARTER', style: TextStyle(color: cs.primary, fontSize: 10, fontWeight: FontWeight.bold)),
            Text('Top 1%', style: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 10)),
          ]),
        ),
        const SizedBox(height: 16),

        // 3-column sparkline stats
        Row(children: [
          Expanded(child: _sparkStat(context, '${k.sent}', 'ENV', cs)),
          const SizedBox(width: 8),
          Expanded(child: _sparkStat(context, k.responseRate, 'RESP', cs)),
          const SizedBox(width: 8),
          Expanded(child: _sparkStat(context, '${k.offers}', 'OFERTAS', cs)),
        ]),
        const SizedBox(height: 24),

        // Real-time feed header
        Text('FEED EM TEMPO REAL', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 9, letterSpacing: 1.5, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),

        // Live feed items from database
        ref.watch(jobsProvider).when(
          data: (jobs) {
            if (jobs.isEmpty) return Padding(padding: const EdgeInsets.symmetric(vertical: 20), child: Text('Nenhuma atividade recente no mercado.', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 12, fontStyle: FontStyle.italic)));
            return Column(
              children: jobs.take(4).map((j) {
                String icon = '🔵';
                if (j.status.toLowerCase() == 'rejected') icon = '🔴';
                if (j.status.toLowerCase() == 'offer') icon = '🟢';
                if (j.status.toLowerCase() == 'pending') icon = '🟠';
                return _feedItem(cs, icon, '${j.company} — ${j.role} (${j.stage.toUpperCase()})', j.status.toUpperCase());
              }).toList(),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Text('Erro ao carregar feed: $e'),
        ),

        const SizedBox(height: 24),
        _claireCard(context, cs),
      ]))),
    ]);
  }

  Widget _sparkStat(BuildContext context, String val, String label, ColorScheme cs) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(6), border: Border.all(color: cs.primary.withOpacity(0.08))),
      child: Column(children: [
        Text(val, style: TextStyle(color: cs.onSurface, fontSize: 22, fontWeight: FontWeight.w900)),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 9, fontWeight: FontWeight.w600, letterSpacing: 1)),
        const SizedBox(height: 8),
        // Mini sparkline bars
        Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: List.generate(8, (i) => Container(margin: const EdgeInsets.symmetric(horizontal: 1), width: 4, height: 4.0 + (i * 2.5), decoration: BoxDecoration(color: cs.primary.withOpacity(0.3 + i * 0.08), borderRadius: BorderRadius.circular(1))))),
      ]),
    );
  }

  Widget _feedItem(ColorScheme cs, String icon, String text, String time) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(6), border: Border.all(color: cs.primary.withOpacity(0.05))),
      child: Row(children: [
        Text(icon, style: const TextStyle(fontSize: 14)),
        const SizedBox(width: 10),
        Expanded(child: Text(text, style: TextStyle(color: cs.onSurface.withOpacity(0.8), fontSize: 11, height: 1.3))),
        Text(time, style: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 9)),
      ]),
    );
  }

  Widget _claireCard(BuildContext context, ColorScheme cs) {
    return GestureDetector(
      onTap: () => context.push('/claire'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: cs.primary.withOpacity(0.08), borderRadius: BorderRadius.circular(8), border: Border.all(color: cs.primary.withOpacity(0.2))),
        child: Row(children: [
          Icon(Icons.auto_awesome, color: cs.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Claire IA', style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 13)),
            Text('Coach executiva de carreira', style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 10)),
          ])),
          Icon(Icons.chevron_right, color: cs.primary),
        ]),
      ),
    );
  }
}
