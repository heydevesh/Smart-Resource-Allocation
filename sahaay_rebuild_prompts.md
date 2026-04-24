# Sahaay (सहाय) - Project Overview & Rebuild Prompts

## 1. Project Summary
**Sahaay** is a web, offline-capable Angular 18 PWA designed for NGO crisis coordination in Mumbai (focusing on areas like Dharavi, Kurla, Govandi, Bhandup). It replaces fragmented WhatsApp/paper-based coordination with a unified, real-time dashboard powered by Vertex AI multi-agent orchestration. The app connects Field Workers, Volunteers, NGO Coordinators, and Super Admins.

## 2. Tech Stack & Architecture
- **Frontend**: Angular 18 (standalone components, Signals), Angular Material / MDC, Google Maps JS API.
- **Backend**: Firebase (Firestore, Auth with Phone/OTP, Storage, FCM, App Check), Firebase Extensions (Translate, Summarize, Multimodal).
- **AI Layer**: Vertex AI Reasoning Engine (Gemini 2.0 Flash) accessed via a single Go-based Firebase Cloud Function (`CallAgent` - Deployed/Active using ReasoningEngineExecutionClient).
- **Agents**: Orchestrated through a Multi-Agent Graph (Project: `sahaay-18eb3`, Region: `asia-south1`).
  - `Orchestrator`: Entry point, routes intents.
  - `MatchAgent`: Volunteer matching logic.
  - `SurgeAgent`: Prediction logic.
  - `NarratorAgent`: Reporting logic.
  - `QueryAgent`: Q&A logic.

## 3. Global Design System Prompt
*Prepend this block to any UI generation prompt to ensure consistency across the application.*

```text
GLOBAL DESIGN SYSTEM for all Sahaay screens:
- Framework: Angular 18 PWA, responsive web application
- Primary: #0A6B5E | Accent: #1D9E75 | Surface: #FAFAF9 | Card: #FFFFFF
- Critical: #DC2626 | High: #D97706 | Medium: #2563EB | Low: #16A34A | AI: #7C3AED
- Fonts: DM Serif Display (headings/brand), Inter (all UI text)
- Radius: Cards 14px | Buttons 8px | Inputs 9px | Pills 20px
- Border: 1px solid #E5E3DF on all cards
- Shadow: 0 1px 3px rgba(0,0,0,0.08)
- Icons: Material Symbols Rounded
- NO lorem ipsum — all placeholder data must be real Mumbai/NGO context (Dharavi, Kurla, Govandi, Bhandup, Indian names)
- Bottom nav: 56px, 5 tabs, white bg, teal for active tab
- Top bar: 56px, white bg, bottom border #E5E3DF
```

---

## 4. Feature Rebuild Prompts

### 4.1 Auth Screen (Login / OTP)
```text
Design a login screen for Sahaay NGO app. Full-screen, responsive web, premium feel.

BACKGROUND: Deep teal to dark #0A6B5E to #054035 gradient, full screen. Subtle pattern: very faint circular rings (SVG, white 3% opacity) like a ripple.

LOGO SECTION (top 35% of screen, centered):
- Large circular icon 80px — white bg, teal icon of two hands
- "Sahaay" DM Serif Display 40px white
- "सहाय" 20px white 60% opacity below
- "NGO Coordination Platform" 13px white 50% opacity

BOTTOM CARD (white, top-left/right radius 28px, padding 28px, slides up):
Title: "Welcome back" DM Serif 22px #111110
Subtitle: "Enter your phone number to continue" 14px #6B6965
Phone input (full width, 48px height, radius 9px, border #E5E3DF): [+91 ▾] | [Phone number placeholder]
[Send OTP] button — full width, 48px, teal bg, white text Inter 14px 600, radius 9px
Below: "OTP will be sent to your WhatsApp" 12px muted with WhatsApp green icon
Divider: — or —
[Continue with Google] white outline button
BOTTOM: "For NGO workers, volunteers & coordinators only" 11px muted center

OTP SCREEN STATE (same card, replaces phone input):
"OTP sent to +91 98XXX XXXXX" 13px muted + [Change] link
4-box OTP input — auto-advance
[Verify OTP] teal full-width button
[Resend in 45s] disabled timer below
```

