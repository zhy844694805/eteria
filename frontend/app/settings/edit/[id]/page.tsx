'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, SaveIcon, Volume2, Upload, Play, Pause, Trash2, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { DatePicker } from '@/components/ui/date-picker'
import { ImageManager } from '@/components/image-manager'

interface Memorial {
  id: string
  title: string
  type: 'PET' | 'HUMAN'
  subjectName: string
  subjectType?: string
  birthDate?: string
  deathDate?: string
  age?: string
  breed?: string
  color?: string
  gender?: string
  relationship?: string
  occupation?: string
  location?: string
  story?: string
  memories?: string
  personalityTraits?: string
  favoriteThings?: string
  creatorName: string
  creatorEmail?: string
  creatorPhone?: string
  creatorRelation?: string
  isPublic: boolean
  images: Array<{
    id: string
    url: string
    isMain: boolean
    order: number
    filename: string
  }>
}

interface VoiceModel {
  id: string
  name: string
  description?: string
  status: 'TRAINING' | 'READY' | 'FAILED' | 'INACTIVE'
  isPublic: boolean
  allowPublicUse: boolean
  maxUsagePerDay: number
  quality?: number
  usageCount: number
  todayUsageCount: number
  sampleAudioPaths: string
  createdAt: string
}

interface EditMemorialPageProps {
  params: Promise<{ id: string }>
}

