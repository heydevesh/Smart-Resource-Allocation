# Sahaay (सहाय) — Smart Humanitarian Resource Allocation Platform

[![Angular 18](https://img.shields.io/badge/Angular-18.2-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.dev/)
[![Go 1.22](https://img.shields.io/badge/Go-1.22-00ADD8?style=flat&logo=go&logoColor=white)](https://go.dev/)
[![Vertex AI](https://img.shields.io/badge/Vertex%20AI-Gemini%202.0%20Flash-4285F4?style=flat&logo=googlecloud&logoColor=white)](https://cloud.google.com/vertex-ai)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat&logo=clerk&logoColor=white)](https://clerk.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Storage%20%7C%20FCM-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Maps](https://img.shields.io/badge/Maps-Google%20Maps%20JS-34A853?style=flat&logo=googlemaps&logoColor=white)](https://developers.google.com/maps)

Sahaay is a mobile-first, offline-capable progressive web platform designed for rapid disaster response and grassroots humanitarian coordination across Mumbai's highest-density urban areas (Dharavi, Kurla, Govandi, Bhandup).

Powered by **Vertex AI multi-agent reasoning**, **Google Vision AI identity verification**, **Clerk authentication**, and **Firebase real-time sync**, Sahaay bridges the gap between ground field workers, volunteer task forces, NGO administrators, and institutional donors.

---

## 🎯 The Core Problem & Solution

* **The Problem:** Grassroots NGOs and disaster responders rely on fragmented WhatsApp threads and manual logbooks. Volunteer allocation is reactive, urgent crisis needs get buried, and relief verification lacks accountability.
* **The Solution:** A unified operational intelligence dashboard:
  1. **Real-time Crisis Map:** Interactive geospatial heatmaps, live need pins, and proximity triage.
  2. **Vertex AI Multi-Agent Matching:** Intelligent routing predicting demand surges and auto-matching volunteers based on skills, location, and availability.
  3. **Aadhaar KYC & Face Matching:** Cloud-backed identity verification for tamper-proof volunteer and NGO onboarding.
  4. **Seamless Identity Bridge:** Clerk session authentication bridged to Firebase custom tokens for fine-grained Firestore security rules.
  5. **Offline-First Resilience:** Full PWA service worker support with IndexedDB local cache for low-connectivity disaster zones.

---

## 🏗 System Architecture

Sahaay implements a **Federated Multi-Agent Architecture** where sensitive logic (AI reasoning, biometric matching, KYC OCR, token minting) is isolated in security-hardened **Go Cloud Functions**.

```mermaid
flowchart TD
    subgraph Client["Angular 18 PWA (Client)"]
        UI["Command Center / Crisis Map / Task Force"]
        Auth["Clerk SDK (Session JWT)"]
        FS["Firestore SDK (IndexedDB Offline Cache)"]
    end

    subgraph AuthBridge["Authentication & Token Bridge"]
        Clerk["Clerk Identity Provider"]
        Exchange["ExchangeFirebaseToken (Go Function)"]
        FbAuth["Firebase Auth (Custom Token Minting)"]
    end

    subgraph Backend["Go Cloud Functions"]
        Middleware["Auth Middleware (JWKS RS256 Verification)"]
        CallAgent["CallAgent Handler"]
        KYC["VerifyKYC & OcrAadhaar"]
        Face["DetectFace Matching"]
    end

    subgraph AI["Vertex AI & Google Cloud"]
        Orchestrator["Orchestrator Agent"]
        MatchAgent["MatchAgent (Volunteer Match)"]
        SurgeAgent["SurgeAgent (Demand Forecasting)"]
        NarratorAgent["NarratorAgent (CSR Reports)"]
        QueryAgent["QueryAgent (Coordinator Q&A)"]
        VisionAI["Google Vision AI (OCR & Face)"]
    end

    subgraph Data["Firebase & Cloud Storage"]
        Firestore["Cloud Firestore (Real-Time DB)"]
        Storage["Cloud Storage (Media & PDFs)"]
        FCM["Firebase Cloud Messaging (Urgent Alerts)"]
    end

    Auth -->|1. Authenticate| Clerk
    Auth -->|2. Clerk JWT| Exchange
    Exchange -->|3. Verify JWT & Mint| FbAuth
    FbAuth -->|4. Custom Token| FS
    FS -->|5. Authenticated Rules (request.auth.uid)| Firestore

    UI -->|Bearer Clerk JWT| Middleware
    Middleware --> CallAgent
    Middleware --> KYC
    Middleware --> Face

    CallAgent --> Orchestrator
    Orchestrator --> MatchAgent
    Orchestrator --> SurgeAgent
    Orchestrator --> NarratorAgent
    Orchestrator --> QueryAgent

    KYC --> VisionAI
    Face --> VisionAI
```

---

## 🛠 Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Angular 18 | Signals, Standalone Components, Material 3, PWA Service Worker |
| **Authentication** | Clerk (`@clerk/clerk-js`) | Session management, MFA, prebuilt embedded UI, user button |
| **Identity Bridge** | Go `auth.Client` | Bridges Clerk session JWTs into Firebase custom tokens (`uid == clerkId`) |
| **Backend Functions** | Go 1.22 (Cloud Functions) | Fast, memory-efficient microservices |
| **AI Multi-Agent Graph** | Vertex AI + Gemini 2.0 Flash | Specialist agents for matching, surge forecasting, reporting, and Q&A |
| **Identity Verification** | Google Vision AI | Automated Aadhaar OCR extraction and facial landmark matching |
| **Database & Realtime** | Cloud Firestore | Real-time subscriptions, offline persistence, and compound queries |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Priority broadcasts for critical unassigned emergency needs |
| **Mapping & GIS** | Google Maps JS API | Heatmap layer, custom marker clustering, and radius filtering |

---

## 🤖 Vertex AI Multi-Agent Specialist Graph

All AI intents route through the Go `CallAgent` endpoint with typed JSON payloads and structured responses:

| Agent | Intent | Core Responsibility |
| :--- | :--- | :--- |
| **OrchestratorAgent** | Intent Router | Dispatches coordination payloads to specialized agents |
| **MatchAgent** | `MATCH_VOLUNTEERS` | Scores volunteers (Skill 40%, Proximity 30%, Availability 20%, Rating 10%) |
| **SurgeAgent** | `PREDICT_SURGE` | 8-week historical trend analysis with seasonal monsoon spike weighting |
| **NarratorAgent** | `NARRATE_REPORT` | Translates raw disaster response metrics into human-centred CSR impact reports |
| **QueryAgent** | `QUERY_ASSISTANT` | Natural language operational Q&A on active emergency tickets |

---

## 📁 Repository Structure

```
Smart-Resource-Allocation/
├── src/
│   ├── app/
│   │   ├── auth/                    # Clerk login and profile registration flows
│   │   ├── app-shell/               # Main layout, sidebar navigation, Clerk UserButton
│   │   ├── core/
│   │   │   ├── ai/                  # AgentService & Zod response schemas
│   │   │   ├── auth/                # AuthService (Clerk + Firebase bridge & guards)
│   │   │   ├── firebase/            # HttpCallService, Firestore, FCM, Storage
│   │   │   ├── ngo/                 # NGO registry & onboarding logic
│   │   │   └── verification/        # Aadhaar OCR & Face match client service
│   │   ├── features/
│   │   │   ├── home/                # Real-time command center dashboard
│   │   │   ├── needs-map/           # Interactive crisis map & heatmap
│   │   │   ├── tasks/               # Task Force CRUD lifecycle & assignments
│   │   │   ├── volunteers/          # Volunteer roster & smart match modal
│   │   │   ├── resource-vault/      # Inventory & document management
│   │   │   ├── ngo-registry/        # Verified NGO directory
│   │   │   └── insights/            # Operational analytics & surge forecast
│   │   └── shared/                  # Reusable UI cards, badges, dialogs, pipes
│   └── environments/                # Environment configs (Clerk, Firebase, GCP)
├── functions/go/
│   ├── agents/                      # Orchestrator & GenAI Vertex integration
│   ├── config/                      # Agent IDs, GCP project configs & Clerk URLs
│   ├── middleware/                  # Clerk JWKS token validation & token exchange
│   ├── verification/                # Aadhaar OCR (Vision AI) & Face matching
│   └── function.go                  # HTTP Cloud Function entry points
├── angular.json                     # Angular build & bundle configuration
├── firestore.rules                  # Firestore security rules based on auth.uid
├── package.json                     # Frontend dependencies
└── AGENTS.md                        # Master development rules & AI specifications
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js `^18.19.1 || ^20.11.1 || >=22.0.0` & npm
* Go `1.22+`
* Firebase Project & Clerk account

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm start
# App serves at http://localhost:4200
```

### 2. Go Backend Setup & Tests

```bash
cd functions/go

# Run unit tests across all packages
go test ./...

# Build functions locally
go build ./...
```

### 3. Production Build

```bash
npm run build
# Production artifacts generated in dist/sahaay
```

---

## 🔐 Security Model & RBAC

1. **Identity & Authentication:** Handled via Clerk with phone/email OTP and session JWTs verified via cryptographic JWKS (`RS256`).
2. **Firebase Rules Bridge:** `ExchangeFirebaseToken` generates a Firebase custom token matching the Clerk `sub` UID. All Firestore rules validate against `request.auth.uid`.
3. **Role-Based Access Control (RBAC):**
   * **Field Worker:** Submit emergency needs, update task progress, offline sync.
   * **Volunteer:** View assignments, accept/decline tasks, mark fulfillment.
   * **NGO Admin:** Full operational dashboard, task creation, volunteer management.
   * **NGO Founder:** Organization setup, NGO registry management, admin controls.
   * **Super Admin:** Cross-region dashboard, disaster analytics, donor impact exports.

---

## 📖 Key Documentation

* [AGENTS.md](./AGENTS.md) — Master AI specification, absolute coding rules, and agent definitions.
* [DESIGN.md](./DESIGN.md) — Design tokens, color system, typography, and Material 3 components.

---

© 2026 Sahaay Platform. Built for Mumbai disaster & humanitarian resilience.
