package agents

import (
	"context"
	"fmt"
	"sahaay.io/functions/config"

	aiplatform "cloud.google.com/go/aiplatform/apiv1beta1"
	"cloud.google.com/go/aiplatform/apiv1beta1/aiplatformpb"
	"google.golang.org/protobuf/types/known/structpb"
)

// QueryAssistant calls the QueryAgent for coordinator Q&A.
func QueryAssistant(ctx context.Context, payload map[string]any, sessionID string) (any, error) {
	client, err := aiplatform.NewReasoningEngineExecutionClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create reasoning engine client: %v", err)
	}
	defer client.Close()

	// Convert payload to structpb.Struct
	input := &structpb.Struct{
		Fields: make(map[string]*structpb.Value),
	}
	for k, v := range payload {
		val, _ := structpb.NewValue(v)
		input.Fields[k] = val
	}
	
	resp, err := client.QueryReasoningEngine(ctx, &aiplatformpb.QueryReasoningEngineRequest{
		Name:  config.QueryAgentID,
		Input: input,
	})
	if err != nil {
		return nil, fmt.Errorf("QueryAgent query failed: %v", err)
	}

	return resp.GetOutput(), nil
}
