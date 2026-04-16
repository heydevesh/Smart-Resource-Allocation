import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/need.dart';
import '../models/task.dart';
import '../models/volunteer.dart';
import '../models/user.dart';
import 'firebase_service.dart';

class FirestoreService {
  FirebaseFirestore? get _firestore => FirebaseService().isInitialized ? FirebaseService().firestore : null;

  // ===== NEEDS =====
  Stream<List<Need>> getNeedsStream({String? status, String? category}) {
    if (_firestore == null) {
      return Stream.value([]);
    }
    Query query = _firestore!.collection('needs').orderBy('reportedAt', descending: true);

    if (status != null) {
      query = query.where('status', isEqualTo: status);
    }
    if (category != null) {
      query = query.where('category', isEqualTo: category);
    }

    return query.snapshots().map((snapshot) =>
      snapshot.docs.map((doc) => Need.fromFirestore(doc)).toList(),
    );
  }

  Future<Need> createNeed(Need need) async {
    if (_firestore == null) return need;
    final docRef = await _firestore!.collection('needs').add(need.toFirestore());
    return need.copyWith(id: docRef.id);
  }

  Future<void> updateNeed(Need need) async {
    if (_firestore != null) {
      await _firestore!.collection('needs').doc(need.id).update(need.toFirestore());
    }
  }

  Future<void> deleteNeed(String needId) async {
    if (_firestore != null) {
      await _firestore!.collection('needs').doc(needId).delete();
    }
  }

  // ===== TASKS =====
  Stream<List<Task>> getTasksStream({String? status, String? volunteerId}) {
    if (_firestore == null) return Stream.value([]);
    Query query = _firestore!.collection('tasks').orderBy('createdAt', descending: true);

    if (status != null) {
      query = query.where('status', isEqualTo: status);
    }
    if (volunteerId != null) {
      query = query.where('assignedVolunteerIds', arrayContains: volunteerId);
    }

    return query.snapshots().map((snapshot) =>
      snapshot.docs.map((doc) => Task.fromFirestore(doc)).toList(),
    );
  }

  Future<Task> createTask(Task task) async {
    if (_firestore == null) return task;
    final docRef = await _firestore!.collection('tasks').add(task.toFirestore());
    return task.copyWith(id: docRef.id);
  }

  Future<void> updateTask(Task task) async {
    if (_firestore != null) {
      await _firestore!.collection('tasks').doc(task.id).update(task.toFirestore());
    }
  }

  Future<void> deleteTask(String taskId) async {
    if (_firestore != null) {
      await _firestore!.collection('tasks').doc(taskId).delete();
    }
  }

  // ===== VOLUNTEERS =====
  Stream<List<Volunteer>> getVolunteersStream({bool? isAvailable}) {
    if (_firestore == null) return Stream.value([]);
    Query query = _firestore!.collection('volunteers').orderBy('name');

    if (isAvailable != null) {
      query = query.where('isAvailable', isEqualTo: isAvailable);
    }

    return query.snapshots().map((snapshot) =>
      snapshot.docs.map((doc) => Volunteer.fromFirestore(doc)).toList(),
    );
  }

  Future<Volunteer> createVolunteer(Volunteer volunteer) async {
    if (_firestore == null) return volunteer;
    final docRef = await _firestore!.collection('volunteers').add(volunteer.toFirestore());
    return volunteer.copyWith(id: docRef.id);
  }

  Future<void> updateVolunteer(Volunteer volunteer) async {
    if (_firestore != null) {
      await _firestore!.collection('volunteers').doc(volunteer.id).update(volunteer.toFirestore());
    }
  }

  Future<void> deleteVolunteer(String volunteerId) async {
    if (_firestore != null) {
      await _firestore!.collection('volunteers').doc(volunteerId).delete();
    }
  }

  // ===== USERS =====
  Future<AppUser?> getUser(String userId) async {
    if (_firestore == null) return null;
    final doc = await _firestore!.collection('users').doc(userId).get();
    if (doc.exists) {
      return AppUser.fromFirestore(doc);
    }
    return null;
  }

  Future<void> updateUser(AppUser user) async {
    if (_firestore != null) {
      await _firestore!.collection('users').doc(user.id).update(user.toFirestore());
    }
  }

  // ===== UTILITY =====
  Future<int> getCount(String collection) async {
    if (_firestore == null) return 0;
    final snapshot = await _firestore!.collection(collection).count().get();
    return snapshot.count ?? 0;
  }
}
