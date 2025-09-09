// 'use server'

// import { db } from '@/db/drizzle'
// import { users, verificationCodes, userSessions } from '@/db/schema'
// import { eq, and, or } from 'drizzle-orm'
// import bcrypt from 'bcryptjs'
// import { cookies } from 'next/headers'
// import type { LoginData, VerifyCodeData, ResetPasswordData } from '@/types/user'
// import type { AuthResult, ActionResult, SessionData } from '@/types/auth'
// import { sendVerificationEmail } from '@/lib/email/sender'
// import { generateVerificationCode, createSession, verifySession } from '@/lib/utils/auth-helpers'

// // تسجيل الدخول - نظام حقيقي 100%
// export async function loginUser(data: LoginData): Promise<AuthResult> {
//   try {
//     console.log('🔍 محاولة تسجيل الدخول:', { emailOrUsername: data.emailOrUsername })
    
//     // البحث عن المستخدم بالإيميل أو اسم المستخدم
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
//       console.log('❌ المستخدم غير موجود')
//       return {
//         success: false,
//         message: 'بيانات تسجيل الدخول غير صحيحة'
//       }
//     }

//     const foundUser = user[0]
//     console.log('✅ تم العثور على المستخدم:', foundUser.email)

//     // التحقق من كلمة المرور باستخدام bcrypt
//     const isPasswordValid = await bcrypt.compare(data.password, foundUser.password)
//     if (!isPasswordValid) {
//       console.log('❌ كلمة المرور غير صحيحة')
//       return {
//         success: false,
//         message: 'بيانات تسجيل الدخول غير صحيحة'
//       }
//     }

//     console.log('✅ كلمة المرور صحيحة')

//     // إنشاء رمز التحقق حقيقي
//     const verificationCode = generateVerificationCode()
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 دقائق

//     console.log('🔑 إنشاء رمز التحقق:', verificationCode)

//     // حفظ رمز التحقق في قاعدة البيانات
//     await db.insert(verificationCodes).values({
//       userId: foundUser.id,
//       code: verificationCode,
//       type: 'login',
//       expiresAt,
//     })

//     console.log('💾 تم حفظ رمز التحقق في قاعدة البيانات')

//     // إرسال رمز التحقق عبر الإيميل الحقيقي
//     try {
//       const emailSent = await sendVerificationEmail(
//         foundUser.email, 
//         foundUser.fullName, 
//         verificationCode,
//         'login'
//       )
      
//       if (emailSent) {
//         console.log('📧 تم إرسال رمز التحقق عبر الإيميل بنجاح')
//         return {
//           success: true,
//           message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
//           user: {
//             id: foundUser.id,
//             email: foundUser.email,
//             username: foundUser.username,
//             fullName: foundUser.fullName,
//             role: foundUser.role,
//             isActive: foundUser.isActive,
//             createdAt: foundUser.createdAt,
//             updatedAt: foundUser.updatedAt,
//             createdBy: foundUser.createdBy,
//           },
//           requiresVerification: true
//         }
//       } else {
//         console.log('❌ فشل إرسال الإيميل')
//         // حذف رمز التحقق من قاعدة البيانات إذا فشل الإرسال
//         await db.delete(verificationCodes).where(
//           and(
//             eq(verificationCodes.userId, foundUser.id),
//             eq(verificationCodes.code, verificationCode)
//           )
//         )
//         return {
//           success: false,
//           message: 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى'
//         }
//       }
//     } catch (error) {
//       console.error('❌ خطأ في إرسال الإيميل:', error)
//       // حذف رمز التحقق من قاعدة البيانات إذا فشل الإرسال
//       await db.delete(verificationCodes).where(
//         and(
//           eq(verificationCodes.userId, foundUser.id),
//           eq(verificationCodes.code, verificationCode)
//         )
//       )
//       return {
//         success: false,
//         message: 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى'
//       }
//     }
//   } catch (error) {
//     console.error('❌ خطأ في تسجيل الدخول:', error)
//     return {
//       success: false,
//       message: 'حدث خطأ أثناء تسجيل الدخول'
//     }
//   }
// }

