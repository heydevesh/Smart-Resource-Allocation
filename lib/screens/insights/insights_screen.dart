import 'package:flutter/material.dart';

class InsightsScreen extends StatelessWidget {
  const InsightsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Insights & Reports'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.auto_awesome, color: Colors.deepPurple),
                        SizedBox(width: 8),
                        Text('Gemini Prediction', style: TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    SizedBox(height: 16),
                    Text('Based on recent trends, there will likely be an increase in medicine requirements in the North District over the next 48 hours.'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text('Completion Rates', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 16),
            Container(
              height: 200,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Center(child: Text('Chart Placeholder')),
            ),
          ],
        ),
      ),
    );
  }
}
