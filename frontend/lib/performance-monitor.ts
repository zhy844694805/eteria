/**
 * 性能监控系统
 * 监控页面性能指标、API响应时间、用户交互等
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url?: string
  userId?: string
  sessionId: string
}

interface APIMetric {
  url: string
  method: string
  status: number
  duration: number
  size?: number
  timestamp: number
  userId?: string
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'navigation' | 'form_submit'
  element?: string
  page: string
  timestamp: number
  userId?: string
  sessionId: string
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private apiMetrics: APIMetric[] = []
  private interactions: UserInteraction[] = []
  private sessionId: string
  private isEnabled: boolean = true
  private observer?: PerformanceObserver
  private maxMetrics: number = 1000

  constructor() {
    this.sessionId = this.generateSessionId()
    this.init()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private init() {
    if (typeof window === 'undefined') return

    // 监控 Web Vitals
    this.setupWebVitalsMonitoring()
    
    // 监控资源加载
    this.setupResourceMonitoring()
    
    // 监控用户交互
    this.setupInteractionMonitoring()
    
    // 监控页面导航
    this.setupNavigationMonitoring()
    
    // 定期清理和上报数据
    setInterval(() => this.cleanup(), 60000) // 每分钟清理一次
    setInterval(() => this.reportMetrics(), 300000) // 每5分钟上报一次
  }

  /**
   * 监控 Web Vitals 指标
   */
  private setupWebVitalsMonitoring() {
    if (!('PerformanceObserver' in window)) return

    // Core Web Vitals
    const vitalsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: entry.name,
          value: entry.value || 0,
          timestamp: Date.now(),
          url: window.location.href,
          sessionId: this.sessionId
        })
      }
    })

    try {
      // 监控 LCP (Largest Contentful Paint)
      vitalsObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      
      // 监控 FID (First Input Delay)
      vitalsObserver.observe({ entryTypes: ['first-input'] })
      
      // 监控 CLS (Cumulative Layout Shift)
      vitalsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('[Performance Monitor] Web Vitals monitoring failed:', error)
    }

    // 手动获取其他指标
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          // First Contentful Paint
          const fcp = performance.getEntriesByName('first-contentful-paint')[0]
          if (fcp) {
            this.recordMetric({
              name: 'FCP',
              value: fcp.startTime,
              timestamp: Date.now(),
              url: window.location.href,
              sessionId: this.sessionId
            })
          }

          // Time to Interactive (简化版本)
          const tti = navigation.domInteractive - navigation.navigationStart
          this.recordMetric({
            name: 'TTI',
            value: tti,
            timestamp: Date.now(),
            url: window.location.href,
            sessionId: this.sessionId
          })

          // DNS解析时间
          const dnsTime = navigation.domainLookupEnd - navigation.domainLookupStart
          this.recordMetric({
            name: 'DNS',
            value: dnsTime,
            timestamp: Date.now(),
            url: window.location.href,
            sessionId: this.sessionId
          })

          // TCP连接时间
          const tcpTime = navigation.connectEnd - navigation.connectStart
          this.recordMetric({
            name: 'TCP',
            value: tcpTime,
            timestamp: Date.now(),
            url: window.location.href,
            sessionId: this.sessionId
          })
        }
      }, 0)
    })
  }

  /**
   * 监控资源加载性能
   */
  private setupResourceMonitoring() {
    if (!('PerformanceObserver' in window)) return

    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        // 只监控关键资源
        if (this.isImportantResource(entry.name)) {
          this.recordMetric({
            name: `resource_${this.getResourceType(entry.name)}`,
            value: entry.responseEnd - entry.startTime,
            timestamp: Date.now(),
            url: entry.name,
            sessionId: this.sessionId
          })
        }
      }
    })

    try {
      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('[Performance Monitor] Resource monitoring failed:', error)
    }
  }

  /**
   * 监控用户交互
   */
  private setupInteractionMonitoring() {
    // 点击事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      this.recordInteraction({
        type: 'click',
        element: this.getElementSelector(target),
        page: window.location.pathname,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        metadata: {
          x: event.clientX,
          y: event.clientY,
          tagName: target.tagName
        }
      })
    }, { passive: true })

    // 滚动事件（节流）
    let scrollTimeout: NodeJS.Timeout
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        this.recordInteraction({
          type: 'scroll',
          page: window.location.pathname,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          metadata: {
            scrollY: window.scrollY,
            scrollX: window.scrollX
          }
        })
      }, 200)
    }, { passive: true })

    // 表单提交
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      this.recordInteraction({
        type: 'form_submit',
        element: this.getElementSelector(form),
        page: window.location.pathname,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        metadata: {
          action: form.action,
          method: form.method
        }
      })
    })
  }

  /**
   * 监控页面导航
   */
  private setupNavigationMonitoring() {
    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      this.recordInteraction({
        type: 'navigation',
        page: window.location.pathname,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        metadata: {
          visibility: document.visibilityState
        }
      })
    })

    // 页面卸载
    window.addEventListener('beforeunload', () => {
      this.reportMetrics()
    })
  }

  /**
   * 记录性能指标
   */
  recordMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return

    this.metrics.push(metric)
    
    // 实时告警检查
    this.checkThresholds(metric)
  }

  /**
   * 记录API性能
   */
  recordAPIMetric(metric: APIMetric) {
    if (!this.isEnabled) return

    this.apiMetrics.push(metric)
    
    // API性能告警
    if (metric.duration > 5000) { // 超过5秒
      console.warn(`[Performance Monitor] Slow API detected: ${metric.url} took ${metric.duration}ms`)
    }
  }

  /**
   * 记录用户交互
   */
  recordInteraction(interaction: UserInteraction) {
    if (!this.isEnabled) return

    this.interactions.push(interaction)
  }

  /**
   * 检查性能阈值
   */
  private checkThresholds(metric: PerformanceMetric) {
    const thresholds: Record<string, number> = {
      'FCP': 2500,      // First Contentful Paint
      'LCP': 4000,      // Largest Contentful Paint  
      'FID': 300,       // First Input Delay
      'CLS': 0.25,      // Cumulative Layout Shift
      'TTI': 5000,      // Time to Interactive
    }

    if (thresholds[metric.name] && metric.value > thresholds[metric.name]) {
      console.warn(`[Performance Monitor] Performance threshold exceeded: ${metric.name} = ${metric.value}`)
      
      // 可以在这里添加更复杂的告警逻辑
      this.sendAlert(metric)
    }
  }

  /**
   * 发送性能告警
   */
  private sendAlert(metric: PerformanceMetric) {
    // 这里可以集成第三方监控服务
    if (process.env.NODE_ENV === 'development') {
      console.warn('Performance Alert:', metric)
    }
  }

  /**
   * 获取性能摘要
   */
  getPerformanceSummary() {
    const now = Date.now()
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000) // 最近5分钟

    const summary = {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      apiCalls: this.apiMetrics.length,
      userInteractions: this.interactions.length,
      sessionId: this.sessionId,
      averages: {} as Record<string, number>,
      slowestAPIs: this.apiMetrics
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5),
      cacheStats: this.getCacheStats(),
      memoryUsage: this.getMemoryUsage()
    }

    // 计算平均值
    const metricGroups: Record<string, number[]> = {}
    recentMetrics.forEach(metric => {
      if (!metricGroups[metric.name]) {
        metricGroups[metric.name] = []
      }
      metricGroups[metric.name].push(metric.value)
    })

    Object.keys(metricGroups).forEach(name => {
      const values = metricGroups[name]
      summary.averages[name] = values.reduce((sum, val) => sum + val, 0) / values.length
    })

    return summary
  }

  /**
   * 获取缓存统计
   */
  private getCacheStats() {
    // 这里应该从缓存系统获取统计信息
    try {
      const cache = (globalThis as any).performanceCache
      return cache?.getStats() || null
    } catch {
      return null
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      }
    }
    return null
  }

  /**
   * 上报性能数据
   */
  private async reportMetrics() {
    if (this.metrics.length === 0 && this.apiMetrics.length === 0) return

    const data = {
      metrics: this.metrics.splice(0, 100), // 只上报最近的100条
      apiMetrics: this.apiMetrics.splice(0, 100),
      interactions: this.interactions.splice(0, 100),
      summary: this.getPerformanceSummary(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    try {
      // 发送到后端API
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon('/api/performance', JSON.stringify(data))
      } else {
        fetch('/api/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true
        }).catch(console.warn)
      }
    } catch (error) {
      console.warn('[Performance Monitor] Failed to report metrics:', error)
    }
  }

  /**
   * 清理旧数据
   */
  private cleanup() {
    const now = Date.now()
    const maxAge = 3600000 // 1小时

    this.metrics = this.metrics.filter(m => now - m.timestamp < maxAge)
    this.apiMetrics = this.apiMetrics.filter(m => now - m.timestamp < maxAge)
    this.interactions = this.interactions.filter(i => now - i.timestamp < maxAge)

    // 限制总数量
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  /**
   * 工具方法
   */
  private isImportantResource(url: string): boolean {
    return /\.(js|css|woff|woff2|png|jpg|jpeg|webp|svg)$/i.test(url) ||
           url.includes('/api/') ||
           url.includes('/uploads/')
  }

  private getResourceType(url: string): string {
    if (url.includes('/api/')) return 'api'
    if (/\.(js)$/i.test(url)) return 'script'
    if (/\.(css)$/i.test(url)) return 'style'
    if (/\.(png|jpg|jpeg|webp|svg)$/i.test(url)) return 'image'
    if (/\.(woff|woff2)$/i.test(url)) return 'font'
    return 'other'
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ')[0]}`
    return element.tagName.toLowerCase()
  }

  /**
   * 启用/禁用监控
   */
  enable() {
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      sessionId: this.sessionId,
      metricsCount: this.metrics.length,
      apiMetricsCount: this.apiMetrics.length,
      interactionsCount: this.interactions.length
    }
  }
}

