import '../../domain/entities/job_entity.dart';
import '../../domain/repositories/job_repository.dart';
import '../datasources/firebase_job_datasource.dart';
import '../models/job_data_model.dart';

/// Concrete implementation — bridges domain contract with Firebase datasource
class JobRepositoryImpl implements JobRepository {
  final FirebaseJobDatasource _datasource;

  JobRepositoryImpl(this._datasource);

  @override
  Stream<List<JobEntity>> watchJobs() {
    // JobModel extends JobEntity so the cast is implicit
    return _datasource.watchJobs();
  }

  @override
  Future<String> addJob(JobEntity job) {
    return _datasource.addJob(JobModel.fromEntity(job));
  }

  @override
  Future<void> updateJob(JobEntity job) {
    return _datasource.updateJob(JobModel.fromEntity(job));
  }

  @override
  Future<void> deleteJob(String jobId) {
    return _datasource.deleteJob(jobId);
  }

  @override
  Future<void> updateJobStatus(String jobId, String newStatus) {
    return _datasource.updateJobStatus(jobId, newStatus);
  }
}
