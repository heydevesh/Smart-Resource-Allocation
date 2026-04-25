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
  vapidKey: 'BMOzRqdJ5T4w2JcoDmjrP4juRu14WG6IyH4Qdg0KMuxQ-1KNJYZMLpeAnFcS8W2becXp8aeDOMcn5Co_26NhGeQ',

  // ── Firebase App Check ───────────────────────────────────────
  // Obtain from: Firebase Console → App Check → Project Settings

  // ── Vertex AI / Cloud Functions ──────────────────────────────
  functionsRegion: 'us-west1',
  vertexAiProject: 'sahaay-18eb3',

  // ── Firebase App Check (reCAPTCHA v3) ────────────────────────
  recaptchaSiteKey: '',
};
