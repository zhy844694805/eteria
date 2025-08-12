// 简单的内存缓存实现
interface CacheItem<T = any> {
  data: T
  expiry: number
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  size: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem>()
  private maxSize = 1000 // 最大缓存条目数
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  }
  
  constructor() {
    // 定期清理过期缓存（每5分钟）
    setInterval(() => this.cleanExpired(), 5 * 60 * 1000)
  }
  
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
    this.stats.sets++
    this.stats.size = this.cache.size
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return null
    }
    
    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.deletes++
      this.stats.size = this.cache.size
      return null
    }
    
    this.stats.hits++
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
      this.stats.deletes++
      this.stats.size = this.cache.size
      return false
    }
    
    return true
  }
  
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
      this.stats.size = this.cache.size
    }
    return deleted
  }
  
  // 模糊删除 - 删除匹配模式的所有key
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'))
    let count = 0
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    
    this.stats.deletes += count
    this.stats.size = this.cache.size
    return count
  }
  
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    this.stats.deletes += size
    this.stats.size = 0
  }
  
  // 清理过期缓存
  private cleanExpired(): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.stats.deletes += cleaned
      this.stats.size = this.cache.size
      console.log(`[Cache] Cleaned ${cleaned} expired entries`)
    }
  }
  
  // 获取缓存统计信息
  getStats() {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
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
  QR_CODE: 86400,
  // 搜索结果缓存时间（2分钟）
  SEARCH_RESULTS: 120,
  // 数字生命缓存时间（15分钟）
  DIGITAL_LIFE: 900,
  // 社区列表缓存时间（3分钟）
  COMMUNITY_LIST: 180,
  // 交互检查缓存时间（1小时）
  INTERACTION_CHECK: 3600
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
  
  // 模糊删除
  deletePattern: (pattern: string): number => {
    return memoryCache.deletePattern(pattern)
  },
  
  // 清空所有缓存
  clear: (): void => {
    memoryCache.clear()
  },
  
  // 获取缓存统计
  stats: () => {
    return memoryCache.getStats()
  }
}

// 生成缓存键的工具函数
export const cacheKeys = {
  memorial: (id: string) => `memorial:${id}`,
  memorialBySlug: (slug: string) => `memorial:slug:${slug}`,
  memorialList: (page: number, type?: string, userId?: string) => 
    `memorials:${page}:${type || 'all'}:${userId || 'all'}`,
  userMemorials: (userId: string) => `user:${userId}:memorials`,
  qrCode: (memorialId: string) => `qr:${memorialId}`,
  shareStats: (memorialId: string) => `share:${memorialId}`,
  imageInfo: (imageId: string) => `image:${imageId}`,
  userInfo: (userId: string) => `user:${userId}`,
  search: (query: string, type?: string, page = 1) => 
    `search:${encodeURIComponent(query)}:${type || 'all'}:${page}`,
  digitalLife: (id: string) => `digital_life:${id}`,
  digitalLifeList: (userId: string) => `digital_lives:${userId}`,
  community: (type: string, page = 1, limit = 10) => 
    `community:${type}:${page}:${limit}`,
  candleCheck: (memorialId: string, userId?: string, ip?: string) => 
    `candle_check:${memorialId}:${userId || 'anon'}:${ip?.slice(-6) || 'no_ip'}`,
  likeCheck: (memorialId: string, userId: string) => 
    `like_check:${memorialId}:${userId}`,
  adminStats: () => 'admin:stats',
  userStats: (userId: string) => `user:${userId}:stats`
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
    // 使用模糊删除功能
    cache.deletePattern('memorials:*')
    cache.deletePattern('community:*')
    cache.deletePattern('search:*')
  },
  
  // 失效用户相关缓存
  user: (userId: string) => {
    cache.delete(cacheKeys.userInfo(userId))
    cache.delete(cacheKeys.userMemorials(userId))
    cache.deletePattern(`user:${userId}:*`)
  },
  
  // 失效分享统计缓存
  shareStats: (memorialId: string) => {
    cache.delete(cacheKeys.shareStats(memorialId))
  },
  
  // 失效数字生命相关缓存
  digitalLife: (digitalLifeId: string, userId: string) => {
    cache.deletePattern(`digital_life:*`)
    cache.deletePattern(`user:${userId}:digital*`)
  },
  
  // 失效社区相关缓存
  community: () => {
    cache.deletePattern('community:*')
    cache.deletePattern('memorials:*')
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