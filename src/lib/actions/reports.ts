"use server";

import { db } from "@/db/drizzle";
import { customers, suppliers, paymentHistory, supplierPaymentHistory, customerTransactions, supplierTransactions, systemSettings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { ActionResult } from "@/types/auth";

// جلب بيانات التقارير الكاملة
export async function getReportsData(): Promise<ActionResult> {
  try {
    const [
      allCustomers,
      allSuppliers,
      allCustomerPayments,
      allSupplierPayments,
      allCustomerTransactions,
      allSupplierTransactions,
      settings
    ] = await Promise.all([
      db.select().from(customers).where(eq(customers.isActive, true)),
      db.select().from(suppliers).where(eq(suppliers.isActive, true)),
      db.select().from(paymentHistory).orderBy(desc(paymentHistory.paidAt)),
      db.select().from(supplierPaymentHistory).orderBy(desc(supplierPaymentHistory.paidAt)),
      db.select().from(customerTransactions).orderBy(desc(customerTransactions.createdAt)),
      db.select().from(supplierTransactions).orderBy(desc(supplierTransactions.createdAt)),
      db.select().from(systemSettings).limit(1)
    ]);

    return {
      success: true,
      message: "تم جلب بيانات التقارير بنجاح",
      data: {
        customers: allCustomers,
        suppliers: allSuppliers,
        customerPayments: allCustomerPayments,
        supplierPayments: allSupplierPayments,
        customerTransactions: allCustomerTransactions,
        supplierTransactions: allSupplierTransactions,
        companySettings: settings[0] || null
      }
    };
  } catch (error) {
    console.error("خطأ في جلب بيانات التقارير:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء جلب بيانات التقارير"
    };
  }
}

// جلب بيانات مورد محدد مع معاملاته ومدفوعاته
export async function getSupplierReportData(supplierId: string): Promise<ActionResult> {
  try {
    const [
      supplier,
      transactions,
      payments,
      settings
    ] = await Promise.all([
      db.select().from(suppliers).where(eq(suppliers.id, supplierId)).limit(1),
      db.select().from(supplierTransactions).where(eq(supplierTransactions.supplierId, supplierId)).orderBy(desc(supplierTransactions.createdAt)),
      db.select().from(supplierPaymentHistory).where(eq(supplierPaymentHistory.supplierId, supplierId)).orderBy(desc(supplierPaymentHistory.paidAt)),
      db.select().from(systemSettings).limit(1)
    ]);

    if (supplier.length === 0) {
      return {
        success: false,
        message: "المورد غير موجود"
      };
    }

    return {
      success: true,
      message: "تم جلب بيانات المورد بنجاح",
      data: {
        supplier: supplier[0],
        transactions,
        payments,
        companySettings: settings[0] || null
      }
    };
  } catch (error) {
    console.error("خطأ في جلب بيانات المورد:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء جلب بيانات المورد"
    };
  }
}

// جلب بيانات عميل محدد مع معاملاته ومدفوعاته
export async function getCustomerReportData(customerId: string): Promise<ActionResult> {
  try {
    const [
      customer,
      transactions,
      payments,
      settings
    ] = await Promise.all([
      db.select().from(customers).where(eq(customers.id, customerId)).limit(1),
      db.select().from(customerTransactions).where(eq(customerTransactions.customerId, customerId)).orderBy(desc(customerTransactions.createdAt)),
      db.select().from(paymentHistory).where(eq(paymentHistory.customerId, customerId)).orderBy(desc(paymentHistory.paidAt)),
      db.select().from(systemSettings).limit(1)
    ]);

    if (customer.length === 0) {
      return {
        success: false,
        message: "العميل غير موجود"
      };
    }

    return {
      success: true,
      message: "تم جلب بيانات العميل بنجاح",
      data: {
        customer: customer[0],
        transactions,
        payments,
        companySettings: settings[0] || null
      }
    };
  } catch (error) {
    console.error("خطأ في جلب بيانات العميل:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء جلب بيانات العميل"
    };
  }
}