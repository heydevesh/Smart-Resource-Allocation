import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/app_theme.dart';
import 'services/firebase_service.dart';
import 'screens/home/home_screen.dart';
import 'screens/needs_map/needs_map_screen.dart';
import 'screens/tasks/tasks_screen.dart';
import 'screens/volunteers/volunteers_screen.dart';
import 'screens/insights/insights_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await FirebaseService().initialize();

  runApp(
    const ProviderScope(
      child: SahaayApp(),
    ),
  );
}

class SahaayApp extends StatelessWidget {
  const SahaayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Sahaay',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: _appRouter,
    );
  }
}

final GoRouter _appRouter = GoRouter(
  initialLocation: '/home',
  routes: [
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(
          path: '/home',
          pageBuilder: (context, state) => const NoTransitionPage(child: HomeScreen()),
        ),
        GoRoute(
          path: '/needs-map',
          pageBuilder: (context, state) => const NoTransitionPage(child: NeedsMapScreen()),
        ),
        GoRoute(
          path: '/tasks',
          pageBuilder: (context, state) => const NoTransitionPage(child: TasksScreen()),
        ),
        GoRoute(
          path: '/volunteers',
          pageBuilder: (context, state) => const NoTransitionPage(child: VolunteersScreen()),
        ),
        GoRoute(
          path: '/insights',
          pageBuilder: (context, state) => const NoTransitionPage(child: InsightsScreen()),
        ),
      ],
    ),
  ],
);

class MainShell extends StatefulWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
          switch (index) {
            case 0:
              context.go('/home');
              break;
            case 1:
              context.go('/needs-map');
              break;
            case 2:
              context.go('/tasks');
              break;
            case 3:
              context.go('/volunteers');
              break;
            case 4:
              context.go('/insights');
              break;
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map),
            label: 'Map',
          ),
          NavigationDestination(
            icon: Icon(Icons.task_alt),
            selectedIcon: Icon(Icons.task),
            label: 'Tasks',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people),
            label: 'Volunteers',
          ),
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            selectedIcon: Icon(Icons.analytics),
            label: 'Insights',
          ),
        ],
      ),
    );
  }
}
