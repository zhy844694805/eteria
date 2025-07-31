"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface YourInformationStepProps {
  formData: any
  updateFormData: (updates: any) => void
  onBack: () => void
}

export function YourInformationStep({ formData, updateFormData, onBack }: YourInformationStepProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)


  const handleSubmit = async () => {
    // 此时用户已经登录，直接验证必填字段
    const subjectName = formData.petName || formData.personName
    if (!subjectName?.trim()) {
      setMessage({ type: 'error', text: '请输入纪念对象的姓名' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // 判断是宠物纪念还是人员纪念
      const isPet = formData.petName
      
      // 准备API数据
      const memorialData = {
        type: isPet ? 'PET' : 'HUMAN',
        subjectName: isPet ? formData.petName : formData.personName,
        birthDate: formData.birthDate,
        deathDate: formData.passingDate,
        story: formData.aiGeneratedObituary || formData.specialMemory,
        authorId: user.id,
        creatorName: user.name,
        creatorEmail: user.email,
        // 宠物特有字段
        ...(isPet && {
          subjectType: formData.petType,
          breed: formData.breed,
          color: formData.color,
          gender: formData.gender,
        }),
        // 人员特有字段
        ...(!isPet && {
          relationship: formData.relationship,
          age: formData.age,
        }),
      }

      // 调用创建纪念页API
      const response = await fetch('/api/memorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memorialData)
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: '纪念页创建成功！正在跳转...' })
        
        // 根据纪念类型跳转到对应的社区页面
        setTimeout(() => {
          const communityPath = isPet ? '/community-pet-obituaries' : '/community-person-obituaries'
          router.push(communityPath)
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error || '创建纪念页失败，请重试' })
      }
    } catch (error) {
      console.error('Create memorial error:', error)
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">创建纪念页面</h1>
        <p className="text-gray-600">用永久存在的美丽纪念致敬珍贵的回忆</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {message.type === 'success' ? 
            <CheckCircle className="h-4 w-4 text-green-600" /> : 
            <AlertCircle className="h-4 w-4 text-red-600" />
          }
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {user ? (
          // 已登录用户显示简化信息
          <div className="bg-teal-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">创建者信息</h3>
            <p className="text-gray-600">姓名：{user.name}</p>
            <p className="text-gray-600">邮箱：{user.email}</p>
            <p className="text-sm text-gray-500 mt-2">纪念页将与您的账户关联</p>
          </div>
        ) : (
          // 未登录用户显示登录提示
          <div className="bg-orange-50 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">需要登录才能发布纪念页</h3>
            <p className="text-gray-600 mb-6">为了更好地管理您的纪念页面，请先登录或注册账户</p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => {
                  // 保存当前表单数据到 sessionStorage
                  sessionStorage.setItem('memorialFormData', JSON.stringify(formData))
                  sessionStorage.setItem('memorialFormStep', '3')
                  sessionStorage.setItem('memorialFormType', formData.petName ? 'pet' : 'person')
                  router.push('/login')
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full"
              >
                立即登录
              </Button>
              <Button 
                onClick={() => {
                  // 保存当前表单数据到 sessionStorage
                  sessionStorage.setItem('memorialFormData', JSON.stringify(formData))
                  sessionStorage.setItem('memorialFormStep', '3')
                  sessionStorage.setItem('memorialFormType', formData.petName ? 'pet' : 'person')
                  router.push('/register')
                }}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-2 rounded-full"
              >
                注册账户
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">登录后您的纪念页面将被永久保存，且可随时编辑</p>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            返回
          </Button>
          {user && (
            <Button 
              className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-2 rounded-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                '创建纪念页'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
