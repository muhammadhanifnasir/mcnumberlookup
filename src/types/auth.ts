export type UserRole = "admin" | "dispatcher";

export type AppSession = {
  userId: string;
  email: string;
  role?: UserRole;
  fullName?: string;
  companyName?: string;
};
