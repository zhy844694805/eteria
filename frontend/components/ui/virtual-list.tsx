'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number | ((index: number, item: T) => number)
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
  onScroll?: (scrollTop: number) => void
  onEndReached?: () => void
  endThreshold?: number
  loading?: boolean
  loadingComponent?: React.ReactNode
}

/**
 * 高性能虚拟滚动列表组件
 * 支持动态高度、无限滚动、缓冲区优化
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  onEndReached,
  endThreshold = 0.8,
  loading = false,
  loadingComponent
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const scrollingTimeoutRef = useRef<NodeJS.Timeout>()

  // 计算项目高度的函数
  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index, items[index])
    }
    return itemHeight
  }, [itemHeight, items])

  // 计算每个项目的偏移位置
  const itemOffsets = useMemo(() => {
    const offsets: number[] = []
    let currentOffset = 0
    
    for (let i = 0; i < items.length; i++) {
      offsets[i] = currentOffset
      currentOffset += getItemHeight(i)
    }
    
    return offsets
  }, [items.length, getItemHeight])

  // 计算总高度
  const totalHeight = useMemo(() => {
    if (items.length === 0) return 0
    return itemOffsets[items.length - 1] + getItemHeight(items.length - 1)
  }, [items.length, itemOffsets, getItemHeight])

  // 计算可见范围
  const visibleRange = useMemo(() => {
    if (items.length === 0) {
      return { start: 0, end: 0 }
    }

    // 二分查找起始索引
    let start = 0
    let end = items.length - 1
    
    while (start < end) {
      const mid = Math.floor((start + end) / 2)
      if (itemOffsets[mid] < scrollTop) {
        start = mid + 1
      } else {
        end = mid
      }
    }
    
    // 向前查找以确保找到第一个可见项
    while (start > 0 && itemOffsets[start - 1] + getItemHeight(start - 1) > scrollTop) {
      start--
    }

    // 找到结束索引
    let endIndex = start
    let currentOffset = itemOffsets[start]
    
    while (endIndex < items.length && currentOffset < scrollTop + containerHeight) {
      currentOffset = itemOffsets[endIndex] + getItemHeight(endIndex)
      endIndex++
    }

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length - 1, endIndex + overscan)
    }
  }, [scrollTop, containerHeight, items.length, itemOffsets, getItemHeight, overscan])

  // 可见项目
  const visibleItems = useMemo(() => {
    const result = []
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (items[i]) {
        result.push({
          index: i,
          item: items[i],
          offset: itemOffsets[i],
          height: getItemHeight(i)
        })
      }
    }
    return result
  }, [visibleRange, items, itemOffsets, getItemHeight])

  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    setIsScrolling(true)
    
    onScroll?.(newScrollTop)

    // 检查是否接近底部
    if (onEndReached && !loading) {
      const { scrollHeight, scrollTop: currentScrollTop, clientHeight } = e.currentTarget
      const scrollPercentage = (currentScrollTop + clientHeight) / scrollHeight
      
      if (scrollPercentage >= endThreshold) {
        onEndReached()
      }
    }

    // 设置滚动结束定时器
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current)
    }
    scrollingTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }, [onScroll, onEndReached, loading, endThreshold])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, item, offset, height }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offset,
              left: 0,
              right: 0,
              height
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
        
        {/* 加载指示器 */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60
            }}
          >
            {loadingComponent || (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 网格虚拟化组件
 */
interface VirtualGridProps<T> {
  items: T[]
  itemWidth: number
  itemHeight: number
  containerWidth: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  gap?: number
  overscan?: number
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  className,
  gap = 0,
  overscan = 5
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const columnsCount = Math.floor(containerWidth / (itemWidth + gap))
  const rowsCount = Math.ceil(items.length / columnsCount)
  const totalHeight = rowsCount * (itemHeight + gap) - gap

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const visibleRows = useMemo(() => {
    const rowHeight = itemHeight + gap
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const endRow = Math.min(
      rowsCount - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    )
    
    return { start: startRow, end: endRow }
  }, [scrollTop, containerHeight, itemHeight, gap, rowsCount, overscan])

  const visibleItems = useMemo(() => {
    const result = []
    
    for (let row = visibleRows.start; row <= visibleRows.end; row++) {
      for (let col = 0; col < columnsCount; col++) {
        const index = row * columnsCount + col
        if (index < items.length) {
          result.push({
            index,
            item: items[index],
            row,
            col,
            x: col * (itemWidth + gap),
            y: row * (itemHeight + gap)
          })
        }
      }
    }
    
    return result
  }, [visibleRows, columnsCount, items, itemWidth, itemHeight, gap])

  return (
    <div
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight, width: containerWidth }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, item, x, y }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: itemWidth,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 无限滚动Hook
 */
interface UseInfiniteScrollOptions {
  hasNextPage?: boolean
  fetchNextPage: () => void
  threshold?: number
}

export function useInfiniteScroll({
  hasNextPage = true,
  fetchNextPage,
  threshold = 0.8
}: UseInfiniteScrollOptions) {
  const [isFetching, setIsFetching] = useState(false)

  const handleScroll = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement
      if (!target || isFetching || !hasNextPage) return

      const { scrollTop, scrollHeight, clientHeight } = target
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      if (scrollPercentage >= threshold) {
        setIsFetching(true)
        fetchNextPage()
      }
    },
    [isFetching, hasNextPage, fetchNextPage, threshold]
  )

  useEffect(() => {
    setIsFetching(false)
  }, [hasNextPage])

  return { isFetching, handleScroll }
}

/**
 * 优化的纪念页列表组件
 */
interface MemorialListProps {
  memorials: any[]
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  className?: string
  itemClassName?: string
}

export function VirtualizedMemorialList({
  memorials,
  loading = false,
  hasMore = false,
  onLoadMore,
  className,
  itemClassName
}: MemorialListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(600)

  // 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const renderMemorialItem = useCallback(
    (memorial: any, index: number) => (
      <div className={cn('p-4 border-b border-gray-200', itemClassName)}>
        <div className="flex items-start space-x-4">
          {/* 头像/图片 */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
            {memorial.images?.[0] && (
              <img
                src={memorial.images[0].thumbnailUrl || memorial.images[0].url}
                alt={memorial.subjectName}
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            )}
          </div>
          
          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {memorial.subjectName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {memorial.type === 'PET' ? memorial.subjectType : memorial.relationship}
              {memorial.age && ` • ${memorial.age}`}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>❤️ {memorial.likeCount || 0}</span>
              <span>🕯️ {memorial.candleCount || 0}</span>
              <span>💬 {memorial.messageCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    [itemClassName]
  )

  return (
    <div ref={containerRef} className={cn('h-full', className)}>
      <VirtualList
        items={memorials}
        itemHeight={120} // 固定高度，可以根据需要调整
        containerHeight={containerHeight}
        renderItem={renderMemorialItem}
        onEndReached={hasMore ? onLoadMore : undefined}
        loading={loading}
        endThreshold={0.8}
        overscan={3}
      />
    </div>
  )
}