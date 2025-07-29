import type { User } from '@prisma/client'

// 定义前端User类型，匹配数据库返回的结构
export interface ApiUser {
  id: string
  name: string
  email: string
  preferredSystem: 'PET' | 'HUMAN' | null
  createdAt: string
  lastLoginAt: string
}

// 转换数据库用户类型到前端类型
export function transformUser(dbUser: ApiUser): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    preferredSystem: dbUser.preferredSystem === 'PET' ? 'pet' : 
                     dbUser.preferredSystem === 'HUMAN' ? 'human' : undefined,
    createdAt: dbUser.createdAt,
    lastLoginAt: dbUser.lastLoginAt
  }
}

export class DatabaseAuthService {
  // 获取当前用户（从localStorage）
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    const userJson = localStorage.getItem('eternalmemory_current_user')
    return userJson ? JSON.parse(userJson) : null
  }

  // 保存当前用户到localStorage
  private setCurrentUser(user: User | null): void {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem('eternalmemory_current_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('eternalmemory_current_user')
    }
  }

  // 注册用户
  async register(name: string, email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '注册失败')
    }

    const user = transformUser(data.user)
    this.setCurrentUser(user)
    return user
  }

  // 登录
  async login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '登录失败')
    }

    const user = transformUser(data.user)
    this.setCurrentUser(user)
    return user
  }

  // 登出
  logout(): void {
    this.setCurrentUser(null)
  }

  // 更新用户偏好系统
  async updatePreferredSystem(userId: string, system: 'pet' | 'human'): Promise<void> {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        preferredSystem: system === 'pet' ? 'PET' : 'HUMAN' 
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '更新偏好失败')
    }

    const updatedUser = transformUser(data.user)
    this.setCurrentUser(updatedUser)
  }

  // 更新用户信息
  async updateUserInfo(userId: string, updates: { name?: string }): Promise<User> {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '更新用户信息失败')
    }

    const updatedUser = transformUser(data.user)
    this.setCurrentUser(updatedUser)
    return updatedUser
  }

  // 获取用户偏好的重定向路径
  getPreferredRedirect(user: User | null): string {
    if (!user?.preferredSystem) return '/'
    
    switch (user.preferredSystem) {
      case 'pet':
        return '/pet-memorial'
      case 'human':
        return '/human-memorial'
      default:
        return '/'
    }
  }
}

export const databaseAuthService = new DatabaseAuthService()