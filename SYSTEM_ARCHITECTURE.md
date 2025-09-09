# نظام إدارة المستخدمين والمصادقة - خطة التطوير

## 📋 نظرة عامة على النظام

### 🎯 المتطلبات الأساسية:
1. **تسجيل الدخول فقط** - لا يوجد تسجيل عام
2. **الأدمن ينشئ الحسابات** في صفحة المستخدمين
3. **نظام صلاحيات** (أدمن/موظف)
4. **التحقق بخطوتين** (كلمة مرور + رمز الإيميل)
5. **استرداد كلمة المرور** عبر الإيميل

---

## 🗄️ قاعدة البيانات - الجداول المطلوبة

### 1. جدول المستخدمين (users)
```sql
- id (UUID, Primary Key)
- email (String, Unique)
- username (String, Unique) 
- password (String, Hashed)
- full_name (String)
- role (Enum: 'admin', 'employee')
- is_active (Boolean, Default: true)
- created_at (Timestamp)
- updated_at (Timestamp)
- created_by (UUID, Foreign Key to users.id)
```

### 2. جدول رموز التحقق (verification_codes)
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to users.id)
- code (String, 6 digits)
- type (Enum: 'login', 'password_reset')
- expires_at (Timestamp)
- is_used (Boolean, Default: false)
- created_at (Timestamp)
```

### 3. جدول جلسات المستخدمين (user_sessions)
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to users.id)
- session_token (String, Unique)
- expires_at (Timestamp)
- created_at (Timestamp)
- last_activity (Timestamp)
```

---

## 📁 هيكل الملفات المطلوب

### 🔧 قاعدة البيانات والأنواع
```
src/
├── db/
│   ├── schema.ts           # تعريف جداول Drizzle
│   ├── drizzle.ts         # اتصال قاعدة البيانات
│   └── migrations/        # ملفات الهجرة
├── types/
│   ├── auth.ts            # أنواع المصادقة
│   ├── user.ts            # أنواع المستخدمين
│   └── api.ts             # أنواع API responses
```

### 🔐 نظام المصادقة
```
src/
├── lib/
│   ├── auth/
│   │   ├── password.ts    # تشفير كلمات المرور
│   │   ├── session.ts     # إدارة الجلسات
│   │   ├── verification.ts # رموز التحقق
│   │   └── permissions.ts # نظام الصلاحيات
│   ├── email/
│   │   ├── sender.ts      # إرسال الإيميلات
│   │   └── templates.ts   # قوالب الإيميلات
│   └── utils/
│       ├── validation.ts  # التحقق من البيانات
│       └── crypto.ts      # التشفير والأمان
```

### 🌐 API Routes
```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts       # تسجيل الدخول
│       │   ├── verify/
│       │   │   └── route.ts       # التحقق من الرمز
│       │   ├── logout/
│       │   │   └── route.ts       # تسجيل الخروج
│       │   └── forgot-password/
│       │       └── route.ts       # نسيت كلمة المرور
│       ├── users/
│       │   ├── route.ts           # CRUD المستخدمين
│       │   └── [id]/
│       │       └── route.ts       # عمليات مستخدم محدد
│       └── verification/
│           ├── send/
│           │   └── route.ts       # إرسال رمز التحقق
│           └── resend/
│               └── route.ts       # إعادة إرسال الرمز
```

### 🎨 واجهة المستخدم
```
src/
├── app/
│   ├── login/
│   │   └── page.tsx              # صفحة تسجيل الدخول
│   ├── verify/
│   │   └── page.tsx              # صفحة التحقق من الرمز
│   ├── forgot-password/
│   │   ├── page.tsx              # طلب استرداد كلمة المرور
│   │   └── reset/
│   │       └── page.tsx          # إعادة تعيين كلمة المرور
│   └── dashboard/
│       └── users/
│           └── page.tsx          # إدارة المستخدمين (محدثة)
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # نموذج تسجيل الدخول
│   │   ├── VerificationForm.tsx  # نموذج التحقق
│   │   ├── ForgotPasswordForm.tsx # نموذج نسيت كلمة المرور
│   │   └── ResetPasswordForm.tsx # نموذج إعادة تعيين كلمة المرور
│   └── users/
│       ├── UserForm.tsx          # نموذج إضافة/تعديل مستخدم
│       ├── UserTable.tsx         # جدول المستخدمين
│       └── UserPermissions.tsx   # إدارة الصلاحيات
```

