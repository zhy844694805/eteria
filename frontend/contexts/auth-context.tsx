"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User, AuthContextType } from '@/lib/types/auth'
import { authService } from '@/lib/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 初始化时检查用户登录状态
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const user = await authService.login(email, password)
      setUser(user)
      
      // 根据用户偏好重定向
      const redirectPath = authService.getPreferredRedirect(user)
      router.push(redirectPath)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const user = await authService.register(name, email, password)
      setUser(user)
      
      // 新用户重定向到选择页面
      router.push('/')
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    router.push('/')
  }

  const updatePreferredSystem = (system: 'pet' | 'human') => {
    if (user) {
      authService.updatePreferredSystem(user.id, system)
      setUser({ ...user, preferredSystem: system })
    }
  }

  const updateUserInfo = (updates: Partial<Pick<User, 'name'>>): boolean => {
    if (user) {
      const updatedUser = authService.updateUserInfo(user.id, updates)
      if (updatedUser) {
        setUser(updatedUser)
        return true
      }
    }
    return false
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updatePreferredSystem,
    updateUserInfo
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}