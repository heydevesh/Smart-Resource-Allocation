package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"google.golang.org/genai"
	"sahaay.io/functions/config"
	"sahaay.io/functions/middleware"
)

func init() {
	functions.HTTP("CallAgent", CallAgent)
	functions.HTTP("Health", Health)
}

func Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"status":     "operational",
		"configured": config.IsConfigured(),
		"timestamp":  time.Now().Format(time.RFC3339),
	})
}

type AgentRequest struct {
	Intent    string         `json:"intent"`
	Payload   map[string]any `json:"payload"`
	SessionID string         `json:"sessionId"`
	Region    string         `json:"region"`
}

type AgentResponse struct {
	Result    any    `json:"result"`
	AgentUsed string `json:"agentUsed"`
	Latency   string `json:"latency"`
}

type callableRequestEnvelope struct {
	Data json.RawMessage `json:"data"`
}

type errorResponse struct {
	Error string `json:"error"`
}

func fallbackResultForIntent(intent string) any {
	switch intent {
	case "MATCH_VOLUNTEERS":
		return []map[string]any{}
	case "PREDICT_SURGE":
		return []map[string]any{}
	case "NARRATE_REPORT":
		return map[string]any{
			"headline":  "Sahaay Weekly Operations Snapshot",
			"narrative": "Field teams are actively coordinating open needs across Mumbai clusters while volunteer mobilization remains steady. The dashboard remains operational and ready for incident triage, assignment, and follow-up reporting.",
			"keyStats":  []string{"Using fallback narrative due to agent service unavailability"},
		}
	case "QUERY_ASSISTANT":
		return map[string]any{
			"answer": "AI assistant is temporarily unavailable. Please retry in a few moments.",
		}
	default:
		return map[string]any{
			"message": "AI service is temporarily unavailable",
		}
	}
}

func writeJSONError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(errorResponse{Error: msg})
}

func setCORSHeaders(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if origin == "" {
		origin = "*"
	}
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Max-Age", "3600")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Firebase-Client, X-Firebase-GMPID, Firebase-Instance-ID-Token, X-Requested-With")

	if origin != "*" {
		w.Header().Set("Access-Control-Allow-Credentials", "true")
	}

	w.Header().Set("Vary", "Origin, Access-Control-Request-Headers")
}

func decodeAgentRequest(body []byte) (AgentRequest, error) {
	var req AgentRequest
	if err := json.Unmarshal(body, &req); err == nil && req.Intent != "" {
		return req, nil
	}
	var envelope callableRequestEnvelope
	if err := json.Unmarshal(body, &envelope); err != nil {
		return AgentRequest{}, err
	}
	if len(envelope.Data) == 0 {
		return AgentRequest{}, io.EOF
	}
	if err := json.Unmarshal(envelope.Data, &req); err != nil {
		return AgentRequest{}, err
	}
	if strings.TrimSpace(req.Intent) == "" {
		return AgentRequest{}, io.EOF
	}
	return req, nil
}

