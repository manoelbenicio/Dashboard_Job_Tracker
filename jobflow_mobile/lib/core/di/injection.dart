import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/firebase_job_datasource.dart';
import '../../data/datasources/gemini_datasource.dart';
import '../../data/repositories/job_repository_impl.dart';
import '../../data/repositories/ai_repository_impl.dart';
import '../../domain/repositories/job_repository.dart';
import '../../domain/repositories/ai_repository.dart';
import '../../domain/usecases/watch_jobs_usecase.dart';
import '../../domain/usecases/add_job_usecase.dart';
import '../../domain/usecases/update_job_usecase.dart';
import '../../domain/usecases/update_job_status_usecase.dart';
import '../../domain/usecases/chat_with_claire_usecase.dart';
import '../../domain/usecases/init_claire_usecase.dart';
import '../../domain/usecases/set_claire_api_key_usecase.dart';

// ─────────────────────────────────────────────────────────
// Datasource providers
// ─────────────────────────────────────────────────────────

final firebaseJobDatasourceProvider = Provider<FirebaseJobDatasource>((ref) {
  return FirebaseJobDatasource();
});

final geminiDatasourceProvider = Provider<GeminiDatasource>((ref) {
  return GeminiDatasource();
});

// ─────────────────────────────────────────────────────────
// Repository providers (domain contracts, backed by data layer)
// ─────────────────────────────────────────────────────────

final jobRepositoryProvider = Provider<JobRepository>((ref) {
  return JobRepositoryImpl(ref.watch(firebaseJobDatasourceProvider));
});

final aiRepositoryProvider = Provider<AiRepository>((ref) {
  return AiRepositoryImpl(ref.watch(geminiDatasourceProvider));
});

// ─────────────────────────────────────────────────────────
// UseCase providers
// ─────────────────────────────────────────────────────────

final watchJobsUseCaseProvider = Provider<WatchJobsUseCase>((ref) {
  return WatchJobsUseCase(ref.watch(jobRepositoryProvider));
});

final addJobUseCaseProvider = Provider<AddJobUseCase>((ref) {
  return AddJobUseCase(ref.watch(jobRepositoryProvider));
});

final updateJobUseCaseProvider = Provider<UpdateJobUseCase>((ref) {
  return UpdateJobUseCase(ref.watch(jobRepositoryProvider));
});

final updateJobStatusUseCaseProvider = Provider<UpdateJobStatusUseCase>((ref) {
  return UpdateJobStatusUseCase(ref.watch(jobRepositoryProvider));
});

final chatWithClaireUseCaseProvider = Provider<ChatWithClaireUseCase>((ref) {
  return ChatWithClaireUseCase(ref.watch(aiRepositoryProvider));
});

final initClaireUseCaseProvider = Provider<InitClaireUseCase>((ref) {
  return InitClaireUseCase(ref.watch(aiRepositoryProvider));
});

final setClaireApiKeyUseCaseProvider = Provider<SetClaireApiKeyUseCase>((ref) {
  return SetClaireApiKeyUseCase(ref.watch(aiRepositoryProvider));
});

