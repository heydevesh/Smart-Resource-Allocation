package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"sahaay/functions/config"

	aiplatform "cloud.google.com/go/aiplatform/apiv1beta1"
	"cloud.google.com/go/aiplatform/apiv1beta1/aiplatformpb"
)

// QueryAssistant calls the QueryAgent for coordinator Q&A.
func QueryAssistant(ctx context.Context, payload map[string]any, sessionID string) (any, error) {
	client, err := aiplatform.NewAgentClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create agent client: %v", err)
	}
	defer client.Close()

	payloadBytes, _ := json.Marshal(payload)
	
	resp, err := client.QueryAgent(ctx, &aiplatformpb.QueryAgentRequest{
		Name:    config.QueryAgentID,
		Session: sessionID,
		Query:   string(payloadBytes),
	})
	if err != nil {
		return nil, fmt.Errorf("QueryAgent query failed: %v", err)
	}

	return resp.GetOutput(), nil
}
