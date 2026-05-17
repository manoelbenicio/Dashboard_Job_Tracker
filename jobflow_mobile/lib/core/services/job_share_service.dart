import 'package:share_plus/share_plus.dart';
import '../../domain/entities/job_entity.dart';

/// PLAT-01: Native OS sharing for job details
class JobShareService {
  /// Share a job posting with native OS share sheet
  static Future<void> shareJob(JobEntity job) async {
    final buffer = StringBuffer();
    buffer.writeln('🎯 ${job.role} @ ${job.company}');
    if (job.location.isNotEmpty) buffer.writeln('📍 ${job.location}');
    if (job.salary.isNotEmpty) buffer.writeln('💰 ${job.salary}');
    if (job.url.isNotEmpty) buffer.writeln('🔗 ${job.url}');
    buffer.writeln('\nCompartilhado via JobFlow');

    await Share.share(buffer.toString());
  }
}
