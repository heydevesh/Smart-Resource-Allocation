package agents

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	aiplatform "cloud.google.com/go/aiplatform/apiv1beta1"
	"cloud.google.com/go/aiplatform/apiv1beta1/aiplatformpb"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"google.golang.org/protobuf/types/known/structpb"
	"sahaay.io/functions/config"
	"sahaay.io/functions/middleware"
)

func init() {
	functions.HTTP("CallAgent", CallAgent)
	functions.HTTP("Health", Health)
}

func Health(w http.ResponseWriter, r *http.Request) {
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

func CallAgent(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	if !config.IsConfigured() {
		log.Printf("[ERROR] Vertex AI Agents not configured")
		http.Error(w, "Vertex AI Agents not configured", http.StatusPreconditionFailed)
		return
	}

	uid, err := middleware.VerifyIDToken(r)
	if err != nil {
		log.Printf("[AUTH] Failed to verify ID token: %v", err)
		http.Error(w, "Unauthenticated", http.StatusUnauthorized)
		return
	}

	var req AgentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[ERROR] Bad request body: %v", err)
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	log.Printf("[INFO] Agent Request: uid=%s intent=%s sessionId=%s", uid, req.Intent, req.SessionID)

	agentID := agentForIntent(req.Intent)
	ctx := context.Background()
	client, err := aiplatform.NewReasoningEngineExecutionClient(ctx)
	if err != nil {
		log.Printf("[ERROR] Failed to create Reasoning Engine client: %v", err)
		http.Error(w, "Internal AI service error", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	// Convert payload to structpb.Struct
	input := &structpb.Struct{
		Fields: make(map[string]*structpb.Value),
	}
	for k, v := range req.Payload {
		val, _ := structpb.NewValue(v)
		input.Fields[k] = val
	}

	resp, err := client.QueryReasoningEngine(ctx, &aiplatformpb.QueryReasoningEngineRequest{
		Name:  agentID,
		Input: input,
	})
	if err != nil {
		log.Printf("[ERROR] Agent query failed: intent=%s error=%v", req.Intent, err)
		http.Error(w, "AI Agent failure", http.StatusInternalServerError)
		return
	}

	latency := time.Since(start).String()
	log.Printf("[SUCCESS] Agent response received: intent=%s latency=%s", req.Intent, latency)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AgentResponse{
		Result:    resp.GetOutput(),
		AgentUsed: req.Intent,
		Latency:   latency,
	})
}

func agentForIntent(intent string) string {
	switch intent {
	case "MATCH_VOLUNTEERS":
		return config.MatchAgentID
	case "PREDICT_SURGE":
		return config.SurgeAgentID
	case "NARRATE_REPORT":
		return config.NarratorAgentID
	case "QUERY_ASSISTANT":
		return config.QueryAgentID
	default:
		return config.OrchestratorAgentID
	}
}