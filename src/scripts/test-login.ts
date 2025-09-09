import { loginUser } from '@/lib/actions/auth'
import type { LoginData } from '@/types/user'

async function testLogin() {
  console.log('🔍 اختبار وظيفة تسجيل الدخول...')
  
  // اختبار تسجيل الدخول بالمدير
  const adminLoginData: LoginData = {
    emailOrUsername: 'admin@debt-iq.com',
    password: 'admin123'
  }
  
  try {
    console.log('📧 محاولة تسجيل الدخول بالمدير...')
    console.log('البيانات:', adminLoginData)
    
    const result = await loginUser(adminLoginData)
    
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
  
  console.log('\n' + '='.repeat(50))
  
  // اختبار تسجيل الدخول بالموظف
  const employeeLoginData: LoginData = {
    emailOrUsername: 'employee',
    password: 'employee123'
  }
  
  try {
    console.log('👤 محاولة تسجيل الدخول بالموظف...')
    console.log('البيانات:', employeeLoginData)
    
    const result = await loginUser(employeeLoginData)
    
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

testLogin()