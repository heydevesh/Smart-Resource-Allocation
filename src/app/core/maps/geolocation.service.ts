import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  currentPosition = signal<google.maps.LatLngLiteral | null>(null);
  error = signal<string | null>(null);

  constructor() {
    this.watchPosition();
  }

  getCurrentPosition(): Promise<google.maps.LatLngLiteral> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          this.currentPosition.set(coords);
          resolve(coords);
        },
        (err) => {
          this.error.set(err.message);
          reject(err);
        }
      );
    });
  }

  private watchPosition() {
    if (!navigator.geolocation) return;

    navigator.geolocation.watchPosition(
      (pos) => {
        this.currentPosition.set({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => this.error.set(err.message),
      { enableHighAccuracy: true }
    );
  }
}
