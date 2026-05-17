import '../entities/job_entity.dart';
import '../repositories/job_repository.dart';
import '../../core/usecases/usecase.dart';

class WatchJobsUseCase implements StreamUseCase<List<JobEntity>, NoParams> {
  final JobRepository repository;

  WatchJobsUseCase(this.repository);

  @override
  Stream<List<JobEntity>> call(NoParams params) {
    return repository.watchJobs();
  }
}
