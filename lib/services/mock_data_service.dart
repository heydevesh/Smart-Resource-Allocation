import '../models/need_model.dart';
import '../models/task_model.dart';
import '../models/volunteer_model.dart';

class MockDataService {
  static List<NeedModel> getRealisticNeeds() {
    return [
      NeedModel(
        id: 'need_1',
        title: 'Emergency Oxygen Support - Dharavi Koliwada',
        category: 'Medical',
        urgency: 'critical',
        lat: 19.0330,
        lng: 72.8540,
        status: 'pending',
        assignedVolunteers: [],
      ),
      NeedModel(
        id: 'need_2',
        title: 'Primary School Kit Distribution - Pune East',
        category: 'Education',
        urgency: 'medium',
        lat: 18.5204,
        lng: 73.8567,
        status: 'assigned',
        assignedVolunteers: ['v_1'],
      ),
      NeedModel(
        id: 'need_3',
        title: 'Post-Flooding Sanitation Drive - Kurla West',
        category: 'Emergency',
        urgency: 'high',
        lat: 19.0651,
        lng: 72.8795,
        status: 'pending',
        assignedVolunteers: [],
      ),
      NeedModel(
        id: 'need_4',
        title: 'Daily Ration Kits - Mankhurd Labor Camp',
        category: 'Food',
        urgency: 'high',
        lat: 19.0519,
        lng: 72.9304,
        status: 'pending',
        assignedVolunteers: [],
      ),
      NeedModel(
        id: 'need_5',
        title: 'Slum Roof Reinforcement - Govandi',
        category: 'Housing',
        urgency: 'medium',
        lat: 19.0550,
        lng: 72.9200,
        status: 'completed',
        assignedVolunteers: ['v_2'],
      ),
      NeedModel(
        id: 'need_6',
        title: 'Mobile Health Checkup - Sion Koliwada',
        category: 'Medical',
        urgency: 'high',
        lat: 19.0375,
        lng: 72.8622,
        status: 'pending',
        assignedVolunteers: [],
      ),
    ];
  }

  static List<TaskModel> getRealisticTasks() {
    return [
      TaskModel(
        id: 't1',
        title: 'Distribute Medicines - Dharavi',
        priority: 'critical',
        volunteerIds: ['v1'],
        status: 'active',
        progress: 45,
        dueAt: DateTime.now().add(const Duration(hours: 4)),
        category: 'Medical',
      ),
      TaskModel(
        id: 't2',
        title: 'Food Pack Assembly - Kurla',
        priority: 'high',
        volunteerIds: [],
        status: 'pending',
        progress: 0,
        dueAt: DateTime.now().add(const Duration(days: 1)),
        category: 'Food',
      ),
      TaskModel(
        id: 't3',
        title: 'Sanitation Awareness - Mankhurd',
        priority: 'medium',
        volunteerIds: [],
        status: 'pending',
        progress: 10,
        dueAt: DateTime.now().add(const Duration(days: 2)),
        category: 'Logistics',
      ),
    ];
  }

  static List<VolunteerModel> getRealisticVolunteers() {
    return [
      VolunteerModel(
        id: 'v1',
        name: 'Aman Sharma',
        phone: '+91 98XXX XXXXX',
        skills: ['First Aid', 'Driving'],
        availabilitySchedule: 'Weekends, 9AM-5PM',
        tasksCompleted: 12,
        lat: 19.0330,
        lng: 72.8513,
      ),
      VolunteerModel(
        id: 'v2',
        name: 'Priya Patel',
        phone: '+91 97XXX XXXXX',
        skills: ['Teaching', 'Translation'],
        availabilitySchedule: 'Mon-Fri, 6PM-9PM',
        tasksCompleted: 5,
        lat: 19.0700,
        lng: 72.8600,
      ),
      VolunteerModel(
        id: 'v3',
        name: 'Rahul Varma',
        phone: '+91 96XXX XXXXX',
        skills: ['Heavy Lifting', 'Logistics'],
        availabilitySchedule: 'Daily, 10AM-2PM',
        tasksCompleted: 8,
        lat: 19.0500,
        lng: 72.9000,
      ),
    ];
  }

  static String getMockAiMatch(String taskId, String taskDetails) {
    return "Gemini AI Analysis:\n\nBased on the task details provided, I recommend assigning Volunteer 'Aman Sharma' (v1). \n\nRationale:\n1. Proximity: Aman is located within 2.3km of Dharavi.\n2. Skillset: His 'First Aid' certification aligns perfectly with the medical urgency.\n3. Capacity: He has successfully completed 12 similar tasks, demonstrating high reliability.";
  }
}
