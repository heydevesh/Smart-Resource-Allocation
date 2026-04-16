class TaskModel {
  final String id;
  final String title;
  final String priority;
  final List<String> volunteerIds;
  final String status;
  final int progress;
  final DateTime dueAt;
  final String category;

  TaskModel({
    required this.id,
    required this.title,
    required this.priority,
    required this.volunteerIds,
    required this.status,
    required this.progress,
    required this.dueAt,
    required this.category,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json, String documentId) {
    return TaskModel(
      id: documentId,
      title: json['title'] ?? '',
      priority: json['priority'] ?? 'normal',
      volunteerIds: List<String>.from(json['volunteerIds'] ?? []),
      status: json['status'] ?? 'active',
      progress: json['progress'] ?? 0,
      dueAt: json['dueAt'] is String
          ? (DateTime.tryParse(json['dueAt']) ?? DateTime.now())
          : (json['dueAt']?.toDate() ?? DateTime.now()),
      category: json['category'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'priority': priority,
      'volunteerIds': volunteerIds,
      'status': status,
      'progress': progress,
      'dueAt': dueAt,
      'category': category,
    };
  }
}
