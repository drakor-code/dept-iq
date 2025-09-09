// أنواع بيانات الإعدادات
export interface SystemSettings {
  id: string;
  companyName?: string;
  companyDescription?: string;
  companyLogoWebp?: string;
  companyLogoPng?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSettingsInput {
  companyName?: string;
  companyDescription?: string;
  companyLogoWebp?: string;
  companyLogoPng?: string;
}

export interface BackupData {
  users: any[];
  customers: any[];
  suppliers: any[];
  customerPayments: any[];
  supplierPayments: any[];
  systemSettings: any[];
  exportDate: string;
  version: string;
}