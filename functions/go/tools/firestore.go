package tools

import (
	"context"
	"fmt"
	"math"
	"sahaay/functions/config"

	"cloud.google.com/go/firestore"
)

func createClient(ctx context.Context) (*firestore.Client, error) {
	return firestore.NewClient(ctx, config.Project)
}

// GetTask retrieves a task document from Firestore.
func GetTask(ctx context.Context, taskID string) (map[string]any, error) {
	client, err := createClient(ctx)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	doc, err := client.Collection("tasks").Doc(taskID).Get(ctx)
	if err != nil {
		return nil, err
	}
	return doc.Data(), nil
}

// SearchVolunteers finds available volunteers within a radius.
func SearchVolunteers(ctx context.Context, skill string, lat, lng float64, radiusKm float64) ([]map[string]any, error) {
	client, err := createClient(ctx)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	// Simplistic bounding box query (real apps use GeoFirestore or S2 cells)
	// 1 degree lat is ~111km
	latDelta := radiusKm / 111.0
	lngDelta := radiusKm / (111.0 * math.Cos(lat*math.Pi/180.0))

	iter := client.Collection("volunteers").
		Where("available", "==", true).
		Where("lat", ">=", lat-latDelta).
		Where("lat", "<=", lat+latDelta).
		Documents(ctx)
	
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}

	var results []map[string]any
	for _, doc := range docs {
		data := doc.Data()
		vLat := data["lat"].(float64)
		vLng := data["lng"].(float64)
		
		// Refine with exact distance
		dist := haversine(lat, lng, vLat, vLng)
		if dist <= radiusKm {
			data["id"] = doc.Ref.ID
			data["distance"] = dist
			results = append(results, data)
		}
	}

	return results, nil
}

func haversine(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371.0 // km
	dLat := (lat2 - lat1) * math.Pi / 180.0
	dLon := (lon2 - lon1) * math.Pi / 180.0
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180.0)*math.Cos(lat2*math.Pi/180.0)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}