// // التحقق من رمز التحقق وإنشاء الجلسة
// export async function verifyLoginCode(data: VerifyCodeData): Promise<AuthResult> {
//   try {
//     console.log('🔍 التحقق من رمز التحقق:', { userId: data.userId, code: data.code })

//     // البحث عن رمز التحقق في قاعدة البيانات
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
//       console.log('❌ رمز التحقق غير صحيح أو غير موجود')
//       return {
//         success: false,
//         message: 'رمز التحقق غير صحيح'
//       }
//     }

//     const code = verificationCode[0]

//     // التحقق من انتهاء صلاحية الرمز
//     if (new Date() > code.expiresAt) {
//       console.log('❌ انتهت صلاحية رمز التحقق')
//       return {
//         success: false,
//         message: 'انتهت صلاحية رمز التحقق'
//       }
//     }

//     console.log('✅ رمز التحقق صحيح وصالح')

//     // الحصول على بيانات المستخدم
//     const user = await db
//       .select()
//       .from(users)
//       .where(eq(users.id, data.userId))
//       .limit(1)

//     if (user.length === 0) {
//       console.log('❌ المستخدم غير موجود')
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

//     console.log('✅ تم تحديد رمز التحقق كمستخدم')

//     // إنشاء جلسة جديدة
//     const sessionToken = await createSession(foundUser.id)

//     console.log('✅ تم إنشاء جلسة جديدة')

//     // حفظ الجلسة في الكوكيز بشكل آمن
//     cookies().set('session', sessionToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 7 * 24 * 60 * 60 // 7 أيام
//     })

//     console.log('✅ تم حفظ الجلسة في الكوكيز')

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
//     console.error('❌ خطأ في التحقق من الرمز:', error)
//     return {
//       success: false,
//       message: 'حدث خطأ أثناء التحقق من الرمز'
//     }
//   }
// }

// // طلب إعادة تعيين كلمة المرور
// export async function requestPasswordReset(email: string): Promise<ActionResult> {
//   try {
//     console.log('🔍 طلب إعادة تعيين كلمة المرور للإيميل:', email)

//     // البحث عن المستخدم
//     const user = await db
//       .select()
//       .from(users)
//       .where(and(eq(users.email, email), eq(users.isActive, true)))
//       .limit(1)

//     if (user.length === 0) {
//       console.log('❌ البريد الإلكتروني غير مسجل')
//       return {
//         success: false,
//         message: 'البريد الإلكتروني غير مسجل'
//       }
//     }

//     const foundUser = user[0]
//     console.log('✅ تم العثور على المستخدم')

//     // إنشاء رمز التحقق
//     const verificationCode = generateVerificationCode()
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 دقائق

//     console.log('🔑 إنشاء رمز إعادة تعيين كلمة المرور:', verificationCode)

//     // حفظ رمز التحقق
//     await db.insert(verificationCodes).values({
//       userId: foundUser.id,
//       code: verificationCode,
//       type: 'password_reset',
//       expiresAt,
//     })

//     console.log('💾 تم حفظ رمز إعادة التعيين في قاعدة البيانات')

//     // إرسال رمز التحقق للإيميل
//     try {
//       const emailSent = await sendVerificationEmail(
//         foundUser.email, 
//         foundUser.fullName, 
//         verificationCode, 
//         'password_reset'
//       )

//       if (emailSent) {
//         console.log('📧 تم إرسال رمز إعادة التعيين عبر الإيميل بنجاح')
//         return {
//           success: true,
//           message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
//           data: { userId: foundUser.id }
//         }
//       } else {
//         console.log('❌ فشل إرسال الإيميل')
//         // حذف رمز التحقق إذا فشل الإرسال
//         await db.delete(verificationCodes).where(
//           and(
//             eq(verificationCodes.userId, foundUser.id),
//             eq(verificationCodes.code, verificationCode)
//           )
//         )
//         return {
//           success: false,
//           message: 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى'
//         }
//       }
//     } catch (error) {
//       console.error('❌ خطأ في إرسال الإيميل:', error)
//       // حذف رمز التحقق إذا فشل الإرسال
//       await db.delete(verificationCodes).where(
//         and(
//           eq(verificationCodes.userId, foundUser.id),
//           eq(verificationCodes.code, verificationCode)
//         )
//       )
//       return {
//         success: false,
//         message: 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى'
//       }
//     }
//   } catch (error) {
//     console.error('❌ خطأ في طلب إعادة تعيين كلمة المرور:', error)
//     return {
//       success: false,
//       message: 'حدث خطأ أثناء طلب إعادة تعيين كلمة المرور'
//     }
//   }
// }

