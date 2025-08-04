import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const exportSchema = z.object({
  format: z.enum(['json', 'pdf']),
  includeImages: z.boolean().optional().default(true),
  includeMessages: z.boolean().optional().default(true),
  includeCandles: z.boolean().optional().default(true)
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memorialId = params.id
    const body = await request.json()
    const { format, includeImages, includeMessages, includeCandles } = exportSchema.parse(body)

    // 获取纪念页信息
    const memorial = await prisma.memorial.findUnique({
      where: { id: memorialId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        images: includeImages,
        messages: includeMessages ? {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        } : false,
        candles: includeCandles ? {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        } : false
      }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 404 }
      )
    }

    if (!memorial.isPublic || memorial.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: '纪念页不可访问' },
        { status: 403 }
      )
    }

    // 构建导出数据
    const exportData = {
      memorial: {
        id: memorial.id,
        title: memorial.title,
        slug: memorial.slug,
        type: memorial.type,
        subjectName: memorial.subjectName,
        subjectType: memorial.subjectType,
        birthDate: memorial.birthDate,
        deathDate: memorial.deathDate,
        age: memorial.age,
        breed: memorial.breed,
        color: memorial.color,
        gender: memorial.gender,
        relationship: memorial.relationship,
        occupation: memorial.occupation,
        location: memorial.location,
        story: memorial.story,
        memories: memorial.memories,
        personalityTraits: memorial.personalityTraits,
        favoriteThings: memorial.favoriteThings,
        creatorName: memorial.creatorName,
        creatorEmail: memorial.creatorEmail,
        creatorPhone: memorial.creatorPhone,
        creatorRelation: memorial.creatorRelation,
        viewCount: memorial.viewCount,
        candleCount: memorial.candleCount,
        messageCount: memorial.messageCount,
        likeCount: memorial.likeCount,
        shareCount: memorial.shareCount,
        linkCopyCount: memorial.linkCopyCount,
        qrCodeViewCount: memorial.qrCodeViewCount,
        createdAt: memorial.createdAt,
        updatedAt: memorial.updatedAt,
        publishedAt: memorial.publishedAt,
        author: memorial.author
      },
      images: includeImages ? memorial.images : [],
      messages: includeMessages ? memorial.messages : [],
      candles: includeCandles ? memorial.candles : [],
      exportInfo: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'EternalMemory System',
        format: format,
        version: '1.0'
      }
    }

    if (format === 'json') {
      // JSON 导出
      const filename = `${memorial.subjectName}_纪念页_${new Date().toISOString().split('T')[0]}.json`
      
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Cache-Control': 'no-cache'
        }
      })
    } else if (format === 'pdf') {
      // PDF 导出 - 返回优化的HTML内容，可以直接打印为PDF
      const htmlContent = generateMemorialHTML(exportData)
      
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Export-Type': 'pdf',
          'X-Memorial-Name': encodeURIComponent(memorial.subjectName),
          'Cache-Control': 'no-cache'
        }
      })
    }

    return NextResponse.json(
      { error: '不支持的导出格式' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Export memorial error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || '参数错误' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '导出失败' },
      { status: 500 }
    )
  }
}

