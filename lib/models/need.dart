import 'package:cloud_firestore/cloud_firestore.dart';

class Need {
  final String id;
  final String title;
  final String description;
  final String category;
  final String urgency; // low, medium, high, critical
  final String status; // unaddressed, in_progress, resolved, escalated
  final double latitude;
  final double longitude;
  final String? address;
  final String? reportedBy;
  final String? reportedById;
  final DateTime reportedAt;
  final List<String>? assignedTaskIds;
  final Map<String, dynamic>? metadata;

  Need({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.urgency,
    required this.status,
    required this.latitude,
    required this.longitude,
    this.address,
    this.reportedBy,
    this.reportedById,
    required this.reportedAt,
    this.assignedTaskIds,
    this.metadata,
  });

  factory Need.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Need(
      id: doc.id,
      title: data['title'] ?? '',
      description: data['description'] ?? '',
      category: data['category'] ?? 'Other',
      urgency: data['urgency'] ?? 'medium',
      status: data['status'] ?? 'unaddressed',
      latitude: (data['latitude'] ?? 0.0).toDouble(),
      longitude: (data['longitude'] ?? 0.0).toDouble(),
      address: data['address'],
      reportedBy: data['reportedBy'],
      reportedById: data['reportedById'],
      reportedAt: (data['reportedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      assignedTaskIds: data['assignedTaskIds'] != null
          ? List<String>.from(data['assignedTaskIds'])
          : null,
      metadata: data['metadata'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'description': description,
      'category': category,
      'urgency': urgency,
      'status': status,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'reportedBy': reportedBy,
      'reportedById': reportedById,
      'reportedAt': Timestamp.fromDate(reportedAt),
      'assignedTaskIds': assignedTaskIds ?? [],
      'metadata': metadata,
    };
  }

  Need copyWith({
    String? id,
    String? title,
    String? description,
    String? category,
    String? urgency,
    String? status,
    double? latitude,
    double? longitude,
    String? address,
    String? reportedBy,
    String? reportedById,
    DateTime? reportedAt,
    List<String>? assignedTaskIds,
    Map<String, dynamic>? metadata,
  }) {
    return Need(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      urgency: urgency ?? this.urgency,
      status: status ?? this.status,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      reportedBy: reportedBy ?? this.reportedBy,
      reportedById: reportedById ?? this.reportedById,
      reportedAt: reportedAt ?? this.reportedAt,
      assignedTaskIds: assignedTaskIds ?? this.assignedTaskIds,
      metadata: metadata ?? this.metadata,
    );
  }
}
