import sharp from 'sharp'
import path from 'path'
import { promises as fs } from 'fs'
import { cache, CACHE_CONFIG, cacheKeys } from './cache'

// 图片优化配置
const OPTIMIZATION_CONFIG = {
  // 主图片配置
  main: {
    width: 1200,
    height: 900,
    quality: 85,
    format: 'webp' as const
  },
  // 中等尺寸配置（用于列表展示）
  medium: {
    width: 600,
    height: 450,
    quality: 80,
    format: 'webp' as const
  },
  // 缩略图配置
  thumbnail: {
    width: 300,
    height: 300,
    quality: 75,
    format: 'webp' as const
  },
  // 预览图配置
  preview: {
    width: 150,
    height: 150,
    quality: 70,
    format: 'webp' as const
  },
  // 占位符配置
  placeholder: {
    width: 20,
    height: 20,
    quality: 30,
    blur: 1
  }
}

export interface OptimizedImageVariant {
  path: string
  url: string
  width: number
  height: number
  size: number
}

export interface OptimizedImage {
  main: OptimizedImageVariant
  medium?: OptimizedImageVariant
  thumbnail?: OptimizedImageVariant
  preview?: OptimizedImageVariant
  placeholder?: string // Base64 data URL
  original: {
    filename: string
    size: number
    mimeType: string
    width: number
    height: number
  }
  compressionRatio: number // 压缩比率
  variants: string[] // 可用变体列表
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
      mimeType: `image/${metadata.format || 'jpeg'}`,
      width: metadata.width || 0,
      height: metadata.height || 0
    },
    compressionRatio: 0,
    variants: []
  }

  const variants: string[] = []

  // 生成主图片（优化版本）
  const mainFilename = `${baseFilename}_main.${OPTIMIZATION_CONFIG.main.format}`
  const mainPath = path.join(outputDir, mainFilename)
  
  const mainBuffer = await image
    .clone()
    .resize(OPTIMIZATION_CONFIG.main.width, OPTIMIZATION_CONFIG.main.height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ 
      quality: OPTIMIZATION_CONFIG.main.quality,
      progressive: true,
      effort: 6 // 更高的压缩努力度
    })
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
  variants.push('main')
  
  // 生成中等尺寸图片
  const mediumFilename = `${baseFilename}_medium.${OPTIMIZATION_CONFIG.medium.format}`
  const mediumPath = path.join(outputDir, mediumFilename)
  
  const mediumBuffer = await image
    .clone()
    .resize(OPTIMIZATION_CONFIG.medium.width, OPTIMIZATION_CONFIG.medium.height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ 
      quality: OPTIMIZATION_CONFIG.medium.quality,
      progressive: true,
      effort: 6
    })
    .toBuffer()

  await fs.writeFile(mediumPath, mediumBuffer)
  
  const mediumMetadata = await sharp(mediumBuffer).metadata()
  result.medium = {
    path: mediumPath,
    url: `/uploads/images/${mediumFilename}`,
    width: mediumMetadata.width || 0,
    height: mediumMetadata.height || 0,
    size: mediumBuffer.length
  }
  variants.push('medium')

  // 生成缩略图
  if (generateThumbnail) {
    const thumbnailFilename = `${baseFilename}_thumb.${OPTIMIZATION_CONFIG.thumbnail.format}`
    const thumbnailPath = path.join(outputDir, thumbnailFilename)
    
    const thumbnailBuffer = await image
      .clone()
      .resize(OPTIMIZATION_CONFIG.thumbnail.width, OPTIMIZATION_CONFIG.thumbnail.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: OPTIMIZATION_CONFIG.thumbnail.quality,
        progressive: true,
        effort: 6
      })
      .toBuffer()
      
    variants.push('thumbnail')

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
      .clone()
      .resize(OPTIMIZATION_CONFIG.preview.width, OPTIMIZATION_CONFIG.preview.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: OPTIMIZATION_CONFIG.preview.quality,
        progressive: true,
        effort: 6
      })
      .toBuffer()
      
    variants.push('preview')

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

  // 生成占位符
  try {
    const placeholderBuffer = await image
      .clone()
      .resize(OPTIMIZATION_CONFIG.placeholder.width, OPTIMIZATION_CONFIG.placeholder.height, { 
        fit: 'cover' 
      })
      .blur(OPTIMIZATION_CONFIG.placeholder.blur)
      .webp({ quality: OPTIMIZATION_CONFIG.placeholder.quality })
      .toBuffer()
    
    result.placeholder = `data:image/webp;base64,${placeholderBuffer.toString('base64')}`
  } catch (error) {
    console.warn('Failed to generate placeholder:', error)
  }

  // 计算压缩比率
  const totalOptimizedSize = result.main.size + 
    (result.medium?.size || 0) + 
    (result.thumbnail?.size || 0) + 
    (result.preview?.size || 0)
  result.compressionRatio = (1 - (totalOptimizedSize / result.original.size)) * 100
  result.variants = variants
  
  // 缓存图片信息
  cache.set(cacheKeys.imageInfo(`${baseFilename}_optimized`), result, CACHE_CONFIG.IMAGE_INFO)
  
  console.log(`[Image Optimizer] Processed ${baseFilename}: ${result.compressionRatio.toFixed(1)}% compression, ${variants.length} variants`)

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
 * 获取图片尺寸信息（带缓存）
 */
