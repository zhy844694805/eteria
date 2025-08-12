import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, cacheKeys, CACHE_CONFIG, createCacheHeaders } from '@/lib/cache'

// 通过slug获取纪念页详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params
    const slug = decodeURIComponent(rawSlug)

    // 增加浏览次数（先执行，不管是否有缓存）
    let memorialId: string | null = null
    
    // 检查缓存
    const cacheKey = cacheKeys.memorialBySlug(slug)
    const cached = cache.get(cacheKey)
    
    if (cached) {
      memorialId = cached.id
    } else {
      // 如果没有缓存，先查询获取ID
      const memorialBasic = await prisma.memorial.findUnique({
        where: { 
          slug: slug,
          status: 'PUBLISHED',
          isPublic: true
        },
        select: { id: true }
      })
      
      if (memorialBasic) {
        memorialId = memorialBasic.id
      }
    }
    
    // 增加访问量
    if (memorialId) {
      await prisma.memorial.update({
        where: { id: memorialId },
        data: {
          viewCount: {
            increment: 1
          }
        }
      }).catch(error => {
        console.error('Failed to update view count:', error)
      })
      
      // 清除缓存以确保下次获取最新数据
      cache.delete(cacheKey)
    }
    
    // 如果有缓存但访问量已更新，重新查询
    if (cached && memorialId) {
      // 缓存已失效，继续正常查询流程
    } else if (cached) {
      return NextResponse.json(
        { success: true, memorial: cached },
        { 
          status: 200,
          headers: createCacheHeaders(CACHE_CONFIG.MEMORIAL_DETAIL)
        }
      )
    }

    const memorial = await prisma.memorial.findUnique({
      where: { 
        slug: slug,
        status: 'PUBLISHED',
        isPublic: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        images: {
          orderBy: [
            { isMain: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        messages: {
          where: {
            isApproved: true
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        candles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            messages: true,
            candles: true,
            likes: true,
          }
        }
      }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 404 }
      )
    }

    // 增加浏览次数（异步进行，不阻塞响应）
    prisma.memorial.update({
      where: { id: memorial.id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    }).catch(error => {
      console.error('Failed to update view count:', error)
    })

    // 缓存结果（暂时减少缓存时间以便测试）
    cache.set(cacheKey, memorial, 60) // 1分钟缓存

    return NextResponse.json(
      { success: true, memorial },
      { 
        status: 200,
        headers: createCacheHeaders(CACHE_CONFIG.MEMORIAL_DETAIL)
      }
    )

  } catch (error) {
    console.error('Get memorial by slug error:', error)
    return NextResponse.json(
      { error: '获取纪念页失败' },
      { status: 500 }
    )
  }
}