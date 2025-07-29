'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { migrationService } from '@/lib/migration-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Database, Users, Heart, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MigrationResult {
  localId: string
  memorialId?: string
  name: string
  status: 'success' | 'failed'
  error?: string
}

export default function MigrationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [hasDataToMigrate, setHasDataToMigrate] = useState(false)
  const [migrationStats, setMigrationStats] = useState({ petCount: 0, humanCount: 0, totalCount: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [migrationResults, setMigrationResults] = useState<MigrationResult[]>([])
  const [migrationComplete, setMigrationComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // 检查是否有数据需要迁移
    const hasData = migrationService.hasDataToMigrate()
    const stats = migrationService.getMigrationStats()
    
    setHasDataToMigrate(hasData)
    setMigrationStats(stats)
  }, [user, router])

  const handleMigration = async () => {
    if (!user) return

    setIsLoading(true)
    setProgress(10)
    setCurrentStep('准备迁移...')

    try {
      // 步骤1：迁移用户数据
      setCurrentStep('迁移用户数据...')
      setProgress(30)
      
      const userResult = await migrationService.migrateUserData(user.id)
      console.log('User migration result:', userResult)

      // 步骤2：迁移纪念页数据
      setCurrentStep('迁移纪念页数据...')
      setProgress(50)
      
      const obituaryResult = await migrationService.migrateObituaryData(user.id)
      console.log('Obituary migration result:', obituaryResult)

      setMigrationResults(obituaryResult.results)
      setProgress(90)

      // 步骤3：完成迁移
      setCurrentStep('清理本地数据...')
      if (obituaryResult.success) {
        migrationService.clearLocalStorageData()
      }

      setProgress(100)
      setCurrentStep('迁移完成！')
      setMigrationComplete(true)

    } catch (error) {
      console.error('Migration error:', error)
      setCurrentStep('迁移失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToApp = () => {
    const redirectPath = user?.preferredSystem 
      ? (user.preferredSystem === 'pet' ? '/pet-memorial' : '/human-memorial')
      : '/'
    router.push(redirectPath)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据迁移</h1>
          <p className="text-gray-600">将您的本地数据迁移到云端数据库</p>
        </div>

        {!hasDataToMigrate && !migrationComplete ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">没有需要迁移的数据</h2>
              <p className="text-gray-600 text-center mb-6">
                您的浏览器中没有找到需要迁移的本地数据，或者数据已经迁移完成。
              </p>
              <Button onClick={handleBackToApp}>
                返回应用
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 迁移状态卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  迁移状态
                </CardTitle>
                <CardDescription>
                  将本地浏览器存储的数据迁移到云端数据库
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {currentStep}
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                ) : migrationComplete ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      数据迁移已完成！您现在可以在任何设备上访问您的纪念页数据。
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      发现本地数据，建议迁移到云端以便在多设备间同步。
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 数据统计卡片 */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">宠物纪念页</p>
                    <p className="text-2xl font-bold">{migrationStats.petCount}</p>
                  </div>
                  <Heart className="w-8 h-8 text-teal-500" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">人物纪念页</p>
                    <p className="text-2xl font-bold">{migrationStats.humanCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总计</p>
                    <p className="text-2xl font-bold">{migrationStats.totalCount}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </CardContent>
              </Card>
            </div>

            {/* 迁移结果 */}
            {migrationResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>迁移结果</CardTitle>
                  <CardDescription>
                    每个纪念页的迁移状态详情
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {migrationResults.map((result, index) => (
                      <div key={result.localId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {result.status === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-medium">{result.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                            {result.status === 'success' ? '成功' : '失败'}
                          </Badge>
                          {result.error && (
                            <span className="text-sm text-red-600">{result.error}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4 justify-center">
              {migrationComplete ? (
                <Button onClick={handleBackToApp} size="lg">
                  返回应用
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleBackToApp}>
                    稍后迁移
                  </Button>
                  <Button 
                    onClick={handleMigration} 
                    disabled={isLoading || !hasDataToMigrate}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        迁移中...
                      </>
                    ) : (
                      '开始迁移'
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}