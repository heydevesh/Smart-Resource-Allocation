import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import '../firebase_options.dart';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  FirebaseFirestore? _firestore;
  FirebaseAuth? _auth;
  FirebaseStorage? _storage;

  bool _isInitialized = false;
  bool _isDemoMode = false;

  bool get isInitialized => _isInitialized;
  bool get isDemoMode => _isDemoMode;

  FirebaseFirestore? get firestore => _firestore;
  FirebaseAuth? get auth => _auth;
  FirebaseStorage? get storage => _storage;

  Future<void> initialize() async {
    if (_isInitialized || _isDemoMode) return;

    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      _firestore = FirebaseFirestore.instance;
      _auth = FirebaseAuth.instance;
      _storage = FirebaseStorage.instance;
      _isInitialized = true;
      print('Firebase initialized successfully');
    } catch (e) {
      // Firebase not configured - run in demo mode
      print('Firebase not configured: running in demo mode. $e');
      _isDemoMode = true;
    }
  }
}
