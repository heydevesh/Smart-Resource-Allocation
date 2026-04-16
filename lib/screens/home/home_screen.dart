import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/need_model.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
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
        title: const Text('Dashboard (Live from API)'),
      ),
      body: FutureBuilder<List<NeedModel>>(
        future: _needsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error connecting to backend: ${snapshot.error}'));
          }

          final needs = snapshot.data ?? [];
          final activeNeedsCount = needs.length;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Real-Time Metrics',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _buildStatCard(context, 'Active Needs', '$activeNeedsCount', Icons.report_problem, Theme.of(context).colorScheme.error),
                    const SizedBox(width: 16),
                    _buildStatCard(context, 'Volunteers Online', '2', Icons.people, Theme.of(context).colorScheme.primary),
                  ],
                ),
                const SizedBox(height: 24),
                Text(
                  'Recent Activities (Live Needs)',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 16),
                if (needs.isEmpty)
                  const Text('No needs reported.')
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: needs.length > 5 ? 5 : needs.length,
                    itemBuilder: (context, index) {
                      final need = needs[index];
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(child: Icon(Icons.warning, color: _getUrgencyColor(need.urgency, context))),
                          title: Text(need.title),
                          subtitle: Text('Category: ${need.category} · Status: ${need.status}'),
                        ),
                      );
                    },
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Color _getUrgencyColor(String urgency, BuildContext context) {
    if (urgency.toLowerCase() == 'critical') return Theme.of(context).colorScheme.error;
    if (urgency.toLowerCase() == 'high') return Colors.orange;
    return Colors.amber;
  }

  Widget _buildStatCard(BuildContext context, String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Card(
        color: color.withValues(alpha: 0.1),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 16),
              Text(
                value,
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: color, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
