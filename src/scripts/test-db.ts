import { db } from '@/db/drizzle'
import { users } from '@/db/schema'

async function testDatabase() {
  try {
    console.log('🔍 اختبار الاتصال بقاعدة البيانات...')
    
    // جلب جميع المستخدمين
    const allUsers = await db.select().from(users)
    
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!')
    console.log(`📊 عدد المستخدمين في قاعدة البيانات: ${allUsers.length}`)
    
    if (allUsers.length > 0) {
      console.log('\n👥 المستخدمين الموجودين:')
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. البريد: ${user.email}`)
        console.log(`   اسم المستخدم: ${user.username}`)
        console.log(`   الاسم الكامل: ${user.fullName}`)
        console.log(`   الصلاحية: ${user.role}`)
        console.log(`   نشط: ${user.isActive}`)
        console.log(`   تاريخ الإنشاء: ${user.createdAt}`)
        console.log('   ---')
      })
    } else {
      console.log('⚠️  لا توجد مستخدمين في قاعدة البيانات')
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error)
  }
}

testDatabase()