export async function getImageInfo(imagePath: string) {
  const cacheKey = cacheKeys.imageInfo(`info:${path.basename(imagePath)}`)
  const cached = cache.get<any>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const metadata = await sharp(imagePath).metadata()
    const info = {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format,
      size: metadata.size || 0,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation
    }
    
    cache.set(cacheKey, info, CACHE_CONFIG.IMAGE_INFO)
    return info
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
  const cacheKey = cacheKeys.imageInfo(`placeholder:${path.basename(imagePath)}`)
  const cached = cache.get<string>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const buffer = await sharp(imagePath)
      .resize(OPTIMIZATION_CONFIG.placeholder.width, OPTIMIZATION_CONFIG.placeholder.height, { 
        fit: 'cover' 
      })
      .blur(OPTIMIZATION_CONFIG.placeholder.blur)
      .webp({ quality: OPTIMIZATION_CONFIG.placeholder.quality })
      .toBuffer()
    
    const placeholder = `data:image/webp;base64,${buffer.toString('base64')}`
    cache.set(cacheKey, placeholder, CACHE_CONFIG.IMAGE_INFO)
    return placeholder
  } catch (error) {
    console.error('Failed to generate placeholder:', error)
    // 返回默认占位符
    const defaultPlaceholder = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
    cache.set(cacheKey, defaultPlaceholder, CACHE_CONFIG.IMAGE_INFO)
    return defaultPlaceholder
  }
}

/**
 * 获取响应式图片源集
 */
export function generateSrcSet(optimizedImage: OptimizedImage): string {
  const srcSet: string[] = []
  
  if (optimizedImage.preview) {
    srcSet.push(`${optimizedImage.preview.url} ${optimizedImage.preview.width}w`)
  }
  
  if (optimizedImage.thumbnail) {
    srcSet.push(`${optimizedImage.thumbnail.url} ${optimizedImage.thumbnail.width}w`)
  }
  
  if (optimizedImage.medium) {
    srcSet.push(`${optimizedImage.medium.url} ${optimizedImage.medium.width}w`)
  }
  
  srcSet.push(`${optimizedImage.main.url} ${optimizedImage.main.width}w`)
  
  return srcSet.join(', ')
}

/**
 * 获取适合的图片变体
 */
export function getBestVariant(optimizedImage: OptimizedImage, maxWidth: number): OptimizedImageVariant {
  // 根据需要的宽度选择最合适的变体
  if (maxWidth <= 150 && optimizedImage.preview) {
    return optimizedImage.preview
  }
  
  if (maxWidth <= 300 && optimizedImage.thumbnail) {
    return optimizedImage.thumbnail
  }
  
  if (maxWidth <= 600 && optimizedImage.medium) {
    return optimizedImage.medium
  }
  
  return optimizedImage.main
}

/**
 * 批量删除图片文件
 */
export async function cleanupImageFiles(optimizedImage: OptimizedImage): Promise<void> {
  const filesToDelete = [
    optimizedImage.main.path,
    optimizedImage.medium?.path,
    optimizedImage.thumbnail?.path,
    optimizedImage.preview?.path
  ].filter(Boolean) as string[]
  
  await Promise.all(
    filesToDelete.map(async (filePath) => {
      try {
        await fs.unlink(filePath)
      } catch (error) {
        console.warn(`Failed to delete file ${filePath}:`, error)
      }
    })
  )
}