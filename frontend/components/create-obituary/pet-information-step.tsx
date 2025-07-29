"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface PetInformationStepProps {
  formData: any
  updateFormData: (updates: any) => void
  onNext: () => void
}

export function PetInformationStep({ formData, updateFormData, onNext }: PetInformationStepProps) {
  const [mainPhotoPreview, setMainPhotoPreview] = useState<string | null>(null)

  const handleMainPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      updateFormData({ mainPhoto: file })
      const reader = new FileReader()
      reader.onload = (e) => setMainPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const canProceed =
    formData.petName &&
    formData.petType &&
    formData.color &&
    formData.gender &&
    formData.birthDate &&
    formData.passingDate

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">创建免费宠物悼念页</h1>
        <p className="text-gray-600">用永久存在的美丽纪念向您心爱的宠物致敬</p>
      </div>

      <div className="space-y-6">
        {/* Pet Name and Type */}
        <div className="grid md:grid-cols-2 gap-6">
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

        {/* Breed, Color, Gender */}
        <div className="grid md:grid-cols-3 gap-6">
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

        {/* Birth and Passing Dates */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出生日期 <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateFormData({ birthDate: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">大概日期即可</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              去世日期 <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.passingDate}
              onChange={(e) => updateFormData({ passingDate: e.target.value })}
            />
          </div>
        </div>

        {/* Pet Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            宠物照片 <span className="text-red-500">*</span>
            <span className="text-gray-500 font-normal"> (需要主照片，最多10张)</span>
          </label>

          {/* Main Photo Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            {mainPhotoPreview ? (
              <div className="relative">
                <img
                  src={mainPhotoPreview || "/placeholder.svg"}
                  alt="主照片预览"
                  className="max-h-48 mx-auto rounded-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-transparent"
                  onClick={() => document.getElementById("main-photo-input")?.click()}
                >
                  更换照片
                </Button>
              </div>
            ) : (
              <div>
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">上传您宠物的主照片</p>
                <p className="text-sm text-gray-500 mb-4">PNG、JPG、GIF 最大 5MB（自动优化）</p>
                <Button
                  variant="outline"
                  className="bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200"
                  onClick={() => document.getElementById("main-photo-input")?.click()}
                >
                  选择主照片
                </Button>
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

          {/* Additional Photos */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">额外照片 (0/9)</span>
              <Button variant="outline" size="sm">
                + 添加更多照片
              </Button>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span>⚠️</span>
              最多添加9张额外照片，为您宠物的悼念页创建美丽的照片廊
            </p>
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-2 rounded-full"
          >
            下一步
          </Button>
        </div>
      </div>
    </div>
  )
}
