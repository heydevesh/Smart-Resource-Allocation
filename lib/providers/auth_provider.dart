import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';
import '../services/firebase_service.dart';

final authStateProvider = StreamProvider<User?>((ref) {
  if (FirebaseService().isDemoMode || !FirebaseService().isInitialized) {
    return Stream.value(null);
  }
  return FirebaseAuth.instance.authStateChanges();
});

final userRoleProvider = FutureProvider<UserModel?>((ref) async {
  final user = ref.watch(authStateProvider).value;
  
  if (FirebaseService().isDemoMode || !FirebaseService().isInitialized) {
    // Return a dummy admin for demo mode
    return UserModel(uid: 'demo_uid', email: 'admin@demo.com', role: 'admin');
  }

  if (user == null) return null;
  
  try {
    // Auto-upgrade ajju74580@gmail.com to admin
    if (user.email?.toLowerCase() == 'ajju74580@gmail.com') {
      await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
        'email': user.email,
        'role': 'admin',
      }, SetOptions(merge: true));
      return UserModel(uid: user.uid, email: user.email ?? '', role: 'admin');
    }

    final doc = await FirebaseFirestore.instance.collection('users').doc(user.uid).get();
    if (doc.exists && doc.data() != null) {
      return UserModel.fromJson(doc.data() as Map<String, dynamic>, doc.id);
    }
  } catch (e) {
    print('Error fetching user role: $e');
  }
  
  // Return default role if not found
  return UserModel(uid: user.uid, email: user.email ?? '', role: 'volunteer');
});
