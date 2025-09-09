"use client"

import type React from "react"
import dynamic from "next/dynamic"

import { useAuth } from "@/components/auth-context"
import { Header } from "@/components/header"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

const Sidebar = dynamic(() => import("@/components/sidebar").then(mod => ({ default: mod.Sidebar })), {
  ssr: false,
  loading: () => (
    <div className="w-64 bg-sidebar border-l border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-primary-foreground/20 rounded"></div>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold text-sidebar-foreground">Debt-IQ</h1>
            <p className="text-sm text-sidebar-foreground/70">نظام إدارة الديون</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-right">
          <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
          <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    </div>
  )
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isHydrated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isHydrated, router])

  // Don't render anything until hydration is complete
  if (!isHydrated) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/30">{children}</main>
      </div>
    </div>
  )
}
