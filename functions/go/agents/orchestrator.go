package agents

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	aiplatform "cloud.google.com/go/aiplatform/apiv1beta1"
	"cloud.google.com/go/aiplatform/apiv1beta1/aiplatformpb"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"google.golang.org/api/option"
	"google.golang.org/protobuf/types/known/structpb"
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
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Max-Age", "3600")

	requestedHeaders := r.Header.Get("Access-Control-Request-Headers")
	if strings.TrimSpace(requestedHeaders) != "" {
		w.Header().Set("Access-Control-Allow-Headers", requestedHeaders)
	} else {
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Firebase-AppCheck, Firebase-Instance-ID-Token, X-Requested-With")
	}

	w.Header().Set("Vary", "Origin")
	w.Header().Add("Vary", "Access-Control-Request-Method")
	w.Header().Add("Vary", "Access-Control-Request-Headers")
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
		log.Printf("[ERROR] Failed reading request body: %v", err)
		writeJSONError(w, http.StatusBadRequest, "Bad request")
		return
	}

	req, err := decodeAgentRequest(body)
	if err != nil {
		log.Printf("[ERROR] Bad request body: %v", err)
		writeJSONError(w, http.StatusBadRequest, "Bad request")
		return
	}

	log.Printf("[INFO] Agent Request: uid=%s intent=%s sessionId=%s", uid, req.Intent, req.SessionID)

	agentID := agentForIntent(req.Intent)
	ctx := context.Background()
	
	// Vertex AI Reasoning Engine Execution Client (matches the resource ID provided)
	// regional endpoint is mandatory for us-west1
	endpoint := config.Location + "-aiplatform.googleapis.com:443"
	client, err := aiplatform.NewReasoningEngineExecutionClient(ctx, option.WithEndpoint(endpoint))
	if err != nil {
		log.Printf("[ERROR] Failed to create Reasoning Engine client: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Internal AI service error")
		return
	}
	defer client.Close()

	// Construct the input for the Reasoning Engine
	// Reasoning Engines typically expect the input parameters wrapped in an "input" key
	// or as a direct set of parameters depending on how the template was instantiated.
	// For multi-agent orchestrators, we pass the intent and payload.
	inputMap := map[string]any{
		"input": map[string]any{
			"intent":  req.Intent,
			"payload": req.Payload,
		},
	}
	input, _ := structpb.NewStruct(inputMap)

	resp, err := client.QueryReasoningEngine(ctx, &aiplatformpb.QueryReasoningEngineRequest{
		Name:  agentID,
		Input: input,
	})

	if err != nil {
		log.Printf("[ERROR] Agent query failed: intent=%s error=%v", req.Intent, err)

		// Specific fallback for NARRATE_REPORT
		if req.Intent == "NARRATE_REPORT" && (strings.Contains(err.Error(), "InvalidArgument") || strings.Contains(err.Error(), "NotFound")) {
			latency := time.Since(start).String()
			log.Printf("[WARN] Narrator agent failed, serving fallback narrative")

			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(AgentResponse{
				Result: map[string]any{
					"headline":  "Sahaay Weekly Operations Snapshot",
					"narrative": "Field teams are actively coordinating open needs across Mumbai clusters while volunteer mobilization remains steady. The dashboard remains operational and ready for incident triage, assignment, and follow-up reporting.",
					"keyStats":  []string{"Using fallback narrative due to agent service unavailability"},
				},
				AgentUsed: req.Intent,
				Latency:   latency,
			})
			return
		}

		writeJSONError(w, http.StatusInternalServerError, "AI Agent failure: "+err.Error())
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
