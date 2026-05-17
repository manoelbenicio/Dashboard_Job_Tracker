import '../entities/job_entity.dart';
import '../repositories/job_repository.dart';
import '../../core/usecases/usecase.dart';
import '../../core/error/failures.dart';

class UpdateJobUseCase implements UseCase<void, JobEntity> {
  final JobRepository repository;

  UpdateJobUseCase(this.repository);

  @override
  Future<void> call(JobEntity params) async {
    try {
      await repository.updateJob(params);
    } catch (e) {
      throw ServerFailure('Falha ao atualizar vaga: $e');
    }
  }
}
