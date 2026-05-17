import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/job_entity.dart';

/// Data-layer model — extends domain entity with Firestore serialization
class JobModel extends JobEntity {
  const JobModel({
    required super.id,
    required super.company,
    required super.role,
    required super.stage,
    required super.status,
    super.location,
    super.salary,
    super.description,
    super.url,
    super.origin,
    super.notes,
    super.coverLetter,
    super.interviewGuide,
    super.createdAt,
    super.updatedAt,
    super.appliedDate,
  });

  /// Deserialize from Firestore document
  factory JobModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>?;

    if (data == null) {
      return JobModel.empty(doc.id);
    }

    return JobModel(
      id: doc.id,
      company: data['company'] ?? 'Unknown Company',
      role: data['role'] ?? 'Unknown Role',
      stage: data['stage'] ?? data['status'] ?? 'applied',
      status: data['status'] ?? data['stage'] ?? 'applied',
      location: data['location'] ?? '',
      salary: data['salary'] ?? '',
      description: data['description'] ?? '',
      url: data['url'] ?? '',
      origin: data['origin'] ?? 'application',
      notes: data['notes'] ?? '',
      coverLetter: data['coverLetter'] ?? '',
      interviewGuide: data['interviewGuide'] ?? '',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
      appliedDate: (data['appliedDate'] as Timestamp?)?.toDate() ??
          (data['createdAt'] as Timestamp?)?.toDate(),
    );
  }

  /// Serialize for Firestore update
  Map<String, dynamic> toFirestore() {
    return {
      'company': company,
      'role': role,
      'stage': status,
      'status': status,
      'location': location,
      'salary': salary,
      'description': description,
      'url': url,
      'origin': origin,
      'notes': notes,
      'coverLetter': coverLetter,
      'interviewGuide': interviewGuide,
      'appliedDate': appliedDate != null
          ? Timestamp.fromDate(appliedDate!)
          : FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  /// Serialize for Firestore create (adds createdAt)
  Map<String, dynamic> toFirestoreCreate() {
    final map = toFirestore();
    map['createdAt'] = FieldValue.serverTimestamp();
    return map;
  }

  /// Convert a domain entity into a data model
  factory JobModel.fromEntity(JobEntity entity) {
    return JobModel(
      id: entity.id,
      company: entity.company,
      role: entity.role,
      stage: entity.stage,
      status: entity.status,
      location: entity.location,
      salary: entity.salary,
      description: entity.description,
      url: entity.url,
      origin: entity.origin,
      notes: entity.notes,
      coverLetter: entity.coverLetter,
      interviewGuide: entity.interviewGuide,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      appliedDate: entity.appliedDate,
    );
  }

  factory JobModel.empty(String id) {
    return JobModel(
      id: id,
      company: '',
      role: '',
      stage: 'applied',
      status: 'applied',
    );
  }
}
