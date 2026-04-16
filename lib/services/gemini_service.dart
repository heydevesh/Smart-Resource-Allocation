import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/volunteer.dart';
import '../models/task.dart';
import '../core/app_constants.dart';

class GeminiService {
  // IMPORTANT: Set your API key in environment or pass it during initialization
  // DO NOT hardcode API keys in source code
  final String apiKey;
  late final GenerativeModel _model;

  GeminiService({required this.apiKey}) {
    _model = GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: apiKey,
      systemInstruction: Content.system(AppConstants.geminiSystemInstruction),
    );
  }

  /// Get AI-powered volunteer recommendations for a task
  Future<List<Volunteer>> getSmartMatchRecommendations({
    required Task task,
    required List<Volunteer> availableVolunteers,
  }) async {
    try {
      final prompt = '''
Task Details:
- Title: ${task.title}
- Category: ${task.category}
- Priority: ${task.priority}
- Description: ${task.description}

Available Volunteers:
${availableVolunteers.map((v) => '- ${v.name}: Skills: ${v.skills.join(", ")}, Workload: ${v.workload} tasks, Available: ${v.isAvailable ? "Yes" : "No"}').join('\n')}

Based on the task requirements and volunteer profiles, recommend the top 3 volunteers best suited for this task.
Consider:
1. Skills match with task category
2. Current workload (prefer volunteers with fewer active tasks)
3. Availability status
4. Past experience (tasks completed)

Return ONLY the volunteer IDs in order of recommendation, one per line.
''';

      final response = await _model.generateContent([Content.text(prompt)]);
      final responseText = response.text ?? '';
      final recommendedIds = responseText
          .trim()
          .split('\n')
          .where((line) => line.isNotEmpty)
          .take(3)
          .toList();

      // Map recommended IDs back to volunteer objects
      final recommendedVolunteers = recommendedIds
          .map((id) => availableVolunteers.where((v) => v.id == id).firstOrNull)
          .whereType<Volunteer>()
          .toList();

      return recommendedVolunteers;
    } catch (e) {
      print('Gemini API error: $e');
      // Fallback: return first 3 available volunteers
      return availableVolunteers.take(3).toList();
    }
  }

  /// Get AI summary of needs patterns
  Future<String> generateInsightsSummary({
    required int totalNeeds,
    required int resolvedNeeds,
    required Map<String, int> categoryBreakdown,
    required String topUrgentArea,
  }) async {
    try {
      final prompt = '''
NGO Resource Allocation Data Summary:
- Total Needs Reported: $totalNeeds
- Needs Resolved: $resolvedNeeds
- Resolution Rate: ${((resolvedNeeds / totalNeeds) * 100).toStringAsFixed(1)}%

Category Breakdown:
${categoryBreakdown.entries.map((e) => '- ${e.key}: ${e.value}').join('\n')}

Top Urgent Area: $topUrgentArea

Provide a brief 2-3 sentence insight summary for NGO coordinators. Highlight any patterns or recommendations.
''';

      final response = await _model.generateContent([Content.text(prompt)]);
      return (response.text ?? '').trim();
    } catch (e) {
      print('Gemini API error: $e');
      return 'Resolution rate: ${((resolvedNeeds / totalNeeds) * 100).toStringAsFixed(1)}%. Top priority area: $topUrgentArea.';
    }
  }
}
