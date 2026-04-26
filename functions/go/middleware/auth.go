package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
)

var authClient *auth.Client

func init() {
	app, _ := firebase.NewApp(context.Background(), nil)
	authClient, _ = app.Auth(context.Background())
}

func VerifyIDToken(r *http.Request) (string, error) {
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
