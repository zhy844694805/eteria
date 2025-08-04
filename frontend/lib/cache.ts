// 简单的内存缓存实现
interface CacheItem<T = any> {
  data: T
  expiry: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem>()
  private maxSize = 1000 // 最大缓存条目数
  
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    const expiry = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { data, expiry })
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.data as T
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }
    
    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  // 获取缓存统计信息
  stats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 创建全局缓存实例
const memoryCache = new MemoryCache()

// 缓存配置
export const CACHE_CONFIG = {
  // 纪念页详情缓存时间（5分钟）
  MEMORIAL_DETAIL: 300,
  // 纪念页列表缓存时间（2分钟）
  MEMORIAL_LIST: 120,
  // 用户信息缓存时间（10分钟）
  USER_INFO: 600,
  // 图片信息缓存时间（1小时）
  IMAGE_INFO: 3600,
  // 统计数据缓存时间（30秒）
  STATS: 30,
  // QR码缓存时间（1天）
  QR_CODE: 86400
} as const

// 缓存工具函数
export const cache = {
  // 设置缓存
  set: <T>(key: string, data: T, ttlSeconds?: number) => {
    memoryCache.set(key, data, ttlSeconds)
  },
  
  // 获取缓存
  get: <T>(key: string): T | null => {
    return memoryCache.get<T>(key)
  },
  
  // 检查缓存是否存在
  has: (key: string): boolean => {
    return memoryCache.has(key)
  },
  
  // 删除缓存
  delete: (key: string): boolean => {
    return memoryCache.delete(key)
  },
  
  // 清空所有缓存
  clear: (): void => {
    memoryCache.clear()
  },
  
  // 获取缓存统计
  stats: () => {
    return memoryCache.stats()
  }
}

// 生成缓存键的工具函数
export const cacheKeys = {
  memorial: (id: string) => `memorial:${id}`,
  memorialBySlug: (slug: string) => `memorial:slug:${slug}`,
  memorialList: (page: number, type?: string) => `memorials:${page}:${type || 'all'}`,
  userMemorials: (userId: string) => `user:${userId}:memorials`,
  qrCode: (memorialId: string) => `qr:${memorialId}`,
  shareStats: (memorialId: string) => `share:${memorialId}`,
  imageInfo: (imageId: string) => `image:${imageId}`,
  userInfo: (userId: string) => `user:${userId}`
}

// 带缓存的异步函数包装器
export function withCache<T extends any[], R>(
  cacheKey: string,
  ttlSeconds: number,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    // 生成包含参数的缓存键
    const fullKey = `${cacheKey}:${JSON.stringify(args)}`
    
    // 尝试从缓存获取
    const cached = cache.get<R>(fullKey)
    if (cached !== null) {
      return cached
    }
    
    // 执行函数并缓存结果
    try {
      const result = await fn(...args)
      cache.set(fullKey, result, ttlSeconds)
      return result
    } catch (error) {
      // 不缓存错误结果
      throw error
    }
  }
}

// 缓存失效工具
export const invalidateCache = {
  // 失效纪念页相关缓存
  memorial: (memorialId: string, slug?: string) => {
    cache.delete(cacheKeys.memorial(memorialId))
    if (slug) {
      cache.delete(cacheKeys.memorialBySlug(slug))
    }
    // 失效相关的列表缓存（简单粗暴的方法）
    const stats = cache.stats()
    stats.keys.forEach(key => {
      if (key.startsWith('memorials:')) {
        cache.delete(key)
      }
    })
  },
  
  // 失效用户相关缓存
  user: (userId: string) => {
    cache.delete(cacheKeys.userInfo(userId))
    cache.delete(cacheKeys.userMemorials(userId))
  },
  
  // 失效分享统计缓存
  shareStats: (memorialId: string) => {
    cache.delete(cacheKeys.shareStats(memorialId))
  }
}

// 用于API响应的缓存中间件
export function createCacheHeaders(maxAge: number) {
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    'ETag': `"${Date.now()}"`,
    'Last-Modified': new Date().toUTCString()
  }
}

// 条件缓存：只有在数据不常变化时才缓存
export function conditionalCache<T>(
  key: string,
  data: T,
  condition: (data: T) => boolean,
  ttlSeconds: number
) {
  if (condition(data)) {
    cache.set(key, data, ttlSeconds)
  }
}

export default cache