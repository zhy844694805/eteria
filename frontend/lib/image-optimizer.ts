import sharp from 'sharp'
import path from 'path'
import { promises as fs } from 'fs'

// 图片优化配置
const OPTIMIZATION_CONFIG = {
  // 主图片配置
  main: {
    width: 800,
    height: 600,
    quality: 85,
    format: 'webp' as const
  },
  // 缩略图配置
  thumbnail: {
    width: 300,
    height: 300,
    quality: 80,
    format: 'webp' as const
  },
  // 预览图配置
  preview: {
    width: 150,
    height: 150,
    quality: 75,
    format: 'webp' as const
  }
}

export interface OptimizedImage {
  main: {
    path: string
    url: string
    width: number
    height: number
    size: number
  }
  thumbnail?: {
    path: string
    url: string
    width: number
    height: number
    size: number
  }
  preview?: {
    path: string
    url: string
    width: number
    height: number
    size: number
  }
  original: {
    filename: string
    size: number
    mimeType: string
  }
}

/**
 * 优化单张图片，生成多个尺寸版本
 */
export async function optimizeImage(
  inputPath: string,
  outputDir: string,
  baseFilename: string,
  options: {
    generateThumbnail?: boolean
    generatePreview?: boolean
  } = {}
): Promise<OptimizedImage> {
  const { generateThumbnail = true, generatePreview = true } = options

  // 确保输出目录存在
  await fs.mkdir(outputDir, { recursive: true })

  // 获取原始图片信息
  const inputBuffer = await fs.readFile(inputPath)
  const image = sharp(inputBuffer)
  const metadata = await image.metadata()

  const result: OptimizedImage = {
    main: {
      path: '',
      url: '',
      width: 0,
      height: 0,
      size: 0
    },
    original: {
      filename: baseFilename,
      size: inputBuffer.length,
      mimeType: `image/${metadata.format || 'jpeg'}`
    }
  }

  // 生成主图片（优化版本）
  const mainFilename = `${baseFilename}_main.${OPTIMIZATION_CONFIG.main.format}`
  const mainPath = path.join(outputDir, mainFilename)
  
  const mainBuffer = await image
    .resize(OPTIMIZATION_CONFIG.main.width, OPTIMIZATION_CONFIG.main.height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: OPTIMIZATION_CONFIG.main.quality })
    .toBuffer()

  await fs.writeFile(mainPath, mainBuffer)
  
  const mainMetadata = await sharp(mainBuffer).metadata()
  result.main = {
    path: mainPath,
    url: `/uploads/images/${mainFilename}`,
    width: mainMetadata.width || 0,
    height: mainMetadata.height || 0,
    size: mainBuffer.length
  }

  // 生成缩略图
  if (generateThumbnail) {
    const thumbnailFilename = `${baseFilename}_thumb.${OPTIMIZATION_CONFIG.thumbnail.format}`
    const thumbnailPath = path.join(outputDir, thumbnailFilename)
    
    const thumbnailBuffer = await image
      .resize(OPTIMIZATION_CONFIG.thumbnail.width, OPTIMIZATION_CONFIG.thumbnail.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: OPTIMIZATION_CONFIG.thumbnail.quality })
      .toBuffer()

    await fs.writeFile(thumbnailPath, thumbnailBuffer)
    
    const thumbnailMetadata = await sharp(thumbnailBuffer).metadata()
    result.thumbnail = {
      path: thumbnailPath,
      url: `/uploads/images/${thumbnailFilename}`,
      width: thumbnailMetadata.width || 0,
      height: thumbnailMetadata.height || 0,
      size: thumbnailBuffer.length
    }
  }

  // 生成预览图
  if (generatePreview) {
    const previewFilename = `${baseFilename}_preview.${OPTIMIZATION_CONFIG.preview.format}`
    const previewPath = path.join(outputDir, previewFilename)
    
    const previewBuffer = await image
      .resize(OPTIMIZATION_CONFIG.preview.width, OPTIMIZATION_CONFIG.preview.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: OPTIMIZATION_CONFIG.preview.quality })
      .toBuffer()

    await fs.writeFile(previewPath, previewBuffer)
    
    const previewMetadata = await sharp(previewBuffer).metadata()
    result.preview = {
      path: previewPath,
      url: `/uploads/images/${previewFilename}`,
      width: previewMetadata.width || 0,
      height: previewMetadata.height || 0,
      size: previewBuffer.length
    }
  }

  return result
}

/**
 * 批量优化图片
 */
export async function optimizeImages(
  inputPaths: string[],
  outputDir: string,
  options: {
    generateThumbnail?: boolean
    generatePreview?: boolean
  } = {}
): Promise<OptimizedImage[]> {
  const results: OptimizedImage[] = []

  for (let i = 0; i < inputPaths.length; i++) {
    const inputPath = inputPaths[i]
    const baseFilename = `image_${Date.now()}_${i}`
    
    try {
      const optimized = await optimizeImage(inputPath, outputDir, baseFilename, options)
      results.push(optimized)
    } catch (error) {
      console.error(`Failed to optimize image ${inputPath}:`, error)
      // 继续处理其他图片
    }
  }

  return results
}

/**
 * 获取图片尺寸信息
 */
export async function getImageInfo(imagePath: string) {
  try {
    const metadata = await sharp(imagePath).metadata()
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format,
      size: metadata.size || 0
    }
  } catch (error) {
    console.error('Failed to get image info:', error)
    return null
  }
}

/**
 * 验证图片文件
 */
export async function validateImage(imagePath: string): Promise<boolean> {
  try {
    const metadata = await sharp(imagePath).metadata()
    
    // 检查是否为支持的格式
    const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif']
    if (!metadata.format || !supportedFormats.includes(metadata.format)) {
      return false
    }

    // 检查尺寸限制
    const maxWidth = 4000
    const maxHeight = 4000
    if ((metadata.width || 0) > maxWidth || (metadata.height || 0) > maxHeight) {
      return false
    }

    return true
  } catch (error) {
    console.error('Image validation failed:', error)
    return false
  }
}

/**
 * 生成 WebP 格式的 Base64 数据 URL（用于占位符）
 */
export async function generatePlaceholder(imagePath: string): Promise<string> {
  try {
    const buffer = await sharp(imagePath)
      .resize(20, 20, { fit: 'cover' })
      .blur(1)
      .webp({ quality: 20 })
      .toBuffer()
    
    return `data:image/webp;base64,${buffer.toString('base64')}`
  } catch (error) {
    console.error('Failed to generate placeholder:', error)
    // 返回默认占位符
    return 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
  }
}