### 4.2 Home Tab (Mission Control)
```text
Design a web-based Angular 18 PWA home dashboard for Sahaay. Make it feel like a premium mission control tool.

TOP BAR: Left: "Sahaay" in DM Serif 22px teal + "सहाय" 14px muted. Right: bell icon with red badge "3" + circular avatar.
GREETING SECTION: "Good morning, Rahul" in DM Serif 24px. Below: "3 critical needs in Dharavi need immediate attention" with a pulsing teal dot.
STAT CARDS (horizontal scroll row, 4 cards): Open Needs (47, red), Volunteers Active (23, green), In Progress (12, amber), Resolved Today (8, teal).
CRITICAL NEEDS SECTION: 3 stacked cards (radius 14px, 4px LEFT urgency bar). Card 1 (Red/CRITICAL): Medical Emergency, "Insulin shortage...", [Assign Now] button. Card 2 (Amber/HIGH): Food Distribution. Card 3 (Blue/MEDIUM): Education Supplies.
AI MATCH CARD (teal gradient, radius 14px): Sparkle ✦ icon + "AI Match Ready". Main text: "MatchAgent matched Priya Sharma...". Confidence bar: "94% match". Buttons: [Confirm Match] | [View All Matches].
BOTTOM NAV: Home (active) | Map | Tasks | Volunteers | Insights.
```

### 4.3 Needs Map Tab
```text
Design a full-screen map view for Sahaay. The map fills 100% of the viewport. UI elements float over it as cards.

MAP: Google Maps with dark "Aubergine" style centered on Dharavi.
CUSTOM MAP PINS: Circular pins with urgency color fill and white icon. Show clusters (dark circle with count) and a Heatmap Layer (radial heat blobs in high-density areas).
FLOATING TOP BAR (glass card): Search input + Filter icon button. Below search: 3 urgency filter pills ([Critical], [High], [Medium]).
FLOATING PROXIMITY RING (on pin tap): Dashed teal circle 5km radius with volunteer avatar dots inside.
FLOATING BOTTOM CARD (slides up on tap): Expanded state shows Urgency badge, Need title, metadata, Description, AI Recommendation ("MatchAgent found 3 volunteers nearby"), and [Assign Volunteer] button.
FAB (bottom right): Layers icon to toggle heatmap/pins.
```

### 4.4 Tasks Tab (Kanban & Operations)
```text
Design the Tasks tab for Sahaay. Amber #D97706 for in-progress accent.

TOP BAR: "Tasks" DM Serif 24px, [+ New Task] button, summary line "12 tasks active · 3 overdue".
STATUS TABS: [Open] [Assigned] [In Progress] [Resolved].
TASK CARDS: 1px left urgency bar. Row 1: Task ID, Category badge, Priority pill. Row 2: Task title. Row 3: Description. Row 4: Progress bar (if In Progress). Row 5: Metadata chips (Location, Assignee, Due date). Show 4 cards with different statuses.
FAB: Teal circle with + icon.
CREATE TASK MODAL (Slides up): Sections for "Link to Need" (search + recent chips), "Task Details" (Title, Category picker, Priority toggle), "Assignment" (MatchAgent suggestion card or manual picker), "Timeline" (Due date, Hours), and "Notes & Attachments". [Create Task] full-width bottom button.
```

