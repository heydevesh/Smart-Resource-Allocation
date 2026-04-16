import 'package:flutter/material.dart';

class TasksScreen extends StatelessWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
        body: TabBarView(
          children: [
            _buildTaskList('Active Tasks'),
            _buildTaskList('Pending Tasks'),
            _buildTaskList('Completed Tasks'),
            _buildTaskList('Escalated Tasks'),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskList(String tabName) {
    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Card(
          child: ListTile(
            title: Text('Sample Task #$index'),
            subtitle: Text('Category: Health | Priority: High'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
          ),
        );
      },
    );
  }
}
