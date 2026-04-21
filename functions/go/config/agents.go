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

const OrchestratorAgentID = "projects/sahaay-18eb3/locations/asia-south1/agents/651234567890" // REPLACE: gcloud ai agents list
const MatchAgentID        = "projects/sahaay-18eb3/locations/asia-south1/agents/651234567891" // REPLACE: gcloud ai agents list
const SurgeAgentID        = "projects/sahaay-18eb3/locations/asia-south1/agents/651234567892" // REPLACE: gcloud ai agents list
const NarratorAgentID     = "projects/sahaay-18eb3/locations/asia-south1/agents/651234567893" // REPLACE: gcloud ai agents list
const QueryAgentID        = "projects/sahaay-18eb3/locations/asia-south1/agents/651234567894" // REPLACE: gcloud ai agents list

// IsConfigured returns true if all agent IDs have been updated from their default REPLACE placeholders.
func IsConfigured() bool {
	return OrchestratorAgentID != "REPLACE" && 
	       MatchAgentID != "REPLACE" && 
		   SurgeAgentID != "REPLACE" && 
		   NarratorAgentID != "REPLACE" && 
		   QueryAgentID != "REPLACE"
}
