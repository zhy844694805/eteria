"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User, AuthContextType } from '@/lib/types/auth'
import { databaseAuthService } from '@/lib/auth-db'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 初始化时检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await databaseAuthService.getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }
    checkUser()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const user = await databaseAuthService.login(email, password)
      setUser(user)
      
      // 检查是否有保存的表单数据需要恢复
      const savedData = sessionStorage.getItem('memorialFormData')
      const savedStep = sessionStorage.getItem('memorialFormStep')
      const savedType = sessionStorage.getItem('memorialFormType')
      
      if (savedData && savedStep && savedType) {
        // 有保存的表单数据，跳转回对应的创建页面
        const redirectPath = savedType === 'pet' ? '/create-obituary' : '/create-person-obituary'
        router.push(redirectPath)
      } else {
        // 没有保存的表单数据，根据用户偏好重定向
        const redirectPath = databaseAuthService.getPreferredRedirect(user)
        router.push(redirectPath)
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const user = await databaseAuthService.register(name, email, password)
      setUser(user)
      
      // 检查是否有保存的表单数据需要恢复
      const savedData = sessionStorage.getItem('memorialFormData')
      const savedStep = sessionStorage.getItem('memorialFormStep')
      const savedType = sessionStorage.getItem('memorialFormType')
      
      if (savedData && savedStep && savedType) {
        // 有保存的表单数据，跳转回对应的创建页面
        const redirectPath = savedType === 'pet' ? '/create-obituary' : '/create-person-obituary'
        router.push(redirectPath)
      } else {
        // 没有保存的表单数据，新用户重定向到选择页面
        router.push('/')
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await databaseAuthService.logout()
    setUser(null)
    router.push('/')
  }

  const updatePreferredSystem = async (system: 'pet' | 'human') => {
    if (!user) return
    try {
      await databaseAuthService.updatePreferredSystem(user.id, system)
      const updatedUser = await databaseAuthService.getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Update preferred system error:', error)
    }
  }

  const updateUserInfo = async (updates: Partial<Pick<User, 'name'>>): Promise<boolean> => {
    if (!user) return false
    try {
      const updatedUser = await databaseAuthService.updateUserInfo(user.id, updates)
      setUser(updatedUser)
      return true
    } catch (error) {
      console.error('Update user info error:', error)
      return false
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      // 获取Google OAuth授权URL
      const response = await fetch('/api/auth/google')
      const data = await response.json()
      
      if (!data.success) {
        throw new Error('获取Google授权链接失败')
      }
      
      // 重定向到Google授权页面
      window.location.href = data.authUrl
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const handleGoogleCallback = async (token: string) => {
    try {
      // 验证并解析token
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Token验证失败')
      }

      const data = await response.json()
      
      // 保存用户信息
      localStorage.setItem('authToken', token)
      setUser(data.user)
      
      // 检查是否有保存的表单数据需要恢复
      const savedData = sessionStorage.getItem('memorialFormData')
      const savedStep = sessionStorage.getItem('memorialFormStep')
      const savedType = sessionStorage.getItem('memorialFormType')
      
      if (savedData && savedStep && savedType) {
        // 有保存的表单数据，跳转回对应的创建页面
        const redirectPath = savedType === 'pet' ? '/create-obituary' : '/create-person-obituary'
        router.push(redirectPath)
      } else {
        // 没有保存的表单数据，根据用户偏好重定向
        const redirectPath = databaseAuthService.getPreferredRedirect(data.user)
        router.push(redirectPath)
      }
    } catch (error) {
      console.error('Google login callback error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updatePreferredSystem,
    updateUserInfo,
    loginWithGoogle,
    handleGoogleCallback
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