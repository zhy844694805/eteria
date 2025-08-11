"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Heart, Sparkles, TreePine, Mountain, Waves, Home, Palette, Star, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface PetSceneTemplate {
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

interface PetSceneSelectorProps {
  selectedScene?: string
  customDescription?: string
  onSceneSelect: (sceneId: string, scene: PetSceneTemplate | null) => void
  onCustomDescriptionChange: (description: string) => void
  className?: string
}

const PET_SCENE_ICONS = {
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

// 专门为宠物设计的场景模板
const PET_SCENE_TEMPLATES: PetSceneTemplate[] = [
  {
    id: 'pet_rainbow_bridge',
    name: '彩虹桥天堂',
    nameEn: 'Rainbow Bridge Heaven',
    description: '在美丽的彩虹桥上，小天使自由快乐地奔跑玩耍',
    category: 'SPIRITUAL',
    sceneType: 'HEAVEN',
    basePrompt: 'beautiful rainbow bridge in heaven, happy {pet} running freely across colorful rainbow, fluffy white clouds, golden sunlight, peaceful paradise, joyful atmosphere, pet heaven, photorealistic',
    negativePrompt: 'sad, dark, scary, death, pain, suffering, cage, leash',
    style: '温馨风格',
    thumbnailUrl: '/images/pet-scenes/rainbow-bridge.jpg',
    isActive: true,
    isRecommended: true,
    sortOrder: 1,
    usageCount: 0,
    rating: 4.9,
    ratingCount: 256,
    tags: ['彩虹桥', '天堂', '自由', '快乐']
  },
  {
    id: 'pet_flower_meadow',
    name: '花海乐园',
    nameEn: 'Flower Meadow Paradise',
    description: '在无边的花海中，小天使和蝴蝶一起嬉戏玩耍',
    category: 'JOYFUL',
    sceneType: 'GARDEN',
    basePrompt: 'endless flower meadow paradise, playful {pet} running through colorful wildflowers, butterflies dancing around, warm sunshine, spring breeze, joyful and carefree, beautiful nature, photorealistic',
    negativePrompt: 'wilted flowers, dark, storm, scary, trapped, sad',
    style: '明亮风格',
    thumbnailUrl: '/images/pet-scenes/flower-meadow.jpg',
    isActive: true,
    isRecommended: true,
    sortOrder: 2,
    usageCount: 0,
    rating: 4.8,
    ratingCount: 189,
    tags: ['花海', '蝴蝶', '嬉戏', '春天']
  },
  {
    id: 'pet_cloud_playground',
    name: '云朵游乐场',
    nameEn: 'Cloud Playground',
    description: '在柔软的白云上跳跃玩耍，如天使般自由翱翔',
    category: 'JOYFUL',
    sceneType: 'CLOUD',
    basePrompt: 'fluffy white clouds playground in sky, {pet} jumping playfully between soft clouds, angel wings, flying freely, heavenly atmosphere, pure joy, divine light, dreamy scene, photorealistic',
    negativePrompt: 'falling, dangerous, dark clouds, storm, fear, trapped',
    style: '梦幻风格',
    thumbnailUrl: '/images/pet-scenes/cloud-playground.jpg',
    isActive: true,
    isRecommended: true,
    sortOrder: 3,
    usageCount: 0,
    rating: 4.7,
    ratingCount: 156,
    tags: ['云朵', '天使', '翱翔', '游戏']
  },
  {
    id: 'pet_magical_forest',
    name: '魔法森林',
    nameEn: 'Magical Forest',
    description: '在充满魔法的森林中，小天使与森林精灵一起探险',
    category: 'NATURAL',
    sceneType: 'FOREST',
    basePrompt: 'magical enchanted forest, curious {pet} exploring with forest spirits, glowing fireflies, magical creatures, dappled sunlight through trees, wonder and adventure, fairy tale atmosphere, photorealistic',
    negativePrompt: 'dark forest, scary trees, monsters, lost, dangerous, trapped',
    style: '童话风格',
    thumbnailUrl: '/images/pet-scenes/magical-forest.jpg',
    isActive: true,
    isRecommended: false,
    sortOrder: 4,
    usageCount: 0,
    rating: 4.6,
    ratingCount: 98,
    tags: ['魔法', '探险', '精灵', '神秘']
  },
  {
    id: 'pet_sunny_beach',
    name: '阳光海滩',
    nameEn: 'Sunny Beach Paradise',
    description: '在温暖的海滩上自由奔跑，享受阳光和海风的拥抱',
    category: 'JOYFUL',
    sceneType: 'BEACH',
    basePrompt: 'sunny beach paradise, happy {pet} running on golden sand, gentle waves, warm sunshine, seagulls flying, ocean breeze, pure joy and freedom, tropical paradise, photorealistic',
    negativePrompt: 'storm, dangerous waves, hot sand, trapped, scary ocean',
    style: '阳光风格',
    thumbnailUrl: '/images/pet-scenes/sunny-beach.jpg',
    isActive: true,
    isRecommended: false,
    sortOrder: 5,
    usageCount: 0,
    rating: 4.5,
    ratingCount: 67,
    tags: ['海滩', '阳光', '自由', '海风']
  },
  {
    id: 'pet_cozy_home',
    name: '温馨家园',
    nameEn: 'Cozy Home',
    description: '在永远温暖的家中，小天使安详地享受着无尽的爱',
    category: 'FAMILY',
    sceneType: 'HOME',
    basePrompt: 'cozy eternal home, peaceful {pet} resting in warm sunlight by window, comfortable bed, loving atmosphere, safe and secure, surrounded by love, perfect home, photorealistic',
    negativePrompt: 'empty house, cold, lonely, abandoned, sad, dark room',
    style: '温馨风格',
    thumbnailUrl: '/images/pet-scenes/cozy-home.jpg',
    isActive: true,
    isRecommended: true,
    sortOrder: 6,
    usageCount: 0,
    rating: 4.9,
    ratingCount: 234,
    tags: ['家', '温暖', '安详', '爱']
  },
  {
    id: 'pet_starry_meadow',
    name: '星空草原',
    nameEn: 'Starry Meadow',
    description: '在星光点点的夜晚草原上，小天使静静地守护着美好的梦',
    category: 'PEACEFUL',
    sceneType: 'GARDEN',
    basePrompt: 'peaceful starry meadow at night, serene {pet} under twinkling stars, soft moonlight, gentle grass swaying, fireflies dancing, tranquil and magical, guardian angel, photorealistic',
    negativePrompt: 'scary night, darkness, cold, alone, frightening, dangerous',
    style: '宁静风格',
    thumbnailUrl: '/images/pet-scenes/starry-meadow.jpg',
    isActive: true,
    isRecommended: false,
    sortOrder: 7,
    usageCount: 0,
    rating: 4.4,
    ratingCount: 45,
    tags: ['星空', '宁静', '守护', '美梦']
  }
]

const CATEGORY_COLORS = {
  PEACEFUL: 'bg-blue-50 text-blue-700 border-blue-200',
  JOYFUL: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  NOSTALGIC: 'bg-purple-50 text-purple-700 border-purple-200',
  SPIRITUAL: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  NATURAL: 'bg-green-50 text-green-700 border-green-200',
  FAMILY: 'bg-pink-50 text-pink-700 border-pink-200'
}

export function PetSceneSelector({
  selectedScene,
  customDescription = '',
  onSceneSelect,
  onCustomDescriptionChange,
  className
}: PetSceneSelectorProps) {
  const [scenes] = useState<PetSceneTemplate[]>(PET_SCENE_TEMPLATES)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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
    { id: 'SPIRITUAL', name: '天堂场景', count: scenes.filter(s => s.category === 'SPIRITUAL').length },
    { id: 'JOYFUL', name: '欢乐场景', count: scenes.filter(s => s.category === 'JOYFUL').length },
    { id: 'FAMILY', name: '温馨家园', count: scenes.filter(s => s.category === 'FAMILY').length },
    { id: 'NATURAL', name: '自然风光', count: scenes.filter(s => s.category === 'NATURAL').length }
  ]

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

      {/* 宠物天堂说明 */}
      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <Heart className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-teal-900">关于宠物天堂场景</h4>
              <p className="text-sm text-teal-700">
                我们相信每个小天使都在彩虹桥的另一边快乐生活。这些场景专为宠物设计，
                展现它们在天堂中自由奔跑、快乐玩耍的美好画面。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 场景选择 */}
      <div className="space-y-3">
        <Label className="text-base font-medium">选择天堂场景</Label>
        <RadioGroup value={selectedScene} onValueChange={handleSceneSelect}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenes.map((scene) => {
              const IconComponent = PET_SCENE_ICONS[scene.sceneType]
              return (
                <div key={scene.id} className="relative">
                  <RadioGroupItem value={scene.id} id={scene.id} className="sr-only" />
                  <label
                    htmlFor={scene.id}
                    className={cn(
                      "block cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedScene === scene.id
                        ? "ring-2 ring-teal-500 shadow-lg"
                        : "hover:shadow-sm"
                    )}
                  >
                    <Card className="h-full">
                      {/* 场景图片或图标 */}
                      <div className="relative h-32 bg-gradient-to-br from-teal-50 to-cyan-100 rounded-t-lg overflow-hidden">
                        {scene.thumbnailUrl ? (
                          <Image
                            src={scene.thumbnailUrl}
                            alt={scene.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <IconComponent className="w-12 h-12 text-teal-400" />
                          </div>
                        )}
                        {scene.isRecommended && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-teal-500 text-white">
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
                             scene.category === 'SPIRITUAL' ? '天堂' :
                             scene.category === 'NATURAL' ? '自然' :
                             scene.category === 'FAMILY' ? '家园' : '其他'}
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
                              <Heart className="w-3 h-3 text-teal-400 fill-current mr-1" />
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
                    ? "ring-2 ring-teal-500 shadow-lg"
                    : "hover:shadow-sm"
                )}
              >
                <Card className="h-full">
                  <div className="relative h-32 bg-gradient-to-br from-purple-50 to-pink-100 rounded-t-lg overflow-hidden">
                    <div className="flex items-center justify-center h-full">
                      <Palette className="w-12 h-12 text-purple-400" />
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">自定义场景</CardTitle>
                    <CardDescription className="text-xs">
                      描述您心中小天使的理想天堂
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
            描述小天使的天堂场景 <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={customDescription}
            onChange={(e) => onCustomDescriptionChange(e.target.value)}
            placeholder="请详细描述您希望小天使在天堂中的生活场景，例如：在一个阳光明媚的大草原上，小狗在花丛中快乐地奔跑追逐蝴蝶，周围有其他小动物朋友一起玩耍..."
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
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-teal-900">已选择场景：</p>
              <p className="text-sm text-teal-700">
                {scenes.find(s => s.id === selectedScene)?.description}
              </p>
              {scenes.find(s => s.id === selectedScene)?.style && (
                <p className="text-xs text-teal-600">
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