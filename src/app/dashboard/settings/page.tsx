"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Save, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { getSystemSettings, saveSystemSettings, createBackup, restoreBackup } from "@/lib/actions/settings";
import type { SystemSettings, BackupData } from "@/types/settings";

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [companyLogoWebp, setCompanyLogoWebp] = useState("")
  const [companyLogoPng, setCompanyLogoPng] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // دالة تحويل الصورة إلى WebP
  const convertToWebP = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // تحديد أقصى عرض وارتفاع للشعار
        const maxWidth = 300
        const maxHeight = 300
        
        let { width, height } = img
        
        // تصغير الصورة إذا كانت كبيرة
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)
        
        // تحويل إلى WebP بجودة 85%
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          } else {
            reject(new Error('فشل في تحويل الصورة إلى WebP'))
          }
        }, 'image/webp', 0.85)
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  // دالة تحويل الصورة إلى PNG (fallback)
  const convertToPNG = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // تحديد أقصى عرض وارتفاع للشعار
        const maxWidth = 300
        const maxHeight = 300
        
        let { width, height } = img
        
        // تصغير الصورة إذا كانت كبيرة
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)
        
        // تحويل إلى PNG
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          } else {
            reject(new Error('فشل في تحويل الصورة إلى PNG'))
          }
        }, 'image/png')
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  // التحقق من صلاحيات المدير
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ليس لديك صلاحية للوصول إلى هذه الصفحة. هذه الصفحة متاحة للمدير فقط.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // جلب الإعدادات الحالية
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const result = await getSystemSettings();
        if (result.success && result.data) {
          const settingsData = result.data as SystemSettings;
          setSettings(settingsData);
          setCompanyName(settingsData.companyName || "");
          setCompanyDescription(settingsData.companyDescription || "");
          setCompanyLogoWebp(settingsData.companyLogoWebp || "");
          setCompanyLogoPng(settingsData.companyLogoPng || "");
        }
      } catch (error) {
        console.error("خطأ في جلب الإعدادات:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // حفظ الإعدادات
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const result = await saveSystemSettings({
        companyName,
        companyDescription,
        companyLogoWebp,
        companyLogoPng
      });
      
      if (result.success) {
        alert("تم حفظ الإعدادات بنجاح");
      } else {
        alert("حدث خطأ أثناء حفظ الإعدادات");
      }
    } catch (error) {
      console.error("خطأ في حفظ الإعدادات:", error);
      alert("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  // رفع شعار الشركة
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
          alert('يرجى اختيار ملف صورة صالح');
          return;
        }

        // التحقق من حجم الملف (أقصى 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('حجم الملف كبير جداً. يرجى اختيار صورة أصغر من 5MB');
          return;
        }

        // تحويل إلى WebP و PNG
        const [webpResult, pngResult] = await Promise.all([
          convertToWebP(file),
          convertToPNG(file)
        ]);

        setCompanyLogoWebp(webpResult);
        setCompanyLogoPng(pngResult);
        
        alert('تم رفع الشعار بنجاح');
      } catch (error) {
        console.error('خطأ في رفع الشعار:', error);
        alert('حدث خطأ أثناء معالجة الصورة');
      }
    }
  };

  // إنشاء نسخة احتياطية
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const result = await createBackup();
      if (result.success && result.data) {
        const backupData = result.data as BackupData;
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert("تم إنشاء النسخة الاحتياطية وتحميلها بنجاح");
      } else {
        alert("حدث خطأ أثناء إنشاء النسخة الاحتياطية");
      }
    } catch (error) {
      console.error("خطأ في إنشاء النسخة الاحتياطية:", error);
      alert("حدث خطأ أثناء إنشاء النسخة الاحتياطية");
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // استعادة نسخة احتياطية
  const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string) as BackupData;
          
          setIsRestoringBackup(true);
          const result = await restoreBackup(backupData);
          
          if (result.success) {
            alert("تم استعادة النسخة الاحتياطية بنجاح");
            window.location.reload(); // إعادة تحميل الصفحة لعرض البيانات المستعادة
          } else {
            alert("حدث خطأ أثناء استعادة النسخة الاحتياطية");
          }
        } catch (error) {
          console.error("خطأ في استعادة النسخة الاحتياطية:", error);
          alert("ملف النسخة الاحتياطية غير صالح");
        } finally {
          setIsRestoringBackup(false);
        }
      };
      reader.readAsText(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات النظام والنسخ الاحتياطي</p>
      </div>

      {/* القسم الأول: الإعدادات العامة */}
      <Card>
        <CardHeader>
          <CardTitle>الإعدادات العامة</CardTitle>
          <CardDescription>
            معلومات الشركة التي ستظهر في التقارير المطبوعة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">اسم الشركة</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="أدخل اسم الشركة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyDescription">وصف الشركة</Label>
            <Textarea
              id="companyDescription"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="أدخل وصف موجز عن نشاط الشركة"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>شعار الشركة</Label>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                اختيار شعار
              </Button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              {companyLogoWebp || companyLogoPng ? (
                <div className="flex items-center gap-2">
                  <picture>
                    {companyLogoWebp && (
                      <source srcSet={companyLogoWebp} type="image/webp" />
                    )}
                    <img
                      src={companyLogoPng || companyLogoWebp}
                      alt="شعار الشركة"
                      className="h-12 w-12 object-contain border rounded"
                    />
                  </picture>
                  <div className="text-sm text-muted-foreground">
                    <div>تم رفع الشعار</div>
                    <div className="text-xs text-green-600">
                      WebP: {companyLogoWebp ? 'متوفر' : 'غير متوفر'} | 
                      PNG: {companyLogoPng ? 'متوفر' : 'غير متوفر'}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">لم يتم رفع أي شعار</span>
              )}
            </div>
          </div>

          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* القسم الثاني: عمليات قاعدة البيانات */}
      <Card>
        <CardHeader>
          <CardTitle>عمليات قاعدة البيانات</CardTitle>
          <CardDescription>
            إدارة النسخ الاحتياطي واستعادة البيانات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              يجب تشغيل البرنامج كمسؤول حتى تتم العمليات للسيرفر والمساعدة
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isCreatingBackup ? "جاري إنشاء النسخة..." : "نسخة احتياطية"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isRestoringBackup}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isRestoringBackup ? "جاري الاستعادة..." : "استعادة نسخة احتياطية"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد استعادة النسخة الاحتياطية</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد؟ سيتم حذف جميع البيانات الحالية واستبدالها بالبيانات الموجودة في ملف النسخة الاحتياطية. هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    تأكيد الاستعادة
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}