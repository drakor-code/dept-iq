'use server'

import { db } from '@/db/drizzle'
import { suppliers, supplierTransactions, supplierPaymentHistory } from '@/db/schema'
import { eq, and, desc, sql, sum } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { 
  Supplier, 
  CreateSupplierData, 
  UpdateSupplierData, 
  CreateSupplierTransactionData, 
  CreateSupplierPaymentData,
  SupplierWithTransactions,
  SupplierSummary 
} from '@/types/supplier'
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

// جلب جميع الموردين
export async function getAllSuppliers(): Promise<ActionResult<Supplier[]>> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    console.log('🔍 جلب جميع الموردين...')

    const allSuppliers = await db
      .select()
      .from(suppliers)
      .orderBy(desc(suppliers.createdAt))

    console.log(`✅ تم العثور على ${allSuppliers.length} مورد`)

    return {
      success: true,
      message: 'تم جلب الموردين بنجاح',
      data: allSuppliers
    }
  } catch (error) {
    console.error('❌ خطأ في جلب الموردين:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء جلب الموردين'
    }
  }
}

// إنشاء مورد جديد
export async function createSupplier(data: CreateSupplierData): Promise<ActionResult<Supplier>> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    const session = await getCurrentSession()

    console.log('➕ إنشاء مورد جديد:', data.name)

    const newSupplier = await db
      .insert(suppliers)
      .values({
        ...data,
        createdBy: session?.userId,
      })
      .returning()

    console.log('✅ تم إنشاء المورد بنجاح:', newSupplier[0].id)

    revalidatePath('/dashboard/suppliers')

    return {
      success: true,
      message: 'تم إنشاء المورد بنجاح',
      data: newSupplier[0]
    }
  } catch (error) {
    console.error('❌ خطأ في إنشاء المورد:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء إنشاء المورد'
    }
  }
}

// تحديث مورد
export async function updateSupplier(supplierId: string, data: UpdateSupplierData): Promise<ActionResult<Supplier>> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    console.log('✏️ تحديث المورد:', supplierId)

    const updatedSupplier = await db
      .update(suppliers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(suppliers.id, supplierId))
      .returning()

    if (updatedSupplier.length === 0) {
      return {
        success: false,
        message: 'المورد غير موجود'
      }
    }

    console.log('✅ تم تحديث المورد بنجاح')

    revalidatePath('/dashboard/suppliers')

    return {
      success: true,
      message: 'تم تحديث المورد بنجاح',
      data: updatedSupplier[0]
    }
  } catch (error) {
    console.error('❌ خطأ في تحديث المورد:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء تحديث المورد'
    }
  }
}

// حذف مورد
export async function deleteSupplier(supplierId: string, forceDelete: boolean = false): Promise<ActionResult> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    console.log('🗑️ حذف المورد:', supplierId)

    // التحقق من وجود معاملات للمورد
    const existingTransactions = await db
      .select()
      .from(supplierTransactions)
      .where(eq(supplierTransactions.supplierId, supplierId))
      .limit(1)

    if (existingTransactions.length > 0 && !forceDelete) {
      return {
        success: false,
        message: 'لا يمكن حذف المورد لوجود معاملات مرتبطة به',
        data: { hasTransactions: true }
      }
    }

    // إذا كان الحذف قسري، حذف جميع البيانات المرتبطة
    if (forceDelete) {
      // حذف سجل المدفوعات أولاً
      await db
        .delete(supplierPaymentHistory)
        .where(eq(supplierPaymentHistory.supplierId, supplierId))

      // حذف المعاملات
      await db
        .delete(supplierTransactions)
        .where(eq(supplierTransactions.supplierId, supplierId))
    }

    const deletedSupplier = await db
      .delete(suppliers)
      .where(eq(suppliers.id, supplierId))
      .returning()

    if (deletedSupplier.length === 0) {
      return {
        success: false,
        message: 'المورد غير موجود'
      }
    }

    console.log('✅ تم حذف المورد بنجاح')

    revalidatePath('/dashboard/suppliers')

    return {
      success: true,
      message: 'تم حذف المورد وجميع بياناته بنجاح'
    }
  } catch (error) {
    console.error('❌ خطأ في حذف المورد:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء حذف المورد'
    }
  }
}

