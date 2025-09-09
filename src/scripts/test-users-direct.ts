import { db } from '@/db/drizzle'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

async function testUsersDirectDB() {
  console.log('🧪 اختبار مباشر لجدول المستخدمين...')
  
  try {
    // 1. جلب جميع المستخدمين مباشرة من قاعدة البيانات
    console.log('\n📋 1. جلب جميع المستخدمين من قاعدة البيانات:')
    const allUsers = await db.select().from(users)
    
    console.log(`✅ تم العثور على ${allUsers.length} مستخدمين:`)
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email}) - ${user.role} - ${user.isActive ? 'نشط' : 'غير نشط'}`)
    })
    
    // 2. إنشاء مستخدم تجريبي مباشرة
    console.log('\n➕ 2. إنشاء مستخدم تجريبي:')
    const hashedPassword = await bcrypt.hash('test123', 12)
    
    const newUser = await db.insert(users).values({
      email: 'testcrud@example.com',
      username: 'testcrud',
      password: hashedPassword,
      fullName: 'مستخدم CRUD تجريبي',
      role: 'employee',
      isActive: true,
    }).returning()
    
    console.log('✅ تم إنشاء المستخدم:', newUser[0].fullName)
    console.log('ID:', newUser[0].id)
    
    // 3. تحديث المستخدم
    console.log('\n✏️ 3. تحديث المستخدم:')
    const updatedUser = await db
      .update(users)
      .set({
        fullName: 'مستخدم CRUD محدث',
        role: 'admin',
        updatedAt: new Date()
      })
      .where(eq(users.id, newUser[0].id))
      .returning()
    
    console.log('✅ تم تحديث المستخدم:', updatedUser[0].fullName)
    console.log('الصلاحية الجديدة:', updatedUser[0].role)
    
    // 4. حذف المستخدم التجريبي
    console.log('\n🗑️ 4. حذف المستخدم التجريبي:')
    await db.delete(users).where(eq(users.id, newUser[0].id))
    console.log('✅ تم حذف المستخدم التجريبي')
    
    // 5. التحقق النهائي
    console.log('\n📋 5. التحقق النهائي:')
    const finalUsers = await db.select().from(users)
    console.log(`✅ العدد النهائي للمستخدمين: ${finalUsers.length}`)
    
    console.log('\n🎉 جميع عمليات CRUD تعمل بشكل صحيح!')
    
  } catch (error) {
    console.error('❌ خطأ في اختبار قاعدة البيانات:', error)
  }
}

testUsersDirectDB()