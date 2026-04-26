package verification

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"

	vision "cloud.google.com/go/vision/apiv1"
	visionpb "cloud.google.com/go/vision/v2/apiv1/visionpb"
	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"sahaay.io/functions/middleware"
)

func init() {
	functions.HTTP("DetectFace", DetectFace)
}

type DetectFaceRequest struct {
	ImageBase64 string `json:"imageBase64"` // base64-encoded image
}

type FaceDetectionResult struct {
	FaceDetected    bool    `json:"faceDetected"`
	FaceCount       int     `json:"faceCount"`
	Confidence      float32 `json:"confidence"`
	IsBlurred       bool    `json:"isBlurred"`
	HasHeadwear     bool    `json:"hasHeadwear"`
	JoyLikelihood   string  `json:"joyLikelihood"`
	AngerLikelihood string  `json:"angerLikelihood"`
	BoundingBox     []int32 `json:"boundingBox"`
}

func DetectFace(w http.ResponseWriter, r *http.Request) {
	// CORS
	origin := r.Header.Get("Origin")
	if origin == "" {
		origin = "*"
	}

	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Firebase-AppCheck, X-Firebase-Client, X-Firebase-GMPID, Firebase-Instance-ID-Token, X-Requested-With")
	
	if origin != "*" {
		w.Header().Set("Access-Control-Allow-Credentials", "true")
	}
	
	w.Header().Set("Access-Control-Max-Age", "3600")
	w.Header().Set("Vary", "Origin, Access-Control-Request-Headers")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Auth
	_, err := middleware.VerifyIDToken(r)
	if err != nil {
		http.Error(w, "Unauthenticated", http.StatusUnauthorized)
		return
	}

	var bodyBytes []byte
	if r.Body != nil {
		bodyBytes, _ = io.ReadAll(r.Body)
	}

	var req DetectFaceRequest
	if err := json.Unmarshal(bodyBytes, &req); err != nil || req.ImageBase64 == "" {
		// Try to unwrap from "data" field
		var envelope struct {
			Data DetectFaceRequest `json:"data"`
		}
		if err := json.Unmarshal(bodyBytes, &envelope); err == nil && envelope.Data.ImageBase64 != "" {
			req = envelope.Data
		} else if r.Method != "OPTIONS" {
			http.Error(w, "Bad request: missing imageBase64", http.StatusBadRequest)
			return
		}
	}

	imgBytes, err := base64.StdEncoding.DecodeString(req.ImageBase64)
	if err != nil {
		http.Error(w, "Invalid base64 image", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	client, err := vision.NewImageAnnotatorClient(ctx)
	if err != nil {
		http.Error(w, "Vision API init failed", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	image := &visionpb.Image{Content: imgBytes}
	annotations, err := client.DetectFaces(ctx, image, nil, 5)
	if err != nil {
		http.Error(w, "Face detection failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	result := FaceDetectionResult{
		FaceDetected: len(annotations) > 0,
		FaceCount:    len(annotations),
	}

	if len(annotations) > 0 {
		face := annotations[0]
		result.Confidence = face.DetectionConfidence
		result.IsBlurred = face.BlurredLikelihood >= visionpb.Likelihood_LIKELY
		result.HasHeadwear = face.HeadwearLikelihood >= visionpb.Likelihood_LIKELY
		result.JoyLikelihood = face.JoyLikelihood.String()
		result.AngerLikelihood = face.AngerLikelihood.String()

		if face.BoundingPoly != nil && len(face.BoundingPoly.Vertices) == 4 {
			for _, v := range face.BoundingPoly.Vertices {
				result.BoundingBox = append(result.BoundingBox, v.X, v.Y)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"result": result})
}
