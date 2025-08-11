"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Star, Heart, Sparkles, TreePine, Mountain, Waves, Home, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface SceneTemplate {
  id: string
  name: string
  nameEn: string
  description: string
  category: 'PEACEFUL' | 'JOYFUL' | 'NOSTALGIC' | 'SPIRITUAL' | 'NATURAL' | 'FAMILY'
  sceneType: 'HEAVEN' | 'GARDEN' | 'CLOUD' | 'FOREST' | 'BEACH' | 'MOUNTAIN' | 'CITY' | 'HOME' | 'CUSTOM'
  basePrompt: string
  negativePrompt?: string
  style?: string
  thumbnailUrl?: string
  isActive: boolean
  isRecommended: boolean
  sortOrder: number
  usageCount: number
  rating?: number
  ratingCount: number
  tags: string[]
}

interface SceneSelectorProps {
  selectedScene?: string
  customDescription?: string
  onSceneSelect: (sceneId: string, scene: SceneTemplate | null) => void
  onCustomDescriptionChange: (description: string) => void
  className?: string
}

const SCENE_ICONS = {
  HEAVEN: Sparkles,
  GARDEN: Heart,
  CLOUD: Sparkles,
  FOREST: TreePine,
  BEACH: Waves,
  MOUNTAIN: Mountain,
  CITY: Palette,
  HOME: Home,
  CUSTOM: Palette
}

const CATEGORY_COLORS = {
  PEACEFUL: 'bg-blue-50 text-blue-700 border-blue-200',
  JOYFUL: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  NOSTALGIC: 'bg-purple-50 text-purple-700 border-purple-200',
  SPIRITUAL: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  NATURAL: 'bg-green-50 text-green-700 border-green-200',
  FAMILY: 'bg-pink-50 text-pink-700 border-pink-200'
}

export function SceneSelector({
  selectedScene,
  customDescription = '',
  onSceneSelect,
  onCustomDescriptionChange,
  className
}: SceneSelectorProps) {
  const [scenes, setScenes] = useState<SceneTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchScenes()
  }, [])

  const fetchScenes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/image-generation/scenes')
      if (response.ok) {
        const data = await response.json()
        setScenes(data.scenes || [])
      } else {
        setError('获取场景模板失败')
      }
    } catch (err) {
      setError('网络请求失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSceneSelect = (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId) || null
    onSceneSelect(sceneId, scene)
  }

  const filteredScenes = scenes.filter(scene => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'recommended') return scene.isRecommended
    return scene.category === selectedCategory
  })

  const categories = [
    { id: 'all', name: '全部场景', count: scenes.length },
    { id: 'recommended', name: '推荐场景', count: scenes.filter(s => s.isRecommended).length },
    { id: 'SPIRITUAL', name: '精神慰藉', count: scenes.filter(s => s.category === 'SPIRITUAL').length },
    { id: 'PEACEFUL', name: '宁静安详', count: scenes.filter(s => s.category === 'PEACEFUL').length },
    { id: 'FAMILY', name: '家庭温馨', count: scenes.filter(s => s.category === 'FAMILY').length },
    { id: 'NATURAL', name: '自然风光', count: scenes.filter(s => s.category === 'NATURAL').length }
  ]

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">正在加载场景模板...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
            <div className="text-center mt-4">
              <Button variant="outline" onClick={fetchScenes}>
                重新加载
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 分类筛选 */}
      <div className="space-y-3">
        <Label className="text-base font-medium">选择场景分类</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-sm"
            >
              {category.name}
              {category.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* 场景选择 */}
      <div className="space-y-3">
        <Label className="text-base font-medium">选择缅怀场景</Label>
        <RadioGroup value={selectedScene} onValueChange={handleSceneSelect}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenes.map((scene) => {
              const IconComponent = SCENE_ICONS[scene.sceneType]
              return (
                <div key={scene.id} className="relative">
                  <RadioGroupItem value={scene.id} id={scene.id} className="sr-only" />
                  <label
                    htmlFor={scene.id}
                    className={cn(
                      "block cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedScene === scene.id
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : "hover:shadow-sm"
                    )}
                  >
                    <Card className="h-full">
                      {/* 场景图片或图标 */}
                      <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg overflow-hidden">
                        {scene.thumbnailUrl ? (
                          <Image
                            src={scene.thumbnailUrl}
                            alt={scene.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <IconComponent className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {scene.isRecommended && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-yellow-500 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              推荐
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {scene.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", CATEGORY_COLORS[scene.category])}
                          >
                            {scene.category === 'PEACEFUL' ? '宁静' :
                             scene.category === 'JOYFUL' ? '欢乐' :
                             scene.category === 'NOSTALGIC' ? '怀念' :
                             scene.category === 'SPIRITUAL' ? '精神' :
                             scene.category === 'NATURAL' ? '自然' :
                             scene.category === 'FAMILY' ? '家庭' : '其他'}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs line-clamp-2">
                          {scene.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* 标签 */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {scene.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* 评分和使用次数 */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {scene.rating && (
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                              <span>{scene.rating}</span>
                              <span className="ml-1">({scene.ratingCount})</span>
                            </div>
                          )}
                          <span>{scene.usageCount} 次使用</span>
                        </div>
                      </CardContent>
                    </Card>
                  </label>
                </div>
              )
            })}

            {/* 自定义场景选项 */}
            <div className="relative">
              <RadioGroupItem value="custom" id="custom" className="sr-only" />
              <label
                htmlFor="custom"
                className={cn(
                  "block cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedScene === "custom"
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : "hover:shadow-sm"
                )}
              >
                <Card className="h-full">
                  <div className="relative h-32 bg-gradient-to-br from-purple-50 to-purple-100 rounded-t-lg overflow-hidden">
                    <div className="flex items-center justify-center h-full">
                      <Palette className="w-12 h-12 text-purple-400" />
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">自定义场景</CardTitle>
                    <CardDescription className="text-xs">
                      描述您心中理想的缅怀场景
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      个性化
                    </Badge>
                  </CardContent>
                </Card>
              </label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* 自定义场景描述 */}
      {selectedScene === 'custom' && (
        <div className="space-y-3">
          <Label className="text-base font-medium">
            描述您的理想场景 <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={customDescription}
            onChange={(e) => onCustomDescriptionChange(e.target.value)}
            placeholder="请详细描述您希望生成的缅怀场景，例如：在一个阳光明媚的花园里，逝者坐在樱花树下微笑着看书，周围有蝴蝶飞舞，远处是青山绿水..."
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500">
            {customDescription.length}/500 字符
          </p>
          {customDescription.length < 20 && (
            <p className="text-xs text-amber-600">
              建议至少输入20个字符以获得更好的生成效果
            </p>
          )}
        </div>
      )}

      {/* 选中场景的详细描述 */}
      {selectedScene && selectedScene !== 'custom' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">已选择场景：</p>
              <p className="text-sm text-blue-700">
                {scenes.find(s => s.id === selectedScene)?.description}
              </p>
              {scenes.find(s => s.id === selectedScene)?.style && (
                <p className="text-xs text-blue-600">
                  推荐风格：{scenes.find(s => s.id === selectedScene)?.style}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}