"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PetInformationStep } from "@/components/create-obituary/pet-information-step"
import { TellTheirStoryStep } from "@/components/create-obituary/tell-their-story-step"
import { YourInformationStep } from "@/components/create-obituary/your-information-step"

export default function CreateObituaryPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Pet Information
    petName: "",
    petType: "",
    breed: "",
    color: "",
    gender: "",
    birthDate: "",
    passingDate: "",
    mainPhoto: null as File | null,
    additionalPhotos: [] as File[],

    // Tell Their Story
    writingMethod: "", // "ai" or "self"
    personalityTraits: [] as string[],
    activities: [] as string[],
    specialMemory: "",
    aiGeneratedObituary: "",
    selfWrittenObituary: "",

    // Your Information (would be added in step 3)
    ownerName: "",
    ownerEmail: "",
  })

  // 恢复保存的表单数据
  useEffect(() => {
    const savedData = sessionStorage.getItem('memorialFormData')
    const savedStep = sessionStorage.getItem('memorialFormStep')
    const savedType = sessionStorage.getItem('memorialFormType')
    
    if (savedData && savedType === 'pet') {
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
    { number: 1, title: "宠物信息", active: currentStep === 1, completed: currentStep > 1 },
    { number: 2, title: "讲述它们的故事", active: currentStep === 2, completed: currentStep > 2 },
    { number: 3, title: "您的信息", active: currentStep === 3, completed: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      <Navigation currentPage="create" />

      {/* 极简进度指示器 */}
      <main className="pt-32">
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light text-slate-900 mb-4">创建纪念</h1>
            <p className="text-slate-600">步骤 {currentStep} / 3</p>
          </div>
          
          <div className="flex items-center justify-center mb-12">
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
        </section>

        {/* 表单内容区域 */}
        <section className="max-w-4xl mx-auto px-6">
          {currentStep === 1 && (
            <PetInformationStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
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
