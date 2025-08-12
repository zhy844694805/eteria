"use client"

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SceneSelector, SceneTemplate } from './scene-selector'
import { GenerationProgress } from './generation-progress'
import { GeneratedImageViewer } from './generated-image-viewer'
import { Upload, X, Wand2, Settings, Eye, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Image from 'next/image'

interface Memorial {
  id: string
  title: string
  subjectName: string
  images: Array<{
    url: string
    thumbnailUrl: string | null
  }>
}

interface DigitalLife {
  id: string
  name: string
  memorial: {
    id: string
    subjectName: string
    title: string
    images: Array<{
      url: string
      thumbnailUrl: string | null
    }>
  }
}

interface ImageCloneGeneratorProps {
  memorials?: Memorial[]
  digitalLives?: DigitalLife[]
  onGenerationComplete?: (result: any) => void
  className?: string
}

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

const STYLES = [
  { value: 'realistic', label: '写实风格', description: '真实自然的照片风格' },
  { value: 'painting', label: '油画风格', description: '古典油画艺术风格' },
  { value: 'watercolor', label: '水彩风格', description: '轻柔的水彩画风格' },
  { value: 'sketch', label: '素描风格', description: '简洁的铅笔素描风格' },
  { value: 'digital', label: '数字艺术', description: '现代数字艺术风格' },
  { value: 'anime', label: '动漫风格', description: '日本动漫插画风格' }
]

export function ImageCloneGenerator({
  memorials = [],
  digitalLives = [],
  onGenerationComplete,
  className
}: ImageCloneGeneratorProps) {
  const [step, setStep] = useState<'setup' | 'generating' | 'result'>('setup')
  const [formData, setFormData] = useState({
    sourceType: 'memorial' as 'memorial' | 'digitalLife' | 'upload',
    memorialId: '',
    digitalLifeId: '',
    sourceImageUrl: '',
    sourceImageFile: null as File | null,
    selectedScene: '',
    customDescription: '',
    style: 'realistic',
    title: '',
    description: '',
    customPrompt: '',
    isPublic: false
  })
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(null)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('请选择 JPG、PNG 或 WebP 格式的图片')
      return
    }

    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('图片文件不能超过 10MB')
      return
    }

    // 创建预览URL
    const imageUrl = URL.createObjectURL(file)
    setFormData(prev => ({
      ...prev,
      sourceImageFile: file,
      sourceImageUrl: imageUrl
    }))
  }

  // 从纪念页面选择图片
  const handleMemorialSelect = (memorialId: string) => {
    const memorial = memorials.find(m => m.id === memorialId)
    if (memorial && memorial.images.length > 0) {
      setFormData(prev => ({
        ...prev,
        memorialId,
        sourceImageUrl: memorial.images[0].url,
        title: `${memorial.subjectName}的缅怀图片`
      }))
    }
  }

  // 从数字生命选择图片
  const handleDigitalLifeSelect = (digitalLifeId: string) => {
    const digitalLife = digitalLives.find(d => d.id === digitalLifeId)
    if (digitalLife && digitalLife.memorial.images.length > 0) {
      setFormData(prev => ({
        ...prev,
        digitalLifeId,
        sourceImageUrl: digitalLife.memorial.images[0].url,
        title: `${digitalLife.name}的缅怀图片`
      }))
    }
  }

  // 场景选择处理
  const handleSceneSelect = (sceneId: string, scene: SceneTemplate | null) => {
    setFormData(prev => ({
      ...prev,
      selectedScene: sceneId,
      style: scene?.style === '写实风格' ? 'realistic' :
             scene?.style === '油画风格' ? 'painting' :
             scene?.style === '水彩风格' ? 'watercolor' :
             scene?.style === '梦幻风格' ? 'digital' :
             scene?.style === '童话风格' ? 'anime' :
             prev.style
    }))
  }

  // 开始生成
  const handleStartGeneration = async () => {
    // 验证表单
    if (!formData.sourceImageUrl) {
      toast.error('请选择源图片')
      return
    }

    if (!formData.selectedScene) {
      toast.error('请选择场景')
      return
    }

    if (formData.selectedScene === 'custom' && !formData.customDescription.trim()) {
      toast.error('请描述自定义场景')
      return
    }

    if (!formData.title.trim()) {
      toast.error('请输入标题')
      return
    }

    try {
      setStep('generating')
      
      const requestData = {
        memorialId: formData.sourceType === 'memorial' ? formData.memorialId : undefined,
        digitalLifeId: formData.sourceType === 'digitalLife' ? formData.digitalLifeId : undefined,
        sourceImageUrl: formData.sourceImageUrl,
        sceneType: formData.selectedScene === 'custom' ? 'CUSTOM' : 
                   formData.selectedScene.toUpperCase(),
        sceneDescription: formData.selectedScene === 'custom' ? 
                         formData.customDescription : 
                         'Generated scene description', // 这里应该从选中的场景获取描述
        customPrompt: formData.customPrompt,
        style: formData.style,
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic
      }

      const response = await fetch('/api/image-generation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const result = await response.json()
        const task: GenerationTask = {
          id: result.task.id,
          taskId: result.task.taskId,
          title: result.task.title,
          status: result.task.status,
          progress: 0,
          sourceImageUrl: formData.sourceImageUrl,
          createdAt: new Date().toISOString()
        }
        setCurrentTask(task)
        
        // 开始轮询任务状态
        pollTaskStatus(task.taskId)
        
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || '生成失败')
      }

    } catch (error: any) {
      console.error('生成失败:', error)
      toast.error(error.message || '生成失败，请稍后重试')
      setStep('setup')
    }
  }

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/image-generation/${taskId}`)
        if (response.ok) {
          const result = await response.json()
          const task = result.task
          
          setCurrentTask(prev => prev ? {
            ...prev,
            status: task.status,
            progress: task.progress,
            resultImageUrl: task.resultImageUrl,
            errorMessage: task.errorMessage,
            completedAt: task.completedAt
          } : null)

          if (task.status === 'COMPLETED') {
            setStep('result')
            toast.success('图片生成完成！')
            if (onGenerationComplete) {
              onGenerationComplete(task)
            }
          } else if (task.status === 'FAILED') {
            setStep('setup')
            toast.error(task.errorMessage || '生成失败')
          } else {
            // 继续轮询
            setTimeout(poll, 2000)
          }
        }
      } catch (error) {
        console.error('查询状态失败:', error)
        setTimeout(poll, 5000) // 出错时延长轮询间隔
      }
    }

    poll()
  }

  // 重新开始
  const handleRestart = () => {
    setStep('setup')
    setCurrentTask(null)
    // 清理图片URL
    if (formData.sourceImageFile && formData.sourceImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.sourceImageUrl)
    }
    setFormData(prev => ({
      ...prev,
      sourceImageFile: null,
      sourceImageUrl: '',
      title: '',
      description: '',
      customPrompt: '',
      selectedScene: '',
      customDescription: ''
    }))
  }

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium",
          step === 'setup' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
        )}>
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            step === 'setup' ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
          )}>
            1
          </div>
          <span>设置参数</span>
        </div>
        
        <div className={cn(
          "w-8 h-0.5",
          step !== 'setup' ? "bg-blue-500" : "bg-gray-300"
        )}></div>
        
        <div className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium",
          step === 'generating' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
        )}>
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            step === 'generating' ? "bg-blue-500 text-white" : 
            step === 'result' ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
          )}>
            2
          </div>
          <span>生成中</span>
        </div>
        
        <div className={cn(
          "w-8 h-0.5",
          step === 'result' ? "bg-blue-500" : "bg-gray-300"
        )}></div>
        
        <div className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium",
          step === 'result' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
        )}>
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            step === 'result' ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
          )}>
            3
          </div>
          <span>查看结果</span>
        </div>
      </div>

      {/* 设置参数步骤 */}
      {step === 'setup' && (
        <div className="space-y-6">
          {/* 源图片选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>选择源图片</span>
              </CardTitle>
              <CardDescription>
                选择要进行场景克隆的逝者照片
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 源图片类型选择 */}
              <div className="space-y-3">
                <Label>图片来源</Label>
                <Select value={formData.sourceType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, sourceType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {memorials.length > 0 && (
                      <SelectItem value="memorial">从纪念页面选择</SelectItem>
                    )}
                    {digitalLives.length > 0 && (
                      <SelectItem value="digitalLife">从数字生命选择</SelectItem>
                    )}
                    <SelectItem value="upload">上传新图片</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 从纪念页面选择 */}
              {formData.sourceType === 'memorial' && (
                <div className="space-y-3">
                  <Label>选择纪念页面</Label>
                  <Select value={formData.memorialId} onValueChange={handleMemorialSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择纪念页面" />
                    </SelectTrigger>
                    <SelectContent>
                      {memorials.map(memorial => (
                        <SelectItem key={memorial.id} value={memorial.id}>
                          {memorial.subjectName} - {memorial.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 从数字生命选择 */}
              {formData.sourceType === 'digitalLife' && (
                <div className="space-y-3">
                  <Label>选择数字生命</Label>
                  <Select value={formData.digitalLifeId} onValueChange={handleDigitalLifeSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择数字生命" />
                    </SelectTrigger>
                    <SelectContent>
                      {digitalLives.map(digitalLife => (
                        <SelectItem key={digitalLife.id} value={digitalLife.id}>
                          {digitalLife.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 上传图片 */}
              {formData.sourceType === 'upload' && (
                <div className="space-y-3">
                  <Label>上传图片</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.sourceImageUrl ? (
                      <div className="space-y-3">
                        <div className="relative w-32 h-32 mx-auto">
                          <Image
                            src={formData.sourceImageUrl}
                            alt="原图"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (formData.sourceImageUrl.startsWith('blob:')) {
                                URL.revokeObjectURL(formData.sourceImageUrl)
                              }
                              setFormData(prev => ({ ...prev, sourceImageFile: null, sourceImageUrl: '' }))
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">点击重新选择图片</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-500">点击上传图片</p>
                        <p className="text-xs text-gray-400">支持 JPG、PNG、WebP 格式，最大 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* 预览选中的图片 */}
              {formData.sourceImageUrl && formData.sourceType !== 'upload' && (
                <div className="mt-4">
                  <Label>预览</Label>
                  <div className="mt-2 w-32 h-32 relative">
                    <Image
                      src={formData.sourceImageUrl}
                      alt="原图预览"
                      fill
                      className="object-cover rounded-lg border"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 场景选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="w-5 h-5" />
                <span>选择缅怀场景</span>
              </CardTitle>
              <CardDescription>
                选择您希望生成的温馨场景
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SceneSelector
                selectedScene={formData.selectedScene}
                customDescription={formData.customDescription}
                onSceneSelect={handleSceneSelect}
                onCustomDescriptionChange={(description) => setFormData(prev => ({ ...prev, customDescription: description }))}
              />
            </CardContent>
          </Card>

          {/* 基本设置 */}
          <Card>
            <CardHeader>
              <CardTitle>基本设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  标题 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="为这张缅怀图片起个名字..."
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简单描述这张图片的意义（可选）..."
                  className="resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label>艺术风格</Label>
                <Select value={formData.style} onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-gray-500">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic">公开展示</Label>
                <p className="text-xs text-gray-500">允许其他用户在纪念页面看到这张图片</p>
              </div>
            </CardContent>
          </Card>

          {/* 高级设置 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>高级设置</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  {showAdvancedSettings ? '收起' : '展开'}
                </Button>
              </div>
            </CardHeader>
            {showAdvancedSettings && (
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customPrompt">自定义提示词</Label>
                    <Textarea
                      id="customPrompt"
                      value={formData.customPrompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
                      placeholder="添加额外的描述词来微调生成效果（英文，可选）..."
                      className="resize-none"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500">
                      例如：beautiful lighting, peaceful expression, soft colors
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 开始生成按钮 */}
          <div className="text-center">
            <Button
              onClick={handleStartGeneration}
              size="lg"
              className="px-8"
              disabled={!formData.sourceImageUrl || !formData.selectedScene || !formData.title.trim()}
            >
              <Wand2 className="w-5 h-5 mr-2" />
              开始生成缅怀图片
            </Button>
          </div>
        </div>
      )}

      {/* 生成进度步骤 */}
      {step === 'generating' && currentTask && (
        <GenerationProgress
          task={currentTask}
          onCancel={() => setStep('setup')}
        />
      )}

      {/* 查看结果步骤 */}
      {step === 'result' && currentTask && (
        <GeneratedImageViewer
          task={currentTask}
          onRestart={handleRestart}
          onDownload={() => {
            if (currentTask.resultImageUrl) {
              const link = document.createElement('a')
              link.href = currentTask.resultImageUrl
              link.download = `${currentTask.title}.jpg`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }
          }}
        />
      )}
    </div>
  )
}