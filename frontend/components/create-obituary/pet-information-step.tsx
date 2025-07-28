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
            <Input
              placeholder="请先选择宠物类型"
              value={formData.breed}
              onChange={(e) => updateFormData({ breed: e.target.value })}
            />
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
