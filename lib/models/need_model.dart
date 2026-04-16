class NeedModel {
  final String id;
  final String title;
  final String category;
  final String urgency; // low/medium/high/critical
  final double lat;
  final double lng;
  final String status;
  final List<String> assignedVolunteers;

  NeedModel({
    required this.id,
    required this.title,
    required this.category,
    required this.urgency,
    required this.lat,
    required this.lng,
    required this.status,
    required this.assignedVolunteers,
  });

  factory NeedModel.fromJson(Map<String, dynamic> json, String documentId) {
    return NeedModel(
      id: documentId,
      title: json['title'] ?? '',
      category: json['category'] ?? '',
      urgency: json['urgency'] ?? 'low',
      lat: (json['lat'] ?? 0.0).toDouble(),
      lng: (json['lng'] ?? 0.0).toDouble(),
      status: json['status'] ?? 'pending',
      assignedVolunteers: List<String>.from(json['assignedVolunteers'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'category': category,
      'urgency': urgency,
      'lat': lat,
      'lng': lng,
      'status': status,
      'assignedVolunteers': assignedVolunteers,
    };
  }
}
