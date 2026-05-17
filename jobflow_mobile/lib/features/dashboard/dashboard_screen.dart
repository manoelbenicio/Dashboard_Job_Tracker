import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/themes/theme_provider.dart';
import '../../core/widgets/adaptive_shell.dart';
import 'layouts/dashboard_command.dart';
import 'layouts/dashboard_pulse.dart';
import 'layouts/dashboard_glass.dart';
import 'layouts/dashboard_matrix.dart';
import 'layouts/dashboard_aurora.dart';

/// Dashboard screen — routes to unique layout per active IndraLayout
/// Wrapped in AdaptiveShell for RESP-01 responsive navigation
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final layout = ref.watch(layoutProvider);

    // Each LAYOUT maps to a unique dashboard widget — colors come from palette
    final Widget dashboardBody = switch (layout) {
      IndraLayout.command => const DashboardCommand(),
      IndraLayout.pulse   => const DashboardPulse(),
      IndraLayout.glass   => const DashboardGlass(),
      IndraLayout.matrix  => const DashboardMatrix(),
      IndraLayout.aurora   => const DashboardAurora(),
    };

    return AdaptiveShell(
      currentIndex: 0,
      onDestinationSelected: (index) {
        switch (index) {
          case 1: context.push('/claire'); break;
          case 2: context.push('/kanban'); break;
          case 3: context.push('/analytics'); break;
          case 4:
            // "More" menu — show bottom sheet with extra destinations
            showModalBottomSheet(
              context: context,
              backgroundColor: Theme.of(context).colorScheme.surface,
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
              builder: (ctx) => SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
                const SizedBox(height: 8),
                Container(width: 40, height: 4, decoration: BoxDecoration(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.1), borderRadius: BorderRadius.circular(2))),
                const SizedBox(height: 16),
                ListTile(leading: Icon(Icons.add_circle_outline, color: Theme.of(context).colorScheme.primary), title: const Text('Add Job'), onTap: () { Navigator.pop(ctx); context.push('/add-job'); }),
                ListTile(leading: Icon(Icons.description_outlined, color: Theme.of(context).colorScheme.primary), title: const Text('Resume Builder'), onTap: () { Navigator.pop(ctx); context.push('/resume'); }),
                ListTile(leading: Icon(Icons.emoji_events_outlined, color: Theme.of(context).colorScheme.primary), title: const Text('Benchmark'), onTap: () { Navigator.pop(ctx); context.push('/benchmark'); }),
                ListTile(leading: Icon(Icons.settings_outlined, color: Theme.of(context).colorScheme.primary), title: const Text('Settings'), onTap: () { Navigator.pop(ctx); context.push('/settings'); }),
                const SizedBox(height: 16),
              ])),
            );
            break;
        }
      },
      body: dashboardBody,
    );
  }
}
