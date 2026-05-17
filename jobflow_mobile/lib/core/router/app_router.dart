import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../features/dashboard/dashboard_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../features/claire/claire_chat_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/jobs/add_job_screen.dart';
import '../../features/jobs/job_detail_screen.dart';
import '../../features/kanban/kanban_screen.dart';
import '../../features/analytics/analytics_screen.dart';
import '../../features/resume/resume_builder_screen.dart';
import '../../features/benchmark/benchmark_screen.dart';
/// Listenable that notifies GoRouter when auth state changes
class AuthNotifier extends ChangeNotifier {
  late final StreamSubscription<User?> _sub;

  AuthNotifier() {
    _sub = FirebaseAuth.instance.authStateChanges().listen((_) {
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}

final _authNotifier = AuthNotifier();

final appRouter = GoRouter(
  initialLocation: '/',
  refreshListenable: _authNotifier,
  redirect: (context, state) {
    final user = FirebaseAuth.instance.currentUser;
    final isOnLogin = state.matchedLocation == '/login';
    if (user == null && !isOnLogin) return '/login';
    if (user != null && isOnLogin) return '/';
    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/',
      name: 'dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/settings',
      name: 'settings',
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: '/claire',
      name: 'claire',
      builder: (context, state) => const ClaireChatScreen(),
    ),
    GoRoute(
      path: '/add-job',
      name: 'add-job',
      builder: (context, state) => const AddJobScreen(),
    ),
    GoRoute(
      path: '/kanban',
      name: 'kanban',
      builder: (context, state) => const KanbanScreen(),
    ),
    GoRoute(
      path: '/analytics',
      name: 'analytics',
      builder: (context, state) => const AnalyticsScreen(),
    ),
    GoRoute(
      path: '/resume',
      name: 'resume',
      builder: (context, state) => const ResumeBuilderScreen(),
    ),
    GoRoute(
      path: '/benchmark',
      name: 'benchmark',
      builder: (context, state) => const BenchmarkScreen(),
    ),
    // Job Detail — open a specific job by ID
    GoRoute(
      path: '/job/:id',
      name: 'job-detail',
      builder: (context, state) {
        final jobId = state.pathParameters['id'] ?? '';
        return JobDetailScreen(jobId: jobId);
      },
    ),
  ],
);
