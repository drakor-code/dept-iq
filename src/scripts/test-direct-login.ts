import { loginUser } from '@/lib/actions/auth-real'
import type { LoginData } from '@/types/user'

async function testDirectLogin() {
  console.log('🔍 اختبار مباشر لتسجيل الدخول...')
  
  // اختبار مع البيانات الحقيقية
  const testCases = [
    {
      name: 'Mahmoud بالإيميل',
      data: { emailOrUsername: 'mahmodyassen548@gmail.com', password: 'y123y321' }
    },
    {
      name: 'Mahmoud باسم المستخدم',
      data: { emailOrUsername: 'mahmoud', password: 'y123y321' }
    },
    {
      name: 'Admin',
      data: { emailOrUsername: 'admin@debt-iq.com', password: 'admin123' }
    },
    {
      name: 'بيانات خاطئة',
      data: { emailOrUsername: 'wrong@email.com', password: 'wrongpass' }
    }
  ]
  
  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(50)}`)
    console.log(`🧪 اختبار: ${testCase.name}`)
    console.log(`📧 البيانات:`, testCase.data)
    
    try {
      const result = await loginUser(testCase.data as LoginData)
      
      console.log(`📋 النتيجة:`)
      console.log(`   نجح: ${result.success}`)
      console.log(`   الرسالة: ${result.message}`)
      console.log(`   يتطلب تحقق: ${result.requiresVerification}`)
      
      if (result.user) {
        console.log(`👤 المستخدم:`)
        console.log(`   ID: ${result.user.id}`)
        console.log(`   البريد: ${result.user.email}`)
        console.log(`   اسم المستخدم: ${result.user.username}`)
        console.log(`   الصلاحية: ${result.user.role}`)
      }
      
    } catch (error) {
      console.error(`❌ خطأ في الاختبار:`, error)
    }
  }
}

testDirectLogin()