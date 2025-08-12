import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 性能数据验证 schema
const performanceDataSchema = z.object({
  metrics: z.array(z.object({
    name: z.string(),
    value: z.number(),
    timestamp: z.number(),
    url: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string()
  })),
  apiMetrics: z.array(z.object({
    url: z.string(),
    method: z.string(),
    status: z.number(),
    duration: z.number(),
    size: z.number().optional(),
    timestamp: z.number(),
    userId: z.string().optional()
  })),
  interactions: z.array(z.object({
    type: z.enum(['click', 'scroll', 'navigation', 'form_submit']),
    element: z.string().optional(),
    page: z.string(),
    timestamp: z.number(),
    userId: z.string().optional(),
    sessionId: z.string(),
    metadata: z.record(z.any()).optional()
  })),
  summary: z.any(),
  timestamp: z.number(),
  sessionId: z.string(),
  url: z.string(),
  userAgent: z.string()
})

// 简单的内存存储（生产环境应该使用数据库或专门的监控服务）
interface PerformanceStorage {
  data: any[]
  stats: {
    totalRequests: number
    errorCount: number
    avgResponseTime: number
    lastUpdated: number
  }
}

const performanceStorage: PerformanceStorage = {
  data: [],
  stats: {
    totalRequests: 0,
    errorCount: 0,
    avgResponseTime: 0,
    lastUpdated: Date.now()
  }
}

/**
 * 接收性能数据
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = performanceDataSchema.parse(body)

    // 存储性能数据
    storePerformanceData(validatedData)

    // 更新统计信息
    updateStats(validatedData)

    // 检查异常情况并发送告警
    checkAnomalies(validatedData)

    // 日志记录（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance API] Received data:', {
        sessionId: validatedData.sessionId,
        metricsCount: validatedData.metrics.length,
        apiMetricsCount: validatedData.apiMetrics.length,
        interactionsCount: validatedData.interactions.length
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Performance data received',
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Performance API error:', error)
    
    performanceStorage.stats.errorCount++
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid performance data format',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process performance data' },
      { status: 500 }
    )
  }
}

/**
 * 获取性能统计数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '1h'
    const metric = searchParams.get('metric')
    const sessionId = searchParams.get('sessionId')

    const stats = getPerformanceStats(timeRange, metric, sessionId)

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Performance stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get performance stats' },
      { status: 500 }
    )
  }
}

/**
 * 存储性能数据
 */
function storePerformanceData(data: any) {
  // 添加接收时间戳
  const enrichedData = {
    ...data,
    receivedAt: Date.now()
  }

  performanceStorage.data.push(enrichedData)

  // 限制存储大小（保留最近1000条记录）
  if (performanceStorage.data.length > 1000) {
    performanceStorage.data = performanceStorage.data.slice(-1000)
  }

  // 定期清理旧数据（保留最近24小时）
  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000
  performanceStorage.data = performanceStorage.data.filter(
    item => item.receivedAt > cutoffTime
  )
}

/**
 * 更新统计信息
 */
function updateStats(data: any) {
  performanceStorage.stats.totalRequests++
  performanceStorage.stats.lastUpdated = Date.now()

  // 计算平均API响应时间
  if (data.apiMetrics && data.apiMetrics.length > 0) {
    const totalDuration = data.apiMetrics.reduce(
      (sum: number, metric: any) => sum + metric.duration,
      0
    )
    const avgDuration = totalDuration / data.apiMetrics.length

    // 指数移动平均
    const alpha = 0.1
    performanceStorage.stats.avgResponseTime = 
      performanceStorage.stats.avgResponseTime === 0
        ? avgDuration
        : alpha * avgDuration + (1 - alpha) * performanceStorage.stats.avgResponseTime
  }
}

/**
 * 检查异常情况
 */
