import { Timestamp } from '@angular/fire/firestore';
import { Need } from './need.model';

export interface Task {
  id: string;
  title: string;
  needId?: string;
  category: Need["category"];
  priority: Need["urgency"];
  volunteerIds: string[];
  status: "pending" | "active" | "completed" | "escalated";
  progress: number;
  dueAt: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  recurring: boolean;
  frequency?: "daily" | "weekly";
  attachmentUrls: string[];
  description: string;
  locationLat: number;
  locationLng: number;
  locationName: string;
}
