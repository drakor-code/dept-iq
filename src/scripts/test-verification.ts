import { db } from '@/db/drizzle'
import { verificationCodes } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

async function getLatestVerificationCode(userId: string) {
  try {
    console.log('🔍 البحث عن أحدث رمز تحقق للمستخدم:', userId)
    
    const codes = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.userId, userId),
          eq(verificationCodes.type, 'login'),
          eq(verificationCodes.isUsed, false)
        )
      )
      .orderBy(verificationCodes.createdAt)
    
    if (codes.length > 0) {
      const latestCode = codes[codes.length - 1]
      console.log('✅ تم العثور على رمز التحقق:')
      console.log('الرمز:', latestCode.code)
      console.log('تاريخ الإنشاء:', latestCode.createdAt)
      console.log('تاريخ الانتهاء:', latestCode.expiresAt)
      console.log('مستخدم:', latestCode.isUsed ? 'نعم' : 'لا')
      
      return latestCode.code
    } else {
      console.log('❌ لم يتم العثور على رمز تحقق')
      return null
    }
    
  } catch (error) {
    console.error('❌ خطأ في البحث عن رمز التحقق:', error)
    return null
  }
}

// استخدام المعرف من نتيجة الاختبار السابق
const adminUserId = '1860b0a9-8e60-4bc3-83b6-9051e649a7be'
const employeeUserId = '54c7f866-5c89-44b5-ad62-17d7dd9977e6'

async function main() {
  console.log('🔑 البحث عن رموز التحقق...')
  
  console.log('\n👑 رمز تحقق المدير:')
  await getLatestVerificationCode(adminUserId)
  
  console.log('\n👤 رمز تحقق الموظف:')
  await getLatestVerificationCode(employeeUserId)
}

main()