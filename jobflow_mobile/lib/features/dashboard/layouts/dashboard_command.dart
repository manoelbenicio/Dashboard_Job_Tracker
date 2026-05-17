import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/responsive_grid.dart';
import '../../kanban/providers/kanban_provider.dart';

/// Layout 1: Indra Command — Corporate Precision, Left-Aligned KPIs, Area Chart, Pipeline List
class DashboardCommand extends ConsumerWidget {
  const DashboardCommand({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final k = ref.watch(kpiProvider);

    return CustomScrollView(
      slivers: [
        SliverAppBar(floating: true, title: Row(children: [
          const Icon(Icons.shield, size: 18),
          const SizedBox(width: 8),
          Text('Manoel Benicio', style: TextStyle(color: cs.onSurface, fontSize: 14, fontWeight: FontWeight.bold)),
          const Spacer(),
          CircleAvatar(radius: 14, backgroundColor: cs.primary, child: Text('MB', style: TextStyle(color: cs.onPrimary, fontSize: 10))),
        ])),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverList(delegate: SliverChildListDelegate([
            // RESP-03: Responsive KPI grid
            ResponsiveGrid(children: [
              _kpiCard(context, 'DOMINÂNCIA', k.dominance, '+2.4%', cs),
              _kpiCard(context, 'CANDIDATURAS', '${k.sent}', '+12%', cs),
              _kpiCard(context, 'TAXA DE RESPOSTA', k.responseRate, '+5%', cs),
              _kpiCard(context, 'ENTREVISTAS', '${k.interviews}', '+22%', cs),
            ]),
            const SizedBox(height: 24),

            // Application Trend chart area
            Container(
              height: 160,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: cs.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: cs.primary.withOpacity(0.15)),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Tendência de Candidaturas', style: TextStyle(color: cs.onSurface.withOpacity(0.6), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                Text('Jan — Dez 2026', style: TextStyle(color: cs.onSurface.withOpacity(0.3), fontSize: 9)),
                const SizedBox(height: 12),
                Expanded(child: CustomPaint(painter: _TrendPainter(cs.primary))),
              ]),
            ),
            const SizedBox(height: 24),

            // Active Pipelines header
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Pipelines Ativos', style: TextStyle(color: cs.onSurface, fontSize: 14, fontWeight: FontWeight.bold)),
              Text('VER TODOS ›', style: TextStyle(color: cs.primary, fontSize: 10, fontWeight: FontWeight.bold)),
            ]),
            const SizedBox(height: 12),

            // Pipeline list
            _pipelineList(context, ref, cs),

            const SizedBox(height: 20),
            // Claire entry
            _claireCard(context, cs),
          ])),
        ),
      ],
    );
  }

  Widget _kpiCard(BuildContext context, String label, String value, String delta, ColorScheme cs) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: cs.primary.withOpacity(0.12)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 9, fontWeight: FontWeight.w600, letterSpacing: 0.8)),
        const SizedBox(height: 6),
        Text(value, style: TextStyle(color: cs.onSurface, fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text('$delta vs mês anterior', style: TextStyle(color: cs.primary, fontSize: 9)),
      ]),
    );
  }

  Widget _pipelineList(BuildContext context, WidgetRef ref, ColorScheme cs) {
    final jobsAsync = ref.watch(jobsProvider);
    return jobsAsync.when(
      data: (jobs) {
        if (jobs.isEmpty) return Text('Nenhum pipeline ativo.', style: TextStyle(color: cs.onSurface.withOpacity(0.4)));
        return Column(children: jobs.take(4).map((job) {
          Color sc = cs.primary;
          String badge = job.status.toUpperCase();
          if (badge == 'PENDING') sc = cs.onSurface;
          if (badge == 'REJECTED') sc = cs.error;
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: cs.primary.withOpacity(0.06)),
            ),
            child: Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(job.role, style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                Text('${job.company} // ${job.stage}', style: TextStyle(color: cs.onSurface.withOpacity(0.4), fontSize: 10)),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: sc.withOpacity(0.12), borderRadius: BorderRadius.circular(4)),
                child: Text(badge, style: TextStyle(color: sc, fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ]),
          );
        }).toList());
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Text('Erro: $e', style: TextStyle(color: cs.error, fontSize: 12)),
    );
  }

  Widget _claireCard(BuildContext context, ColorScheme cs) {
    return GestureDetector(
      onTap: () => context.push('/claire'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: cs.primary.withOpacity(0.08), borderRadius: BorderRadius.circular(12), border: Border.all(color: cs.primary.withOpacity(0.2))),
        child: Row(children: [
          Icon(Icons.auto_awesome, color: cs.primary, size: 22),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Claire IA', style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 14)),
            Text('Coach executiva de carreira', style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 11)),
          ])),
          Icon(Icons.chevron_right, color: cs.primary),
        ]),
      ),
    );
  }
}

class _TrendPainter extends CustomPainter {
  final Color color;
  _TrendPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color..strokeWidth = 2..style = PaintingStyle.stroke;
    final fill = Paint()..shader = LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [color.withOpacity(0.3), color.withOpacity(0)]).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    final path = Path();
    final points = [0.7, 0.5, 0.6, 0.3, 0.4, 0.2, 0.35, 0.15, 0.25, 0.1, 0.18, 0.05];
    for (int i = 0; i < points.length; i++) {
      final x = (i / (points.length - 1)) * size.width;
      final y = points[i] * size.height;
      if (i == 0) path.moveTo(x, y); else path.lineTo(x, y);
    }
    canvas.drawPath(path, paint);
    final fillPath = Path.from(path)..lineTo(size.width, size.height)..lineTo(0, size.height)..close();
    canvas.drawPath(fillPath, fill);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
