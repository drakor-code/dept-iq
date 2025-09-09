"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getCurrentSession, logoutUser } from "@/lib/actions/auth-real"
import type { UserWithoutPassword } from "@/types/user"

interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: "admin" | "employee"
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isAuthenticated: boolean
  isHydrated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for current session on mount
    const checkSession = async () => {
      try {
        const session = await getCurrentSession()
        if (session) {
          setUser({
            id: session.userId,
            username: session.username,
            email: session.email,
            fullName: session.fullName,
            role: session.role
          })
        }
      } catch (error) {
        console.error("Session check error:", error)
      } finally {
        setLoading(false)
        setIsHydrated(true)
      }
    }

    checkSession()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await logoutUser()
      setUser(null)
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if server call fails
      setUser(null)
      window.location.href = "/"
    }
  }

  const isAuthenticated = !!user

  return <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isHydrated, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
