import { getAllUsers, createUser, updateUser, deleteUser } from '@/lib/actions/users'
import type { CreateUserData, UpdateUserData } from '@/types/user'

async function testUsersCRUD() {
  console.log('🧪 اختبار عمليات CRUD للمستخدمين...')
  
  try {
    // 1. اختبار جلب جميع المستخدمين
    console.log('\n📋 1. جلب جميع المستخدمين:')
    const allUsers = await getAllUsers()
    console.log('النتيجة:', allUsers.success)
    console.log('عدد المستخدمين:', allUsers.data?.length || 0)
    
    if (allUsers.data) {
      allUsers.data.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName} (${user.email}) - ${user.role}`)
      })
    }
    
    // 2. اختبار إنشاء مستخدم جديد
    console.log('\n➕ 2. إنشاء مستخدم جديد:')
    const newUserData: CreateUserData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'test123',
      fullName: 'مستخدم تجريبي',
      role: 'employee'
    }
    
    const createResult = await createUser(newUserData)
    console.log('نتيجة الإنشاء:', createResult.success)
    console.log('الرسالة:', createResult.message)
    
    if (createResult.success && createResult.data) {
      const newUserId = createResult.data.id
      console.log('ID المستخدم الجديد:', newUserId)
      
      // 3. اختبار تحديث المستخدم
      console.log('\n✏️ 3. تحديث المستخدم:')
      const updateData: UpdateUserData = {
        email: 'updated@example.com',
        username: 'updateduser',
        fullName: 'مستخدم محدث',
        role: 'admin',
        isActive: true
      }
      
      const updateResult = await updateUser(newUserId, updateData)
      console.log('نتيجة التحديث:', updateResult.success)
      console.log('الرسالة:', updateResult.message)
      
      // 4. اختبار حذف المستخدم
      console.log('\n🗑️ 4. حذف المستخدم:')
      const deleteResult = await deleteUser(newUserId)
      console.log('نتيجة الحذف:', deleteResult.success)
      console.log('الرسالة:', deleteResult.message)
    }
    
    // 5. التحقق النهائي من القائمة
    console.log('\n📋 5. التحقق النهائي من قائمة المستخدمين:')
    const finalUsers = await getAllUsers()
    console.log('عدد المستخدمين النهائي:', finalUsers.data?.length || 0)
    
  } catch (error) {
    console.error('❌ خطأ في اختبار CRUD:', error)
  }
}

testUsersCRUD()