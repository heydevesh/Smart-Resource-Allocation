package agents

import (
	"context"
	"fmt"
	"sahaay.io/functions/config"
	"sahaay.io/functions/tools"

	aiplatform "cloud.google.com/go/aiplatform/apiv1beta1"
	"cloud.google.com/go/aiplatform/apiv1beta1/aiplatformpb"
	"google.golang.org/protobuf/types/known/structpb"
)

var (
	reasoningClient     *aiplatform.ReasoningEngineExecutionClient
	reasoningClientInit bool
)

func getReasoningClient(ctx context.Context) (*aiplatform.ReasoningEngineExecutionClient, error) {
	if reasoningClientInit {
		return reasoningClient, nil
	}
	client, err := aiplatform.NewReasoningEngineExecutionClient(ctx)
	if err != nil {
		return nil, err
	}
	reasoningClient = client
	reasoningClientInit = true
	return client, nil
}

func queryAgent(ctx context.Context, agentID string, payload map[string]any) (any, error) {
	client, err := getReasoningClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create reasoning engine client: %v", err)
	}

	input := &structpb.Struct{Fields: make(map[string]*structpb.Value)}
	for k, v := range payload {
		val, _ := structpb.NewValue(v)
		input.Fields[k] = val
	}

	resp, err := client.QueryReasoningEngine(ctx, &aiplatformpb.QueryReasoningEngineRequest{
		Name:  agentID,
		Input: input,
	})
	if err != nil {
		return nil, fmt.Errorf("agent %s query failed: %v", agentID, err)
	}

	return resp.GetOutput(), nil
}

func MatchVolunteers(ctx context.Context, payload map[string]any, sessionID string) (any, error) {
	return queryAgent(ctx, config.MatchAgentID, payload)
}

func InternalMatchLogic(ctx context.Context, taskID string) ([]map[string]any, error) {
	task, err := tools.GetTask(ctx, taskID)
	if err != nil {
		return nil, err
	}
	return tools.SearchVolunteers(ctx, task["category"].(string), task["locationLat"].(float64), task["locationLng"].(float64), 10.0)
}
