import '../entities/job_entity.dart';
import '../repositories/job_repository.dart';
import '../../core/usecases/usecase.dart';
import '../../core/error/failures.dart';

class AddJobUseCase implements UseCase<String, JobEntity> {
  final JobRepository repository;

  AddJobUseCase(this.repository);

  @override
  Future<String> call(JobEntity params) async {
    try {
      return await repository.addJob(params);
    } catch (e) {
      throw ServerFailure('Falha ao adicionar vaga: $e');
    }
  }
}
