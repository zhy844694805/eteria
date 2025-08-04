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
  const [isInView, setIsInView] = useState(priority) // 如果是priority，立即加载
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

  // 渐进式加载：占位符 -> 缩略图 -> 原图（仅当有优化版本时）
  useEffect(() => {
    if (!isInView) return

    const loadImage = async () => {
      try {
        // 如果没有优化版本，直接加载原图并标记为已加载
        if (!hasOptimizedVersions) {
          setIsLoaded(true)
          onLoad?.()
          return
        }

        // 设置初始显示图片
        if (placeholder && currentSrc === src) {
          setCurrentSrc(placeholder)
        }

        // 如果有预览图，加载预览图
        if (previewUrl && currentSrc === placeholder) {
          const previewImg = new window.Image()
          previewImg.onload = () => {
            setCurrentSrc(previewUrl)
          }
          previewImg.onerror = () => {
            console.log('Preview failed, loading main image')
          }
          previewImg.src = previewUrl
        }

        // 如果有缩略图且当前显示的是占位符，先加载缩略图
        if (thumbnailUrl && (currentSrc === placeholder || currentSrc === previewUrl)) {
          const thumbnailImg = new window.Image()
          thumbnailImg.onload = () => {
            setCurrentSrc(thumbnailUrl)
          }
          thumbnailImg.onerror = () => {
            console.log('Thumbnail failed, loading main image')
          }
          thumbnailImg.src = thumbnailUrl
        }

        // 最后加载原图
        const mainImg = new window.Image()
        mainImg.onload = () => {
          setCurrentSrc(src)
          setIsLoaded(true)
          onLoad?.()
        }
        mainImg.onerror = () => {
          setHasError(true)
          onError?.()
        }
        mainImg.src = src
      } catch (error) {
        setHasError(true)
        onError?.()
      }
    }

    loadImage()
  }, [isInView, src, thumbnailUrl, previewUrl, placeholder, currentSrc, hasOptimizedVersions, onLoad, onError])

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
          <Image
            src={currentSrc}
            fill
            {...imageProps}
            priority={priority}
          />
        ) : (
          <Image
            src={currentSrc}
            width={width || 300}
            height={height || 300}
            {...imageProps}
            priority={priority}
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

  return (
    <div className={cn("grid md:grid-cols-3 gap-8", className)}>
      {displayImages.map((image, index) => (
        <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        priority
        onError={() => setHasError(true)}
      />
    </div>
  )
}