### 4.5 Volunteers Tab
```text
Design the Volunteers tab for Sahaay. Green #16A34A for availability.

TOP BAR: "Volunteers" DM Serif 24px, [+ Add Volunteer] button.
SEARCH + FILTER: Search input, horizontal filter chips ([Available Now], [Medical], etc.).
AVAILABILITY BANNER: Green tint bg, "23 volunteers available right now...".
VOLUNTEER CARDS (2-column grid): Avatar with availability dot, Name, Skill tags (Medical, First Aid), Location, Rating/Stats, Status text (Available Now), [Assign] button.
SMART MATCH FAB: Sparkle icon, opens MatchAgent modal.

VOLUNTEER PROFILE SCREEN:
HERO (teal gradient): Large avatar, Name, Role, Availability status, Stats row.
SKILL TAGS: Horizontal scroll of teal pills.
INFO CARDS: Contact & Location, Availability Schedule (week grid), Recent Activity (completed tasks), AI Match Score Card (Skill match, Proximity, Overall match %).
BOTTOM BUTTON: [Assign to a Need].
```

### 4.6 Insights Tab (Analytics & Reports)
```text
Design the Insights tab for Sahaay. Purple #7C3AED for AI features.

TOP BAR: "Insights" + Time range dropdown ([Week ▾]).
KPI ROW: 5 metric cards (Needs Reported, Resolved, Avg Response, Active Volunteers, Critical Handled) with trend arrows.
TREND CHART: Line chart showing Needs over 8 weeks (Teal: Total, Red: Critical, Green: Resolved).
CATEGORY BREAKDOWN: Horizontal bar chart showing Needs by Category (Medical, Food, etc.).
SURGE PREDICTION CARD (purple bg): Sparkle icon + "SurgeAgent Prediction". Title: "Monsoon prep: Medical needs to surge 40%". Sparkline bars for categories.
REGION MAP MINI: Static Mumbai heatmap with circles sizing by need volume.
DONOR NARRATIVE CARD: Sparkle icon + "NarratorAgent". Headline, 3 paragraphs of human-centered AI-generated report, Key stats row, [Download PDF Report] button.
```

### 4.7 NGO Registry (Directory)
```text
Design a Partner Registry screen for Sahaay NGO app.

TOP BAR: "Directory" label, "Partner Registry" title, [+ New Registration] primary button.
STATS GRID: 3 cards (Total Verified NGOs, Active Last 24h, Pending Verifications) with large numbers and trend indicators.
FILTERS BAR: Search input (name/contact), Ward dropdown, Expertise Area dropdown, Advanced filter button.
NGO GRID: Cards showing NGO name, verification badge (check icon), ward location, status badge (active/pending/inactive), expertise tags (Medical Aid, Food, etc.), and footer with contact person and volunteer capacity. Use Material Symbols Outlined.
```

### 4.8 Resource Vault (Inventory & Logistics)
```text
Design a Resource Vault (Inventory) screen for Sahaay NGO app.

TOP BAR: "Central Node" subtitle, "Resource Vault" title, [+ Request Resource] button.
FORECAST ALERT CARD: AI sparkle icon, "Forecast Alert: Monsoon Surge", predictive text about demand spike, [Review Allocation] button.
MAIN COLUMN (Stock): 
- Critical Stock Card: "Medical Supplies", red "Critical Stock-Out" badge, 12% capacity, red progress bar, available vs target count.
- Item Grid: Cards for Food Rations (85%), Water Supply (38% warning), Shelter Kits (wide card with multi-progress for tents/blankets).
SIDE COLUMN (Logistics):
- Map Card: Warehouse location image + map pin, "HQ Warehouse Alpha", Operational status dot.
- Logistics Feed: Recent dispatch and incoming shipments with icons, ETA/Time, and descriptions.
```

### 4.9 Settings Screen
```text
Design a Settings screen for Sahaay NGO app.

TOP BAR: "Command Center" subtitle, "Settings" title.
SECTIONS:
- Notifications: Slide toggles for "Critical Need Alerts" and "Volunteer Applications" with descriptions.
- Appearance: Slide toggles for "Dark Mode" and "Default Map View" (Start with heatmap enabled).
- Account: User profile card with avatar, Name, Role (NGO Founder or Regional Coordinator), and an outlined red [Sign Out] button.
```

## 5. Core Role Ladder & User Journeys

### 5.1 The Core Role Ladder
Sahaay uses a trust-based role ladder where access expands as users are vetted and assigned operational duties.

