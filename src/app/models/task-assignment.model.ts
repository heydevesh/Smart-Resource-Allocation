import { Timestamp } from '@angular/fire/firestore';

export type TaskAssignmentStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface TaskAssignment {
  id: string;
  taskId: string;
  volunteerId: string;
  status: TaskAssignmentStatus;
  requestedBy: string;
  requestedAt: Timestamp | Date;
  respondedAt?: Timestamp | Date;
  region?: string;
}
