"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@aimodel.it')
  const [password, setPassword] = useState('admin123456')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/debug/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // 重要：包含cookies
      })
      
      const data = await response.json()
      
      setResult(`
状态: ${response.status}
响应: ${JSON.stringify(data, null, 2)}
      `)
      
      if (response.ok) {
        // 测试验证token
        setTimeout(async () => {
          try {
            const verifyResponse = await fetch('/api/auth/verify', {
              credentials: 'include'
            })
            const verifyData = await verifyResponse.json()
            
            setResult(prev => prev + `\n\n验证Token:
状态: ${verifyResponse.status}
响应: ${JSON.stringify(verifyData, null, 2)}`)
          } catch (error) {
            setResult(prev => prev + `\n\n验证Token失败: ${error}`)
          }
        }, 1000)
      }
      
    } catch (error) {
      setResult(`错误: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testVerify = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include'
      })
      const data = await response.json()
      
      setResult(`
验证Token:
状态: ${response.status}
响应: ${JSON.stringify(data, null, 2)}
      `)
    } catch (error) {
      setResult(`验证失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      
      setResult(`
登出:
状态: ${response.status}
响应: ${JSON.stringify(data, null, 2)}
      `)
    } catch (error) {
      setResult(`登出失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>管理员登录测试</CardTitle>
            <CardDescription>
              测试管理员认证系统是否正常工作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">邮箱</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <Button onClick={testLogin} disabled={loading}>
                测试登录
              </Button>
              <Button onClick={testVerify} disabled={loading} variant="outline">
                验证Token
              </Button>
              <Button onClick={testLogout} disabled={loading} variant="outline">
                测试登出
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
              {result || '等待测试结果...'}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速链接</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => window.location.href = '/admin'}>
              访问管理后台
            </Button>
            <Button onClick={() => window.location.href = '/login'} variant="outline">
              正常登录页面
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}