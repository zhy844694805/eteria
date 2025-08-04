"use client"

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Copy, 
  QrCode, 
  Check, 
  Download,
  MessageCircle,
  Share2,
  Users,
  Link2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  memorialId: string
  memorialName: string
  memorialType: 'PET' | 'HUMAN'
  memorialSlug: string
  onShare?: (action: 'share' | 'copyLink' | 'viewQR', platform?: string) => void
}

export function ShareModal({
  isOpen,
  onClose,
  memorialId,
  memorialName,
  memorialType,
  memorialSlug,
  onShare
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(false)

  // 构建纪念页URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'
  const memorialPath = memorialType === 'PET' ? 'community-pet-obituaries' : 'community-person-obituaries'
  const memorialUrl = `${baseUrl}/${memorialPath}/${memorialSlug}`

  // 复制链接
  const handleCopyLink = async () => {
    try {
      // 检查是否支持现代剪贴板API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(memorialUrl)
        setCopied(true)
        onShare?.('copyLink')
        setTimeout(() => setCopied(false), 2000)
        return
      }
      
      // 降级方案：使用传统方法
      fallbackCopyToClipboard()
    } catch (error) {
      console.error('Failed to copy link:', error)
      // 如果现代API失败，尝试降级方案
      fallbackCopyToClipboard()
    }
  }

  // 降级复制方案
  const fallbackCopyToClipboard = () => {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = memorialUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        setCopied(true)
        onShare?.('copyLink')
        setTimeout(() => setCopied(false), 2000)
      } else {
        // 如果复制失败，显示链接让用户手动复制
        prompt('请手动复制此链接:', memorialUrl)
      }
    } catch (error) {
      console.error('Fallback copy failed:', error)
      // 最后的降级方案：显示链接让用户手动复制
      prompt('请手动复制此链接:', memorialUrl)
    }
  }

  // 生成并显示二维码
  const handleShowQR = async () => {
    if (qrCode) {
      setShowQR(true)
      onShare?.('viewQR')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/memorial/${memorialId}/qrcode`)
      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qrCode)
        setShowQR(true)
        onShare?.('viewQR')
      } else {
        throw new Error('生成二维码失败')
      }
    } catch (error) {
      console.error('Generate QR code error:', error)
      alert('生成二维码失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 下载二维码
  const handleDownloadQR = () => {
    if (!qrCode) return

    const link = document.createElement('a')
    link.download = `${memorialName}-纪念页二维码.png`
    link.href = qrCode
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 分享到不同平台
  const handlePlatformShare = (platform: string) => {
    const subjectTypeName = memorialType === 'PET' ? '宠物' : '逝者'
    const shareText = `${memorialName}的${subjectTypeName}纪念页 - 永念 | EternalMemory`
    const encodedUrl = encodeURIComponent(memorialUrl)
    const encodedText = encodeURIComponent(shareText)

    let shareUrl = ''
    
    switch (platform) {
      case 'wechat':
        // 微信分享通常需要通过微信SDK，这里只是复制链接
        handleCopyLink()
        alert('链接已复制，请在微信中粘贴分享')
        onShare?.('share', platform)
        return
      
      case 'weibo':
        shareUrl = `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedText}`
        break
        
      case 'qq':
        shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedText}`
        break
        
      case 'qzone':
        shareUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodedUrl}&title=${encodedText}`
        break
        
      default:
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
      onShare?.('share', platform)
    }
  }

  // Web Share API (移动端原生分享)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${memorialName}的纪念页`,
          text: `${memorialName}的${memorialType === 'PET' ? '宠物' : '逝者'}纪念页`,
          url: memorialUrl
        })
        onShare?.('share', 'native')
      } catch (error) {
        console.error('Native share failed:', error)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">分享纪念页</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
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

          {!showQR ? (
            <>
              {/* 快速操作 */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="text-sm">
                    {copied ? '已复制' : '复制链接'}
                  </span>
                </Button>
                
                <Button
                  onClick={handleShowQR}
                  disabled={loading}
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                >
                  <QrCode className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">
                    {loading ? '生成中...' : '二维码'}
                  </span>
                </Button>
              </div>

              {/* 社交平台分享 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">分享到社交平台</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePlatformShare('wechat')}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">微信</span>
                  </button>
                  
                  <button
                    onClick={() => handlePlatformShare('weibo')}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">微博</span>
                  </button>
                  
                  <button
                    onClick={() => handlePlatformShare('qq')}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">QQ</span>
                  </button>
                  
                  <button
                    onClick={() => handlePlatformShare('qzone')}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">QQ空间</span>
                  </button>
                </div>
              </div>

              {/* 原生分享（移动端） */}
              {navigator.share && (
                <Button
                  onClick={handleNativeShare}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  更多分享选项
                </Button>
              )}

              {/* 链接预览 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">分享链接</span>
                </div>
                <p className="text-xs text-gray-500 break-all font-mono">
                  {memorialUrl}
                </p>
              </div>
            </>
          ) : (
            /* 二维码显示 */
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-white rounded-lg border border-gray-200">
                {qrCode && (
                  <img 
                    src={qrCode} 
                    alt="纪念页二维码" 
                    className="w-48 h-48 mx-auto"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  扫描二维码访问纪念页
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleDownloadQR}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    下载
                  </Button>
                  <Button
                    onClick={() => setShowQR(false)}
                    variant="outline"
                    size="sm"
                  >
                    返回
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}