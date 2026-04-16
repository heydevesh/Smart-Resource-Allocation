import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../models/need.dart';
import '../models/task.dart';
import '../models/volunteer.dart';
import '../models/user.dart';

// Auth provider
final authServiceProvider = Provider<AuthService>((ref) => AuthService());

// Firebase auth state stream
final authStateProvider = StreamProvider<User?>((ref) {
  final authService = ref.watch(authServiceProvider);
  return authService.authStateChanges;
});

// Current user profile from Firestore
final currentUserProvider = StreamProvider<AppUser?>((ref) {
  final authService = ref.watch(authServiceProvider);
  final firestoreService = ref.watch(firestoreServiceProvider);

  return authService.authStateChanges.asyncMap((firebaseUser) async {
    if (firebaseUser != null) {
      return await firestoreService.getUser(firebaseUser.uid);
    }
    return null;
  });
});

// Firestore service provider
final firestoreServiceProvider = Provider<FirestoreService>((ref) => FirestoreService());

// Needs providers
final needsStreamProvider = StreamProvider<List<Need>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getNeedsStream();
});

final needsByStatusProvider = StreamProvider.family<List<Need>, String>((ref, status) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getNeedsStream(status: status);
});

// Tasks providers
final tasksStreamProvider = StreamProvider<List<Task>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getTasksStream();
});

final tasksByStatusProvider = StreamProvider.family<List<Task>, String>((ref, status) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getTasksStream(status: status);
});

final tasksByVolunteerProvider = StreamProvider.family<List<Task>, String>((ref, volunteerId) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getTasksStream(volunteerId: volunteerId);
});

// Volunteers providers
final volunteersStreamProvider = StreamProvider<List<Volunteer>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getVolunteersStream();
});

final availableVolunteersProvider = StreamProvider<List<Volunteer>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getVolunteersStream(isAvailable: true);
});

// Stats providers
final totalNeedsCountProvider = FutureProvider<int>((ref) async {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return await firestoreService.getCount('needs');
});

final totalTasksCountProvider = FutureProvider<int>((ref) async {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return await firestoreService.getCount('tasks');
});

final totalVolunteersCountProvider = FutureProvider<int>((ref) async {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return await firestoreService.getCount('volunteers');
});
