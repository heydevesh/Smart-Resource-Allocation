package tools

import (
	"context"
	"fmt"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
)

var fcmClient *messaging.Client

func init() {
	ctx := context.Background()
	app, err := firebase.NewApp(ctx, nil)
	if err != nil {
		fmt.Printf("Error initializing app: %v\n", err)
		return
	}
	client, err := app.Messaging(ctx)
	if err != nil {
		fmt.Printf("Error getting Messaging client: %v\n", err)
		return
	}
	fcmClient = client
}

// SendCriticalAlert sends a push notification for critical needs
func SendCriticalAlert(ctx context.Context, tokens []string, title string, body string) error {
	message := &messaging.MulticastMessage{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Tokens: tokens,
	}
	_, err := fcmClient.SendMulticast(ctx, message)
	return err
}
