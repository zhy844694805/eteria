'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  placeholder?: string
  srcSet?: string
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  quality?: number
}

/**
 * 高性能响应式图片组件
 * 支持懒加载、占位符、WebP格式、错误处理
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  loading = 'lazy',
  placeholder,
  srcSet,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError,
  objectFit = 'cover',
  quality = 85
}: ResponsiveImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const imgRef = useRef<HTMLImageElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(priority)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before the image enters the viewport
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  // Handle image loading
  const handleLoad = useCallback(() => {
    setImageState('loaded')
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setImageState('error')
    // Fallback to original src if WebP fails
    if (imageSrc !== src) {
      setImageSrc(src)
    } else {
      // Use a default error image
      setImageSrc('/placeholder.svg')
    }
    onError?.()
  }, [imageSrc, src, onError])

  // Update image source when intersection occurs
  useEffect(() => {
    if (isIntersecting && imageState === 'loading') {
      // Prefer WebP format if available
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      setImageSrc(webpSrc !== src ? webpSrc : src)
    }
  }, [isIntersecting, src, imageState])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/Loading state */}
      {imageState === 'loading' && placeholder && (
        <img
          src={placeholder}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            imageState === 'loaded' ? 'opacity-0' : 'opacity-100'
          )}
          style={{ objectFit }}
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={isIntersecting ? imageSrc : placeholder || ''}
        srcSet={isIntersecting ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
          imageState === 'error' && 'opacity-50'
        )}
        style={{ 
          objectFit,
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />

      {/* Loading skeleton */}
      {imageState === 'loading' && !placeholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Error state */}
      {imageState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

/**
 * 优化的纪念页图片组件
 */
interface MemorialImageProps extends Omit<ResponsiveImageProps, 'srcSet' | 'sizes'> {
  optimizedImage?: {
    main: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    thumbnail?: { url: string; width: number; height: number }
    preview?: { url: string; width: number; height: number }
    placeholder?: string
  }
  variant?: 'main' | 'medium' | 'thumbnail' | 'preview'
}

export function MemorialImage({
  optimizedImage,
  variant = 'main',
  src,
  ...props
}: MemorialImageProps) {
  if (!optimizedImage) {
    return <ResponsiveImage src={src} {...props} />
  }

  // Generate srcSet from available variants
  const srcSet = [
    optimizedImage.preview && `${optimizedImage.preview.url} ${optimizedImage.preview.width}w`,
    optimizedImage.thumbnail && `${optimizedImage.thumbnail.url} ${optimizedImage.thumbnail.width}w`,
    optimizedImage.medium && `${optimizedImage.medium.url} ${optimizedImage.medium.width}w`,
    `${optimizedImage.main.url} ${optimizedImage.main.width}w`
  ].filter(Boolean).join(', ')

  const selectedVariant = optimizedImage[variant] || optimizedImage.main

  return (
    <ResponsiveImage
      src={selectedVariant.url}
      srcSet={srcSet}
      placeholder={optimizedImage.placeholder}
      width={selectedVariant.width}
      height={selectedVariant.height}
      sizes={
        variant === 'preview' 
          ? '150px'
          : variant === 'thumbnail' 
          ? '300px'
          : variant === 'medium'
          ? '(max-width: 768px) 100vw, 600px'
          : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
      }
      {...props}
    />
  )
}

/**
 * 图片画廊组件（支持虚拟滚动）
 */
interface ImageGalleryProps {
  images: Array<{
    id: string
    optimizedImage?: MemorialImageProps['optimizedImage']
    src: string
    alt: string
  }>
  className?: string
  itemClassName?: string
  columns?: number
  gap?: number
}

export function ImageGallery({
  images,
  className,
  itemClassName,
  columns = 3,
  gap = 16
}: ImageGalleryProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        className
      )}
      style={{ gap }}
    >
      {images.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            'relative aspect-square rounded-lg overflow-hidden bg-gray-100',
            itemClassName
          )}
        >
          <MemorialImage
            optimizedImage={image.optimizedImage}
            src={image.src}
            alt={image.alt}
            variant="medium"
            className="w-full h-full"
            loading={index < 6 ? 'eager' : 'lazy'} // Eager load first 6 images
            priority={index < 3} // Prioritize first 3 images
          />
        </div>
      ))}
    </div>
  )
}