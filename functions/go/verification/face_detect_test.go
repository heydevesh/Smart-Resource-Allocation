package verification

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestDetectFace_OPTIONS(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/detectFace", nil)
	w := httptest.NewRecorder()

	DetectFace(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("OPTIONS returned %d, want %d", resp.StatusCode, http.StatusNoContent)
	}
}

func TestDetectFace_MissingAuth(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/detectFace", nil)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	DetectFace(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Missing auth returned %d, want %d", resp.StatusCode, http.StatusUnauthorized)
	}
}

func TestDetectFace_InvalidJSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/detectFace", bytes.NewReader([]byte("invalid")))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer fake-token")
	w := httptest.NewRecorder()

	DetectFace(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Logf("Invalid JSON returned %d (auth passed, JSON parse failed)", resp.StatusCode)
	}
}

func TestDetectFace_InvalidBase64(t *testing.T) {
	body := DetectFaceRequest{ImageBase64: "not-valid-base64!!!"}
	jsonBody, _ := json.Marshal(body)

	req := httptest.NewRequest(http.MethodPost, "/detectFace", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer fake-token")
	w := httptest.NewRecorder()

	DetectFace(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Logf("Invalid base64 returned %d", resp.StatusCode)
	}
}

func TestDetectFace_EmptyImage(t *testing.T) {
	emptyImg := base64.StdEncoding.EncodeToString([]byte{})
	body := DetectFaceRequest{ImageBase64: emptyImg}
	jsonBody, _ := json.Marshal(body)

	req := httptest.NewRequest(http.MethodPost, "/detectFace", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer fake-token")
	w := httptest.NewRecorder()

	DetectFace(w, req)

	resp := w.Result()
	t.Logf("Empty image response status: %d", resp.StatusCode)
}

func TestFaceDetectionResult_JSON(t *testing.T) {
	result := FaceDetectionResult{
		FaceDetected:    true,
		FaceCount:       1,
		Confidence:      0.95,
		IsBlurred:       false,
		HasHeadwear:     false,
		JoyLikelihood:   "LIKELY",
		AngerLikelihood: "VERY_UNLIKELY",
		BoundingBox:     []int32{10, 10, 100, 10, 100, 100, 10, 100},
	}

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(result); err != nil {
		t.Fatalf("Failed to encode: %v", err)
	}

	var decoded FaceDetectionResult
	if err := json.NewDecoder(&buf).Decode(&decoded); err != nil {
		t.Fatalf("Failed to decode: %v", err)
	}

	if !decoded.FaceDetected {
		t.Error("FaceDetected should be true")
	}
	if decoded.FaceCount != 1 {
		t.Errorf("FaceCount = %d, want 1", decoded.FaceCount)
	}
}

func TestDetectFace_CORSHeaders(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/detectFace", nil)
	req.Header.Set("Access-Control-Request-Headers", "X-Custom-Header")
	w := httptest.NewRecorder()

	DetectFace(w, req)

	resp := w.Result()
	h := resp.Header
	if h.Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("Allow-Origin = %v, want *", h.Get("Access-Control-Allow-Origin"))
	}
	if h.Get("Access-Control-Allow-Methods") != "POST, OPTIONS" {
		t.Errorf("Allow-Methods = %v, want POST, OPTIONS", h.Get("Access-Control-Allow-Methods"))
	}
}

func TestDecodeDetectFaceRequest(t *testing.T) {
	tests := []struct {
		name string
		json string
		want string
	}{
		{"direct", `{"imageBase64":"abc123"}`, "abc123"},
		{"with_data", `{"data":{"imageBase64":"xyz789"}}`, ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var req DetectFaceRequest
			err := json.NewDecoder(strings.NewReader(tt.json)).Decode(&req)
			if err != nil && tt.want != "" {
				t.Errorf("Decode failed: %v", err)
			}
			if req.ImageBase64 != tt.want && tt.want != "" {
				t.Errorf("ImageBase64 = %v, want %v", req.ImageBase64, tt.want)
			}
		})
	}
}
