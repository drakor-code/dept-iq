'use server'

// import { db } from '@/db/drizzle'
// import { users, verificationCodes, userSessions } from '@/db/schema'
// import { eq, and, or } from 'drizzle-orm'
// import bcrypt from 'bcryptjs'
// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'
// import type { LoginData, VerifyCodeData, ResetPasswordData } from '@/types/user'
// import type { AuthResult, ActionResult, SessionData } from '@/types/auth'
// import { sendVerificationEmail } from '@/lib/email/sender'
// import { generateVerificationCode, createSession, verifySession } from '@/lib/utils/auth-helpers'

// // تسجيل الدخول
// export async function loginUser(data: LoginData): Promise<AuthResult> {
//   try {
//     // البحث عن المستخدم بالإيميل أو اليوزر
//     const user = await db
//       .select()
//       .from(users)
//       .where(
//         and(
//           or(
//             eq(users.email, data.emailOrUsername),
//             eq(users.username, data.emailOrUsername)
//           ),
//           eq(users.isActive, true)
//         )
//       )
//       .limit(1)

//     if (user.length === 0) {
//       return {
//         success: false,
//         message: 'بيانات تسجيل الدخول غير صحيحة'
//       }
//     }

//     const foundUser = user[0]

//     // التحقق من كلمة المرور
//     const isPasswordValid = await bcrypt.compare(data.password, foundUser.password)
//     if (!isPasswordValid) {
//       return {
//         success: false,
//         message: 'بيانات تسجيل الدخول غير صحيحة'
//       }
//     }

//     // إنشاء رمز التحقق
//     const verificationCode = generateVerificationCode()
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 دقائق

//     // حفظ رمز التحقق في قاعدة البيانات
//     await db.insert(verificationCodes).values({
//       userId: foundUser.id,
//       code: verificationCode,
//       type: 'login',
//       expiresAt,
//     })

//     // إرسال رمز التحقق للإيميل (للاختبار: عرض الرمز في الكونسول)
//     console.log(`🔑 رمز التحقق للاختبار: ${verificationCode} للمستخدم: ${foundUser.email}`)
    
//     // محاولة إرسال الإيميل (اختياري)
//     try {
//       await sendVerificationEmail(foundUser.email, foundUser.fullName, verificationCode)
//       console.log(`✅ تم إرسال رمز التحقق عبر الإيميل أيضاً`)
//     } catch (error) {
//       console.log(`⚠️ لم يتم إرسال الإيميل، استخدم الرمز من الكونسول`)
//     }

//     return {
//       success: true,
//       message: `تم إرسال رمز التحقق إلى بريدك الإلكتروني. للاختبار: ${verificationCode}`,
//       user: {
//         id: foundUser.id,
//         email: foundUser.email,
//         username: foundUser.username,
//         fullName: foundUser.fullName,
//         role: foundUser.role,
//         isActive: foundUser.isActive,
//         createdAt: foundUser.createdAt,
//         updatedAt: foundUser.updatedAt,
//         createdBy: foundUser.createdBy,
//       },
//       requiresVerification: true
//     }
//   } catch (error) {
//     console.error('Login error:', error)
//     return {
//       success: false,
//       message: 'حدث خطأ أثناء تسجيل الدخول'
//     }
//   }
// }

// // التحقق من الرمز وإنشاء الجلسة
// export async function verifyLoginCode(data: VerifyCodeData): Promise<AuthResult> {
//   try {
//     // البحث عن رمز التحقق
//     const verificationCode = await db
//       .select()
//       .from(verificationCodes)
//       .where(
//         and(
//           eq(verificationCodes.userId, data.userId),
//           eq(verificationCodes.code, data.code),
//           eq(verificationCodes.type, data.type),
//           eq(verificationCodes.isUsed, false)
//         )
//       )
//       .limit(1)

//     if (verificationCode.length === 0) {
//       return {
//         success: false,
//         message: 'رمز التحقق غير صحيح'
//       }
//     }

//     const code = verificationCode[0]

//     // التحقق من انتهاء صلاحية الرمز
//     if (new Date() > code.expiresAt) {
//       return {
//         success: false,
//         message: 'انتهت صلاحية رمز التحقق'
//       }
//     }

//     // الحصول على بيانات المستخدم
//     const user = await db
//       .select()
//       .from(users)
//       .where(eq(users.id, data.userId))
//       .limit(1)

//     if (user.length === 0) {
//       return {
//         success: false,
//         message: 'المستخدم غير موجود'
//       }
//     }

//     const foundUser = user[0]

//     // تحديد الرمز كمستخدم
//     await db
//       .update(verificationCodes)
//       .set({ isUsed: true })
//       .where(eq(verificationCodes.id, code.id))

//     // إنشاء جلسة جديدة
//     const sessionToken = await createSession(foundUser.id)

//     // حفظ الجلسة في الكوكيز
//     cookies().set('session', sessionToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 7 * 24 * 60 * 60 // 7 أيام
//     })

