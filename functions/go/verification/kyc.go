package verification

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"sahaay.io/functions/middleware"

	"cloud.google.com/go/vertexai/genai"
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

func OcrAadhaar(w http.ResponseWriter, r *http.Request) {
	// CORS and Auth
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
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

	ctx := context.Background()
	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		projectID = "sahaay-18eb3"
	}

	client, err := genai.NewClient(ctx, projectID, "us-west1")
	if err != nil {
		http.Error(w, "Failed to init Gemini", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.0-flash")
	model.ResponseSchema = &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"aadhaarNumber": {Type: genai.TypeString, Description: "12 digit Aadhaar number extracted from the ID card, no spaces"},
			"dob":           {Type: genai.TypeString, Description: "Date of birth extracted from ID card"},
			"gender":        {Type: genai.TypeString, Description: "Gender extracted from ID card (male/female/other)"},
		},
	}
	model.ResponseMIMEType = "application/json"

	imageData := strings.TrimPrefix(req.ImageBase64, "data:image/jpeg;base64,")
	imageData = strings.TrimPrefix(imageData, "data:image/png;base64,")

	prompt := genai.Text("Extract the Aadhaar number, DOB, and Gender from this ID card.")

	resp, err := model.GenerateContent(ctx,
		prompt,
		genai.ImageData("image/jpeg", []byte(imageData)),
	)

	if err != nil {
		http.Error(w, "Failed to process image", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		part := resp.Candidates[0].Content.Parts[0]
		if text, ok := part.(genai.Text); ok {
			// Wrap in "data" object for Firebase Callable protocol
			responseBody := map[string]json.RawMessage{
				"data": json.RawMessage(text),
			}
			json.NewEncoder(w).Encode(responseBody)
			return
		}
	}

	http.Error(w, "Empty response from model", http.StatusInternalServerError)
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

func VerifyKYC(w http.ResponseWriter, r *http.Request) {
	// CORS and Auth
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
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

	ctx := context.Background()
	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		projectID = "sahaay-18eb3"
	}

	client, err := genai.NewClient(ctx, projectID, "us-west1")
	if err != nil {
		http.Error(w, "Failed to init Gemini", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.0-flash")
	model.ResponseSchema = &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"aadhaarNumber": {Type: genai.TypeString, Description: "12 digit Aadhaar number extracted from the ID card, no spaces"},
			"dob":           {Type: genai.TypeString, Description: "Date of birth extracted from ID card"},
			"gender":        {Type: genai.TypeString, Description: "Gender extracted from ID card (male/female/other)"},
			"faceMatched":   {Type: genai.TypeBoolean, Description: "True if the person in the selfie matches the person in the ID card photo"},
			"confidence":    {Type: genai.TypeNumber, Description: "Confidence score between 0.0 and 100.0 for the face match"},
			"error":         {Type: genai.TypeString, Description: "Any error or issue detected (e.g. no face found)"},
		},
	}
	model.ResponseMIMEType = "application/json"

	aadhaarData := strings.TrimPrefix(req.AadhaarImageBase64, "data:image/jpeg;base64,")
	aadhaarData = strings.TrimPrefix(aadhaarData, "data:image/png;base64,")
	selfieData := strings.TrimPrefix(req.SelfieImageBase64, "data:image/jpeg;base64,")
	selfieData = strings.TrimPrefix(selfieData, "data:image/png;base64,")

	prompt := genai.Text("You are an expert KYC verification agent. You have been provided with an image of an Aadhaar ID card and a selfie of a person. Extract the Aadhaar number, DOB, and Gender from the ID card. Then, compare the photo on the Aadhaar card with the provided selfie to determine if they are the same person.")

	// Note: First image is Aadhaar, Second is Selfie
	resp, err := model.GenerateContent(ctx,
		prompt,
		genai.Text("Image 1 (Aadhaar Card):"),
		genai.ImageData("image/jpeg", []byte(aadhaarData)),
		genai.Text("Image 2 (Selfie):"),
		genai.ImageData("image/jpeg", []byte(selfieData)),
	)

	if err != nil {
		http.Error(w, "Failed to process images", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		part := resp.Candidates[0].Content.Parts[0]
		if text, ok := part.(genai.Text); ok {
			// Wrap in "data" object for Firebase Callable protocol
			responseBody := map[string]json.RawMessage{
				"data": json.RawMessage(text),
			}
			json.NewEncoder(w).Encode(responseBody)
			return
		}
	}

	http.Error(w, "Empty response from model", http.StatusInternalServerError)
}
