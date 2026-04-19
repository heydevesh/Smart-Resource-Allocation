import { Timestamp } from '@angular/fire/firestore';

export interface Need {
  id: string;
  title: string;
  category: "food" | "medical" | "education" | "shelter" | "water" | "other";
  urgency: "low" | "medium" | "high" | "critical";
  lat: number;
  lng: number;
  locationName: string;
  reportedAt: Timestamp;
  reportedBy: string;
  status: "open" | "assigned" | "in_progress" | "resolved" | "dismissed";
  assignedVolunteers: string[];
  photoUrl?: string;
  description: string;
  summary?: string;
  descriptionHindi?: string;
  embedding?: number[];
}
