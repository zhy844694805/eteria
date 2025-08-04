"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PersonInformationStep } from "@/components/create-person-obituary/person-information-step"
import { TellTheirStoryStep } from "@/components/create-person-obituary/tell-their-story-step"
import { YourInformationStep } from "@/components/create-obituary/your-information-step"

export default function CreateObituaryPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Information
    personName: "",
    relationship: "", // 关系：父亲、母亲、配偶、子女、朋友等
    age: "",
    occupation: "",
    location: "",
    birthDate: "",
    passingDate: "",
    mainPhoto: null as File | null,
    additionalPhotos: [] as File[],

    // Life Story
    writingMethod: "", // "ai" or "self"
    personalityTraits: [] as string[],
    achievements: [] as string[],
    hobbies: [] as string[],
    specialMemory: "",
    aiGeneratedObituary: "",

    // Memorial Creator Information
    creatorName: "",
    creatorEmail: "",
    creatorRelationship: "", // 与逗者的关系
  })

  // 恢复保存的表单数据
  useEffect(() => {
    const savedData = sessionStorage.getItem('memorialFormData')
    const savedStep = sessionStorage.getItem('memorialFormStep')
    const savedType = sessionStorage.getItem('memorialFormType')
    
    if (savedData && savedType === 'person') {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(prev => ({ ...prev, ...parsedData }))
        
        if (savedStep) {
          setCurrentStep(parseInt(savedStep))
        }
        
        // 清除保存的数据
        sessionStorage.removeItem('memorialFormData')
        sessionStorage.removeItem('memorialFormStep')
        sessionStorage.removeItem('memorialFormType')
      } catch (error) {
        console.error('恢复表单数据失败:', error)
      }
    }
  }, [])

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    { number: 1, title: "基本信息", active: currentStep === 1, completed: currentStep > 1 },
    { number: 2, title: "生平故事", active: currentStep === 2, completed: currentStep > 2 },
    { number: 3, title: "缅怀人信息", active: currentStep === 3, completed: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      <Navigation currentPage="create" />

      {/* 响应式进度指示器 */}
      <main className="pt-20 lg:pt-32">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-8 sm:pb-16">
          <div className="text-center mb-8 sm:mb-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 mb-2 sm:mb-4">创建纪念</h1>
            <p className="text-slate-600 text-sm sm:text-base">步骤 {currentStep} / 3</p>
          </div>
          
          {/* 桌面端进度指示器 */}
          <div className="hidden sm:flex items-center justify-center mb-12">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-medium ${
                      step.completed || step.active
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className={`ml-3 text-sm ${step.active ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-6 ${step.completed ? "bg-slate-900" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* 移动端进度指示器 */}
          <div className="sm:hidden mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium mb-2 ${
                        step.completed || step.active
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {step.number}
                    </div>
                    <span className={`text-xs text-center leading-tight ${step.active ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute top-4 left-1/2 transform translate-x-4 w-8 h-px bg-slate-200" />
                  )}
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="h-1 bg-slate-200 rounded-full">
                <div 
                  className="h-1 bg-slate-900 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 表单内容区域 - 响应式 */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          {currentStep === 1 && (
            <PersonInformationStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
          )}
          {currentStep === 2 && (
            <TellTheirStoryStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && (
            <YourInformationStep formData={formData} updateFormData={updateFormData} onBack={prevStep} />
          )}
        </section>

      </main>

      <Footer />
    </div>
  )
}
