package middleware

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"sahaay.io/functions/config"
)

var authClient *auth.Client

func init() {
	ctx := context.Background()
	app, err := firebase.NewApp(ctx, &firebase.Config{ProjectID: config.DataProject})
	if err != nil {
		log.Printf("[AUTH] Failed to initialize Firebase app (Data Project): %v", err)
		return
	}

	authClient, err = app.Auth(ctx)
	if err != nil {
		log.Printf("[AUTH] Failed to initialize Firebase auth client: %v", err)
	}
}

func VerifyIDToken(r *http.Request) (string, error) {
	if authClient == nil {
		return "", fmt.Errorf("auth client not initialized")
	}

	header := r.Header.Get("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return "", fmt.Errorf("missing Bearer token")
	}
	token, err := authClient.VerifyIDToken(r.Context(), strings.TrimPrefix(header, "Bearer "))
	if err != nil {
		return "", err
	}
	return token.UID, nil
}
