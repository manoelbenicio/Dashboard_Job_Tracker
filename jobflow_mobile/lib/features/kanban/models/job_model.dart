import 'package:cloud_firestore/cloud_firestore.dart';

/// Job statuses — matches Web APP's `types/index.ts` exactly
enum JobStatus {
  underReview('under_review', 'Em Análise', '#8B5CF6'),
  applied('applied', 'Candidatada', '#3B82F6'),
  interview('interview', 'Entrevista', '#F59E0B'),
  offer('offer', 'Oferta', '#10B981'),
  accepted('accepted', 'Aceita', '#4edea3'),
  rejected('rejected', 'Rejeitada', '#EF4444');

  final String value;
  final String label;
  final String colorHex;
  const JobStatus(this.value, this.label, this.colorHex);

  static JobStatus fromString(String s) {
    return JobStatus.values.firstWhere(
      (e) => e.value == s || e.name == s,
      orElse: () => JobStatus.applied,
    );
  }
}

/// Job model — matches Web APP's `Job` interface exactly
class JobModel {
  final String id;
  final String company;
  final String role;
  final String stage; // legacy field kept for backward compat
  final String status; // matches JobStatus.value
  final String location;
  final String salary;
  final String description;
  final String url;
  final String origin; // 'application', 'referral', 'recruiter', 'other'
  final String notes;
  final String coverLetter;
  final String interviewGuide;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? appliedDate;

  JobModel({
    required this.id,
    required this.company,
    required this.role,
    required this.stage,
    required this.status,
    required this.location,
    required this.salary,
    this.description = '',
    this.url = '',
    this.origin = 'application',
    this.notes = '',
    this.coverLetter = '',
    this.interviewGuide = '',
    this.createdAt,
    this.updatedAt,
    this.appliedDate,
  });

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
      appliedDate: (data['appliedDate'] as Timestamp?)?.toDate() ?? (data['createdAt'] as Timestamp?)?.toDate(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'company': company,
      'role': role,
      'stage': status, // keep in sync
      'status': status,
      'location': location,
      'salary': salary,
      'description': description,
      'url': url,
      'origin': origin,
      'notes': notes,
      'coverLetter': coverLetter,
      'interviewGuide': interviewGuide,
      'appliedDate': appliedDate != null ? Timestamp.fromDate(appliedDate!) : FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  Map<String, dynamic> toFirestoreCreate() {
    final map = toFirestore();
    map['createdAt'] = FieldValue.serverTimestamp();
    return map;
  }

  JobModel copyWith({
    String? company, String? role, String? stage, String? status,
    String? location, String? salary, String? description, String? url,
    String? origin, String? notes, String? coverLetter, String? interviewGuide,
    DateTime? appliedDate,
  }) {
    return JobModel(
      id: id,
      company: company ?? this.company,
      role: role ?? this.role,
      stage: stage ?? status ?? this.stage,
      status: status ?? this.status,
      location: location ?? this.location,
      salary: salary ?? this.salary,
      description: description ?? this.description,
      url: url ?? this.url,
      origin: origin ?? this.origin,
      notes: notes ?? this.notes,
      coverLetter: coverLetter ?? this.coverLetter,
      interviewGuide: interviewGuide ?? this.interviewGuide,
      createdAt: createdAt,
      updatedAt: updatedAt,
      appliedDate: appliedDate ?? this.appliedDate,
    );
  }

  factory JobModel.empty(String id) {
    return JobModel(
      id: id,
      company: '',
      role: '',
      stage: 'applied',
      status: 'applied',
      location: '',
      salary: '',
    );
  }
}
