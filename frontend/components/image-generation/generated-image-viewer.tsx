"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Download, Share2, RotateCcw, Eye, Heart, Star, Clock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'

interface GenerationTask {
  id: string
  taskId: string
  title: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: number
  sourceImageUrl: string
  resultImageUrl?: string
  errorMessage?: string
  createdAt: string
  completedAt?: string
  processingTime?: number
}

interface GeneratedImageViewerProps {
  task: GenerationTask
  onRestart?: () => void
  onDownload?: () => void
  onShare?: () => void
  className?: string
}

function formatDuration(startTime: string, endTime?: string): string {
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  
  if (diffSeconds < 60) {
    return `${diffSeconds}秒`
  } else {
    const minutes = Math.floor(diffSeconds / 60)
    const seconds = diffSeconds % 60
    return `${minutes}分${seconds}秒`
  }
}

export function GeneratedImageViewer({
  task,
  onRestart,
  onDownload,
  onShare,
  className
}: GeneratedImageViewerProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const duration = formatDuration(task.createdAt, task.completedAt)
  const processingTime = task.processingTime ? `${task.processingTime}秒` : duration

  const handleDownload = async () => {
    if (!task.resultImageUrl) return

    try {
      // 获取图片数据
      const response = await fetch(task.resultImageUrl)
      const blob = await response.blob()
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${task.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('图片已下载')
      onDownload?.()
    } catch (error) {
      console.error('下载失败:', error)
      toast.error('下载失败，请稍后重试')
    }
  }

  const handleShare = async () => {
    if (!task.resultImageUrl) return

    try {
      if (navigator.share) {
        // 使用原生分享API
        await navigator.share({
          title: task.title,
          text: `查看这张温馨的缅怀图片：${task.title}`,
          url: window.location.href
        })
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(window.location.href)
        toast.success('链接已复制到剪贴板')
      }
      onShare?.()
    } catch (error) {
      console.error('分享失败:', error)
      toast.error('分享失败，请稍后重试')
    }
  }

  if (task.status !== 'COMPLETED' || !task.resultImageUrl) {
    return (
      <div className={cn("max-w-2xl mx-auto", className)}>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">图片尚未生成完成</h3>
                <p className="text-gray-500">请等待生成完成后再查看结果</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* 成功提示 */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">图片生成成功！</span>
            </div>
            <p className="text-sm text-green-600">
              AI已为您创作了一张温馨的缅怀图片
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 图片对比展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 源图片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>原图片</span>
            </CardTitle>
            <CardDescription>用于生成的源图片</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={task.sourceImageUrl}
                alt="原始图片"
                fill
                className="object-cover"
                onLoad={() => setImageLoading(false)}
              />
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 生成图片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span>生成图片</span>
            </CardTitle>
            <CardDescription>AI生成的缅怀场景图片</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:shadow-lg transition-shadow">
                <Image
                  src={task.resultImageUrl}
                  alt={task.title}
                  fill
                  className="object-cover"
                  onClick={() => setIsImageDialogOpen(true)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">点击图片查看大图</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 生成信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>生成用时: {processingTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>任务ID: {task.taskId}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Sparkles className="w-3 h-3 mr-1" />
                生成完成
              </Badge>
              <span className="text-sm text-gray-500">
                完成时间: {task.completedAt ? new Date(task.completedAt).toLocaleString() : '未知'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button onClick={handleDownload} size="lg" className="px-6">
          <Download className="w-5 h-5 mr-2" />
          下载图片
        </Button>
        
        <Button onClick={handleShare} variant="outline" size="lg" className="px-6">
          <Share2 className="w-5 h-5 mr-2" />
          分享图片
        </Button>
        
        {onRestart && (
          <Button onClick={onRestart} variant="outline" size="lg" className="px-6">
            <RotateCcw className="w-5 h-5 mr-2" />
            重新生成
          </Button>
        )}
      </div>

      {/* 图片大图查看对话框 */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>{task.title}</DialogTitle>
            <DialogDescription>
              AI生成的缅怀场景图片
            </DialogDescription>
          </DialogHeader>
          <div className="relative overflow-auto">
            <div className="p-6">
              <div className="relative aspect-square max-h-[70vh] mx-auto">
                <Image
                  src={task.resultImageUrl}
                  alt={task.title}
                  fill
                  className="object-contain rounded-lg"
                  quality={100}
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-center space-x-4">
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
              <Button onClick={handleShare} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 温馨提示 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Heart className="w-4 h-4" />
              <span className="font-medium">温馨提示</span>
            </div>
            <p className="text-sm text-blue-600">
              这张图片承载着对逝者的美好思念，您可以将其保存或分享给家人朋友
            </p>
            <p className="text-xs text-blue-500">
              如果您希望生成不同风格或场景的图片，可以点击"重新生成"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}