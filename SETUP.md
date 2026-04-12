# Sahaay - Firebase Setup Guide

This guide will help you configure Firebase to enable the full functionality of the Sahaay app.

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **Sahaay** (or your preferred name)
4. Click **Continue**
5. **Disable Google Analytics** (not needed for free tier)
6. Click **Create project**
7. Wait for project creation, then click **Continue**

---

## Step 2: Register Web App

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: **Sahaay Web**
3. **Check the box** for "Also set up Firebase Hosting"
4. Click **Register app**
5. **Copy the `firebaseConfig` object** - you'll need this in Step 4

---

## Step 3: Configure Firebase Services

### Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (for development)
4. Choose a location: **asia-south1** (Mumbai) or closest to you
5. Click **Enable**

### Enable Authentication

1. Go to **Build** → **Authentication**
2. Click **Get started**
3. Enable these sign-in methods:
   - **Email/Password**: Click Enable → Save
   - **Google**: Click Enable → Save (requires support email)
4. Click **Save**

### Enable Storage (Optional)

1. Go to **Build** → **Storage**
2. Click **Get started**
3. Select **Start in test mode**
4. Click **Done**

---

## Step 4: Add Firebase Config to Web App

Edit `web/index.html` and add the Firebase config **before** `</body>`:

```html
  <!-- Add this BEFORE the existing <script src="main.dart.js"></script> -->
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js"></script>
  <script>
    // Replace with YOUR actual config from Firebase Console
    firebase.initializeApp({
      apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef123456"
    });
  </script>
```

**Important:** Replace the values with your actual config from Step 2.

---

## Step 5: Run the App

```bash
flutter run -d chrome
```

The app should now connect to Firebase and work fully!

---

## Step 6: Add Sample Data (Optional)

In Firebase Console → Firestore Database, click **Start collection** and add:

### Collection: `users`
```
Document ID: (auto-generate)
- email: admin@sahaay.org
- name: Admin User
- phone: +91 98765 43210
- role: admin
- isActive: true
- createdAt: (timestamp)
```

### Collection: `volunteers`
```
Document ID: (auto-generate)
- name: Rajesh Kumar
- phone: +91 98765 12345
- email: rajesh@example.com
- skills: ["Medical", "First Aid"]
- isAvailable: true
- tasksCompleted: 5
- currentTaskIds: []
- joinedAt: (timestamp)
```

### Collection: `needs`
```
Document ID: (auto-generate)
- title: Medical supplies needed
- description: Need bandages and medicines for community health camp
- category: Medical Supplies
- urgency: high
- status: unaddressed
- latitude: 19.0760
- longitude: 72.8777
- address: Mumbai, Maharashtra
- reportedAt: (timestamp)
```

---

## Step 7: Get Gemini API Key (For AI Features)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API key**
3. Copy the key
4. Add to your app when using `GeminiService`:
   ```dart
   final gemini = GeminiService(apiKey: 'YOUR_API_KEY');
   ```

**Free tier:** 15 requests/minute, 1 million tokens/month

---

## Step 8: Get Google Maps API Key (For Map Features)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Library**
4. Search and enable:
   - **Maps JavaScript API**
   - **Geocoding API**
5. Go to **Credentials** → **Create Credentials** → **API Key**
6. Copy the key
7. Add to `web/index.html`:
   ```html
   <script async defer
     src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap">
   </script>
   ```

**Free tier:** $200 monthly credit (~28,000 map loads)

---

## Firestore Security Rules

For production, update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Troubleshooting

### App shows "Firebase not configured"
- Check `web/index.html` has the Firebase config script
- Verify the config values match your Firebase project

### Permission denied errors
- Check Firestore security rules
- Make sure Authentication is enabled

### Build fails
```bash
flutter clean
flutter pub get
flutter run -d chrome
```

---

## Cost Summary

| Service | Free Tier Limit | Cost |
|---------|----------------|------|
| Firebase (Spark Plan) | 1GB storage, 50K reads/day | $0 |
| Gemini API | 1M tokens/month | $0 |
| Google Maps | $200 credit/month | $0 |

**Total: $0** as long as you stay within free tier limits.
