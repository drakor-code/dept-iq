import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/components/auth-context"
import { DebtProvider } from "@/components/debt-context"
import { UserProvider } from "@/components/user-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Debt-IQ | نظام إدارة الديون",
  description: "نظام إدارة الديون المتقدم للشركات والمؤسسات",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <UserProvider>
            <DebtProvider>
              <Suspense fallback={null}>{children}</Suspense>
            </DebtProvider>
          </UserProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