// جلب مورد مع معاملاته
export async function getSupplierWithTransactions(supplierId: string): Promise<ActionResult<SupplierWithTransactions>> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    console.log('🔍 جلب تفاصيل المورد:', supplierId)

    // جلب بيانات المورد
    const supplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, supplierId))
      .limit(1)

    if (supplier.length === 0) {
      return {
        success: false,
        message: 'المورد غير موجود'
      }
    }

    // جلب معاملات المورد
    const transactions = await db
      .select()
      .from(supplierTransactions)
      .where(eq(supplierTransactions.supplierId, supplierId))
      .orderBy(desc(supplierTransactions.createdAt))

    // جلب سجل المدفوعات
    const payments = await db
      .select()
      .from(supplierPaymentHistory)
      .where(eq(supplierPaymentHistory.supplierId, supplierId))
      .orderBy(desc(supplierPaymentHistory.paidAt))

    const supplierWithTransactions: SupplierWithTransactions = {
      ...supplier[0],
      transactions,
      payments
    }

    return {
      success: true,
      message: 'تم جلب تفاصيل المورد بنجاح',
      data: supplierWithTransactions
    }
  } catch (error) {
    console.error('❌ خطأ في جلب تفاصيل المورد:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء جلب تفاصيل المورد'
    }
  }
}

// إضافة دين جديد
export async function addSupplierDebt(data: CreateSupplierTransactionData): Promise<ActionResult> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    const session = await getCurrentSession()

    console.log('💰 إضافة دين جديد للمورد:', data.supplierId)

    // إنشاء المعاملة
    const newTransaction = await db
      .insert(supplierTransactions)
      .values({
        ...data,
        type: 'debt',
        amount: data.amount.toString(),
        status: 'pending',
        createdBy: session?.userId,
      })
      .returning()

    // تحديث إجمالي الديون للمورد
    await db
      .update(suppliers)
      .set({
        totalDebt: sql`${suppliers.totalDebt} + ${data.amount}`,
        updatedAt: new Date()
      })
      .where(eq(suppliers.id, data.supplierId))

    console.log('✅ تم إضافة الدين بنجاح')

    revalidatePath('/dashboard/suppliers')

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
export async function makeSupplierPayment(data: CreateSupplierPaymentData): Promise<ActionResult> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    const session = await getCurrentSession()

    console.log('💳 تسديد دفعة للمورد:', data.supplierId)

    // جلب بيانات المورد الحالية للتحقق من الرصيد
    const supplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, data.supplierId))
      .limit(1)

    if (supplier.length === 0) {
      return {
        success: false,
        message: 'المورد غير موجود'
      }
    }

    const currentDebt = Number(supplier[0].totalDebt || 0)
    const currentPaid = Number(supplier[0].totalPaid || 0)
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
      .insert(supplierPaymentHistory)
      .values({
        ...data,
        amount: data.amount.toString(),
        createdBy: session?.userId,
      })
      .returning()

    // تحديث إجمالي المدفوعات للمورد
    await db
      .update(suppliers)
      .set({
        totalPaid: sql`${suppliers.totalPaid} + ${data.amount}`,
        updatedAt: new Date()
      })
      .where(eq(suppliers.id, data.supplierId))

    // إذا كان الدفع مرتبط بمعاملة محددة، تحديث حالتها
    if (data.transactionId) {
      await db
        .update(supplierTransactions)
        .set({
          paidDate: new Date(),
          status: 'paid',
          updatedAt: new Date()
        })
        .where(eq(supplierTransactions.id, data.transactionId))
    }

    console.log('✅ تم تسجيل الدفعة بنجاح')

    revalidatePath('/dashboard/suppliers')

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

// جلب ملخص الموردين
export async function getSuppliersSummary(): Promise<ActionResult<SupplierSummary>> {
  try {
    const authCheck = await requireAuth()
    if (authCheck) return authCheck

    console.log('📊 جلب ملخص الموردين...')

    // إحصائيات الموردين
    const totalSuppliers = await db
      .select({ count: sql<number>`count(*)` })
      .from(suppliers)

    const activeSuppliers = await db
      .select({ count: sql<number>`count(*)` })
      .from(suppliers)
      .where(eq(suppliers.isActive, true))

    // إجمالي الديون والمدفوعات
    const debtSummary = await db
      .select({
        totalDebt: sql<string>`sum(${suppliers.totalDebt})`,
        totalPaid: sql<string>`sum(${suppliers.totalPaid})`
      })
      .from(suppliers)

    // المعاملات المتأخرة
    const overdueTransactions = await db
      .select({ count: sql<number>`count(*)` })
      .from(supplierTransactions)
      .where(
        and(
          eq(supplierTransactions.status, 'pending'),
          sql`${supplierTransactions.dueDate} < NOW()`
        )
      )

    const summary: SupplierSummary = {
      totalSuppliers: totalSuppliers[0]?.count || 0,
      activeSuppliers: activeSuppliers[0]?.count || 0,
      totalOutstandingDebt: debtSummary[0]?.totalDebt || '0.00',
      totalPaidAmount: debtSummary[0]?.totalPaid || '0.00',
      overdueTransactions: overdueTransactions[0]?.count || 0
    }

    return {
      success: true,
      message: 'تم جلب ملخص الموردين بنجاح',
      data: summary
    }
  } catch (error) {
    console.error('❌ خطأ في جلب ملخص الموردين:', error)
    return {
      success: false,
      message: 'حدث خطأ أثناء جلب ملخص الموردين'
    }
  }
}