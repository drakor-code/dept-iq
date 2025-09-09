'use server'

import { db } from '@/db/drizzle'
import { customers, customerTransactions, paymentHistory } from '@/db/schema'
import { eq, and, desc, sql, sum } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { 
  Customer, 
  CreateCustomerData, 
  UpdateCustomerData, 
  CreateTransactionData, 
  CreatePaymentData,
  CustomerWithTransactions,
  CustomerSummary 
} from '@/types/customer'
import type { ActionResult } from '@/types/auth'
import { getCurrentSession } from './auth-real'

// التحقق من تسجيل الدخول
async function requireAuth(): Promise<ActionResult | null> {
  try {
    const session = await getCurrentSession()
    if (!session) {
      return {
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      }
    }
    return null
  } catch (error) {
    console.error('❌ خطأ في التحقق من الجلسة:', error)
    return {
      success: false,
      message: 'خطأ في التحقق من الجلسة'
    }
  }
}

// جلب جميع العملاء
export async function getAllCustomers(): Promise<ActionResult<Customer[]>> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    console.log('🔍 جلب جميع العملاء...')

    const allCustomers = await db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt))

    console.log(`✅ تم العثور على ${allCustomers.length} عميل`)

    return {
      success: true,
      message: 'تم جلب العملاء بنجاح',
      data: allCustomers
    }
  } catch (error) {
    console.error('❌ خطأ في جلب العملاء:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء جلب العملاء'
    }
  }
}

// إنشاء عميل جديد
export async function createCustomer(data: CreateCustomerData): Promise<ActionResult<Customer>> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    const session = await getCurrentSession()

    console.log('➕ إنشاء عميل جديد:', data.name)

    const newCustomer = await db
      .insert(customers)
      .values({
        ...data,
        createdBy: session?.userId,
      })
      .returning()

    console.log('✅ تم إنشاء العميل بنجاح:', newCustomer[0].id)

    revalidatePath('/dashboard/customers')

    return {
      success: true,
      message: 'تم إنشاء العميل بنجاح',
      data: newCustomer[0]
    }
  } catch (error) {
    console.error('❌ خطأ في إنشاء العميل:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء إنشاء العميل'
    }
  }
}

// تحديث عميل
export async function updateCustomer(customerId: string, data: UpdateCustomerData): Promise<ActionResult<Customer>> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    console.log('✏️ تحديث العميل:', customerId)

    const updatedCustomer = await db
      .update(customers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(customers.id, customerId))
      .returning()

    if (updatedCustomer.length === 0) {
      return {
        success: false,
        message: 'العميل غير موجود'
      }
    }

    console.log('✅ تم تحديث العميل بنجاح')

    revalidatePath('/dashboard/customers')

    return {
      success: true,
      message: 'تم تحديث العميل بنجاح',
      data: updatedCustomer[0]
    }
  } catch (error) {
    console.error('❌ خطأ في تحديث العميل:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء تحديث العميل'
    }
  }
}

// حذف عميل
export async function deleteCustomer(customerId: string, forceDelete: boolean = false): Promise<ActionResult> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    console.log('🗑️ حذف العميل:', customerId)

    // التحقق من وجود معاملات للعميل
    const existingTransactions = await db
      .select()
      .from(customerTransactions)
      .where(eq(customerTransactions.customerId, customerId))
      .limit(1)

    if (existingTransactions.length > 0 && !forceDelete) {
      return {
        success: false,
        message: 'لا يمكن حذف العميل لوجود معاملات مرتبطة به',
        data: { hasTransactions: true }
      }
    }

    // إذا كان الحذف قسري، حذف جميع البيانات المرتبطة
    if (forceDelete) {
      // حذف سجل المدفوعات أولاً
      await db
        .delete(paymentHistory)
        .where(eq(paymentHistory.customerId, customerId))

      // حذف المعاملات
      await db
        .delete(customerTransactions)
        .where(eq(customerTransactions.customerId, customerId))
    }

    const deletedCustomer = await db
      .delete(customers)
      .where(eq(customers.id, customerId))
      .returning()

    if (deletedCustomer.length === 0) {
      return {
        success: false,
        message: 'العميل غير موجود'
      }
    }

    console.log('✅ تم حذف العميل بنجاح')

    revalidatePath('/dashboard/customers')

    return {
      success: true,
      message: 'تم حذف العميل وجميع بياناته بنجاح'
    }
  } catch (error) {
    console.error('❌ خطأ في حذف العميل:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء حذف العميل'
    }
  }
}

// جلب عميل مع معاملاته
export async function getCustomerWithTransactions(customerId: string): Promise<ActionResult<CustomerWithTransactions>> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    console.log('🔍 جلب تفاصيل العميل:', customerId)

    // جلب بيانات العميل
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1)

    if (customer.length === 0) {
      return {
        success: false,
        message: 'العميل غير موجود'
      }
    }

    // جلب معاملات العميل
    const transactions = await db
      .select()
      .from(customerTransactions)
      .where(eq(customerTransactions.customerId, customerId))
      .orderBy(desc(customerTransactions.createdAt))

    // جلب سجل المدفوعات
    const payments = await db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.customerId, customerId))
      .orderBy(desc(paymentHistory.paidAt))

    const customerWithTransactions: CustomerWithTransactions = {
      ...customer[0],
      transactions,
      payments
    }

    return {
      success: true,
      message: 'تم جلب تفاصيل العميل بنجاح',
      data: customerWithTransactions
    }
  } catch (error) {
    console.error('❌ خطأ في جلب تفاصيل العميل:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء جلب تفاصيل العميل'
    }
  }
}

