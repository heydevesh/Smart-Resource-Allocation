import 'package:cloud_firestore/cloud_firestore.dart';

class Task {
  final String id;
  final String title;
  final String description;
  final String? needId; // Link to parent need
  final String category;
  final String priority; // low, medium, high, critical
  final String status; // pending, assigned, in_progress, completed, cancelled
  final List<String> assignedVolunteerIds;
  final String? assignedBy;
  final DateTime createdAt;
  final DateTime? dueAt;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final int? progress; // 0-100
  final Map<String, dynamic>? metadata;

  Task({
    required this.id,
    required this.title,
    required this.description,
    this.needId,
    required this.category,
    required this.priority,
    required this.status,
    required this.assignedVolunteerIds,
    this.assignedBy,
    required this.createdAt,
    this.dueAt,
    this.startedAt,
    this.completedAt,
    this.progress,
    this.metadata,
  });

  factory Task.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Task(
      id: doc.id,
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      needId: data['needId'],
      category: data['category'] ?? 'General',
      priority: data['priority'] ?? 'medium',
      status: data['status'] ?? 'pending',
      assignedVolunteerIds: data['assignedVolunteerIds'] != null
          ? List<String>.from(data['assignedVolunteerIds'])
          : [],
      assignedBy: data['assignedBy'],
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      dueAt: (data['dueAt'] as Timestamp?)?.toDate(),
      startedAt: (data['startedAt'] as Timestamp?)?.toDate(),
      completedAt: (data['completedAt'] as Timestamp?)?.toDate(),
      progress: data['progress'],
      metadata: data['metadata'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'description': description,
      'needId': needId,
      'category': category,
      'priority': priority,
      'status': status,
      'assignedVolunteerIds': assignedVolunteerIds,
      'assignedBy': assignedBy,
      'createdAt': Timestamp.fromDate(createdAt),
      'dueAt': dueAt != null ? Timestamp.fromDate(dueAt!) : null,
      'startedAt': startedAt != null ? Timestamp.fromDate(startedAt!) : null,
      'completedAt': completedAt != null ? Timestamp.fromDate(completedAt!) : null,
      'progress': progress,
      'metadata': metadata,
    };
  }

  Task copyWith({
    String? id,
    String? title,
    String? description,
    String? needId,
    String? category,
    String? priority,
    String? status,
    List<String>? assignedVolunteerIds,
    String? assignedBy,
    DateTime? createdAt,
    DateTime? dueAt,
    DateTime? startedAt,
    DateTime? completedAt,
    int? progress,
    Map<String, dynamic>? metadata,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      needId: needId ?? this.needId,
      category: category ?? this.category,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      assignedVolunteerIds: assignedVolunteerIds ?? this.assignedVolunteerIds,
      assignedBy: assignedBy ?? this.assignedBy,
      createdAt: createdAt ?? this.createdAt,
      dueAt: dueAt ?? this.dueAt,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
      progress: progress ?? this.progress,
      metadata: metadata ?? this.metadata,
    );
  }

  bool get isOverdue {
    if (dueAt == null) return false;
    return DateTime.now().isAfter(dueAt!) && status != 'completed';
  }
}
