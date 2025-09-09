import { db } from '@/db/drizzle'
import { customers, customerTransactions, paymentHistory } from '@/db/schema'

async function testCustomersDB() {
  console.log('🧪 اختبار جداول العملاء...')
  
  try {
    // 1. التحقق من جدول العملاء
    console.log('\n📋 1. فحص جدول العملاء:')
    const allCustomers = await db.select().from(customers)
    console.log(`✅ جدول العملاء يعمل - عدد العملاء: ${allCustomers.length}`)
    
    // 2. التحقق من جدول المعاملات
    console.log('\n📋 2. فحص جدول المعاملات:')
    const allTransactions = await db.select().from(customerTransactions)
    console.log(`✅ جدول المعاملات يعمل - عدد المعاملات: ${allTransactions.length}`)
    
    // 3. التحقق من جدول المدفوعات
    console.log('\n📋 3. فحص جدول المدفوعات:')
    const allPayments = await db.select().from(paymentHistory)
    console.log(`✅ جدول المدفوعات يعمل - عدد المدفوعات: ${allPayments.length}`)
    
    // 4. إنشاء عميل تجريبي
    console.log('\n➕ 4. إنشاء عميل تجريبي:')
    const testCustomer = await db.insert(customers).values({
      name: 'عميل تجريبي',
      email: 'test@customer.com',
      phone: '07xxxxxxxx',
      address: 'عنوان تجريبي',
      companyName: 'شركة تجريبية',
      notes: 'عميل للاختبار'
    }).returning()
    
    console.log('✅ تم إنشاء العميل:', testCustomer[0].name)
    console.log('ID:', testCustomer[0].id)
    
    // 5. إضافة معاملة دين
    console.log('\n💰 5. إضافة دين للعميل:')
    const debtTransaction = await db.insert(customerTransactions).values({
      customerId: testCustomer[0].id,
      type: 'debt',
      amount: '1000.00',
      description: 'فاتورة تجريبية',
      invoiceNumber: 'INV-001',
      status: 'pending'
    }).returning()
    
    console.log('✅ تم إضافة الدين:', debtTransaction[0].amount)
    
    // 6. إضافة دفعة
    console.log('\n💳 6. إضافة دفعة:')
    const payment = await db.insert(paymentHistory).values({
      customerId: testCustomer[0].id,
      transactionId: debtTransaction[0].id,
      amount: '500.00',
      paymentMethod: 'cash',
      notes: 'دفعة جزئية'
    }).returning()
    
    console.log('✅ تم تسجيل الدفعة:', payment[0].amount)
    
    // 7. تنظيف البيانات التجريبية
    console.log('\n🧹 7. تنظيف البيانات التجريبية:')
    await db.delete(paymentHistory).where({ id: payment[0].id })
    await db.delete(customerTransactions).where({ id: debtTransaction[0].id })
    await db.delete(customers).where({ id: testCustomer[0].id })
    
    console.log('✅ تم تنظيف البيانات التجريبية')
    
    console.log('\n🎉 جميع جداول العملاء تعمل بشكل صحيح!')
    
  } catch (error) {
    console.error('❌ خطأ في اختبار جداول العملاء:', error)
  }
}

testCustomersDB()