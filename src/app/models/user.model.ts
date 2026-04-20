export type UserRole = "volunteer" | "fieldworker" | "admin" | "superadmin";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  region?: string;
  photoURL?: string;
}
