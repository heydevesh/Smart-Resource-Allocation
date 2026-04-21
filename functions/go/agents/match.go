package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"sahaay/functions/config"
	"sahaay/functions/tools"

	aiplatform "cloud.google.com/go/aiplatform/apiv1beta1"
	"cloud.google.com/go/aiplatform/apiv1beta1/aiplatformpb"
)

// MatchVolunteers calls the MatchAgent to find the best volunteers for a task.
func MatchVolunteers(ctx context.Context, payload map[string]any, sessionID string) (any, error) {
	client, err := aiplatform.NewAgentClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create agent client: %v", err)
	}
	defer client.Close()

	payloadBytes, _ := json.Marshal(payload)
	
	resp, err := client.QueryAgent(ctx, &aiplatformpb.QueryAgentRequest{
		Name:    config.MatchAgentID,
		Session: sessionID,
		Query:   string(payloadBytes),
	})
	if err != nil {
		return nil, fmt.Errorf("MatchAgent query failed: %v", err)
	}

	return resp.GetOutput(), nil
}

// InternalMatchLogic provides a fallback or pre-processing matching logic using Firestore.
func InternalMatchLogic(ctx context.Context, taskID string) ([]map[string]any, error) {
	// 1. Get Task details
	task, err := tools.GetTask(ctx, taskID)
	if err != nil {
		return nil, err
	}

	// 2. Search for volunteers with matching skills and proximity
	volunteers, err := tools.SearchVolunteers(ctx, task["category"].(string), task["locationLat"].(float64), task["locationLng"].(float64), 10.0)
	if err != nil {
		return nil, err
	}

	return volunteers, nil
}
