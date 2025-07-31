import nodemailer from 'nodemailer'

// SMTP配置
const smtpConfig = {
  host: 'smtps.aruba.it',
  port: 465,
  secure: true, // SSL
  auth: {
    user: 'info@aimodel.it',
    pass: 'Zhyzlzxjzqg520.'
  }
}

// 创建传输器
const transporter = nodemailer.createTransport(smtpConfig)

// 验证SMTP连接
export const verifyConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify()
    console.log('SMTP server is ready to take our messages')
    return true
  } catch (error) {
    console.error('SMTP verification failed:', error)
    return false
  }
}

// 发送验证邮件
export const sendVerificationEmail = async (
  email: string, 
  verificationToken: string
): Promise<boolean> => {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/verify-email?token=${verificationToken}`
    
    const mailOptions = {
      from: {
        name: '永念 | EternalMemory',
        address: 'info@aimodel.it'
      },
      to: email,
      subject: '验证您的永念账户邮箱',
      html: `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>邮箱验证</title>
          <style>
            body { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🕊️ 永念 | EternalMemory</h1>
            </div>
            <div class="content">
              <h2>欢迎加入永念大家庭！</h2>
              <p>感谢您注册永念账户。为了确保您的账户安全，请点击下方按钮验证您的邮箱地址：</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">验证邮箱地址</a>
              </div>
              
              <p>如果按钮无法点击，请复制以下链接到浏览器中打开：</p>
              <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <p><strong>注意：</strong>此验证链接将在24小时后过期。</p>
              
              <p>如果您没有注册永念账户，请忽略此邮件。</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p>永念致力于为您和您的亲人提供温馨的纪念服务。如有任何问题，请联系我们的客服团队。</p>
            </div>
            <div class="footer">
              <p>此邮件由永念 | EternalMemory 自动发送，请勿回复。</p>
              <p>© 2024 永念 | EternalMemory. 保留所有权利。</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
欢迎加入永念大家庭！

感谢您注册永念账户。请点击以下链接验证您的邮箱地址：

${verificationUrl}

此验证链接将在24小时后过期。

如果您没有注册永念账户，请忽略此邮件。

永念 | EternalMemory
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Verification email sent successfully to:', email)
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}

// 发送密码重置邮件
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<boolean> => {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/reset-password?token=${resetToken}`
    
    const mailOptions = {
      from: {
        name: '永念 | EternalMemory',
        address: 'info@aimodel.it'
      },
      to: email,
      subject: '重置您的永念账户密码',
      html: `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>密码重置</title>
          <style>
            body { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🕊️ 永念 | EternalMemory</h1>
            </div>
            <div class="content">
              <h2>密码重置请求</h2>
              <p>我们收到了您的密码重置请求。请点击下方按钮设置新密码：</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">重置密码</a>
              </div>
              
              <p>如果按钮无法点击，请复制以下链接到浏览器中打开：</p>
              <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <p><strong>注意：</strong>此重置链接将在1小时后过期。</p>
              
              <p>如果您没有请求密码重置，请忽略此邮件，您的密码将保持不变。</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p>为了您的账户安全，请不要与他人分享此链接。</p>
            </div>
            <div class="footer">
              <p>此邮件由永念 | EternalMemory 自动发送，请勿回复。</p>
              <p>© 2024 永念 | EternalMemory. 保留所有权利。</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
密码重置请求

我们收到了您的密码重置请求。请点击以下链接设置新密码：

${resetUrl}

此重置链接将在1小时后过期。

如果您没有请求密码重置，请忽略此邮件。

永念 | EternalMemory
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Password reset email sent successfully to:', email)
    return true
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return false
  }
}

export default transporter