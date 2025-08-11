"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ResponsiveNavigation } from '@/components/responsive-navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Volume2, MessageSquare, Upload, Trash2, Play, Pause, Save, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface DigitalLife {
  id: string
  name: string
  description?: string
  status: 'CREATING' | 'READY' | 'FAILED' | 'INACTIVE'
  allowPublicUse: boolean
  audioCount: number
  chatCount: number
  conversationCount: number
  createdAt: string
  memorial: {
    id: string
    subjectName: string
    title: string
  }
  uploadedAudios: string[]
  chatRecords: string[]
}

interface EditDigitalLifePageProps {
  params: Promise<{ id: string }>
}

export default function EditDigitalLifePage({ params }: EditDigitalLifePageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [digitalLife, setDigitalLife] = useState<DigitalLife | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadedAudios, setUploadedAudios] = useState<File[]>([])
  const [newChatRecords, setNewChatRecords] = useState<string[]>([''])
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [chatRecordsExpanded, setChatRecordsExpanded] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    const loadDigitalLife = async () => {
      const resolvedParams = await params
      fetchDigitalLife(resolvedParams.id)
    }
    
    loadDigitalLife()
  }, [user, router, params])

  const fetchDigitalLife = async (id: string) => {
    try {
      const response = await fetch(`/api/digital-lives/${id}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('获取数字生命失败')
      }
      
      const data = await response.json()
      
      // 检查用户是否有权限编辑
      if (data.digitalLife.userId !== user?.id) {
        toast.error('您没有权限编辑此数字生命')
        router.push('/digital-life-home')
        return
      }

      setDigitalLife(data.digitalLife)
      // 初始化聊天记录编辑
      const chatRecords = data.digitalLife.chatRecords || []
      if (chatRecords.length > 0) {
        setNewChatRecords([...chatRecords, ''])
      } else {
        setNewChatRecords([''])
      }
    } catch (error) {
      console.error('获取数字生命失败:', error)
      toast.error('获取数字生命失败')
      router.push('/digital-life-home')
    } finally {
      setLoading(false)
    }
  }

  // 处理音频文件上传
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('audio/')) {
        toast.error(`${file.name} 不是有效的音频文件`)
        return false
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} 文件过大，请选择小于50MB的文件`)
        return false
      }
      return true
    })

    setUploadedAudios(prev => [...prev, ...validFiles])
    event.target.value = '' // 清空input
  }

  // 移除音频文件
  const removeAudio = (index: number) => {
    setUploadedAudios(prev => prev.filter((_, i) => i !== index))
  }

  // 删除现有音频
  const deleteExistingAudio = async (audioPath: string, index: number) => {
    if (!digitalLife) return
    
    if (!confirm('确定要删除这个音频样本吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/digital-lives/${digitalLife.id}/audio`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ audioPath })
      })

      if (!response.ok) {
        throw new Error('删除音频失败')
      }

      toast.success('音频已删除')
      // 更新本地状态
      setDigitalLife(prev => prev ? {
        ...prev,
        uploadedAudios: (prev.uploadedAudios || []).filter((_, i) => i !== index),
        audioCount: (prev.audioCount || 1) - 1
      } : null)
    } catch (error) {
      console.error('删除音频失败:', error)
      toast.error('删除音频失败')
    }
  }

  // 添加聊天记录输入框
  const addChatRecordInput = () => {
    setNewChatRecords(prev => {
      const newRecords = [...prev, '']
      // 如果添加后记录数超过3条且当前是收起状态，自动展开以显示新添加的记录
      if (newRecords.length > 3 && !chatRecordsExpanded) {
        setChatRecordsExpanded(true)
      }
      return newRecords
    })
  }

  // 更新聊天记录
  const updateChatRecord = (index: number, value: string) => {
    setNewChatRecords(prev => prev.map((record, i) => i === index ? value : record))
  }

  // 移除聊天记录
  const removeChatRecord = (index: number) => {
    setNewChatRecords(prev => {
      const newRecords = prev.filter((_, i) => i !== index)
      // 如果删除后记录数不超过3条，自动收起展开状态
      if (newRecords.length <= 3) {
        setChatRecordsExpanded(false)
      }
      return newRecords
    })
  }

  // 播放音频
  const playAudio = (audioPath: string) => {
    if (playingAudio === audioPath) {
      setPlayingAudio(null)
      // 停止播放逻辑
    } else {
      setPlayingAudio(audioPath)
      // 播放音频逻辑
    }
  }

  // 保存更改
  const handleSave = async () => {
    if (!digitalLife) return

    setSaving(true)
    try {
      // 处理音频上传
      let newAudioPaths: string[] = []
      if (uploadedAudios.length > 0) {
        const audioDataList = await Promise.all(
          uploadedAudios.map(async (audio) => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1]
                resolve(base64)
              }
              reader.onerror = reject
              reader.readAsDataURL(audio)
            })
          })
        )

        const audioResponse = await fetch(`/api/digital-lives/${digitalLife.id}/audio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            audioDataList,
            audioFileNames: uploadedAudios.map(audio => audio.name)
          })
        })

        if (audioResponse.ok) {
          const audioData = await audioResponse.json()
          newAudioPaths = audioData.audioPaths || []
        }
      }

      // 更新基本信息和聊天记录
      const updateResponse = await fetch(`/api/digital-lives/${digitalLife.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: digitalLife.name,
          description: digitalLife.description,
          allowPublicUse: digitalLife.allowPublicUse,
          chatRecords: (newChatRecords || []).filter(record => record.trim() !== '')
        })
      })

      if (!updateResponse.ok) {
        throw new Error('更新失败')
      }

      toast.success('数字生命已更新')
      setUploadedAudios([])
      
      // 重新获取数据
      const resolvedParams = await params
      await fetchDigitalLife(resolvedParams.id)
      
    } catch (error: any) {
      console.error('保存失败:', error)
      toast.error(error.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!digitalLife) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">数字生命不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-stone-50">
      <ResponsiveNavigation currentPage="digital-life" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <Link href="/digital-life-home">
              <Button variant="ghost" className="mb-6 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回数字生命
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-4xl font-light text-gray-900 mb-4">编辑数字生命</h1>
              <p className="text-gray-600">编辑 {digitalLife.name} 的音频样本和聊天记录</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  基本信息
                </CardTitle>
                <CardDescription>
                  编辑数字生命的基本设置
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">名称</Label>
                    <Input
                      id="name"
                      value={digitalLife.name}
                      onChange={(e) => setDigitalLife(prev => prev ? {...prev, name: e.target.value} : null)}
                      maxLength={50}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>状态</Label>
                    <div className="mt-1">
                      <Badge variant={digitalLife.status === 'READY' ? 'default' : 'secondary'}>
                        {digitalLife.status === 'READY' ? '可用' : digitalLife.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={digitalLife.description || ''}
                    onChange={(e) => setDigitalLife(prev => prev ? {...prev, description: e.target.value} : null)}
                    maxLength={200}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={digitalLife.allowPublicUse}
                    onCheckedChange={(checked) => setDigitalLife(prev => prev ? {...prev, allowPublicUse: checked} : null)}
                  />
                  <Label>允许其他用户使用</Label>
                </div>
              </CardContent>
            </Card>

            {/* 音频样本管理 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                  音频样本管理
                </CardTitle>
                <CardDescription>
                  管理用于训练语音模型的音频样本
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 现有音频列表 */}
                {digitalLife.uploadedAudios && digitalLife.uploadedAudios.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">现有音频样本 ({digitalLife.uploadedAudios.length})</h4>
                    <div className="space-y-2">
                      {digitalLife.uploadedAudios.map((audioPath, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => playAudio(audioPath)}
                            >
                              {playingAudio === audioPath ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <span className="text-sm text-gray-900 truncate">
                              {audioPath.split('/').pop()}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteExistingAudio(audioPath, index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 上传新音频 */}
                <div>
                  <Label>上传新音频样本</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={handleAudioUpload}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label
                      htmlFor="audio-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">点击上传音频样本</span>
                      <span className="text-xs text-gray-500 mt-1">支持 MP3、WAV、M4A 等格式，最大50MB</span>
                    </label>
                  </div>

                  {uploadedAudios.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">新上传的音频样本:</p>
                      <div className="space-y-2">
                        {uploadedAudios.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm text-gray-900 truncate">{file.name}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAudio(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 聊天记录管理 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  聊天记录管理
                </CardTitle>
                <CardDescription>
                  编辑用于训练对话模型的聊天记录
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700">
                      <p>每行输入一条聊天记录，可以是逝者常说的话、口头禅、或者典型的表达方式。这些内容将用于训练AI模型，让对话更贴近逝者的语言风格。</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {(chatRecordsExpanded ? newChatRecords : newChatRecords.slice(0, 3)).map((record, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Textarea
                        value={record}
                        onChange={(e) => updateChatRecord(index, e.target.value)}
                        placeholder={`聊天记录 ${index + 1} (例如: "今天天气真好啊，我们出去走走吧")`}
                        rows={2}
                        className="flex-1"
                        maxLength={500}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeChatRecord(index)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* 展开/收起按钮 */}
                  {newChatRecords.length > 3 && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setChatRecordsExpanded(!chatRecordsExpanded)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {chatRecordsExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            收起 ({newChatRecords.length - 3} 条)
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            展开查看全部 ({newChatRecords.length - 3} 条)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={addChatRecordInput}
                  className="w-full"
                >
                  + 添加更多聊天记录
                </Button>

                <div className="text-xs text-gray-500">
                  <p>当前聊天记录数: {(newChatRecords || []).filter(record => record.trim() !== '').length}</p>
                  <p>建议添加 10-50 条聊天记录以获得更好的对话效果</p>
                </div>
              </CardContent>
            </Card>

            {/* 保存按钮 */}
            <div className="flex justify-center gap-6 py-8">
              <Button
                variant="outline"
                onClick={() => router.push('/digital-life-home')}
                className="px-8 py-3 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存更改'}
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}