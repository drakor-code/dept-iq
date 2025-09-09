"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  fullName: string
  username: string
  email: string
  password: string
  role: "admin" | "employee"
  dateCreated: string
}

interface UserContextType {
  users: User[]
  addUser: (user: Omit<User, "id" | "dateCreated">) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  getUserById: (id: string) => User | undefined
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])

  // Initialize with mock users
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "1",
        fullName: "الأفنان لتكنولوجيا المعلومات",
        username: "admin",
        email: "admin@alfanan.com",
        password: "admin123",
        role: "admin",
        dateCreated: "2024-01-01",
      },
      {
        id: "2",
        fullName: "محمد أحمد السعيد",
        username: "mohammed",
        email: "mohammed@alfanan.com",
        password: "emp123",
        role: "employee",
        dateCreated: "2024-01-15",
      },
      {
        id: "3",
        fullName: "فاطمة علي الزهراني",
        username: "fatima",
        email: "fatima@alfanan.com",
        password: "emp456",
        role: "employee",
        dateCreated: "2024-01-20",
      },
    ]

    setUsers(mockUsers)
  }, [])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addUser = (userData: Omit<User, "id" | "dateCreated">) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      dateCreated: new Date().toISOString().split("T")[0],
    }
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...userData } : user)))
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const getUserById = (id: string) => {
    return users.find((user) => user.id === id)
  }

  return (
    <UserContext.Provider value={{ users, addUser, updateUser, deleteUser, getUserById }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider")
  }
  return context
}
