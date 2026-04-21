import { Injectable, signal } from '@angular/core';
import { GeolocationService } from './geolocation.service';

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  isLoaded = signal(false);
  geolocation = new GeolocationService();

  // Mumbai Center (approx Dharavi area)
  readonly defaultCenter: google.maps.LatLngLiteral = { lat: 19.0444, lng: 72.8501 };

  constructor() {
    this.checkIfLoaded();
  }

  private checkIfLoaded() {
    const check = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps) {
        this.isLoaded.set(true);
        clearInterval(check);
      }
    }, 500);
  }

  createMap(element: HTMLElement, options?: google.maps.MapOptions): google.maps.Map {
    return new google.maps.Map(element, {
      center: this.defaultCenter,
      zoom: 13,
      disableDefaultUI: true,
      styles: this.getMapStyles(), // Custom premium styles
      ...options
    });
  }

  private getMapStyles(): google.maps.MapTypeStyle[] {
    // Premium "Silver/Subtle" style for the coordination map
    return [
      {
        "elementType": "geometry",
        "stylers": [{ "color": "#f5f5f5" }]
      },
      {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#f5f5f5" }]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#bdbdbd" }]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{ "color": "#eeeeee" }]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#e5e5e5" }]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#ffffff" }]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#dadada" }]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9e9e9e" }]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [{ "color": "#e5e5e5" }]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [{ "color": "#eeeeee" }]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#c9c9c9" }]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9e9e9e" }]
      }
    ];
  }

  createHeatmap(map: google.maps.Map, data: google.maps.LatLngLiteral[]): google.maps.visualization.HeatmapLayer {
    return new google.maps.visualization.HeatmapLayer({
      data: data.map(point => new google.maps.LatLng(point.lat, point.lng)),
      map: map,
      radius: 30,
      opacity: 0.7
    });
  }

  /**
   * Creates proximity rings (circles) around a location
   */
  createProximityRings(map: google.maps.Map, center: google.maps.LatLngLiteral, radii: number[] = [1000, 3000, 5000]): google.maps.Circle[] {
    return radii.map((radius, index) => {
      return new google.maps.Circle({
        strokeColor: '#0a6b5e',
        strokeOpacity: 0.8 / (index + 1),
        strokeWeight: 2,
        fillColor: '#0a6b5e',
        fillOpacity: 0.1 / (index + 1),
        map: map,
        center: center,
        radius: radius,
        clickable: false
      });
    });
  }
}
