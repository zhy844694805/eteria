const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('正在创建管理员用户...')
    
    const email = 'admin@aimodel.it'
    const password = 'admin123456'
    const name = '超级管理员'
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('管理员用户已存在，正在更新角色...')
      await prisma.user.update({
        where: { email },
        data: {
          role: 'SUPER_ADMIN',
          isActive: true,
          isBanned: false,
          emailVerified: true
        }
      })
      console.log('✅ 管理员角色已更新')
    } else {
      // 创建新的管理员用户
      const passwordHash = await bcrypt.hash(password, 12)
      
      await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'SUPER_ADMIN',
          isActive: true,
          isBanned: false,
          emailVerified: true
        }
      })
      
      console.log('✅ 管理员用户创建成功')
    }
    
    console.log(`
📋 管理员登录信息:
邮箱: ${email}
密码: ${password}
角色: 超级管理员

警告  请登录后立即修改密码！
🔗 管理后台地址: http://localhost:3000/admin
    `)
    
  } catch (error) {
    console.error('❌ 创建管理员用户失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()