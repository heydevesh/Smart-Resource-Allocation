package config

// ── Project & Location ────────────────────────────────────────
// Firebase + Vertex AI project hosting all agents.
// Confirmed via: gcloud projects describe sahaay-18eb3
const Project  = "sahaay-18eb3"
const Location = "asia-south1"  // Confirmed via: gcloud firestore databases list

// ── Vertex AI Agent Resource IDs ─────────────────────────────
// How to fill these in:
//   1. Open Vertex AI console: https://console.cloud.google.com/vertex-ai/agents?project=sahaay-18eb3
//   2. Create 5 agents as described in AGENTS.md §3.2 (OrchestratorAgent, MatchAgent, SurgeAgent, NarratorAgent, QueryAgent)
//   3. For each agent, copy the resource name from the agent details page.
//      Format: projects/sahaay-18eb3/locations/asia-south1/agents/<AGENT_ID>
//
// Alternatively, create via REST (see AGENTS.md §3.2) and paste the returned `name` field below.

const OrchestratorAgentID = "projects/sahaay-18eb3/locations/asia-south1/agents/REPLACE_ORCHESTRATOR_AGENT_ID"
const MatchAgentID        = "projects/sahaay-18eb3/locations/asia-south1/agents/REPLACE_MATCH_AGENT_ID"
const SurgeAgentID        = "projects/sahaay-18eb3/locations/asia-south1/agents/REPLACE_SURGE_AGENT_ID"
const NarratorAgentID     = "projects/sahaay-18eb3/locations/asia-south1/agents/REPLACE_NARRATOR_AGENT_ID"
const QueryAgentID        = "projects/sahaay-18eb3/locations/asia-south1/agents/REPLACE_QUERY_AGENT_ID"