// إضافة دين جديد
export async function addDebt(data: CreateTransactionData): Promise<ActionResult> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    const session = await getCurrentSession()

    console.log('💰 إضافة دين جديد للعميل:', data.customerId)

    // إنشاء المعاملة
    const newTransaction = await db
      .insert(customerTransactions)
      .values({
        ...data,
        type: 'debt',
        amount: data.amount.toString(),
        status: 'pending',
        createdBy: session?.userId,
      })
      .returning()

    // تحديث إجمالي الديون للعميل
    await db
      .update(customers)
      .set({
        totalDebt: sql`${customers.totalDebt} + ${data.amount}`,
        updatedAt: new Date()
      })
      .where(eq(customers.id, data.customerId))

    console.log('✅ تم إضافة الدين بنجاح')

    revalidatePath('/dashboard/customers')

    return {
      success: true,
      message: 'تم إضافة الدين بنجاح',
      data: newTransaction[0]
    }
  } catch (error) {
    console.error('❌ خطأ في إضافة الدين:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء إضافة الدين'
    }
  }
}

// تسديد دين
export async function makePayment(data: CreatePaymentData): Promise<ActionResult> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    const session = await getCurrentSession()

    console.log('💳 تسديد دفعة للعميل:', data.customerId)

    // جلب بيانات العميل الحالية للتحقق من الرصيد
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, data.customerId))
      .limit(1)

    if (customer.length === 0) {
      return {
        success: false,
        message: 'العميل غير موجود'
      }
    }

    const currentDebt = Number(customer[0].totalDebt || 0)
    const currentPaid = Number(customer[0].totalPaid || 0)
    const remainingDebt = currentDebt - currentPaid
    const paymentAmount = Number(data.amount)

    // التحقق من أن المبلغ المدفوع لا يتجاوز الدين المتبقي
    if (paymentAmount > remainingDebt) {
      return {
        success: false,
        message: `المبلغ المدفوع (${paymentAmount.toLocaleString()} د.ع) أكثر من الدين المطلوب (${remainingDebt.toLocaleString()} د.ع). لا يمكن قبول هذه المعاملة.`
      }
    }

    // إضافة سجل الدفع
    const newPayment = await db
      .insert(paymentHistory)
      .values({
        ...data,
        amount: data.amount.toString(),
        createdBy: session?.userId,
      })
      .returning()

    // تحديث إجمالي المدفوعات للعميل
    await db
      .update(customers)
      .set({
        totalPaid: sql`${customers.totalPaid} + ${data.amount}`,
        updatedAt: new Date()
      })
      .where(eq(customers.id, data.customerId))

    // إذا كان الدفع مرتبط بمعاملة محددة، تحديث حالتها
    if (data.transactionId) {
      await db
        .update(customerTransactions)
        .set({
          paidDate: new Date(),
          status: 'paid',
          updatedAt: new Date()
        })
        .where(eq(customerTransactions.id, data.transactionId))
    }

    console.log('✅ تم تسجيل الدفعة بنجاح')

    revalidatePath('/dashboard/customers')

    return {
      success: true,
      message: 'تم تسجيل الدفعة بنجاح',
      data: newPayment[0]
    }
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدفعة:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدفعة'
    }
  }
}

// جلب ملخص العملاء
export async function getCustomersSummary(): Promise<ActionResult<CustomerSummary>> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    console.log('📊 جلب ملخص العملاء...')

    // إحصائيات العملاء
    const totalCustomers = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)

    const activeCustomers = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(eq(customers.isActive, true))

    // إجمالي الديون والمدفوعات
    const debtSummary = await db
      .select({
        totalDebt: sql<string>`sum(${customers.totalDebt})`,
        totalPaid: sql<string>`sum(${customers.totalPaid})`
      })
      .from(customers)

    // المعاملات المتأخرة
    const overdueTransactions = await db
      .select({ count: sql<number>`count(*)` })
      .from(customerTransactions)
      .where(
        and(
          eq(customerTransactions.status, 'pending'),
          sql`${customerTransactions.dueDate} < NOW()`
        )
      )

    const summary: CustomerSummary = {
      totalCustomers: totalCustomers[0]?.count || 0,
      activeCustomers: activeCustomers[0]?.count || 0,
      totalOutstandingDebt: debtSummary[0]?.totalDebt || '0.00',
      totalPaidAmount: debtSummary[0]?.totalPaid || '0.00',
      overdueTransactions: overdueTransactions[0]?.count || 0
    }

    return {
      success: true,
      message: 'تم جلب ملخص العملاء بنجاح',
      data: summary
    }
  } catch (error) {
    console.error('❌ خطأ في جلب ملخص العملاء:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء جلب ملخص العملاء'
    }
  }
}