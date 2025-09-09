import { db } from '@/db/drizzle'
import { users } from '@/db/schema'
import bcrypt from 'bcryptjs'

async function createMahmoudUser() {
  try {
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash('y123y321', 12)
    
    // إنشاء المستخدم بإيميلك الحقيقي
    const mahmoudUser = await db.insert(users).values({
      email: 'mahmodyassen548@gmail.com',
      username: 'mahmoud',
      password: hashedPassword,
      fullName: 'Mahmoud Yassen',
      role: 'admin',
      isActive: true,
    }).returning()

    console.log('✅ تم إنشاء المستخدم بنجاح:')
    console.log('البريد الإلكتروني: mahmodyassen548@gmail.com')
    console.log('اسم المستخدم: mahmoud')
    console.log('كلمة المرور: y123y321')
    console.log('الصلاحية: admin')
    console.log('📧 هذا الإيميل سيستقبل رموز التحقق الحقيقية!')
    
    return mahmoudUser[0]
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error)
    throw error
  }
}

createMahmoudUser()