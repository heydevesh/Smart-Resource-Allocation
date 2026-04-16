import 'package:geolocator/geolocator.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  /// Check if location services are enabled
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  /// Check and request location permission
  Future<LocationPermission> requestPermission() async {
    final serviceEnabled = await isLocationServiceEnabled();
    if (!serviceEnabled) {
      return LocationPermission.deniedForever;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    return permission;
  }

  /// Get current location
  Future<Position?> getCurrentPosition() async {
    try {
      final permission = await requestPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return null;
      }

      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
    } catch (e) {
      print('Location error: $e');
      return null;
    }
  }

  /// Calculate distance between two points in kilometers
  double calculateDistance({
    required double startLat,
    required double startLng,
    required double endLat,
    required double endLng,
  }) {
    return Geolocator.distanceBetween(
      startLat,
      startLng,
      endLat,
      endLng,
    ) / 1000; // Convert to kilometers
  }

  /// Get address from coordinates (reverse geocoding)
  Future<String> getAddressFromCoordinates(double latitude, double longitude) async {
    // TODO: Implement when geocoding is needed
    // Note: This requires additional package dependencies
    return 'Coordinates: $latitude, $longitude';
  }
}
