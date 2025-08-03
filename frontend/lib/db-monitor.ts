// 数据库性能监控工具
import { prisma } from './prisma'

interface QueryStats {
  query: string
  duration: number
  timestamp: Date
}

// 慢查询收集器
const slowQueries: QueryStats[] = []
const SLOW_QUERY_THRESHOLD = 1000 // 1秒

// 监控慢查询
export function setupDatabaseMonitoring() {
  if (process.env.NODE_ENV === 'development') {
    // 只在开发环境启用详细监控
    prisma.$on('query', (e) => {
      if (e.duration > SLOW_QUERY_THRESHOLD) {
        console.warn(`🐌 慢查询检测 (${e.duration}ms):`, e.query.substring(0, 100) + '...')
        
        slowQueries.push({
          query: e.query,
          duration: e.duration,
          timestamp: new Date()
        })
        
        // 保持最近50条慢查询记录
        if (slowQueries.length > 50) {
          slowQueries.shift()
        }
      }
    })
  }
}

// 获取数据库统计信息
export async function getDatabaseStats() {
  try {
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.memorial.count(),
      prisma.message.count(),
      prisma.candle.count(),
      prisma.memorialImage.count(),
    ])

    return {
      users: stats[0],
      memorials: stats[1], 
      messages: stats[2],
      candles: stats[3],
      images: stats[4],
      slowQueries: slowQueries.length,
      lastSlowQuery: slowQueries[slowQueries.length - 1]
    }
  } catch (error) {
    console.error('获取数据库统计失败:', error)
    return null
  }
}

// 获取数据库文件大小 (仅SQLite)
export async function getDatabaseSize(): Promise<number | null> {
  if (process.env.NODE_ENV === 'development') {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
      const stats = fs.statSync(dbPath)
      return stats.size
    } catch (error) {
      console.error('获取数据库大小失败:', error)
      return null
    }
  }
  return null
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

// 数据库健康检查
export async function checkDatabaseHealth() {
  const stats = await getDatabaseStats()
  const size = await getDatabaseSize()
  
  const health = {
    status: 'healthy' as 'healthy' | 'warning' | 'critical',
    issues: [] as string[],
    recommendations: [] as string[],
    stats,
    size: size ? formatFileSize(size) : null
  }

  if (stats) {
    // 检查数据增长趋势
    if (stats.memorials > 500) {
      health.status = 'warning'
      health.recommendations.push('考虑迁移到PostgreSQL以支持更大规模')
    }
    
    if (stats.slowQueries > 10) {
      health.status = 'warning'
      health.issues.push(`检测到 ${stats.slowQueries} 个慢查询`)
      health.recommendations.push('检查数据库索引和查询优化')
    }
    
    if (size && size > 50 * 1024 * 1024) { // 50MB
      health.status = 'warning'
      health.recommendations.push('数据库文件较大，考虑数据清理或升级')
    }
  }

  return health
}