// // إعادة تعيين كلمة المرور
// export async function resetPassword(data: ResetPasswordData): Promise<ActionResult> {
//   try {
//     console.log('🔍 إعادة تعيين كلمة المرور للمستخدم:', data.userId)

//     // التحقق من رمز التحقق
//     const verificationResult = await verifyLoginCode({
//       userId: data.userId,
//       code: data.code,
//       type: 'password_reset'
//     })

//     if (!verificationResult.success) {
//       console.log('❌ رمز التحقق غير صحيح')
//       return {
//         success: false,
//         message: verificationResult.message
//       }
//     }

//     console.log('✅ رمز التحقق صحيح')

//     // تشفير كلمة المرور الجديدة
//     const hashedPassword = await bcrypt.hash(data.newPassword, 12)

//     console.log('🔐 تم تشفير كلمة المرور الجديدة')

//     // تحديث كلمة المرور في قاعدة البيانات
//     await db
//       .update(users)
//       .set({ 
//         password: hashedPassword,
//         updatedAt: new Date()
//       })
//       .where(eq(users.id, data.userId))

//     console.log('✅ تم تحديث كلمة المرور في قاعدة البيانات')

//     return {
//       success: true,
//       message: 'تم تغيير كلمة المرور بنجاح'
//     }
//   } catch (error) {
//     console.error('❌ خطأ في إعادة تعيين كلمة المرور:', error)
//     return {
//       success: false,
//       message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
//     }
//   }
// }

// // تسجيل الخروج
// export async function logoutUser(): Promise<ActionResult> {
//   try {
//     console.log('🔍 تسجيل الخروج')

//     const sessionToken = cookies().get('session')?.value

//     if (sessionToken) {
//       // حذف الجلسة من قاعدة البيانات
//       await db
//         .delete(userSessions)
//         .where(eq(userSessions.sessionToken, sessionToken))
      
//       console.log('✅ تم حذف الجلسة من قاعدة البيانات')
//     }

//     // حذف الكوكي
//     cookies().delete('session')
//     console.log('✅ تم حذف الكوكي')

//     return {
//       success: true,
//       message: 'تم تسجيل الخروج بنجاح'
//     }
//   } catch (error) {
//     console.error('❌ خطأ في تسجيل الخروج:', error)
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
//     console.error('❌ خطأ في التحقق من الجلسة:', error)
//     return null
//   }
// }
'use server'

