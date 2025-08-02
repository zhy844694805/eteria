// 纪念状态计算工具函数

interface Memorial {
  createdAt: string
  updatedAt: string
  candleCount: number
  messageCount: number
  viewCount: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED'
  candles?: Array<{ createdAt: string }>
  messages?: Array<{ createdAt: string }>
}

export interface MemorialActivityStatus {
  label: string
  color: string
  description: string
  isActive: boolean
}

/**
 * 计算纪念页的活跃状态
 * 判断逻辑：
 * 1. 基础状态：根据纪念页的发布状态
 * 2. 活跃度：根据最近的互动（蜡烛、留言）时间
 * 3. 热度：根据总体互动数量
 */
export function calculateMemorialStatus(memorial: Memorial): MemorialActivityStatus {
  const now = new Date()
  const createdAt = new Date(memorial.createdAt)
  const updatedAt = new Date(memorial.updatedAt)
  
  // 如果纪念页未发布，显示对应状态
  if (memorial.status === 'DRAFT') {
    return {
      label: '草稿',
      color: 'gray',
      description: '纪念页尚未发布',
      isActive: false
    }
  }
  
  if (memorial.status === 'ARCHIVED') {
    return {
      label: '已归档',
      color: 'amber',
      description: '纪念页已被归档',
      isActive: false
    }
  }
  
  if (memorial.status === 'DELETED') {
    return {
      label: '已删除',
      color: 'red',
      description: '纪念页已被删除',
      isActive: false
    }
  }
  
  // 计算最后一次有意义的互动时间
  const lastInteractionTimes = []
  
  // 添加蜡烛互动时间
  if (memorial.candles && memorial.candles.length > 0) {
    const lastCandleTime = Math.max(
      ...memorial.candles.map(candle => new Date(candle.createdAt).getTime())
    )
    lastInteractionTimes.push(lastCandleTime)
  }
  
  // 添加留言互动时间
  if (memorial.messages && memorial.messages.length > 0) {
    const lastMessageTime = Math.max(
      ...memorial.messages.map(message => new Date(message.createdAt).getTime())
    )
    lastInteractionTimes.push(lastMessageTime)
  }
  
  // 如果没有互动，使用创建时间
  const lastInteractionTime = lastInteractionTimes.length > 0 
    ? Math.max(...lastInteractionTimes)
    : createdAt.getTime()
  
  const daysSinceLastInteraction = (now.getTime() - lastInteractionTime) / (1000 * 60 * 60 * 24)
  const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  
  // 计算总互动量
  const totalInteractions = memorial.candleCount + memorial.messageCount
  
  // 活跃状态判断逻辑
  if (daysSinceLastInteraction <= 1) {
    // 24小时内有互动
    return {
      label: '很活跃',
      color: 'green',
      description: '最近24小时内有新的互动',
      isActive: true
    }
  } else if (daysSinceLastInteraction <= 7) {
    // 7天内有互动
    return {
      label: '活跃',
      color: 'blue',
      description: '最近一周内有互动',
      isActive: true
    }
  } else if (daysSinceLastInteraction <= 30) {
    // 30天内有互动
    return {
      label: '较活跃',
      color: 'cyan',
      description: '最近一个月内有互动',
      isActive: true
    }
  } else if (totalInteractions > 10 && daysSinceLastInteraction <= 90) {
    // 有较多互动但最近3个月内有活动
    return {
      label: '偶尔活跃',
      color: 'yellow',
      description: '有一定互动量，但最近较少活动',
      isActive: true
    }
  } else if (daysSinceCreated <= 7) {
    // 新创建的纪念页（7天内）
    return {
      label: '新建',
      color: 'purple',
      description: '最近新建的纪念页',
      isActive: true
    }
  } else {
    // 长时间无互动
    return {
      label: '安静',
      color: 'gray',
      description: '长时间没有新的互动',
      isActive: false
    }
  }
}

/**
 * 获取状态颜色类名
 */
export function getStatusColorClass(color: string): string {
  const colorMap: { [key: string]: string } = {
    green: 'bg-green-400',
    blue: 'bg-blue-400', 
    cyan: 'bg-cyan-400',
    yellow: 'bg-yellow-400',
    purple: 'bg-purple-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
    gray: 'bg-gray-400'
  }
  return colorMap[color] || 'bg-gray-400'
}

/**
 * 获取活跃度描述文本
 */
export function getActivityDescription(memorial: Memorial): string {
  const status = calculateMemorialStatus(memorial)
  const totalInteractions = memorial.candleCount + memorial.messageCount
  
  if (totalInteractions === 0) {
    return '暂无互动，期待第一份思念'
  }
  
  const parts = []
  if (memorial.candleCount > 0) {
    parts.push(`${memorial.candleCount}次点烛`)
  }
  if (memorial.messageCount > 0) {
    parts.push(`${memorial.messageCount}条留言`)
  }
  
  return `${parts.join('，')} · ${status.description}`
}