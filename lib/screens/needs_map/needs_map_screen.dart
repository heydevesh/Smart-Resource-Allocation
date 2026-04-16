import 'package:flutter/material.dart';

class NeedsMapScreen extends StatelessWidget {
  const NeedsMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Community Needs Map'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.map, size: 64, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 16),
            const Text('Google Maps Integration Pending...'),
            const SizedBox(height: 8),
            const Text('Map will display geographically identified community gaps.'),
          ],
        ),
      ),
    );
  }
}
