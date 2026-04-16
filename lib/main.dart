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
import 'screens/auth/login_screen.dart';
import 'providers/auth_provider.dart';

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
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
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

class _NavItem {
  final String path;
  final IconData icon;
  final IconData selIcon;
  final String label;
  const _NavItem({required this.path, required this.icon, required this.selIcon, required this.label});
}

class MainShell extends ConsumerStatefulWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final userModelAsync = ref.watch(userRoleProvider);
    final isAdmin = userModelAsync.valueOrNull?.role == 'admin';

    final navItems = [
      const _NavItem(path: '/home', icon: Icons.dashboard_outlined, selIcon: Icons.dashboard, label: 'Home'),
      const _NavItem(path: '/needs-map', icon: Icons.map_outlined, selIcon: Icons.map, label: 'Map'),
      const _NavItem(path: '/tasks', icon: Icons.task_alt, selIcon: Icons.task, label: 'Tasks'),
      const _NavItem(path: '/volunteers', icon: Icons.people_outline, selIcon: Icons.people, label: 'Volunteers'),
      if (isAdmin)
        const _NavItem(path: '/insights', icon: Icons.analytics_outlined, selIcon: Icons.analytics, label: 'Admin'),
    ];

    if (_selectedIndex >= navItems.length) {
      _selectedIndex = 0;
    }

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
          context.go(navItems[index].path);
        },
        destinations: navItems.map((item) => NavigationDestination(
          icon: Icon(item.icon),
          selectedIcon: Icon(item.selIcon),
          label: item.label,
        )).toList(),
      ),
    );
  }
}
