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
import { Truck, Plus, Edit, Trash2, RefreshCw, DollarSign, CreditCard, Eye, Phone, Mail, MapPin, Building, Search, FileText } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier, getSuppliersSummary } from "@/lib/actions/suppliers"
import type { Supplier, CreateSupplierData, UpdateSupplierData, SupplierSummary } from "@/types/supplier"

export default function SuppliersPage() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [summary, setSummary] = useState<SupplierSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // بيانات النموذج
  const [formData, setFormData] = useState<CreateSupplierData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    nationalId: "",
    companyName: "",
    notes: ""
  })

  // تحميل الموردين والملخص
  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [suppliersResult, summaryResult] = await Promise.all([
        getAllSuppliers(),
        getSuppliersSummary()
      ])
      
      if (suppliersResult.success && suppliersResult.data) {
        setSuppliers(suppliersResult.data)
      } else {
        setError(suppliersResult.message)
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

  // إنشاء مورد جديد
  const handleCreateSupplier = async () => {
    try {
      setError("")
      
      if (!formData.name.trim()) {
        setError("اسم المورد مطلوب")
        return
      }

      const result = await createSupplier(formData)
      
      if (result.success) {
        setIsCreateDialogOpen(false)
        setFormData({ name: "", email: "", phone: "", address: "", nationalId: "", companyName: "", notes: "" })
        await loadData() // إعادة تحميل البيانات
        alert("تم إنشاء المورد بنجاح")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء إنشاء المورد")
      console.error("Error creating supplier:", error)
    }
  }

  // تحديث مورد
  const handleUpdateSupplier = async () => {
    try {
      setError("")
      
      if (!editingSupplier || !formData.name.trim()) {
        setError("اسم المورد مطلوب")
        return
      }

      const updateData: UpdateSupplierData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        nationalId: formData.nationalId || undefined,
        companyName: formData.companyName || undefined,
        notes: formData.notes || undefined
      }

      const result = await updateSupplier(editingSupplier.id, updateData)
      
      if (result.success) {
        setIsEditDialogOpen(false)
        setEditingSupplier(null)
        setFormData({ name: "", email: "", phone: "", address: "", nationalId: "", companyName: "", notes: "" })
        await loadData() // إعادة تحميل البيانات
        alert("تم تحديث المورد بنجاح")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء تحديث المورد")
      console.error("Error updating supplier:", error)
    }
  }

  // حذف مورد
  const handleDeleteSupplier = async (supplierId: string, supplierName: string) => {
    try {
      const confirmed = confirm(`هل أنت متأكد من حذف المورد "${supplierName}"؟`)
      if (!confirmed) return

      setError("")
      
      const result = await deleteSupplier(supplierId)
      
      if (result.success) {
        await loadData() // إعادة تحميل البيانات
        alert("تم حذف المورد بنجاح")
      } else if (result.data?.hasTransactions) {
        // إذا كان المورد لديه معاملات، اسأل عن الحذف القسري
        const forceDelete = confirm(
          `${result.message}\n\nهل أنت متأكد أنك تريد حذف المورد "${supplierName}" وجميع معاملاته؟ هذا الإجراء لا يمكن التراجع عنه.`
        )
        
        if (forceDelete) {
          const forceResult = await deleteSupplier(supplierId, true)
          if (forceResult.success) {
            await loadData()
            alert("تم حذف المورد وجميع بياناته بنجاح")
          } else {
            setError(forceResult.message)
          }
        }
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء حذف المورد")
      console.error("Error deleting supplier:", error)
    }
  }

  // فتح نموذج التعديل
  const openEditDialog = (supplierToEdit: Supplier) => {
    setEditingSupplier(supplierToEdit)
    setFormData({
      name: supplierToEdit.name,
      email: supplierToEdit.email || "",
      phone: supplierToEdit.phone || "",
      address: supplierToEdit.address || "",
      nationalId: supplierToEdit.nationalId || "",
      companyName: supplierToEdit.companyName || "",
      notes: supplierToEdit.notes || ""
    })
    setIsEditDialogOpen(true)
  }

  // حساب الرصيد المتبقي
  const getBalance = (supplier: Supplier) => {
    const debt = parseFloat(supplier.totalDebt)
    const paid = parseFloat(supplier.totalPaid)
    return debt - paid
  }

  // فلترة الموردين حسب البحث
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm) ||
    supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.nationalId?.includes(searchTerm)
  )

  // طباعة تقرير المورد
  const handlePrintSupplier = (supplier: Supplier) => {
    // سيتم إضافة وظيفة الطباعة لاحقاً
    alert(`سيتم إضافة وظيفة طباعة تقرير المورد "${supplier.name}" قريباً`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة الموردين</h1>
          <p className="text-muted-foreground mt-2">إضافة وتعديل وحذف الموردين وإدارة حساباتهم</p>
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
                إضافة مورد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>إضافة مورد جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات المورد الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المورد *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="اسم المورد"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="supplier@example.com"
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
                    placeholder="عنوان المورد"
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
                <Button onClick={handleCreateSupplier}>
                  إنشاء المورد
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
              <CardTitle className="text-sm font-medium">إجمالي الموردين</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSuppliers}</div>
              <p className="text-xs text-muted-foreground">
                نشط: {summary.activeSuppliers}
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
            البحث في الموردين
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
              عرض {filteredSuppliers.length} من أصل {suppliers.length} مورد
            </p>
          )}
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            قائمة الموردين ({filteredSuppliers.length})
          </CardTitle>
          <CardDescription>
            جميع الموردين المسجلين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد موردين"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم المورد</TableHead>
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
                  {filteredSuppliers.map((supplier) => {
                    const balance = getBalance(supplier)
                    return (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{supplier.name}</div>
                            {supplier.nationalId && (
                              <div className="text-sm text-muted-foreground">
                                هوية: {supplier.nationalId}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {supplier.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {supplier.email}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {supplier.phone}
                              </div>
                            )}
                            {supplier.address && (
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3" />
                                {supplier.address.substring(0, 30)}...
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {supplier.companyName && (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {supplier.companyName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-red-600 font-semibold">
                            {parseFloat(supplier.totalDebt).toLocaleString()} د.ع
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-semibold">
                            {parseFloat(supplier.totalPaid).toLocaleString()} د.ع
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {balance.toLocaleString()} د.ع
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={supplier.isActive ? 'default' : 'destructive'}>
                            {supplier.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(supplier)}
                              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline sm:ml-2">تعديل</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                              className="text-destructive hover:text-destructive h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline sm:ml-2">حذف</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/dashboard/suppliers/${supplier.id}`, '_blank')}
                              title="عرض سجل المورد"
                              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline sm:ml-2">عرض</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintSupplier(supplier)}
                              title="طباعة تقرير المورد"
                              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 hidden md:flex"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="hidden lg:inline lg:ml-2">طباعة</span>
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
            <DialogTitle>تعديل المورد</DialogTitle>
            <DialogDescription>
              تعديل بيانات المورد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-name">اسم المورد *</Label>
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
            <Button onClick={handleUpdateSupplier}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}