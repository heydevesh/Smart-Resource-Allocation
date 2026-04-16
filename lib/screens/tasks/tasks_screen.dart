import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../services/api_service.dart';
import '../../services/firebase_service.dart';
import '../../models/task_model.dart';
import '../../providers/auth_provider.dart';

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});

  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<TaskModel>> _tasksFuture;

  @override
  void initState() {
    super.initState();
    _refreshTasks();
  }

  void _refreshTasks() {
    setState(() {
      _tasksFuture = _apiService.getTasks();
    });
  }

  void _showCreateTaskDialog() {
    final titleController = TextEditingController();
    final categoryController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Create New Task (Admin)'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(labelText: 'Task Title'),
              ),
              TextField(
                controller: categoryController,
                decoration: const InputDecoration(labelText: 'Category (Health, Logistics, etc.)'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (titleController.text.isEmpty) return;
                
                try {
                  if (!FirebaseService().isDemoMode) {
                    await FirebaseFirestore.instance.collection('tasks').add({
                      'title': titleController.text,
                      'category': categoryController.text,
                      'priority': 'high',
                      'status': 'active',
                      'progress': 0,
                      'volunteerIds': [],
                      'dueAt': DateTime.now().add(const Duration(days: 1)),
                    });
                  }
                  if (mounted) {
                    Navigator.pop(context);
                    _refreshTasks();
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Task Created')));
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                }
              },
              child: const Text('Create'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final userRoleAsync = ref.watch(userRoleProvider);
    final bool isAdmin = userRoleAsync.value?.role == 'admin';

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Tasks Overview'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Active'),
              Tab(text: 'Pending'),
              Tab(text: 'Completed'),
              Tab(text: 'Escalated'),
            ],
          ),
        ),
        body: FutureBuilder<List<TaskModel>>(
          future: _tasksFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(child: Text('Error: ${snapshot.error}'));
            }

            final allTasks = snapshot.data ?? [];
            final activeTasks = allTasks.where((t) => t.status == 'active').toList();
            final pendingTasks = allTasks.where((t) => t.status == 'pending').toList();
            final completedTasks = allTasks.where((t) => t.status == 'completed').toList();
            final escalatedTasks = allTasks.where((t) => t.status == 'escalated').toList();

            return TabBarView(
              children: [
                _buildTaskList(activeTasks, isAdmin),
                _buildTaskList(pendingTasks, isAdmin),
                _buildTaskList(completedTasks, isAdmin),
                _buildTaskList(escalatedTasks, isAdmin),
              ],
            );
          },
        ),
        floatingActionButton: isAdmin ? FloatingActionButton(
          onPressed: _showCreateTaskDialog,
          child: const Icon(Icons.add),
          tooltip: 'Create Task',
        ) : null,
      ),
    );
  }

  Widget _buildTaskList(List<TaskModel> tasks, bool isAdmin) {
    if (tasks.isEmpty) {
      return const Center(child: Text('No tasks available in this category.'));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: tasks.length,
      itemBuilder: (context, index) {
        final task = tasks[index];
        return Card(
          child: ListTile(
            title: Text(task.title),
            subtitle: Text('Category: ${task.category} | Priority: ${task.priority}'),
            trailing: isAdmin 
                ? IconButton(
                    icon: const Icon(Icons.person_add),
                    onPressed: () => _assignVolunteer(task.id),
                    tooltip: 'Assign Volunteer',
                  )
                : const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Viewing Task: ${task.title}')));
            },
          ),
        );
      },
    );
  }

  void _assignVolunteer(String taskId) {
    // Basic assignment simulation dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Assign Volunteer'),
        content: const Text('In a full implementation, you would pick from a list.'),
        actions: [
          ElevatedButton(
            onPressed: () async {
               if(!FirebaseService().isDemoMode) {
                  await FirebaseFirestore.instance.collection('tasks').doc(taskId).update({
                     'volunteerIds': FieldValue.arrayUnion(['dummy_volunteer_id'])
                  });
               }
               if(mounted) {
                  Navigator.pop(context);
                  _refreshTasks();
               }
            }, 
            child: const Text('Quick Assign')
          )
        ]
      )
    );
  }
}
