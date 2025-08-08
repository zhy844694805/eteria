"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  thumbnailUrl?: string
  previewUrl?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  placeholder,
  thumbnailUrl,
  previewUrl,
  priority = false,
  sizes,
  fill = false,
  style,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(true) // 暂时设为true以避免懒加载问题
  const [hasError, setHasError] = useState(false)
  // 对于没有优化字段的现有数据，直接使用原图
  const [currentSrc, setCurrentSrc] = useState(src)
  const imgRef = useRef<HTMLDivElement>(null)
  
  // 检查是否有优化版本可用
  const hasOptimizedVersions = Boolean(placeholder || thumbnailUrl || previewUrl)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // 提前50px开始加载
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isInView])

  // 简化的图片加载逻辑 - 移除，直接让img标签处理加载

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // 错误状态
  if (hasError) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          "bg-gray-100 flex items-center justify-center text-gray-400 text-sm",
          className
        )}
        style={{ width, height, ...style }}
      >
        图片加载失败
      </div>
    )
  }

  const imageProps = {
    alt,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      "transition-opacity duration-300",
      isLoaded ? "opacity-100" : "opacity-0",
      className
    ),
    style,
    sizes: sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  }

  return (
    <div 
      ref={imgRef}
      className={cn("relative overflow-hidden", !fill && "inline-block")}
      style={fill ? { width: '100%', height: '100%' } : { width, height }}
    >
      {/* 占位符背景（只在有优化版本时显示）*/}
      {hasOptimizedVersions && placeholder && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
          style={{
            backgroundImage: `url(${placeholder})`,
          }}
        />
      )}
      
      {/* 加载状态指示器（只在没有占位符或没有优化版本时显示）*/}
      {!isLoaded && (!placeholder || !hasOptimizedVersions) && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* 实际图片 */}
      {(isInView || priority) && (
        fill ? (
          <img
            src={src}
            alt={alt}
            className={cn(
              "transition-opacity duration-300 object-cover w-full h-full opacity-100",
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
            style={style}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            width={width || 300}
            height={height || 300}
            className={cn(
              "transition-opacity duration-300 opacity-100",
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
            style={style}
          />
        )
      )}

      {/* 加载指示器（只在有优化版本且未加载完成时显示）*/}
      {hasOptimizedVersions && !isLoaded && (isInView || priority) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// 专用于纪念页图片网格的组件
interface MemorialImageGridProps {
  images: Array<{
    id: string
    url: string
    thumbnailUrl?: string
    previewUrl?: string
    placeholder?: string
    isMain?: boolean
  }>
  memorialName: string
  className?: string
  maxImages?: number
}

export function MemorialImageGrid({ 
  images, 
  memorialName, 
  className,
  maxImages = 6 
}: MemorialImageGridProps) {
  const displayImages = images.slice(0, maxImages)
  const remainingCount = images.length - maxImages

  // 根据图片数量决定网格布局
  const getGridClass = () => {
    const totalItems = displayImages.length + (remainingCount > 0 ? 1 : 0)
    
    if (totalItems === 1) {
      return "flex justify-center" // 单张图片居中
    } else if (totalItems === 2) {
      return "grid grid-cols-1 md:grid-cols-2 gap-8 justify-center" // 两张图片
    } else {
      return "grid md:grid-cols-3 gap-8" // 三张及以上图片
    }
  }

  return (
    <div className={cn(getGridClass(), className)}>
      {displayImages.map((image, index) => (
        <div key={image.id} className={cn(
          "aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300",
          // 单张图片时限制最大宽度并居中
          displayImages.length === 1 && remainingCount === 0 && "max-w-md mx-auto"
        )}>
          <OptimizedImage
            src={image.url}
            alt={`${memorialName}的回忆 ${index + 1}`}
            thumbnailUrl={image.thumbnailUrl}
            previewUrl={image.previewUrl}
            placeholder={image.placeholder}
            fill
            className="object-cover"
            priority={index === 0 && image.isMain} // 主图优先加载
          />
        </div>
      ))}
      
      {/* 显示剩余图片数量 */}
      {remainingCount > 0 && (
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl font-light text-gray-500">+{remainingCount}</span>
            <p className="text-sm text-gray-500 mt-2">更多照片</p>
          </div>
        </div>
      )}
    </div>
  )
}

// 头像组件，优化版本
interface OptimizedAvatarProps {
  src?: string
  alt: string
  size?: number
  className?: string
  fallbackText?: string
}

export function OptimizedAvatar({ 
  src, 
  alt, 
  size = 96, 
  className,
  fallbackText 
}: OptimizedAvatarProps) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div 
        className={cn(
          "bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium overflow-hidden mx-auto",
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallbackText || alt.substring(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div 
      className={cn("rounded-full overflow-hidden mx-auto", className)}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        onError={() => setHasError(true)}
      />
    </div>
  )
}