export default function EditMemorialPage({ params }: EditMemorialPageProps) {
  const { user } = useAuth()
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  
  // 语音模型相关状态
  const [voiceModel, setVoiceModel] = useState<VoiceModel | null>(null)
  const [isCreatingVoiceModel, setIsCreatingVoiceModel] = useState(false)
  const [isUpdatingVoiceModel, setIsUpdatingVoiceModel] = useState(false)
  const [uploadedAudios, setUploadedAudios] = useState<File[]>([])
  const [voiceModelForm, setVoiceModelForm] = useState({
    name: '',
    description: '',
    isPublic: false,
    allowPublicUse: false,
    maxUsagePerDay: 50
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    const loadMemorial = async () => {
      const resolvedParams = await params
      fetchMemorial(resolvedParams.id)
    }
    
    loadMemorial()
  }, [user, router, params])

  const fetchMemorial = async (id: string) => {
    try {
      const response = await fetch(`/api/memorials/${id}`)
      if (!response.ok) {
        throw new Error('获取纪念页失败')
      }
      const data = await response.json()
      
      // 检查用户是否有权限编辑
      if (data.memorial.author.id !== user?.id) {
        toast.error('您没有权限编辑此纪念页')
        router.push('/settings')
        return
      }

      setMemorial({
        id: data.memorial.id,
        title: data.memorial.title,
        type: data.memorial.type,
        subjectName: data.memorial.subjectName,
        subjectType: data.memorial.subjectType,
        birthDate: data.memorial.birthDate ? new Date(data.memorial.birthDate).toISOString().split('T')[0] : '',
        deathDate: data.memorial.deathDate ? new Date(data.memorial.deathDate).toISOString().split('T')[0] : '',
        age: data.memorial.age || '',
        breed: data.memorial.breed || '',
        color: data.memorial.color || '',
        gender: data.memorial.gender || '',
        relationship: data.memorial.relationship || '',
        occupation: data.memorial.occupation || '',
        location: data.memorial.location || '',
        story: data.memorial.story || '',
        memories: data.memorial.memories || '',
        personalityTraits: data.memorial.personalityTraits || '',
        favoriteThings: data.memorial.favoriteThings || '',
        creatorName: data.memorial.creatorName,
        creatorEmail: data.memorial.creatorEmail || '',
        creatorPhone: data.memorial.creatorPhone || '',
        creatorRelation: data.memorial.creatorRelation || '',
        isPublic: data.memorial.isPublic,
        images: data.memorial.images || []
      })
      
      // 如果是人类纪念页，获取语音模型
      if (data.memorial.type === 'HUMAN') {
        await fetchVoiceModel(id)
      }
    } catch (error) {
      console.error('获取纪念页失败:', error)
      toast.error('获取纪念页失败')
      router.push('/settings')
    } finally {
      setLoading(false)
    }
  }

  // 获取语音模型
  const fetchVoiceModel = async (memorialId: string) => {
    try {
      const response = await fetch(`/api/voice-models?memorialId=${memorialId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.voiceModels && data.voiceModels.length > 0) {
          const model = data.voiceModels[0] // 每个纪念页只有一个语音模型
          setVoiceModel(model)
          setVoiceModelForm({
            name: model.name,
            description: model.description || '',
            isPublic: model.isPublic,
            allowPublicUse: model.allowPublicUse,
            maxUsagePerDay: model.maxUsagePerDay
          })
        }
      }
    } catch (error) {
      console.error('获取语音模型失败:', error)
    }
  }

  // 处理音频文件上传
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('audio/')) {
        toast.error(`${file.name} 不是有效的音频文件`)
        return false
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} 文件过大，请选择小于50MB的文件`)
        return false
      }
      return true
    })

    setUploadedAudios(prev => [...prev, ...validFiles])
    event.target.value = '' // 清空input
  }

  // 移除音频文件
  const removeAudio = (index: number) => {
    setUploadedAudios(prev => prev.filter((_, i) => i !== index))
  }

  // 创建语音模型
  const createVoiceModel = async () => {
    if (!memorial || memorial.type !== 'HUMAN') return
    
    if (!voiceModelForm.name.trim()) {
      toast.error('请输入语音模型名称')
      return
    }
    
    if (uploadedAudios.length === 0) {
      toast.error('请上传至少一个音频样本')
      return
    }

    setIsCreatingVoiceModel(true)
    
    try {
      // 转换音频文件为base64
      const audioDataList = await Promise.all(
        uploadedAudios.map(async (audio) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1]
              resolve(base64)
            }
            reader.onerror = reject
            reader.readAsDataURL(audio)
          })
        })
      )
      
      const response = await fetch('/api/voice-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: voiceModelForm.name.trim(),
          description: voiceModelForm.description.trim(),
          memorialId: memorial.id,
          allowPublicUse: voiceModelForm.allowPublicUse,
          audioDataList,
          audioFileNames: uploadedAudios.map(audio => audio.name)
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建语音模型失败')
      }
      
      toast.success('语音模型创建成功！')
      setUploadedAudios([])
      await fetchVoiceModel(memorial.id)
      
    } catch (error: any) {
      console.error('创建语音模型失败:', error)
      toast.error(error.message || '创建语音模型失败')
    } finally {
      setIsCreatingVoiceModel(false)
    }
  }

  // 更新语音模型设置
  const updateVoiceModel = async () => {
    if (!voiceModel) return

    setIsUpdatingVoiceModel(true)
    
    try {
      const response = await fetch(`/api/voice-models/${voiceModel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(voiceModelForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新失败')
      }

      toast.success('语音模型设置已更新')
      await fetchVoiceModel(memorial!.id)
      
    } catch (error: any) {
      console.error('更新语音模型失败:', error)
      toast.error(error.message || '更新失败')
    } finally {
      setIsUpdatingVoiceModel(false)
    }
  }

  // 删除语音模型
  const deleteVoiceModel = async () => {
    if (!voiceModel) return
    
    if (!confirm(`确定要删除语音模型"${voiceModel.name}"吗？此操作不可撤销。`)) {
      return
    }

    try {
      const response = await fetch(`/api/voice-models/${voiceModel.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '删除失败')
      }

      toast.success('语音模型已删除')
      setVoiceModel(null)
      setVoiceModelForm({
        name: '',
        description: '',
        isPublic: false,
        allowPublicUse: false,
        maxUsagePerDay: 50
      })
      
    } catch (error: any) {
      console.error('删除语音模型失败:', error)
      toast.error(error.message || '删除失败')
    }
  }

  const handleSave = async () => {
    if (!memorial) return

    setSaving(true)
    try {
      const resolvedParams = await params
      const response = await fetch(`/api/memorials/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectName: memorial.subjectName,
          subjectType: memorial.subjectType || null,
          birthDate: memorial.birthDate || null,
          deathDate: memorial.deathDate || null,
          age: memorial.age || null,
          breed: memorial.breed || null,
          color: memorial.color || null,
          gender: memorial.gender || null,
          relationship: memorial.relationship || null,
          occupation: memorial.occupation || null,
          location: memorial.location || null,
          story: memorial.story || null,
          memories: memorial.memories || null,
          personalityTraits: memorial.personalityTraits || null,
          favoriteThings: memorial.favoriteThings || null,
          creatorName: memorial.creatorName,
          creatorEmail: memorial.creatorEmail || null,
          creatorPhone: memorial.creatorPhone || null,
          creatorRelation: memorial.creatorRelation || null,
          isPublic: memorial.isPublic
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }

      toast.success('纪念页已保存')
      router.push('/settings?tab=memorials')
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof Memorial, value: any) => {
    if (!memorial) return
    setMemorial({ ...memorial, [field]: value })
  }

  // 自动计算年龄
  const calculateAge = (birthDate: string, deathDate: string) => {
    if (!birthDate || !deathDate) return ''
    
    const birth = new Date(birthDate)
    const death = new Date(deathDate)
    
    if (death < birth) return '日期无效'
    
    const diffTime = death.getTime() - birth.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays}天`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      const remainingDays = diffDays % 30
      return remainingDays > 0 ? `${months}个月${remainingDays}天` : `${months}个月`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingDays = diffDays % 365
      const months = Math.floor(remainingDays / 30)
      
      if (months > 0) {
        return `${years}岁${months}个月`
      } else {
        return `${years}岁`
      }
    }
  }

  // 当出生日期或去世日期改变时自动计算年龄
  useEffect(() => {
    if (memorial?.birthDate && memorial?.deathDate) {
      const age = calculateAge(memorial.birthDate, memorial.deathDate)
      setMemorial(prev => prev ? { ...prev, age } : null)
    }
  }, [memorial?.birthDate, memorial?.deathDate])

  // 处理图片更新回调
  const handleImagesUpdate = (updatedImages: Memorial['images']) => {
    if (!memorial) return
    setMemorial({ ...memorial, images: updatedImages })
  }

  const getPetBreeds = () => {
    const petType = memorial?.subjectType?.toLowerCase()
    
    if (petType === 'dog' || petType === '狗') {
      return [
        { value: 'labrador', label: '拉布拉多' },
        { value: 'golden-retriever', label: '金毛寻回犬' },
        { value: 'german-shepherd', label: '德国牧羊犬' },
        { value: 'bulldog', label: '斗牛犬' },
        { value: 'poodle', label: '贵宾犬' },
        { value: 'husky', label: '哈士奇' },
        { value: 'chihuahua', label: '吉娃娃' },
        { value: 'shiba-inu', label: '柴犬' },
        { value: 'border-collie', label: '边境牧羊犬' },
        { value: 'beagle', label: '比格犬' }
      ]
    } else if (petType === 'cat' || petType === '猫') {
      return [
        { value: 'persian', label: '波斯猫' },
        { value: 'british-shorthair', label: '英国短毛猫' },
        { value: 'siamese', label: '暹罗猫' },
        { value: 'maine-coon', label: '缅因猫' },
        { value: 'ragdoll', label: '布偶猫' },
        { value: 'scottish-fold', label: '苏格兰折耳猫' },
        { value: 'american-shorthair', label: '美国短毛猫' },
        { value: 'bengal', label: '孟加拉猫' },
        { value: 'russian-blue', label: '俄罗斯蓝猫' },
        { value: 'domestic-shorthair', label: '家猫短毛' }
      ]
    }
    return []
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!memorial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">纪念页不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 pt-24">
          <Button
            variant="ghost"
            onClick={() => router.push('/settings?tab=memorials')}
            className="mb-6 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            返回设置
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-light text-slate-900 mb-4">编辑纪念</h1>
            <p className="text-slate-600">修改 {memorial.subjectName} 的纪念页信息</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* 基本信息 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-light text-slate-900 mb-6 flex items-center gap-3">
              基本信息
              {memorial.type === 'PET' ? (
                <span className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded-full">宠物纪念</span>
              ) : (
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">逝者纪念</span>
              )}
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-700 font-medium">姓名 *</Label>
                  <Input
                    value={memorial.subjectName}
                    onChange={(e) => updateField('subjectName', e.target.value)}
                    placeholder="请输入姓名"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-slate-700 font-medium">{memorial.type === 'PET' ? '宠物类型' : '关系'}</Label>
                  {memorial.type === 'PET' ? (
                    <Select value={memorial.subjectType || ''} onValueChange={(value) => updateField('subjectType', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="选择宠物类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">狗</SelectItem>
                        <SelectItem value="cat">猫</SelectItem>
                        <SelectItem value="bird">鸟</SelectItem>
                        <SelectItem value="rabbit">兔子</SelectItem>
                        <SelectItem value="hamster">仓鼠</SelectItem>
                        <SelectItem value="guinea-pig">豚鼠</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={memorial.subjectType || ''}
                      onChange={(e) => updateField('subjectType', e.target.value)}
                      placeholder="如：父亲、母亲"
                      className="mt-2"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-slate-700 font-medium">出生日期</Label>
                  <div className="mt-2">
                    <DatePicker
                      value={memorial.birthDate || ''}
                      onChange={(date) => updateField('birthDate', date)}
                      maxYear={new Date().getFullYear()}
                      minYear={memorial.type === 'PET' ? 1980 : 1900}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-700 font-medium">逝世日期</Label>
                  <div className="mt-2">
                    <DatePicker
                      value={memorial.deathDate || ''}
                      onChange={(date) => updateField('deathDate', date)}
                      maxYear={new Date().getFullYear()}
                      minYear={memorial.type === 'PET' ? 1980 : 1900}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 宠物特有字段 */}
          {memorial.type === 'PET' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-light text-slate-900 mb-6">宠物详情</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-slate-700 font-medium">品种</Label>
                    {getPetBreeds().length > 0 ? (
                      <Select value={memorial.breed || ''} onValueChange={(value) => updateField('breed', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="选择品种" />
                        </SelectTrigger>
                        <SelectContent>
                          {getPetBreeds().map((breed) => (
                            <SelectItem key={breed.value} value={breed.value}>
                              {breed.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={memorial.breed || ''}
                        onChange={(e) => updateField('breed', e.target.value)}
                        placeholder="请输入品种"
                        className="mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">颜色</Label>
                    <Select value={memorial.color || ''} onValueChange={(value) => updateField('color', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="选择颜色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="black">黑色</SelectItem>
                        <SelectItem value="white">白色</SelectItem>
                        <SelectItem value="brown">棕色</SelectItem>
                        <SelectItem value="gray">灰色</SelectItem>
                        <SelectItem value="golden">金色</SelectItem>
                        <SelectItem value="yellow">黄色</SelectItem>
                        <SelectItem value="orange">橙色</SelectItem>
                        <SelectItem value="red">红色</SelectItem>
                        <SelectItem value="cream">奶油色</SelectItem>
                        <SelectItem value="tan">棕褐色</SelectItem>
                        <SelectItem value="silver">银色</SelectItem>
                        <SelectItem value="blue">蓝色</SelectItem>
                        <SelectItem value="chocolate">巧克力色</SelectItem>
                        <SelectItem value="caramel">焦糖色</SelectItem>
                        <SelectItem value="black-white">黑白相间</SelectItem>
                        <SelectItem value="brown-white">棕白相间</SelectItem>
                        <SelectItem value="gray-white">灰白相间</SelectItem>
                        <SelectItem value="tabby">虎斑色</SelectItem>
                        <SelectItem value="tricolor">三色</SelectItem>
                        <SelectItem value="multicolor">多种颜色</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">性别</Label>
                    <Select value={memorial.gender || ''} onValueChange={(value) => updateField('gender', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="选择性别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">雄性</SelectItem>
                        <SelectItem value="female">雌性</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* 宠物的性格特征和最爱活动编辑 */}
                {memorial.type === 'PET' && (
                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-light text-slate-900 mb-4">性格特征与爱好</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-700 font-medium">性格特征</Label>
                        <Input
                          value={memorial.personalityTraits || ''}
                          onChange={(e) => updateField('personalityTraits', e.target.value)}
                          placeholder="如：温柔安静、顽皮活泼"
                          className="mt-2"
                        />
                        <p className="text-sm text-slate-500 mt-1">
                          多个特征请用逗号分隔
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-700 font-medium">最爱活动</Label>
                        <Input
                          value={memorial.favoriteThings || ''}
                          onChange={(e) => updateField('favoriteThings', e.target.value)}
                          placeholder="如：呼噜声、晒太阳"
                          className="mt-2"
                        />
                        <p className="text-sm text-slate-500 mt-1">
                          多个活动请用逗号分隔
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 逝者特有字段 */}
          {memorial.type === 'HUMAN' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-light text-slate-900 mb-6">逝者详情</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-slate-700 font-medium">关系</Label>
                    <Select value={memorial.relationship || ''} onValueChange={(value) => updateField('relationship', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="选择关系" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">父母</SelectItem>
                        <SelectItem value="spouse">配偶</SelectItem>
                        <SelectItem value="child">子女</SelectItem>
                        <SelectItem value="sibling">兄弟姐妹</SelectItem>
                        <SelectItem value="relative">亲戚</SelectItem>
                        <SelectItem value="friend">朋友</SelectItem>
                        <SelectItem value="colleague">同事</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">职业</Label>
                    <Input
                      value={memorial.occupation || ''}
                      onChange={(e) => updateField('occupation', e.target.value)}
                      placeholder="请输入职业"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">祖籍</Label>
                    <Input
                      value={memorial.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="请输入祖籍"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 缅怀故事编辑 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-light text-slate-900 mb-6">缅怀{memorial.subjectName}</h2>
            <div className="space-y-6">
              <div>
                <Label className="text-slate-700 font-medium">
                  {memorial.type === 'PET' ? '成长故事' : '生平故事'}
                </Label>
                <Textarea
                  value={memorial.story || ''}
                  onChange={(e) => updateField('story', e.target.value)}
                  placeholder={
                    memorial.type === 'PET' 
                      ? "分享关于 TA 的成长经历、可爱瞬间、陪伴回忆..."
                      : "分享关于 TA 的生平故事、性格特点、美好回忆..."
                  }
                  rows={8}
                  className="mt-2"
                />
                <p className="text-sm text-slate-500 mt-2">
                  这段内容将在纪念页面的"缅怀{memorial.subjectName}"部分显示
                </p>
              </div>
            </div>
          </div>

          {/* 创建者信息 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-light text-slate-900 mb-6">创建者信息</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-700 font-medium">姓名 *</Label>
                  <Input
                    value={memorial.creatorName}
                    onChange={(e) => updateField('creatorName', e.target.value)}
                    placeholder="请输入您的姓名"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-slate-700 font-medium">邮箱</Label>
                  <Input
                    type="email"
                    value={memorial.creatorEmail || ''}
                    onChange={(e) => updateField('creatorEmail', e.target.value)}
                    placeholder="请输入您的邮箱"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 图片管理 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-light text-slate-900 mb-2">图片管理</h2>
            <p className="text-slate-600 mb-6">管理纪念页的照片（最多10张）</p>
            <ImageManager
              memorialId={memorial.id}
              images={memorial.images}
              onImagesUpdate={handleImagesUpdate}
              maxImages={10}
            />
          </div>

          {/* 语音模型管理 - 仅人类纪念页 */}
          {memorial.type === 'HUMAN' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-light text-slate-900 mb-2 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-600" />
                语音模型管理
              </h2>
              <p className="text-slate-600 mb-6">为纪念页创建语音模型，让其他用户可以使用TA的声音进行语音合成</p>
              
              {voiceModel ? (
                /* 现有语音模型管理 */
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900">{voiceModel.name}</h3>
                        {voiceModel.description && (
                          <p className="text-slate-600 mt-1">{voiceModel.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          <Badge variant={voiceModel.status === 'READY' ? 'default' : 'secondary'}>
                            {voiceModel.status === 'READY' ? '可用' : voiceModel.status}
                          </Badge>
                          {voiceModel.quality && (
                            <Badge variant="outline">
                              质量: {Math.round(voiceModel.quality * 100)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deleteVoiceModel}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">总使用次数:</span>
                        <span className="ml-2 font-medium">{voiceModel.usageCount}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">今日使用:</span>
                        <span className="ml-2 font-medium">
                          {voiceModel.todayUsageCount}/{voiceModel.maxUsagePerDay}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 语音模型设置 */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">模型设置</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="voice-model-name">模型名称</Label>
                        <Input
                          id="voice-model-name"
                          value={voiceModelForm.name}
                          onChange={(e) => setVoiceModelForm({...voiceModelForm, name: e.target.value})}
                          maxLength={50}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="voice-model-max-usage">每日最大使用次数</Label>
                        <Input
                          id="voice-model-max-usage"
                          type="number"
                          min="1"
                          max="1000"
                          value={voiceModelForm.maxUsagePerDay}
                          onChange={(e) => setVoiceModelForm({...voiceModelForm, maxUsagePerDay: parseInt(e.target.value) || 50})}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="voice-model-description">模型描述</Label>
                      <Textarea
                        id="voice-model-description"
                        value={voiceModelForm.description}
                        onChange={(e) => setVoiceModelForm({...voiceModelForm, description: e.target.value})}
                        maxLength={200}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="voice-model-public"
                          checked={voiceModelForm.isPublic}
                          onCheckedChange={(checked) => setVoiceModelForm({...voiceModelForm, isPublic: checked})}
                        />
                        <Label htmlFor="voice-model-public">公开模型（在纪念页面中可见）</Label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="voice-model-allow-use"
                          checked={voiceModelForm.allowPublicUse}
                          onCheckedChange={(checked) => setVoiceModelForm({...voiceModelForm, allowPublicUse: checked})}
                        />
                        <Label htmlFor="voice-model-allow-use">允许其他用户使用</Label>
                      </div>
                    </div>
                    
                    <Button
                      onClick={updateVoiceModel}
                      disabled={isUpdatingVoiceModel}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {isUpdatingVoiceModel ? '更新中...' : '更新设置'}
                    </Button>
                  </div>

                  {/* 更换音频样本 */}
                  <div className="pt-6 border-t border-slate-200">
                    <h4 className="font-medium text-slate-900 mb-4">更换音频样本</h4>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="file"
                          accept="audio/*"
                          multiple
                          onChange={handleAudioUpload}
                          className="hidden"
                          id="audio-replace-upload"
                        />
                        <label
                          htmlFor="audio-replace-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400"
                        >
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-600">点击上传新的音频样本</span>
                          <span className="text-xs text-slate-500 mt-1">支持 MP3、WAV、M4A 等格式，最大50MB</span>
                        </label>
                      </div>

                      {uploadedAudios.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-600 mb-2">新上传的音频样本:</p>
                          <div className="space-y-2">
                            {uploadedAudios.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-slate-900 truncate">{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAudio(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={createVoiceModel}
                            disabled={isCreatingVoiceModel}
                            className="mt-4 bg-purple-600 hover:bg-purple-700"
                          >
                            {isCreatingVoiceModel ? '重新训练中...' : '重新训练模型'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* 创建新语音模型 */
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-voice-model-name">模型名称</Label>
                      <Input
                        id="new-voice-model-name"
                        value={voiceModelForm.name}
                        onChange={(e) => setVoiceModelForm({...voiceModelForm, name: e.target.value})}
                        placeholder={`${memorial.subjectName}的声音`}
                        maxLength={50}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-voice-model-max-usage">每日最大使用次数</Label>
                      <Input
                        id="new-voice-model-max-usage"
                        type="number"
                        min="1"
                        max="1000"
                        value={voiceModelForm.maxUsagePerDay}
                        onChange={(e) => setVoiceModelForm({...voiceModelForm, maxUsagePerDay: parseInt(e.target.value) || 50})}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="new-voice-model-description">模型描述</Label>
                    <Textarea
                      id="new-voice-model-description"
                      value={voiceModelForm.description}
                      onChange={(e) => setVoiceModelForm({...voiceModelForm, description: e.target.value})}
                      placeholder="描述这个语音模型的特点..."
                      maxLength={200}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="new-voice-model-allow-use"
                        checked={voiceModelForm.allowPublicUse}
                        onCheckedChange={(checked) => setVoiceModelForm({...voiceModelForm, allowPublicUse: checked})}
                      />
                      <Label htmlFor="new-voice-model-allow-use">允许其他用户在纪念页面中使用此语音模型</Label>
                    </div>
                  </div>

                  <div>
                    <Label>上传音频样本</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="audio/*"
                        multiple
                        onChange={handleAudioUpload}
                        className="hidden"
                        id="audio-upload"
                      />
                      <label
                        htmlFor="audio-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400"
                      >
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-600">点击上传音频样本</span>
                        <span className="text-xs text-slate-500 mt-1">支持 MP3、WAV、M4A 等格式，最大50MB</span>
                      </label>
                    </div>
                  </div>

                  {uploadedAudios.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-2">已上传的音频样本:</p>
                      <div className="space-y-2">
                        {uploadedAudios.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-900 truncate">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAudio(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 space-y-1">
                    <p>• 建议上传多个清晰的音频样本以获得更好的效果</p>
                    <p>• 音频质量越高，克隆效果越好</p>
                    <p>• 创建后，其他用户可以在纪念页面中使用此声音进行语音合成</p>
                  </div>

                  <Button
                    onClick={createVoiceModel}
                    disabled={isCreatingVoiceModel || !voiceModelForm.name.trim() || uploadedAudios.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {isCreatingVoiceModel ? '创建中...' : '创建语音模型'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 设置 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-light text-slate-900 mb-6">纪念页设置</h2>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="isPublic"
                checked={memorial.isPublic}
                onCheckedChange={(checked) => updateField('isPublic', checked)}
              />
              <Label htmlFor="isPublic" className="text-slate-700 font-medium">公开显示在社区中</Label>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-6 py-8">
            <Button
              variant="outline"
              onClick={() => router.push('/settings?tab=memorials')}
              className="px-8 py-3 border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !memorial.subjectName || !memorial.creatorName}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '保存更改'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}