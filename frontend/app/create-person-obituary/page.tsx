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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <Navigation currentPage="create" />

      {/* Progress Steps */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.completed
                        ? "bg-purple-400 text-white"
                        : step.active
                          ? "bg-purple-400 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${step.active ? "text-gray-800" : "text-gray-500"}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${step.completed ? "bg-purple-400" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
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
        </div>
      </section>

      {/* Support Mission */}
      <section className="px-4 py-12 bg-purple-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">⭐</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">支持我们的使命</h3>
              <p className="text-gray-600 text-sm">
                每个生命都值得被永远纪念。您的支持帮助我们为全世界的家庭免费提供纪念服务。
              </p>
            </div>
          </div>
          <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full flex items-center gap-2">
            ❤️ 进行捐赠
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