func getSystemPromptForIntent(intent string) string {
	switch intent {
	case "MATCH_VOLUNTEERS":
		return `You are a volunteer matching specialist for NGOs in Mumbai, India.
Input will be a JSON object with task and volunteers.
Return JSON array of top 3 matches:
[{ "volunteerId": string, "reason": string, "confidenceScore": number (0.0-1.0), "estimatedArrival": string, "skillMatchTags": array of string }]
Weights: skill match 40%, proximity 30%, availability 20%, rating 10%.
Use 30 km/h for estimatedArrival. Be specific — name the volunteer, distance, matching skill.`
	case "PREDICT_SURGE":
		return `You are a needs surge prediction specialist for Mumbai NGOs.
Input will be a JSON object with region and historicalNeeds.
Analyse last 8 weeks. Return JSON array:
[{ "category": string, "predictedCount": number, "confidence": number, "week": string, "reasoning": string }]
Categories: food, medical, education, shelter, water, other.
Factor in monsoon (June–September) and historical spikes.`
	case "NARRATE_REPORT":
		return `You are a donor report writer for Sahaay NGO platform.
Input will be a JSON object with stats.
Write 2-3 paragraphs of human-centred donor narrative.
Mention real numbers, locations (Dharavi, Kurla, Govandi), concrete impact.
Return JSON: { "narrative": string, "headline": string, "keyStats": array of string }
No jargon. Write for a Mumbai CSR team.`
	case "QUERY_ASSISTANT":
		return `You are the Sahaay coordinator assistant.
Input will be a JSON object with question and context.
Return concise plain-English answer in JSON: { "answer": string }`
	default:
		return `You are the Sahaay NGO coordination AI.
Input: JSON with fields intent (string) and payload (object).
Delegate to the correct specialist based on intent:
  MATCH_VOLUNTEERS  → MatchAgent
  PREDICT_SURGE     → SurgeAgent
  NARRATE_REPORT    → NarratorAgent
  QUERY_ASSISTANT   → QueryAgent
Return the specialist response unchanged. Always respond in JSON.`
	}
}

func CallAgent(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w, r)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	start := time.Now()

	if !config.IsConfigured() {
		log.Printf("[ERROR] Vertex AI Agents not configured")
		writeJSONError(w, http.StatusPreconditionFailed, "Vertex AI Agents not configured")
		return
	}

	uid, err := middleware.VerifyIDToken(r)
	if err != nil {
		log.Printf("[AUTH] Failed to verify ID token: %v", err)
		writeJSONError(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "Bad request")
		return
	}

	req, err := decodeAgentRequest(body)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "Bad request")
		return
	}

	log.Printf("[INFO] Agent Request: uid=%s intent=%s sessionId=%s", uid, req.Intent, req.SessionID)

	ctx := context.Background()

	// Use the new Google Gen AI SDK (google.golang.org/genai) with Vertex AI backend.
	// Replaces the deprecated cloud.google.com/go/vertexai/genai package.
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		Project:  config.GeminiProject,
		Location: config.GeminiLocation,
		Backend:  genai.BackendVertexAI,
	})
	if err != nil {
		log.Printf("[ERROR] Failed to init genai client: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Internal AI service error")
		return
	}

	payloadBytes, _ := json.Marshal(req.Payload)
	prompt := fmt.Sprintf("Process this payload:\n%s", string(payloadBytes))

	contents := []*genai.Content{
		{
			Parts: []*genai.Part{genai.NewPartFromText(prompt)},
			Role:  "user",
		},
	}

	genCfg := &genai.GenerateContentConfig{
		SystemInstruction: &genai.Content{
			Parts: []*genai.Part{genai.NewPartFromText(getSystemPromptForIntent(req.Intent))},
		},
		ResponseMIMEType: "application/json",
	}

	resp, err := client.Models.GenerateContent(ctx, config.GeminiModel, contents, genCfg)
	if err != nil || resp == nil {
		log.Printf("[ERROR] Agent query failed: intent=%s error=%v", req.Intent, err)
		latency := time.Since(start).String()
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(AgentResponse{
			Result:    fallbackResultForIntent(req.Intent),
			AgentUsed: req.Intent,
			Latency:   latency,
		})
		return
	}

	responseText := resp.Text()

	var jsonResult any
	if err := json.Unmarshal([]byte(responseText), &jsonResult); err != nil {
		log.Printf("[ERROR] Failed to parse JSON from AI (raw=%s): %v", responseText, err)
		latency := time.Since(start).String()
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(AgentResponse{
			Result:    fallbackResultForIntent(req.Intent),
			AgentUsed: req.Intent,
			Latency:   latency,
		})
		return
	}

	latency := time.Since(start).String()
	log.Printf("[SUCCESS] Agent response received: intent=%s latency=%s", req.Intent, latency)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AgentResponse{
		Result:    jsonResult,
		AgentUsed: req.Intent,
		Latency:   latency,
	})
}
