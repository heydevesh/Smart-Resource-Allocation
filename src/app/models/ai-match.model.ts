export interface VolunteerMatch {
  volunteerId: string;
  reason: string;
  confidenceScore: number;
  estimatedArrival: string;
  skillMatchTags: string[];
}

export interface WeeklyStats {
  week: string;
  tasksCompleted: number;
  criticalNeedsResolved: number;
  volunteersActive: number;
  topCategories: string[];
}

export interface SurgePrediction {
  category: string;
  predictedCount: number;
  confidence: number;
  week: string;
  reasoning: string;
}
