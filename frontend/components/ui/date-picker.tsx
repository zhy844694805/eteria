"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  maxYear?: number
  minYear?: number
}

export function DatePicker({ value, onChange, placeholder, maxYear, minYear }: DatePickerProps) {
  const [year, setYear] = useState<string>("")
  const [month, setMonth] = useState<string>("")
  const [day, setDay] = useState<string>("")

  const currentYear = new Date().getFullYear()
  const max = maxYear || currentYear
  const min = minYear || 1900

  // 生成年份选项
  const years = Array.from({ length: max - min + 1 }, (_, i) => max - i)
  
  // 生成月份选项
  const months = [
    { value: "01", label: "1月" },
    { value: "02", label: "2月" },
    { value: "03", label: "3月" },
    { value: "04", label: "4月" },
    { value: "05", label: "5月" },
    { value: "06", label: "6月" },
    { value: "07", label: "7月" },
    { value: "08", label: "8月" },
    { value: "09", label: "9月" },
    { value: "10", label: "10月" },
    { value: "11", label: "11月" },
    { value: "12", label: "12月" },
  ]

  // 生成日期选项
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const days = year && month 
    ? Array.from({ length: getDaysInMonth(parseInt(year), parseInt(month)) }, (_, i) => i + 1)
    : Array.from({ length: 31 }, (_, i) => i + 1)

  // 解析现有值
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setYear(date.getFullYear().toString())
        setMonth(String(date.getMonth() + 1).padStart(2, '0'))
        setDay(String(date.getDate()).padStart(2, '0'))
      }
    }
  }, [value])

  // 处理年份改变
  const handleYearChange = (newYear: string) => {
    setYear(newYear)
    if (newYear && month && day) {
      const dateString = `${newYear}-${month}-${day}`
      onChange(dateString)
    }
  }

  // 处理月份改变
  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth)
    if (year && newMonth && day) {
      const dateString = `${year}-${newMonth}-${day}`
      onChange(dateString)
    }
  }

  // 处理日期改变
  const handleDayChange = (newDay: string) => {
    setDay(newDay)
    if (year && month && newDay) {
      const dateString = `${year}-${month}-${newDay}`
      onChange(dateString)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="block text-xs text-slate-600 mb-1">年份</label>
        <Select value={year} onValueChange={handleYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="年" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}年
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-xs text-slate-600 mb-1">月份</label>
        <Select value={month} onValueChange={handleMonthChange}>
          <SelectTrigger>
            <SelectValue placeholder="月" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-xs text-slate-600 mb-1">日期</label>
        <Select value={day} onValueChange={handleDayChange}>
          <SelectTrigger>
            <SelectValue placeholder="日" />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {days.map((d) => (
              <SelectItem key={d} value={String(d).padStart(2, '0')}>
                {d}日
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}