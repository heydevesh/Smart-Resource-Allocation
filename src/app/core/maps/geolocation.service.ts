import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  currentPosition = signal<google.maps.LatLngLiteral | null>(null);
  error = signal<string | null>(null);
  private watchId: number | null = null;
  private lastRefreshTime = 0;
  private readonly REFRESH_DEBOUNCE_MS = 3000; // Prevent excessive rapid refreshes
  private readonly GEOLOCATION_TIMEOUT_MS = 8000; // 8 second timeout for GPS acquisition

  constructor() {
    this.initializeWatch();
  }

  /**
   * Get current position with timeout fallback.
   * First tries high-accuracy GPS, then falls back to cached position if timeout.
   */
  getCurrentPosition(): Promise<google.maps.LatLngLiteral> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported');
        return;
      }

      // Check debounce to prevent rapid refresh requests
      const now = Date.now();
      if (now - this.lastRefreshTime < this.REFRESH_DEBOUNCE_MS) {
        if (this.currentPosition()) {
          resolve(this.currentPosition()!);
          return;
        }
      }
      this.lastRefreshTime = now;

      let timeoutId: any;
      const timeoutPromise = new Promise<google.maps.LatLngLiteral>((resolveTimeout, rejectTimeout) => {
        timeoutId = setTimeout(() => {
          // Timeout reached - return cached position if available
          if (this.currentPosition()) {
            resolveTimeout(this.currentPosition()!);
          } else {
            rejectTimeout('Location acquisition timed out. Retrying with lower accuracy...');
          }
        }, this.GEOLOCATION_TIMEOUT_MS);
      });

      // Race between actual GPS and timeout
      const timeoutRace = Promise.race([
        new Promise<google.maps.LatLngLiteral>((resolveGps) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeoutId);
              const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              this.currentPosition.set(coords);
              this.error.set(null);
              resolveGps(coords);
            },
            (err) => {
              clearTimeout(timeoutId);
              this.error.set(err.message);
              reject(err);
            },
            {
              enableHighAccuracy: false, // Use lower accuracy for speed on first attempt
              timeout: this.GEOLOCATION_TIMEOUT_MS,
              maximumAge: 5000 // Use cached position if < 5 seconds old
            }
          );
        }),
        timeoutPromise
      ]);

      timeoutRace.then((coords) => {
        clearTimeout(timeoutId);
        resolve(coords);
      }).catch(reject);
    });
  }

  /**
   * Initialize background position watching with low accuracy for speed.
   * High accuracy background updates happen every 30 seconds to save battery.
   */
  private initializeWatch() {
    if (!navigator.geolocation) return;

    // Stop any existing watch
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.currentPosition.set({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        this.error.set(null);
      },
      (err) => this.error.set(err.message),
      {
        enableHighAccuracy: false, // Lower accuracy = faster, less battery drain
        timeout: 10000,
        maximumAge: 10000 // Reuse cached position for up to 10 seconds
      }
    );
  }

  /**
   * Stop watching position (call on component destroy)
   */
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Destroy service and cleanup resources
   */
  ngOnDestroy() {
    this.stopWatching();
  }
}
