import { loginUser } from '@/lib/actions/auth'
import type { LoginData } from '@/types/user'

async function testDrakorLogin() {
  console.log('🔍 اختبار تسجيل الدخول للمستخدم الجديد...')
  
  // اختبار تسجيل الدخول بـ drakor
  const drakorLoginData: LoginData = {
    emailOrUsername: 'drakor.code@gmail.com',
    password: 'y123y321'
  }
  
  try {
    console.log('📧 محاولة تسجيل الدخول...')
    console.log('البيانات:', drakorLoginData)
    
    const result = await loginUser(drakorLoginData)
    
    console.log('📋 نتيجة تسجيل الدخول:')
    console.log('نجح:', result.success)
    console.log('الرسالة:', result.message)
    console.log('يتطلب تحقق:', result.requiresVerification)
    
    if (result.user) {
      console.log('👤 بيانات المستخدم:')
      console.log('ID:', result.user.id)
      console.log('البريد:', result.user.email)
      console.log('اسم المستخدم:', result.user.username)
      console.log('الاسم الكامل:', result.user.fullName)
      console.log('الصلاحية:', result.user.role)
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار تسجيل الدخول:', error)
  }
}

testDrakorLogin()