import '../entities/job_entity.dart';

/// Abstract repository contract — domain layer defines WHAT, not HOW
abstract class JobRepository {
  /// Stream of all jobs for the current user
  Stream<List<JobEntity>> watchJobs();

  /// Add a new job, returns its generated ID
  Future<String> addJob(JobEntity job);

  /// Update an existing job
  Future<void> updateJob(JobEntity job);

  /// Delete a job by ID
  Future<void> deleteJob(String jobId);

  /// Update only the status/stage of a job (Kanban drag-and-drop)
  Future<void> updateJobStatus(String jobId, String newStatus);
}
