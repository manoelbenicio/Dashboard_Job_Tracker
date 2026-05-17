import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/job_data_model.dart';

/// Firestore datasource — all Firebase I/O lives here, nowhere else
class FirebaseJobDatasource {
  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  FirebaseJobDatasource({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  String? get _uid => _auth.currentUser?.uid;

  CollectionReference<Map<String, dynamic>> _jobsCol() {
    final uid = _uid;
    if (uid == null) throw Exception('Not authenticated');
    return _firestore.collection('users').doc(uid).collection('jobs');
  }

  /// Stream of jobs ordered by updatedAt desc
  Stream<List<JobModel>> watchJobs() {
    final uid = _uid;
    if (uid == null) return Stream.value([]);

    return _jobsCol()
        .orderBy('updatedAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map((doc) => JobModel.fromFirestore(doc)).toList());
  }

  /// Add a new job, returns generated doc ID
  Future<String> addJob(JobModel model) async {
    final ref = await _jobsCol().add(model.toFirestoreCreate());
    return ref.id;
  }

  /// Update an existing job
  Future<void> updateJob(JobModel model) async {
    await _jobsCol().doc(model.id).update(model.toFirestore());
  }

  /// Delete a job by ID
  Future<void> deleteJob(String jobId) async {
    await _jobsCol().doc(jobId).delete();
  }

  /// Update only status + stage fields
  Future<void> updateJobStatus(String jobId, String newStatus) async {
    await _jobsCol().doc(jobId).update({
      'status': newStatus,
      'stage': newStatus,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }
}
