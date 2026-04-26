import { Timestamp } from '@angular/fire/firestore';

export interface ContactCard {
  name: string;
  phone?: string;
  whatsapp?: string;
}

export interface TaskContact {
  id: string; // taskId
  taskId: string;
  primary: ContactCard;
  fallback?: ContactCard;
  createdBy: string;
  createdAt: Timestamp | Date;
  region?: string;
}