function checkAnomalies(data: any) {
  const alerts: string[] = []

  // 检查慢查询
  data.apiMetrics?.forEach((metric: any) => {
    if (metric.duration > 5000) {
      alerts.push(`Slow API detected: ${metric.url} took ${metric.duration}ms`)
    }
  })

  // 检查Web Vitals
  data.metrics?.forEach((metric: any) => {
    const thresholds: Record<string, number> = {
      'FCP': 2500,
      'LCP': 4000,
      'FID': 300,
      'CLS': 0.25,
      'TTI': 5000
    }

    if (thresholds[metric.name] && metric.value > thresholds[metric.name]) {
      alerts.push(`Poor ${metric.name}: ${metric.value} (threshold: ${thresholds[metric.name]})`)
    }
  })

  // 发送告警（仅在生产环境）
  if (alerts.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('[Performance Alert]', alerts)
    // 这里可以集成第三方告警服务
    sendAlerts(alerts, data.sessionId)
  }
}

/**
 * 发送告警
 */
function sendAlerts(alerts: string[], sessionId: string) {
  // 在这里实现告警逻辑
  // 例如发送邮件、Slack通知、或推送到监控平台
  
  // 示例：简单的日志记录
  console.error('[PERFORMANCE ALERT]', {
    sessionId,
    alerts,
    timestamp: new Date().toISOString()
  })
}

/**
 * 获取性能统计
 */
function getPerformanceStats(timeRange: string, metric?: string | null, sessionId?: string | null) {
  const now = Date.now()
  let cutoffTime = now - 60 * 60 * 1000 // 默认1小时

  // 解析时间范围
  switch (timeRange) {
    case '15m':
      cutoffTime = now - 15 * 60 * 1000
      break
    case '1h':
      cutoffTime = now - 60 * 60 * 1000
      break
    case '6h':
      cutoffTime = now - 6 * 60 * 60 * 1000
      break
    case '24h':
      cutoffTime = now - 24 * 60 * 60 * 1000
      break
  }

  // 过滤数据
  let filteredData = performanceStorage.data.filter(item => 
    item.receivedAt > cutoffTime
  )

  if (sessionId) {
    filteredData = filteredData.filter(item => item.sessionId === sessionId)
  }

  // 聚合统计
  const stats = {
    timeRange,
    totalSessions: new Set(filteredData.map(item => item.sessionId)).size,
    totalRequests: filteredData.length,
    
    // Web Vitals 统计
    webVitals: calculateWebVitalsStats(filteredData, metric),
    
    // API 性能统计
    apiStats: calculateAPIStats(filteredData),
    
    // 用户交互统计
    interactionStats: calculateInteractionStats(filteredData),
    
    // 错误统计
    errorStats: {
      totalErrors: performanceStorage.stats.errorCount,
      errorRate: performanceStorage.stats.errorCount / performanceStorage.stats.totalRequests * 100
    },
    
    // 全局统计
    global: performanceStorage.stats,
    
    // 时间序列数据（用于图表）
    timeSeries: generateTimeSeries(filteredData, cutoffTime),
    
    // 页面统计
    pageStats: calculatePageStats(filteredData),
    
    // 浏览器统计
    browserStats: calculateBrowserStats(filteredData)
  }

  return stats
}

/**
 * 计算 Web Vitals 统计
 */
function calculateWebVitalsStats(data: any[], specificMetric?: string | null) {
  const vitals: Record<string, number[]> = {}

  data.forEach(item => {
    item.metrics?.forEach((metric: any) => {
      if (!specificMetric || metric.name === specificMetric) {
        if (!vitals[metric.name]) {
          vitals[metric.name] = []
        }
        vitals[metric.name].push(metric.value)
      }
    })
  })

  const stats: Record<string, any> = {}
  Object.keys(vitals).forEach(name => {
    const values = vitals[name]
    values.sort((a, b) => a - b)

    stats[name] = {
      count: values.length,
      min: values[0],
      max: values[values.length - 1],
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      p50: values[Math.floor(values.length * 0.5)],
      p75: values[Math.floor(values.length * 0.75)],
      p90: values[Math.floor(values.length * 0.9)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)]
    }
  })

  return stats
}

