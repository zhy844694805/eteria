// 测试登录API的脚本
const fetch = require('node-fetch')

async function testLogin() {
  try {
    console.log('正在测试管理员登录API...')
    
    const loginData = {
      email: 'admin@aimodel.it',
      password: 'admin123456'
    }
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    })
    
    const responseText = await response.text()
    console.log('响应状态:', response.status)
    console.log('响应头:', response.headers.raw())
    
    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log('响应数据:', JSON.stringify(responseData, null, 2))
    } catch (e) {
      console.log('响应内容 (非JSON):', responseText)
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 检查开发服务器是否在运行
fetch('http://localhost:3000/api/auth/login')
  .then(() => {
    console.log('✅ 开发服务器正在运行')
    testLogin()
  })
  .catch(() => {
    console.log('❌ 开发服务器未运行，请先运行: npm run dev')
  })