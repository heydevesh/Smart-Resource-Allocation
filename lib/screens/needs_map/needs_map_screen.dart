import 'package:flutter/material.dart';
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

  @override
  void initState() {
    super.initState();
    _needsFuture = _apiService.getNeeds();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Community Needs Map (Live API)'),
      ),
      body: FutureBuilder<List<NeedModel>>(
        future: _needsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final needs = snapshot.data ?? [];
          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 32),
              Icon(Icons.map, size: 64, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 16),
              const Text('Google Maps Integration Pending...'),
              const SizedBox(height: 8),
              Text('Found ${needs.length} live coordinates to map.'),
              const SizedBox(height: 24),
              Expanded(
                child: ListView.builder(
                  itemCount: needs.length,
                  itemBuilder: (context, index) {
                    final n = needs[index];
                    return ListTile(
                      leading: const Icon(Icons.location_on, color: Colors.red),
                      title: Text(n.title),
                      subtitle: Text('Lat: ${n.lat}, Lng: ${n.lng} · Category: ${n.category}'),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

