"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Edit, Trash2, RefreshCw, DollarSign, CreditCard, Eye, Phone, Mail, MapPin, Building, Search } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomersSummary } from "@/lib/actions/customers"
import type { Customer, CreateCustomerData, UpdateCustomerData, CustomerSummary } from "@/types/customer"

export default function CustomersPage() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [summary, setSummary] = useState<CustomerSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // بيانات النموذج
  const [formData, setFormData] = useState<CreateCustomerData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    nationalId: "",
    companyName: "",
    notes: ""
  })

  // تحميل العملاء والملخص
  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [customersResult, summaryResult] = await Promise.all([
        getAllCustomers(),
        getCustomersSummary()
      ])
      
      if (customersResult.success && customersResult.data) {
        setCustomers(customersResult.data)
      } else {
        setError(customersResult.message)
      }

      if (summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data)
      }
    } catch (error) {
      setError("حدث خطأ أثناء تحميل البيانات")
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  // تحميل البيانات عند بداية الصفحة
  useEffect(() => {
    loadData()
  }, [])

  // إنشاء عميل جديد
  const handleCreateCustomer = async () => {
    try {
      setError("")
      
      if (!formData.name.trim()) {
        setError("اسم العميل مطلوب")
        return
      }

      const result = await createCustomer(formData)
      
      if (result.success) {
        setIsCreateDialogOpen(false)
        setFormData({ name: "", email: "", phone: "", address: "", nationalId: "", companyName: "", notes: "" })
        await loadData() // إعادة تحميل البيانات
        alert("تم إنشاء العميل بنجاح")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء إنشاء العميل")
      console.error("Error creating customer:", error)
    }
  }

  // تحديث عميل
  const handleUpdateCustomer = async () => {
    try {
      setError("")
      
      if (!editingCustomer || !formData.name.trim()) {
        setError("اسم العميل مطلوب")
        return
      }

      const updateData: UpdateCustomerData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        nationalId: formData.nationalId || undefined,
        companyName: formData.companyName || undefined,
        notes: formData.notes || undefined
      }

      const result = await updateCustomer(editingCustomer.id, updateData)
      
      if (result.success) {
        setIsEditDialogOpen(false)
        setEditingCustomer(null)
        setFormData({ name: "", email: "", phone: "", address: "", nationalId: "", companyName: "", notes: "" })
        await loadData() // إعادة تحميل البيانات
        alert("تم تحديث العميل بنجاح")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء تحديث العميل")
      console.error("Error updating customer:", error)
    }
  }

  // حذف عميل
  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    try {
      const confirmed = confirm(`هل أنت متأكد من حذف العميل "${customerName}"؟`)
      if (!confirmed) return

      setError("")
      
      const result = await deleteCustomer(customerId)
      
      if (result.success) {
        await loadData() // إعادة تحميل البيانات
        alert("تم حذف العميل بنجاح")
      } else if (result.data?.hasTransactions) {
        // إذا كان العميل لديه معاملات، اسأل عن الحذف القسري
        const forceDelete = confirm(
          `${result.message}\n\nهل أنت متأكد أنك تريد حذف العميل "${customerName}" وجميع معاملاته؟ هذا الإجراء لا يمكن التراجع عنه.`
        )
        
        if (forceDelete) {
          const forceResult = await deleteCustomer(customerId, true)
          if (forceResult.success) {
            await loadData()
            alert("تم حذف العميل وجميع بياناته بنجاح")
          } else {
            setError(forceResult.message)
          }
        }
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء حذف العميل")
      console.error("Error deleting customer:", error)
    }
  }

  // فتح نموذج التعديل
  const openEditDialog = (customerToEdit: Customer) => {
    setEditingCustomer(customerToEdit)
    setFormData({
      name: customerToEdit.name,
      email: customerToEdit.email || "",
      phone: customerToEdit.phone || "",
      address: customerToEdit.address || "",
      nationalId: customerToEdit.nationalId || "",
      companyName: customerToEdit.companyName || "",
      notes: customerToEdit.notes || ""
    })
    setIsEditDialogOpen(true)
  }

  // حساب الرصيد المتبقي
  const getBalance = (customer: Customer) => {
    const debt = parseFloat(customer.totalDebt)
    const paid = parseFloat(customer.totalPaid)
    return debt - paid
  }

  // فلترة العملاء حسب البحث
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.nationalId?.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة العملاء</h1>
          <p className="text-muted-foreground mt-2">إضافة وتعديل وحذف العملاء وإدارة حساباتهم</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة عميل
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات العميل الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم العميل *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="اسم العميل"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="07xxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId">الهوية الوطنية</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="رقم الهوية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="اسم الشركة (اختياري)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="عنوان العميل"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreateCustomer}>
                  إنشاء العميل
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                نشط: {summary.activeCustomers}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الديون</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {parseFloat(summary.totalOutstandingDebt).toLocaleString()} د.ع
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
                {parseFloat(summary.totalPaidAmount).toLocaleString()} د.ع
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معاملات متأخرة</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.overdueTransactions}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Alert */}
      {error && !isCreateDialogOpen && !isEditDialogOpen && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث في العملاء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم، البريد، الهاتف، الشركة، أو الهوية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              عرض {filteredCustomers.length} من أصل {customers.length} عميل
            </p>
          )}
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            قائمة العملاء ({filteredCustomers.length})
          </CardTitle>
          <CardDescription>
            جميع العملاء المسجلين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد عملاء"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">معلومات الاتصال</TableHead>
                    <TableHead className="text-right">الشركة</TableHead>
                    <TableHead className="text-right">إجمالي الديون</TableHead>
                    <TableHead className="text-right">إجمالي المدفوعات</TableHead>
                    <TableHead className="text-right">الرصيد المتبقي</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const balance = getBalance(customer)
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{customer.name}</div>
                            {customer.nationalId && (
                              <div className="text-sm text-muted-foreground">
                                هوية: {customer.nationalId}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.address && (
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3" />
                                {customer.address.substring(0, 30)}...
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.companyName && (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {customer.companyName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-red-600 font-semibold">
                            {parseFloat(customer.totalDebt).toLocaleString()} د.ع
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-semibold">
                            {parseFloat(customer.totalPaid).toLocaleString()} د.ع
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {balance.toLocaleString()} د.ع
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.isActive ? 'default' : 'destructive'}>
                            {customer.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(customer)}
                              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline sm:ml-2">تعديل</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                              className="text-destructive hover:text-destructive h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline sm:ml-2">حذف</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/dashboard/customers/${customer.id}`, '_blank')}
                              title="عرض سجل العميل"
                              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline sm:ml-2">عرض</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل العميل</DialogTitle>
            <DialogDescription>
              تعديل بيانات العميل
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-name">اسم العميل *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">البريد الإلكتروني</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">رقم الهاتف</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nationalId">الهوية الوطنية</Label>
              <Input
                id="edit-nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-companyName">اسم الشركة</Label>
              <Input
                id="edit-companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">العنوان</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">ملاحظات</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateCustomer}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}