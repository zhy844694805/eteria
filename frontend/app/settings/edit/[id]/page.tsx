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
import { ArrowLeftIcon, SaveIcon } from 'lucide-react'
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

interface EditMemorialPageProps {
  params: Promise<{ id: string }>
}

export default function EditMemorialPage({ params }: EditMemorialPageProps) {
  const { user } = useAuth()
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

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
    } catch (error) {
      console.error('获取纪念页失败:', error)
      toast.error('获取纪念页失败')
      router.push('/settings')
    } finally {
      setLoading(false)
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
                        <SelectItem value="black-white">黑白色</SelectItem>
                        <SelectItem value="brown-white">棕白色</SelectItem>
                        <SelectItem value="multicolor">多色</SelectItem>
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
                    <Label className="text-slate-700 font-medium">地点</Label>
                    <Input
                      value={memorial.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="请输入地点"
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