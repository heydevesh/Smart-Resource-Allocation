import { Timestamp } from '@angular/fire/firestore';

export type NgoStatus = 'pending_review' | 'active' | 'suspended' | 'deactivated';
export type NgoTier = 'grassroots' | 'district' | 'state' | 'national';

export interface NgoContact {
  name: string;
  email: string;
  phone: string;
  designation: string;
}

export interface NgoAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface NgoDocument {
  type: '12A' | '80G' | 'FCRA' | 'registration_certificate' | 'pan_card' | 'other';
  url: string;
  fileName: string;
  uploadedAt: Timestamp | Date;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Timestamp | Date;
}

export interface Ngo {
  id: string;
  name: string;
  registrationNumber: string;
  status: NgoStatus;
  tier: NgoTier;
  foundedYear: number;
  
  // Focus areas
  focusAreas: ('food' | 'medical' | 'education' | 'shelter' | 'water' | 'livelihood' | 'disaster_relief' | 'other')[];
  sdgGoals: number[]; // SDG goal numbers 1-17
  
  // Contact & Location
  primaryContact: NgoContact;
  secondaryContact?: NgoContact;
  address: NgoAddress;
  operatingRegions: string[]; // e.g., ['Dharavi', 'Kurla', 'Govandi']
  
  // Branding
  logoUrl?: string;
  website?: string;
  description: string;
  
  // Legal documents
  documents: NgoDocument[];
  
  // Platform metadata
  founderId: string; // UID of the user (ngo_founder/ngo_admin) who created the org
  memberIds: string[]; // UIDs of all members
  volunteerCount: number;
  activeMissionCount: number;
  totalMissionsCompleted: number;
  
  // Timestamps
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  approvedAt?: Timestamp | Date;
  approvedBy?: string;
  
  // Metrics
  impactScore?: number; // 0-100, computed from completed missions & volunteer hours
  responseTimeAvg?: number; // avg minutes to first response
}

export interface NgoMembership {
  ngoId: string;
  userId: string;
  role: 'founder' | 'admin' | 'coordinator' | 'member';
  joinedAt: Timestamp | Date;
  invitedBy?: string;
  isActive: boolean;
}
