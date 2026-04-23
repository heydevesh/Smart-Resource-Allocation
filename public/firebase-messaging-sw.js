importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// These values should match your environment.ts firebase config
firebase.initializeApp({
  projectId: "sahaay-18eb3",
  appId: "1:193319651907:web:cbee5cdc37caed816362f6",
  storageBucket: "sahaay-18eb3.firebasestorage.app",
  apiKey: "AIzaSyABkk7cr5LBBpkN7zd8fIx_P38q3LtAhY4",
  authDomain: "sahaay-18eb3.firebaseapp.com",
  messagingSenderId: "193319651907",
  measurementId: "G-X12M3Q4G1Z"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'Sahaay Alert';
  const notificationOptions = {
    body: payload.notification.body || 'New notification received.',
    icon: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
