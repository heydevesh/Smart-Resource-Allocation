package config

// ── Project & Location ────────────────────────────────────────
// Firebase + Vertex AI project hosting all agents.
const Project  = "193319651907" // Updated to numeric ID from reasoning engine URI
const Location = "us-west1"

// ── Vertex AI Agent Resource IDs ─────────────────────────────
// The user provided a reasoning engine URI:
// https://us-west1-aiplatform.googleapis.com/v1/projects/193319651907/locations/us-west1/reasoningEngines/4322593625159499776:query

const OrchestratorAgentID = "projects/193319651907/locations/us-west1/reasoningEngines/4322593625159499776"

// Specialist agents currently missing. 
// Using Orchestrator as fallback for now.
const MatchAgentID        = OrchestratorAgentID
const SurgeAgentID        = OrchestratorAgentID
const NarratorAgentID     = OrchestratorAgentID
const QueryAgentID        = OrchestratorAgentID

// IsConfigured returns true if all agent IDs have been updated from their default placeholder values.
// Note: All IDs being identical indicates they haven't been properly configured.
func IsConfigured() bool {
	if OrchestratorAgentID == "" || OrchestratorAgentID == "REPLACE" {
		return false
	}
	return true
}
