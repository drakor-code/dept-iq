export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  nationalId?: string
  companyName?: string
  notes?: string
  isActive: boolean
  totalDebt: string
  totalPaid: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

export interface CreateSupplierData {
  name: string
  email?: string
  phone?: string
  address?: string
  nationalId?: string
  companyName?: string
  notes?: string
}

export interface UpdateSupplierData {
  name?: string
  email?: string
  phone?: string
  address?: string
  nationalId?: string
  companyName?: string
  notes?: string
  isActive?: boolean
}

export interface SupplierTransaction {
  id: string
  supplierId: string
  type: 'debt' | 'payment'
  amount: string
  description?: string
  invoiceNumber?: string
  dueDate?: Date
  paidDate?: Date
  status: 'pending' | 'paid' | 'overdue'
  paymentMethod?: string
  referenceNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

export interface CreateSupplierTransactionData {
  supplierId: string
  type: 'debt' | 'payment'
  amount: number
  description?: string
  invoiceNumber?: string
  dueDate?: Date
  paymentMethod?: string
  referenceNumber?: string
  notes?: string
}

export interface SupplierPaymentHistoryRecord {
  id: string
  supplierId: string
  transactionId?: string
  amount: string
  paymentMethod: string
  referenceNumber?: string
  notes?: string
  paidAt: Date
  createdBy?: string
}

export interface CreateSupplierPaymentData {
  supplierId: string
  transactionId?: string
  amount: number
  paymentMethod: string
  referenceNumber?: string
  notes?: string
}

export interface SupplierWithTransactions extends Supplier {
  transactions: SupplierTransaction[]
  payments: SupplierPaymentHistoryRecord[]
}

export interface SupplierSummary {
  totalSuppliers: number
  activeSuppliers: number
  totalOutstandingDebt: string
  totalPaidAmount: string
  overdueTransactions: number
}