import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  children: React.ReactNode
  error?: string
  success?: string
  loading?: boolean
  required?: boolean
  className?: string
}

export function FormField({ 
  children, 
  error, 
  success, 
  loading, 
  required, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
      {loading && (
        <div className="flex items-center text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span>验证中...</span>
        </div>
      )}
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && !error && (
        <div className="flex items-center text-green-600 text-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  )
}

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  error?: string
  className?: string
}

export function FormSection({ 
  title, 
  description, 
  children, 
  error, 
  className 
}: FormSectionProps) {
  return (
    <div className={cn("bg-white rounded-2xl p-8 shadow-sm", error && "border-l-4 border-red-500", className)}>
      <div className="mb-6">
        <h2 className="text-xl font-light text-slate-900 mb-2">{title}</h2>
        {description && (
          <p className="text-slate-600 text-sm">{description}</p>
        )}
        {error && (
          <div className="mt-3 flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
}

export function ProgressBar({ currentStep, totalSteps, stepLabels }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100

  return (
    <div className="mb-8">
      {/* 进度条 */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
          <div 
            style={{ width: `${percentage}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-slate-900 transition-all duration-500 ease-out"
          />
        </div>
        
        {/* 步骤指示器 */}
        <div className="flex justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            
            return (
              <div key={stepNumber} className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  isCompleted && "bg-slate-900 text-white",
                  isCurrent && "bg-slate-900 text-white ring-4 ring-slate-200",
                  !isCompleted && !isCurrent && "bg-slate-200 text-slate-500"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepLabels && stepLabels[index] && (
                  <span className={cn(
                    "mt-2 text-xs text-center max-w-20",
                    isCurrent ? "text-slate-900 font-medium" : "text-slate-500"
                  )}>
                    {stepLabels[index]}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved?: Date
}

export function SaveIndicator({ status, lastSaved }: SaveIndicatorProps) {
  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span>保存中...</span>
          </div>
        )
      case 'saved':
        return (
          <div className="flex items-center text-green-600 text-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            <span>
              已保存 {lastSaved && `• ${lastSaved.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>保存失败</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex justify-end mb-4">
      {getStatusContent()}
    </div>
  )
}

// 表单验证帮助函数
export const validators = {
  required: (value: any, fieldName: string) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName}不能为空`
    }
    return null
  },
  
  email: (value: string) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return '请输入有效的邮箱地址'
    }
    return null
  },
  
  minLength: (value: string, min: number, fieldName: string) => {
    if (!value) return null
    if (value.length < min) {
      return `${fieldName}至少需要${min}个字符`
    }
    return null
  },
  
  maxLength: (value: string, max: number, fieldName: string) => {
    if (!value) return null
    if (value.length > max) {
      return `${fieldName}不能超过${max}个字符`
    }
    return null
  },
  
  phone: (value: string) => {
    if (!value) return null
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      return '请输入有效的手机号码'  
    }
    return null
  },
  
  date: (value: string, fieldName: string) => {
    if (!value) return null
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return `请输入有效的${fieldName}`
    }
    return null
  },
  
  dateRange: (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return null
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start > end) {
      return '开始日期不能晚于结束日期'
    }
    return null
  }
}

// Hook for form validation
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: any, validationRules: ((value: any) => string | null)[]) => {
    for (const rule of validationRules) {
      const error = rule(value)
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }))
        return false
      }
    }
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    return true
  }

  const setFieldTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const clearErrors = () => {
    setErrors({})
    setTouched({})
  }

  const isFieldValid = (field: string) => {
    return !errors[field]
  }

  const hasErrors = () => {
    return Object.keys(errors).length > 0
  }

  return {
    errors,
    touched,
    validateField,
    setFieldTouched,
    clearErrors,
    isFieldValid,
    hasErrors
  }
}