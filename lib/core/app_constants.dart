class AppConstants {
  // App info
  static const String appName = 'Sahaay';
  static const String appVersion = '1.0.0';

  // User roles
  static const String roleAdmin = 'admin';
  static const String roleFieldWorker = 'field_worker';
  static const String roleVolunteer = 'volunteer';
  static const String roleSuperAdmin = 'super_admin';

  // Need categories
  static const List<String> needCategories = [
    'Food Distribution',
    'Medical Supplies',
    'Education Support',
    'Shelter',
    'Clothing',
    'Sanitation',
    'Emergency Relief',
    'Other',
  ];

  // Urgency levels
  static const String urgencyLow = 'low';
  static const String urgencyMedium = 'medium';
  static const String urgencyHigh = 'high';
  static const String urgencyCritical = 'critical';

  // Task status
  static const String taskStatusPending = 'pending';
  static const String taskStatusAssigned = 'assigned';
  static const String taskStatusInProgress = 'in_progress';
  static const String taskStatusCompleted = 'completed';
  static const String taskStatusCancelled = 'cancelled';

  // Need status
  static const String needStatusUnaddressed = 'unaddressed';
  static const String needStatusInProgress = 'in_progress';
  static const String needStatusResolved = 'resolved';
  static const String needStatusEscalated = 'escalated';

  // Volunteer skills
  static const List<String> volunteerSkills = [
    'Medical',
    'Teaching',
    'Food Distribution',
    'Counseling',
    'Logistics',
    'Communication',
    'First Aid',
    'Translation',
    'Driving',
    'Technical Support',
  ];

  // Firestore collections
  static const String collectionNeeds = 'needs';
  static const String collectionTasks = 'tasks';
  static const String collectionVolunteers = 'volunteers';
  static const String collectionUsers = 'users';

  // Gemini AI
  static const String geminiSystemInstruction = '''
You are an AI assistant for an NGO coordination platform called Sahaay.
Your role is to help match volunteers to community needs based on:
- Volunteer skills and task requirements
- Geographic proximity
- Volunteer availability and current workload
- Urgency of the need

Provide concise, actionable recommendations.''';
}