// 生成纪念页HTML内容
function generateMemorialHTML(data: any): string {
  const { memorial, images, messages, candles, exportInfo } = data
  
  // 翻译函数
  const translatePetType = (type?: string) => {
    const translations: { [key: string]: string } = {
      'dog': '狗', 'cat': '猫', 'bird': '鸟', 'rabbit': '兔子',
      'hamster': '仓鼠', 'guinea-pig': '豚鼠', 'other': '其他'
    }
    return translations[type || ''] || type || '宠物'
  }

  const translateBreed = (breed?: string) => {
    // 简化的品种翻译
    const translations: { [key: string]: string } = {
      'labrador': '拉布拉多', 'golden-retriever': '金毛',
      'persian': '波斯猫', 'british-shorthair': '英短'
    }
    return translations[breed || ''] || breed || '未知'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${memorial.subjectName} - 纪念页</title>
  <style>
    body {
      font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #eee;
      padding-bottom: 20px;
    }
    .title {
      font-size: 36px;
      font-weight: 300;
      margin-bottom: 10px;
      color: #2c3e50;
    }
    .subtitle {
      color: #7f8c8d;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 15px;
      color: #34495e;
      border-left: 4px solid #3498db;
      padding-left: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ecf0f1;
    }
    .info-label {
      font-weight: 500;
      color: #7f8c8d;
    }
    .info-value {
      color: #2c3e50;
    }
    .story {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      line-height: 1.8;
    }
    .message {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .message-author {
      font-weight: 500;
      color: #495057;
      margin-bottom: 5px;
    }
    .message-content {
      color: #6c757d;
      margin-bottom: 8px;
    }
    .message-date {
      font-size: 12px;
      color: #adb5bd;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .stat-item {
      text-align: center;
    }
    .stat-number {
      font-size: 24px;
      font-weight: 300;
      color: #2c3e50;
    }
    .stat-label {
      font-size: 12px;
      color: #7f8c8d;
      margin-top: 5px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #95a5a6;
      font-size: 12px;
    }
    @media print {
      body { 
        margin: 0; 
        padding: 15px;
        font-size: 12px;
        line-height: 1.4;
      }
      .header { 
        margin-bottom: 20px;
        page-break-after: avoid;
      }
      .section { 
        margin-bottom: 15px;
        page-break-inside: avoid;
      }
      .title {
        font-size: 28px;
      }
      .section-title {
        font-size: 16px;
      }
      .no-print {
        display: none !important;
      }
    }
    
    /* 优化PDF显示 */
    .print-friendly {
      max-width: 100%;
      margin: 0 auto;
      background: white;
      color: black;
    }
    
    /* 分页控制 */
    .page-break {
      page-break-before: always;
    }
    
    .avoid-break {
      page-break-inside: avoid;
    }
  </style>
</head>
<body class="print-friendly">
  <!-- 打印控制按钮 -->
  <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 1000; background: white; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <button onclick="window.print()" style="background: #007cba; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">打印/保存为PDF</button>
    <button onclick="window.close()" style="background: #666; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">关闭</button>
  </div>
  
  <div class="header avoid-break">
    <h1 class="title">${memorial.subjectName}</h1>
    <p class="subtitle">
      ${memorial.type === 'PET' ? translatePetType(memorial.subjectType) : '逝者'} · 
      ${formatDate(memorial.birthDate)} - ${formatDate(memorial.deathDate)}
    </p>
  </div>

  <div class="section">
    <h2 class="section-title">基本信息</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">姓名</span>
        <span class="info-value">${memorial.subjectName}</span>
      </div>
      ${memorial.type === 'PET' ? `
        <div class="info-item">
          <span class="info-label">类型</span>
          <span class="info-value">${translatePetType(memorial.subjectType)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">品种</span>
          <span class="info-value">${translateBreed(memorial.breed)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">性别</span>
          <span class="info-value">${memorial.gender === 'male' ? '男孩' : memorial.gender === 'female' ? '女孩' : '未知'}</span>
        </div>
        ${memorial.color ? `
        <div class="info-item">
          <span class="info-label">毛色</span>
          <span class="info-value">${memorial.color}</span>
        </div>
        ` : ''}
      ` : `
        ${memorial.relationship ? `
        <div class="info-item">
          <span class="info-label">关系</span>
          <span class="info-value">${memorial.relationship}</span>
        </div>
        ` : ''}
        ${memorial.occupation ? `
        <div class="info-item">
          <span class="info-label">职业</span>
          <span class="info-value">${memorial.occupation}</span>
        </div>
        ` : ''}
        ${memorial.location ? `
        <div class="info-item">
          <span class="info-label">地点</span>
          <span class="info-value">${memorial.location}</span>
        </div>
        ` : ''}
      `}
      <div class="info-item">
        <span class="info-label">年龄</span>
        <span class="info-value">${memorial.age || '未知'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">创建者</span>
        <span class="info-value">${memorial.creatorName}</span>
      </div>
    </div>
  </div>

  ${memorial.story ? `
  <div class="section">
    <h2 class="section-title">生平故事</h2>
    <div class="story">
      ${memorial.story.split('\n').map((p: string) => `<p>${p}</p>`).join('')}
    </div>
  </div>
  ` : ''}

  ${memorial.memories ? `
  <div class="section">
    <h2 class="section-title">美好回忆</h2>
    <div class="story">
      ${memorial.memories.split('\n').map((p: string) => `<p>${p}</p>`).join('')}
    </div>
  </div>
  ` : ''}

  ${memorial.personalityTraits ? `
  <div class="section">
    <h2 class="section-title">性格特点</h2>
    <div class="story">
      <p>${memorial.personalityTraits}</p>
    </div>
  </div>
  ` : ''}

  ${memorial.favoriteThings ? `
  <div class="section">
    <h2 class="section-title">喜好</h2>
    <div class="story">
      <p>${memorial.favoriteThings}</p>
    </div>
  </div>
  ` : ''}

  <div class="section">
    <h2 class="section-title">纪念统计</h2>
    <div class="stats">
      <div class="stat-item">
        <div class="stat-number">${memorial.candleCount}</div>
        <div class="stat-label">思念之火</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${memorial.messageCount}</div>
        <div class="stat-label">爱的寄语</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${memorial.viewCount}</div>
        <div class="stat-label">访问次数</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${memorial.shareCount + memorial.linkCopyCount}</div>
        <div class="stat-label">分享次数</div>
      </div>
    </div>
  </div>

  ${messages && messages.length > 0 ? `
  <div class="section">
    <h2 class="section-title">爱的寄语 (${messages.length}条)</h2>
    ${messages.slice(0, 20).map((msg: any) => `
      <div class="message">
        <div class="message-author">${msg.user?.name || msg.authorName}</div>
        <div class="message-content">${msg.content}</div>
        <div class="message-date">${formatDate(msg.createdAt)}</div>
      </div>
    `).join('')}
    ${messages.length > 20 ? `<p style="text-align: center; color: #7f8c8d; font-style: italic;">还有 ${messages.length - 20} 条寄语...</p>` : ''}
  </div>
  ` : ''}

  <div class="footer avoid-break">
    <div class="page-break"></div>
    <p>此纪念页由 永念 | EternalMemory 系统生成</p>
    <p>导出时间: ${new Date(exportInfo.exportedAt).toLocaleString('zh-CN')}</p>
    <p>纪念页创建时间: ${formatDate(memorial.createdAt)}</p>
    <p>原始链接: ${memorial.type === 'PET' ? 'community-pet-obituaries' : 'community-person-obituaries'}/${memorial.slug}</p>
  </div>
  
  <script>
    // 打印完成后关闭窗口
    window.addEventListener('afterprint', function() {
      if (confirm('打印/保存完成，是否关闭此页面？')) {
        window.close();
      }
    });
    
    // 为打印优化页面
    window.addEventListener('beforeprint', function() {
      document.body.style.fontSize = '12px';
      document.body.style.lineHeight = '1.4';
    });
    
    window.addEventListener('afterprint', function() {
      document.body.style.fontSize = '';
      document.body.style.lineHeight = '';
    });
  </script>
</body>
</html>
  `
}