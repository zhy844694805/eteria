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
        const redirectPath = '/create-person-obituary'
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
        const redirectPath = '/create-person-obituary'
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

  // 自动检测和更新用户偏好系统（防止重复调用）
  const autoDetectAndSetPreferredSystem = async (pathname: string) => {
    if (!user || user.preferredSystem) return // 如果已经有偏好，不自动更新
    
    let detectedSystem: 'pet' | 'human' | null = null
    
    // 检测用户当前访问的系统
    if (pathname.startsWith('/pet-memorial') || 
        pathname.startsWith('/create-obituary') || 
        pathname.startsWith('/community-pet-obituaries')) {
      detectedSystem = 'pet'
    } else if (pathname.startsWith('/human-memorial') || 
               pathname.startsWith('/create-person-obituary') || 
               pathname.startsWith('/community-person-obituaries')) {
      detectedSystem = 'human'
    }
    
    // 只有检测到明确的系统偏好时才更新
    if (detectedSystem) {
      // 防抖：检查上次更新时间，避免频繁调用
      const lastUpdate = sessionStorage.getItem('lastPreferredSystemUpdate')
      const now = Date.now()
      if (lastUpdate && (now - parseInt(lastUpdate)) < 5000) { // 5秒内不重复更新
        return
      }
      
      sessionStorage.setItem('lastPreferredSystemUpdate', now.toString())
      await updatePreferredSystem(detectedSystem)
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


  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updatePreferredSystem,
    updateUserInfo,
    autoDetectAndSetPreferredSystem
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