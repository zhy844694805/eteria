import { NextResponse } from 'next/server'

// 预设场景模板数据
const SCENE_TEMPLATES = [
  {
    id: 'heaven_garden',
    name: '天堂花园',
    nameEn: 'Heaven Garden',
    description: '在繁花盛开的天堂花园中，逝者静享安宁与美好',
    category: 'SPIRITUAL',
    sceneType: 'HEAVEN',
    basePrompt: 'peaceful heaven garden with blooming flowers, soft golden light, serene atmosphere, beautiful landscape, {person} sitting peacefully among flowers, divine light, ethereal beauty, photorealistic',
    negativePrompt: 'dark, scary, evil, horror, sad, crying, pain, suffering, death',
    style: '写实风格',
    thumbnailUrl: '/images/scenes/heaven-garden.jpg',
    isActive: true,
    isRecommended: true,
    sortOrder: 1,
    usageCount: 0,
    rating: 4.8,
    ratingCount: 125,
    tags: ['天堂', '花园', '宁静', '美好']
  },
  {
    id: 'cloud_paradise',
    name: '云端仙境',
    nameEn: 'Cloud Paradise',
    description: '在洁白的云朵之上，逝者如天使般自由翱翔',
    category: 'SPIRITUAL',
    sceneType: 'CLOUD',
    basePrompt: 'heavenly clouds, paradise in the sky, {person} with angel wings, floating on white fluffy clouds, golden sunlight, peaceful expression, divine atmosphere, high quality, photorealistic',
    negativePrompt: 'dark clouds, storm, scary, evil, horror, sad, crying',
    style: '梦幻风格',
    thumbnailUrl: '/images/scenes/cloud-paradise.jpg',
    isActive: true,
    isRecommended: true,
    sortOrder: 2,
    usageCount: 0,
    rating: 4.9,
    ratingCount: 89,
    tags: ['云朵', '天使', '翱翔', '仙境']
  },
  {
    id: 'enchanted_forest',
    name: '童话森林',
    nameEn: 'Enchanted Forest',
    description: '在充满魔法的童话森林中，逝者与自然和谐共处',
    category: 'NATURAL',
    sceneType: 'FOREST',
    basePrompt: 'magical enchanted forest, fairy tale atmosphere, {person} walking peacefully among tall trees, soft filtered sunlight, butterflies and fireflies, mystical glow, beautiful nature, photorealistic',
    negativePrompt: 'dark forest, scary trees, monsters, evil, horror, dead trees',
    style: '童话风格',
    thumbnailUrl: '/images/scenes/enchanted-forest.jpg',
    isActive: true,
    isRecommended: true,
    sortOrder: 3,
    usageCount: 0,
    rating: 4.7,
    ratingCount: 156,
    tags: ['森林', '童话', '自然', '和谐']
  },
  {
    id: 'golden_beach',
    name: '黄金海滩',
    nameEn: 'Golden Beach',
    description: '在温暖的海滩上，逝者静看海浪轻拍，享受永恒的宁静',
    category: 'PEACEFUL',
    sceneType: 'BEACH',
    basePrompt: 'golden beach at sunset, gentle waves, {person} sitting peacefully on the sand, warm golden light, seagulls flying, peaceful ocean, beautiful horizon, photorealistic',
    negativePrompt: 'storm, dangerous waves, dark, scary, horror, sad, crying',
    style: '温暖风格',
    thumbnailUrl: '/images/scenes/golden-beach.jpg',
    isActive: true,
    isRecommended: false,
    sortOrder: 4,
    usageCount: 0,
    rating: 4.6,
    ratingCount: 78,
    tags: ['海滩', '夕阳', '宁静', '温暖']
  },
  {
    id: 'mountain_sanctuary',
    name: '山景圣地',
    nameEn: 'Mountain Sanctuary',
    description: '在庄严的山峦之间，逝者俯瞰美丽的世界',
    category: 'PEACEFUL',
    sceneType: 'MOUNTAIN',
    basePrompt: 'serene mountain sanctuary, {person} standing on a peaceful mountaintop, beautiful valley view, soft morning light, eagles soaring, majestic landscape, spiritual atmosphere, photorealistic',
    negativePrompt: 'dangerous cliffs, avalanche, storm, scary, dark, horror',
    style: '庄严风格',
    thumbnailUrl: '/images/scenes/mountain-sanctuary.jpg',
    isActive: true,
    isRecommended: false,
    sortOrder: 5,
    usageCount: 0,
    rating: 4.5,
    ratingCount: 42,
    tags: ['山景', '圣地', '庄严', '俯瞰']
  },
  {
    id: 'family_reunion',
    name: '家庭团聚',
    nameEn: 'Family Reunion',
    description: '在温馨的家庭场景中，逝者与家人永远在一起',
    category: 'FAMILY',
    sceneType: 'HOME',
    basePrompt: 'warm family home, {person} surrounded by loving family members, happy reunion scene, cozy living room, golden warm light, loving embrace, peaceful smiles, photorealistic',
    negativePrompt: 'sad, crying, funeral, dark, horror, empty home, loneliness',
    style: '温馨风格',
    thumbnailUrl: '/images/scenes/family-reunion.jpg',
    isActive: true,
    isRecommended: true,
    sortOrder: 6,
    usageCount: 0,
    rating: 4.9,
    ratingCount: 203,
    tags: ['家庭', '团聚', '温馨', '爱']
  }
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      scenes: SCENE_TEMPLATES,
      total: SCENE_TEMPLATES.length
    })
  } catch (error) {
    console.error('获取场景模板失败:', error)
    return NextResponse.json(
      { error: '获取场景模板失败' },
      { status: 500 }
    )
  }
}