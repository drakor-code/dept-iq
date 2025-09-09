"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Plus, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { 
  getCustomerWithTransactions, 
  addDebt, 
  makePayment 
} from "@/lib/actions/customers"
import type { 
  CustomerWithTransactions, 
  CreateTransactionData, 
  CreatePaymentData 
} from "@/types/customer"

export default function CustomerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<CustomerWithTransactions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  // بيانات إضافة دين
  const [debtData, setDebtData] = useState<Omit<CreateTransactionData, 'customerId' | 'type'>>({
    amount: 0,
    description: "",
    invoiceNumber: "",
    dueDate: undefined,
    notes: ""
  })

  // بيانات تسديد دين
  const [paymentData, setPaymentData] = useState<Omit<CreatePaymentData, 'customerId'>>({
    amount: 0,
    paymentMethod: "cash",
    referenceNumber: "",
    notes: "",
    transactionId: undefined
  })

  // تحميل بيانات العميل
  const loadCustomerData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const result = await getCustomerWithTransactions(customerId)
      
      if (result.success && result.data) {
        setCustomer(result.data)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء تحميل بيانات العميل")
      console.error("Error loading customer:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (customerId) {
      loadCustomerData()
    }
  }, [customerId])

  // إضافة دين جديد
  const handleAddDebt = async () => {
    try {
      setError("")
      
      if (!debtData.amount || debtData.amount <= 0) {
        setError("مبلغ الدين مطلوب ويجب أن يكون أكبر من صفر")
        return
      }

      const transactionData: CreateTransactionData = {
        customerId,
        type: 'debt',
        ...debtData
      }

      const result = await addDebt(transactionData)
      
      if (result.success) {
        setIsDebtDialogOpen(false)
        setDebtData({
          amount: 0,
          description: "",
          invoiceNumber: "",
          dueDate: undefined,
          notes: ""
        })
        await loadCustomerData() // إعادة تحميل البيانات
        alert("تم إضافة الدين بنجاح")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء إضافة الدين")
      console.error("Error adding debt:", error)
    }
  }

  // تسديد دين
  const handleMakePayment = async () => {
    try {
      setError("")
      
      if (!paymentData.amount || paymentData.amount <= 0) {
        setError("مبلغ الدفعة مطلوب ويجب أن يكون أكبر من صفر")
        return
      }

      const paymentDataWithCustomer: CreatePaymentData = {
        customerId,
        ...paymentData
      }

      const result = await makePayment(paymentDataWithCustomer)
      
      if (result.success) {
        setIsPaymentDialogOpen(false)
        setPaymentData({
          amount: 0,
          paymentMethod: "cash",
          referenceNumber: "",
          notes: "",
          transactionId: undefined
        })
        await loadCustomerData() // إعادة تحميل البيانات
        alert("تم تسجيل الدفعة بنجاح")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء تسجيل الدفعة")
      console.error("Error making payment:", error)
    }
  }

  // حساب الرصيد المتبقي
  const getBalance = () => {
    if (!customer) return 0
    const debt = parseFloat(customer.totalDebt)
    const paid = parseFloat(customer.totalPaid)
    return debt - paid
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert className="max-w-md">
          <AlertDescription>
            {error || "العميل غير موجود"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const balance = getBalance()
  const pendingTransactions = customer.transactions.filter(t => t.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            رجوع
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{customer.name}</h1>
            <p className="text-muted-foreground mt-1">تفاصيل العميل وسجل المعاملات</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Plus className="h-4 w-4 ml-2" />
                إضافة دين
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة دين جديد</DialogTitle>
                <DialogDescription>
                  إضافة دين جديد للعميل {customer.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="debt-amount">المبلغ *</Label>
                  <Input
                    id="debt-amount"
                    type="number"
                    value={debtData.amount || ""}
                    onChange={(e) => setDebtData({ ...debtData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debt-description">الوصف</Label>
                  <Input
                    id="debt-description"
                    value={debtData.description}
                    onChange={(e) => setDebtData({ ...debtData, description: e.target.value })}
                    placeholder="وصف المعاملة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debt-invoice">رقم الفاتورة</Label>
                  <Input
                    id="debt-invoice"
                    value={debtData.invoiceNumber}
                    onChange={(e) => setDebtData({ ...debtData, invoiceNumber: e.target.value })}
                    placeholder="INV-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debt-due">تاريخ الاستحقاق</Label>
                  <Input
                    id="debt-due"
                    type="date"
                    value={debtData.dueDate ? debtData.dueDate.toISOString().split('T')[0] : ""}
                    onChange={(e) => setDebtData({ ...debtData, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debt-notes">ملاحظات</Label>
                  <Textarea
                    id="debt-notes"
                    value={debtData.notes}
                    onChange={(e) => setDebtData({ ...debtData, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                    rows={2}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDebtDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddDebt}>
                  إضافة الدين
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CreditCard className="h-4 w-4 ml-2" />
                تسديد دفعة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تسديد دفعة</DialogTitle>
                <DialogDescription>
                  تسجيل دفعة جديدة للعميل {customer.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-amount">المبلغ *</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={paymentData.amount || ""}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">طريقة الدفع *</Label>
                  <Select value={paymentData.paymentMethod} onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="check">شيك</SelectItem>
                      <SelectItem value="card">بطاقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-transaction">ربط بمعاملة محددة</Label>
                  <Select value={paymentData.transactionId || "none"} onValueChange={(value) => setPaymentData({ ...paymentData, transactionId: value === "none" ? undefined : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر معاملة (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون ربط</SelectItem>
                      {pendingTransactions.map((transaction) => (
                        <SelectItem key={transaction.id} value={transaction.id}>
                          {transaction.description || transaction.invoiceNumber || `معاملة ${transaction.id.substring(0, 8)}`} - {parseFloat(transaction.amount).toLocaleString()} د.ع
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-reference">رقم المرجع</Label>
                  <Input
                    id="payment-reference"
                    value={paymentData.referenceNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                    placeholder="رقم المرجع أو الشيك"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-notes">ملاحظات</Label>
                  <Textarea
                    id="payment-notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                    rows={2}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleMakePayment}>
                  تسجيل الدفعة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الديون</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {parseFloat(customer.totalDebt).toLocaleString()} د.ع
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {parseFloat(customer.totalPaid).toLocaleString()} د.ع
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد المتبقي</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {balance.toLocaleString()} د.ع
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معاملات معلقة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingTransactions.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            معلومات العميل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">الاسم:</span>
                <span>{customer.name}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">البريد:</span>
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">الهاتف:</span>
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {customer.companyName && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">الشركة:</span>
                  <span>{customer.companyName}</span>
                </div>
              )}
              {customer.nationalId && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">الهوية:</span>
                  <span>{customer.nationalId}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">العنوان:</span>
                  <span>{customer.address}</span>
                </div>
              )}
            </div>
          </div>
          {customer.notes && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <span className="font-medium">ملاحظات:</span>
              <p className="mt-1">{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions and Payments */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">المعاملات ({customer.transactions.length})</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات ({customer.payments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>سجل المعاملات</CardTitle>
              <CardDescription>جميع الديون والمعاملات المالية</CardDescription>
            </CardHeader>
            <CardContent>
              {customer.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد معاملات</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">رقم الفاتورة</TableHead>
                      <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString('en-GB')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'debt' ? 'destructive' : 'default'}>
                            {transaction.type === 'debt' ? 'دين' : 'دفعة'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {parseFloat(transaction.amount).toLocaleString()} د.ع
                        </TableCell>
                        <TableCell>{transaction.description || '-'}</TableCell>
                        <TableCell>{transaction.invoiceNumber || '-'}</TableCell>
                        <TableCell>
                          {transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString('en-GB') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            transaction.status === 'paid' ? 'default' : 
                            transaction.status === 'overdue' ? 'destructive' : 'secondary'
                          }>
                            {transaction.status === 'paid' ? 'مدفوع' : 
                             transaction.status === 'overdue' ? 'متأخر' : 'معلق'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>سجل المدفوعات</CardTitle>
              <CardDescription>جميع المدفوعات المسجلة</CardDescription>
            </CardHeader>
            <CardContent>
              {customer.payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد مدفوعات</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">تاريخ الدفع</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">طريقة الدفع</TableHead>
                      <TableHead className="text-right">رقم المرجع</TableHead>
                      <TableHead className="text-right">ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.paidAt).toLocaleDateString('en-GB')}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {parseFloat(payment.amount).toLocaleString()} د.ع
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.paymentMethod === 'cash' ? 'نقدي' :
                             payment.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                             payment.paymentMethod === 'check' ? 'شيك' :
                             payment.paymentMethod === 'card' ? 'بطاقة' : payment.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.referenceNumber || '-'}</TableCell>
                        <TableCell>{payment.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}