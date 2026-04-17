import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/need_model.dart';
import '../models/task_model.dart';
import '../models/volunteer_model.dart';
import 'firebase_service.dart';
import 'mock_data_service.dart';

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:8000/api';

  Future<List<NeedModel>> getNeeds() async {
    if (!FirebaseService().isDemoMode) {
      final snapshot = await FirebaseFirestore.instance.collection('needs').get();
      return snapshot.docs.map((doc) => NeedModel.fromJson(doc.data(), doc.id)).toList();
    }
    // Fallback to local python backend or mock data in demo mode
    try {
      final response = await http.get(Uri.parse('$baseUrl/needs')).timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        final data = json.decode(response.body)['needs'] as Map<String, dynamic>;
        return data.entries.map((e) => NeedModel.fromJson(e.value, e.key)).toList();
      }
    } catch (_) {
      // Return high-quality mock data if backend is offline
      return MockDataService.getRealisticNeeds();
    }
    return MockDataService.getRealisticNeeds();
  }

  Future<List<TaskModel>> getTasks() async {
    if (!FirebaseService().isDemoMode) {
      final snapshot = await FirebaseFirestore.instance.collection('tasks').get();
      return snapshot.docs.map((doc) => TaskModel.fromJson(doc.data(), doc.id)).toList();
    }
    
    try {
      final response = await http.get(Uri.parse('$baseUrl/tasks')).timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        final data = json.decode(response.body)['tasks'] as Map<String, dynamic>;
        return data.entries.map((e) => TaskModel.fromJson(e.value, e.key)).toList();
      }
    } catch (_) {
      return MockDataService.getRealisticTasks();
    }
    return MockDataService.getRealisticTasks();
  }

  Future<List<VolunteerModel>> getVolunteers() async {
    if (!FirebaseService().isDemoMode) {
      final snapshot = await FirebaseFirestore.instance.collection('volunteers').get();
      return snapshot.docs.map((doc) => VolunteerModel.fromJson(doc.data(), doc.id)).toList();
    }

    try {
      final response = await http.get(Uri.parse('$baseUrl/volunteers')).timeout(const Duration(seconds: 2));
      if (response.statusCode == 200) {
        final data = json.decode(response.body)['volunteers'] as Map<String, dynamic>;
        return data.entries.map((e) => VolunteerModel.fromJson(e.value, e.key)).toList();
      }
    } catch (_) {
      return MockDataService.getRealisticVolunteers();
    }
    return MockDataService.getRealisticVolunteers();
  }

  Future<String> getSmartMatch(String taskId, String taskDetails) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/smart-match'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'task_id': taskId, 'task_details': taskDetails}),
      ).timeout(const Duration(seconds: 2));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['matched_data']['result'] ?? 'No match prediction.';
      }
    } catch (_) {
      return MockDataService.getMockAiMatch(taskId, taskDetails);
    }
    return MockDataService.getMockAiMatch(taskId, taskDetails);
  }
}
