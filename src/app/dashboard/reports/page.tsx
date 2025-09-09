"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Building2, Users, CreditCard, Receipt } from "lucide-react"
import { getReportsData } from "@/lib/actions/reports"
import { getSystemSettings } from "@/lib/actions/settings"
import type { SystemSettings } from "@/types/settings"

interface ReportsData {
  customers: any[];
  suppliers: any[];
  customerPayments: any[];
  supplierPayments: any[];
  customerTransactions: any[];
  supplierTransactions: any[];
  companySettings: SystemSettings | null;
}

export default function ReportsPage() {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [companySettings, setCompanySettings] = useState<SystemSettings | null>(null)

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [reportsResult, settingsResult] = await Promise.all([
          getReportsData(),
          getSystemSettings()
        ])
        
        if (reportsResult.success) {
          setReportsData(reportsResult.data as ReportsData)
        }
        
        if (settingsResult.success && settingsResult.data) {
          setCompanySettings(settingsResult.data as SystemSettings)
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري تحميل بيانات التقارير...</p>
        </div>
      </div>
    )
  }

  const suppliers = reportsData?.suppliers || []
  const customers = reportsData?.customers || []

  const generateSuppliersDebtReport = () => {
    const reportContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير ديون الموردين والتجار</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-info { margin-bottom: 20px; }
          .supplier-section { margin-bottom: 40px; page-break-inside: avoid; }
          .supplier-header { background-color: #f5f5f5; padding: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f9f9f9; }
          .total { font-weight: bold; background-color: #e8f4f8; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${companySettings?.companyLogoWebp || companySettings?.companyLogoPng ? `
            <picture style="display: block; text-align: center; margin: 0 auto 20px;">
              ${companySettings?.companyLogoWebp ? `<source srcset="${companySettings.companyLogoWebp}" type="image/webp">` : ''}
              <img src="${companySettings?.companyLogoPng || companySettings?.companyLogoWebp}" alt="شعار الشركة" style="max-height: 80px;">
            </picture>
          ` : ''}
          <h1>تقرير ديون الموردين والتجار</h1>
          <div class="company-info">
            <h2>${companySettings?.companyName || 'اسم الشركة'}</h2>
            ${companySettings?.companyDescription ? `<p>${companySettings.companyDescription}</p>` : ''}
            <p>تاريخ التقرير: ${new Date().toLocaleDateString("en-GB")}</p>
          </div>
        </div>
        
        ${suppliers
          .map(
            (supplier) => `
          <div class="supplier-section">
            <div class="supplier-header">
              <h3>التاجر: ${supplier.name}</h3>
              <p>الهاتف: ${supplier.phone || "غير محدد"} | العنوان: ${supplier.address || "غير محدد"}</p>
              <p>البريد الإلكتروني: ${supplier.email || "غير محدد"} | الشركة: ${supplier.companyName || "غير محدد"}</p>
              <p>تاريخ الإضافة: ${new Date(supplier.createdAt).toLocaleDateString("en-GB")}</p>
            </div>
            
            <h4>جدول الديون:</h4>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ (د.ع)</th>
                </tr>
              </thead>
              <tbody>
                ${reportsData?.supplierTransactions
                  .filter(transaction => transaction.supplierId === supplier.id && transaction.type === 'debt')
                  .map(transaction => `
                    <tr>
                      <td>${new Date(transaction.createdAt).toLocaleDateString("en-GB")}</td>
                      <td>${transaction.description || 'غير محدد'}</td>
                      <td>${Number(transaction.amount).toLocaleString("ar-SA")}</td>
                    </tr>
                  `).join("") || '<tr><td colspan="3">لا توجد ديون مسجلة</td></tr>'}
                <tr class="total">
                  <td colspan="2">إجمالي الديون</td>
                  <td>${Number(supplier.totalDebt || 0).toLocaleString("ar-SA")}</td>
                </tr>
              </tbody>
            </table>
            
            <h4>جدول التسديدات:</h4>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ (د.ع)</th>
                </tr>
              </thead>
              <tbody>
                ${reportsData?.supplierPayments
                  .filter(payment => payment.supplierId === supplier.id)
                  .map(payment => `
                    <tr>
                      <td>${new Date(payment.paidAt).toLocaleDateString("en-GB")}</td>
                      <td>${payment.notes || 'تسديد'}</td>
                      <td>${Number(payment.amount).toLocaleString("ar-SA")}</td>
                    </tr>
                  `).join("") || '<tr><td colspan="3">لا توجد تسديدات مسجلة</td></tr>'}
                <tr class="total">
                  <td colspan="2">إجمالي المدفوع</td>
                  <td>${Number(supplier.totalPaid || 0).toLocaleString("ar-SA")}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="total" style="padding: 10px; margin-top: 10px;">
              <strong>المبلغ المتبقي: ${(Number(supplier.totalDebt || 0) - Number(supplier.totalPaid || 0)).toLocaleString("ar-SA")} د.ع</strong>
            </div>
          </div>
        `,
          )
          .join("")}
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  const generateCustomersDebtReport = () => {
    const reportContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير ديون العملاء</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-info { margin-bottom: 20px; }
          .customer-section { margin-bottom: 40px; page-break-inside: avoid; }
          .customer-header { background-color: #f5f5f5; padding: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f9f9f9; }
          .total { font-weight: bold; background-color: #e8f4f8; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${companySettings?.companyLogoWebp || companySettings?.companyLogoPng ? `
            <picture style="display: block; text-align: center; margin: 0 auto 20px;">
              ${companySettings?.companyLogoWebp ? `<source srcset="${companySettings.companyLogoWebp}" type="image/webp">` : ''}
              <img src="${companySettings?.companyLogoPng || companySettings?.companyLogoWebp}" alt="شعار الشركة" style="max-height: 80px;">
            </picture>
          ` : ''}
          <h1>تقرير ديون العملاء</h1>
          <div class="company-info">
            <h2>${companySettings?.companyName || 'اسم الشركة'}</h2>
            ${companySettings?.companyDescription ? `<p>${companySettings.companyDescription}</p>` : ''}
            <p>تاريخ التقرير: ${new Date().toLocaleDateString("en-GB")}</p>
          </div>
        </div>
        
        ${customers
          .map(
            (customer) => `
          <div class="customer-section">
            <div class="customer-header">
              <h3>العميل: ${customer.name}</h3>
              <p>الهاتف: ${customer.phone || "غير محدد"} | العنوان: ${customer.address || "غير محدد"}</p>
              <p>البريد الإلكتروني: ${customer.email || "غير محدد"} | الشركة: ${customer.companyName || "غير محدد"}</p>
              <p>تاريخ الإضافة: ${new Date(customer.createdAt).toLocaleDateString("en-GB")}</p>
            </div>
            
            <h4>جدول الديون:</h4>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ (د.ع)</th>
                </tr>
              </thead>
              <tbody>
                ${reportsData?.customerTransactions
                  .filter(transaction => transaction.customerId === customer.id && transaction.type === 'debt')
                  .map(transaction => `
                    <tr>
                      <td>${new Date(transaction.createdAt).toLocaleDateString("en-GB")}</td>
                      <td>${transaction.description || 'غير محدد'}</td>
                      <td>${Number(transaction.amount).toLocaleString("ar-SA")}</td>
                    </tr>
                  `).join("") || '<tr><td colspan="3">لا توجد ديون مسجلة</td></tr>'}
                <tr class="total">
                  <td colspan="2">إجمالي الديون</td>
                  <td>${Number(customer.totalDebt || 0).toLocaleString("ar-SA")}</td>
                </tr>
              </tbody>
            </table>
            
            <h4>جدول التسديدات:</h4>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ (د.ع)</th>
                </tr>
              </thead>
              <tbody>
                ${reportsData?.customerPayments
                  .filter(payment => payment.customerId === customer.id)
                  .map(payment => `
                    <tr>
                      <td>${new Date(payment.paidAt).toLocaleDateString("en-GB")}</td>
                      <td>${payment.notes || 'تسديد'}</td>
                      <td>${Number(payment.amount).toLocaleString("ar-SA")}</td>
                    </tr>
                  `).join("") || '<tr><td colspan="3">لا توجد تسديدات مسجلة</td></tr>'}
                <tr class="total">
                  <td colspan="2">إجمالي المدفوع</td>
                  <td>${Number(customer.totalPaid || 0).toLocaleString("ar-SA")}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="total" style="padding: 10px; margin-top: 10px;">
              <strong>المبلغ المتبقي: ${(Number(customer.totalDebt || 0) - Number(customer.totalPaid || 0)).toLocaleString("ar-SA")} د.ع</strong>
            </div>
          </div>
        `,
          )
          .join("")}
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  const generateSuppliersPaymentReport = () => {
    // إنشاء قائمة بجميع مدفوعات الموردين مع أسماء الموردين
    const allPayments = (reportsData?.supplierPayments || []).map((payment) => {
      const supplier = suppliers.find(s => s.id === payment.supplierId)
      return {
        ...payment,
        supplierName: supplier?.name || 'مورد غير معروف',
      }
    })

    // ترتيب المدفوعات حسب التاريخ (الأحدث أولاً)
    allPayments.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())

    const reportContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير تسديد الموردين والتجار</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f9f9f9; }
          .total { font-weight: bold; background-color: #e8f4f8; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${companySettings?.companyLogoWebp || companySettings?.companyLogoPng ? `
            <picture style="display: block; text-align: center; margin: 0 auto 20px;">
              ${companySettings?.companyLogoWebp ? `<source srcset="${companySettings.companyLogoWebp}" type="image/webp">` : ''}
              <img src="${companySettings?.companyLogoPng || companySettings?.companyLogoWebp}" alt="شعار الشركة" style="max-height: 80px;">
            </picture>
          ` : ''}
          <h1>تقرير تسديد الموردين والتجار</h1>
          <div class="company-info">
            <h2>${companySettings?.companyName || 'اسم الشركة'}</h2>
            ${companySettings?.companyDescription ? `<p>${companySettings.companyDescription}</p>` : ''}
            <p>تاريخ التقرير: ${new Date().toLocaleDateString("en-GB")}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>اسم التاجر</th>
              <th>الوصف</th>
              <th>المبلغ (د.ع)</th>
            </tr>
          </thead>
          <tbody>
            ${allPayments.length > 0 ? allPayments
              .map(
                (payment) => `
              <tr>
                <td>${new Date(payment.paidAt).toLocaleDateString("en-GB")}</td>
                <td>${payment.supplierName}</td>
                <td>${payment.notes || 'تسديد'}</td>
                <td>${Number(payment.amount).toLocaleString("ar-SA")}</td>
              </tr>
            `,
              )
              .join("") : '<tr><td colspan="4">لا توجد مدفوعات مسجلة</td></tr>'}
            <tr class="total">
              <td colspan="3">إجمالي المدفوعات</td>
              <td>${allPayments.reduce((sum, payment) => sum + Number(payment.amount), 0).toLocaleString("ar-SA")}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  const generateCustomersPaymentReport = () => {
    // إنشاء قائمة بجميع مدفوعات العملاء مع أسماء العملاء
    const allPayments = (reportsData?.customerPayments || []).map((payment) => {
      const customer = customers.find(c => c.id === payment.customerId)
      return {
        ...payment,
        customerName: customer?.name || 'عميل غير معروف',
      }
    })

    // ترتيب المدفوعات حسب التاريخ (الأحدث أولاً)
    allPayments.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())

    const reportContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير تسديد العملاء</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f9f9f9; }
          .total { font-weight: bold; background-color: #e8f4f8; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${companySettings?.companyLogoWebp || companySettings?.companyLogoPng ? `
            <picture style="display: block; text-align: center; margin: 0 auto 20px;">
              ${companySettings?.companyLogoWebp ? `<source srcset="${companySettings.companyLogoWebp}" type="image/webp">` : ''}
              <img src="${companySettings?.companyLogoPng || companySettings?.companyLogoWebp}" alt="شعار الشركة" style="max-height: 80px;">
            </picture>
          ` : ''}
          <h1>تقرير تسديد العملاء</h1>
          <div class="company-info">
            <h2>${companySettings?.companyName || 'اسم الشركة'}</h2>
            ${companySettings?.companyDescription ? `<p>${companySettings.companyDescription}</p>` : ''}
            <p>تاريخ التقرير: ${new Date().toLocaleDateString("en-GB")}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>اسم العميل</th>
              <th>الوصف</th>
              <th>المبلغ (د.ع)</th>
            </tr>
          </thead>
          <tbody>
            ${allPayments.length > 0 ? allPayments
              .map(
                (payment) => `
              <tr>
                <td>${new Date(payment.paidAt).toLocaleDateString("en-GB")}</td>
                <td>${payment.customerName}</td>
                <td>${payment.notes || 'تسديد'}</td>
                <td>${Number(payment.amount).toLocaleString("ar-SA")}</td>
              </tr>
            `,
              )
              .join("") : '<tr><td colspan="4">لا توجد مدفوعات مسجلة</td></tr>'}
            <tr class="total">
              <td colspan="3">إجمالي المدفوعات</td>
              <td>${allPayments.reduce((sum, payment) => sum + Number(payment.amount), 0).toLocaleString("ar-SA")}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-right">
        <h1 className="text-3xl font-bold text-foreground">التقارير</h1>
        <p className="text-muted-foreground mt-2">إنشاء وطباعة التقارير المالية المفصلة</p>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Suppliers Debt Report */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={generateSuppliersDebtReport}>
          <CardHeader className="text-right">
            <CardTitle className="flex items-center gap-3 justify-end">
              <Building2 className="h-6 w-6 text-primary" />
              تقرير ديون الموردين والتجار
            </CardTitle>
            <CardDescription>تقرير مفصل لكل تاجر على حدة يعرض معلوماته وجدول ديونه وتسديداته</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                إنشاء التقرير
              </Button>
              <div className="text-sm text-muted-foreground">{suppliers.length} تاجر</div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Debt Report */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={generateCustomersDebtReport}>
          <CardHeader className="text-right">
            <CardTitle className="flex items-center gap-3 justify-end">
              <Users className="h-6 w-6 text-primary" />
              تقرير ديون العملاء
            </CardTitle>
            <CardDescription>تقرير مفصل لكل عميل على حدة يعرض معلوماته وجدول ديونه وتسديداته</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                إنشاء التقرير
              </Button>
              <div className="text-sm text-muted-foreground">{customers.length} عميل</div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Payment Report */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={generateSuppliersPaymentReport}>
          <CardHeader className="text-right">
            <CardTitle className="flex items-center gap-3 justify-end">
              <CreditCard className="h-6 w-6 text-secondary" />
              تقرير تسديد الموردين والتجار
            </CardTitle>
            <CardDescription>تقرير واحد يجمع كل الدفعات للموردين مرتبة حسب التاريخ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button variant="secondary" className="gap-2">
                <FileText className="h-4 w-4" />
                إنشاء التقرير
              </Button>
              <div className="text-sm text-muted-foreground">
                {reportsData?.supplierPayments?.length || 0} دفعة
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Payment Report */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={generateCustomersPaymentReport}>
          <CardHeader className="text-right">
            <CardTitle className="flex items-center gap-3 justify-end">
              <Receipt className="h-6 w-6 text-secondary" />
              تقرير تسديد العملاء
            </CardTitle>
            <CardDescription>تقرير واحد يجمع كل الدفعات من العملاء مرتبة حسب التاريخ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button variant="secondary" className="gap-2">
                <FileText className="h-4 w-4" />
                إنشاء التقرير
              </Button>
              <div className="text-sm text-muted-foreground">
                {reportsData?.customerPayments?.length || 0} دفعة
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader className="text-right">
          <CardTitle>تعليمات الطباعة</CardTitle>
        </CardHeader>
        <CardContent className="text-right space-y-2">
          <p className="text-muted-foreground">• اضغط على أي تقرير لإنشائه وعرضه في نافذة جديدة</p>
          <p className="text-muted-foreground">• استخدم خيار الطباعة في المتصفح لحفظ التقرير كملف PDF</p>
          <p className="text-muted-foreground">• يمكنك تخصيص معلومات الشركة من صفحة الإعدادات</p>
          <p className="text-muted-foreground">• جميع التقارير تحتوي على شعار الشركة وتاريخ الإنشاء</p>
        </CardContent>
      </Card>
    </div>
  )
}
