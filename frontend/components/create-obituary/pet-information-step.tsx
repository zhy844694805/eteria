"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Camera, X } from "lucide-react"

interface PetInformationStepProps {
  formData: any
  updateFormData: (updates: any) => void
  onNext: () => void
}

export function PetInformationStep({ formData, updateFormData, onNext }: PetInformationStepProps) {
  const [mainPhotoPreview, setMainPhotoPreview] = useState<string | null>(null)
  const [additionalPhotos, setAdditionalPhotos] = useState<Array<{id: string, file: File, preview: string}>>([])
  const [isDragOver, setIsDragOver] = useState(false)

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
    if (formData.birthDate && formData.passingDate) {
      const age = calculateAge(formData.birthDate, formData.passingDate)
      updateFormData({ calculatedAge: age })
    }
  }, [formData.birthDate, formData.passingDate])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const validateFile = (file: File): string | null => {
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!acceptedTypes.includes(file.type)) {
      return '不支持的文件类型。支持：JPG, PNG, GIF, WebP'
    }
    if (file.size > 5 * 1024 * 1024) {
      return '文件大小超过限制（最大 5MB）'
    }
    return null
  }

  const handleMainPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const error = validateFile(file)
      if (error) {
        alert(error)
        return
      }
      
      updateFormData({ mainPhoto: file })
      const reader = new FileReader()
      reader.onload = (e) => setMainPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalPhotosUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newPhotos: Array<{id: string, file: File, preview: string}> = []
    const errors: string[] = []

    Array.from(files).forEach(file => {
      if (additionalPhotos.length + newPhotos.length >= 9) {
        errors.push('最多只能上传 9 张额外照片')
        return
      }

      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const photo = {
          id: generateId(),
          file,
          preview: e.target?.result as string
        }
        newPhotos.push(photo)
        
        if (newPhotos.length === Array.from(files).filter(f => !validateFile(f)).length) {
          setAdditionalPhotos(prev => [...prev, ...newPhotos])
          updateFormData({ additionalPhotos: [...(formData.additionalPhotos || []), ...newPhotos.map(p => p.file)] })
        }
      }
      reader.readAsDataURL(file)
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }
  }

  const removeAdditionalPhoto = (id: string) => {
    const updatedPhotos = additionalPhotos.filter(photo => photo.id !== id)
    setAdditionalPhotos(updatedPhotos)
    updateFormData({ additionalPhotos: updatedPhotos.map(p => p.file) })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length === 1 && !mainPhotoPreview) {
      // 如果只有一个文件且没有主图，设为主图
      const mockEvent = { target: { files } } as any
      handleMainPhotoUpload(mockEvent)
    } else {
      // 否则作为额外照片
      const mockEvent = { target: { files } } as any
      handleAdditionalPhotosUpload(mockEvent)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const canProceed =
    formData.petName &&
    formData.petType &&
    formData.color &&
    formData.gender &&
    formData.birthDate &&
    formData.passingDate

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">创建免费宠物悼念页</h1>
        <p className="text-gray-600 text-sm sm:text-base">用永久存在的美丽纪念向您心爱的宠物致敬</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Pet Name and Type - 响应式网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              宠物名字 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="输入您宠物的名字"
              value={formData.petName}
              onChange={(e) => updateFormData({ petName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              宠物类型 <span className="text-red-500">*</span>
            </label>
            <Select value={formData.petType} onValueChange={(value) => updateFormData({ petType: value })}>
              <SelectTrigger>
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
          </div>
        </div>

        {/* Breed, Color, Gender - 响应式网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">品种</label>
            <Select value={formData.breed} onValueChange={(value) => updateFormData({ breed: value })}>
              <SelectTrigger>
                <SelectValue placeholder={formData.petType ? "选择品种" : "请先选择宠物类型"} />
              </SelectTrigger>
              <SelectContent>
                {formData.petType === 'dog' && (
                  <>
                    <SelectItem value="labrador">拉布拉多</SelectItem>
                    <SelectItem value="golden-retriever">金毛寻回犬</SelectItem>
                    <SelectItem value="german-shepherd">德国牧羊犬</SelectItem>
                    <SelectItem value="bulldog">斗牛犬</SelectItem>
                    <SelectItem value="poodle">贵宾犬</SelectItem>
                    <SelectItem value="husky">哈士奇</SelectItem>
                    <SelectItem value="chihuahua">吉娃娃</SelectItem>
                    <SelectItem value="shiba-inu">柴犬</SelectItem>
                    <SelectItem value="corgi">柯基</SelectItem>
                    <SelectItem value="beagle">比格犬</SelectItem>
                    <SelectItem value="border-collie">边境牧羊犬</SelectItem>
                    <SelectItem value="rottweiler">罗威纳</SelectItem>
                    <SelectItem value="yorkshire-terrier">约克夏梗</SelectItem>
                    <SelectItem value="dachshund">腊肠犬</SelectItem>
                    <SelectItem value="boxer">拳师犬</SelectItem>
                    <SelectItem value="australian-shepherd">澳洲牧羊犬</SelectItem>
                    <SelectItem value="siberian-husky">西伯利亚雪橇犬</SelectItem>
                    <SelectItem value="great-dane">大丹犬</SelectItem>
                    <SelectItem value="pomeranian">博美</SelectItem>
                    <SelectItem value="shih-tzu">西施犬</SelectItem>
                    <SelectItem value="boston-terrier">波士顿梗</SelectItem>
                    <SelectItem value="bernese-mountain-dog">伯恩山犬</SelectItem>
                    <SelectItem value="french-bulldog">法国斗牛犬</SelectItem>
                    <SelectItem value="cocker-spaniel">可卡犬</SelectItem>
                    <SelectItem value="maltese">马尔济斯</SelectItem>
                    <SelectItem value="mixed-breed-dog">混种犬</SelectItem>
                    <SelectItem value="other-dog">其他犬种</SelectItem>
                  </>
                )}
                {formData.petType === 'cat' && (
                  <>
                    <SelectItem value="persian">波斯猫</SelectItem>
                    <SelectItem value="maine-coon">缅因猫</SelectItem>
                    <SelectItem value="siamese">暹罗猫</SelectItem>
                    <SelectItem value="ragdoll">布偶猫</SelectItem>
                    <SelectItem value="british-shorthair">英国短毛猫</SelectItem>
                    <SelectItem value="american-shorthair">美国短毛猫</SelectItem>
                    <SelectItem value="scottish-fold">苏格兰折耳猫</SelectItem>
                    <SelectItem value="russian-blue">俄罗斯蓝猫</SelectItem>
                    <SelectItem value="bengal">孟加拉猫</SelectItem>
                    <SelectItem value="abyssinian">阿比西尼亚猫</SelectItem>
                    <SelectItem value="birman">伯曼猫</SelectItem>
                    <SelectItem value="exotic-shorthair">异国短毛猫</SelectItem>
                    <SelectItem value="norwegian-forest">挪威森林猫</SelectItem>
                    <SelectItem value="sphynx">斯芬克斯猫</SelectItem>
                    <SelectItem value="oriental-shorthair">东方短毛猫</SelectItem>
                    <SelectItem value="devon-rex">德文卷毛猫</SelectItem>
                    <SelectItem value="turkish-angora">土耳其安哥拉猫</SelectItem>
                    <SelectItem value="munchkin">曼基康猫</SelectItem>
                    <SelectItem value="domestic-shorthair">家养短毛猫</SelectItem>
                    <SelectItem value="domestic-longhair">家养长毛猫</SelectItem>
                    <SelectItem value="mixed-breed-cat">混种猫</SelectItem>
                    <SelectItem value="other-cat">其他猫种</SelectItem>
                  </>
                )}
                {formData.petType === 'bird' && (
                  <>
                    <SelectItem value="canary">金丝雀</SelectItem>
                    <SelectItem value="budgerigar">虎皮鹦鹉</SelectItem>
                    <SelectItem value="cockatiel">玄凤鹦鹉</SelectItem>
                    <SelectItem value="lovebird">爱情鸟</SelectItem>
                    <SelectItem value="macaw">金刚鹦鹉</SelectItem>
                    <SelectItem value="african-grey">非洲灰鹦鹉</SelectItem>
                    <SelectItem value="cockatoo">凤头鹦鹉</SelectItem>
                    <SelectItem value="conure">锥尾鹦鹉</SelectItem>
                    <SelectItem value="finch">雀</SelectItem>
                    <SelectItem value="parakeet">长尾小鹦鹉</SelectItem>
                    <SelectItem value="other-bird">其他鸟类</SelectItem>
                  </>
                )}
                {formData.petType === 'rabbit' && (
                  <>
                    <SelectItem value="holland-lop">荷兰垂耳兔</SelectItem>
                    <SelectItem value="netherland-dwarf">荷兰侏儒兔</SelectItem>
                    <SelectItem value="mini-rex">迷你雷克斯兔</SelectItem>
                    <SelectItem value="lionhead">狮子头兔</SelectItem>
                    <SelectItem value="angora">安哥拉兔</SelectItem>
                    <SelectItem value="flemish-giant">弗兰德巨兔</SelectItem>
                    <SelectItem value="english-lop">英国垂耳兔</SelectItem>
                    <SelectItem value="rex">雷克斯兔</SelectItem>
                    <SelectItem value="himalayan">喜马拉雅兔</SelectItem>
                    <SelectItem value="other-rabbit">其他兔种</SelectItem>
                  </>
                )}
                {formData.petType === 'hamster' && (
                  <>
                    <SelectItem value="syrian-hamster">叙利亚仓鼠</SelectItem>
                    <SelectItem value="dwarf-hamster">侏儒仓鼠</SelectItem>
                    <SelectItem value="chinese-hamster">中国仓鼠</SelectItem>
                    <SelectItem value="roborovski-hamster">罗伯罗夫斯基仓鼠</SelectItem>
                    <SelectItem value="winter-white-hamster">冬白仓鼠</SelectItem>
                    <SelectItem value="other-hamster">其他仓鼠</SelectItem>
                  </>
                )}
                {formData.petType === 'guinea-pig' && (
                  <>
                    <SelectItem value="american-guinea-pig">美国豚鼠</SelectItem>
                    <SelectItem value="peruvian-guinea-pig">秘鲁豚鼠</SelectItem>
                    <SelectItem value="abyssinian-guinea-pig">阿比西尼亚豚鼠</SelectItem>
                    <SelectItem value="silkie-guinea-pig">丝毛豚鼠</SelectItem>
                    <SelectItem value="texel-guinea-pig">特塞尔豚鼠</SelectItem>
                    <SelectItem value="skinny-pig">无毛豚鼠</SelectItem>
                    <SelectItem value="other-guinea-pig">其他豚鼠</SelectItem>
                  </>
                )}
                {formData.petType === 'other' && (
                  <>
                    <SelectItem value="turtle">龟</SelectItem>
                    <SelectItem value="snake">蛇</SelectItem>
                    <SelectItem value="lizard">蜥蜴</SelectItem>
                    <SelectItem value="fish">鱼</SelectItem>
                    <SelectItem value="ferret">雪貂</SelectItem>
                    <SelectItem value="hedgehog">刺猬</SelectItem>
                    <SelectItem value="chinchilla">龙猫</SelectItem>
                    <SelectItem value="sugar-glider">蜜袋鼯</SelectItem>
                    <SelectItem value="other-pet">其他宠物</SelectItem>
                  </>
                )}
                {!formData.petType && (
                  <SelectItem value="no-type" disabled>请先选择宠物类型</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              颜色 <span className="text-red-500">*</span>
            </label>
            <Select value={formData.color} onValueChange={(value) => updateFormData({ color: value })}>
              <SelectTrigger>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              性别 <span className="text-red-500">*</span>
            </label>
            <Select value={formData.gender} onValueChange={(value) => updateFormData({ gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="选择性别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">雄性</SelectItem>
                <SelectItem value="female">雌性</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Birth and Passing Dates - 响应式网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出生日期 <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={formData.birthDate}
              onChange={(date) => updateFormData({ birthDate: date })}
              maxYear={new Date().getFullYear()}
              minYear={1980}
            />
            <p className="text-xs text-gray-500 mt-1">大概日期即可</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              去世日期 <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={formData.passingDate}
              onChange={(date) => updateFormData({ passingDate: date })}
              maxYear={new Date().getFullYear()}
              minYear={1980}
            />
          </div>
        </div>

        {/* Pet Photos - 移动端优化 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            宠物照片 <span className="text-red-500">*</span>
            <span className="text-gray-500 font-normal text-xs sm:text-sm"> (需要主照片，最多10张)</span>
          </label>

          {/* Main Photo Upload - 改进的移动端界面 */}
          <div 
            className={`border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center mb-4 transition-all duration-200 ${
              isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {mainPhotoPreview ? (
              <div className="relative">
                <img
                  src={mainPhotoPreview}
                  alt="主照片预览"
                  className="max-h-32 sm:max-h-48 mx-auto rounded-xl shadow-sm"
                />
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  主图
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-xs sm:text-sm"
                    onClick={() => document.getElementById("main-photo-input")?.click()}
                  >
                    更换照片
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-xs sm:text-sm"
                    onClick={() => {
                      setMainPhotoPreview(null)
                      updateFormData({ mainPhoto: null })
                    }}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Plus className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 mb-2 text-sm sm:text-base">上传您宠物的主照片</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  支持 JPG、PNG、GIF、WebP，最大 5MB
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-teal-50 border-teal-300 text-teal-700 hover:bg-teal-100 text-xs sm:text-sm"
                    onClick={() => document.getElementById("main-photo-input")?.click()}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    选择照片
                  </Button>
                  
                  {/* 移动端摄像头按钮 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-teal-50 border-teal-300 text-teal-700 hover:bg-teal-100 text-xs sm:text-sm sm:hidden"
                    onClick={() => {
                      const input = document.getElementById("main-photo-input") as HTMLInputElement
                      if (input) {
                        input.setAttribute('capture', 'environment')
                        input.click()
                      }
                    }}
                  >
                    <Camera className="w-3 h-3 mr-1" />
                    拍照
                  </Button>
                </div>
              </div>
            )}
            <input
              id="main-photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMainPhotoUpload}
            />
          </div>

          {/* Additional Photos Grid - 移动端优化 */}
          {additionalPhotos.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">额外照片 ({additionalPhotos.length}/9)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {additionalPhotos.map((photo, index) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                      <img
                        src={photo.preview}
                        alt={`额外照片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeAdditionalPhoto(photo.id)}
                        className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <X className="w-2 h-2 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add More Photos Button */}
          {additionalPhotos.length < 9 && (
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm"
                onClick={() => document.getElementById("additional-photos-input")?.click()}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                添加更多照片 ({additionalPhotos.length}/9)
              </Button>
              <input
                id="additional-photos-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleAdditionalPhotosUpload}
              />
            </div>
          )}

          {/* 使用提示 */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>• 第一张图片将作为主图显示在纪念页面上</p>
            <p>• 支持拖拽上传（桌面端）</p>
            <p className="sm:hidden">• 点击"拍照"按钮可直接使用摄像头</p>
          </div>
        </div>


        {/* Next Button - 移动端优化 */}
        <div className="flex justify-end pt-4 sm:pt-6">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="bg-teal-400 hover:bg-teal-500 text-white px-6 sm:px-8 py-2 sm:py-2 rounded-full text-sm sm:text-base w-full sm:w-auto"
          >
            下一步
          </Button>
        </div>
      </div>
    </div>
  )
}
