package agents

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
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

func TestGetSystemPromptForIntent(t *testing.T) {
	tests := []struct {
		intent   string
		contains string
	}{
		{"MATCH_VOLUNTEERS", "volunteer matching"},
		{"PREDICT_SURGE", "needs surge prediction"},
		{"NARRATE_REPORT", "donor report writer"},
		{"QUERY_ASSISTANT", "coordinator assistant"},
		{"UNKNOWN", "Sahaay NGO coordination AI"},
	}

	for _, tt := range tests {
		t.Run(tt.intent, func(t *testing.T) {
			got := getSystemPromptForIntent(tt.intent)
			if !strings.Contains(got, tt.contains) {
				t.Errorf("getSystemPromptForIntent(%q) does not contain %q", tt.intent, tt.contains)
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
	if !strings.Contains(h.Get("Access-Control-Allow-Methods"), "POST") {
		t.Errorf("Allow-Methods = %v, expected to contain POST", h.Get("Access-Control-Allow-Methods"))
	}
	if !strings.Contains(h.Get("Access-Control-Allow-Headers"), "Authorization") {
		t.Errorf("Allow-Headers = %v, expected to contain Authorization", h.Get("Access-Control-Allow-Headers"))
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
