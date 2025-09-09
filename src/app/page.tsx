"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"
import { loginUser, verifyLoginCode } from "@/lib/actions/auth-real"
import type { LoginData, VerifyCodeData } from "@/types/user"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    emailOrUsername: "",
    password: "",
  })
  const [step, setStep] = useState<"login" | "verification">("login")
  const [verificationCode, setVerificationCode] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState("")

  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // إذا كان المستخدم مسجل دخول بالفعل، انتقل إلى لوحة التحكم
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User already authenticated, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // التحقق من البيانات
    if (!loginData.emailOrUsername.trim() || !loginData.password.trim()) {
      setError("جميع الحقول مطلوبة")
      return
    }
    
    setLoading(true)
    setError("")
    
    try {
      console.log("🔍 محاولة تسجيل الدخول من الفرونت إند:", loginData)
      
      const result = await loginUser(loginData as LoginData)
      
      console.log("📋 نتيجة تسجيل الدخول:", result)
      
      if (result.success && result.user) {
        setCurrentUserId(result.user.id)
        setStep("verification")
        console.log("✅ تم الانتقال لخطوة التحقق")
      } else {
        setError(result.message)
        console.log("❌ فشل تسجيل الدخول:", result.message)
      }
    } catch (error) {
      console.error("❌ خطأ في تسجيل الدخول:", error)
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!verificationCode.trim()) {
      setError("رمز التحقق مطلوب")
      return
    }

    if (!currentUserId) {
      setError("حدث خطأ، يرجى المحاولة مرة أخرى")
      return
    }

    setLoading(true)
    setError("")

    try {
      const verifyData: VerifyCodeData = {
        userId: currentUserId,
        code: verificationCode.trim(),
        type: 'login'
      }

      const result = await verifyLoginCode(verifyData)
      
      if (result.success && result.user) {
        // تسجيل الدخول في الـ context
        login({
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          fullName: result.user.fullName,
          role: result.user.role
        })
        
        // الانتقال إلى لوحة التحكم
        router.push("/dashboard")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء التحقق من الرمز")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) {
      setError("البريد الإلكتروني مطلوب")
      return
    }
    // Simulate password reset
    alert("تم إرسال رمز التحقق إلى بريدك الإلكتروني")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "login" ? (
          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Debt-IQ</CardTitle>
              <CardDescription className="text-muted-foreground">نظام إدارة الديون المتقدم</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="emailOrUsername" className="text-right flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني أو اسم المستخدم
                  </Label>
                  <Input
                    id="emailOrUsername"
                    type="text"
                    value={loginData.emailOrUsername}
                    onChange={(e) => setLoginData({ ...loginData, emailOrUsername: e.target.value })}
                    className="text-right"
                    placeholder="mahmodyassen548@gmail.com أو mahmoud"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-right flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="text-right pr-10"
                      placeholder="أدخل كلمة المرور"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-right">{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm text-muted-foreground"
                  onClick={() => router.push("/forgot-password")}
                >
                  نسيت كلمة المرور؟
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">التحقق من الهوية</CardTitle>
              <CardDescription className="text-muted-foreground">
                تم إرسال رمز التحقق إلى بريدك الإلكتروني
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification" className="text-right">
                    رمز التحقق
                  </Label>
                  <Input
                    id="verification"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="text-right text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-right">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "جاري التحقق..." : "تأكيد"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setStep("login")
                      setError("")
                      setVerificationCode("")
                    }}
                    disabled={loading}
                  >
                    رجوع
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
