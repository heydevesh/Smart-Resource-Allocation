package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestVerifyIDToken_MissingHeader(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	_, err := VerifyIDToken(req)
	if err == nil {
		t.Error("Expected error for missing Authorization header")
	}
}

func TestVerifyIDToken_MissingBearer(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "InvalidToken")
	_, err := VerifyIDToken(req)
	if err == nil {
		t.Error("Expected error for missing Bearer prefix")
	}
}

func TestVerifyIDToken_AuthClientNotInit(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer fake-token")
	_, err := VerifyIDToken(req)
	if err == nil {
		t.Error("Expected error when auth client not initialized")
	}
}
