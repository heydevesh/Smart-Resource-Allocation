package agents

import (
	"context"
	"sahaay.io/functions/config"
)

func PredictSurge(ctx context.Context, payload map[string]any, sessionID string) (any, error) {
	return queryAgent(ctx, config.SurgeAgentID, payload)
}
