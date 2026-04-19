package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	dialogflow "cloud.google.com/go/dialogflow/cx/apiv3"
	"cloud.google.com/go/dialogflow/cx/apiv3/cxpb"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"sahaay/functions/config"
	"sahaay/functions/middleware"
)

func init() {
	functions.HTTP("CallAgent", CallAgent)
}

type AgentRequest struct {
	Intent    string         `json:"intent"`
	Payload   map[string]any `json:"payload"`
	SessionID string         `json:"sessionId"`
}

type AgentResponse struct {
	Result    any    `json:"result"`
	AgentUsed string `json:"agentUsed"`
}

func CallAgent(w http.ResponseWriter, r *http.Request) {
	uid, err := middleware.VerifyIDToken(r)
	if err != nil {
		http.Error(w, "Unauthenticated", http.StatusUnauthorized)
		return
	}
	_ = uid

	var req AgentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	agentID := agentForIntent(req.Intent)

	ctx := context.Background()
	client, err := dialogflow.NewSessionsClient(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer client.Close()

	payloadBytes, _ := json.Marshal(req.Payload)
	
	// Create session path
	sessionPath := fmt.Sprintf("%s/sessions/%s", agentID, req.SessionID)

	resp, err := client.DetectIntent(ctx, &cxpb.DetectIntentRequest{
		Session: sessionPath,
		QueryInput: &cxpb.QueryInput{
			Input: &cxpb.QueryInput_Text{
				Text: &cxpb.TextInput{
					Text: string(payloadBytes),
				},
			},
		},
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var result any
	if resp.GetQueryResult() != nil && len(resp.GetQueryResult().GetResponseMessages()) > 0 {
		for _, msg := range resp.GetQueryResult().GetResponseMessages() {
			if textMsg := msg.GetText(); textMsg != nil && len(textMsg.GetText()) > 0 {
				responseStr := textMsg.GetText()[0]
				
				// Try to unmarshal the response into JSON if possible, otherwise use as string
				var jsonResult any
				if err := json.Unmarshal([]byte(responseStr), &jsonResult); err == nil {
					result = jsonResult
				} else {
					result = responseStr
				}
				break
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AgentResponse{
		Result:    result,
		AgentUsed: req.Intent,
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