Base roles:
- **Guest / Applicant** — registered but not yet verified by an NGO.
- **Volunteer** — verified user who can respond to needs and perform assigned work.
- **Field Lead** — trusted volunteer who can coordinate a small local team.
- **NGO Admin / Coordinator** — operational manager for one NGO.
- **NGO Founder** — creator and legal owner of an NGO entity on the platform. Holds `manage_registry` permissions.
- **Super Admin** — platform-wide manager across all NGOs and regions.

### 5.2 Permission Model Principles
- **Read > Action**: Seeing data is broader than modifying it.
- **Narrow Assignment**: Only specific roles can assign others.
- **NGO/Ward Scoping**: Access is restricted to the user's ward/NGO unless Super Admin.
- **Admin-Only Approvals**: Identity verification and role promotion are reserved for Admins.

### 5.3 Volunteer Onboarding Journey
1. **Self-Registration**: Sign up via phone OTP + profile completion (Aadhaar/ID upload). Status: *Applicant*.
2. **NGO Review**: Coordinator reviews identity and skills in the "Pending Verifications" queue.
3. **Activation**: Admin selects *Accept*, *Reject*, or *Shortlist*. On acceptance, role flips to *Volunteer*.
4. **Matched/Assigned**: Volunteer receives MatchAgent suggestions or direct assignments.
5. **Confirmation**: Volunteer must explicitly *Accept* the task to ensure accountability.

---

## 6. Access Matrix by Tab

### 6.1 Auth & Home
- **Applicant**: Profile management only. Home shows "Application Under Review" teaser.
- **Volunteer**: View own assignments, nearby opportunities, and active tasks. Can Accept/Decline.
- **NGO Admin / Founder**: Full Mission Control. View all NGO metrics, confirm AI matches, process applications.

### 6.2 Needs Map
- **Volunteer**: View relevant nearby needs and own task routes. No heatmap or distribution layers.
- **Field Lead**: View ward-level heatmap and volunteer proximity within their cluster.
- **NGO Admin / Founder**: Full map control. Proximity rings, clusters, and "Assign from Map" capabilities.

### 6.3 Tasks & Volunteers
- **Volunteer**: Update progress on assigned tasks. View/edit own profile only.
- **NGO Admin / Founder**: CRUD access to all tasks. Full volunteer directory access including ID proof review and disciplinary notes.

---

## 7. Implementation Roadmap: Role & Capability Keys

### 7.1 Role Keys
- `applicant`, `volunteer`, `field_lead`, `ngo_admin`, `ngo_founder`, `super_admin`

### 7.2 Capability Flags (Permissions)
- `view_home`, `view_map`, `view_tasks`, `create_task`, `assign_task`, `approve_volunteer`, `view_insights_ngo`, `manage_inventory`

### 7.3 Approval-Sensitive Actions (MFA/Admin Only)
- Approving/Rejecting volunteers.
- Viewing raw identity documents (Aadhaar/Voter ID).
- Promoting users to Field Lead.
- Resolving high-value inventory allocations.

---

## 8. Auth & Registration Flow

### 8.1 Login Screen (Email + Google OAuth)
```text
Design a login screen for Sahaay NGO app. Full-screen, responsive web, premium feel.

BACKGROUND: Deep teal to dark #0A6B5E to #054035 gradient, full screen. Subtle pattern: very faint circular rings (SVG, white 3% opacity) like a ripple.

LOGO SECTION (top 35%, centered):
- Large circular icon 80px — white bg, teal volunteer_activism icon
- "Sahaay" DM Serif Display 40px white
- "सहाय" 20px white 60% opacity
- "NGO Coordination Platform" 13px white 50% opacity

BOTTOM CARD (white, radius 28px top, padding 28px):
Title: "Welcome back" DM Serif 22px
Email input: full width, mat-form-field, prefix mail icon
Password input: full width, mat-form-field, prefix lock icon, visibility toggle suffix
[Sign In] button — full width, teal bg, white text, radius 9px
Divider: — or —
[Continue with Google] white outline button with Google icon
BOTTOM: "New here? Create an account" link to /register

AUTHENTICATION: Firebase Auth with email/password + Google OAuth popup.
On successful login, check Firestore 'users/{uid}':
  - If user doc exists with isRegistered=true → navigate to /home
  - If no user doc or isRegistered=false → redirect to /register for profile completion
```

