import type { User } from './types/auth'

// 模拟用户数据库
const USERS_KEY = 'eternalmemory_users'
const CURRENT_USER_KEY = 'eternalmemory_current_user'

export class AuthService {
  // 获取所有用户
  private getUsers(): User[] {
    if (typeof window === 'undefined') return []
    const users = localStorage.getItem(USERS_KEY)
    return users ? JSON.parse(users) : []
  }

  // 保存用户
  private saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  // 获取当前用户
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem(CURRENT_USER_KEY)
    return user ? JSON.parse(user) : null
  }

  // 保存当前用户
  private setCurrentUser(user: User | null): void {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  }

  // 注册用户
  async register(name: string, email: string, password: string): Promise<User> {
    const users = this.getUsers()
    
    // 检查邮箱是否已存在
    if (users.find(u => u.email === email)) {
      throw new Error('该邮箱已被注册')
    }

    // 创建新用户
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    users.push(newUser)
    this.saveUsers(users)
    this.setCurrentUser(newUser)
    
    return newUser
  }

  // 登录
  async login(email: string, password: string): Promise<User> {
    const users = this.getUsers()
    const user = users.find(u => u.email === email)
    
    if (!user) {
      throw new Error('用户不存在')
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date().toISOString()
    const userIndex = users.findIndex(u => u.id === user.id)
    users[userIndex] = user
    this.saveUsers(users)
    this.setCurrentUser(user)
    
    return user
  }

  // 登出
  logout(): void {
    this.setCurrentUser(null)
  }

  // 更新用户偏好系统
  updatePreferredSystem(userId: string, system: 'pet' | 'human'): void {
    const users = this.getUsers()
    const userIndex = users.findIndex(u => u.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex].preferredSystem = system
      this.saveUsers(users)
      this.setCurrentUser(users[userIndex])
    }
  }

  // 更新用户信息
  updateUserInfo(userId: string, updates: Partial<Pick<User, 'name'>>): User | null {
    const users = this.getUsers()
    const userIndex = users.findIndex(u => u.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      this.saveUsers(users)
      this.setCurrentUser(users[userIndex])
      return users[userIndex]
    }
    
    return null
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

export const authService = new AuthService()