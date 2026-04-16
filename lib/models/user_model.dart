class UserModel {
  final String uid;
  final String email;
  final String role; // 'admin', 'volunteer', 'field_worker'

  UserModel({
    required this.uid,
    required this.email,
    required this.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, String documentId) {
    return UserModel(
      uid: documentId,
      email: json['email'] ?? '',
      role: json['role'] ?? 'volunteer',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'role': role,
    };
  }
}
