import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.linux:
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyABkk7cr5LBBpkN7zd8fIx_P38q3LtAhY4',
    appId: '1:193319651907:web:cbee5cdc37caed816362f6',
    messagingSenderId: '193319651907',
    projectId: 'sahaay-18eb3',
    authDomain: 'sahaay-18eb3.firebaseapp.com',
    storageBucket: 'sahaay-18eb3.firebasestorage.app',
    measurementId: 'G-X12M3Q4G1Z',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyABkk7cr5LBBpkN7zd8fIx_P38q3LtAhY4',
    appId: '1:193319651907:android:cbee5cdc37caed816362f6',
    messagingSenderId: '193319651907',
    projectId: 'sahaay-18eb3',
    storageBucket: 'sahaay-18eb3.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyABkk7cr5LBBpkN7zd8fIx_P38q3LtAhY4',
    appId: '1:193319651907:ios:cbee5cdc37caed816362f6',
    messagingSenderId: '193319651907',
    projectId: 'sahaay-18eb3',
    storageBucket: 'sahaay-18eb3.firebasestorage.app',
  );
}
