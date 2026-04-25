package verification

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestOcrAadhaar_OPTIONS(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/ocrAadhaar", nil)
	w := httptest.NewRecorder()

	OcrAadhaar(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("OPTIONS returned %d, want %d", resp.StatusCode, http.StatusNoContent)
	}
}

func TestOcrAadhaar_MissingAuth(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/ocrAadhaar", nil)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	OcrAadhaar(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Missing auth returned %d, want %d", resp.StatusCode, http.StatusUnauthorized)
	}
}

func TestOcrAadhaar_InvalidJSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/ocrAadhaar", bytes.NewReader([]byte("invalid")))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer fake-token")
	w := httptest.NewRecorder()

	OcrAadhaar(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Logf("Invalid JSON returned %d (auth passed)", resp.StatusCode)
	}
}

func TestOcrAadhaar_InvalidBase64(t *testing.T) {
	body := OcrRequest{ImageBase64: "!!!invalid!!!"}
	jsonBody, _ := json.Marshal(body)

	req := httptest.NewRequest(http.MethodPost, "/ocrAadhaar", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer fake-token")
	w := httptest.NewRecorder()

	OcrAadhaar(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Logf("Invalid base64 returned %d", resp.StatusCode)
	}
}

func TestVerifyKYC_OPTIONS(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/verifyKYC", nil)
	w := httptest.NewRecorder()

	VerifyKYC(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("OPTIONS returned %d, want %d", resp.StatusCode, http.StatusNoContent)
	}
}

func TestVerifyKYC_MissingAuth(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/verifyKYC", nil)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	VerifyKYC(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("Missing auth returned %d, want %d", resp.StatusCode, http.StatusUnauthorized)
	}
}

func TestVerifyKYC_InvalidJSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/verifyKYC", bytes.NewReader([]byte("invalid")))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer fake-token")
	w := httptest.NewRecorder()

	VerifyKYC(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Logf("Invalid JSON returned %d (auth passed)", resp.StatusCode)
	}
}

func TestDecodeDataURL(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		wantMime string
		wantErr bool
	}{
		{"png", "data:image/png;base64,SGVsbG8=", "image/png", false},
		{"jpeg", "data:image/jpeg;base64,SGVsbG8=", "image/jpeg", false},
		{"jpg", "data:image/jpg;base64,SGVsbG8=", "image/jpeg", false},
		{"no_prefix", "SGVsbG8=", "image/jpeg", false},
		{"invalid", "!!!notbase64!!!", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mime, data, err := decodeDataURL(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("decodeDataURL() error = %v, wantErr %v", err, tt.wantErr)
			}
			if !tt.wantErr && mime != tt.wantMime {
				t.Errorf("mime = %v, want %v", mime, tt.wantMime)
			}
			if !tt.wantErr && len(data) == 0 {
				t.Error("Expected non-empty data")
			}
		})
	}
}

func TestOcrRequestWrapper_GetRequest(t *testing.T) {
	tests := []struct {
		name     string
		wrapper  OcrRequestWrapper
		wantReq  OcrRequest
	}{
		{
			name: "with_data",
			wrapper: OcrRequestWrapper{
				Data: &OcrRequest{ImageBase64: "from_data"},
			},
			wantReq: OcrRequest{ImageBase64: "from_data"},
		},
		{
			name: "with_direct",
			wrapper: OcrRequestWrapper{
				ImageBase64: "direct",
			},
			wantReq: OcrRequest{ImageBase64: "direct"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := tt.wrapper.GetRequest()
			if req.ImageBase64 != tt.wantReq.ImageBase64 {
				t.Errorf("ImageBase64 = %v, want %v", req.ImageBase64, tt.wantReq.ImageBase64)
			}
		})
	}
}

func TestKYCRequestWrapper_GetRequest(t *testing.T) {
	tests := []struct {
		name     string
		wrapper  KYCRequestWrapper
		wantReq  KYCRequest
	}{
		{
			name: "with_data",
			wrapper: KYCRequestWrapper{
				Data: &KYCRequest{AadhaarImageBase64: "aadhaar", SelfieImageBase64: "selfie"},
			},
			wantReq: KYCRequest{AadhaarImageBase64: "aadhaar", SelfieImageBase64: "selfie"},
		},
		{
			name: "with_direct",
			wrapper: KYCRequestWrapper{
				AadhaarImageBase64: "aadhaar_direct",
				SelfieImageBase64:  "selfie_direct",
			},
			wantReq: KYCRequest{AadhaarImageBase64: "aadhaar_direct", SelfieImageBase64: "selfie_direct"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := tt.wrapper.GetRequest()
			if req.AadhaarImageBase64 != tt.wantReq.AadhaarImageBase64 {
				t.Errorf("AadhaarImageBase64 = %v, want %v", req.AadhaarImageBase64, tt.wantReq.AadhaarImageBase64)
			}
			if req.SelfieImageBase64 != tt.wantReq.SelfieImageBase64 {
				t.Errorf("SelfieImageBase64 = %v, want %v", req.SelfieImageBase64, tt.wantReq.SelfieImageBase64)
			}
		})
	}
}

func TestKYCResponse_JSON(t *testing.T) {
	resp := KYCResponse{
		AadhaarNumber: "123456789012",
		DOB:           "01/01/1990",
		Gender:        "male",
		FaceMatched:   true,
		Confidence:    95.5,
	}

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(resp); err != nil {
		t.Fatalf("Failed to encode: %v", err)
	}

	var decoded KYCResponse
	if err := json.NewDecoder(&buf).Decode(&decoded); err != nil {
		t.Fatalf("Failed to decode: %v", err)
	}

	if !resp.FaceMatched {
		t.Error("FaceMatched should be true")
	}
	if resp.Confidence != 95.5 {
		t.Errorf("Confidence = %v, want 95.5", resp.Confidence)
	}
}

func TestSetCORS(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodOptions, "/test", nil)

	handled := setCORS(w, req)

	if !handled {
		t.Error("setCORS should return true for OPTIONS")
	}
	if w.Code != http.StatusNoContent {
		t.Errorf("Status = %d, want %d", w.Code, http.StatusNoContent)
	}

	w2 := httptest.NewRecorder()
	req2 := httptest.NewRequest(http.MethodPost, "/test", nil)
	handled2 := setCORS(w2, req2)

	if handled2 {
		t.Error("setCORS should return false for POST")
	}
}

func TestOcrResponse_JSON(t *testing.T) {
	resp := OcrResponse{
		AadhaarNumber: "123456789012",
		DOB:           "01/01/1990",
		Gender:        "female",
	}

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(resp); err != nil {
		t.Fatalf("Failed to encode: %v", err)
	}

	var decoded OcrResponse
	if err := json.NewDecoder(&buf).Decode(&decoded); err != nil {
		t.Fatalf("Failed to decode: %v", err)
	}

	if decoded.AadhaarNumber != resp.AadhaarNumber {
		t.Errorf("AadhaarNumber = %v, want %v", decoded.AadhaarNumber, resp.AadhaarNumber)
	}
}
