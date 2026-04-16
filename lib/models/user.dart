import 'package:cloud_firestore/cloud_firestore.dart';

class AppUser {
  final String id;
  final String email;
  final String name;
  final String phone;
  final String role; // admin, field_worker, volunteer, super_admin
  final String? organizationId;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? lastLoginAt;
  final Map<String, dynamic>? metadata;

  AppUser({
    required this.id,
    required this.email,
    required this.name,
    required this.phone,
    required this.role,
    this.organizationId,
    required this.isActive,
    required this.createdAt,
    this.lastLoginAt,
    this.metadata,
  });

  factory AppUser.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return AppUser(
      id: doc.id,
      email: data['email'] ?? '',
      name: data['name'] ?? '',
      phone: data['phone'] ?? '',
      role: data['role'] ?? 'volunteer',
      organizationId: data['organizationId'],
      isActive: data['isActive'] ?? true,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      lastLoginAt: (data['lastLoginAt'] as Timestamp?)?.toDate(),
      metadata: data['metadata'],
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'email': email,
      'name': name,
      'phone': phone,
      'role': role,
      'organizationId': organizationId,
      'isActive': isActive,
      'createdAt': Timestamp.fromDate(createdAt),
      'lastLoginAt': lastLoginAt != null ? Timestamp.fromDate(lastLoginAt!) : null,
      'metadata': metadata,
    };
  }

  AppUser copyWith({
    String? id,
    String? email,
    String? name,
    String? phone,
    String? role,
    String? organizationId,
    bool? isActive,
    DateTime? createdAt,
    DateTime? lastLoginAt,
    Map<String, dynamic>? metadata,
  }) {
    return AppUser(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      organizationId: organizationId ?? this.organizationId,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      metadata: metadata ?? this.metadata,
    );
  }

  bool get isAdmin => role == 'admin' || role == 'super_admin';
  bool get isFieldWorker => role == 'field_worker';
  bool get isVolunteer => role == 'volunteer';
}
