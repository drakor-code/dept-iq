"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, Users, UserCheck, FileText, Settings, HelpCircle, Building2, Lock, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "./auth-context"
import { ROLE_PERMISSIONS, PAGE_ROUTES } from "@/types/auth"
import type { UserRole } from "@/types/user"
import { useState } from "react"

const navigationItems = [
  {
    title: "الرئيسية",
    href: PAGE_ROUTES.dashboard,
    icon: LayoutDashboard,
    permission: 'dashboard' as keyof typeof ROLE_PERMISSIONS.admin,
  },
  {
    title: "سجل التجار",
    href: PAGE_ROUTES.suppliers,
    icon: Building2,
    permission: 'suppliers' as keyof typeof ROLE_PERMISSIONS.admin,
  },
  {
    title: "سجل العملاء",
    href: PAGE_ROUTES.customers,
    icon: UserCheck,
    permission: 'customers' as keyof typeof ROLE_PERMISSIONS.admin,
  },
  {
    title: "التقارير",
    href: PAGE_ROUTES.reports,
    icon: FileText,
    permission: 'reports' as keyof typeof ROLE_PERMISSIONS.admin,
  },
  {
    title: "المستخدمين",
    href: PAGE_ROUTES.users,
    icon: Users,
    permission: 'users' as keyof typeof ROLE_PERMISSIONS.admin,
  },
  {
    title: "الإعدادات",
    href: PAGE_ROUTES.settings,
    icon: Settings,
    permission: 'settings' as keyof typeof ROLE_PERMISSIONS.admin,
  },
  {
    title: "الدعم الفني",
    href: PAGE_ROUTES.support,
    icon: HelpCircle,
    permission: 'support' as keyof typeof ROLE_PERMISSIONS.admin,
  },
]

// مكون الـ Sidebar الداخلي
function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()

  // فلترة العناصر حسب صلاحيات المستخدم
  const filteredItems = navigationItems.filter((item) => {
    if (!user?.role) return false
    const userRole = user.role as UserRole
    return ROLE_PERMISSIONS[userRole][item.permission]
  })

  return (
    <div className="h-full bg-sidebar border-l border-sidebar-border flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-sidebar-foreground">Debt-IQ</h1>
            <p className="text-sm text-sidebar-foreground/70">نظام إدارة الديون</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href} onClick={onItemClick}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-right h-12 px-4",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="ml-3 h-5 w-5" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Info Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-right">
          <p className="text-sm font-medium text-sidebar-foreground">{user?.fullName || user?.username}</p>
          <p className="text-xs text-sidebar-foreground/70">الصلاحية: {user?.role === "admin" ? "مدير" : "موظف"}</p>
        </div>
      </div>
    </div>
  )
}

// مكون الـ Sidebar الرئيسي
export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64">
        <SidebarContent />
      </div>
    </>
  )
}

// مكون الـ Mobile Menu
export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-64">
        <SidebarContent onItemClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
