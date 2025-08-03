import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { nanoid } from 'nanoid'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const memorialId = formData.get('memorialId') as string
    const files = formData.getAll('images') as File[]

    if (!memorialId) {
      return NextResponse.json(
        { error: '缺少纪念页ID' },
        { status: 400 }
      )
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: '没有选择文件' },
        { status: 400 }
      )
    }

    // 验证纪念页存在
    const memorial = await prisma.memorial.findUnique({
      where: { id: memorialId },
      include: { images: true }
    })

    if (!memorial) {
      return NextResponse.json(
        { error: '纪念页不存在' },
        { status: 404 }
      )
    }

    // 检查图片数量限制
    if (memorial.images.length + files.length > 10) {
      return NextResponse.json(
        { error: '每个纪念页最多只能上传10张图片' },
        { status: 400 }
      )
    }

    const uploadedImages = []

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'images')
    await mkdir(uploadDir, { recursive: true })

    for (const file of files) {
      // 验证文件
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `不支持的文件格式: ${file.type}` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `文件大小超出限制: ${file.name}` },
          { status: 400 }
        )
      }

      // 生成唯一文件名
      const ext = file.name.split('.').pop()
      const filename = `${nanoid()}.${ext}`
      const filepath = join(uploadDir, filename)
      const url = `/uploads/images/${filename}`

      // 保存文件
      const bytes = await file.arrayBuffer()
      await writeFile(filepath, Buffer.from(bytes))

      // 保存到数据库
      const imageRecord = await prisma.memorialImage.create({
        data: {
          filename,
          originalName: file.name,
          url,
          size: file.size,
          mimeType: file.type,
          memorialId,
          order: memorial.images.length + uploadedImages.length,
          isMain: memorial.images.length === 0 && uploadedImages.length === 0 // 第一张图片设为主图
        }
      })

      uploadedImages.push(imageRecord)
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      message: `成功上传 ${uploadedImages.length} 张图片`
    })

  } catch (error) {
    console.error('Batch upload error:', error)
    return NextResponse.json(
      { error: '批量上传失败' },
      { status: 500 }
    )
  }
}