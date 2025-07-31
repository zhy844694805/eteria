import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN'
  isActive: boolean
  isBanned: boolean
}

// 检查用户是否有管理员权限
export const checkAdminPermission = (userRole: string, requiredRole: string = 'MODERATOR'): boolean => {
  const roleHierarchy = {
    'USER': 0,
    'MODERATOR': 1, 
    'ADMIN': 2,
    'SUPER_ADMIN': 3
  }
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 1
  
  return userLevel >= requiredLevel
}

// 从请求中验证管理员用户
export const verifyAdminToken = async (request: NextRequest): Promise<AdminUser | null> => {
  try {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return null
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isBanned: true
      }
    })

    if (!user || !user.isActive || user.isBanned) {
      return null
    }

    // 检查是否有管理员权限
    if (!checkAdminPermission(user.role)) {
      return null
    }

    return user as AdminUser
  } catch (error) {
    console.error('Admin token verification failed:', error)
    return null
  }
}

// 记录管理员操作日志
export const logAdminAction = async (
  adminId: string,
  action: string,
  target?: string,
  details?: any,
  request?: NextRequest
) => {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        target,
        details: details ? JSON.stringify(details) : null,
        ipAddress: request?.ip || request?.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request?.headers.get('user-agent') || 'unknown'
      }
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}

// 管理员权限装饰器
export const withAdminAuth = (
  handler: (request: NextRequest, admin: AdminUser) => Promise<Response>,
  requiredRole: string = 'MODERATOR'
) => {
  return async (request: NextRequest) => {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return new Response(
        JSON.stringify({ error: '未授权的访问' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!checkAdminPermission(admin.role, requiredRole)) {
      return new Response(
        JSON.stringify({ error: '权限不足' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return handler(request, admin)
  }
}