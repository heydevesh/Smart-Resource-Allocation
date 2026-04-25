package agents

import (
	"context"
	"sahaay.io/functions/config"
)

func NarrateReport(ctx context.Context, payload map[string]any, sessionID string) (any, error) {
	return queryAgent(ctx, config.NarratorAgentID, payload)
}
