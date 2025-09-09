export interface Customer {
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

export interface CreateCustomerData {
  name: string
  email?: string
  phone?: string
  address?: string
  nationalId?: string
  companyName?: string
  notes?: string
}

export interface UpdateCustomerData {
  name?: string
  email?: string
  phone?: string
  address?: string
  nationalId?: string
  companyName?: string
  notes?: string
  isActive?: boolean
}

export interface CustomerTransaction {
  id: string
  customerId: string
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

export interface CreateTransactionData {
  customerId: string
  type: 'debt' | 'payment'
  amount: number
  description?: string
  invoiceNumber?: string
  dueDate?: Date
  paymentMethod?: string
  referenceNumber?: string
  notes?: string
}

export interface PaymentHistoryRecord {
  id: string
  customerId: string
  transactionId?: string
  amount: string
  paymentMethod: string
  referenceNumber?: string
  notes?: string
  paidAt: Date
  createdBy?: string
}

export interface CreatePaymentData {
  customerId: string
  transactionId?: string
  amount: number
  paymentMethod: string
  referenceNumber?: string
  notes?: string
}

export interface CustomerWithTransactions extends Customer {
  transactions: CustomerTransaction[]
  payments: PaymentHistoryRecord[]
}

export interface CustomerSummary {
  totalCustomers: number
  activeCustomers: number
  totalOutstandingDebt: string
  totalPaidAmount: string
  overdueTransactions: number
}