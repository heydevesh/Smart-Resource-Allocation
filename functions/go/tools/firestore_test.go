package tools

import (
	"context"
	"math"
	"testing"
)

func TestHaversine(t *testing.T) {
	tests := []struct {
		name     string
		lat1     float64
		lon1     float64
		lat2     float64
		lon2     float64
		wantDist float64
		tolerance float64
	}{
		{"same_point", 0, 0, 0, 0, 0, 0.01},
		{"equator_1deg", 0, 0, 0, 1, 111.32, 1.0},
		{"ny_to_la", 40.7128, -74.0060, 34.0522, -118.2437, 3935, 10},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := haversine(tt.lat1, tt.lon1, tt.lat2, tt.lon2)
			diff := math.Abs(got - tt.wantDist)
			if diff > tt.tolerance {
				t.Errorf("haversine() = %v, want %v (diff %v > tolerance %v)", got, tt.wantDist, diff, tt.tolerance)
			}
		})
	}
}

func TestHaversine_ShortDistance(t *testing.T) {
	dist := haversine(19.0760, 72.8777, 19.0896, 72.8656)
	if dist <= 0 || dist > 5 {
		t.Errorf("Short Mumbai distance = %v km, expected ~2km", dist)
	}
}

func TestSearchVolunteers_InvalidContext(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	_, err := SearchVolunteers(ctx, "medical", 19.0760, 72.8777, 10.0)
	if err == nil {
		t.Error("Expected error with cancelled context")
	}
}

func TestGetTask_InvalidContext(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	_, err := GetTask(ctx, "nonexistent-task-id")
	if err == nil {
		t.Error("Expected error with cancelled context")
	}
}
