import { db } from '@/db/drizzle'
import { userSessions, users } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import type { SessionData } from '@/types/auth'

// إنشاء رمز تحقق عشوائي (6 أرقام)
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// إنشاء token للجلسة
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

// إنشاء جلسة جديدة
export async function createSession(userId: string): Promise<string> {
  const sessionToken = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 أيام

  await db.insert(userSessions).values({
    userId,
    sessionToken,
    expiresAt,
  })

  return sessionToken
}

// التحقق من صحة الجلسة
export async function verifySession(sessionToken: string): Promise<SessionData | null> {
  try {
    const session = await db
      .select({
        session: userSessions,
        user: {
          id: users.id,
          email: users.email,
          username: users.username,
          fullName: users.fullName,
          role: users.role,
          isActive: users.isActive,
        }
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          eq(users.isActive, true)
        )
      )
      .limit(1)

    if (session.length === 0) {
      return null
    }

    const { session: sessionData, user } = session[0]

    // التحقق من انتهاء صلاحية الجلسة
    if (new Date() > sessionData.expiresAt) {
      // حذف الجلسة المنتهية الصلاحية
      await db
        .delete(userSessions)
        .where(eq(userSessions.sessionToken, sessionToken))
      
      return null
    }

    // تحديث آخر نشاط
    await db
      .update(userSessions)
      .set({ lastActivity: new Date() })
      .where(eq(userSessions.sessionToken, sessionToken))

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      sessionToken,
      expiresAt: sessionData.expiresAt,
    }
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

// حذف الجلسات المنتهية الصلاحية
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await db
      .delete(userSessions)
      .where(eq(userSessions.expiresAt, new Date()))
  } catch (error) {
    console.error('Session cleanup error:', error)
  }
}

// حذف جميع جلسات المستخدم (عند تغيير كلمة المرور مثلاً)
export async function revokeUserSessions(userId: string): Promise<void> {
  try {
    await db
      .delete(userSessions)
      .where(eq(userSessions.userId, userId))
  } catch (error) {
    console.error('Session revocation error:', error)
  }
}