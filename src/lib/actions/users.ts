'use server'

import { db } from '@/db/drizzle'
import { users } from '@/db/schema'
import { eq, and, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import type { CreateUserData, UpdateUserData, UserWithoutPassword } from '@/types/user'
import type { ActionResult } from '@/types/auth'
import { getCurrentSession } from './auth-real'

// التحقق من صلاحيات الأدمن
async function requireAdminAccess(): Promise<ActionResult | null> {
  const session = await getCurrentSession()
  
  if (!session) {
    return {
      success: false,
      message: 'يجب تسجيل الدخول أولاً'
    }
  }

  if (session.role !== 'admin') {
    return {
      success: false,
      message: 'غير مصرح لك بالوصول لهذه الصفحة'
    }
  }

  return null // لا يوجد خطأ
}

// الحصول على جميع المستخدمين
export async function getAllUsers(): Promise<ActionResult<UserWithoutPassword[]>> {
  try {
    const accessError = await requireAdminAccess()
    if (accessError) return accessError

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        createdBy: users.createdBy,
      })
      .from(users)
      .orderBy(users.createdAt)

    return {
      success: true,
      message: 'تم جلب المستخدمين بنجاح',
      data: allUsers
    }
  } catch (error) {
    console.error('Get users error:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء جلب المستخدمين'
    }
  }
}

// إنشاء مستخدم جديد
export async function createUser(data: CreateUserData): Promise<ActionResult<UserWithoutPassword>> {
  try {
    const accessError = await requireAdminAccess()
    if (accessError) return accessError

    const session = await getCurrentSession()

    // التحقق من عدم وجود الإيميل أو اليوزر مسبقاً
    const existingUser = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, data.email),
          eq(users.username, data.username)
        )
      )
      .limit(1)

    if (existingUser.length > 0) {
      const existing = existingUser[0]
      if (existing.email === data.email) {
        return {
          success: false,
          message: 'البريد الإلكتروني مستخدم مسبقاً'
        }
      }
      if (existing.username === data.username) {
        return {
          success: false,
          message: 'اسم المستخدم مستخدم مسبقاً'
        }
      }
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // إنشاء المستخدم الجديد
    const newUser = await db
      .insert(users)
      .values({
        email: data.email,
        username: data.username,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role,
        createdBy: session?.userId,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        createdBy: users.createdBy,
      })

    // إعادة تحديث صفحة المستخدمين
    revalidatePath('/dashboard/users')

    return {
      success: true,
      message: 'تم إنشاء المستخدم بنجاح',
      data: newUser[0]
    }
  } catch (error) {
    console.error('Create user error:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء إنشاء المستخدم'
    }
  }
}

// تحديث مستخدم
export async function updateUser(userId: string, data: UpdateUserData): Promise<ActionResult<UserWithoutPassword>> {
  try {
    const accessError = await requireAdminAccess()
    if (accessError) return accessError

    // التحقق من وجود المستخدم
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (existingUser.length === 0) {
      return {
        success: false,
        message: 'المستخدم غير موجود'
      }
    }

    // التحقق من عدم تضارب الإيميل أو اليوزر (إذا تم تغييرهما)
    if (data.email || data.username) {
      const conflictUser = await db
        .select()
        .from(users)
        .where(
          and(
            or(
              data.email ? eq(users.email, data.email) : undefined,
              data.username ? eq(users.username, data.username) : undefined
            ),
            // استثناء المستخدم الحالي
            eq(users.id, userId) === false
          )
        )
        .limit(1)

      if (conflictUser.length > 0) {
        const conflict = conflictUser[0]
        if (conflict.email === data.email) {
          return {
            success: false,
            message: 'البريد الإلكتروني مستخدم مسبقاً'
          }
        }
        if (conflict.username === data.username) {
          return {
            success: false,
            message: 'اسم المستخدم مستخدم مسبقاً'
          }
        }
      }
    }

    // تحديث المستخدم
    const updatedUser = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        createdBy: users.createdBy,
      })

    // إعادة تحديث صفحة المستخدمين
    revalidatePath('/dashboard/users')

    return {
      success: true,
      message: 'تم تحديث المستخدم بنجاح',
      data: updatedUser[0]
    }
  } catch (error) {
    console.error('Update user error:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء تحديث المستخدم'
    }
  }
}

// حذف مستخدم
export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    const accessError = await requireAdminAccess()
    if (accessError) return accessError

    const session = await getCurrentSession()

    // منع حذف المستخدم لنفسه
    if (session?.userId === userId) {
      return {
        success: false,
        message: 'لا يمكنك حذف حسابك الخاص'
      }
    }

    // التحقق من وجود المستخدم
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (existingUser.length === 0) {
      return {
        success: false,
        message: 'المستخدم غير موجود'
      }
    }

    // حذف المستخدم
    await db
      .delete(users)
      .where(eq(users.id, userId))

    // إعادة تحديث صفحة المستخدمين
    revalidatePath('/dashboard/users')

    return {
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    }
  } catch (error) {
    console.error('Delete user error:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء حذف المستخدم'
    }
  }
}

// تفعيل/إلغاء تفعيل مستخدم
export async function toggleUserStatus(userId: string): Promise<ActionResult<UserWithoutPassword>> {
  try {
    const accessError = await requireAdminAccess()
    if (accessError) return accessError

    const session = await getCurrentSession()

    // منع تعطيل المستخدم لنفسه
    if (session?.userId === userId) {
      return {
        success: false,
        message: 'لا يمكنك تعطيل حسابك الخاص'
      }
    }

    // الحصول على حالة المستخدم الحالية
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (existingUser.length === 0) {
      return {
        success: false,
        message: 'المستخدم غير موجود'
      }
    }

    const currentStatus = existingUser[0].isActive
    const newStatus = !currentStatus

    // تحديث حالة المستخدم
    const updatedUser = await db
      .update(users)
      .set({
        isActive: newStatus,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        createdBy: users.createdBy,
      })

    // إعادة تحديث صفحة المستخدمين
    revalidatePath('/dashboard/users')

    return {
      success: true,
      message: `تم ${newStatus ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`,
      data: updatedUser[0]
    }
  } catch (error) {
    console.error('Toggle user status error:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء تغيير حالة المستخدم'
    }
  }
}