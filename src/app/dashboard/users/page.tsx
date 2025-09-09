"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Edit, Trash2, RefreshCw, Shield, UserIcon, Calendar, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { getAllUsers, createUser, updateUser, deleteUser } from "@/lib/actions/users"
import type { UserWithoutPassword, CreateUserData, UpdateUserData } from "@/types/user"

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserWithoutPassword[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  // بيانات النموذج
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    username: "",
    password: "",
    fullName: "",
    role: "employee"
  })

  // تحميل المستخدمين
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError("")
      
      const result = await getAllUsers()
      
      if (result.success && result.data) {
        setUsers(result.data)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء تحميل المستخدمين")
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  // تحميل المستخدمين عند بداية الصفحة
  useEffect(() => {
    loadUsers()
  }, [])

  // إنشاء مستخدم جديد
  const handleCreateUser = async () => {
    try {
      setError("")
      
      if (!formData.email || !formData.username || !formData.password || !formData.fullName) {
        setError("جميع الحقول مطلوبة")
        return
      }

      const result = await createUser(formData)
      
      if (result.success) {
        setIsCreateDialogOpen(false)
        setFormData({ email: "", username: "", password: "", fullName: "", role: "employee" })
        await loadUsers() // إعادة تحميل القائمة
        alert("تم إنشاء المستخدم بنجاح")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء إنشاء المستخدم")
      console.error("Error creating user:", error)
    }
  }

  // تحديث مستخدم
  const handleUpdateUser = async () => {
    try {
      setError("")
      
      if (!editingUser || !formData.email || !formData.username || !formData.fullName) {
        setError("جميع الحقول مطلوبة")
        return
      }

      const updateData: UpdateUserData = {
        email: formData.email,
        username: formData.username,
        fullName: formData.fullName,
        role: formData.role,
        isActive: true
      }

      const result = await updateUser(editingUser.id, updateData)
      
      if (result.success) {
        setIsEditDialogOpen(false)
        setEditingUser(null)
        setFormData({ email: "", username: "", password: "", fullName: "", role: "employee" })
        await loadUsers() // إعادة تحميل القائمة
        alert("تم تحديث المستخدم بنجاح")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء تحديث المستخدم")
      console.error("Error updating user:", error)
    }
  }

  // حذف مستخدم
  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const confirmed = confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟`)
      if (!confirmed) return

      setError("")
      
      const result = await deleteUser(userId)
      
      if (result.success) {
        await loadUsers() // إعادة تحميل القائمة
        alert("تم حذف المستخدم بنجاح")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء حذف المستخدم")
      console.error("Error deleting user:", error)
    }
  }

  // فتح نموذج التعديل
  const openEditDialog = (userToEdit: UserWithoutPassword) => {
    setEditingUser(userToEdit)
    setFormData({
      email: userToEdit.email,
      username: userToEdit.username,
      password: "", // لا نعرض كلمة المرور الحالية
      fullName: userToEdit.fullName,
      role: userToEdit.role
    })
    setIsEditDialogOpen(true)
  }

  // التحقق من الصلاحيات
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            غير مصرح لك بالوصول لهذه الصفحة. هذه الصفحة مخصصة للمديرين فقط.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-2">إضافة وتعديل وحذف المستخدمين</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadUsers} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات المستخدم الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="الاسم الكامل"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="كلمة المرور"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">الصلاحية</Label>
                  <Select value={formData.role} onValueChange={(value: "admin" | "employee") => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="employee">موظف</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Button onClick={handleCreateUser}>
                  إنشاء المستخدم
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && !isCreateDialogOpen && !isEditDialogOpen && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            قائمة المستخدمين ({users.length})
          </CardTitle>
          <CardDescription>
            جميع المستخدمين المسجلين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد مستخدمين</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم الكامل</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">اسم المستخدم</TableHead>
                  <TableHead className="text-right">الصلاحية</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'مدير' : 'موظف'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(user.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.fullName)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>
              تعديل بيانات المستخدم
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="edit-username">اسم المستخدم</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">الاسم الكامل</Label>
              <Input
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">الصلاحية</Label>
              <Select value={formData.role} onValueChange={(value: "admin" | "employee") => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="employee">موظف</SelectItem>
                </SelectContent>
              </Select>
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
            <Button onClick={handleUpdateUser}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}