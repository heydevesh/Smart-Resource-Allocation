package config

// ── Project & Location ────────────────────────────────────────
// Firebase + Vertex AI project hosting all agents.
// Confirmed via: gcloud projects describe sahaay-18eb3
const Project  = "sahaay-18eb3"
const Location = "us-west1"  // Confirmed via: gcloud firestore databases list

// ── Vertex AI Agent Resource IDs ─────────────────────────────
// How to fill these in:
//   1. Open Vertex AI console: https://console.cloud.google.com/vertex-ai/agents?project=sahaay-18eb3
//   2. Create 5 agents as described in AGENTS.md §3.2 (OrchestratorAgent, MatchAgent, SurgeAgent, NarratorAgent, QueryAgent)
//   3. For each agent, copy the resource name from the agent details page.
//      Format: projects/sahaay-18eb3/locations/us-west1/agents/<AGENT_ID>
//
// Alternatively, create via REST (see AGENTS.md §3.2) and paste the returned `name` field below.

// TODO: Replace with actual unique agent IDs from Vertex AI console
const OrchestratorAgentID = "projects/sahaay-18eb3/locations/us-west1/agents/agent_1776845357201"
const MatchAgentID        = "projects/sahaay-18eb3/locations/us-west1/agents/agent_1776845357202"
const SurgeAgentID        = "projects/sahaay-18eb3/locations/us-west1/agents/agent_1776845357203"
const NarratorAgentID     = "projects/sahaay-18eb3/locations/us-west1/agents/agent_1776845357204"
const QueryAgentID        = "projects/sahaay-18eb3/locations/us-west1/agents/agent_1776845357205"

// IsConfigured returns true if all agent IDs have been updated from their default placeholder values.
// Note: All IDs being identical indicates they haven't been properly configured.
func IsConfigured() bool {
	if OrchestratorAgentID == "REPLACE" || MatchAgentID == "REPLACE" ||
	   SurgeAgentID == "REPLACE" || NarratorAgentID == "REPLACE" || QueryAgentID == "REPLACE" {
		return false
	}
	// Check that not all IDs are identical (common misconfiguration)
	if OrchestratorAgentID == MatchAgentID && MatchAgentID == SurgeAgentID &&
	   SurgeAgentID == NarratorAgentID && NarratorAgentID == QueryAgentID {
		return false
	}
	return true
}
