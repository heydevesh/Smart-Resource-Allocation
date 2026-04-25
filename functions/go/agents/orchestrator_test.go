package agents

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"sahaay.io/functions/config"
)

func TestHealth(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	Health(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Health endpoint returned %d, want %d", resp.StatusCode, http.StatusOK)
	}

	var body map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if body["status"] != "operational" {
		t.Errorf("Status = %v, want 'operational'", body["status"])
	}
}

func TestCallAgent_OPTIONS(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/callAgent", nil)
	w := httptest.NewRecorder()

	CallAgent(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("OPTIONS returned %d, want %d", resp.StatusCode, http.StatusNoContent)
	}
	if resp.Header.Get("Access-Control-Allow-Origin") == "" {
		t.Error("Missing CORS header")
	}
}

func TestCallAgent_WrongMethod(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/callAgent", nil)
	w := httptest.NewRecorder()

	CallAgent(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusMethodNotAllowed {
		t.Errorf("GET returned %d, want %d", resp.StatusCode, http.StatusMethodNotAllowed)
	}
}

func TestCallAgent_EmptyBody(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/callAgent", bytes.NewReader([]byte{}))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	CallAgent(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Empty body returned %d, want %d", resp.StatusCode, http.StatusBadRequest)
	}
}

func TestCallAgent_InvalidJSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/callAgent", bytes.NewReader([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	CallAgent(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Invalid JSON returned %d, want %d", resp.StatusCode, http.StatusBadRequest)
	}
}

func TestCallAgent_MissingAuth(t *testing.T) {
	body := AgentRequest{
		Intent:  "MATCH_VOLUNTEERS",
		Payload: map[string]any{"task": "test"},
	}
	jsonBody, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/callAgent", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	CallAgent(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Missing auth returned %d, want %d", resp.StatusCode, http.StatusUnauthorized)
	}
}

func TestDecodeAgentRequest_Direct(t *testing.T) {
	jsonBody := `{"intent":"MATCH_VOLUNTEERS","payload":{"key":"value"},"sessionId":"abc123"}`
	req, err := decodeAgentRequest([]byte(jsonBody))
	if err != nil {
		t.Fatalf("decodeAgentRequest failed: %v", err)
	}
	if req.Intent != "MATCH_VOLUNTEERS" {
		t.Errorf("Intent = %v, want MATCH_VOLUNTEERS", req.Intent)
	}
	if req.SessionID != "abc123" {
		t.Errorf("SessionID = %v, want abc123", req.SessionID)
	}
}

func TestDecodeAgentRequest_Envelope(t *testing.T) {
	jsonBody := `{"data":{"intent":"QUERY_ASSISTANT","payload":{"q":"help"}}}`
	req, err := decodeAgentRequest([]byte(jsonBody))
	if err != nil {
		t.Fatalf("decodeAgentRequest failed: %v", err)
	}
	if req.Intent != "QUERY_ASSISTANT" {
		t.Errorf("Intent = %v, want QUERY_ASSISTANT", req.Intent)
	}
}

func TestDecodeAgentRequest_Invalid(t *testing.T) {
	_, err := decodeAgentRequest([]byte("not json"))
	if err == nil {
		t.Error("Expected error for invalid JSON")
	}
}

func TestAgentForIntent(t *testing.T) {
	tests := []struct {
		intent string
		want   string
	}{
		{"MATCH_VOLUNTEERS", config.MatchAgentID},
		{"PREDICT_SURGE", config.SurgeAgentID},
		{"NARRATE_REPORT", config.NarratorAgentID},
		{"QUERY_ASSISTANT", config.QueryAgentID},
		{"UNKNOWN", config.OrchestratorAgentID},
		{"", config.OrchestratorAgentID},
	}

	for _, tt := range tests {
		t.Run(tt.intent, func(t *testing.T) {
			got := agentForIntent(tt.intent)
			if got != tt.want {
				t.Errorf("agentForIntent(%q) = %q, want %q", tt.intent, got, tt.want)
			}
		})
	}
}

func TestSetCORSHeaders(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/test", nil)
	req.Header.Set("Origin", "https://example.com")
	req.Header.Set("Access-Control-Request-Headers", "X-Custom-Header")

	setCORSHeaders(w, req)

	h := w.Header()
	if h.Get("Access-Control-Allow-Origin") != "https://example.com" {
		t.Errorf("Allow-Origin = %v, want https://example.com", h.Get("Access-Control-Allow-Origin"))
	}
	if h.Get("Access-Control-Allow-Methods") != "POST, OPTIONS" {
		t.Errorf("Allow-Methods = %v, want POST, OPTIONS", h.Get("Access-Control-Allow-Methods"))
	}
	if h.Get("Access-Control-Allow-Headers") != "X-Custom-Header" {
		t.Errorf("Allow-Headers = %v, want X-Custom-Header", h.Get("Access-Control-Allow-Headers"))
	}
}

func TestWriteJSONError(t *testing.T) {
	w := httptest.NewRecorder()
	writeJSONError(w, http.StatusInternalServerError, "test error")

	resp := w.Result()
	if resp.StatusCode != http.StatusInternalServerError {
		t.Errorf("Status = %d, want %d", resp.StatusCode, http.StatusInternalServerError)
	}
	if resp.Header.Get("Content-Type") != "application/json" {
		t.Errorf("Content-Type = %v, want application/json", resp.Header.Get("Content-Type"))
	}

	var body errorResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("Decode failed: %v", err)
	}
	if body.Error != "test error" {
		t.Errorf("Error = %v, want 'test error'", body.Error)
	}
}