// 创建全局监控实例
let performanceMonitor: PerformanceMonitor | null = null

if (typeof window !== 'undefined') {
  performanceMonitor = new PerformanceMonitor()
  ;(window as any).performanceMonitor = performanceMonitor
}

/**
 * API监控装饰器
 */
export function withAPIMonitoring(url: string, method: string = 'GET') {
  return function<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return (async (...args: any[]) => {
      const startTime = performance.now()
      const start = Date.now()
      
      try {
        const result = await fn(...args)
        const duration = performance.now() - startTime
        
        performanceMonitor?.recordAPIMetric({
          url,
          method,
          status: 200,
          duration,
          timestamp: start
        })
        
        return result
      } catch (error) {
        const duration = performance.now() - startTime
        
        performanceMonitor?.recordAPIMetric({
          url,
          method,
          status: 500,
          duration,
          timestamp: start
        })
        
        throw error
      }
    }) as T
  }
}

/**
 * 组件性能监控Hook
 */
export function usePerformanceMonitoring(componentName: string) {
  if (typeof window === 'undefined') return {}

  const startTime = performance.now()

  return {
    recordRender: () => {
      const renderTime = performance.now() - startTime
      performanceMonitor?.recordMetric({
        name: `component_render_${componentName}`,
        value: renderTime,
        timestamp: Date.now(),
        url: window.location.href,
        sessionId: performanceMonitor?.getStatus().sessionId || ''
      })
    },
    
    recordInteraction: (type: string, metadata?: any) => {
      performanceMonitor?.recordInteraction({
        type: 'click',
        element: componentName,
        page: window.location.pathname,
        timestamp: Date.now(),
        sessionId: performanceMonitor?.getStatus().sessionId || '',
        metadata: { component: componentName, interactionType: type, ...metadata }
      })
    }
  }
}

export { performanceMonitor }
export default performanceMonitor