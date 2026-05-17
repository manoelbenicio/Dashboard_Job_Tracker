import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/di/injection.dart';
import '../../../core/usecases/usecase.dart';
import '../../../domain/entities/job_entity.dart';

// ─────────────────────────────────────────────────────────
// Jobs provider — backed by JobRepository (clean architecture)
// ─────────────────────────────────────────────────────────

final jobsProvider = StreamProvider<List<JobEntity>>((ref) {
  final watchJobs = ref.watch(watchJobsUseCaseProvider);
  return watchJobs(NoParams());
});

// ─────────────────────────────────────────────────────────
// KPI Metrics — computed from the job stream
// ─────────────────────────────────────────────────────────

class KpiMetrics {
  final int sent;
  final String responseRate;
  final int interviews;
  final int offers;
  final String speed;
  final String completion;
  final String dominance;

  KpiMetrics({
    required this.sent,
    required this.responseRate,
    required this.interviews,
    required this.offers,
    required this.speed,
    required this.completion,
    required this.dominance,
  });

  factory KpiMetrics.empty() {
    return KpiMetrics(
      sent: 0,
      responseRate: '0%',
      interviews: 0,
      offers: 0,
      speed: '--',
      completion: '0%',
      dominance: '0%',
    );
  }
}

// Provider that calculates KPIs based on the current job list
final kpiProvider = Provider<KpiMetrics>((ref) {
  final jobsAsyncValue = ref.watch(jobsProvider);

  return jobsAsyncValue.when(
    data: (jobs) {
      if (jobs.isEmpty) return KpiMetrics.empty();

      int sent = jobs.length;
      int interviews = jobs.where((j) => j.stage.toLowerCase().contains('interview')).length;
      int offers = jobs.where((j) => j.stage.toLowerCase().contains('offer')).length;
      
      // Calculate response rate (jobs that moved past 'Applied' / total sent)
      int responded = jobs.where((j) => !j.stage.toLowerCase().contains('applied')).length;
      String responseRate = sent > 0 ? '${((responded / sent) * 100).round()}%' : '0%';

      // Calculate completion (simple mock: percentage of jobs with a location specified)
      int completed = jobs.where((j) => j.location.isNotEmpty).length;
      String completion = sent > 0 ? '${((completed / sent) * 100).round()}%' : '0%';

      // Calculate dominance (a combination of response rate and interview rate)
      double responsePct = sent > 0 ? (responded / sent) : 0;
      double interviewPct = sent > 0 ? (interviews / sent) : 0;
      double domScore = (responsePct * 40) + (interviewPct * 60) + (sent > 5 ? 10 : 0);
      if (domScore > 99) domScore = 99;
      String dominance = '${domScore.toStringAsFixed(1)}%';

      return KpiMetrics(
        sent: sent,
        responseRate: responseRate,
        interviews: interviews,
        offers: offers,
        speed: '301ms', // Placeholder until history tracking is implemented
        completion: completion,
        dominance: dominance,
      );
    },
    loading: () => KpiMetrics.empty(),
    error: (_, __) => KpiMetrics.empty(),
  );
});