---

## 🔄 تدفق العمليات (Workflows)

### 1. إنشاء مستخدم جديد (بواسطة الأدمن)
```
1. الأدمن يدخل: الإيميل، اليوزر، كلمة المرور، الاسم الكامل، الدور
2. التحقق من عدم وجود الإيميل/اليوزر مسبقاً
3. تشفير كلمة المرور
4. حفظ المستخدم في قاعدة البيانات
5. إرسال إيميل ترحيب للمستخدم الجديد (اختياري)
```

### 2. تسجيل الدخول
```
1. المستخدم يدخل: الإيميل/اليوزر + كلمة المرور
2. التحقق من وجود المستخدم في قاعدة البيانات
3. التحقق من صحة كلمة المرور
4. إنشاء رمز تحقق (6 أرقام)
5. إرسال الرمز للإيميل
6. توجيه المستخدم لصفحة التحقق
```

### 3. التحقق من الرمز
```
1. المستخدم يدخل رمز التحقق
2. التحقق من صحة الرمز وانتهاء صلاحيته
3. إنشاء جلسة مستخدم (session)
4. توجيه المستخدم للوحة التحكم حسب صلاحياته
```

### 4. نسيت كلمة المرور
```
1. المستخدم يدخل الإيميل
2. التحقق من وجود الإيميل في قاعدة البيانات
3. إنشاء رمز تحقق لإعادة تعيين كلمة المرور
4. إرسال الرمز للإيميل
5. المستخدم يدخل الرمز + كلمة المرور الجديدة
6. تحديث كلمة المرور في قاعدة البيانات
```

---

## 🛡️ نظام الصلاحيات

### الأدمن يرى:
- ✅ الصفحة الرئيسية
- ✅ سجل العملاء  
- ✅ سجل الموردين
- ✅ التقارير
- ✅ إدارة المستخدمين
- ✅ الإعدادات
- ✅ الدعم الفني

### الموظف يرى:
- ✅ الصفحة الرئيسية
- ✅ سجل العملاء
- ✅ سجل الموردين
- ❌ التقارير
- ❌ إدارة المستخدمين  
- ❌ الإعدادات
- ❌ الدعم الفني

---

## 🔧 التقنيات والمكتبات المطلوبة

### قاعدة البيانات:
- **Drizzle ORM** - للتعامل مع قاعدة البيانات
- **Neon PostgreSQL** - قاعدة البيانات السحابية
- **bcryptjs** - لتشفير كلمات المرور

### المصادقة والأمان:
- **jose** - للتعامل مع JWT tokens
- **crypto** - لإنشاء رموز التحقق
- **zod** - للتحقق من صحة البيانات

### الإيميل:
- **Resend** أو **Nodemailer** - لإرسال الإيميلات
- **React Email** - لتصميم قوالب الإيميلات

### الواجهة:
- **React Hook Form** - لإدارة النماذج
- **Zod** - للتحقق من البيانات
- **ShadCN/UI** - مكونات الواجهة (موجود مسبقاً)

---

## 📝 متغيرات البيئة المطلوبة (.env)

```env
# Database
DATABASE_URL="postgresql://..."

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Email Service
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourapp.com"

# App Settings
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Verification Code Settings
VERIFICATION_CODE_EXPIRY_MINUTES=10
MAX_LOGIN_ATTEMPTS=5
```

---

## 🚀 خطة التنفيذ المقترحة

### المرحلة 1: إعداد قاعدة البيانات
1. تصميم schema في `src/db/schema.ts`
2. إعداد migrations
3. تعريف types في `src/types/`

### المرحلة 2: نظام المصادقة الأساسي
1. إنشاء API routes للمصادقة
2. تطوير مكتبات التشفير والجلسات
3. إعداد نظام إرسال الإيميلات

### المرحلة 3: واجهة المستخدم
1. تطوير صفحات تسجيل الدخول والتحقق
2. تحديث صفحة إدارة المستخدمين
3. تطبيق نظام الصلاحيات في Sidebar

### المرحلة 4: الاختبار والتحسين
1. اختبار جميع العمليات
2. تحسين الأمان
3. إضافة معالجة الأخطاء

---

هل هذا التصور يتطابق مع ما تريده؟ أم تريد تعديل أو إضافة شيء معين؟