//     return {
//       success: true,
//       message: 'تم تسجيل الدخول بنجاح',
//       user: {
//         id: foundUser.id,
//         email: foundUser.email,
//         username: foundUser.username,
//         fullName: foundUser.fullName,
//         role: foundUser.role,
//         isActive: foundUser.isActive,
//         createdAt: foundUser.createdAt,
//         updatedAt: foundUser.updatedAt,
//         createdBy: foundUser.createdBy,
//       },
//       sessionToken
//     }
//   } catch (error) {
//     console.error('Verification error:', error)
//     return {
//       success: false,
//       message: 'حدث خطأ أثناء التحقق من الرمز'
//     }
//   }
// }

// // تسجيل الخروج
// export async function logoutUser(): Promise<ActionResult> {
//   try {
//     const sessionToken = cookies().get('session')?.value

//     if (sessionToken) {
//       // حذف الجلسة من قاعدة البيانات
//       await db
//         .delete(userSessions)
//         .where(eq(userSessions.sessionToken, sessionToken))
//     }

//     // حذف الكوكي
//     cookies().delete('session')

//     return {
//       success: true,
//       message: 'تم تسجيل الخروج بنجاح'
//     }
//   } catch (error) {
//     console.error('Logout error:', error)
//     return {
//       success: false,
//       message: 'حدث خطأ أثناء تسجيل الخروج'
//     }
//   }
// }

// // الحصول على الجلسة الحالية
// export async function getCurrentSession(): Promise<SessionData | null> {
//   try {
//     const sessionToken = cookies().get('session')?.value

//     if (!sessionToken) {
//       return null
//     }

//     return await verifySession(sessionToken)
//   } catch (error) {
//     console.error('Session verification error:', error)
//     return null
//   }
// }

// // طلب إعادة تعيين كلمة المرور
// export async function requestPasswordReset(email: string): Promise<ActionResult> {
//   try {
//     // البحث عن المستخدم
//     const user = await db
//       .select()
//       .from(users)
//       .where(and(eq(users.email, email), eq(users.isActive, true)))
//       .limit(1)

//     if (user.length === 0) {
//       return {
//         success: false,
//         message: 'البريد الإلكتروني غير مسجل'
//       }
//     }

//     const foundUser = user[0]

//     // إنشاء رمز التحقق
//     const verificationCode = generateVerificationCode()
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 دقائق

//     // حفظ رمز التحقق
//     await db.insert(verificationCodes).values({
//       userId: foundUser.id,
//       code: verificationCode,
//       type: 'password_reset',
//       expiresAt,
//     })

//     // إرسال رمز التحقق للإيميل
//     await sendVerificationEmail(foundUser.email, foundUser.fullName, verificationCode, 'password_reset')

//     return {
//       success: true,
//       message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
//       data: { userId: foundUser.id }
//     }
//   } catch (error) {
//     console.error('Password reset request error:', error)
//     return {
//       success: false,
//       message: 'حدث خطأ أثناء طلب إعادة تعيين كلمة المرور'
//     }
//   }
// }

// // إعادة تعيين كلمة المرور
// export async function resetPassword(data: ResetPasswordData): Promise<ActionResult> {
//   try {
//     // التحقق من رمز التحقق
//     const verificationResult = await verifyLoginCode({
//       userId: data.userId,
//       code: data.code,
//       type: 'password_reset'
//     })

//     if (!verificationResult.success) {
//       return {
//         success: false,
//         message: verificationResult.message
//       }
//     }

//     // تشفير كلمة المرور الجديدة
//     const hashedPassword = await bcrypt.hash(data.newPassword, 12)

//     // تحديث كلمة المرور
//     await db
//       .update(users)
//       .set({ 
//         password: hashedPassword,
//         updatedAt: new Date()
//       })
//       .where(eq(users.id, data.userId))

//     return {
//       success: true,
//       message: 'تم تغيير كلمة المرور بنجاح'
//     }
//   } catch (error) {
//     console.error('Password reset error:', error)
//     return {
//       success: false,
//       message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
//     }
//   }
// }
'use server'

