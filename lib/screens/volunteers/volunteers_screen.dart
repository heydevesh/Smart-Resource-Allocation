import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../services/api_service.dart';
import '../../services/firebase_service.dart';
import '../../models/task_model.dart';
import '../../models/volunteer_model.dart';

class VolunteersScreen extends StatefulWidget {
  const VolunteersScreen({super.key});

  @override
  State<VolunteersScreen> createState() => _VolunteersScreenState();
}

class _VolunteersScreenState extends State<VolunteersScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<VolunteerModel>> _volunteersFuture;
  final Map<String, String> _demoVolunteerTaskAssignments = {};

  @override
  void initState() {
    super.initState();
    _volunteersFuture = _apiService.getVolunteers();
  }

  Future<void> _refreshVolunteers() async {
    setState(() {
      _volunteersFuture = _apiService.getVolunteers();
    });
    await _volunteersFuture;
  }

  void _triggerSmartMatch() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Triggering Gemini API Smart Match...')),
    );
    try {
      final tasks = await _apiService.getTasks();
      TaskModel? targetTask;
      for (final task in tasks) {
        if (task.status == 'active' || task.status == 'pending') {
          targetTask = task;
          break;
        }
      }

      final taskId = targetTask?.id ?? 'test_task_1';
      final taskDescription = targetTask != null
          ? '${targetTask.title} in category ${targetTask.category} with ${targetTask.priority} priority.'
          : 'Need someone for heavy lifting logistics in the afternoon.';

      final result = await _apiService.getSmartMatch(taskId, taskDescription);
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Smart Match AI Result'),
            content: Text(result),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Close'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _assignVolunteerToTask(VolunteerModel volunteer) async {
    try {
      final tasks = await _apiService.getTasks();
      final assignableTasks = tasks
          .where((task) => task.status == 'active' || task.status == 'pending')
          .toList();

      if (!mounted) return;

      if (assignableTasks.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'No active or pending tasks available for assignment.',
            ),
          ),
        );
        return;
      }

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text('Assign ${volunteer.name}'),
          content: SizedBox(
            width: 360,
            height: 320,
            child: ListView.builder(
              itemCount: assignableTasks.length,
              itemBuilder: (context, index) {
                final task = assignableTasks[index];
                return ListTile(
                  title: Text(task.title),
                  subtitle: Text(
                    '${task.category} · ${task.priority.toUpperCase()}',
                  ),
                  trailing: TextButton(
                    onPressed: () => _confirmTaskAssignment(volunteer, task),
                    child: const Text('Assign'),
                  ),
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _confirmTaskAssignment(
    VolunteerModel volunteer,
    TaskModel task,
  ) async {
    try {
      if (!FirebaseService().isDemoMode) {
        await FirebaseFirestore.instance
            .collection('tasks')
            .doc(task.id)
            .update({
              'volunteerIds': FieldValue.arrayUnion([volunteer.id]),
            });
      } else {
        setState(() {
          _demoVolunteerTaskAssignments[volunteer.id] = task.title;
        });
      }

      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${volunteer.name} assigned to ${task.title}.')),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
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
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Volunteers',
            onPressed: _refreshVolunteers,
          ),
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
          return RefreshIndicator(
            onRefresh: _refreshVolunteers,
            child: ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: volunteers.length,
              itemBuilder: (context, index) {
                final volunteer = volunteers[index];
                final assignedTask =
                    _demoVolunteerTaskAssignments[volunteer.id];

                return Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      child: Text(volunteer.name.substring(0, 1)),
                    ),
                    title: Text(volunteer.name),
                    subtitle: Text(
                      'Available: ${volunteer.availabilitySchedule} · Skills: ${volunteer.skills.join(', ')}'
                      '${assignedTask != null ? '\nAssigned: $assignedTask' : ''}',
                    ),
                    isThreeLine: assignedTask != null,
                    trailing: ElevatedButton(
                      onPressed: () => _assignVolunteerToTask(volunteer),
                      child: const Text('Assign'),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
