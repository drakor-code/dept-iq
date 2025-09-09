
import { Resend } from 'resend'
import type { VerificationType } from '@/types/user'

const resend = new Resend(process.env.RESEND_API_KEY)

// إرسال رمز التحقق
export async function sendVerificationEmail(
  email: string,
  fullName: string,
  code: string,
  type: VerificationType = 'login'
): Promise<boolean> {
  try {
    const subject = type === 'login' 
      ? 'رمز تسجيل الدخول - Debt-IQ'
      : 'رمز إعادة تعيين كلمة المرور - Debt-IQ'

    const message = type === 'login'
      ? `مرحباً ${fullName}،\n\nرمز تسجيل الدخول الخاص بك هو: ${code}\n\nهذا الرمز صالح لمدة 10 دقائق فقط.\n\nإذا لم تطلب هذا الرمز، يرجى تجاهل هذا الإيميل.\n\nشكراً لك،\nفريق Debt-IQ`
      : `مرحباً ${fullName}،\n\nرمز إعادة تعيين كلمة المرور الخاص بك هو: ${code}\n\nهذا الرمز صالح لمدة 10 دقائق فقط.\n\nإذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا الإيميل.\n\nشكراً لك،\nفريق Debt-IQ`

    const htmlMessage = type === 'login' ? `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>رمز تسجيل الدخول</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #06b6d4; margin-bottom: 10px; }
          .title { font-size: 20px; color: #333; margin-bottom: 20px; }
          .code-container { background-color: #f8f9fa; border: 2px dashed #06b6d4; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; color: #06b6d4; letter-spacing: 5px; }
          .message { color: #666; line-height: 1.6; margin: 20px 0; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐 Debt-IQ</div>
            <div class="title">رمز تسجيل الدخول</div>
          </div>
          
          <div class="message">
            مرحباً <strong>${fullName}</strong>،
          </div>
          
          <div class="message">
            لإكمال عملية تسجيل الدخول، يرجى استخدام الرمز التالي:
          </div>
          
          <div class="code-container">
            <div class="code">${code}</div>
          </div>
          
          <div class="warning">
            ⚠️ هذا الرمز صالح لمدة <strong>10 دقائق فقط</strong>
          </div>
          
          <div class="message">
            إذا لم تطلب هذا الرمز، يرجى تجاهل هذا الإيميل.
          </div>
          
          <div class="footer">
            شكراً لك،<br>
            فريق Debt-IQ
          </div>
        </div>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إعادة تعيين كلمة المرور</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #06b6d4; margin-bottom: 10px; }
          .title { font-size: 20px; color: #333; margin-bottom: 20px; }
          .code-container { background-color: #f8f9fa; border: 2px dashed #dc3545; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; color: #dc3545; letter-spacing: 5px; }
          .message { color: #666; line-height: 1.6; margin: 20px 0; }
          .warning { background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0; color: #721c24; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐 Debt-IQ</div>
            <div class="title">إعادة تعيين كلمة المرور</div>
          </div>
          
          <div class="message">
            مرحباً <strong>${fullName}</strong>،
          </div>
          
          <div class="message">
            لإعادة تعيين كلمة المرور الخاصة بك، يرجى استخدام الرمز التالي:
          </div>
          
          <div class="code-container">
            <div class="code">${code}</div>
          </div>
          
          <div class="warning">
            ⚠️ هذا الرمز صالح لمدة <strong>10 دقائق فقط</strong>
          </div>
          
          <div class="message">
            إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا الإيميل.
          </div>
          
          <div class="footer">
            شكراً لك،<br>
            فريق Debt-IQ
          </div>
        </div>
      </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Debt-IQ <onboarding@resend.dev>',
      to: [email],
      subject,
      text: message,
      html: htmlMessage,
    })

    if (error) {
      console.error('Email sending error:', error)
      return false
    }

    console.log('Email sent successfully:', data)
    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}