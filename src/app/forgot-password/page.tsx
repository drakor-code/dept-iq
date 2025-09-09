"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, CheckCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { requestPasswordReset, resetPassword } from "@/lib/actions/auth-real"
import type { ResetPasswordData } from "@/types/user"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "verification" | "newPassword">("email")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await requestPasswordReset(email.trim())
      
      if (result.success && result.data?.userId) {
        setUserId(result.data.userId)
        setStep("verification")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء إرسال رمز التحقق")
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!verificationCode.trim()) {
      setError("رمز التحقق مطلوب")
      return
    }

    setStep("newPassword")
    setError("")
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("جميع الحقول مطلوبة")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين")
      return
    }

    if (newPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون على الأقل 6 أحرف")
      return
    }

    setLoading(true)
    setError("")

    try {
      const resetData: ResetPasswordData = {
        userId,
        code: verificationCode.trim(),
        newPassword: newPassword.trim()
      }

      const result = await resetPassword(resetData)
      
      if (result.success) {
        // إظهار رسالة نجاح والانتقال لصفحة تسجيل الدخول
        alert("تم تغيير كلمة المرور بنجاح")
        router.push("/")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ أثناء تغيير كلمة المرور")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive rounded-full flex items-center justify-center">
              {step === "email" && <Mail className="w-8 h-8 text-destructive-foreground" />}
              {step === "verification" && <Lock className="w-8 h-8 text-destructive-foreground" />}
              {step === "newPassword" && <CheckCircle className="w-8 h-8 text-destructive-foreground" />}
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              {step === "email" && "نسيت كلمة المرور"}
              {step === "verification" && "رمز التحقق"}
              {step === "newPassword" && "كلمة مرور جديدة"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === "email" && "أدخل بريدك الإلكتروني لإرسال رمز التحقق"}
              {step === "verification" && "أدخل رمز التحقق المرسل إلى بريدك الإلكتروني"}
              {step === "newPassword" && "أدخل كلمة المرور الجديدة"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-right"
                    placeholder="أدخل بريدك الإلكتروني"
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
                    {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push("/")}
                    disabled={loading}
                  >
                    رجوع
                  </Button>
                </div>
              </form>
            )}

            {step === "verification" && (
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-right">
                    رمز التحقق
                  </Label>
                  <Input
                    id="code"
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
                    التالي
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("email")}
                    disabled={loading}
                  >
                    رجوع
                  </Button>
                </div>
              </form>
            )}

            {step === "newPassword" && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-right flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    كلمة المرور الجديدة
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="text-right"
                    placeholder="أدخل كلمة المرور الجديدة"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-right flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    تأكيد كلمة المرور
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="text-right"
                    placeholder="أعد إدخال كلمة المرور"
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
                    {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("verification")}
                    disabled={loading}
                  >
                    رجوع
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}