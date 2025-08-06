"use client"

import { useState, useEffect } from "react"
import { ImmersiveForm } from "@/components/create-obituary/immersive-form"

export default function CreateObituaryPage() {
  const [initialData, setInitialData] = useState(null)

  // 恢复保存的表单数据
  useEffect(() => {
    const savedData = sessionStorage.getItem('memorialFormData')
    const savedType = sessionStorage.getItem('memorialFormType')
    
    if (savedData && savedType === 'pet') {
      try {
        const parsedData = JSON.parse(savedData)
        setInitialData(parsedData)
        
        // 清除保存的数据
        sessionStorage.removeItem('memorialFormData')
        sessionStorage.removeItem('memorialFormStep')
        sessionStorage.removeItem('memorialFormType')
      } catch (error) {
        console.error('恢复表单数据失败:', error)
      }
    }
  }, [])

  return <ImmersiveForm initialData={initialData} />
}
