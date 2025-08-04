"use client"

import React, { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageViewerProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  onIndexChange?: (index: number) => void
}

export function MobileImageViewer({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  onIndexChange
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastTouchDistance, setLastTouchDistance] = useState(0)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 重置状态
  const resetImageState = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  // 当索引改变时重置状态
  useEffect(() => {
    resetImageState()
  }, [currentIndex])

  // 键盘事件
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    setCurrentIndex(newIndex)
    onIndexChange?.(newIndex)
  }

  const goToNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
    onIndexChange?.(newIndex)
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.5, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 双指缩放
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      setLastTouchDistance(distance)
    } else if (e.touches.length === 1 && scale > 1) {
      // 单指拖拽（仅在缩放时）
      setIsDragging(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 2) {
      // 双指缩放
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      
      if (lastTouchDistance > 0) {
        const scaleChange = distance / lastTouchDistance
        setScale(prev => Math.min(Math.max(prev * scaleChange, 0.5), 5))
      }
      setLastTouchDistance(distance)
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // 单指拖拽
      const touch = e.touches[0]
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        setPosition({
          x: touch.clientX - rect.left - centerX,
          y: touch.clientY - rect.top - centerY
        })
      }
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setLastTouchDistance(0)
  }

  // 鼠标事件处理（桌面端）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        setPosition({
          x: e.clientX - rect.left - centerX,
          y: e.clientY - rect.top - centerY
        })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </Button>

      {/* 图片计数器 */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* 工具栏 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 w-8 h-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            handleZoomOut()
          }}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <span className="text-white text-sm min-w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 w-8 h-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            handleZoomIn()
          }}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-4 bg-white/30 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 w-8 h-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            handleRotate()
          }}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 w-8 h-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            resetImageState()
          }}
        >
          重置
        </Button>
      </div>

      {/* 导航按钮 */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 w-10 h-10 p-0"
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 w-10 h-10 p-0"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* 图片容器 */}
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={images[currentIndex]}
          alt={`图片 ${currentIndex + 1}`}
          className={cn(
            "max-w-full max-h-full object-contain transition-transform duration-200",
            isDragging ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : "cursor-default"
          )}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center center'
          }}
          draggable={false}
        />
      </div>

      {/* 缩略图导航（移动端隐藏） */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 hidden sm:flex items-center gap-2 bg-black/50 rounded-full px-4 py-2 max-w-sm overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "w-8 h-8 rounded border-2 overflow-hidden flex-shrink-0",
                index === currentIndex ? "border-white" : "border-transparent"
              )}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
                onIndexChange?.(index)
              }}
            >
              <img
                src={image}
                alt={`缩略图 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* 手势提示（首次使用） */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 text-white/70 text-xs text-center sm:hidden">
        <p>双指缩放 • 单指拖拽 • 左右滑动切换</p>
      </div>
    </div>
  )
}