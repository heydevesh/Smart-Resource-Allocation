import 'package:cloud_firestore/cloud_firestore.dart';

class Volunteer {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final List<String> skills;
  final bool isAvailable;
  final DateTime? availableFrom;
  final DateTime? availableUntil;
  final double? latitude;
  final double? longitude;
  final String? address;
  final int tasksCompleted;
  final List<String> currentTaskIds;
  final DateTime joinedAt;
  final Map<String, dynamic>? metadata;

  Volunteer({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    required this.skills,
    required this.isAvailable,
    this.availableFrom,
    this.availableUntil,
    this.latitude,
    this.longitude,
    this.address,
    required this.tasksCompleted,
    required this.currentTaskIds,
    required this.joinedAt,
    this.metadata,
  });

  factory Volunteer.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Volunteer(
      id: doc.id,
      name: data['name'] ?? '',
      phone: data['phone'] ?? '',
      email: data['email'],
      skills: data['skills'] != null ? List<String>.from(data['skills']) : [],
      isAvailable: data['isAvailable'] ?? false,
      availableFrom: (data['availableFrom'] as Timestamp?)?.toDate(),
      availableUntil: (data['availableUntil'] as Timestamp?)?.toDate(),
      latitude: (data['latitude'] as num?)?.toDouble(),
      longitude: (data['longitude'] as num?)?.toDouble(),
      address: data['address'],
      tasksCompleted: data['tasksCompleted'] ?? 0,
      currentTaskIds: data['currentTaskIds'] != null
          ? List<String>.from(data['currentTaskIds'])
          : [],
      joinedAt: (data['joinedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      metadata: data['metadata'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'phone': phone,
      'email': email,
      'skills': skills,
      'isAvailable': isAvailable,
      'availableFrom': availableFrom != null ? Timestamp.fromDate(availableFrom!) : null,
      'availableUntil': availableUntil != null ? Timestamp.fromDate(availableUntil!) : null,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'tasksCompleted': tasksCompleted,
      'currentTaskIds': currentTaskIds,
      'joinedAt': Timestamp.fromDate(joinedAt),
      'metadata': metadata,
    };
  }

  Volunteer copyWith({
    String? id,
    String? name,
    String? phone,
    String? email,
    List<String>? skills,
    bool? isAvailable,
    DateTime? availableFrom,
    DateTime? availableUntil,
    double? latitude,
    double? longitude,
    String? address,
    int? tasksCompleted,
    List<String>? currentTaskIds,
    DateTime? joinedAt,
    Map<String, dynamic>? metadata,
  }) {
    return Volunteer(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      skills: skills ?? this.skills,
      isAvailable: isAvailable ?? this.isAvailable,
      availableFrom: availableFrom ?? this.availableFrom,
      availableUntil: availableUntil ?? this.availableUntil,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      tasksCompleted: tasksCompleted ?? this.tasksCompleted,
      currentTaskIds: currentTaskIds ?? this.currentTaskIds,
      joinedAt: joinedAt ?? this.joinedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  int get workload => currentTaskIds.length;
}
