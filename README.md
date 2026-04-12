# Sahaay 
---

## 📌 Project Context
**Challenge:** Google Solution Challenge 2026 (Topic 5: Smart Resource Allocation)
**Target Region:** India (Pilot in Mumbai)

India has over 3.3 million NGOs, but the vast majority still rely on paper surveys and fragmented communication (like WhatsApp groups) to track community needs and coordinate volunteers. This results in missing data, delayed response times for critical needs, and inadequate resource distribution.

This project solves this by digitizing the entire needs-assessment and volunteer-matching workflow. It turns scattered field data into instant, actionable intelligence through real-time geolocation mapping and Gemini AI-powered volunteer matching, dramatically reducing response times from hours to minutes.

## 🌟 Core Solution Pillars

1. **Needs Digitization:** Field workers report needs directly via the app or Google Forms, which feed into a centralized Firebase Firestore database.
2. **Intelligent Volunteer Matching:** Gemini AI analyzes task requirements, volunteer skills, proximity, workload, and availability to recommend the top responders.
3. **Real-Time Coordination Dashboard:** A live map and dashboard provide coordinators with a complete operational picture, tracking unaddressed needs, active volunteers, and critical hotspots.

## 🎯 Target Audience & Roles

* **NGO Admin (Coordinator):** Manages volunteers, creates/assigns tasks, views analytics, and oversees the entire operation.
* **Field Worker:** Submits on-ground community needs with geotags and updates task progress.
* **Volunteer:** Receives AI-assigned tasks based on match criteria, accepts tasks, and updates completion status.
* **Super Admin:** Multi-region manager viewing high-level analytics and donor reporting.

## 💻 Tech Stack

* **Frontend:** Flutter (Android, iOS, Web) with Material Design 3
* **Backend & Database:** Firebase (Firestore, Auth, Cloud Messaging, Storage, Cloud Functions)
* **AI & Machine Learning:** Gemini API (Smart Matching, Recommendations, Pattern Prediction)
* **Geolocation & Mapping:** Google Maps Platform (Interactive maps, needs heatmap, distance matrix)

## ✨ Key Features

* **Interactive Needs Map & Heatmap:** See all community needs on a live map with color-coded urgency pins and density heatmaps.
* **AI-Powered "Smart Match":** One-tap task assignment engine using the Gemini API to rank the best volunteers.
* **Offline Support:** Field workers can submit needs without internet connectivity.
* **Automated Escalation & Alerts:** Push notifications for critical unmet needs.
* **Insight & Analytics:** Real-time dashboards visualizing task completion rates, needs by category, and area reports.
* **Auto-generated Reports:** One-tap PDF export of impact summaries for donors and authorities.

## 💾 Database Schema Overview (Firestore)

* `/needs`: Details of reported community requirements (category, location, urgency, status).
* `/tasks`: Work items assigned to volunteers linked to specific needs.
* `/volunteers`: Registered community helpers with their skills, availability, and task history.
* `/users`: Role-based user accounts and metadata.

## 🚀 Prototype Build Plan (Getting Started)

1. **Environment Setup:** Clone the repository and configure the Flutter SDK.
2. **Firebase Initialization:** Create a Firebase project and enable Firestore, Auth (Email/Phone), Storage, and Cloud Functions.
3. **API Integrations:** 
   * Obtain a Gemini API Key.
   * Obtain a Google Maps API Key.
   * Set them securely in your environment variables/cloud functions.
4. **Deploy Cloud Functions:** Deploy the smart-matching webhook and forms integrations.
5. **Run the App:** Execute `flutter run` on an Android physical device to thoroughly test the offline persistence & location features.

## 🌍 SDG Alignment

* **SDG 1 (No Poverty):** Faster delivery of essential food and resources to communities.
* **SDG 3 (Good Health and Well-being):** Rapid response to critical medical needs through optimized assignment.
* **SDG 4 (Quality Education):** Fulfilling educational supply/tutor needs efficiently.
* **SDG 17 (Partnerships for Goals):** Providing a unified collaborative platform for NGOs, volunteers, and local agencies.
