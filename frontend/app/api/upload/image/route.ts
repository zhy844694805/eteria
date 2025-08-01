import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，请上传 JPG、PNG、GIF 或 WebP 格式的图片' },
        { status: 400 }
      )
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件太大，请上传小于5MB的图片' },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // 使用时间戳和随机字符串生成唯一文件名
    const timestamp = Date.now()
    const randomString = crypto.randomBytes(8).toString('hex')
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${timestamp}-${randomString}.${extension}`
    
    // 保存文件到 public/uploads/images 目录
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'images')
    const filePath = join(uploadDir, filename)
    
    await writeFile(filePath, buffer)
    
    // 返回文件信息
    const fileInfo = {
      filename,
      originalName: file.name,
      url: `/uploads/images/${filename}`,
      size: file.size,
      mimeType: file.type,
    }

    return NextResponse.json({
      success: true,
      file: fileInfo
    })

  } catch (error) {
    console.error('Upload image error:', error)
    return NextResponse.json(
      { error: '图片上传失败' },
      { status: 500 }
    )
  }
}