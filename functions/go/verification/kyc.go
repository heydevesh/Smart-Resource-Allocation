package verification

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"google.golang.org/genai"
	"sahaay.io/functions/config"
	"sahaay.io/functions/middleware"
)

func init() {
	functions.HTTP("VerifyKYC", VerifyKYC)
	functions.HTTP("OcrAadhaar", OcrAadhaar)
}

type OcrRequest struct {
	ImageBase64 string `json:"imageBase64"`
}

type OcrRequestWrapper struct {
	Data        *OcrRequest `json:"data"`
	ImageBase64 string      `json:"imageBase64"`
}

func (w *OcrRequestWrapper) GetRequest() OcrRequest {
	if w.Data != nil {
		return *w.Data
	}
	return OcrRequest{ImageBase64: w.ImageBase64}
}

type OcrResponse struct {
	AadhaarNumber string `json:"aadhaarNumber"`
	DOB           string `json:"dob"`
	Gender        string `json:"gender"`
}

type KYCRequest struct {
	AadhaarImageBase64 string `json:"aadhaarImageBase64"`
	SelfieImageBase64  string `json:"selfieImageBase64"`
}

type KYCRequestWrapper struct {
	Data               *KYCRequest `json:"data"`
	AadhaarImageBase64 string      `json:"aadhaarImageBase64"`
	SelfieImageBase64  string      `json:"selfieImageBase64"`
}

func (w *KYCRequestWrapper) GetRequest() KYCRequest {
	if w.Data != nil {
		return *w.Data
	}
	return KYCRequest{
		AadhaarImageBase64: w.AadhaarImageBase64,
		SelfieImageBase64:  w.SelfieImageBase64,
	}
}

type KYCResponse struct {
	AadhaarNumber string  `json:"aadhaarNumber"`
	DOB           string  `json:"dob"`
	Gender        string  `json:"gender"`
	FaceMatched   bool    `json:"faceMatched"`
	Confidence    float32 `json:"confidence"`
	Error         string  `json:"error,omitempty"`
}

func setCORS(w http.ResponseWriter, r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		origin = "*"
	}

	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Firebase-AppCheck, X-Firebase-Client, X-Firebase-GMPID, Firebase-Instance-ID-Token, X-Requested-With")
	
	// Credentials cannot be true if origin is "*"
	if origin != "*" {
		w.Header().Set("Access-Control-Allow-Credentials", "true")
	}
	
	w.Header().Set("Access-Control-Max-Age", "3600")
	w.Header().Set("Vary", "Origin, Access-Control-Request-Headers")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return true
	}
	return false
}

func decodeDataURL(dataURL string) (string, []byte, error) {
	mimeType := "image/jpeg"
	data := strings.TrimSpace(dataURL)

	if strings.HasPrefix(data, "data:image/png;base64,") {
		mimeType = "image/png"
		data = strings.TrimPrefix(data, "data:image/png;base64,")
	} else if strings.HasPrefix(data, "data:image/jpeg;base64,") {
		mimeType = "image/jpeg"
		data = strings.TrimPrefix(data, "data:image/jpeg;base64,")
	} else if strings.HasPrefix(data, "data:image/jpg;base64,") {
		mimeType = "image/jpeg"
		data = strings.TrimPrefix(data, "data:image/jpg;base64,")
	}

	imgBytes, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		return "", nil, err
	}
	return mimeType, imgBytes, nil
}