import { db } from '@/db/drizzle'
import { users, verificationCodes, userSessions } from '@/db/schema'
import { eq, and, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import type { LoginData, VerifyCodeData, ResetPasswordData } from '@/types/user'
import type { AuthResult, ActionResult, SessionData } from '@/types/auth'
import { sendVerificationEmail } from '@/lib/email/sender'
import { generateVerificationCode, createSession, verifySession } from '@/lib/utils/auth-helpers'

// ==========================
// تسجيل الدخول
// ==========================
export async function loginUser(data: LoginData): Promise<AuthResult> {
  try {
    console.log('🔍 محاولة تسجيل الدخول:', { emailOrUsername: data.emailOrUsername })
    
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
      console.log('❌ المستخدم غير موجود')
      return { success: false, message: 'بيانات تسجيل الدخول غير صحيحة' }
    }

    const foundUser = user[0]

    const isPasswordValid = await bcrypt.compare(data.password, foundUser.password)
    if (!isPasswordValid) {
      console.log('❌ كلمة المرور غير صحيحة')
      return { success: false, message: 'بيانات تسجيل الدخول غير صحيحة' }
    }

    // إنشاء رمز التحقق وحفظه في قاعدة البيانات
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await db.insert(verificationCodes).values({
      userId: foundUser.id,
      code: verificationCode,
      type: 'login',
      expiresAt,
    })

    // إرسال رمز التحقق عبر الإيميل
    const emailSent = await sendVerificationEmail(
      foundUser.email, 
      foundUser.fullName, 
      verificationCode,
      'login'
    )

    if (!emailSent) {
      await db.delete(verificationCodes).where(
        and(eq(verificationCodes.userId, foundUser.id), eq(verificationCodes.code, verificationCode))
      )
      return { success: false, message: 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى' }
    }

    return {
      success: true,
      message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
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
    console.error('❌ خطأ في تسجيل الدخول:', error)
    return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' }
  }
}

// ==========================
// التحقق من رمز التحقق وإنشاء الجلسة
// ==========================
export async function verifyLoginCode(data: VerifyCodeData): Promise<AuthResult> {
  try {
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
      return { success: false, message: 'رمز التحقق غير صحيح' }
    }

    const code = verificationCode[0]

    if (new Date() > code.expiresAt) {
      return { success: false, message: 'انتهت صلاحية رمز التحقق' }
    }

    const user = await db.select().from(users).where(eq(users.id, data.userId)).limit(1)
    if (user.length === 0) {
      return { success: false, message: 'المستخدم غير موجود' }
    }

    const foundUser = user[0]

    // تحديث رمز التحقق كمستخدم
    await db.update(verificationCodes).set({ isUsed: true }).where(eq(verificationCodes.id, code.id))

    // إنشاء جلسة جديدة وحفظها بالكوكيز
    const sessionToken = await createSession(foundUser.id)
    const cookieStore = await cookies()
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
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
    console.error('❌ خطأ في التحقق من الرمز:', error)
    return { success: false, message: 'حدث خطأ أثناء التحقق من الرمز' }
  }
}

// ==========================
// طلب إعادة تعيين كلمة المرور
// ==========================
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)))
      .limit(1)

    if (user.length === 0) {
      return { success: false, message: 'البريد الإلكتروني غير مسجل' }
    }

    const foundUser = user[0]
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await db.insert(verificationCodes).values({
      userId: foundUser.id,
      code: verificationCode,
      type: 'password_reset',
      expiresAt,
    })

    const emailSent = await sendVerificationEmail(
      foundUser.email, 
      foundUser.fullName, 
      verificationCode, 
      'password_reset'
    )

    if (!emailSent) {
      await db.delete(verificationCodes).where(
        and(eq(verificationCodes.userId, foundUser.id), eq(verificationCodes.code, verificationCode))
      )
      return { success: false, message: 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى' }
    }

    return { success: true, message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني', data: { userId: foundUser.id } }

  } catch (error) {
    console.error('❌ خطأ في طلب إعادة تعيين كلمة المرور:', error)
    return { success: false, message: 'حدث خطأ أثناء طلب إعادة تعيين كلمة المرور' }
  }
}

// ==========================
// إعادة تعيين كلمة المرور
// ==========================
export async function resetPassword(data: ResetPasswordData): Promise<ActionResult> {
  try {
    const verificationResult = await verifyLoginCode({
      userId: data.userId,
      code: data.code,
      type: 'password_reset'
    })

    if (!verificationResult.success) {
      return { success: false, message: verificationResult.message }
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12)

    await db.update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, data.userId))

    return { success: true, message: 'تم تغيير كلمة المرور بنجاح' }

  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين كلمة المرور:', error)
    return { success: false, message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' }
  }
}

// ==========================
// تسجيل الخروج
// ==========================
export async function logoutUser(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (sessionToken) {
      await db.delete(userSessions).where(eq(userSessions.sessionToken, sessionToken))
    }

    cookieStore.delete('session')
    return { success: true, message: 'تم تسجيل الخروج بنجاح' }

  } catch (error) {
    console.error('❌ خطأ في تسجيل الخروج:', error)
    return { success: false, message: 'حدث خطأ أثناء تسجيل الخروج' }
  }
}

// ==========================
// الحصول على الجلسة الحالية
// ==========================
export async function getCurrentSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) return null
    return await verifySession(sessionToken)

  } catch (error) {
    console.error('❌ خطأ في التحقق من الجلسة:', error)
    return null
  }
}
