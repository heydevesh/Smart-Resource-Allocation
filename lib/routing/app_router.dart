import 'package:go_router/go_router.dart';
import '../screens/home/home_screen.dart';
import '../screens/needs_map/needs_map_screen.dart';
import '../screens/tasks/tasks_screen.dart';
import '../screens/volunteers/volunteers_screen.dart';
import '../screens/insights/insights_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/home',
    routes: [
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/needs-map',
        builder: (context, state) => const NeedsMapScreen(),
      ),
      GoRoute(
        path: '/tasks',
        builder: (context, state) => const TasksScreen(),
      ),
      GoRoute(
        path: '/volunteers',
        builder: (context, state) => const VolunteersScreen(),
      ),
      GoRoute(
        path: '/insights',
        builder: (context, state) => const InsightsScreen(),
      ),
    ],
  );
}
