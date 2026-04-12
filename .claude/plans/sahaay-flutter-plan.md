# Sahaay Flutter App Development Plan

## Context

**Project:** Sahaay - Smart Resource Allocation for NGOs  
**Goal:** Build a Flutter mobile app that digitizes community needs tracking and intelligently matches volunteers using AI (Gemini)  
**Constraint:** ZERO COST - All services must remain on free tiers only (no billing enabled)  
**Target:** Google Solution Challenge 2026 submission

**Current State:** Fresh Flutter project with only the default counter app template in `lib/main.dart`

---

## Implementation Phases

### Phase 1: Dependencies & Project Structure (Priority: HIGH)

**1.1 Update pubspec.yaml with required packages:**

| Category | Packages |
|----------|----------|
| Firebase Core | `firebase_core`, `cloud_firestore`, `firebase_auth`, `firebase_storage`, `firebase_messaging` |
| Google Services | `google_sign_in`, `google_maps_flutter`, `geolocator`, `google_generative_ai` |
| Architecture | `flutter_riverpod` (state management), `go_router` (navigation) |
| Utilities | `intl` (date formatting), `flutter_styled_toast` (notifications) |

**1.2 Create directory structure under lib/:**
```
lib/
├── core/           # Constants, theme, error handling
├── models/         # Data classes (Need, Task, Volunteer, User)
├── routing/        # go_router configuration
├── services/       # Firebase, Gemini, Maps services
├── providers/      # Riverpod state providers
├── screens/        # 5 main screens + sub-screens
│   ├── home/
│   ├── needs_map/
│   ├── tasks/
│   ├── volunteers/
│   └── insights/
└── widgets/        # Reusable components
```

---

### Phase 2: Firebase Integration (Free Tier)

**2.1 Firebase Console Setup (user action required):**
1. Create Firebase project at console.firebase.google.com
2. Enable Spark Plan (free, no credit card)
3. Register Android app → download `google-services.json` → place in `android/app/`
4. Register iOS app → download `GoogleService-Info.plist` → place in `ios/Runner/`
5. Enable Authentication: Email/Password + Google Sign-In
6. Create Firestore Database in production mode
7. Enable Storage with security rules

**2.2 Firebase initialization code:**
- Create `lib/services/firebase_service.dart` with async initialization
- Add Firebase platform configuration files to `.gitignore` patterns

---

### Phase 3: Core Architecture

**3.1 Models (lib/models/):**
- `need.dart` - Community need entity (title, category, urgency, lat, lng, status)
- `task.dart` - Work item entity (linked to need, assigned volunteers, priority, due date)
- `volunteer.dart` - Volunteer profile (skills, availability, location, task history)
- `user.dart` - Auth user with role metadata (Admin, Field Worker, Volunteer)

**3.2 Services (lib/services/):**
- `auth_service.dart` - Sign in/out, role-based access
- `firestore_service.dart` - CRUD operations for all collections
- `gemini_service.dart` - AI matching logic (free tier: 15 req/min, 1M tokens/month)
- `location_service.dart` - Geolocation tracking and distance calculations

**3.3 State Management (lib/providers/):**
- Riverpod providers for: auth state, needs list, tasks list, volunteers list, current location

**3.4 Routing (lib/routing/):**
- `go_router` configuration with 5 bottom navigation tabs
- Deep linking support for task/need details

---

### Phase 4: UI Shell & Navigation

**4.1 Main scaffold with BottomNavigationBar:**
- 5 tabs: Home (Dashboard), Needs Map, Tasks, Volunteers, Insights
- Persistent navigation across screens
- Role-based tab visibility (some tabs hidden for certain roles)

**4.2 Screen implementations:**

| Screen | Purpose | Key Widgets |
|--------|---------|-------------|
| Home | Dashboard metrics, quick actions | Cards, stats grid, activity feed |
| Needs Map | Interactive map with need pins | GoogleMap, markers, heatmap overlay |
| Tasks | List/filter/assign tasks | TabBar (Pending/Active/Done), task cards |
| Volunteers | Roster, availability, smart match | DataTable, availability toggle, AI match button |
| Insights | Analytics, reports, AI recommendations | Charts (fl_chart), export PDF button |

---

### Phase 5: Feature Implementation

**5.1 Needs Management:**
- Form to submit new needs (with photo upload, geotag, category, urgency)
- List view with filters (category, urgency, status)
- Map view with color-coded pins

**5.2 Task Assignment:**
- Create task from need
- "Smart Match" button → Gemini API ranks volunteers by skills, proximity, availability
- Manual override for coordinator

**5.3 Volunteer Management:**
- Registration form with skills selection
- Availability toggle (on-duty/off-duty)
- Task history and impact metrics

**5.4 Analytics & Reports:**
- Completion rate charts
- Needs by category breakdown
- One-tap PDF export for donor reporting

---

### Phase 6: Offline Support & Polish

**6.1 Offline persistence:**
- Firestore offline cache enabled
- Queue submissions when offline
- Sync when connectivity restored

**6.2 Notifications:**
- Firebase Cloud Messaging for task alerts and escalations
- Local notifications for critical needs

**6.3 Theme & Branding:**
- Material Design 3
- Custom color palette: Teal `#0D7D6E`, Amber `#F59E0B`, Red `#E24B4A`, Green `#639922`
- Fonts: DM Sans (body), Syne (display)

---

## Critical Files to Create/Modify

| File | Purpose |
|------|---------|
| `pubspec.yaml` | Add all dependencies |
| `lib/main.dart` | App entry, Firebase init, ProviderScope |
| `lib/core/app_theme.dart` | Theme configuration |
| `lib/models/*.dart` | Data entities |
| `lib/services/*.dart` | Backend integrations |
| `lib/providers/*.dart` | State management |
| `lib/routing/app_router.dart` | Navigation setup |
| `lib/screens/*/*.dart` | UI screens |
| `lib/widgets/*.dart` | Reusable components |
| `android/app/google-services.json` | Firebase config (user-provided) |
| `ios/Runner/GoogleService-Info.plist` | Firebase config (user-provided) |

---

## Verification Steps

1. **After Phase 1:** Run `flutter pub get` → no dependency conflicts
2. **After Phase 2:** Run `flutter run` → Firebase initializes without errors
3. **After Phase 3:** `flutter analyze` → no warnings or errors
4. **After Phase 4:** App launches with 5-tab navigation, all tabs render
5. **After Phase 5:** End-to-end flow works (create need → assign volunteer → mark complete)
6. **After Phase 6:** Offline mode tested (airplane mode → submit need → reconnect → sync)

---

## Cost Compliance Checklist

- [ ] Firebase Spark Plan (free) - no billing enabled
- [ ] Gemini API free tier (15 req/min, 1M tokens/month)
- [ ] Google Maps $200/month credit covers NGO usage
- [ ] No Cloud Functions requiring paid tier
- [ ] No billed Google Cloud services provisioned

---

## Estimated Scope

- **Total Files:** ~40-50 Dart files
- **Lines of Code:** ~4,000-6,000 (excluding generated code)
- **Timeline:** 6 development sprints (dependencies → Firebase → architecture → UI → features → polish)
