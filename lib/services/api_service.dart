import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/need_model.dart';
import '../models/task_model.dart';
import '../models/volunteer_model.dart';
import 'firebase_service.dart';

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:8000/api';

  Future<List<NeedModel>> getNeeds() async {
    if (!FirebaseService().isDemoMode) {
      final snapshot = await FirebaseFirestore.instance.collection('needs').get();
      return snapshot.docs.map((doc) => NeedModel.fromJson(doc.data(), doc.id)).toList();
    }
    
    // Fallback to local python backend in demo mode
    final response = await http.get(Uri.parse('$baseUrl/needs'));
    if (response.statusCode == 200) {
      final data = json.decode(response.body)['needs'] as Map<String, dynamic>;
      return data.entries.map((e) => NeedModel.fromJson(e.value, e.key)).toList();
    }
    throw Exception('Failed to load needs');
  }

  Future<List<TaskModel>> getTasks() async {
    if (!FirebaseService().isDemoMode) {
      final snapshot = await FirebaseFirestore.instance.collection('tasks').get();
      return snapshot.docs.map((doc) => TaskModel.fromJson(doc.data(), doc.id)).toList();
    }
    
    final response = await http.get(Uri.parse('$baseUrl/tasks'));
    if (response.statusCode == 200) {
      final data = json.decode(response.body)['tasks'] as Map<String, dynamic>;
      return data.entries.map((e) => TaskModel.fromJson(e.value, e.key)).toList();
    }
    throw Exception('Failed to load tasks');
  }

  Future<List<VolunteerModel>> getVolunteers() async {
    if (!FirebaseService().isDemoMode) {
      final snapshot = await FirebaseFirestore.instance.collection('volunteers').get();
      return snapshot.docs.map((doc) => VolunteerModel.fromJson(doc.data(), doc.id)).toList();
    }

    final response = await http.get(Uri.parse('$baseUrl/volunteers'));
    if (response.statusCode == 200) {
      final data = json.decode(response.body)['volunteers'] as Map<String, dynamic>;
      return data.entries.map((e) => VolunteerModel.fromJson(e.value, e.key)).toList();
    }
    throw Exception('Failed to load volunteers');
  }

  // Gemini via python backend shouldn't talk directly to Gemini from client side to hide API Key
  Future<String> getSmartMatch(String taskId, String taskDetails) async {
    final response = await http.post(
      Uri.parse('$baseUrl/smart-match'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'task_id': taskId, 'task_details': taskDetails}),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['matched_data']['result'] ?? 'No match prediction.';
    }
    throw Exception('Failed to get smart match');
  }
}