import { db } from '@/db/drizzle'
import { users, verificationCodes, userSessions } from '@/db/schema'
import { eq, and, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { LoginData, VerifyCodeData, ResetPasswordData } from '@/types/user'
import type { AuthResult, ActionResult, SessionData } from '@/types/auth'
import { sendVerificationEmail } from '@/lib/email/sender'
import { generateVerificationCode, createSession, verifySession } from '@/lib/utils/auth-helpers'

// تسجيل الدخول
export async function loginUser(data: LoginData): Promise<AuthResult> {
  try {
    // البحث عن المستخدم بالإيميل أو اليوزر
    const user = await db
      .select()
      .from(users)
      .where(
        and(
          or(
            eq(users.email, data.emailOrUsername),
            eq(users.username, data.emailOrUsername)
          ),
          eq(users.isActive, true)
        )
      )
      .limit(1)

    if (user.length === 0) {
      return {
        success: false,
        message: 'بيانات تسجيل الدخول غير صحيحة'
      }
    }

    const foundUser = user[0]

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(data.password, foundUser.password)
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'بيانات تسجيل الدخول غير صحيحة'
      }
    }

    // إنشاء رمز التحقق
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 دقائق

    // حفظ رمز التحقق في قاعدة البيانات
    await db.insert(verificationCodes).values({
      userId: foundUser.id,
      code: verificationCode,
      type: 'login',
      expiresAt,
    })

    // إرسال رمز التحقق للإيميل (للاختبار: عرض الرمز في الكونسول)
    console.log(`🔑 رمز التحقق للاختبار: ${verificationCode} للمستخدم: ${foundUser.email}`)
    
    // محاولة إرسال الإيميل (اختياري)
    try {
      await sendVerificationEmail(foundUser.email, foundUser.fullName, verificationCode)
      console.log(`✅ تم إرسال رمز التحقق عبر الإيميل أيضاً`)
    } catch (error) {
      console.log(`⚠️ لم يتم إرسال الإيميل، استخدم الرمز من الكونسول`)
    }

    return {
      success: true,
      message: `تم إرسال رمز التحقق إلى بريدك الإلكتروني. للاختبار: ${verificationCode}`,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
        fullName: foundUser.fullName,
        role: foundUser.role,
        isActive: foundUser.isActive,
        createdAt: foundUser.createdAt,
        updatedAt: foundUser.updatedAt,
        createdBy: foundUser.createdBy,
      },
      requiresVerification: true
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول'
    }
  }
}

// التحقق من الرمز وإنشاء الجلسة
export async function verifyLoginCode(data: VerifyCodeData): Promise<AuthResult> {
  try {
    // البحث عن رمز التحقق
    const verificationCode = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.userId, data.userId),
          eq(verificationCodes.code, data.code),
          eq(verificationCodes.type, data.type),
          eq(verificationCodes.isUsed, false)
        )
      )
      .limit(1)

    if (verificationCode.length === 0) {
      return {
        success: false,
        message: 'رمز التحقق غير صحيح'
      }
    }

    const code = verificationCode[0]

    // التحقق من انتهاء صلاحية الرمز
    if (new Date() > code.expiresAt) {
      return {
        success: false,
        message: 'انتهت صلاحية رمز التحقق'
      }
    }

    // الحصول على بيانات المستخدم
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1)

    if (user.length === 0) {
      return {
        success: false,
        message: 'المستخدم غير موجود'
      }
    }

    const foundUser = user[0]

    // تحديد الرمز كمستخدم
    await db
      .update(verificationCodes)
      .set({ isUsed: true })
      .where(eq(verificationCodes.id, code.id))

    // إنشاء جلسة جديدة
    const sessionToken = await createSession(foundUser.id)

    // حفظ الجلسة في الكوكيز
    const cookieStore = await cookies()
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 أيام
    })

    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
        fullName: foundUser.fullName,
        role: foundUser.role,
        isActive: foundUser.isActive,
        createdAt: foundUser.createdAt,
        updatedAt: foundUser.updatedAt,
        createdBy: foundUser.createdBy,
      },
      sessionToken
    }
  } catch (error) {
    console.error('Verification error:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء التحقق من الرمز'
    }
  }
}

// تسجيل الخروج
export async function logoutUser(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (sessionToken) {
      // حذف الجلسة من قاعدة البيانات
      await db
        .delete(userSessions)
        .where(eq(userSessions.sessionToken, sessionToken))
    }

    // حذف الكوكي
    cookieStore.delete('session')

    return {
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء تسجيل الخروج'
    }
  }
}

// الحصول على الجلسة الحالية
export async function getCurrentSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return null
    }

    return await verifySession(sessionToken)
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

// طلب إعادة تعيين كلمة المرور
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  try {
    // البحث عن المستخدم
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)))
      .limit(1)

    if (user.length === 0) {
      return {
        success: false,
        message: 'البريد الإلكتروني غير مسجل'
      }
    }

    const foundUser = user[0]

    // إنشاء رمز التحقق
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 دقائق

    // حفظ رمز التحقق
    await db.insert(verificationCodes).values({
      userId: foundUser.id,
      code: verificationCode,
      type: 'password_reset',
      expiresAt,
    })

    // إرسال رمز التحقق للإيميل
    await sendVerificationEmail(foundUser.email, foundUser.fullName, verificationCode, 'password_reset')

    return {
      success: true,
      message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      data: { userId: foundUser.id }
    }
  } catch (error) {
    console.error('Password reset request error:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء طلب إعادة تعيين كلمة المرور'
    }
  }
}

// إعادة تعيين كلمة المرور
export async function resetPassword(data: ResetPasswordData): Promise<ActionResult> {
  try {
    // التحقق من رمز التحقق
    const verificationResult = await verifyLoginCode({
      userId: data.userId,
      code: data.code,
      type: 'password_reset'
    })

    if (!verificationResult.success) {
      return {
        success: false,
        message: verificationResult.message
      }
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(data.newPassword, 12)

    // تحديث كلمة المرور
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, data.userId))

    return {
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
    }
  }
}
