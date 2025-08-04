"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus } from "lucide-react"

interface PersonInformationStepProps {
  formData: any
  updateFormData: (updates: any) => void
  onNext: () => void
}

export function PersonInformationStep({ formData, updateFormData, onNext }: PersonInformationStepProps) {
  const [mainPhotoPreview, setMainPhotoPreview] = useState<string | null>(null)

  // Calculate age automatically when birth date and passing date change
  useEffect(() => {
    if (formData.birthDate && formData.passingDate) {
      const birthDate = new Date(formData.birthDate)
      const passingDate = new Date(formData.passingDate)
      
      let age = passingDate.getFullYear() - birthDate.getFullYear()
      const monthDiff = passingDate.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && passingDate.getDate() < birthDate.getDate())) {
        age--
      }
      
      // Only update if age has actually changed to prevent infinite loops
      if (formData.age !== age.toString()) {
        updateFormData({ age: age.toString() })
      }
    }
  }, [formData.birthDate, formData.passingDate])

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
    formData.personName &&
    formData.relationship &&
    formData.birthDate &&
    formData.passingDate

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">创建免费纪念页</h1>
        <p className="text-gray-600 text-sm sm:text-base">用永久存在的美丽纪念向逝去的亲人致敬</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Person Name and Relationship - 响应式网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              姓名 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="输入逝者的姓名"
              value={formData.personName}
              onChange={(e) => updateFormData({ personName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              与您的关系 <span className="text-red-500">*</span>
            </label>
            <Select value={formData.relationship} onValueChange={(value) => updateFormData({ relationship: value })}>
              <SelectTrigger>
                <SelectValue placeholder="选择与您的关系" />
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
              minYear={1900}
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
              minYear={1900}
            />
          </div>
        </div>

        {/* Pet Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            纪念照片 <span className="text-red-500">*</span>
            <span className="text-gray-500 font-normal"> (需要主照片，最多10张)</span>
          </label>

          {/* Main Photo Upload - 移动端优化 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 lg:p-8 text-center mb-4">
            {mainPhotoPreview ? (
              <div className="relative">
                <img
                  src={mainPhotoPreview || "/placeholder.svg"}
                  alt="主照片预览"
                  className="max-h-32 sm:max-h-48 mx-auto rounded-lg"
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
                <Plus className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 mb-2 text-sm sm:text-base">上传主纪念照片</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">PNG、JPG、GIF 最大 5MB（自动优化）</p>
                <Button
                  variant="outline"
                  className="bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200 text-sm sm:text-base"
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
              最多添加9张额外照片，为纪念页面创建美丽的照片廊
            </p>
          </div>
        </div>

        {/* Next Button - 移动端优化 */}
        <div className="flex justify-end pt-4 sm:pt-6">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="bg-purple-400 hover:bg-purple-500 text-white px-6 sm:px-8 py-2 sm:py-2 rounded-full text-sm sm:text-base w-full sm:w-auto"
          >
            下一步
          </Button>
        </div>
      </div>
    </div>
  )
}
