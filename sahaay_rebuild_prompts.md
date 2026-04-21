# Sahaay (सहाय) - Project Overview & Rebuild Prompts

## 1. Project Summary
**Sahaay** is a web, offline-capable Angular 18 PWA designed for NGO crisis coordination in Mumbai (focusing on areas like Dharavi, Kurla, Govandi, Bhandup). It replaces fragmented WhatsApp/paper-based coordination with a unified, real-time dashboard powered by Vertex AI multi-agent orchestration. The app connects Field Workers, Volunteers, NGO Coordinators, and Super Admins.

## 2. Tech Stack & Architecture
- **Frontend**: Angular 18 (standalone components, Signals), Angular Material / MDC, Google Maps JS API.
- **Backend**: Firebase (Firestore, Auth with Phone/OTP, Storage, FCM, App Check), Firebase Extensions (Translate, Summarize, Multimodal).
- **AI Layer**: Vertex AI Agent Engine (Gemini 2.0 Flash) accessed via a single Go-based Firebase Cloud Function (`CallAgent`).
- **Agents**:
  - `OrchestratorAgent`: Routes intents to specialist agents.
  - `MatchAgent`: Matches volunteers to tasks based on skills, proximity, and availability.
  - `SurgeAgent`: Predicts resource needs based on historical data.
  - `NarratorAgent`: Writes human-centered donor reports.
  - `QueryAgent`: Natural language Q&A over Firestore data.

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
- Account: User profile card with avatar, Name, Role (Regional Coordinator), and an outlined red [Sign Out] button.
```

## 5. Core Role Ladder & User Journeys

### 5.1 The Core Role Ladder
Think of it as a trust-and-responsibility escalation model — users start at the bottom with limited view access and earn upward permissions through verified activity.

Base roles, each unlocking more of the platform:
- **Guest / Applicant** — someone who signed up but hasn't been vetted yet.
- **Volunteer** — verified and active, can see and accept work.
- **Field Lead** — an elevated volunteer who can manage a small cluster.
- **NGO Admin / Coordinator** — full operational control over their NGO.
- **Super Admin** — Sahaay platform-level control across all NGOs.

### 5.2 The Journey: Volunteer Onboarding Flow
This is the most important user journey for India-context viability.

1. **Self-Registration** — User signs up via phone OTP (already in Sahaay). They fill a short profile: name, ward/area, skills (medical, logistics, driving, etc.), availability, and upload an Aadhaar or voter ID photo for identity verification. Status becomes *Applicant*.
2. **Admin Reviews the Profile** — The NGO Coordinator sees a "Pending Verifications" inbox on their dashboard. They can view the profile, check the ID document, see the declared skills, and either Accept, Reject with reason, or Shortlist for interview. Shortlisting is important — many Indian NGOs do a WhatsApp/phone call before confirming anyone.
3. **Volunteer Gets Activated** — Once accepted, the user's role flips to *Volunteer*. They get an in-app notification: "Welcome to Sahaay! You can now view and accept opportunities in Dharavi." They can now see open tasks, indicate availability, and get matched by MatchAgent.
4. **Task Assignment** — Admin assigns the volunteer to a specific task or the MatchAgent proposes a match. The volunteer must confirm acceptance (this is crucial in India — many volunteers go silent; a confirmation step creates accountability).

<!-- Update 1: Refined at 2026-04-21 22:45:16 -->

<!-- Update 2: Refined at 2026-04-21 22:45:16 -->

<!-- Update 3: Refined at 2026-04-21 22:45:16 -->

<!-- Update 4: Refined at 2026-04-21 22:45:16 -->

<!-- Update 5: Refined at 2026-04-21 22:45:17 -->

<!-- Update 6: Refined at 2026-04-21 22:45:17 -->

<!-- Update 7: Refined at 2026-04-21 22:45:17 -->

<!-- Update 8: Refined at 2026-04-21 22:45:17 -->

<!-- Update 9: Refined at 2026-04-21 22:45:17 -->

<!-- Update 10: Refined at 2026-04-21 22:45:17 -->

<!-- Update 11: Refined at 2026-04-21 22:45:17 -->

<!-- Update 12: Refined at 2026-04-21 22:45:18 -->

<!-- Update 13: Refined at 2026-04-21 22:45:18 -->

<!-- Update 14: Refined at 2026-04-21 22:45:18 -->

<!-- Update 15: Refined at 2026-04-21 22:45:18 -->

<!-- Update 16: Refined at 2026-04-21 22:45:18 -->

<!-- Update 17: Refined at 2026-04-21 22:45:18 -->

<!-- Update 18: Refined at 2026-04-21 22:45:18 -->

<!-- Update 19: Refined at 2026-04-21 22:45:19 -->

<!-- Update 20: Refined at 2026-04-21 22:45:19 -->

<!-- Update 21: Refined at 2026-04-21 22:45:19 -->

<!-- Update 22: Refined at 2026-04-21 22:45:19 -->

<!-- Update 23: Refined at 2026-04-21 22:45:19 -->

<!-- Update 24: Refined at 2026-04-21 22:45:19 -->

<!-- Update 25: Refined at 2026-04-21 22:45:19 -->

<!-- Update 26: Refined at 2026-04-21 22:45:20 -->

<!-- Update 27: Refined at 2026-04-21 22:45:20 -->

<!-- Update 28: Refined at 2026-04-21 22:45:20 -->

<!-- Update 29: Refined at 2026-04-21 22:45:20 -->

<!-- Update 30: Refined at 2026-04-21 22:45:20 -->

<!-- Update 31: Refined at 2026-04-21 22:45:20 -->

<!-- Update 32: Refined at 2026-04-21 22:45:20 -->

<!-- Update 33: Refined at 2026-04-21 22:45:20 -->

<!-- Update 34: Refined at 2026-04-21 22:45:21 -->

<!-- Update 35: Refined at 2026-04-21 22:45:21 -->

<!-- Update 36: Refined at 2026-04-21 22:45:21 -->

<!-- Update 37: Refined at 2026-04-21 22:45:21 -->

<!-- Update 38: Refined at 2026-04-21 22:45:21 -->

<!-- Update 39: Refined at 2026-04-21 22:45:21 -->

<!-- Update 40: Refined at 2026-04-21 22:45:21 -->
