import { UserWithoutPassword, UserRole } from './user';

// نتائج المصادقة
export interface AuthResult {
  success: boolean;
  message: string;
  user?: UserWithoutPassword;
  requiresVerification?: boolean;
  sessionToken?: string;
}

// بيانات الجلسة
export interface SessionData {
  userId: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  sessionToken: string;
  expiresAt: Date;
}

// نتائج العمليات
export interface ActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// صلاحيات الصفحات
export interface PagePermissions {
  dashboard: boolean;
  customers: boolean;
  suppliers: boolean;
  reports: boolean;
  users: boolean;
  settings: boolean;
  support: boolean;
}

// الصفحات المسموحة حسب الدور
export const ROLE_PERMISSIONS: Record<UserRole, PagePermissions> = {
  admin: {
    dashboard: true,
    customers: true,
    suppliers: true,
    reports: true,
    users: true,
    settings: true,
    support: true,
  },
  employee: {
    dashboard: true,
    customers: true,
    suppliers: true,
    reports: false,
    users: false,
    settings: false,
    support: false,
  },
};

// مسارات الصفحات
export const PAGE_ROUTES = {
  dashboard: '/dashboard',
  customers: '/dashboard/customers',
  suppliers: '/dashboard/suppliers',
  reports: '/dashboard/reports',
  users: '/dashboard/users',
  settings: '/dashboard/settings',
  support: '/dashboard/support',
} as const;