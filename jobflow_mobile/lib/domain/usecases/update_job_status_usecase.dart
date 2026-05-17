import '../repositories/job_repository.dart';
import '../../core/usecases/usecase.dart';
import '../../core/error/failures.dart';

class UpdateJobStatusParams {
  final String jobId;
  final String newStatus;

  UpdateJobStatusParams({required this.jobId, required this.newStatus});
}

class UpdateJobStatusUseCase implements UseCase<void, UpdateJobStatusParams> {
  final JobRepository repository;

  UpdateJobStatusUseCase(this.repository);

  @override
  Future<void> call(UpdateJobStatusParams params) async {
    try {
      await repository.updateJobStatus(params.jobId, params.newStatus);
    } catch (e) {
      throw ServerFailure('Falha ao atualizar status da vaga: $e');
    }
  }
}
