"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { ResponsiveNavigation } from '@/components/responsive-navigation'
import { Footer } from '@/components/footer'
import { ImageCloneGenerator } from '@/components/image-generation/image-clone-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Heart, Wand2, Palette } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Memorial {
  id: string
  title: string
  subjectName: string
  type: 'PET' | 'HUMAN'
  images: Array<{
    url: string
    thumbnailUrl: string | null
  }>
}

interface DigitalLife {
  id: string
  name: string
  description?: string
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

export default function ImageGenerationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [digitalLives, setDigitalLives] = useState<DigitalLife[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      toast.error('请先登录')
      router.push('/login?redirect=/digital-life/image-generation')
      return
    }
    
    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 获取用户的纪念页面（仅人类纪念）
      const memorialsResponse = await fetch('/api/memorials/user', {
        credentials: 'include'
      })
      
      if (memorialsResponse.ok) {
        const memorialsData = await memorialsResponse.json()
        const humanMemorials = memorialsData.memorials
          .filter((m: Memorial) => m.type === 'HUMAN')
          .filter((m: Memorial) => m.images && m.images.length > 0)
        setMemorials(humanMemorials)
      }

      // 获取用户的数字生命
      const digitalLivesResponse = await fetch('/api/digital-lives', {
        credentials: 'include'
      })
      
      if (digitalLivesResponse.ok) {
        const digitalLivesData = await digitalLivesResponse.json()
        const digitalLivesWithImages = digitalLivesData.digitalLives
          .filter((d: DigitalLife) => d.memorial.images && d.memorial.images.length > 0)
        setDigitalLives(digitalLivesWithImages)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
        <ResponsiveNavigation currentPage="digital-life" />
        <div className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      <ResponsiveNavigation currentPage="digital-life" />
      
      <main className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* 页面头部 */}
          <div className="text-center mb-12">
            <Link href="/digital-life-home">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回数字生命
              </Button>
            </Link>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-light text-gray-900">图片生成</h1>
              </div>
              
              <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                通过AI技术，为逝者创造温馨美好的缅怀场景图片
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
                  <span>多种风格</span>
                </div>
              </div>
            </div>
          </div>

          {/* 功能说明 */}
          <Card className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">选择场景</h3>
                  <p className="text-sm text-gray-600">从天堂花园、云端仙境等温馨场景中选择，或自定义描述</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Wand2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">AI处理</h3>
                  <p className="text-sm text-gray-600">AI分析逝者照片特征，结合场景描述生成温馨图片</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">保存分享</h3>
                  <p className="text-sm text-gray-600">生成的图片可以下载保存，或添加到纪念页面中</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 数据检查 */}
          {memorials.length === 0 && digitalLives.length === 0 ? (
            <Card className="text-center">
              <CardContent className="pt-6 pb-8">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-10 h-10 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium text-gray-900">暂无可用数据</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      您需要先创建人类纪念页面或数字生命，并上传照片后才能使用图片生成功能
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Link href="/create-person-obituary">
                      <Button>创建人类纪念</Button>
                    </Link>
                    <Link href="/digital-life">
                      <Button variant="outline">创建数字生命</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ImageCloneGenerator
              memorials={memorials}
              digitalLives={digitalLives}
              onGenerationComplete={handleGenerationComplete}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}