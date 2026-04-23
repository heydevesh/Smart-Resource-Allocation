export type UserRole = 'applicant' | 'volunteer' | 'field_lead' | 'ngo_admin' | 'ngo_founder' | 'super_admin';

export type Permission = 
  | 'view_home'
  | 'view_map'
  | 'view_tasks'
  | 'create_task'
  | 'create_need'
  | 'assign_task'
  | 'update_own_task'
  | 'update_team_task'
  | 'view_own_profile'
  | 'update_own_profile'
  | 'view_team_profiles'
  | 'view_all_volunteers'
  | 'approve_volunteer'
  | 'promote_volunteer'
  | 'view_insights_own'
  | 'view_insights_team'
  | 'view_insights_ngo'
  | 'view_registry'
  | 'manage_registry'
  | 'view_inventory'
  | 'request_inventory'
  | 'manage_inventory'
  | 'manage_ngo_settings'
  | 'manage_platform_settings'
  | 'view_application_status';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions?: Permission[];
  region?: string;
  photoURL?: string;
  verificationStatus?: 'pending' | 'shortlisted' | 'rejected' | 'approved';
  phone?: string;
  skills?: string[];
  idProofUrl?: string;
  availability?: string;

  // Registration & KYC fields
  aadhaarNumber?: string;
  faceVerified?: boolean;
  facePhotoUrl?: string;
  faceMatchConfidence?: number;
  ocrConfidence?: number;
  languages?: string[];
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  ngoAffiliation?: string;
  ngoName?: string;
  ngoEmail?: string;
  ngoRegistrationNumber?: string;
  ngoLogoUrl?: string;
  registrationCompletedAt?: any; // Firestore Timestamp
  isRegistered?: boolean;
  fcmToken?: string;
  ngoId?: string;
}

