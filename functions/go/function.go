package function

import (
	"net/http"
	"sahaay.io/functions/agents"
	"sahaay.io/functions/verification"
)

func CallAgent(w http.ResponseWriter, r *http.Request) {
	agents.CallAgent(w, r)
}

func DetectFace(w http.ResponseWriter, r *http.Request) {
	verification.DetectFace(w, r)
}

func VerifyKYC(w http.ResponseWriter, r *http.Request) {
	verification.VerifyKYC(w, r)
}

func OcrAadhaar(w http.ResponseWriter, r *http.Request) {
	verification.OcrAadhaar(w, r)
}
