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

  // 当用户已登录时，自动填充用户信息
  useEffect(() => {
    if (user && (!formData.ownerName || !formData.ownerEmail)) {
      updateFormData({
        ownerName: user.name || '',
        ownerEmail: user.email || ''
      })
    }
  }, [user, formData.ownerName, formData.ownerEmail, updateFormData])

  const handleSubmit = async () => {
    // 检查用户是否已登录
    if (!user) {
      setMessage({ type: 'error', text: '请先登录后再创建纪念页' })
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    // 验证必填字段
    if (!formData.petName.trim()) {
      setMessage({ type: 'error', text: '请输入宠物姓名' })
      return
    }

    // 对于未登录用户，验证姓名和邮箱
    if (!user && (!formData.ownerName.trim() || !formData.ownerEmail.trim())) {
      setMessage({ type: 'error', text: '请输入您的姓名和邮箱地址' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // 准备API数据
      const memorialData = {
        type: 'PET',
        subjectName: formData.petName,
        birthDate: formData.birthDate,
        deathDate: formData.passingDate,
        story: formData.aiGeneratedObituary || formData.specialMemory,
        authorId: user.id,
        creatorName: user.name || formData.ownerName,
        creatorEmail: user.email || formData.ownerEmail,
        // 宠物特有字段
        subjectType: formData.petType,
        breed: formData.breed,
        color: formData.color,
        gender: formData.gender,
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
        
        // 跳转到纪念页详情或社区页面
        setTimeout(() => {
          router.push('/community-pet-obituaries')
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">创建免费宠物纪念页</h1>
        <p className="text-gray-600">用永久存在的美丽纪念向您心爱的宠物致敬</p>
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
          // 未登录用户显示输入框
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">您的姓名 *</label>
              <Input
                placeholder="请输入您的姓名"
                value={formData.ownerName}
                onChange={(e) => updateFormData({ ownerName: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱地址 *</label>
              <Input
                type="email"
                placeholder="请输入您的邮箱"
                value={formData.ownerEmail}
                onChange={(e) => updateFormData({ ownerEmail: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">我们将发送纪念页链接到您的邮箱</p>
            </div>
          </>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            返回
          </Button>
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
        </div>
      </div>
    </div>
  )
}
