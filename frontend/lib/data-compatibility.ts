/**
 * 数据兼容性处理工具
 * 处理API优化后的数据结构变更
 */

/**
 * 统一纪念页数据格式
 */
export function normalizeMemorialData(memorial: any) {
  if (!memorial) return memorial

  return {
    ...memorial,
    // 确保统计数据字段存在
    candleCount: memorial.candleCount || memorial._count?.candles || 0,
    messageCount: memorial.messageCount || memorial._count?.messages || 0,
    likeCount: memorial.likeCount || memorial._count?.likes || 0,
    viewCount: memorial.viewCount || 0,
    
    // 兼容旧的_count格式
    _count: memorial._count || {
      messages: memorial.messageCount || 0,
      candles: memorial.candleCount || 0,
      likes: memorial.likeCount || 0
    }
  }
}

/**
 * 批量处理纪念页数据
 */
export function normalizeMemorialList(memorials: any[]): any[] {
  if (!Array.isArray(memorials)) return []
  
  return memorials.map(normalizeMemorialData)
}

/**
 * 统一用户数据格式
 */
export function normalizeUserData(user: any) {
  if (!user) return user

  return {
    ...user,
    // 确保必要字段存在
    name: user.name || user.displayName || 'Unknown User',
    email: user.email || '',
    avatar: user.avatar || user.avatarUrl || null,
    role: user.role || 'USER'
  }
}

/**
 * 统一API响应格式
 */
export function normalizeAPIResponse(response: any) {
  if (!response) return response

  // 如果是纪念页列表响应
  if (response.memorials && Array.isArray(response.memorials)) {
    return {
      ...response,
      memorials: normalizeMemorialList(response.memorials)
    }
  }

  // 如果是单个纪念页响应
  if (response.memorial) {
    return {
      ...response,
      memorial: normalizeMemorialData(response.memorial)
    }
  }

  // 如果是用户响应
  if (response.user) {
    return {
      ...response,
      user: normalizeUserData(response.user)
    }
  }

  return response
}

/**
 * 安全获取嵌套属性
 */
export function safeGet(obj: any, path: string, defaultValue: any = null) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue
  }, obj)
}

/**
 * 数字格式化（处理可能的字符串数字）
 */
export function safeNumber(value: any): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/**
 * 字符串格式化（处理可能的null/undefined）
 */
export function safeString(value: any): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

/**
 * 日期格式化（处理各种日期格式）
 */
export function safeDate(value: any): Date | null {
  if (!value) return null
  
  if (value instanceof Date) return value
  
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? null : parsed
  }
  
  return null
}

/**
 * 图片URL处理（确保有有效的占位符）
 */
export function safeImageUrl(url: any, fallback: string = '/placeholder.svg'): string {
  if (!url || typeof url !== 'string') return fallback
  
  // 检查是否是有效的URL格式
  if (url.startsWith('http') || url.startsWith('/')) {
    return url
  }
  
  return fallback
}

/**
 * 获取主图片
 */
export function getMainImage(images: any[], fallback: string = '/placeholder.svg'): string {
  if (!Array.isArray(images) || images.length === 0) {
    return fallback
  }

  // 查找主图片
  const mainImage = images.find(img => img?.isMain)
  if (mainImage?.url) {
    return safeImageUrl(mainImage.url, fallback)
  }

  // 使用第一张图片
  const firstImage = images[0]
  if (firstImage?.url) {
    return safeImageUrl(firstImage.url, fallback)
  }

  return fallback
}

/**
 * 处理API错误响应
 */
export function handleAPIError(error: any) {
  console.error('API Error:', error)
  
  if (error?.response?.data) {
    return {
      message: error.response.data.message || error.response.data.error || 'API request failed',
      status: error.response.status,
      data: error.response.data
    }
  }
  
  if (error?.message) {
    return {
      message: error.message,
      status: 500,
      data: null
    }
  }
  
  return {
    message: 'Unknown error occurred',
    status: 500,
    data: null
  }
}

/**
 * 缓存兼容的API包装器
 */
export async function fetchWithCompatibility(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return normalizeAPIResponse(data)
  } catch (error) {
    throw handleAPIError(error)
  }
}