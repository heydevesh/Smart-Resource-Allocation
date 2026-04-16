import 'package:flutter/material.dart';

class VolunteersScreen extends StatelessWidget {
  const VolunteersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Volunteer Roster'),
        actions: [
          IconButton(
            icon: const Icon(Icons.wb_incandescent),
            tooltip: 'Smart Match',
            onPressed: () {
              // Gemini API Smart Match invocation
            },
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: 8,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: CircleAvatar(child: Text('V${index + 1}')),
              title: Text('Volunteer ${index + 1}'),
              subtitle: const Text('Available · Skills: First Aid, Teaching'),
              trailing: ElevatedButton(
                onPressed: () {},
                child: const Text('Assign'),
              ),
            ),
          );
        },
      ),
    );
  }
}
