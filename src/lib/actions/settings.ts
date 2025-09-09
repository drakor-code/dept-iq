"use server";

import { db } from "@/db/drizzle";
import { systemSettings, users, customers, suppliers, paymentHistory, supplierPaymentHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { ActionResult } from "@/types/auth";
import type { SystemSettingsInput, BackupData } from "@/types/settings";
import { revalidatePath } from "next/cache";

// الحصول على الإعدادات الحالية
export async function getSystemSettings(): Promise<ActionResult> {
  try {
    const settings = await db.select().from(systemSettings).limit(1);
    
    return {
      success: true,
      message: "تم جلب الإعدادات بنجاح",
      data: settings[0] || null
    };
  } catch (error) {
    console.error("خطأ في جلب الإعدادات:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء جلب الإعدادات"
    };
  }
}

// حفظ أو تحديث الإعدادات
export async function saveSystemSettings(settingsData: SystemSettingsInput): Promise<ActionResult> {
  try {
    const existingSettings = await db.select().from(systemSettings).limit(1);
    
    if (existingSettings.length > 0) {
      // تحديث الإعدادات الموجودة
      await db
        .update(systemSettings)
        .set({
          ...settingsData,
          updatedAt: new Date()
        })
        .where(eq(systemSettings.id, existingSettings[0].id));
    } else {
      // إنشاء إعدادات جديدة
      await db.insert(systemSettings).values({
        ...settingsData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // revalidatePath only works in Next.js runtime
    try {
      revalidatePath("/dashboard/settings");
    } catch (error) {
      // Ignore revalidation errors in non-Next.js environments
    }
    
    return {
      success: true,
      message: "تم حفظ الإعدادات بنجاح"
    };
  } catch (error) {
    console.error("خطأ في حفظ الإعدادات:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء حفظ الإعدادات"
    };
  }
}

// إنشاء نسخة احتياطية
export async function createBackup(): Promise<ActionResult<BackupData>> {
  try {
    const [
      allUsers,
      allCustomers,
      allSuppliers,
      allCustomerPayments,
      allSupplierPayments,
      allSettings
    ] = await Promise.all([
      db.select().from(users),
      db.select().from(customers),
      db.select().from(suppliers),
      db.select().from(paymentHistory),
      db.select().from(supplierPaymentHistory),
      db.select().from(systemSettings)
    ]);

    const backupData: BackupData = {
      users: allUsers,
      customers: allCustomers,
      suppliers: allSuppliers,
      customerPayments: allCustomerPayments,
      supplierPayments: allSupplierPayments,
      systemSettings: allSettings,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };

    return {
      success: true,
      message: "تم إنشاء النسخة الاحتياطية بنجاح",
      data: backupData
    };
  } catch (error) {
    console.error("خطأ في إنشاء النسخة الاحتياطية:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء إنشاء النسخة الاحتياطية"
    };
  }
}

// استعادة النسخة الاحتياطية
export async function restoreBackup(backupData: BackupData): Promise<ActionResult> {
  try {
    // حذف جميع البيانات الحالية
    await Promise.all([
      db.delete(paymentHistory),
      db.delete(supplierPaymentHistory),
      db.delete(customers),
      db.delete(suppliers),
      db.delete(systemSettings),
      // لا نحذف المستخدمين لأسباب أمنية
    ]);

    // استعادة البيانات من النسخة الاحتياطية
    if (backupData.systemSettings.length > 0) {
      await db.insert(systemSettings).values(backupData.systemSettings);
    }
    
    if (backupData.customers.length > 0) {
      await db.insert(customers).values(backupData.customers);
    }
    
    if (backupData.suppliers.length > 0) {
      await db.insert(suppliers).values(backupData.suppliers);
    }
    
    if (backupData.customerPayments.length > 0) {
      await db.insert(paymentHistory).values(backupData.customerPayments);
    }
    
    if (backupData.supplierPayments.length > 0) {
      await db.insert(supplierPaymentHistory).values(backupData.supplierPayments);
    }

    // revalidatePath only works in Next.js runtime
    try {
      revalidatePath("/dashboard");
    } catch (error) {
      // Ignore revalidation errors in non-Next.js environments
    }
    
    return {
      success: true,
      message: "تم استعادة النسخة الاحتياطية بنجاح"
    };
  } catch (error) {
    console.error("خطأ في استعادة النسخة الاحتياطية:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء استعادة النسخة الاحتياطية"
    };
  }
}