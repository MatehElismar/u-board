export interface User {
  uid?: string;
  role?: Role;
  email: string;
  photoURL?: string;
  displayName?: string;
  disabled?: boolean;
  cellphone?: string;
}

export type Role = "root" | "admin" | "student";
/*  */