### 8.2 Registration Flow (3-Step Form)
```text
Design a 3-step registration form for Sahaay. Same ambient gradient background as login.

STEP INDICATOR: Horizontal dots with connecting lines. States: done (✓ green), active (teal), pending (grey).
Steps: [Personal] → [Role & Skills] → [Verification]

STEP 1 — Personal Info:
- Full Name (mat-input, required)
- Phone Number (mat-input, required)
- Date of Birth (mat-input, date picker)
- Gender (mat-select: Male, Female, Other)
- Address / Location (mat-input)

STEP 2 — Role & Skills:
- Preferred Role (4 clickable cards: Volunteer, Field Lead, NGO Admin, NGO Founder) — each with icon + subtitle
- Ward / Region (mat-select: Dharavi, Kurla, Govandi, Bhandup)
- Skills (comma-separated mat-input)
- Languages Spoken (comma-separated mat-input)
- NGO Affiliation (optional mat-input)

STEP 3 — Identity Verification:
- Aadhaar Card Upload (drag-drop zone, accepts image files)
  - On upload: Tesseract.js OCR auto-extracts Aadhaar number → auto-fills input
  - Shows OCR confidence badge (green ≥70%, amber <70%)
- Selfie Upload (drag-drop zone)
  - On upload: face-api.js compares selfie vs Aadhaar photo
  - Shows face match badge (green "Match 94%" or red "Mismatch")
- MatProgressBar during processing
- Status text updates ("Reading Aadhaar card...", "Matching faces...", etc.)

SUBMIT: Creates Firestore doc at 'users/{uid}' with all fields + faceMatchConfidence + ocrConfidence.
Role defaults to 'applicant', verificationStatus to 'pending'.

BOTTOM: "Already registered? Sign in" link to /auth
```

---

## 9. Identity Verification Pipeline

### 9.1 Architecture (Hybrid: Client + Cloud)
```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: Tesseract.js (Client-side, free, unlimited)   │
│  - OCR on Aadhaar card image                            │
│  - Extracts: Aadhaar number, DOB, gender                │
│  - Auto-fills registration form fields                  │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: Cloud Vision API (Cloud Function, free tier)  │
│  - Face detection + quality check on selfie             │
│  - Validates: blur, headwear, face count                │
│  - Currently DISABLED (CLOUD_VISION_ENABLED = false)    │
│  - Enable when DetectFace Cloud Function is deployed    │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: face-api.js (Client-side, free, unlimited)    │
│  - TinyFaceDetector + FaceLandmark68 + FaceRecognition  │
│  - 128-dim face descriptors                             │
│  - Euclidean distance < 0.6 = match                     │
│  - Confidence = max(0, (1 - distance/0.8)) × 100       │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Key Files
| File | Purpose |
|------|---------|
| `src/app/core/verification/verification.service.ts` | Central service: OCR, face detection, face matching |
| `functions/go/verification/face_detect.go` | Go Cloud Function wrapping Cloud Vision API |
| `src/assets/models/face-api/` | Neural network weights (TinyFaceDetector, FaceLandmark68, FaceRecognition) |
| `src/app/auth/register/register.component.ts` | 3-step registration with live verification UI |

### 9.3 Dependencies
```json
{
  "face-api.js": "client-side face matching (128-dim descriptors)",
  "tesseract.js": "client-side Aadhaar OCR (eng+hin)",
  "Cloud Vision API": "server-side face detection (free 1000/month, currently disabled)"
}
```

### 9.4 Angular Config (angular.json)
Face-api.js model weights require `src/assets` mapped to output `assets` in angular.json:
```json
"assets": [
  { "glob": "**/*", "input": "public" },
  { "glob": "**/*", "input": "src/assets", "output": "assets" }
]
```

---

## 10. Data Models

### 10.1 User Model (`models/user.model.ts`)
```typescript
export type UserRole = 'applicant' | 'volunteer' | 'field_lead' | 'ngo_admin' | 'ngo_founder' | 'super_admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions?: Permission[];
  region?: string;
  photoURL?: string;
  verificationStatus?: 'pending' | 'shortlisted' | 'rejected' | 'approved';
  phone?: string;
  skills?: string[];
  idProofUrl?: string;
  availability?: string;

  // Registration & KYC fields
  aadhaarNumber?: string;
  faceVerified?: boolean;
  facePhotoUrl?: string;
  faceMatchConfidence?: number;  // 0-100, from face-api.js
  ocrConfidence?: number;        // 0-100, from Tesseract.js
  languages?: string[];
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  ngoAffiliation?: string;
  registrationCompletedAt?: any;
  isRegistered?: boolean;
}
```

### 10.2 Permission Model
```typescript
export type Permission =
  | 'view_home' | 'view_map' | 'view_tasks'
  | 'create_task' | 'create_need' | 'assign_task'
  | 'update_own_task' | 'update_team_task'
  | 'view_own_profile' | 'update_own_profile'
  | 'view_team_profiles' | 'view_all_volunteers'
  | 'approve_volunteer' | 'promote_volunteer'
  | 'view_insights_own' | 'view_insights_team' | 'view_insights_ngo'
  | 'view_registry' | 'manage_registry'
  | 'view_inventory' | 'request_inventory' | 'manage_inventory'
  | 'manage_ngo_settings' | 'manage_platform_settings'
  | 'view_application_status';
