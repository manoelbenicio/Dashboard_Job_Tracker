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
        if (index == 1) context.push('/claire');
        if (index == 2) context.push('/add-job');
        if (index == 3) context.push('/kanban');
        if (index == 4) context.push('/settings');
      },
      body: dashboardBody,
    );
  }
}
