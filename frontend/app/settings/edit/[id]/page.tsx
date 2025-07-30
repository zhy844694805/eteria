'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { databaseAuthService } from '@/lib/auth-db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeftIcon, SaveIcon, Upload, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

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
  }>
}

interface EditMemorialPageProps {
  params: { id: string }
}

export default function EditMemorialPage({ params }: EditMemorialPageProps) {
  const [user, setUser] = useState(databaseAuthService.getCurrentUser())
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchMemorial()
  }, [user, router, params.id])

  const fetchMemorial = async () => {
    try {
      const response = await fetch(`/api/memorials/${params.id}`)
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
      const response = await fetch(`/api/memorials/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectName: memorial.subjectName,
          subjectType: memorial.subjectType,
          birthDate: memorial.birthDate || null,
          deathDate: memorial.deathDate || null,
          age: memorial.age,
          breed: memorial.breed,
          color: memorial.color,
          gender: memorial.gender,
          relationship: memorial.relationship,
          occupation: memorial.occupation,
          location: memorial.location,
          story: memorial.story,
          memories: memorial.memories,
          personalityTraits: memorial.personalityTraits,
          favoriteThings: memorial.favoriteThings,
          creatorName: memorial.creatorName,
          creatorEmail: memorial.creatorEmail,
          creatorPhone: memorial.creatorPhone,
          creatorRelation: memorial.creatorRelation,
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

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // 限制最多10张图片
    const totalImages = (memorial?.images?.length || 0) + imageFiles.length + files.length
    if (totalImages > 10) {
      toast.error('最多只能上传10张图片')
      return
    }

    setImageFiles(prev => [...prev, ...files])
    
    // 生成预览
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  // 删除现有图片
  const removeExistingImage = (imageId: string) => {
    if (!memorial) return
    const updatedImages = memorial.images.filter(img => img.id !== imageId)
    setMemorial({ ...memorial, images: updatedImages })
  }

  // 删除新上传的图片
  const removeNewImage = (index: number) => {
    const newImageFiles = [...imageFiles]
    const newImagePreviews = [...imagePreviews]
    newImageFiles.splice(index, 1)
    newImagePreviews.splice(index, 1)
    setImageFiles(newImageFiles)
    setImagePreviews(newImagePreviews)
  }

  // 设置主图片
  const setMainImage = (imageId: string, isExisting: boolean) => {
    if (!memorial) return
    if (isExisting) {
      const updatedImages = memorial.images.map(img => ({
        ...img,
        isMain: img.id === imageId
      }))
      setMemorial({ ...memorial, images: updatedImages })
    }
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
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!memorial) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">纪念页不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/settings?tab=memorials')}
            className="mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            返回设置
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">编辑纪念页</h1>
          <p className="text-gray-600">修改 {memorial.subjectName} 的纪念页信息</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                基本信息
                {memorial.type === 'PET' ? (
                  <span className="text-sm bg-teal-100 text-teal-700 px-2 py-1 rounded">宠物纪念</span>
                ) : (
                  <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">逝者纪念</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>姓名 *</Label>
                  <Input
                    value={memorial.subjectName}
                    onChange={(e) => updateField('subjectName', e.target.value)}
                    placeholder="请输入姓名"
                  />
                </div>
                <div>
                  <Label>{memorial.type === 'PET' ? '宠物类型' : '关系'}</Label>
                  <Input
                    value={memorial.subjectType || ''}
                    onChange={(e) => updateField('subjectType', e.target.value)}
                    placeholder={memorial.type === 'PET' ? '如：狗、猫' : '如：父亲、母亲'}
                  />
                </div>
                <div>
                  <Label>出生日期</Label>
                  <Input
                    type="date"
                    value={memorial.birthDate || ''}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>逝世日期</Label>
                  <Input
                    type="date"
                    value={memorial.deathDate || ''}
                    onChange={(e) => updateField('deathDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 宠物特有字段 */}
          {memorial.type === 'PET' && (
            <Card>
              <CardHeader>
                <CardTitle>宠物详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>品种</Label>
                    {getPetBreeds().length > 0 ? (
                      <Select value={memorial.breed || ''} onValueChange={(value) => updateField('breed', value)}>
                        <SelectTrigger>
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
                      />
                    )}
                  </div>
                  <div>
                    <Label>颜色</Label>
                    <Input
                      value={memorial.color || ''}
                      onChange={(e) => updateField('color', e.target.value)}
                      placeholder="如：黑色、白色"
                    />
                  </div>
                  <div>
                    <Label>性别</Label>
                    <Select value={memorial.gender || ''} onValueChange={(value) => updateField('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择性别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">雄性/公</SelectItem>
                        <SelectItem value="female">雌性/母</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 逝者特有字段 */}
          {memorial.type === 'HUMAN' && (
            <Card>
              <CardHeader>
                <CardTitle>逝者详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>关系</Label>
                    <Select value={memorial.relationship || ''} onValueChange={(value) => updateField('relationship', value)}>
                      <SelectTrigger>
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
                    <Label>职业</Label>
                    <Input
                      value={memorial.occupation || ''}
                      onChange={(e) => updateField('occupation', e.target.value)}
                      placeholder="请输入职业"
                    />
                  </div>
                  <div>
                    <Label>地点</Label>
                    <Input
                      value={memorial.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="请输入地点"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


          {/* 创建者信息 */}
          <Card>
            <CardHeader>
              <CardTitle>创建者信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>姓名 *</Label>
                  <Input
                    value={memorial.creatorName}
                    onChange={(e) => updateField('creatorName', e.target.value)}
                    placeholder="请输入您的姓名"
                  />
                </div>
                <div>
                  <Label>邮箱</Label>
                  <Input
                    type="email"
                    value={memorial.creatorEmail || ''}
                    onChange={(e) => updateField('creatorEmail', e.target.value)}
                    placeholder="请输入您的邮箱"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 图片管理 */}
          <Card>
            <CardHeader>
              <CardTitle>图片管理</CardTitle>
              <CardDescription>管理纪念页的照片（最多10张）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 现有图片 */}
              {memorial.images && memorial.images.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">现有图片</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {memorial.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <Image
                          src={image.url}
                          alt="纪念照片"
                          width={200}
                          height={200}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {image.isMain && (
                          <div className="absolute top-2 left-2 bg-teal-500 text-white text-xs px-2 py-1 rounded">
                            主图
                          </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeExistingImage(image.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        {!image.isMain && (
                          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => setMainImage(image.id, true)}
                            >
                              设为主图
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 新上传图片预览 */}
              {imagePreviews.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">新上传图片</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={preview}
                          alt="新图片预览"
                          width={200}
                          height={200}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeNewImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          新增
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 上传按钮 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">添加更多照片</p>
                <p className="text-sm text-gray-500 mb-4">
                  当前图片数量: {(memorial.images?.length || 0) + imageFiles.length}/10
                </p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image-upload-input')?.click()}
                  disabled={(memorial.images?.length || 0) + imageFiles.length >= 10}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  选择图片
                </Button>
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </CardContent>
          </Card>

          {/* 设置 */}
          <Card>
            <CardHeader>
              <CardTitle>纪念页设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={memorial.isPublic}
                  onCheckedChange={(checked) => updateField('isPublic', checked)}
                />
                <Label htmlFor="isPublic">公开显示在社区中</Label>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-4 py-6">
            <Button
              variant="outline"
              onClick={() => router.push('/settings?tab=memorials')}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !memorial.subjectName || !memorial.creatorName}
              className="bg-teal-400 hover:bg-teal-500 text-white"
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