import { loginUser } from '@/lib/actions/auth-real'
import type { LoginData } from '@/types/user'

async function testMahmoudAuth() {
  console.log('🔍 اختبار النظام الحقيقي مع الإيميل الصحيح...')
  
  // اختبار تسجيل الدخول بـ mahmoud
  const loginData: LoginData = {
    emailOrUsername: 'mahmodyassen548@gmail.com',
    password: 'y123y321'
  }
  
  try {
    console.log('📧 محاولة تسجيل الدخول...')
    console.log('البيانات:', loginData)
    
    const result = await loginUser(loginData)
    
    console.log('\n📋 نتيجة تسجيل الدخول:')
    console.log('نجح:', result.success)
    console.log('الرسالة:', result.message)
    console.log('يتطلب تحقق:', result.requiresVerification)
    
    if (result.user) {
      console.log('\n👤 بيانات المستخدم:')
      console.log('ID:', result.user.id)
      console.log('البريد:', result.user.email)
      console.log('اسم المستخدم:', result.user.username)
      console.log('الاسم الكامل:', result.user.fullName)
      console.log('الصلاحية:', result.user.role)
    }
    
    if (result.success && result.requiresVerification) {
      console.log('\n🎉 تم إرسال رمز التحقق الحقيقي!')
      console.log('📧 تحقق من بريدك الإلكتروني: mahmodyassen548@gmail.com')
      console.log('🔑 استخدم الرمز المرسل في الموقع لإكمال تسجيل الدخول')
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار النظام:', error)
  }
}

testMahmoudAuth()