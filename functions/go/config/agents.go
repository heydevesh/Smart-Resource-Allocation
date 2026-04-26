package config
// Project B: AI + Functions
const Project = "193319651907"
// Project A: Auth + Firestore + Storage
const DataProject = "sahaay-18eb3"
// Location for Cloud Functions and Vertex AI Agent Engine
const Location = "us-west1"
// GeminiProject is the GCP project where Gemini publisher models are accessible.
// This is the main Firebase project where ToS was accepted via Agent Studio.
const GeminiProject = "sahaay-493113"
// GeminiLocation is where Gemini publisher models are available.
// us-central1 is the primary region for Gemini publisher models in Vertex AI.
const GeminiLocation = "us-central1"
// GeminiModel is the Vertex AI publisher model ID for Gemini.
// Use "gemini-2.0-flash" (no version suffix) for the latest stable flash model.
const GeminiModel = "gemini-2.0-flash"
const OrchestratorAgentID = "projects/193319651907/locations/us-west1/reasoningEngines/4322593625159499776"
// Using Orchestrator as fallback for now.
const MatchAgentID        = OrchestratorAgentID
const SurgeAgentID        = OrchestratorAgentID
const NarratorAgentID     = OrchestratorAgentID
const QueryAgentID        = OrchestratorAgentID

func IsConfigured() bool {
	if OrchestratorAgentID == "" || OrchestratorAgentID == "REPLACE" {
		return false
	}
	return true
}
