import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../services/api_service.dart';
import '../../services/firebase_service.dart';
import '../../models/task_model.dart';
import '../../models/volunteer_model.dart';
import '../../providers/auth_provider.dart';

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});

  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<TaskModel>> _tasksFuture;
  final List<TaskModel> _demoCreatedTasks = [];
  final Map<String, String> _demoStatusOverrides = {};
  final Map<String, Set<String>> _demoVolunteerAssignments = {};

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
    String selectedPriority = 'high';
    String selectedStatus = 'active';

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Create New Task (Admin)'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: titleController,
                      decoration: const InputDecoration(
                        labelText: 'Task Title',
                      ),
                    ),
                    TextField(
                      controller: categoryController,
                      decoration: const InputDecoration(
                        labelText: 'Category (Health, Logistics, etc.)',
                      ),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: selectedPriority,
                      decoration: const InputDecoration(labelText: 'Priority'),
                      items: const [
                        DropdownMenuItem(value: 'low', child: Text('Low')),
                        DropdownMenuItem(
                          value: 'medium',
                          child: Text('Medium'),
                        ),
                        DropdownMenuItem(value: 'high', child: Text('High')),
                        DropdownMenuItem(
                          value: 'critical',
                          child: Text('Critical'),
                        ),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setDialogState(() => selectedPriority = value);
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: selectedStatus,
                      decoration: const InputDecoration(
                        labelText: 'Initial Status',
                      ),
                      items: const [
                        DropdownMenuItem(
                          value: 'active',
                          child: Text('Active'),
                        ),
                        DropdownMenuItem(
                          value: 'pending',
                          child: Text('Pending'),
                        ),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setDialogState(() => selectedStatus = value);
                        }
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (titleController.text.trim().isEmpty) {
                      return;
                    }

                    final navigator = Navigator.of(context);
                    final messenger = ScaffoldMessenger.of(context);

                    try {
                      if (!FirebaseService().isDemoMode) {
                        await FirebaseFirestore.instance
                            .collection('tasks')
                            .add({
                              'title': titleController.text.trim(),
                              'category': categoryController.text.trim().isEmpty
                                  ? 'General'
                                  : categoryController.text.trim(),
                              'priority': selectedPriority,
                              'status': selectedStatus,
                              'progress': 0,
                              'volunteerIds': [],
                              'dueAt': DateTime.now().add(
                                const Duration(days: 1),
                              ),
                            });
                      } else {
                        setState(() {
                          _demoCreatedTasks.add(
                            TaskModel(
                              id: 'demo_task_${DateTime.now().millisecondsSinceEpoch}',
                              title: titleController.text.trim(),
                              priority: selectedPriority,
                              volunteerIds: const [],
                              status: selectedStatus,
                              progress: 0,
                              dueAt: DateTime.now().add(
                                const Duration(days: 1),
                              ),
                              category: categoryController.text.trim().isEmpty
                                  ? 'General'
                                  : categoryController.text.trim(),
                            ),
                          );
                        });
                      }
                      if (!mounted) return;
                      navigator.pop();
                      _refreshTasks();
                      messenger.showSnackBar(
                        const SnackBar(
                          content: Text('Task created successfully.'),
                        ),
                      );
                    } catch (e) {
                      if (!mounted) return;
                      messenger.showSnackBar(
                        SnackBar(content: Text('Error: $e')),
                      );
                    }
                  },
                  child: const Text('Create'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _updateTaskStatus(String taskId, String status) async {
    try {
      if (!FirebaseService().isDemoMode) {
        await FirebaseFirestore.instance.collection('tasks').doc(taskId).update(
          {'status': status},
        );
      } else {
        setState(() {
          _demoStatusOverrides[taskId] = status;
        });
      }

      if (mounted) {
        _refreshTasks();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Task moved to ${status.toUpperCase()}')),
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

  Future<void> _assignVolunteer(String taskId) async {
    try {
      final volunteers = await _apiService.getVolunteers();
      if (!mounted) return;

      if (volunteers.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No volunteers available to assign.')),
        );
        return;
      }

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Assign Volunteer'),
          content: SizedBox(
            width: 360,
            height: 320,
            child: ListView.builder(
              itemCount: volunteers.length,
              itemBuilder: (context, index) {
                final volunteer = volunteers[index];
                return ListTile(
                  leading: CircleAvatar(
                    child: Text(
                      volunteer.name.isNotEmpty
                          ? volunteer.name[0].toUpperCase()
                          : '?',
                    ),
                  ),
                  title: Text(volunteer.name),
                  subtitle: Text(volunteer.skills.join(', ')),
                  trailing: TextButton(
                    onPressed: () => _confirmAssignVolunteer(taskId, volunteer),
                    child: const Text('Assign'),
                  ),
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
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

  Future<void> _confirmAssignVolunteer(
    String taskId,
    VolunteerModel volunteer,
  ) async {
    try {
      if (!FirebaseService().isDemoMode) {
        await FirebaseFirestore.instance.collection('tasks').doc(taskId).update(
          {
            'volunteerIds': FieldValue.arrayUnion([volunteer.id]),
          },
        );
      } else {
        setState(() {
          _demoVolunteerAssignments
              .putIfAbsent(taskId, () => <String>{})
              .add(volunteer.id);
        });
      }

      if (!mounted) return;
      Navigator.of(context).pop();
      _refreshTasks();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${volunteer.name} assigned successfully.')),
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

            final fromApiTasks = snapshot.data ?? [];
            final allTasks = FirebaseService().isDemoMode
                ? [...fromApiTasks, ..._demoCreatedTasks]
                : fromApiTasks;

            final hydratedTasks = allTasks.map((task) {
              if (!FirebaseService().isDemoMode) {
                return task;
              }

              final status = _demoStatusOverrides[task.id] ?? task.status;
              final localAssignments =
                  _demoVolunteerAssignments[task.id] ?? <String>{};
              final volunteerIds = <String>{
                ...task.volunteerIds,
                ...localAssignments,
              }.toList();

              return TaskModel(
                id: task.id,
                title: task.title,
                priority: task.priority,
                volunteerIds: volunteerIds,
                status: status,
                progress: task.progress,
                dueAt: task.dueAt,
                category: task.category,
              );
            }).toList();

            final activeTasks = hydratedTasks
                .where((t) => t.status == 'active')
                .toList();
            final pendingTasks = hydratedTasks
                .where((t) => t.status == 'pending')
                .toList();
            final completedTasks = hydratedTasks
                .where((t) => t.status == 'completed')
                .toList();
            final escalatedTasks = hydratedTasks
                .where((t) => t.status == 'escalated')
                .toList();

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
        floatingActionButton: isAdmin
            ? FloatingActionButton(
                onPressed: _showCreateTaskDialog,
                tooltip: 'Create Task',
                child: const Icon(Icons.add),
              )
            : null,
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
            subtitle: Text(
              'Category: ${task.category} | Priority: ${task.priority.toUpperCase()}\n'
              'Assigned Volunteers: ${task.volunteerIds.length}',
            ),
            isThreeLine: true,
            trailing: isAdmin
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.person_add),
                        onPressed: () => _assignVolunteer(task.id),
                        tooltip: 'Assign Volunteer',
                      ),
                      PopupMenuButton<String>(
                        tooltip: 'Update Status',
                        onSelected: (value) =>
                            _updateTaskStatus(task.id, value),
                        itemBuilder: (context) => const [
                          PopupMenuItem(
                            value: 'active',
                            child: Text('Mark Active'),
                          ),
                          PopupMenuItem(
                            value: 'pending',
                            child: Text('Mark Pending'),
                          ),
                          PopupMenuItem(
                            value: 'completed',
                            child: Text('Mark Completed'),
                          ),
                          PopupMenuItem(
                            value: 'escalated',
                            child: Text('Mark Escalated'),
                          ),
                        ],
                        child: const Icon(Icons.more_vert),
                      ),
                    ],
                  )
                : const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => _showTaskDetails(task, isAdmin),
          ),
        );
      },
    );
  }

  void _showTaskDetails(TaskModel task, bool isAdmin) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(task.title, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text('Category: ${task.category}'),
              Text('Priority: ${task.priority.toUpperCase()}'),
              Text('Status: ${task.status.toUpperCase()}'),
              Text('Due: ${task.dueAt.toLocal()}'),
              Text('Assigned Volunteers: ${task.volunteerIds.length}'),
              const SizedBox(height: 16),
              if (isAdmin)
                Wrap(
                  spacing: 8,
                  children: [
                    FilledButton.tonal(
                      onPressed: () {
                        Navigator.pop(context);
                        _updateTaskStatus(task.id, 'pending');
                      },
                      child: const Text('Move to Pending'),
                    ),
                    FilledButton.tonal(
                      onPressed: () {
                        Navigator.pop(context);
                        _updateTaskStatus(task.id, 'active');
                      },
                      child: const Text('Move to Active'),
                    ),
                    FilledButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _updateTaskStatus(task.id, 'completed');
                      },
                      child: const Text('Mark Completed'),
                    ),
                  ],
                ),
            ],
          ),
        );
      },
    );
  }
}
