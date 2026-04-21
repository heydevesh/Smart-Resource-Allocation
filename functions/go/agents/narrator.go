package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"sahaay/functions/config"

	aiplatform "cloud.google.com/go/aiplatform/apiv1beta1"
	"cloud.google.com/go/aiplatform/apiv1beta1/aiplatformpb"
)

// NarrateReport calls the NarratorAgent to create human-centered donor reports.
func NarrateReport(ctx context.Context, payload map[string]any, sessionID string) (any, error) {
	client, err := aiplatform.NewAgentClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create agent client: %v", err)
	}
	defer client.Close()

	payloadBytes, _ := json.Marshal(payload)
	
	resp, err := client.QueryAgent(ctx, &aiplatformpb.QueryAgentRequest{
		Name:    config.NarratorAgentID,
		Session: sessionID,
		Query:   string(payloadBytes),
	})
	if err != nil {
		return nil, fmt.Errorf("NarratorAgent query failed: %v", err)
	}

	return resp.GetOutput(), nil
}