func OcrAadhaar(w http.ResponseWriter, r *http.Request) {
	if setCORS(w, r) {
		return
	}

	_, err := middleware.VerifyIDToken(r)
	if err != nil {
		http.Error(w, "Unauthenticated", http.StatusUnauthorized)
		return
	}

	var reqWrapper OcrRequestWrapper
	if err := json.NewDecoder(r.Body).Decode(&reqWrapper); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	req := reqWrapper.GetRequest()

	mimeType, imgBytes, err := decodeDataURL(req.ImageBase64)
	if err != nil {
		http.Error(w, "Invalid base64 image", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		Project:  config.GeminiProject,
		Location: config.GeminiLocation,
		Backend:  genai.BackendVertexAI,
	})
	if err != nil {
		http.Error(w, "Failed to init Gemini", http.StatusInternalServerError)
		return
	}

	prompt := "Extract the Aadhaar number, DOB, and Gender from this ID card."

	contents := []*genai.Content{
		{
			Parts: []*genai.Part{
				genai.NewPartFromText(prompt),
				genai.NewPartFromBytes(imgBytes, mimeType),
			},
			Role: "user",
		},
	}

	genCfg := &genai.GenerateContentConfig{
		ResponseSchema: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"aadhaarNumber": {Type: genai.TypeString, Description: "12 digit Aadhaar number extracted from the ID card, no spaces"},
				"dob":           {Type: genai.TypeString, Description: "Date of birth extracted from ID card"},
				"gender":        {Type: genai.TypeString, Description: "Gender extracted from ID card (male/female/other)"},
			},
		},
		ResponseMIMEType: "application/json",
	}

	resp, err := client.Models.GenerateContent(ctx, config.GeminiModel, contents, genCfg)
	if err != nil {
		http.Error(w, "Failed to process image", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if resp != nil {
		responseBody := map[string]json.RawMessage{
			"result": json.RawMessage(resp.Text()),
		}
		_ = json.NewEncoder(w).Encode(responseBody)
		return
	}

	http.Error(w, "Empty response from model", http.StatusInternalServerError)
}

func VerifyKYC(w http.ResponseWriter, r *http.Request) {
	if setCORS(w, r) {
		return
	}

	_, err := middleware.VerifyIDToken(r)
	if err != nil {
		http.Error(w, "Unauthenticated", http.StatusUnauthorized)
		return
	}

	var reqWrapper KYCRequestWrapper
	if err := json.NewDecoder(r.Body).Decode(&reqWrapper); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	req := reqWrapper.GetRequest()

	aadhaarMime, aadhaarBytes, err := decodeDataURL(req.AadhaarImageBase64)
	if err != nil {
		http.Error(w, "Invalid base64 Aadhaar image", http.StatusBadRequest)
		return
	}
	selfieMime, selfieBytes, err := decodeDataURL(req.SelfieImageBase64)
	if err != nil {
		http.Error(w, "Invalid base64 selfie image", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		Project:  config.GeminiProject,
		Location: config.GeminiLocation,
		Backend:  genai.BackendVertexAI,
	})
	if err != nil {
		http.Error(w, "Failed to init Gemini", http.StatusInternalServerError)
		return
	}

	prompt := "You are an expert KYC verification agent. You have been provided with an image of an Aadhaar ID card and a selfie of a person. Extract the Aadhaar number, DOB, and Gender from the ID card. Then, compare the photo on the Aadhaar card with the provided selfie to determine if they are the same person."

	contents := []*genai.Content{
		{
			Parts: []*genai.Part{
				genai.NewPartFromText(prompt),
				genai.NewPartFromText("Image 1 (Aadhaar Card):"),
				genai.NewPartFromBytes(aadhaarBytes, aadhaarMime),
				genai.NewPartFromText("Image 2 (Selfie):"),
				genai.NewPartFromBytes(selfieBytes, selfieMime),
			},
			Role: "user",
		},
	}

	genCfg := &genai.GenerateContentConfig{
		ResponseSchema: &genai.Schema{
			Type: genai.TypeObject,
			Properties: map[string]*genai.Schema{
				"aadhaarNumber": {Type: genai.TypeString, Description: "12 digit Aadhaar number extracted from the ID card, no spaces"},
				"dob":           {Type: genai.TypeString, Description: "Date of birth extracted from ID card"},
				"gender":        {Type: genai.TypeString, Description: "Gender extracted from ID card (male/female/other)"},
				"faceMatched":   {Type: genai.TypeBoolean, Description: "True if the person in the selfie matches the person in the ID card photo"},
				"confidence":    {Type: genai.TypeNumber, Description: "Confidence score between 0.0 and 100.0 for the face match"},
				"error":         {Type: genai.TypeString, Description: "Any error or issue detected (e.g. no face found)"},
			},
		},
		ResponseMIMEType: "application/json",
	}

	resp, err := client.Models.GenerateContent(ctx, config.GeminiModel, contents, genCfg)
	if err != nil {
		http.Error(w, "Failed to process images", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if resp != nil {
		responseBody := map[string]json.RawMessage{
			"result": json.RawMessage(resp.Text()),
		}
		_ = json.NewEncoder(w).Encode(responseBody)
		return
	}

	http.Error(w, "Empty response from model", http.StatusInternalServerError)
}
