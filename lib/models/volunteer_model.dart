class VolunteerModel {
  final String id;
  final String name;
  final String phone;
  final List<String> skills;
  final String availabilitySchedule;
  final int tasksCompleted;
  final double lat;
  final double lng;

  VolunteerModel({
    required this.id,
    required this.name,
    required this.phone,
    required this.skills,
    required this.availabilitySchedule,
    required this.tasksCompleted,
    required this.lat,
    required this.lng,
  });

  factory VolunteerModel.fromJson(Map<String, dynamic> json, String documentId) {
    return VolunteerModel(
      id: documentId,
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      skills: List<String>.from(json['skills'] ?? []),
      availabilitySchedule: json['availabilitySchedule'] ?? '',
      tasksCompleted: json['tasksCompleted'] ?? 0,
      lat: (json['lat'] ?? 0.0).toDouble(),
      lng: (json['lng'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'skills': skills,
      'availabilitySchedule': availabilitySchedule,
      'tasksCompleted': tasksCompleted,
      'lat': lat,
      'lng': lng,
    };
  }
}
