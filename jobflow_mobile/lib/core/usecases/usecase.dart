/// Base UseCase contract — every use case takes Params and returns a Result
abstract class UseCase<Type, Params> {
  Future<Type> call(Params params);
}

/// For use cases that don't take parameters
class NoParams {
  const NoParams();
}

/// Base UseCase contract for streams
abstract class StreamUseCase<Type, Params> {
  Stream<Type> call(Params params);
}

