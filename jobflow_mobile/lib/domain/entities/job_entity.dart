/// Pure domain entity — NO framework dependencies (no Firestore, no Flutter)
class JobEntity {
  final String id;
  final String company;
  final String role;
  final String stage;
  final String status;
  final String location;
  final String salary;
  final String description;
  final String url;
  final String origin;
  final String notes;
  final String coverLetter;
  final String interviewGuide;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? appliedDate;

  const JobEntity({
    required this.id,
    required this.company,
    required this.role,
    required this.stage,
    required this.status,
    this.location = '',
    this.salary = '',
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

  JobEntity copyWith({
    String? company,
    String? role,
    String? stage,
    String? status,
    String? location,
    String? salary,
    String? description,
    String? url,
    String? origin,
    String? notes,
    String? coverLetter,
    String? interviewGuide,
    DateTime? appliedDate,
  }) {
    return JobEntity(
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
}
