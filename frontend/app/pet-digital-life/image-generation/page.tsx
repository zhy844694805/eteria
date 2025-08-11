"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { ResponsiveNavigation } from '@/components/responsive-navigation'
import { Footer } from '@/components/footer'
import { PetImageGenerator } from '@/components/image-generation/pet-image-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart, Wand2, Palette, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Memorial {
  id: string
  title: string
  subjectName: string
  type: 'PET'
  slug: string
  images: Array<{
    url: string
    thumbnailUrl: string | null
    isMain: boolean
  }>
}

export default function PetImageGenerationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)

  // 从URL参数获取预选的纪念页面ID
  const preselectedMemorialId = searchParams.get('memorialId')

  useEffect(() => {
    if (!user) {
      toast.error('请先登录')
      router.push('/login?redirect=/pet-digital-life/image-generation')
      return
    }
    
    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 获取用户的宠物纪念页面
      const memorialsResponse = await fetch('/api/memorials/user', {
        credentials: 'include'
      })
      
      if (memorialsResponse.ok) {
        const memorialsData = await memorialsResponse.json()
        const petMemorials = memorialsData.memorials
          .filter((m: Memorial) => m.type === 'PET')
          .filter((m: Memorial) => m.images && m.images.length > 0)
        setMemorials(petMemorials)
      }
      
    } catch (error) {
      console.error('获取数据失败:', error)
      toast.error('获取数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerationComplete = (result: any) => {
    toast.success(`图片生成完成：${result.title}`)
    // 可以选择跳转到结果页面或进行其他处理
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-stone-50">
        <ResponsiveNavigation currentPage="pet-memorial" />
        <div className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600">正在加载数据...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null // 重定向中
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-stone-50">
      <ResponsiveNavigation currentPage="pet-memorial" />
      
      <main className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* 页面头部 */}
          <div className="text-center mb-12">
            <Link href="/pet-digital-life">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回宠物数字生命
              </Button>
            </Link>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-light text-gray-900">宠物天堂图片生成</h1>
              </div>
              
              <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                为您心爱的小天使生成在天堂中快乐生活的温馨场景图片
              </p>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>温馨缅怀</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wand2 className="w-4 h-4" />
                  <span>AI生成</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Palette className="w-4 h-4" />
                  <span>天堂场景</span>
                </div>
              </div>
            </div>
          </div>

          {/* 宠物特色功能说明 */}
          <Card className="mb-12 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">宠物天堂</h3>
                  <p className="text-sm text-gray-600">为小天使选择最适合的天堂场景，让TA在彩虹桥另一边快乐生活</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                    <Wand2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">专为宠物设计</h3>
                  <p className="text-sm text-gray-600">AI理解宠物特征，生成符合小天使个性的温馨画面</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">永恒纪念</h3>
                  <p className="text-sm text-gray-600">生成的图片可以保存分享，成为永久的美好回忆</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 数据检查 */}
          {memorials.length === 0 ? (
            <Card className="text-center">
              <CardContent className="pt-6 pb-8">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-10 h-10 text-teal-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium text-gray-900">暂无宠物纪念页面</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      您需要先创建宠物纪念页面并上传小天使的照片后才能使用图片生成功能
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Link href="/create-obituary">
                      <Button className="bg-teal-600 hover:bg-teal-700">创建宠物纪念</Button>
                    </Link>
                    <Link href="/community-pet-obituaries">
                      <Button variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50">浏览社区</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* 温馨提示 */}
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-medium text-amber-900">关于宠物天堂图片生成</h4>
                      <p className="text-sm text-amber-700">
                        我们相信每个小天使都在彩虹桥的另一边快乐生活着。AI会根据您宠物的照片特征，
                        为TA生成在天堂花园、云端仙境等温馨场景中的图片，让您感受到小天使依然在身边的温暖。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 宠物专用图片生成器组件 */}
              <PetImageGenerator
                memorials={memorials}
                onGenerationComplete={handleGenerationComplete}
                className="bg-white"
              />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}