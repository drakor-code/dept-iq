"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Phone, Mail, Globe, FileText, ShoppingCart, Archive, Users } from "lucide-react";

export default function SupportPage() {
  // معلومات الشركة والتواصل
  const companyInfo = {
    name: "شركة التقنيات المتقدمة",
    logo: "/placeholder-logo.svg", // يمكن تغييرها لاحقاً
    phone: "+966 11 123 4567",
    email: "support@advanced-tech.com",
    website: "https://www.advanced-tech.com",
    productPage: "https://www.advanced-tech.com/debt-iq"
  };

  // البرامج الأخرى
  const otherPrograms = [
    {
      name: "نظام الأرشفة الإلكترونية",
      image: "/placeholder.svg",
      link: "https://www.advanced-tech.com/archive-system",
      icon: Archive
    },
    {
      name: "نظام المتاجر الإلكترونية",
      image: "/placeholder.svg", 
      link: "https://www.advanced-tech.com/ecommerce-system",
      icon: ShoppingCart
    },
    {
      name: "نظام إدارة الموظفين",
      image: "/placeholder.svg",
      link: "https://www.advanced-tech.com/hr-system", 
      icon: Users
    },
    {
      name: "نظام إدارة المستندات",
      image: "/placeholder.svg",
      link: "https://www.advanced-tech.com/document-system",
      icon: FileText
    }
  ];

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">الدعم الفني</h1>
        <p className="text-muted-foreground">معلومات التواصل والمساعدة</p>
      </div>

      {/* القسم الأول: نبذة عن البرنامج */}
      <Card>
        <CardHeader>
          <CardTitle>نبذة عن البرنامج</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-right">
            <p className="text-muted-foreground leading-relaxed">
              برنامج Debt-IQ هو نظام متكامل لإدارة الديون والمدفوعات، مصمم خصيصاً للشركات والمؤسسات التي تحتاج إلى 
              تتبع دقيق لحسابات العملاء والموردين. يوفر البرنامج واجهة سهلة الاستخدام مع إمكانيات متقدمة لإدارة 
              البيانات المالية وإنشاء التقارير التفصيلية.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              يتميز النظام بأمان عالي للبيانات، نظام صلاحيات متقدم، وإمكانية إنشاء نسخ احتياطية لضمان سلامة 
              المعلومات. كما يدعم البرنامج طباعة التقارير المخصصة وتصديرها بصيغ مختلفة.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* القسم الثاني: معلومات الدعم الفني والتواصل */}
      <Card>
        <CardHeader>
          <CardTitle>الدعم الفني</CardTitle>
          <CardDescription>معلومات التواصل والمساعدة الفنية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* معلومات الشركة */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <img 
                  src={companyInfo.logo} 
                  alt="شعار الشركة" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-12 h-12 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">AT</span>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold">{companyInfo.name}</h3>
                <p className="text-sm text-muted-foreground">المطور الرسمي لبرنامج Debt-IQ</p>
              </div>
            </div>

            {/* معلومات التواصل */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-primary" />
                <div className="text-right">
                  <p className="font-medium">رقم الهاتف</p>
                  <p className="text-sm text-muted-foreground">{companyInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-primary" />
                <div className="text-right">
                  <p className="font-medium">البريد الإلكتروني</p>
                  <p className="text-sm text-muted-foreground">{companyInfo.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 md:col-span-2">
                <Globe className="h-5 w-5 text-primary" />
                <div className="text-right">
                  <p className="font-medium">الموقع الإلكتروني</p>
                  <p className="text-sm text-muted-foreground">{companyInfo.website}</p>
                </div>
              </div>
            </div>

            {/* زر صفحة المنتج */}
            <div className="flex justify-center">
              <Button 
                onClick={() => openExternalLink(companyInfo.productPage)}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                صفحة المنتج
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* القسم الثالث: برامجنا الأخرى */}
      <Card>
        <CardHeader>
          <CardTitle>برامجنا الأخرى</CardTitle>
          <CardDescription>تعرف على منتجاتنا الأخرى</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherPrograms.map((program, index) => {
              const IconComponent = program.icon;
              return (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => openExternalLink(program.link)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-lg flex items-center justify-center">
                      <img 
                        src={program.image} 
                        alt={program.name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden">
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h4 className="font-medium text-sm leading-tight">{program.name}</h4>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}