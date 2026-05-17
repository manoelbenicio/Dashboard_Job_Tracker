import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

/// Mobile Analytics Dashboard — premium KPI cards + activity breakdown
class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  Map<String, int> _statusCounts = {};
  int _totalJobs = 0;
  int _totalComments = 0;
  int _thisWeekJobs = 0;
  bool _loading = true;
  List<Map<String, dynamic>> _recentJobs = [];

  @override
  void initState() {
    super.initState();
    _loadAnalytics();
  }

  Future<void> _loadAnalytics() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    try {
      final jobsSnap = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .collection('jobs')
          .get();

      final now = DateTime.now();
      final weekAgo = now.subtract(const Duration(days: 7));
      int weekCount = 0;
      int commentCount = 0;
      final Map<String, int> counts = {};
      final List<Map<String, dynamic>> recent = [];

      for (final doc in jobsSnap.docs) {
        final data = doc.data();
        final status = (data['status'] ?? 'Applied') as String;
        counts[status] = (counts[status] ?? 0) + 1;

        // Count comments
        final comments = data['comments'] as List<dynamic>? ?? [];
        commentCount += comments.length;

        // Check this week
        final createdAt = data['createdAt'];
        if (createdAt != null) {
          DateTime? created;
          if (createdAt is Timestamp) created = createdAt.toDate();
          if (createdAt is String) created = DateTime.tryParse(createdAt);
          if (created != null && created.isAfter(weekAgo)) weekCount++;
        }

        recent.add({...data, 'id': doc.id});
      }

      // Sort recent by date
      recent.sort((a, b) {
        final aDate = a['createdAt'];
        final bDate = b['createdAt'];
        if (aDate == null || bDate == null) return 0;
        return bDate.toString().compareTo(aDate.toString());
      });

      if (mounted) {
        setState(() {
          _statusCounts = counts;
          _totalJobs = jobsSnap.docs.length;
          _totalComments = commentCount;
          _thisWeekJobs = weekCount;
          _recentJobs = recent.take(10).toList();
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Row(mainAxisSize: MainAxisSize.min, children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: cs.primary.withOpacity(0.15),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Icon(Icons.analytics_outlined, color: cs.primary, size: 16),
          ),
          const SizedBox(width: 8),
          const Text('ANALYTICS'),
        ]),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadAnalytics,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // KPI Cards Row
                  Row(children: [
                    Expanded(child: _kpiCard(cs, 'Total Jobs', '$_totalJobs', Icons.work_outline, cs.primary)),
                    const SizedBox(width: 12),
                    Expanded(child: _kpiCard(cs, 'This Week', '$_thisWeekJobs', Icons.calendar_today, const Color(0xFF27AE60))),
                  ]),
                  const SizedBox(height: 12),
                  Row(children: [
                    Expanded(child: _kpiCard(cs, 'Comments', '$_totalComments', Icons.chat_bubble_outline, const Color(0xFFFF9800))),
                    const SizedBox(width: 12),
                    Expanded(child: _kpiCard(cs, 'Statuses', '${_statusCounts.length}', Icons.flag_outlined, const Color(0xFFa855f7))),
                  ]),

                  const SizedBox(height: 24),

                  // Status Breakdown
                  _sectionTitle(cs, 'STATUS BREAKDOWN'),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cs.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: cs.onSurface.withOpacity(0.06)),
                    ),
                    child: _statusCounts.isEmpty
                        ? Center(child: Text('No jobs yet', style: TextStyle(color: cs.onSurface.withOpacity(0.4))))
                        : Column(
                            children: _statusCounts.entries.map((e) {
                              final pct = _totalJobs > 0 ? e.value / _totalJobs : 0.0;
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                                      Text(e.key, style: TextStyle(color: cs.onSurface, fontSize: 13, fontWeight: FontWeight.w500)),
                                      Text('${e.value}', style: TextStyle(color: cs.primary, fontSize: 13, fontWeight: FontWeight.w700, fontFamily: 'monospace')),
                                    ]),
                                    const SizedBox(height: 6),
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(4),
                                      child: LinearProgressIndicator(
                                        value: pct,
                                        minHeight: 6,
                                        backgroundColor: cs.onSurface.withOpacity(0.06),
                                        valueColor: AlwaysStoppedAnimation(_statusColor(e.key, cs)),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                  ),

                  const SizedBox(height: 24),

                  // Recent Activity
                  _sectionTitle(cs, 'RECENT JOBS'),
                  const SizedBox(height: 12),
                  ..._recentJobs.map((job) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: cs.surface,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: cs.onSurface.withOpacity(0.06)),
                        ),
                        child: Row(children: [
                          Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(
                              color: cs.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Center(child: Text(
                              (job['company'] ?? '?').toString().substring(0, 1).toUpperCase(),
                              style: TextStyle(color: cs.primary, fontWeight: FontWeight.bold, fontSize: 14),
                            )),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(job['role'] ?? 'Unknown Role', style: TextStyle(color: cs.onSurface, fontSize: 13, fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
                              Text(job['company'] ?? '', style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 11)),
                            ],
                          )),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _statusColor(job['status'] ?? '', cs).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(job['status'] ?? '', style: TextStyle(color: _statusColor(job['status'] ?? '', cs), fontSize: 10, fontWeight: FontWeight.w600)),
                          ),
                        ]),
                      )),
                  
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  Widget _kpiCard(ColorScheme cs, String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cs.onSurface.withOpacity(0.06)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label, style: TextStyle(color: cs.onSurface.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.w500)),
          Container(
            width: 28, height: 28,
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
            child: Icon(icon, color: color, size: 14),
          ),
        ]),
        const SizedBox(height: 8),
        Text(value, style: TextStyle(color: cs.onSurface, fontSize: 24, fontWeight: FontWeight.w700, fontFamily: 'monospace')),
      ]),
    );
  }

  Widget _sectionTitle(ColorScheme cs, String title) {
    return Text(
      title,
      style: TextStyle(
        color: cs.onSurface.withOpacity(0.4),
        fontSize: 10,
        fontWeight: FontWeight.w600,
        letterSpacing: 1.2,
      ),
    );
  }

  Color _statusColor(String status, ColorScheme cs) {
    switch (status.toLowerCase()) {
      case 'applied': return cs.primary;
      case 'interview': return const Color(0xFFFF9800);
      case 'offer': return const Color(0xFF27AE60);
      case 'rejected': return const Color(0xFFE91E63);
      case 'screening': return const Color(0xFF3B82F6);
      case 'negotiation': return const Color(0xFFa855f7);
      default: return cs.onSurface.withOpacity(0.5);
    }
  }
}
