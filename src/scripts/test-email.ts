import { sendVerificationEmail } from '@/lib/email/sender'

async function testEmail() {
  console.log('📧 اختبار إرسال الإيميل...')
  
  try {
    // اختبار إرسال إيميل لعنوان حقيقي
    const result = await sendVerificationEmail(
      'mahmodyassen548@gmail.com', // استخدم إيميلك الحقيقي
      'اختبار النظام',
      '123456',
      'login'
    )
    
    if (result) {
      console.log('✅ تم إرسال الإيميل بنجاح!')
    } else {
      console.log('❌ فشل في إرسال الإيميل')
    }
    
  } catch (error) {
    console.error('❌ خطأ في إرسال الإيميل:', error)
  }
}

testEmail()