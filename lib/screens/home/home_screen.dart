import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
      ),
      body: SingleChildScrollView(
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
                _buildStatCard(context, 'Active Needs', '12', Icons.report_problem, Theme.of(context).colorScheme.error),
                const SizedBox(width: 16),
                _buildStatCard(context, 'Volunteers Online', '48', Icons.people, Theme.of(context).colorScheme.primary),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'Recent Activities',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 3,
              itemBuilder: (context, index) {
                return Card(
                  child: ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.check)),
                    title: Text('Medical Supply Delivered - Dharavi'),
                    subtitle: Text('2 hours ago'),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Card(
        color: color.withOpacity(0.1),
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
