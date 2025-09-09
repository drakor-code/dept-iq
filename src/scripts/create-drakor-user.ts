import { db } from '@/db/drizzle'
import { users } from '@/db/schema'
import bcrypt from 'bcryptjs'

async function createDrakorUser() {
  try {
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash('y123y321', 12)
    
    // إنشاء المستخدم
    const drakorUser = await db.insert(users).values({
      email: 'drakor.code@gmail.com',
      username: 'drakor',
      password: hashedPassword,
      fullName: 'Drakor Code',
      role: 'admin',
      isActive: true,
    }).returning()

    console.log('✅ تم إنشاء المستخدم بنجاح:')
    console.log('البريد الإلكتروني: drakor.code@gmail.com')
    console.log('اسم المستخدم: drakor')
    console.log('كلمة المرور: y123y321')
    console.log('الصلاحية: admin')
    
    return drakorUser[0]
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error)
    throw error
  }
}

createDrakorUser()