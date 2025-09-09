import { db } from '@/db/drizzle'
import { users } from '@/db/schema'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
  try {
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // إنشاء المستخدم الإداري
    const adminUser = await db.insert(users).values({
      email: 'admin@debt-iq.com',
      username: 'admin',
      password: hashedPassword,
      fullName: 'مدير النظام',
      role: 'admin',
      isActive: true,
    }).returning()

    console.log('✅ تم إنشاء المستخدم الإداري بنجاح:')
    console.log('البريد الإلكتروني: admin@debt-iq.com')
    console.log('اسم المستخدم: admin')
    console.log('كلمة المرور: admin123')
    console.log('الصلاحية: admin')
    
    return adminUser[0]
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم الإداري:', error)
    throw error
  }
}

async function createEmployeeUser() {
  try {
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash('employee123', 12)
    
    // إنشاء مستخدم موظف
    const employeeUser = await db.insert(users).values({
      email: 'employee@debt-iq.com',
      username: 'employee',
      password: hashedPassword,
      fullName: 'موظف النظام',
      role: 'employee',
      isActive: true,
    }).returning()

    console.log('✅ تم إنشاء المستخدم الموظف بنجاح:')
    console.log('البريد الإلكتروني: employee@debt-iq.com')
    console.log('اسم المستخدم: employee')
    console.log('كلمة المرور: employee123')
    console.log('الصلاحية: employee')
    
    return employeeUser[0]
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم الموظف:', error)
    throw error
  }
}

async function main() {
  console.log('🚀 بدء إنشاء المستخدمين...')
  
  try {
    await createAdminUser()
    await createEmployeeUser()
    
    console.log('\n🎉 تم إنشاء جميع المستخدمين بنجاح!')
    console.log('\nيمكنك الآن تسجيل الدخول باستخدام:')
    console.log('1. المدير: admin@debt-iq.com / admin123')
    console.log('2. الموظف: employee@debt-iq.com / employee123')
    
  } catch (error) {
    console.error('❌ فشل في إنشاء المستخدمين:', error)
    process.exit(1)
  }
  
  process.exit(0)
}

main()