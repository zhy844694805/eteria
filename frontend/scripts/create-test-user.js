require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('正在创建测试用户...')
    
    const email = 'test@example.com'
    const password = 'test123456'
    const name = '测试用户'
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('测试用户已存在')
      return
    }
    
    // 创建新的测试用户
    const passwordHash = await bcrypt.hash(password, 12)
    
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'USER',
        isActive: true,
        isBanned: false,
        preferredSystem: 'HUMAN'
      }
    })
    
    console.log('✅ 测试用户创建成功')
    console.log(`
📋 测试用户登录信息:
邮箱: ${email}
密码: ${password}
角色: 普通用户
    `)
    
  } catch (error) {
    console.error('❌ 创建测试用户失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()