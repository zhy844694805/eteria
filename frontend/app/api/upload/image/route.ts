import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import crypto from 'crypto'
import { optimizeImage, validateImage, generatePlaceholder } from '@/lib/image-optimizer'

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

    // 生成唯一文件名和临时路径
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const timestamp = Date.now()
    const randomString = crypto.randomBytes(8).toString('hex')
    const extension = file.name.split('.').pop() || 'jpg'
    const tempFilename = `temp_${timestamp}-${randomString}.${extension}`
    const baseFilename = `${timestamp}-${randomString}`
    
    // 创建上传目录
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'images')
    await mkdir(uploadDir, { recursive: true })
    
    // 先保存临时文件
    const tempFilePath = join(uploadDir, tempFilename)
    await writeFile(tempFilePath, buffer)
    
    // 验证图片
    const isValidImage = await validateImage(tempFilePath)
    if (!isValidImage) {
      // 删除临时文件
      try {
        await import('fs/promises').then(fs => fs.unlink(tempFilePath))
      } catch {}
      
      return NextResponse.json(
        { error: '图片格式不支持或尺寸过大' },
        { status: 400 }
      )
    }
    
    // 优化图片，生成多个尺寸版本
    const optimizedImages = await optimizeImage(tempFilePath, uploadDir, baseFilename, {
      generateThumbnail: true,
      generatePreview: true
    })
    
    // 生成占位符
    const placeholder = await generatePlaceholder(tempFilePath)
    
    // 删除临时文件
    try {
      await import('fs/promises').then(fs => fs.unlink(tempFilePath))
    } catch {}
    
    // 返回优化后的文件信息
    const fileInfo = {
      filename: baseFilename,
      originalName: file.name,
      url: optimizedImages.main.url,
      thumbnailUrl: optimizedImages.thumbnail?.url,
      previewUrl: optimizedImages.preview?.url,
      placeholder: placeholder,
      size: file.size,
      optimizedSize: optimizedImages.main.size,
      mimeType: file.type,
      width: optimizedImages.main.width,
      height: optimizedImages.main.height,
      compressionRatio: Math.round((1 - optimizedImages.main.size / file.size) * 100)
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