package config

// Project B: AI + Functions
const Project = "sahaay-493113"

// Project A: Auth + Firestore + Storage
const DataProject = "sahaay-18eb3"

// Location for Cloud Functions and Vertex AI Agent Engine
const Location = "us-west1"

// GeminiLocation is where Gemini publisher models (gemini-2.0-flash etc.) are available.
// NOTE: gemini-2.0-flash-001 is NOT available in us-west1 — must use us-central1.
const GeminiLocation = "us-central1"

// GeminiModel is the Vertex AI publisher model ID for Gemini 2.0 Flash.
const GeminiModel = "gemini-2.0-flash-001"


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
