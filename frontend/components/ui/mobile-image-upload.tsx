"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, Plus, Camera, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageFile {
  file: File
  preview: string
  id: string
}

interface MobileImageUploadProps {
  images: ImageFile[]
  onImagesChange: (images: ImageFile[]) => void
  maxImages?: number
  maxFileSize?: number // MB
  acceptedTypes?: string[]
  placeholder?: string
  className?: string
}

export function MobileImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  placeholder = "点击添加图片",
  className
}: MobileImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `不支持的文件类型。支持：${acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `文件大小超过限制（最大 ${maxFileSize}MB）`
    }
    return null
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newImages: ImageFile[] = []
    const errors: string[] = []

    Array.from(files).forEach(file => {
      if (images.length + newImages.length >= maxImages) {
        errors.push(`最多只能上传 ${maxImages} 张图片`)
        return
      }

      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageFile: ImageFile = {
          file,
          preview: e.target?.result as string,
          id: generateId()
        }
        newImages.push(imageFile)
        
        if (newImages.length === Array.from(files).filter(f => !validateFile(f)).length) {
          onImagesChange([...images, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  // 移动端摄像头拍照
  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {/* 图片网格显示 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                <img
                  src={image.preview}
                  alt={`上传图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* 主图标识 */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    主图
                  </div>
                )}
                {/* 删除按钮 - 移动端优化 */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">{image.file.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {images.length < maxImages && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
            isDragOver 
              ? "border-blue-400 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400",
            images.length === 0 ? "p-8 sm:p-12" : "p-4 sm:p-6"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <div className="text-center">
            {images.length === 0 ? (
              <>
                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">
                  {placeholder}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  支持 JPG、PNG、GIF、WebP，单个文件最大 {maxFileSize}MB
                </p>
                
                {/* 移动端按钮组 */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openFileDialog()
                    }}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    选择图片
                  </Button>
                  
                  {/* 移动端摄像头按钮 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-xs sm:text-sm sm:hidden"
                    onClick={(e) => {
                      e.stopPropagation()
                      openCamera()
                    }}
                  >
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    拍照
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">
                  添加更多图片 ({images.length}/{maxImages})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* 图片数量提示 */}
      {images.length > 0 && (
        <div className="mt-3 text-xs sm:text-sm text-gray-500 flex items-center justify-between">
          <span>已上传 {images.length} 张图片</span>
          {images.length < maxImages && (
            <span>还可以添加 {maxImages - images.length} 张</span>
          )}
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-3 text-xs text-gray-400 space-y-1">
        <p>• 第一张图片将作为主图显示</p>
        <p>• 支持拖拽上传（桌面端）</p>
        <p className="sm:hidden">• 点击拍照按钮可直接使用摄像头</p>
      </div>
    </div>
  )
}