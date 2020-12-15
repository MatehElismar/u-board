export interface User {
  uid?: string;
  role?: Role;
  email: string;
  photoURL?: string;
  displayName?: string;
  disabled?: boolean;
  country?: string;
  cellphone?: string;
}

export type Role = "root" | "admin" | "student";
