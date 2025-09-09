"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Supplier {
  id: string
  name: string
  phone: string
  address: string
  dateAdded: string
  totalDebt: number
  debts: DebtRecord[]
  payments: PaymentRecord[]
}

export interface Customer {
  id: string
  name: string
  phone: string
  address: string
  dateAdded: string
  totalDebt: number
  debts: DebtRecord[]
  payments: PaymentRecord[]
}

export interface DebtRecord {
  id: string
  amount: number
  description: string
  date: string
}

export interface PaymentRecord {
  id: string
  amount: number
  description: string
  date: string
}

interface DebtContextType {
  suppliers: Supplier[]
  customers: Customer[]
  addSupplier: (supplier: Omit<Supplier, "id" | "totalDebt" | "debts" | "payments">) => void
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
  addCustomer: (customer: Omit<Customer, "id" | "totalDebt" | "debts" | "payments">) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  addSupplierDebt: (supplierId: string, debt: Omit<DebtRecord, "id">) => void
  addSupplierPayment: (supplierId: string, payment: Omit<PaymentRecord, "id">) => void
  addCustomerDebt: (customerId: string, debt: Omit<DebtRecord, "id">) => void
  addCustomerPayment: (customerId: string, payment: Omit<PaymentRecord, "id">) => void
  getTotalSuppliersDebt: () => number
  getTotalCustomersDebt: () => number
}

const DebtContext = createContext<DebtContextType | undefined>(undefined)

export function DebtProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  // Initialize with mock data
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      {
        id: "1",
        name: "شركة الأنوار للتجارة",
        phone: "0501234567",
        address: "الرياض، حي الملز",
        dateAdded: "2024-01-15",
        totalDebt: 45000,
        debts: [
          { id: "d1", amount: 25000, description: "فاتورة رقم 1001", date: "2024-01-15" },
          { id: "d2", amount: 20000, description: "فاتورة رقم 1002", date: "2024-01-20" },
        ],
        payments: [],
      },
      {
        id: "2",
        name: "مؤسسة النجاح التجارية",
        phone: "0507654321",
        address: "جدة، حي الروضة",
        dateAdded: "2024-01-10",
        totalDebt: 80000,
        debts: [
          { id: "d3", amount: 50000, description: "فاتورة رقم 2001", date: "2024-01-10" },
          { id: "d4", amount: 30000, description: "فاتورة رقم 2002", date: "2024-01-25" },
        ],
        payments: [],
      },
    ]

    const mockCustomers: Customer[] = [
      {
        id: "1",
        name: "محمد أحمد السعيد",
        phone: "0551234567",
        address: "الدمام، حي الفيصلية",
        dateAdded: "2024-01-12",
        totalDebt: 35000,
        debts: [
          { id: "cd1", amount: 20000, description: "مبيعات شهر يناير", date: "2024-01-12" },
          { id: "cd2", amount: 15000, description: "مبيعات إضافية", date: "2024-01-18" },
        ],
        payments: [],
      },
      {
        id: "2",
        name: "فاطمة علي الزهراني",
        phone: "0559876543",
        address: "مكة المكرمة، حي العزيزية",
        dateAdded: "2024-01-08",
        totalDebt: 52500,
        debts: [
          { id: "cd3", amount: 30000, description: "فاتورة رقم C001", date: "2024-01-08" },
          { id: "cd4", amount: 22500, description: "فاتورة رقم C002", date: "2024-01-22" },
        ],
        payments: [],
      },
    ]

    setSuppliers(mockSuppliers)
    setCustomers(mockCustomers)
  }, [])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const calculateTotalDebt = (debts: DebtRecord[], payments: PaymentRecord[]) => {
    const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0)
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
    return totalDebts - totalPayments
  }

  const addSupplier = (supplierData: Omit<Supplier, "id" | "totalDebt" | "debts" | "payments">) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: generateId(),
      totalDebt: 0,
      debts: [],
      payments: [],
    }
    setSuppliers((prev) => [...prev, newSupplier])
  }

  const updateSupplier = (id: string, supplierData: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((supplier) => {
        if (supplier.id === id) {
          const updated = { ...supplier, ...supplierData }
          updated.totalDebt = calculateTotalDebt(updated.debts, updated.payments)
          return updated
        }
        return supplier
      }),
    )
  }

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id))
  }

  const addCustomer = (customerData: Omit<Customer, "id" | "totalDebt" | "debts" | "payments">) => {
    const newCustomer: Customer = {
      ...customerData,
      id: generateId(),
      totalDebt: 0,
      debts: [],
      payments: [],
    }
    setCustomers((prev) => [...prev, newCustomer])
  }

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id === id) {
          const updated = { ...customer, ...customerData }
          updated.totalDebt = calculateTotalDebt(updated.debts, updated.payments)
          return updated
        }
        return customer
      }),
    )
  }

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== id))
  }

  const addSupplierDebt = (supplierId: string, debtData: Omit<DebtRecord, "id">) => {
    const newDebt: DebtRecord = { ...debtData, id: generateId() }
    setSuppliers((prev) =>
      prev.map((supplier) => {
        if (supplier.id === supplierId) {
          const updatedDebts = [...supplier.debts, newDebt]
          return {
            ...supplier,
            debts: updatedDebts,
            totalDebt: calculateTotalDebt(updatedDebts, supplier.payments),
          }
        }
        return supplier
      }),
    )
  }

  const addSupplierPayment = (supplierId: string, paymentData: Omit<PaymentRecord, "id">) => {
    const newPayment: PaymentRecord = { ...paymentData, id: generateId() }
    setSuppliers((prev) =>
      prev.map((supplier) => {
        if (supplier.id === supplierId) {
          const updatedPayments = [...supplier.payments, newPayment]
          return {
            ...supplier,
            payments: updatedPayments,
            totalDebt: calculateTotalDebt(supplier.debts, updatedPayments),
          }
        }
        return supplier
      }),
    )
  }

  const addCustomerDebt = (customerId: string, debtData: Omit<DebtRecord, "id">) => {
    const newDebt: DebtRecord = { ...debtData, id: generateId() }
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id === customerId) {
          const updatedDebts = [...customer.debts, newDebt]
          return {
            ...customer,
            debts: updatedDebts,
            totalDebt: calculateTotalDebt(updatedDebts, customer.payments),
          }
        }
        return customer
      }),
    )
  }

  const addCustomerPayment = (customerId: string, paymentData: Omit<PaymentRecord, "id">) => {
    const newPayment: PaymentRecord = { ...paymentData, id: generateId() }
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id === customerId) {
          const updatedPayments = [...customer.payments, newPayment]
          return {
            ...customer,
            payments: updatedPayments,
            totalDebt: calculateTotalDebt(customer.debts, updatedPayments),
          }
        }
        return customer
      }),
    )
  }

  const getTotalSuppliersDebt = () => {
    return suppliers.reduce((total, supplier) => total + Math.max(0, supplier.totalDebt), 0)
  }

  const getTotalCustomersDebt = () => {
    return customers.reduce((total, customer) => total + Math.max(0, customer.totalDebt), 0)
  }

  return (
    <DebtContext.Provider
      value={{
        suppliers,
        customers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplierDebt,
        addSupplierPayment,
        addCustomerDebt,
        addCustomerPayment,
        getTotalSuppliersDebt,
        getTotalCustomersDebt,
      }}
    >
      {children}
    </DebtContext.Provider>
  )
}

export function useDebt() {
  const context = useContext(DebtContext)
  if (context === undefined) {
    throw new Error("useDebt must be used within a DebtProvider")
  }
  return context
}