```

### 10.3 Seeded Test Accounts (Firestore `users` collection)
| Email | Password | Role | Region |
|-------|----------|------|--------|
| admin@sahaay.org | Admin@123 | ngo_admin | Dharavi |
| founder@sahaay.org | Founder@123 | ngo_founder | Dharavi |
| fieldlead@sahaay.org | Field@123 | field_lead | Kurla |
| volunteer@sahaay.org | Vol@123 | volunteer | Govandi |

---

## 11. Directory Structure (Current)

```
sahaay/
├── src/app/
│   ├── core/
│   │   ├── ai/agent.service.ts           # Vertex AI Agent Engine bridge
│   │   ├── auth/
│   │   │   ├── auth.service.ts           # Firebase Auth (email + Google OAuth)
│   │   │   └── role.guard.ts             # Role-based route guards
│   │   ├── firebase/
│   │   │   ├── firestore.service.ts      # Firestore CRUD + real-time listeners
│   │   │   ├── storage.service.ts        # Firebase Storage uploads
│   │   │   └── fcm.service.ts            # Push notifications
│   │   ├── maps/
│   │   │   ├── maps.service.ts           # Google Maps JS API
│   │   │   └── geolocation.service.ts    # Browser geolocation
│   │   └── verification/
│   │       └── verification.service.ts   # OCR + face detection + face matching
│   ├── auth/
│   │   ├── login/login.component.ts      # Email/password + Google OAuth
│   │   └── register/register.component.ts # 3-step registration + verification
│   ├── features/
│   │   ├── home/                         # Mission Control dashboard
│   │   ├── needs-map/                    # Google Maps with need pins + heatmap
│   │   ├── tasks/                        # Task CRUD + Kanban
│   │   ├── volunteers/                   # Volunteer directory + approval queue
│   │   ├── insights/                     # Analytics + AI reports
│   │   ├── ngo-registry/                 # Partner NGO directory
│   │   ├── resource-vault/               # Inventory management
│   │   ├── settings/                     # App settings
│   │   └── verification-status/          # Applicant verification status view
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── need.model.ts
│   │   ├── task.model.ts
│   │   ├── volunteer.model.ts
│   │   ├── ai-match.model.ts
│   │   └── index.ts                      # Barrel export
│   ├── shared/components/                # Reusable UI: stat-card, task-card, etc.
│   ├── app.routes.ts                     # Lazy-loaded routes with role guards
│   └── app.config.ts                     # Firebase + Angular providers
│
├── functions/go/
│   ├── agents/orchestrator.go            # CallAgent Cloud Function
│   ├── config/agents.go                  # Vertex AI agent resource IDs
│   ├── verification/face_detect.go       # DetectFace Cloud Function (Cloud Vision)
│   └── middleware/auth.go                # Firebase token verification
│
├── src/assets/models/face-api/           # face-api.js neural network weights
├── angular.json                          # Build config (assets mapping for models)
├── firebase.json
├── firestore.rules
├── AGENTS.md                             # Full architecture spec
└── sahaay_rebuild_prompts.md             # This file
```

---

## 12. Current Implementation Status

| Status | Feature |
|--------|---------|
| ✅ | Login (email/password + Google OAuth) |
| ✅ | 3-step Registration flow (Personal → Role → Verification) |
| ✅ | Aadhaar OCR via Tesseract.js (client-side) |
| ✅ | Face matching via face-api.js (client-side) |
| ✅ | Cloud Vision API Cloud Function (written, not deployed) |
| ✅ | Home dashboard with real-time Firestore data |
| ✅ | Needs Map with Google Maps pins + heatmap |
| ✅ | Tasks tab with CRUD + status lifecycle |
| ✅ | Volunteers tab with approval queue |
| ✅ | Insights tab with charts + AI narrative |
| ✅ | NGO Registry (Partner Directory) |
| ✅ | Resource Vault (Inventory) |
| ✅ | Settings screen |
| ✅ | Role-based guards + permission model |
| ✅ | Skeleton loaders for data fetching |
| ✅ | Material Symbols Rounded icons (globally) |
| ⏳ | Deploy DetectFace Cloud Function (then set CLOUD_VISION_ENABLED = true) |
| ✅ | Deploy CallAgent Cloud Function to GCP (Reasoning Engine Integration) |
| ⏳ | Firebase App Check (reCAPTCHA v3) |
| ⏳ | FCM push notifications for critical needs |
| ⏳ | Offline persistence (IndexedDB) |
| ⏳ | DigiLocker API integration (production KYC) |

---

## 13. Known Issues & Workarounds

| Issue | Cause | Workaround |
|-------|-------|------------|
| Google Maps "InvalidKey" warning | No real API key in environment config | Add key to `src/environments/environment.ts` |
| Tesseract.js "Parameter not found" warnings | Internal WASM engine messages | Harmless — safe to ignore |
| Cross-Origin-Opener-Policy warnings | Google OAuth popup behavior in Chrome | Harmless — standard Firebase Auth behavior |
| DetectFace CORS errors | Cloud Function not deployed | `CLOUD_VISION_ENABLED = false` skips the call |

<!-- Last updated: 2026-04-22T01:53:00+05:30 -->

<!-- Update 1: Refined at 2026-04-24 13:54:42 -->

<!-- Update 2: Refined at 2026-04-24 13:54:43 -->

<!-- Update 3: Refined at 2026-04-24 13:54:43 -->

<!-- Update 4: Refined at 2026-04-24 13:54:43 -->

<!-- Update 5: Refined at 2026-04-24 13:54:43 -->

<!-- Update 6: Refined at 2026-04-24 13:54:44 -->

<!-- Update 7: Refined at 2026-04-24 13:54:44 -->

<!-- Update 8: Refined at 2026-04-24 13:54:44 -->

<!-- Update 9: Refined at 2026-04-24 13:54:44 -->

<!-- Update 10: Refined at 2026-04-24 13:54:44 -->

<!-- Update 11: Refined at 2026-04-24 13:54:45 -->

<!-- Update 12: Refined at 2026-04-24 13:54:45 -->

<!-- Update 13: Refined at 2026-04-24 13:54:45 -->

<!-- Update 14: Refined at 2026-04-24 13:54:45 -->

<!-- Update 15: Refined at 2026-04-24 13:54:46 -->
