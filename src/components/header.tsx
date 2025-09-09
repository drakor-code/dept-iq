"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Settings } from "lucide-react"
import { useAuth } from "./auth-context"
import { MobileMenu } from "./sidebar"
import Link from "next/link"

export function Header() {
  const { user, logout } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Mobile Menu */}
      <div className="lg:hidden">
        <MobileMenu />
      </div>

      {/* Welcome Message */}
      <div className="text-right flex-1 lg:flex-none">
        <h2 className="text-sm lg:text-lg font-semibold text-foreground truncate">
          <span className="hidden sm:inline">أهلاً وسهلاً بك: </span>
          {user?.fullName || user?.username}
        </h2>
        <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
          الصلاحية: {user?.role === "admin" ? "مدير" : "موظف"}
        </p>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 lg:h-10 lg:w-10 rounded-full">
            <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs lg:text-sm">
                {user ? getInitials(user.fullName || user.username) : "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none text-right">
              <p className="font-medium">{user?.fullName || user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground sm:hidden">
                الصلاحية: {user?.role === "admin" ? "مدير" : "موظف"}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="cursor-pointer">
              <User className="ml-2 h-4 w-4" />
              <span>الملف الشخصي</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings" className="cursor-pointer">
              <Settings className="ml-2 h-4 w-4" />
              <span>الإعدادات</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={logout}>
            <LogOut className="ml-2 h-4 w-4" />
            <span>تسجيل الخروج</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
