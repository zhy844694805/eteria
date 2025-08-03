"use client"

import { useState } from 'react'
import Image from 'next/image'
import { X, Upload, RotateCw, Move, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ImageItem {
  id: string
  url: string
  isMain: boolean
  order: number
  filename: string
}

interface ImageManagerProps {
  images: ImageItem[]
  memorialId: string
  onImagesUpdate: (images: ImageItem[]) => void
  maxImages?: number
}

export function ImageManager({ 
  images, 
  memorialId, 
  onImagesUpdate, 
  maxImages = 10 
}: ImageManagerProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // 上传新图片
  const handleImageUpload = async (files: FileList) => {
    if (files.length + images.length > maxImages) {
      toast.error(`最多只能上传 ${maxImages} 张图片`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('images', file)
      })
      formData.append('memorialId', memorialId)

      const response = await fetch('/api/images/batch-upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('上传失败')
      
      const data = await response.json()
      onImagesUpdate([...images, ...data.images])
      toast.success(`成功上传 ${files.length} 张图片`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  // 删除选中图片
  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return

    try {
      await Promise.all(
        selectedImages.map(imageId =>
          fetch(`/api/images/${imageId}`, { method: 'DELETE' })
        )
      )
      
      const updatedImages = images.filter(img => !selectedImages.includes(img.id))
      onImagesUpdate(updatedImages)
      setSelectedImages([])
      toast.success(`删除了 ${selectedImages.length} 张图片`)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('删除图片失败')
    }
  }

  // 设置主图片
  const handleSetMain = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}/set-main`, {
        method: 'PATCH'
      })
      
      if (!response.ok) throw new Error('设置主图片失败')
      
      const updatedImages = images.map(img => ({
        ...img,
        isMain: img.id === imageId
      }))
      onImagesUpdate(updatedImages)
      toast.success('主图片设置成功')
    } catch (error) {
      console.error('Set main error:', error)
      toast.error('设置主图片失败')
    }
  }

  // 拖拽排序
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)

    // 更新排序
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      order: index
    }))

    try {
      await fetch('/api/images/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialId,
          imageOrders: updatedImages.map(img => ({ id: img.id, order: img.order }))
        })
      })
      
      onImagesUpdate(updatedImages)
      toast.success('图片排序已更新')
    } catch (error) {
      console.error('Reorder error:', error)
      toast.error('更新排序失败')
    }

    setDraggedIndex(null)
  }

  return (
    <div className="space-y-6">
      {/* 上传区域 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          className="hidden"
          id="image-upload"
          disabled={uploading}
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            {uploading ? '上传中...' : `点击上传图片 (${images.length}/${maxImages})`}
          </div>
        </label>
      </div>

      {/* 操作工具栏 */}
      {selectedImages.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <span className="text-sm text-gray-600">
            已选择 {selectedImages.length} 张图片
          </span>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              删除选中
            </Button>
          </div>
        </div>
      )}

      {/* 图片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`relative group cursor-move ${
              selectedImages.includes(image.id) ? 'ring-2 ring-blue-500' : ''
            }`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={image.url}
                alt="纪念图片"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 主图标识 */}
            {image.isMain && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                主图
              </div>
            )}

            {/* 选择框 */}
            <input
              type="checkbox"
              checked={selectedImages.includes(image.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedImages([...selectedImages, image.id])
                } else {
                  setSelectedImages(selectedImages.filter(id => id !== image.id))
                }
              }}
              className="absolute top-2 right-2 w-4 h-4"
            />

            {/* 操作按钮 */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              {!image.isMain && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSetMain(image.id)}
                >
                  设为主图
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          还没有上传任何图片
        </div>
      )}
    </div>
  )
}