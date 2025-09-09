import { users, verificationCodes, userSessions } from '@/db/schema';

// أنواع المستخدمين
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserRole = 'admin' | 'employee';

export type UserWithoutPassword = Omit<User, 'password'>;

// أنواع رموز التحقق
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type NewVerificationCode = typeof verificationCodes.$inferInsert;

export type VerificationType = 'login' | 'password_reset';

// أنواع الجلسات
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;

// أنواع النماذج
export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface VerifyCodeData {
  userId: string;
  code: string;
  type: VerificationType;
}

export interface ResetPasswordData {
  userId: string;
  code: string;
  newPassword: string;
}