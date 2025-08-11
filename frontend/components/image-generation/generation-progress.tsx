"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Loader2, Clock, Wand2, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
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
}

interface GenerationProgressProps {
  task: GenerationTask
  onCancel?: () => void
  className?: string
}

const STATUS_CONFIG = {
  PENDING: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    text: '等待处理'
  },
  PROCESSING: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Wand2,
    text: '正在生成'
  },
  COMPLETED: {
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2,
    text: '生成完成'
  },
  FAILED: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertCircle,
    text: '生成失败'
  },
  CANCELLED: {
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: X,
    text: '已取消'
  }
}

const PROGRESS_STAGES = [
  { threshold: 0, text: '初始化处理...' },
  { threshold: 10, text: '分析源图片...' },
  { threshold: 25, text: '理解场景描述...' },
  { threshold: 40, text: '生成初始图像...' },
  { threshold: 60, text: '优化细节效果...' },
  { threshold: 80, text: '应用艺术风格...' },
  { threshold: 95, text: '最终处理中...' },
  { threshold: 100, text: '生成完成！' }
]

function getCurrentStage(progress: number): string {
  const stage = PROGRESS_STAGES
    .slice()
    .reverse()
    .find(stage => progress >= stage.threshold)
  
  return stage?.text || '处理中...'
}

function formatDuration(startTime: string): string {
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  
  if (diffSeconds < 60) {
    return `${diffSeconds}秒`
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60)
    const seconds = diffSeconds % 60
    return `${minutes}分${seconds}秒`
  } else {
    const hours = Math.floor(diffSeconds / 3600)
    const minutes = Math.floor((diffSeconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }
}

export function GenerationProgress({
  task,
  onCancel,
  className
}: GenerationProgressProps) {
  const statusConfig = STATUS_CONFIG[task.status]
  const StatusIcon = statusConfig.icon
  const currentStage = getCurrentStage(task.progress)
  const duration = formatDuration(task.createdAt)

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      {/* 主要进度卡片 */}
      <Card className="text-center">
        <CardHeader>
          <div className="w-16 h-16 mx-auto mb-4 relative">
            {task.status === 'PROCESSING' ? (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                statusConfig.color
              )}>
                <StatusIcon className="w-8 h-8" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-xl">{task.title}</CardTitle>
          <CardDescription>
            任务ID: {task.taskId}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 状态标识 */}
          <div className="flex items-center justify-center">
            <Badge className={cn("px-3 py-1", statusConfig.color)}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusConfig.text}
            </Badge>
          </div>

          {/* 进度条（仅在处理中或等待时显示） */}
          {(task.status === 'PROCESSING' || task.status === 'PENDING') && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">进度</span>
                <span className="font-medium">{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="w-full" />
              <p className="text-sm text-gray-500 animate-pulse">
                {currentStage}
              </p>
            </div>
          )}

          {/* 错误信息 */}
          {task.status === 'FAILED' && task.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-medium text-red-900 mb-1">生成失败</h4>
                  <p className="text-sm text-red-700">{task.errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* 时间信息 */}
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>用时: {duration}</span>
            </div>
            {task.completedAt && (
              <div>
                完成时间: {new Date(task.completedAt).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* 源图片预览 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">源图片</p>
            <div className="w-24 h-24 mx-auto relative rounded-lg overflow-hidden border">
              <Image
                src={task.sourceImageUrl}
                alt="Source"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          {(task.status === 'PROCESSING' || task.status === 'PENDING') && onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4 mr-2" />
              取消生成
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 预计时间和提示 */}
      {(task.status === 'PROCESSING' || task.status === 'PENDING') && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <Wand2 className="w-4 h-4" />
                <span className="font-medium">AI正在为您创作</span>
              </div>
              <p className="text-sm text-blue-600">
                预计需要 1-3 分钟，请耐心等待...
              </p>
              <p className="text-xs text-blue-500">
                图片生成是一个复杂的过程，需要AI理解照片特征并结合场景描述进行创作
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 实时提示（仅在处理中时显示） */}
      {task.status === 'PROCESSING' && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  {currentStage}
                </p>
                {task.progress < 50 && (
                  <p className="text-xs text-gray-500">
                    正在分析图片特征和场景要求...
                  </p>
                )}
                {task.progress >= 50 && task.progress < 90 && (
                  <p className="text-xs text-gray-500">
                    正在生成符合您要求的温馨场景...
                  </p>
                )}
                {task.progress >= 90 && (
                  <p className="text-xs text-gray-500">
                    即将完成，正在进行最后的优化...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}