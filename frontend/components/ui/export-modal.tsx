"use client"

import React, { useState } from 'react'
import { 
  X, 
  Download, 
  FileJson, 
  FileText, 
  Image as ImageIcon,
  MessageCircle,
  Flame,
  Check,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  memorialId: string
  memorialName: string
  memorialType: 'PET' | 'HUMAN'
}

export function ExportModal({
  isOpen,
  onClose,
  memorialId,
  memorialName,
  memorialType
}: ExportModalProps) {
  const [exportOptions, setExportOptions] = useState({
    includeImages: true,
    includeMessages: true,
    includeCandles: true
  })
  const [loading, setLoading] = useState(false)

  const handleExport = async (format: 'json' | 'pdf') => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/memorial/${memorialId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          ...exportOptions
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '导出失败')
      }

      if (format === 'json') {
        // JSON 文件下载
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${memorialName}_纪念页_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.success('JSON 数据已导出')
      } else if (format === 'pdf') {
        // HTML 内容在新窗口中打开，用户可以打印为PDF
        const htmlContent = await response.text()
        const memorialName = response.headers.get('X-Memorial-Name') 
        const decodedName = memorialName ? decodeURIComponent(memorialName) : memorialName
        
        const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
        if (newWindow) {
          newWindow.document.write(htmlContent)
          newWindow.document.close()
          
          // 设置文档标题
          newWindow.document.title = `${decodedName || memorialName}_纪念页`
          
          // 等待内容加载完成后自动打开打印对话框
          setTimeout(() => {
            try {
              newWindow.focus()
              // 检查用户是否希望自动打印
              if (confirm('是否立即打开打印对话框？')) {
                newWindow.print()
              }
            } catch (error) {
              console.error('Auto print failed:', error)
            }
          }, 1500)
        } else {
          // 如果弹窗被阻止，提供下载链接
          const blob = new Blob([htmlContent], { type: 'text/html' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${decodedName || memorialName}_纪念页.html`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          toast.success('PDF页面已下载，请在浏览器中打开并打印为PDF')
          return
        }
        
        toast.success('PDF页面已在新窗口中打开，点击"打印/保存为PDF"按钮即可保存')
      }

      onClose()
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.message || '导出失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const updateOption = (key: keyof typeof exportOptions, value: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">导出纪念页</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 纪念页信息 */}
          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-1">{memorialName}</h3>
            <p className="text-sm text-gray-500">
              {memorialType === 'PET' ? '宠物纪念页' : '逝者纪念页'}
            </p>
          </div>

          {/* 导出选项 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">包含内容</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includeImages"
                  checked={exportOptions.includeImages}
                  onCheckedChange={(checked) => updateOption('includeImages', !!checked)}
                />
                <label htmlFor="includeImages" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  图片信息
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includeMessages"
                  checked={exportOptions.includeMessages}
                  onCheckedChange={(checked) => updateOption('includeMessages', !!checked)}
                />
                <label htmlFor="includeMessages" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  爱的寄语
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includeCandles"
                  checked={exportOptions.includeCandles}
                  onCheckedChange={(checked) => updateOption('includeCandles', !!checked)}
                />
                <label htmlFor="includeCandles" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <Flame className="w-4 h-4 text-gray-500" />
                  思念之火
                </label>
              </div>
            </div>
          </div>

          {/* 导出格式 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">导出格式</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleExport('json')}
                disabled={loading}
                variant="outline"
                className="h-auto p-4 flex-col gap-2 hover:bg-gray-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                ) : (
                  <FileJson className="w-5 h-5 text-gray-600" />
                )}
                <span className="text-sm">JSON 数据</span>
                <span className="text-xs text-gray-500 text-center">
                  完整的结构化数据，适合备份和迁移
                </span>
              </Button>
              
              <Button
                onClick={() => handleExport('pdf')}
                disabled={loading}
                variant="outline"
                className="h-auto p-4 flex-col gap-2 hover:bg-gray-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 text-gray-600" />
                )}
                <span className="text-sm">PDF 文档</span>
                <span className="text-xs text-gray-500 text-center">
                  打开打印页面，使用浏览器"打印→保存为PDF"功能
                </span>
              </Button>
            </div>
          </div>

          {/* 说明 */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>导出说明：</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-1 ml-3 space-y-1">
              <li>• JSON：完整数据备份，可用于系统迁移</li>
              <li>• PDF：打开网页后，按 Ctrl+P (Win) 或 Cmd+P (Mac) 打印保存</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}