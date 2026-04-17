import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../services/api_service.dart';
import '../../models/need_model.dart';

class NeedsMapScreen extends StatefulWidget {
  const NeedsMapScreen({super.key});

  @override
  State<NeedsMapScreen> createState() => _NeedsMapScreenState();
}

class _NeedsMapScreenState extends State<NeedsMapScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<NeedModel>> _needsFuture;

  static const LatLng _fallbackCenter = LatLng(19.0760, 72.8777); // Mumbai

  @override
  void initState() {
    super.initState();
    _needsFuture = _apiService.getNeeds();
  }

  bool _hasValidCoordinates(NeedModel need) {
    final isLatValid = need.lat >= -90 && need.lat <= 90;
    final isLngValid = need.lng >= -180 && need.lng <= 180;
    final isZeroPoint = need.lat == 0 && need.lng == 0;
    return isLatValid && isLngValid && !isZeroPoint;
  }

  double _markerHueForUrgency(String urgency) {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return BitmapDescriptor.hueRed;
      case 'high':
        return BitmapDescriptor.hueOrange;
      case 'medium':
        return BitmapDescriptor.hueYellow;
      case 'low':
      default:
        return BitmapDescriptor.hueGreen;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Community Needs Map')),
      body: FutureBuilder<List<NeedModel>>(
        future: _needsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'Could not load community needs: ${snapshot.error}',
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final needs = snapshot.data ?? [];
          final mappedNeeds = needs.where(_hasValidCoordinates).toList();

          if (mappedNeeds.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'No valid need coordinates available yet.\nAdd needs with lat/lng to see markers.',
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final initialTarget = LatLng(
            mappedNeeds.first.lat,
            mappedNeeds.first.lng,
          );

          final markers = mappedNeeds
              .map(
                (need) => Marker(
                  markerId: MarkerId(need.id),
                  position: LatLng(need.lat, need.lng),
                  infoWindow: InfoWindow(
                    title: need.title,
                    snippet: '${need.category} · ${need.urgency.toUpperCase()}',
                  ),
                  icon: BitmapDescriptor.defaultMarkerWithHue(
                    _markerHueForUrgency(need.urgency),
                  ),
                ),
              )
              .toSet();

          return Stack(
            children: [
              GoogleMap(
                initialCameraPosition: CameraPosition(
                  target:
                      initialTarget.latitude == 0 &&
                          initialTarget.longitude == 0
                      ? _fallbackCenter
                      : initialTarget,
                  zoom: 12,
                ),
                markers: markers,
                mapToolbarEnabled: true,
                myLocationButtonEnabled: false,
              ),
              Positioned(
                top: 12,
                left: 12,
                right: 12,
                child: Card(
                  elevation: 2,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    child: Text(
                      'Showing ${mappedNeeds.length} community need markers',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
