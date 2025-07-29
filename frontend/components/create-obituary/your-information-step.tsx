"use client"

import { useState } from 'react'
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
    // 验证必填字段
    if (!formData.ownerName.trim()) {
      setMessage({ type: 'error', text: '请输入您的姓名' })
      return
    }
    
    if (!formData.ownerEmail.trim()) {
      setMessage({ type: 'error', text: '请输入您的邮箱地址' })
      return
    }

    if (!formData.petName.trim()) {
      setMessage({ type: 'error', text: '请输入宠物姓名' })
      return
    }

    // 检查用户是否已登录
    if (!user) {
      setMessage({ type: 'error', text: '请先登录后再创建纪念页' })
      setTimeout(() => router.push('/login'), 2000)
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
        creatorName: formData.ownerName,
        creatorEmail: formData.ownerEmail,
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Free Pet Obituary</h1>
        <p className="text-gray-600">Honor your beloved pet with a beautiful tribute that lives forever</p>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
          <Input
            placeholder="Enter your name"
            value={formData.ownerName}
            onChange={(e) => updateFormData({ ownerName: e.target.value })}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={formData.ownerEmail}
            onChange={(e) => updateFormData({ ownerEmail: e.target.value })}
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">We'll send you a link to your pet's memorial page</p>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            Back
          </Button>
          <Button 
            className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-2 rounded-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Memorial'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
