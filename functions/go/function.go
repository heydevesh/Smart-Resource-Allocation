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
