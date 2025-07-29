export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  preferredSystem?: 'pet' | 'human' // 用户偏好的纪念系统
  createdAt: string
  lastLoginAt: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updatePreferredSystem: (system: 'pet' | 'human') => Promise<void>
  updateUserInfo: (updates: Partial<Pick<User, 'name'>>) => Promise<boolean>
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}