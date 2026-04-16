import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/volunteer_model.dart';

class VolunteersScreen extends StatefulWidget {
  const VolunteersScreen({super.key});

  @override
  State<VolunteersScreen> createState() => _VolunteersScreenState();
}

class _VolunteersScreenState extends State<VolunteersScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<VolunteerModel>> _volunteersFuture;

  @override
  void initState() {
    super.initState();
    _volunteersFuture = _apiService.getVolunteers();
  }

  void _triggerSmartMatch() async {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Triggering Gemini API Smart Match...')));
    try {
      final result = await _apiService.getSmartMatch("test_task_1", "Need someone for heavy lifting logistics in the afternoon.");
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Smart Match AI Result'),
            content: Text(result),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close'))
            ],
          )
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Volunteer Roster (Live from API)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.wb_incandescent),
            tooltip: 'Smart Match',
            onPressed: _triggerSmartMatch,
          ),
        ],
      ),
      body: FutureBuilder<List<VolunteerModel>>(
        future: _volunteersFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No volunteers found'));
          }

          final volunteers = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(16.0),
            itemCount: volunteers.length,
            itemBuilder: (context, index) {
              final volunteer = volunteers[index];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(child: Text(volunteer.name.substring(0, 1))),
                  title: Text(volunteer.name),
                  subtitle: Text('Available: ${volunteer.availabilitySchedule} · Skills: ${volunteer.skills.join(', ')}'),
                  trailing: ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Successfully assigned ${volunteer.name} to the active task!'))
                      );
                    },
                    child: const Text('Assign'),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

