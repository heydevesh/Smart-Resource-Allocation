import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user.dart';
import 'firebase_service.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  FirebaseFirestore? get _firestore => FirebaseService().firestore;
  User? get currentUser => _auth.currentUser;

  Future<AppUser?> signInWithEmailPassword(String email, String password) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return await _getUserProfile(credential.user!.uid);
    } catch (e) {
      print('Sign in error: $e');
      rethrow;
    }
  }

  Future<AppUser?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      final appUser = await _getUserProfile(userCredential.user!.uid);

      return appUser;
    } catch (e) {
      print('Google sign in error: $e');
      rethrow;
    }
  }

  Future<AppUser?> signUpWithEmailPassword({
    required String email,
    required String password,
    required String name,
    required String phone,
    required String role,
  }) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Create user profile in Firestore
      final appUser = AppUser(
        id: credential.user!.uid,
        email: email,
        name: name,
        phone: phone,
        role: role,
        isActive: true,
        createdAt: DateTime.now(),
      );

      if (_firestore != null) {
        await _firestore!.collection('users').doc(credential.user!.uid).set(
          appUser.toFirestore(),
        );
      }

      return appUser;
    } catch (e) {
      print('Sign up error: $e');
      rethrow;
    }
  }

  Future<void> signOut() async {
    await Future.wait([
      _auth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }

  Future<AppUser?> _getUserProfile(String uid) async {
    if (_firestore == null) return null;
    try {
      final doc = await _firestore!.collection('users').doc(uid).get();
      if (doc.exists) {
        return AppUser.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      print('Get user profile error: $e');
      return null;
    }
  }

  Future<void> updateUserLastLogin(String uid) async {
    if (_firestore != null) {
      await _firestore!.collection('users').doc(uid).update({
        'lastLoginAt': FieldValue.serverTimestamp(),
      });
    }
  }
}
