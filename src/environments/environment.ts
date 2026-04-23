export const environment = {
  production: false,

  // ── Firebase SDK config (project: sahaay-18eb3) ──────────────
  firebase: {
    projectId: 'sahaay-18eb3',
    appId: '1:193319651907:web:cbee5cdc37caed816362f6',
    storageBucket: 'sahaay-18eb3.firebasestorage.app',
    apiKey: 'AIzaSyABkk7cr5LBBpkN7zd8fIx_P38q3LtAhY4',
    authDomain: 'sahaay-18eb3.firebaseapp.com',
    messagingSenderId: '193319651907',
    measurementId: 'G-X12M3Q4G1Z',
  },

  // ── Firebase Cloud Messaging ─────────────────────────────────
  // Obtain from: Firebase Console → Project Settings → Cloud Messaging
  //              → Web Push certificates → Key pair → Copy
  vapidKey: 'REPLACE_WITH_VAPID_KEY_FROM_FIREBASE_CONSOLE',

  // ── Firebase App Check ───────────────────────────────────────
  // Obtain from: Firebase Console → App Check → Project Settings
  recaptchaSiteKey: 'REPLACE_WITH_RECAPTCHA_V3_SITE_KEY',

  // ── Vertex AI / Cloud Functions ──────────────────────────────
  functionsRegion: 'us-west1',
  vertexAiProject: 'sahaay-18eb3',
};

