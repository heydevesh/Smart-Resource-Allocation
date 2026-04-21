package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"sahaay/functions/config"

	aiplatform "cloud.google.com/go/aiplatform/apiv1beta1"
	"cloud.google.com/go/aiplatform/apiv1beta1/aiplatformpb"
)

// PredictSurge calls the SurgeAgent to forecast resource needs.
func PredictSurge(ctx context.Context, payload map[string]any, sessionID string) (any, error) {
	client, err := aiplatform.NewAgentClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create agent client: %v", err)
	}
	defer client.Close()

	payloadBytes, _ := json.Marshal(payload)
	
	resp, err := client.QueryAgent(ctx, &aiplatformpb.QueryAgentRequest{
		Name:    config.SurgeAgentID,
		Session: sessionID,
		Query:   string(payloadBytes),
	})
	if err != nil {
		return nil, fmt.Errorf("SurgeAgent query failed: %v", err)
	}

	return resp.GetOutput(), nil
}
