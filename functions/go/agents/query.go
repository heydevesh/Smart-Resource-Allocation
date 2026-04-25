package agents

import (
	"context"
	"sahaay.io/functions/config"
)

func QueryAssistant(ctx context.Context, payload map[string]any, sessionID string) (any, error) {
	return queryAgent(ctx, config.QueryAgentID, payload)
}
