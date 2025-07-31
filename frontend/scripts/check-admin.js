const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    console.log('正在检查管理员账户...')
    
    const email = 'admin@aimodel.it'
    
    // 查找管理员用户
    const admin = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isBanned: true,
        emailVerified: true,
        passwordHash: true,
        createdAt: true
      }
    })
    
    if (!admin) {
      console.log('❌ 管理员账户不存在')
      console.log('请运行: npm run create-admin')
      return
    }
    
    console.log('✅ 找到管理员账户:')
    console.log(`ID: ${admin.id}`)
    console.log(`姓名: ${admin.name}`)
    console.log(`邮箱: ${admin.email}`)
    console.log(`角色: ${admin.role}`)
    console.log(`激活状态: ${admin.isActive}`)
    console.log(`被封禁: ${admin.isBanned}`)
    console.log(`邮箱验证: ${admin.emailVerified}`)
    console.log(`创建时间: ${admin.createdAt}`)
    console.log(`密码哈希存在: ${admin.passwordHash ? '是' : '否'}`)
    
    // 测试密码验证
    const testPassword = 'admin123456'
    const isPasswordValid = await bcrypt.compare(testPassword, admin.passwordHash)
    console.log(`测试密码验证: ${isPasswordValid ? '✅ 正确' : '❌ 错误'}`)
    
    // 检查所有用户数量
    const totalUsers = await prisma.user.count()
    console.log(`\n数据库总用户数: ${totalUsers}`)
    
  } catch (error) {
    console.error('❌ 检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()