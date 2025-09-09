import { db } from '@/db/drizzle'
import { suppliers, supplierTransactions, supplierPaymentHistory } from '@/db/schema'
import { eq } from 'drizzle-orm'

async function testSuppliersDB() {
  console.log('🧪 اختبار جداول الموردين...')
  
  try {
    // 1. التحقق من جدول الموردين
    console.log('\n📋 1. فحص جدول الموردين:')
    const allSuppliers = await db.select().from(suppliers)
    console.log(`✅ جدول الموردين يعمل - عدد الموردين: ${allSuppliers.length}`)
    
    // 2. التحقق من جدول المعاملات
    console.log('\n📋 2. فحص جدول معاملات الموردين:')
    const allTransactions = await db.select().from(supplierTransactions)
    console.log(`✅ جدول معاملات الموردين يعمل - عدد المعاملات: ${allTransactions.length}`)
    
    // 3. التحقق من جدول المدفوعات
    console.log('\n📋 3. فحص جدول مدفوعات الموردين:')
    const allPayments = await db.select().from(supplierPaymentHistory)
    console.log(`✅ جدول مدفوعات الموردين يعمل - عدد المدفوعات: ${allPayments.length}`)
    
    // 4. إنشاء مورد تجريبي
    console.log('\n➕ 4. إنشاء مورد تجريبي:')
    const testSupplier = await db.insert(suppliers).values({
      name: 'مورد تجريبي',
      email: 'test@supplier.com',
      phone: '07xxxxxxxx',
      address: 'عنوان تجريبي',
      companyName: 'شركة موردين تجريبية',
      notes: 'مورد للاختبار'
    }).returning()
    
    console.log('✅ تم إنشاء المورد:', testSupplier[0].name)
    console.log('ID:', testSupplier[0].id)
    
    // 5. إضافة معاملة دين
    console.log('\n💰 5. إضافة دين للمورد:')
    const debtTransaction = await db.insert(supplierTransactions).values({
      supplierId: testSupplier[0].id,
      type: 'debt',
      amount: '2000.00',
      description: 'فاتورة مورد تجريبية',
      invoiceNumber: 'SUP-001',
      status: 'pending'
    }).returning()
    
    console.log('✅ تم إضافة الدين:', debtTransaction[0].amount)
    
    // 6. إضافة دفعة
    console.log('\n💳 6. إضافة دفعة:')
    const payment = await db.insert(supplierPaymentHistory).values({
      supplierId: testSupplier[0].id,
      transactionId: debtTransaction[0].id,
      amount: '1000.00',
      paymentMethod: 'bank_transfer',
      notes: 'دفعة جزئية للمورد'
    }).returning()
    
    console.log('✅ تم تسجيل الدفعة:', payment[0].amount)
    
    // 7. تنظيف البيانات التجريبية
    console.log('\n🧹 7. تنظيف البيانات التجريبية:')
    await db.delete(supplierPaymentHistory).where(eq(supplierPaymentHistory.id, payment[0].id))
    await db.delete(supplierTransactions).where(eq(supplierTransactions.id, debtTransaction[0].id))
    await db.delete(suppliers).where(eq(suppliers.id, testSupplier[0].id))
    
    console.log('✅ تم تنظيف البيانات التجريبية')
    
    console.log('\n🎉 جميع جداول الموردين تعمل بشكل صحيح!')
    
  } catch (error) {
    console.error('❌ خطأ في اختبار جداول الموردين:', error)
  }
}

testSuppliersDB()