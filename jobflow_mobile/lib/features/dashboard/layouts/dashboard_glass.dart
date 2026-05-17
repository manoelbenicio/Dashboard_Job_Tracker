import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../kanban/providers/kanban_provider.dart';

/// Layout 3: Indra Glass — Glassmorphism, Radial Orbs, Progress Bars, FAB Actions
class DashboardGlass extends ConsumerWidget {
  const DashboardGlass({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final k = ref.watch(kpiProvider);

    return Stack(children: [
      CustomScrollView(slivers: [
        SliverAppBar(floating: true, title: Row(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: cs.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
            child: Text('JF', style: TextStyle(color: cs.primary, fontWeight: FontWeight.w900, fontSize: 12)),
          ),
          const SizedBox(width: 8),
          Text('JobFlow', style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 16)),
          const Spacer(),
          CircleAvatar(radius: 14, backgroundColor: cs.primary.withOpacity(0.15), child: Icon(Icons.person, color: cs.primary, size: 16)),
        ])),
        SliverPadding(padding: const EdgeInsets.all(16), sliver: SliverList(delegate: SliverChildListDelegate([
          // Dominance probability orb
          Center(child: Container(
            width: 180, height: 180,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(colors: [cs.primary.withOpacity(0.25), cs.primary.withOpacity(0.05), Colors.transparent], stops: const [0, 0.6, 1]),
            ),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text('PROBABILIDADE DE', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 8, letterSpacing: 1.5, fontWeight: FontWeight.w600)),
              Text('DOMINÂNCIA', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 8, letterSpacing: 1.5, fontWeight: FontWeight.w600)),
              Text(k.dominance, style: TextStyle(color: cs.primary, fontSize: 48, fontWeight: FontWeight.w900, height: 1.2)),
              Row(mainAxisSize: MainAxisSize.min, children: [
                Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: cs.secondary.withOpacity(0.15), borderRadius: BorderRadius.circular(4)),
                  child: Text('1%', style: TextStyle(color: cs.secondary, fontSize: 9, fontWeight: FontWeight.bold))),
                const SizedBox(width: 4),
                Text('TOP GLOBAL', style: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 8)),
              ]),
            ]),
          )),
          const SizedBox(height: 24),

          // 2x2 metric cards with progress bars
          Row(children: [
            Expanded(child: _glassCard(context, '${k.sent}', 'Candidaturas', 0.82, cs)),
            const SizedBox(width: 10),
            Expanded(child: _glassCard(context, k.responseRate, 'Taxa Resposta', 0.34, cs)),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: _glassCard(context, '${k.interviews}', 'Entrevistas', 0.65, cs)),
            const SizedBox(width: 10),
            Expanded(child: _glassCard(context, k.speed, 'Velocidade', 0.78, cs)),
          ]),
          const SizedBox(height: 24),

          // Quick actions
          Text('AÇÕES RÁPIDAS', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 9, letterSpacing: 1.5, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          _actionRow(context, Icons.auto_awesome, 'Perguntar à Claire IA', 'Coach de carreira', cs),
          const SizedBox(height: 8),
          _actionRow(context, Icons.description, 'Construtor de Currículo', 'Editor inteligente', cs),
          const SizedBox(height: 80),
        ]))),
      ]),

      // FAB
      Positioned(bottom: 16, right: 16, child: FloatingActionButton(
        onPressed: () => context.push('/claire'),
        backgroundColor: cs.primary,
        child: Icon(Icons.add, color: cs.onPrimary),
      )),
    ]);
  }

  Widget _glassCard(BuildContext context, String val, String label, double progress, ColorScheme cs) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cs.surface.withOpacity(0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cs.primary.withOpacity(0.1)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(val, style: TextStyle(color: cs.onSurface, fontSize: 26, fontWeight: FontWeight.w900)),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 10)),
        const SizedBox(height: 8),
        ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: progress, backgroundColor: cs.primary.withOpacity(0.1), color: cs.primary, minHeight: 4)),
      ]),
    );
  }

  Widget _actionRow(BuildContext context, IconData icon, String title, String sub, ColorScheme cs) {
    return GestureDetector(
      onTap: () => context.push('/claire'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: cs.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: cs.primary.withOpacity(0.08))),
        child: Row(children: [
          Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: cs.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: cs.primary, size: 18)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 13)),
            Text(sub, style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 10)),
          ])),
          Icon(Icons.chevron_right, color: cs.onSurface.withOpacity(0.3)),
        ]),
      ),
    );
  }
}