/**
 * 计算 API 统计
 */
function calculateAPIStats(data: any[]) {
  const apiCalls: any[] = []
  const urlStats: Record<string, { count: number, durations: number[] }> = {}

  data.forEach(item => {
    item.apiMetrics?.forEach((metric: any) => {
      apiCalls.push(metric)
      
      if (!urlStats[metric.url]) {
        urlStats[metric.url] = { count: 0, durations: [] }
      }
      urlStats[metric.url].count++
      urlStats[metric.url].durations.push(metric.duration)
    })
  })

  const slowestAPIs = Object.keys(urlStats)
    .map(url => {
      const durations = urlStats[url].durations
      durations.sort((a, b) => a - b)
      return {
        url,
        count: urlStats[url].count,
        avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        p95Duration: durations[Math.floor(durations.length * 0.95)]
      }
    })
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 10)

  return {
    totalCalls: apiCalls.length,
    uniqueAPIs: Object.keys(urlStats).length,
    slowestAPIs,
    errorRate: apiCalls.filter(call => call.status >= 400).length / apiCalls.length * 100
  }
}

/**
 * 计算交互统计
 */
function calculateInteractionStats(data: any[]) {
  const interactions: any[] = []
  const typeStats: Record<string, number> = {}

  data.forEach(item => {
    item.interactions?.forEach((interaction: any) => {
      interactions.push(interaction)
      typeStats[interaction.type] = (typeStats[interaction.type] || 0) + 1
    })
  })

  return {
    totalInteractions: interactions.length,
    interactionTypes: typeStats,
    mostActivePages: getMostActivePages(interactions)
  }
}

/**
 * 生成时间序列数据
 */
function generateTimeSeries(data: any[], cutoffTime: number) {
  const intervalSize = 5 * 60 * 1000 // 5分钟间隔
  const intervals: Record<number, { timestamp: number, metrics: any, apiCalls: number, interactions: number }> = {}

  data.forEach(item => {
    const intervalStart = Math.floor(item.receivedAt / intervalSize) * intervalSize
    
    if (!intervals[intervalStart]) {
      intervals[intervalStart] = {
        timestamp: intervalStart,
        metrics: {},
        apiCalls: 0,
        interactions: 0
      }
    }

    intervals[intervalStart].apiCalls += item.apiMetrics?.length || 0
    intervals[intervalStart].interactions += item.interactions?.length || 0

    // 聚合指标
    item.metrics?.forEach((metric: any) => {
      if (!intervals[intervalStart].metrics[metric.name]) {
        intervals[intervalStart].metrics[metric.name] = []
      }
      intervals[intervalStart].metrics[metric.name].push(metric.value)
    })
  })

  return Object.values(intervals).sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * 计算页面统计
 */
function calculatePageStats(data: any[]) {
  const pageStats: Record<string, { visits: number, interactions: number }> = {}

  data.forEach(item => {
    const url = new URL(item.url).pathname
    if (!pageStats[url]) {
      pageStats[url] = { visits: 0, interactions: 0 }
    }
    pageStats[url].visits++
    pageStats[url].interactions += item.interactions?.length || 0
  })

  return Object.keys(pageStats)
    .map(page => ({
      page,
      ...pageStats[page]
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
}

/**
 * 计算浏览器统计
 */
function calculateBrowserStats(data: any[]) {
  const browserStats: Record<string, number> = {}

  data.forEach(item => {
    const userAgent = item.userAgent
    const browser = parseBrowser(userAgent)
    browserStats[browser] = (browserStats[browser] || 0) + 1
  })

  return browserStats
}

/**
 * 解析浏览器信息
 */
function parseBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Other'
}

/**
 * 获取最活跃页面
 */
function getMostActivePages(interactions: any[]) {
  const pageStats: Record<string, number> = {}
  
  interactions.forEach(interaction => {
    pageStats[interaction.page] = (pageStats[interaction.page] || 0) + 1
  })

  return Object.keys(pageStats)
    .map(page => ({ page, count: pageStats[page] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}