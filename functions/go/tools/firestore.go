package tools

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"sahaay/functions/config"
)

var firestoreClient *firestore.Client

func init() {
	ctx := context.Background()
	client, err := firestore.NewClient(ctx, config.Project)
	if err != nil {
		fmt.Printf("Failed to create firestore client: %v\n", err)
		return
	}
	firestoreClient = client
}

// GetNeedsByCategory fetches open needs from Firestore filtered by category
func GetNeedsByCategory(ctx context.Context, category string) ([]map[string]any, error) {
	iter := firestoreClient.Collection("needs").
		Where("status", "==", "open").
		Where("category", "==", category).
		Documents(ctx)
	
	var needs []map[string]any
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		needs = append(needs, doc.Data())
	}
	return needs, nil
}

// UpdateTaskStatus updates a task's status and progress
func UpdateTaskStatus(ctx context.Context, taskID string, status string, progress int) error {
	_, err := firestoreClient.Collection("tasks").Doc(taskID).Update(ctx, []firestore.Update{
		{Path: "status", Value: status},
		{Path: "progress", Value: progress},
	})
	return err
}
