import { loginUser, verifyLoginCode } from '@/lib/actions/auth-real'
import type { LoginData, VerifyCodeData } from '@/types/user'

async function testRealAuth() {
  console.log('🔍 اختبار النظام الحقيقي للمصادقة...')
  
  // اختبار تسجيل الدخول بـ drakor
  const loginData: LoginData = {
    emailOrUsername: 'drakor.code@gmail.com',
    password: 'y123y321'
  }
  
  try {
    console.log('📧 محاولة تسجيل الدخول الحقيقي...')
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
      
      if (result.success && result.requiresVerification) {
        console.log('\n✅ تم إرسال رمز التحقق بنجاح!')
        console.log('📧 تحقق من بريدك الإلكتروني للحصول على الرمز')
        console.log('🔑 استخدم الرمز المرسل لإكمال تسجيل الدخول')
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار النظام الحقيقي:', error)
  }
}

testRealAuth()