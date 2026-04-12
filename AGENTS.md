# AGENTS.md (Hub for AI Context)

**Purpose:** This file acts as the central hub of context for any AI coding assistant or agent working on this repository. Before executing tasks, creating architecture, or writing code, AI agents MUST read this file to understand the project's state, technical rules, business logic, constraints, and architecture.

---

## 1. Project Identity & Goal
* **Name:** Sahaay (formerly SevaBridge / Smart-Resource-Allocation)
* **Goal:** A mobile-first Flutter application built for NGOs to digitize community needs via map-based tracking and intelligently coordinate volunteer deployment using AI (Gemini).
* **Target Audience:** Field Workers (submit needs), Volunteers (complete tasks), NGO Coordinators / Admins (dashboard management).
* **SDG Target Focus:** Goal 1, Goal 3, Goal 4, Goal 17.

## 2. Technical Stack Constraints
* **Framework:** Flutter (Android focused for field testing, iOS/Web secondary).
* **State Management:** Riverpod (Preferred) or Provider.
* **Navigation:** `go_router` for robust tab-based and deep-link routing.
* **Backend:** Firebase (Firestore, Auth, Storage).
* **Map & Geolocation:** `google_maps_flutter`, `geolocator`.
* **AI Logic:** `google_generative_ai` (Gemini API for Smart Matching and Data Recommendations).
* **UI/UX Design:** Material Design 3. Custom palette (Teal `#0D7D6E`, Amber `#F59E0B`, Red `#E24B4A`, Green `#639922`). Fonts: *DM Sans* (Body) and *Syne* (Display).

> ⚠️ **CRITICAL COST CONSTRAINT:** 
> **Zero Billing Rule:** All AI agents contributing to this project MUST NOT write scripts, workflows, or infrastructure code that enables paid-tier services. Any Firebase setups, Maps SDKs, or Gemini APIs used MUST strictly remain within free-tier limits. Do not provision billed Google Cloud services under any circumstances.

## 3. Recommended Code Architecture
Please adhere to a feature-first or clean architecture structure in the `lib/` directory:

```text
lib/
 ┣ core/              # Constants, themes, unified API clients, utility functions
 ┣ models/            # Data entities (Needs, Tasks, Volunteers, Users)
 ┣ routing/           # go_router configuration and shell routes 
 ┣ services/          # Firebase interactions, Gemini API calls, Google Maps logic
 ┣ screens/           # UI logic (separated by bottom navigation tabs)
 ┃ ┣ home/            # Dashboard & Real-time metrics
 ┃ ┣ needs_map/       # Maps and geographic data
 ┃ ┣ tasks/           # Active, Pending, Completed, Escalated tabs
 ┃ ┣ volunteers/      # Rosters, Availability, "Smart Match" suggestions
 ┃ ┗ insights/        # Metrics, Charts, Reports, AI recommendations
 ┗ main.dart          # Entry point and provider scope
```

## 4. Database Schema (Firestore)
When reading/writing data, expect these primary collections:
* **`/needs`**: Represents identified community gaps. (Fields: `title`, `category`, `urgency` [low/medium/high/critical], `lat`, `lng`, `status`, `assignedVolunteers`).
* **`/tasks`**: Created to fulfill needs. (Fields: `title`, `priority`, `volunteerIds`, `status`, `progress`, `dueAt`, `category`).
* **`/volunteers`**: Profiles for responders. (Fields: `name`, `phone`, `skills` [array], `availabilitySchedule`, `tasksCompleted`, `lat`, `lng`).
* **`/users`**: RBAC permissions for app login (Admin, Field Worker, Volunteer).

## 5. Development Status & Next Steps
* [x] Core plan translated to README.
* [x] Flutter SDK base application `sahaay` initialized.
* **[In Progress]** Setting up `pubspec.yaml` with Firebase, Maps, and routing dependencies.
* **[Pending]** Developing the UI Shell (Bottom navigation bar & blank screens).
* **[Pending]** Connecting the Firebase Project and establishing Auth/Firestore services.
* **[Pending]** Gemini API "Smart Match" integration logic.

## 6. Development Rules for AI Tools 
1. **No Cat/Grep in Bash:** Use native Python scripts or MCP tool APIs (like `replace_file_content` or `write_to_file`) for file edits instead of Linux terminal parsing commands.
2. **Atomic Commits:** Make specific, targeted git commits when finishing a functional block (e.g., "feat: integrate google maps").
3. **No Dummy Content on Final UI:** When generating UI, populate it with realistic Indian NGO placeholder data (e.g., "Dharavi Medical Need" instead of "Lorem Ipsum"). 
4. **Validate Before Implementing:** Run `flutter analyze` and `flutter test` incrementally. Do not bulk-write 1000+ lines of untested code without verifying UI rendering capability.
